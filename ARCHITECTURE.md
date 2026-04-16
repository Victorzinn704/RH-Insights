# Architecture Decision Records

## ADR-001: Custom Hooks over State Management Library

**Date:** 2026-04-12
**Status:** Accepted

### Context
App.tsx grew to 1774 lines with scattered `useState` calls, inline handlers, and Firebase logic mixed with UI rendering.

### Decision
Extract all state and side effects into 8 custom hooks:
- `useTheme` — theme state
- `useAuthSession` — auth state
- `useAuthActions` — auth handlers
- `useExchangeRates` — currency rates
- `useFirestoreData` — real-time data listeners
- `useAiAnalysis` — AI state and handlers
- `useModalState` — modal state via useReducer
- `useFirestoreMutations` — CRUD handlers

App.tsx becomes a composition layer (~208 lines).

### Consequences
- **Positive:** No external dependencies, full type safety, easy to test individual hooks
- **Negative:** Prop drilling for shared state (isDarkMode, rates). Acceptable for 12 leaf components.
- **Future:** If prop drilling becomes unmanageable, introduce React Context for theme/rates.

---

## ADR-002: useReducer for Modal State

**Date:** 2026-04-12
**Status:** Accepted

### Context
10 separate `useState` calls for modal state in App.tsx. Impossible to prevent two modals being open simultaneously at the type level.

### Decision
Single `useReducer` with typed action union (`ModalAction`) and explicit state interface (`ModalState`). 13 action types, all wrapped in `useCallback`.

### Consequences
- **Positive:** Single source of truth, typed actions, impossible states are unrepresentable
- **Negative:** Slightly more boilerplate than individual useState calls
- **Future:** If modal count grows beyond 15, consider splitting into multiple reducers

---

## ADR-003: Cloud Functions for AI Proxy

**Date:** 2026-04-12
**Status:** Accepted

### Context
Gemini API key cannot be exposed in frontend bundle. Direct browser-to-Gemini calls would leak the key.

### Decision
Firebase Cloud Functions (Node 20) act as a proxy:
1. Verify Firebase ID token (automatic with `onCall`)
2. Rate limit (10 req/min per uid)
3. Sanitize input (remove prompt injection patterns)
4. Validate payload (type guards)
5. Call Gemini with server-side API key
6. Return result to client

### Consequences
- **Positive:** API key never leaves server, rate limiting prevents abuse, input sanitization prevents prompt injection
- **Negative:** Additional latency (~200ms for function cold start), Firebase Functions pricing
- **Future:** If latency becomes an issue, keep functions warm with periodic pings

---

## ADR-004: Firestore Security Rules for Multi-Tenancy

**Date:** 2026-04-12
**Status:** Accepted

### Context
Multiple users share the same Firestore database. Each user's data must be completely isolated.

### Decision
Every collection enforces `resource.data.uid == request.auth.uid` on read/write. Users can only access documents they own.

Subscription fields (`plan`, `status`, `currentPeriodEnd`) are immutable from the client — only Cloud Functions (Admin SDK) can modify them.

### Consequences
- **Positive:** Server-side enforcement, no client-side bypass possible, zero additional infrastructure
- **Negative:** All documents must carry `uid` field, rules must be maintained alongside code
- **Future:** If team-based access is needed, add a `teamId` field and update rules

---

## ADR-005: Code Splitting via React.lazy + manualChunks

**Date:** 2026-04-12
**Status:** Accepted

### Context
Initial bundle was 1.7MB — too large for acceptable load times.

### Decision
- `React.lazy` + `Suspense` for 5 tab components and 3 modals
- Vite `manualChunks` to split `firebase` and `recharts` into separate chunks

Result: ~580KB initial load, lazy chunks loaded on demand.

### Consequences
- **Positive:** 66% reduction in initial bundle, faster first paint
- **Negative:** Slight delay when switching to a tab for the first time (chunk download)
- **Mitigation:** Loading spinner shown during Suspense fallback

---

## ADR-006: Single Hook for All Firestore Listeners

**Date:** 2026-04-12
**Status:** Accepted

### Context
6 Firestore collections need real-time listeners. Could be 6 separate hooks or one consolidated hook.

### Decision
Single `useFirestoreData(user)` hook manages all 6 `onSnapshot` listeners. Loading state uses a resolved-count pattern (6 listeners must resolve before `isLoading` becomes false).

### Consequences
- **Positive:** Single subscription lifecycle, atomic loading state, fewer re-renders
- **Negative:** Hook is ~112 lines, harder to test individual listeners in isolation
- **Future:** If a specific listener needs independent control, extract it

---

## ADR-007: Vitest over Jest

**Date:** 2026-04-12
**Status:** Accepted

### Context
Testing infrastructure needed to be set up from zero.

### Decision
Vitest chosen over Jest because:
- Native ESM support (no transform needed)
- Faster startup and watch mode
- Compatible with Vite config
- Same API as Jest (easy migration)

### Consequences
- **Positive:** Zero config friction, fast tests, shares Vite plugins
- **Negative:** Smaller ecosystem than Jest (fewer third-party matchers)
