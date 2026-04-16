# Contributing Guide

## Getting Started

```bash
git clone https://github.com/Victorzinn704/New-Project.git
cd New-Project
npm install
cp .env.example .env  # configure Firebase credentials
npm run dev
```

## Development Workflow

1. Create a branch for your work: `git checkout -b feature/my-feature`
2. Make changes
3. Run quality checks: `npm run lint && npm test && npm run build`
4. Commit with a descriptive message
5. Open a PR

## Quality Gates

All PRs must pass the CI pipeline (`.github/workflows/ci.yml`):

| Check | Command | What it validates |
|-------|---------|-------------------|
| Lint | `npm run lint` | ESLint rules + TypeScript strict type check |
| Build | `npm run build` | Vite production build succeeds |
| Test | `npm test` | All 27 tests pass |

Run these locally before pushing to avoid CI failures.

## Code Style

### TypeScript
- `strict: true` and `noUncheckedIndexedAccess: true` are enforced
- No `any` — use proper types or `unknown` with narrowing
- Prefix unused variables with `_` (e.g., `_id`, `_unused`)

### React
- Functional components only
- Custom hooks for reusable logic (see `src/hooks/`)
- `useCallback` for handlers passed as props
- `React.lazy` + `Suspense` for code-splitting large components

### Naming
- Components: PascalCase (`EmployeeFormModal`)
- Hooks: camelCase with `use` prefix (`useFirestoreData`)
- Utils: camelCase (`convertAmount`, `formatCurrency`)
- Types/Interfaces: PascalCase (`Employee`, `Expense`)

### Imports
- Group: React → external libs → internal modules → types
- Use `@/` alias for absolute paths (e.g., `@/src/types`)

## Adding Tests

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Single file
npx vitest run src/utils/__tests__/currency.test.ts
```

Test files go in `__tests__/` directories next to the source file.

## Architecture Decisions

### Why no state management library?
The app uses 8 custom hooks that encapsulate all state. This is simpler and more type-safe than Redux/Zustand for this scale. If state complexity grows, reconsider.

### Why no React Router?
Navigation is tab-based via `useState`. Deep links and URL-based navigation are planned for Sprint 7.

### Why useReducer for modals?
`useModalState` consolidates 10 `useState` calls into a single `useReducer` with 13 typed actions. This prevents impossible states (e.g., two modals open simultaneously) and makes the state machine explicit.

### Why Cloud Functions for AI?
The Gemini API key must stay server-side. Cloud Functions provide auth verification, rate limiting, and input sanitization before calling Gemini.

## Project Structure

```
src/
  components/    # UI components, organized by feature
  hooks/         # Custom hooks (state + side effects)
  services/      # External service integrations (AI)
  utils/         # Pure utility functions
  test/          # Test setup and mocks
  types.ts       # Shared TypeScript types
  firebase.ts    # Firebase initialization
  App.tsx        # Root component (composition only)
  main.tsx       # Entry point
```

## Commit Messages

Use descriptive messages. Prefix with scope when helpful:

```
feat(pro): add revenue form modal
fix(ai): prevent infinite loading on API error
test(hooks): add useTheme unit tests
chore: remove unused @google/genai from frontend deps
```
