# EyesTea Brewing Tool — Build Plan
## Document Reference: EYT-HACCP-001 | App version 1.0

> This file is the single source of truth for the build. Resume any session by reading it first.
> Update the **Status** column as work completes.

---

## 1. What we're building

A production-tracking web app for EyesTea Ltd (SC837543), a two-person microbrewery in Scotland
producing alcoholic iced tea in cans. The app replaces paper log sheets and enforces the HACCP
plan (EYT-HACCP-001 v1.1) digitally — every batch from raw material receipt through pasteurisation
and dispatch, with hard stops when a Critical Control Point is out of limit.

**Users:** Kevin Falencik (Director / Head Brewer) and Jennifer Wardrope (Director / Operations).
Both are named operators in the HACCP plan and have equal authority to log readings and take
corrective actions.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Nuxt 3** (Vue 3, Composition API) | SSR optional, great DX, file-based routing |
| State | **Pinia** | Native Nuxt 3 integration |
| Database | **Cloud Firestore** | Real-time, offline-capable, free tier covers small-batch ops |
| Auth | **Firebase Auth** (email/password) | Simple, two named users |
| Hosting | **Firebase Hosting** | Free, CDN, pairs with Firestore |
| Firebase SDK | **VueFire** (`vuefire` + `nuxt-vuefire`) | First-class Nuxt 3 composables |
| Styling | Vanilla CSS custom properties (no framework) | Design system is bespoke; Tailwind would fight it |
| Type safety | **TypeScript** throughout | Firestore converters typed end-to-end |
| Fonts | Google Fonts: DM Mono + Inter (CDN, inline `@import`) | Matches approved dashboard design |

---

## 3. Firebase project setup (do once, manually)

1. Create project at console.firebase.google.com — name: `eyestea-track`
2. Enable **Firestore** (production mode, region: `europe-west2` — London, closest to Scotland)
3. Enable **Authentication** → Email/Password provider
4. Create two user accounts (Kevin, Jennifer) via Firebase console Auth tab
5. Enable **Firebase Hosting**
6. Install Firebase CLI: `npm install -g firebase-tools`
7. `firebase login` then `firebase init` in project root (select Hosting + Firestore)
8. Copy the Firebase config object into `.env` (see Section 5)

---

## 4. Firestore data model

All collections sit at root level. Every document carries `createdAt`, `updatedAt`, `createdBy`
(uid string) fields unless noted.

### 4.1 `batches` — one doc per batch

```
batches/{batchId}

batchId:         string  — "EYT-2026-06-15-A" (format: EYT-YYYY-MM-DD-[A/B])
productName:     string  — "Lemon Original" | "Peach & Ginger" | custom
fermenter:       "A" | "B"
status:          "active" | "conditioning" | "ready_to_can" | "canning" | "complete" | "hold" | "disposed"
stage:           number  — 1–21 matching HACCP plan process steps
startDate:       Timestamp
recipe: {
  teaLeaves:     number  — grams (500)
  sugar:         number  — grams (4500)
  yeast:         number  — grams (40)
  yeastNutrients:number  — grams (30)
  waterBrew:     number  — litres (20)
  waterDilution: number  — litres (40)
}
conditioning: {
  stevia:        number  — grams (400)
  extraTeaLeaves:number  — grams (250)
  lemonEssence:  number  — ml (35)
  secondaryEssence: number — ml (25)
  secondaryEssenceName: string
  citricAcid:    number  — grams (15)
  completedAt:   Timestamp | null
}
canning: {
  date:          Timestamp | null
  cansProduced:  number | null
  releasedAt:    Timestamp | null
  releasedBy:    string | null
}
notes:           string
createdAt:       Timestamp
updatedAt:       Timestamp
createdBy:       string  — uid
```

### 4.2 `batches/{batchId}/readings` — gravity + temperature during fermentation

```
readings/{readingId}

type:            "gravity" | "temperature"
value:           number     — SG (e.g. 1.014) or °C
day:             number     — day number since pitch (0 = OG)
recordedAt:      Timestamp
recordedBy:      string     — uid
notes:           string
```

### 4.3 `batches/{batchId}/ccpLogs` — one doc per CCP check

```
ccpLogs/{logId}

ccp:             "CCP1" | "CCP2" | "CCP3" | "CCP4"
status:          "pass" | "fail" | "corrective_action"
readings: {
  // CCP1 — pH
  ph:            number | null

  // CCP2 — Pasteurisation
  waterBathTempStart:  number | null   — °C
  waterBathTemp5min:   number | null   — °C
  waterBathTempEnd:    number | null   — °C
  holdTimeMinutes:     number | null
  criticalLimitMet:    boolean | null

  // CCP3 — Oxygen purging
  gasCertRef:          string | null
  gasType:             "CO2" | "N2" | null
  purgeConfirmed:      boolean | null
  doResult:            number | null    — mg/L dissolved oxygen

  // CCP4 — Seam integrity
  seamVisualPass:      boolean | null
  teardownCount:       number | null
  seamWidth:           number | null    — mm
  seamThickness:       number | null    — mm
  countersinkDepth:    number | null    — mm
  leakTestCount:       number | null
  leakTestPass:        boolean | null
  metalFragmentsNone:  boolean | null
}
recordedAt:      Timestamp
recordedBy:      string    — uid
notes:           string
```

### 4.4 `batches/{batchId}/correctiveActions` — raised when a CCP fails

```
correctiveActions/{actionId}

ccp:             "CCP1" | "CCP2" | "CCP3" | "CCP4"
deviation:       string     — description of what was out of limit
rootCause:       string
actionTaken:     string
productDisposition: "hold" | "re-pasteurised" | "disposed" | "released"
retestResult:    string | null
resolvedAt:      Timestamp | null
resolvedBy:      string | null
raisedAt:        Timestamp
raisedBy:        string    — uid
```

### 4.5 `rawMaterialIntake` — top-level collection, one doc per delivery

```
rawMaterialIntake/{intakeId}

batchId:         string | null   — linked batch if applicable
material:        string          — "Tea leaves" | "White sugar" | "Yeast" | etc.
supplier:        string
lotNumber:       string
quantity:        number
unit:            "g" | "kg" | "ml" | "L" | "units"
receivedDate:    Timestamp
bestBefore:      Timestamp | null
inspectionPassed: boolean
nonConformanceRef: string | null
notes:           string
recordedBy:      string
recordedAt:      Timestamp
```

### 4.6 `dispatchRecords` — top-level collection

```
dispatchRecords/{dispatchId}

batchId:         string
quantity:        number
unit:            "cans" | "cases"
destination:     string
dispatchDate:    Timestamp
recordedBy:      string
recordedAt:      Timestamp
notes:           string
```

### 4.7 `users` — mirror of Firebase Auth, for display names

```
users/{uid}

displayName:     string
email:           string
initials:        string   — "KF" | "JW"
role:            "director"
createdAt:       Timestamp
```

---

## 5. Environment variables

Create `.env` at project root (never commit — add to `.gitignore`):

```
NUXT_PUBLIC_FIREBASE_API_KEY=
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NUXT_PUBLIC_FIREBASE_PROJECT_ID=
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NUXT_PUBLIC_FIREBASE_APP_ID=
```

---

## 6. Firestore security rules (target state)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Only authenticated users from EyesTea can read/write
    function isEyesTea() {
      return request.auth != null;
    }

    match /batches/{batchId} {
      allow read, write: if isEyesTea();

      match /readings/{id}     { allow read, write: if isEyesTea(); }
      match /ccpLogs/{id}      { allow read, write: if isEyesTea(); }
      match /correctiveActions/{id} { allow read, write: if isEyesTea(); }
    }

    match /rawMaterialIntake/{id} { allow read, write: if isEyesTea(); }
    match /dispatchRecords/{id}   { allow read, write: if isEyesTea(); }
    match /users/{uid}            { allow read: if isEyesTea();
                                    allow write: if request.auth.uid == uid; }
  }
}
```

---

## 7. Page / route map

```
/                     → redirect to /dashboard
/login                → Firebase email/password login
/dashboard            → Batch rail + status bar + recent log (the designed view)
/batches/new          → Start new batch (receipt + recipe form)
/batches/[id]         → Batch detail: full stage view
/batches/[id]/log     → Add fermentation reading (gravity / temp)
/batches/[id]/condition → Conditioning step form
/batches/[id]/ccp/[n] → CCP check form (1–4), n = 1|2|3|4
/batches/[id]/can     → Canning run form
/batches/[id]/dispatch → Dispatch form
/records              → Full log table, filterable by batch / date / type
/intake               → Raw material intake log + new intake form
/corrective           → All corrective actions log
```

---

## 8. Component tree (planned)

```
layouts/
  default.vue          — Header, nav, slot
  auth.vue             — Bare layout for /login

pages/
  index.vue            — Redirect
  login.vue
  dashboard.vue
  batches/
    new.vue
    [id]/
      index.vue        — Batch detail
      log.vue
      condition.vue
      ccp/
        [n].vue
      can.vue
      dispatch.vue
  records.vue
  intake.vue
  corrective.vue

components/
  batch/
    BatchCard.vue      — The card in the rail
    BatchRail.vue      — Horizontal scrolling container
    StageSpine.vue     — Vertical stage progress inside card
    StatusBar.vue      — Active / warn / idle counts
  ccp/
    CcpStatusTag.vue   — "In limit" / "Over limit" / "Pending" badge
    CcpRow.vue         — Label + value + tag row
    CcpBlock.vue       — Group of CcpRows
    Ccp1Form.vue       — pH entry
    Ccp2Form.vue       — Pasteurisation entry
    Ccp3Form.vue       — O2 purge entry
    Ccp4Form.vue       — Seam integrity entry
  readings/
    GravitySparkline.vue
    ReadingForm.vue
  log/
    LogTable.vue
    LogRow.vue
  ui/
    AppButton.vue
    AppInput.vue
    AppSelect.vue
    AppTextarea.vue
    FormSection.vue
    AlertBanner.vue    — Warn / ok states
    MonoLabel.vue      — DM Mono uppercase label
    PageHeader.vue

composables/
  useBatch.ts          — CRUD for a single batch
  useBatches.ts        — Real-time list of active batches
  useReadings.ts       — Subcollection composable
  useCcpLogs.ts
  useCorrectiveActions.ts
  useIntake.ts
  useCurrentUser.ts    — Wraps Firebase Auth user

stores/
  auth.ts              — Pinia: current user, login, logout
  ui.ts                — Pinia: global loading, toast messages

types/
  batch.ts             — All TypeScript interfaces matching Section 4
  ccp.ts
  reading.ts
  intake.ts
  dispatch.ts
  user.ts
```

---

## 9. Critical limits (hard-coded in app, sourced from HACCP plan)

```typescript
export const CCP_LIMITS = {
  CCP1: { ph: { max: 4.6 } },
  CCP2: { tempMin: 75, holdTimeMin: 10 },          // °C, minutes
  CCP3: { doMax: 0.3 },                             // mg/L dissolved oxygen
  CCP4: { /* visual/teardown — pass/fail booleans */ }
} as const
```

Any reading outside these limits must:
1. Set `ccpLog.status = "fail"`
2. Prevent batch from advancing to next stage
3. Require a `correctiveAction` document before the batch can proceed
4. Show the warn state on the BatchCard

---

## 10. HACCP stage map (21 steps from plan Section 3.1)

```typescript
export const STAGES = [
  { n: 1,  label: 'Receipt & inspection',      key: 'receipt' },
  { n: 2,  label: 'Raw material storage',      key: 'storage' },
  { n: 3,  label: 'Water preparation',         key: 'water' },
  { n: 4,  label: 'Tea brewing',               key: 'brew' },
  { n: 5,  label: 'Sugar dissolution',         key: 'sweeten' },
  { n: 6,  label: 'Cooling to pitch temp',     key: 'cool' },
  { n: 7,  label: 'Transfer to fermenter',     key: 'transfer' },
  { n: 8,  label: 'Yeast pitching',            key: 'pitch' },
  { n: 9,  label: 'Fermentation monitoring',   key: 'ferment' },
  { n: 10, label: 'Transfer to secondary',     key: 'secondary' },
  { n: 11, label: 'Conditioning ingredients',  key: 'condition' },
  { n: 12, label: 'Fermentation arrest check', key: 'arrest' },
  { n: 13, label: 'CCP1 — pH check',          key: 'ccp1', ccp: 'CCP1' },
  { n: 14, label: 'Conditioning period',       key: 'condition_rest' },
  { n: 15, label: 'Pre-canning quality check', key: 'precan' },
  { n: 16, label: 'CCP3 — O₂ purge',          key: 'ccp3', ccp: 'CCP3' },
  { n: 17, label: 'CCP4 — Fill & seam',        key: 'ccp4', ccp: 'CCP4' },
  { n: 18, label: 'Can inspection',            key: 'inspect' },
  { n: 19, label: 'CCP2 — Pasteurisation',    key: 'ccp2', ccp: 'CCP2' },
  { n: 20, label: 'Labelling & storage',       key: 'label' },
  { n: 21, label: 'Dispatch',                  key: 'dispatch' },
] as const
```

---

## 11. Design tokens (from approved dashboard design)

```css
--ground:        #E8E0D0;   /* warm stone — app background */
--ground-deep:   #D5C9B5;   /* status bar, card heads */
--ground-light:  #F2EDE4;   /* card bodies */
--text:          #1A1714;   /* near-black */
--text-muted:    #6B6258;
--text-faint:    #A09488;
--accent:        #2A7A6F;   /* teal — in-limit / ok / active */
--accent-bg:     #D4EDEA;
--warn:          #C4520A;   /* burnt orange — out-of-limit / warning */
--warn-bg:       #F5E0D0;
--border:        rgba(26,23,20,0.12);
--border-strong: #1A1714;
--font-mono:     'DM Mono', 'Courier New', monospace;
--font-body:     'Inter', system-ui, sans-serif;
```

---

## 12. Build order (session-by-session)

| # | Session | Deliverable | Status |
|---|---|---|---|
| 1 | This session | PLAN.md + project scaffold + Firebase config + design tokens | 🔄 In progress |
| 2 | Next | Auth (login page, auth guard, user store) | ⬜ |
| 3 | Next | Dashboard: BatchRail, BatchCard, StatusBar, real Firestore data | ⬜ |
| 4 | Next | New batch form + raw material intake | ⬜ |
| 5 | Next | Batch detail view + stage progression | ⬜ |
| 6 | Next | Fermentation log (readings, sparkline) | ⬜ |
| 7 | Next | CCP1 form (pH) + CCP2 form (pasteurisation) | ⬜ |
| 8 | Next | CCP3 form (O2 purge) + CCP4 form (seam integrity) | ⬜ |
| 9 | Next | Corrective action flow | ⬜ |
| 10 | Next | Records log table + filtering | ⬜ |
| 11 | Next | Dispatch form + dispatch records | ⬜ |
| 12 | Next | Firestore security rules + Firebase Hosting deploy | ⬜ |

---

## 13. Commands reference

```bash
# Development
npm run dev

# Build
npm run build

# Firebase deploy
firebase deploy --only hosting
firebase deploy --only firestore:rules

# Add a dependency
npm install <pkg>
```

---

## 14. Key files to check first in any new session

1. `PLAN.md` — this file
2. `nuxt.config.ts` — Firebase config, modules
3. `types/` — data model interfaces
4. `composables/` — Firestore composables
5. `stores/auth.ts` — current user
6. `assets/css/tokens.css` — design tokens

---

*Last updated: 22 Jun 2026 — Session 1*
