# Data Model

## Firestore Collections

All collections use owner-based isolation: `uid` field matches the authenticated user's ID.

---

### `employees`

Employee records with performance and health metrics.

| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| `uid` | string | immutable, owner-only | User who owns this record |
| `name` | string | 1-99 chars | Employee name |
| `role` | string | enum: Gerente, Senior, Pleno, Junior, Estagiário | Seniority level |
| `position` | string | < 100 chars | Job title |
| `section` | string | < 100 chars | Team/section |
| `area` | string | < 100 chars | Department/area |
| `salary` | number | >= 0 | Monthly salary |
| `status` | string | enum (8 values) | Current availability status |
| `performance` | number | 1-10 | Performance rating |
| `complaints` | number | >= 0 | Number of complaints |
| `medicalCertificatesCount` | number | >= 0 | Medical certificates issued |

**Indexes:** `uid` (equality filter in security rules)

---

### `expenses`

Financial expense records.

| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| `uid` | string | immutable, owner-only | User who owns this record |
| `type` | string | enum (7 values) | Expense category |
| `amount` | number | >= 0 | Expense amount |
| `currency` | string | USD, EUR, BRL | Currency code |
| `date` | timestamp | required | Expense date |
| `description` | string | < 500 chars | Description |

**Indexes:** `uid` + `date` (ordered query in useFirestoreData)

---

### `inventory` (PRO)

Stock/inventory items.

| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| `uid` | string | immutable, owner-only | User who owns this record |
| `name` | string | 1-199 chars | Item name |
| `quantity` | number | >= 0 | Stock quantity |
| `category` | string | < 100 chars | Item category |
| `unitPrice` | number | >= 0 | Price per unit |

**Indexes:** `uid` (equality filter)

---

### `revenue` (PRO)

Revenue/financial flow records.

| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| `uid` | string | immutable, owner-only | User who owns this record |
| `type` | string | `in` or `out` | Revenue or expense |
| `amount` | number | >= 0 | Amount |
| `category` | string | 1-99 chars | Category |
| `date` | timestamp | required | Record date |
| `description` | string | < 500 chars | Description |

**Indexes:** `uid` + `date` (ordered query)

---

### `portfolios` (PRO)

Corporate portfolio / company profile. One per user.

| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| `uid` | string | immutable, owner-only | User who owns this record |
| `companyName` | string | 1-99 chars | Company name |
| `tagline` | string | < 200 chars, optional | Company tagline |
| `description` | string | < 2000 chars, optional | Company description |
| `logoUrl` | string | < 500 chars, optional | Logo URL |
| `mission` | string | < 1000 chars, optional | Company mission |
| `vision` | string | < 1000 chars, optional | Company vision |
| `values` | array | optional, list of strings | Company values |
| `milestones` | array | optional | Company milestones |

**Indexes:** `uid` (equality filter)

---

### `subscriptions`

User subscription state. Document ID = user `uid`.

| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| `uid` | string | immutable, owner-only | User ID |
| `plan` | string | `free` or `pro` | Subscription plan |
| `status` | string | `active` or `canceled` | Subscription status |
| `currentPeriodEnd` | timestamp | required | Period end date |
| `upgradedAt` | timestamp | optional | When upgraded to PRO |

**Special Rules:**
- `plan`, `status`, `currentPeriodEnd` cannot be modified by client
- `allow delete: if false` — subscriptions cannot be deleted
- Only Cloud Functions (Admin SDK) can modify plan fields

---

## Entity Relationship Diagram

```
User (Firebase Auth)
  ├── employees (0..N)
  ├── expenses (0..N)
  ├── inventory (0..N) [PRO]
  ├── revenue (0..N) [PRO]
  ├── portfolios (0..1) [PRO]
  └── subscriptions (1)
```

---

## Data Flow

### Create
```
User action → Form submit → useFirestoreMutations → addDoc() → Firestore
                                                    → onSnapshot triggers → UI update
```

### Read
```
useFirestoreData(user) → onSnapshot (6 listeners) → React state → Components
```

### Update
```
User action → Form submit → useFirestoreMutations → updateDoc() → Firestore
                                                    → onSnapshot triggers → UI update
```

### Delete
```
User confirms → deleteDoc() → Firestore → onSnapshot triggers → UI update
```

---

## Import/Export Format

```json
{
  "employees": [],
  "expenses": [],
  "inventory": [],
  "revenue": [],
  "portfolio": null,
  "exportDate": "2026-04-12T00:00:00.000Z",
  "version": "1.0.0"
}
```

- Import validates schema before writing
- Max 500 records per import
- `id` fields are stripped and regenerated (new Firestore document IDs)
- All records get the importing user's `uid`
