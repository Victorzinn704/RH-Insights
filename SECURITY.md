# Security Documentation

## Overview

HR Insight handles sensitive business data (employee salaries, financial records, corporate strategy). This document covers all security layers, from authentication to data validation, CSP headers, SRI hashes, and App Check.

---

## 1. Authentication

### Google SSO via Firebase Auth
- Users authenticate via Google OAuth 2.0 through Firebase Authentication
- No passwords stored — Firebase manages token lifecycle
- ID tokens auto-refresh every 55 minutes
- `onAuthStateChanged` listener keeps session state reactive

### Token Verification
- **Frontend:** Firebase SDK handles token refresh transparently
- **Cloud Functions:** `onCall` trigger auto-verifies Firebase ID token — no manual verification needed
- **Firestore:** Security rules check `request.auth != null` on every operation

### Firebase App Check (reCAPTCHA v3)
- `initializeAppCheck` with `ReCaptchaV3Provider` initialized in `src/firebase.ts`
- Every request to Firebase services includes an App Check token
- Protects against abuse from stolen Firebase config keys
- Requires `VITE_RECAPTCHA_SITE_KEY` env var (get from [reCAPTCHA Admin](https://www.google.com/recaptcha/admin/create))

---

## 2. Multi-Tenant Isolation

### Firestore Security Rules (`firestore.rules`)

Every collection enforces owner-based isolation:

```
allow read: if isAuthenticated() && resource.data.uid == request.auth.uid;
allow create: if isAuthenticated() && isOwner(request.resource.data.uid);
allow update: if isAuthenticated() && isOwner(resource.data.uid) && uidNotModified();
```

**Guarantees:**
- User A cannot read, write, or infer data from User B
- `uid` field cannot be changed by the client (`uidNotModified()`)
- Users can only create documents with their own `uid`

### Subscription Collection — Extra Protection

```
allow update: if isAuthenticated()
  && !('plan' in request.resource.data)
  && !('status' in request.resource.data)
  && !('currentPeriodEnd' in request.resource.data);
allow delete: if false;
```

Plan upgrades can ONLY happen through the `upgradeToPro` Cloud Function (Admin SDK, server-side trusted context).

---

## 3. Input Validation

### Frontend Sanitization (`src/utils/sanitize.ts`)

All user input is sanitized before being sent to Firestore:

**`sanitizeInput(input, maxLength)`** — removes XSS vectors from plain text:
- `<script>` tags and content
- `javascript:` URIs
- `vbscript:` URIs
- `data:text/html` URIs
- Event handlers: `onerror=`, `onclick=`, `onload=`, `onmouseover=`, etc.
- `expression()` (CSS IE hack)
- `<iframe>`, `<object>`, `<embed>`, `<form>` tags

Applied to ALL form fields in `useFirestoreMutations`:
- Employee: name, position, section, area
- Expense: description
- Inventory: name, category
- Revenue: category, description
- Portfolio: companyName, tagline, description, logoUrl, mission, vision, values

**`sanitizeMarkdown(html)`** — DOMPurify wrapper for AI output:
- Whitelist: `h1-h6`, `p`, `strong`, `em`, `b`, `i`, `ul`, `ol`, `li`, `code`, `pre`, `blockquote`, `a`, `br`, `hr`, `table`, `thead`, `tbody`, `tr`, `th`, `td`
- Allowed attrs: `href`, `title`, `class`, `target`, `rel`
- Forbidden: `onclick`, `onerror`, `onload`, `onmouseover`, `style`, `script`, `iframe`, `object`, `embed`, `form`, `img`
- Used in `AiAnalysisModal.tsx` and `AiTab.tsx`

**`isValidImageUrl(url)`** — validates image URLs:
- Must be `https://` from known safe domains (googleusercontent.com, firebaseapp.com, github.com, etc.)
- Used for `user.photoURL` in Sidebar

### Server-Side (Firestore Rules)

Each collection has a validation function that runs on every write:

| Collection | Validated Fields |
|------------|-----------------|
| `employees` | name (1-99 chars), role (enum), salary (>=0), performance (1-10), status (enum), etc. |
| `expenses` | type (enum), amount (>=0), currency (enum), description (<500 chars) |
| `inventory` | name (1-199 chars), quantity (>=0), unitPrice (>=0) |
| `revenue` | type (in/out), amount (>=0), category (1-99 chars), description (<500 chars) |
| `portfolios` | companyName (1-99 chars), optional fields with size limits |

### Client-Side (Import Validation)

`src/utils/importExport.ts` validates every record before writing to Firestore:
- Type checks for all fields
- String length limits
- Enum validation
- Numeric range validation
- Max 500 records per import (DoS prevention)

### Cloud Functions (AI Proxy)

`functions/src/index.ts` — three layers of validation:

1. **Rate Limiting:** 10 requests/minute per uid, in-memory Map with 5-min cleanup
2. **Input Sanitization:** Removes prompt injection patterns (`IGNORE`, `DISREGARD`, `SYSTEM PROMPT`, `OVERRIDE`, `PREVIOUS INSTRUCTION`)
3. **Payload Validation:** Type guards (`isValidAnalyzePayload`, `isValidStrategicPayload`) check every field type and range

---

## 4. XSS Prevention — Defense in Depth

| Layer | Mechanism | What it blocks |
|-------|-----------|----------------|
| 1 | React auto-escape | All JSX content is escaped by default |
| 2 | Frontend `sanitizeInput` | Script tags, event handlers, javascript: URIs in form inputs |
| 3 | DOMPurify on AI output | Strips dangerous tags/attrs from markdown rendering |
| 4 | Firestore rules validation | Rejects writes with invalid data types/sizes |
| 5 | CSP headers | Blocks inline scripts, unauthorized sources |
| 6 | SRI hashes | Ensures loaded scripts haven't been tampered with |
| 7 | Cloud Functions sanitization | Server-side input cleaning before AI processing |

**No `dangerouslySetInnerHTML` used anywhere in the codebase.**

---

## 5. Content Security Policy (CSP)

Configured in `firebase.json` hosting headers:

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.googleapis.com ...; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` | Blocks inline scripts, unauthorized sources, clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking via iframes |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer info |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disables browser APIs |

---

## 6. Subresource Integrity (SRI)

All `<script>` and `<link>` tags in the production `index.html` include `integrity="sha384-..."` and `crossorigin="anonymous"` attributes.

Generated by a custom Vite plugin (`sriHashPlugin` in `vite.config.ts`) that:
1. Hashes each JS/CSS chunk with SHA-384 during build
2. Injects integrity attributes into the HTML output
3. Ensures tampered scripts are rejected by the browser

---

## 7. CSRF Protection

CSRF is mitigated by the architecture:
- **Firebase Auth uses Bearer tokens**, not cookies — no CSRF token needed
- **Cloud Functions `onCall`** use Firebase ID tokens, not session cookies
- **Firestore SDK** uses tokens, not sessions
- **No server-side sessions** that could be exploited via CSRF

---

## 8. Prompt Injection Prevention

The AI proxy uses multiple defenses:

### System Instruction
```
"Você é um consultor de RH sênior. Analise o desempenho do funcionário...
Responda apenas com a análise profissional."
```
System instructions are set server-side and cannot be overridden by user input.

### Input Sanitization
```typescript
function sanitizeInput(value: string, maxLength: number): string {
  return value
    .slice(0, maxLength)
    .replace(/(?:IGNORE|DISREGARD|NEW\s*INSTRUCTION|SYSTEM\s*PROMPT|OVERRIDE|PREVIOUS\s*INSTRUCTION)/gi, "")
    .trim();
}
```

### Truncation
All string inputs are truncated to their maximum allowed length, preventing oversized payloads.

---

## 9. Error Handling & Logging

### Error Boundary
`src/components/ErrorBoundary.tsx` catches React render errors and displays a generic fallback ("Ops! Algo deu errado") — **no error details exposed to users**. Details logged to console only.

### Firestore Error Handler
`src/utils/currency.ts` — `handleFirestoreError()` logs operation type, collection path, and auth info (without PII) for debugging.

### Cloud Function Errors
- Auth failures → `unauthenticated`
- Rate limit → `resource-exhausted`
- Invalid input → `invalid-argument`
- All errors use Firebase's standard `HttpsError` types

---

## 10. Secrets Management

### What's in `.env` (frontend)
- Firebase config values (project ID, API key, app ID) — these are public by design
- `VITE_RECAPTCHA_SITE_KEY` — reCAPTCHA v3 site key for App Check
- `VITE_GEMINI_API_KEY` — **DEPRECATED**, no longer used

### What's in Cloud Functions config
- `GEMINI_API_KEY` — set via `firebase functions:config:set gemini.api_key`, never committed to repo

### GEMINI_API_KEY removed from client bundle
The `vite.config.ts` no longer bakes `GEMINI_API_KEY` into the client bundle. All AI calls go through Cloud Functions with server-side key.

### ⚠️ Known Issue
The file `.env.local` contains real Firebase credentials and is committed to the repository. This should be:
1. Added to `.gitignore`
2. Credentials rotated
3. New credentials set via environment variables

---

## 11. Security Checklist

| Control | Status | Notes |
|---------|--------|-------|
| Authentication required for all operations | ✅ | Firebase Auth + Security Rules |
| Multi-tenant data isolation | ✅ | `uid` check on every collection |
| Firebase App Check | ✅ | reCAPTCHA v3 |
| Input sanitization (frontend) | ✅ | `sanitizeInput` removes XSS vectors |
| Input sanitization (server-side) | ✅ | Cloud Functions sanitize before AI |
| DOMPurify on AI output | ✅ | Whitelist-only, no scripts/iframes |
| Content Security Policy | ✅ | CSP + X-Frame-Options + nosniff |
| Subresource Integrity | ✅ | SHA-384 hashes on all scripts/styles |
| Rate limiting on AI endpoint | ✅ | 10 req/min per uid |
| Prompt injection prevention | ✅ | System instruction + sanitization |
| XSS prevention (7 layers) | ✅ | React escape → sanitize → DOMPurify → rules → CSP → SRI → CF |
| CSRF mitigation | ✅ | Token-based auth (no cookies) |
| Subscription field protection | ✅ | Client cannot modify plan/status |
| Error boundaries (no info leak) | ✅ | Generic message to users |
| Photo URL validation | ✅ | Only known safe domains |
| Secrets in env vars | ⚠️ | `.env.local` exposed — needs rotation |
| HTTPS only | ✅ | Firebase enforces HTTPS |
| CORS configured | ✅ | Cloud Functions handle CORS |

---

## 12. Incident Response

### If credentials are leaked
1. Rotate Firebase API key in Google Cloud Console
2. Rotate Gemini API key
3. Update `.env.local` and redeploy
4. Add `.env.local` to `.gitignore`

### If rate limit is triggered
- User sees: "Rate limit exceeded. Try again later."
- Cloud Function returns `resource-exhausted` error
- Frontend displays toast notification

### If Firestore rules block a legitimate operation
- Check browser console for `permission-denied` error
- Verify `uid` matches authenticated user
- Verify all required fields pass validation functions

### If XSS attempt detected
- Frontend `sanitizeInput` strips the payload silently
- CSP blocks inline script execution
- SRI prevents tampered script loading
- Log the attempt for investigation
