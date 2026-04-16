# Cloud Functions API

## Overview

Two callable Cloud Functions handle server-side operations that must not be exposed to the client: AI analysis and subscription management.

**Base:** Firebase Callable Functions (`https.onCall`)
**Auth:** Firebase ID token auto-verified by `onCall` trigger
**Runtime:** Node.js 20

---

## Endpoints

### `aiProxy`

Analyzes employee performance or generates strategic decisions using Google Gemini.

**Request:**
```typescript
{
  type: "analyze" | "strategic",
  payload: AnalyzePayload | StrategicPayload
}
```

**AnalyzePayload:**
```typescript
{
  name: string;           // max 100 chars
  role: string;           // max 50 chars
  position: string;       // max 100 chars
  area: string;           // max 100 chars
  performance: number;    // 1-10
  complaints: number;     // >= 0
  medicalCertificatesCount: number;  // >= 0
  status: string;         // max 50 chars
}
```

**StrategicPayload:**
```typescript
{
  employeeCount: number;
  expenseCount: number;
  employees: Array<{
    name: string;         // max 100 chars
    role: string;         // max 50 chars
    performance: number;  // 1-10
    medicalCertificatesCount: number;
  }>;
}
```

**Response:**
```typescript
{ result: string }  // Markdown-formatted analysis
```

**Errors:**
| Code | Message | Cause |
|------|---------|-------|
| `unauthenticated` | User must be authenticated | No valid Firebase ID token |
| `resource-exhausted` | Rate limit exceeded | >10 requests/minute |
| `invalid-argument` | Invalid payload / Unknown type | Malformed request |

**Security:**
- Rate limited: 10 requests/minute per uid
- Input sanitized: prompt injection patterns removed
- Payload validated: type guards on every field
- System instruction set server-side (cannot be overridden)

---

### `upgradeToPro`

Upgrades a user's subscription from free to PRO.

**Request:** `{}` (no payload needed)

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Errors:**
| Code | Message | Cause |
|------|---------|-------|
| `unauthenticated` | User must be authenticated | No valid Firebase ID token |

**Behavior:**
1. Checks if user already has active PRO subscription
2. If yes, returns early with success message
3. If no, sets `plan: "pro"`, `status: "active"`, `currentPeriodEnd: now + 30 days`
4. Uses Admin SDK (bypasses Firestore security rules)

**Why server-side?** Firestore rules block client-side writes to `plan`, `status`, and `currentPeriodEnd` fields. Only the Admin SDK can modify these fields.

---

## Deployment

```bash
# Set Gemini API key
firebase functions:config:set gemini.api_key="YOUR_KEY"

# Deploy all functions
firebase deploy --only functions

# Deploy single function
firebase deploy --only functions:aiProxy
```

## Monitoring

- **Logs:** Google Cloud Logging — `functions.log()` calls appear automatically
- **Metrics:** Cloud Functions dashboard shows invocations, latency, error rate
- **Alerts:** Configure in Google Cloud Console for error rate > 5% or latency > 5s
