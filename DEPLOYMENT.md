# Deployment Guide

## Prerequisites

- Firebase CLI: `npm install -g firebase-tools`
- Firebase project created at [console.firebase.google.com](https://console.firebase.google.com)
- Gemini API key from [Google AI Studio](https://aistudio.google.com)
- Node.js 20+

---

## Initial Setup

### 1. Authenticate with Firebase

```bash
firebase login
firebase use <project-id>
```

### 2. Configure Environment Variables

**Frontend (`.env`):**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_FIRESTORE_DATABASE_ID=(default)
```

**Cloud Functions:**
```bash
firebase functions:config:set gemini.api_key="your_gemini_api_key"
```

### 3. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 4. Deploy Cloud Functions

```bash
cd functions && npm install && cd ..
firebase deploy --only functions
```

### 5. Deploy Frontend (Hosting)

```bash
npm run build
firebase deploy --only hosting
```

### 6. Deploy Everything

```bash
firebase deploy
```

---

## CI/CD (GitHub Actions)

The pipeline at `.github/workflows/ci.yml` runs on every push/PR:

```yaml
checkout → node 20 → npm ci → lint → build → test
```

### Adding Deploy to CI

To add automatic deployment on merge to `master`:

```yaml
# Add to .github/workflows/ci.yml
deploy:
  needs: [lint, build, test]
  if: github.ref == 'refs/heads/master'
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: w9jds/setup-firebase@main
      with:
        firebase_token: ${{ secrets.FIREBASE_TOKEN }}
    - run: firebase deploy --only functions,firestore:rules,hosting
      env:
        FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

Set `FIREBASE_TOKEN` in GitHub Secrets:
```bash
firebase login:ci  # generates a token
```

---

## Environment Reference

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_FIREBASE_API_KEY` | Frontend `.env` | Firebase project API key |
| `VITE_FIREBASE_PROJECT_ID` | Frontend `.env` | Firebase project identifier |
| `VITE_FIREBASE_AUTH_DOMAIN` | Frontend `.env` | Auth redirect domain |
| `VITE_FIREBASE_STORAGE_BUCKET` | Frontend `.env` | Cloud Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Frontend `.env` | FCM sender ID |
| `VITE_FIREBASE_APP_ID` | Frontend `.env` | Firebase app identifier |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | Frontend `.env` | Firestore database ID |
| `gemini.api_key` | Functions config | Gemini AI API key (server-side only) |

---

## Rollback

### Frontend
```bash
firebase hosting:rollback
```

### Cloud Functions
```bash
# Redeploy previous version
firebase deploy --only functions
# Functions are versioned — each deploy creates a new version
```

### Firestore Rules
```bash
# Revert to previous rules file and redeploy
firebase deploy --only firestore:rules
```

---

## Monitoring

### Google Cloud Console
- **Functions:** [console.cloud.google.com/functions](https://console.cloud.google.com/functions) — invocations, errors, latency
- **Firestore:** [console.firebase.google.com](https://console.firebase.google.com) — reads/writes, storage, active listeners
- **Logging:** [console.cloud.google.com/logs](https://console.cloud.google.com/logs) — structured logs from all services

### Key Metrics to Watch
| Metric | Warning Threshold | Critical Threshold |
|--------|------------------|-------------------|
| Function error rate | > 5% | > 15% |
| Function latency (p95) | > 3s | > 10s |
| Firestore reads/day | > 50K | > 100K |
| Firestore writes/day | > 20K | > 50K |
| Function invocations/min | > 8 (rate limit is 10) | > 10 |

---

## Cost Estimation

### Firebase (Spark Plan → Free)
- Firestore: 1 GiB storage, 50K reads/day, 20K writes/day
- Hosting: 10 GB/month transfer
- Functions: 2M invocations/month, 400K GB-s compute

### Firebase (Blaze Plan → Pay as you go)
- Firestore: $0.06/100K reads, $0.18/100K writes, $0.18/GiB/month
- Functions: $0.40/1M invocations, $0.00001/100ms compute
- Hosting: $0.026/GB after 10GB free

### Gemini API
- Gemini 3 Flash Preview: pricing varies — check [AI Studio pricing](https://ai.google.dev/pricing)
- Estimated: ~$0.01 per analysis call

### Typical Monthly Cost (100 active users)
- Firestore: ~$2-5
- Functions: ~$1-3
- Hosting: ~$0-1
- Gemini: ~$5-15
- **Total: ~$8-24/month**
