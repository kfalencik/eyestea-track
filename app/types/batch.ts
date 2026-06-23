import type { Timestamp } from 'firebase/firestore'

export type BatchStatus =
  | 'active'
  | 'conditioning'
  | 'ready_to_can'
  | 'canning'
  | 'complete'
  | 'hold'
  | 'disposed'

export type Fermenter = 'A' | 'B'

export interface BatchRecipe {
  teaLeaves: number       // grams
  sugar: number           // grams
  yeast: number           // grams
  yeastNutrients: number  // grams
  waterBrew: number       // litres
  waterDilution: number   // litres
}

// Per-stage data stored inline — each stage key maps to its recorded measurements
export interface StageData {
  confirmedAt: Timestamp
  confirmedBy: string
  notes: string
  // Sanitise (stage prep)
  equipmentChecked?: string[]
  // Ingredients check
  teaLeavesG?: number
  sugarG?: number
  yeastG?: number
  yeastNutrientsG?: number
  // Water & brew
  brewWaterL?: number
  brewTempC?: number
  steepMinutes?: number
  // Sugar
  sugarDissolvedConfirmed?: boolean
  wortTempAfterSugarC?: number
  // Cool
  coolingMethod?: string
  finalTempC?: number
  coolingMinutes?: number
  // Pitch
  pitchTempC?: number
  ogRecorded?: number
  yeastHydrated?: boolean
  // Transfer to secondary
  sgAtTransfer?: number
  // Conditioning
  steviaG?: number
  extraTeaG?: number
  lemonEssenceMl?: number
  secondaryEssenceMl?: number
  secondaryEssenceName?: string
  citricAcidG?: number
  conditioningCompletedAt?: Timestamp | null
  // Pre-can QC
  precanPh?: number
  precanClarity?: string
  precanCarbonation?: string
  precanTaste?: string
  // Canning
  cansProduced?: number
  canSizeMl?: number
  lotCode?: string
  fgGravity?: number
  fillTempC?: number
  seamerRef?: string
  // CCP1 — pH
  ph?: number
  phPass?: boolean
  // CCP3 — O₂ purge
  gasCertRef?: string
  gasType?: 'CO2' | 'N2'
  purgeConfirmed?: boolean
  doResult?: number
  // CCP4 — Seam integrity
  seamVisualPass?: boolean
  teardownCount?: number
  seamWidth?: number
  seamThickness?: number
  countersinkDepth?: number
  leakTestPass?: boolean
  metalFragmentsNone?: boolean
  // CCP2 — Pasteurisation
  waterBathTempStart?: number
  waterBathTemp5min?: number
  waterBathTempEnd?: number
  holdTimeMinutes?: number
  // Can inspection
  cansInspected?: number
  defectsFound?: number
  // Label & storage
  bestBefore?: string
  storageLocation?: string
  storageTemp?: number
  // Dispatch
  customer?: string
  cansDispatched?: number
  vehicleRef?: string
  dispatchTempC?: number
}

export interface Batch {
  id: string
  batchId: string           // EYT-YYYY-MM-DD-[A/B]
  productName: string
  fermenter: Fermenter
  status: BatchStatus
  stage: number             // highest confirmed stage number
  startDate: Timestamp
  recipe: BatchRecipe       // reference amounts — actuals recorded in stageData
  stageData: Record<string, StageData>  // keyed by stage key string
  notes: string
  dutyPaid: boolean         // true once alcohol duty has been marked as paid
  dutyPaidAt?: Timestamp
  dutyPaidBy?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
}

export interface BatchReading {
  id: string
  type: 'gravity' | 'temperature'
  value: number
  day: number
  recordedAt: Timestamp
  recordedBy: string
  notes: string
}

export type CcpNumber = 'CCP1' | 'CCP2' | 'CCP3' | 'CCP4'
export type CcpStatus = 'pass' | 'fail'

export interface CorrectiveAction {
  id: string
  ccp: CcpNumber
  deviation: string
  rootCause: string
  actionTaken: string
  productDisposition: 'hold' | 're-pasteurised' | 'disposed' | 'released'
  retestResult: string | null
  resolvedAt: Timestamp | null
  resolvedBy: string | null
  raisedAt: Timestamp
  raisedBy: string
}

// ── Stage map ─────────────────────────────────────────────
export type StagePhase = 'brew' | 'ferment' | 'condition' | 'canning' | 'post'

export interface StageDefinition {
  n: number
  key: string
  label: string
  phase: StagePhase
  ccp?: CcpNumber
  // Which fields to save for this stage (drives form rendering)
  fields?: string[]
}

export const STAGE_MAP: StageDefinition[] = [
  // ── Phase A: Brew day ─────────────────────────────────
  { n: 1,  key: 'sanitise',     label: 'Sanitise equipment',      phase: 'brew' },
  { n: 2,  key: 'ingredients',  label: 'Ingredients check',       phase: 'brew' },
  { n: 3,  key: 'brew',         label: 'Brew the tea',            phase: 'brew' },
  { n: 4,  key: 'sweeten',      label: 'Dissolve sugar',          phase: 'brew' },
  { n: 5,  key: 'cool',         label: 'Cool to pitch temp',      phase: 'brew' },
  { n: 6,  key: 'pitch',        label: 'Pitch yeast',             phase: 'brew' },
  // ── Phase B: Fermentation ─────────────────────────────
  { n: 7,  key: 'ferment',      label: 'Fermentation',            phase: 'ferment' },
  // ── Phase C: Secondary & conditioning ─────────────────
  { n: 8,  key: 'secondary',    label: 'Transfer to secondary',   phase: 'condition' },
  { n: 9,  key: 'condition',    label: 'Add conditioning',        phase: 'condition' },
  { n: 10, key: 'arrest',       label: 'Confirm fermentation arrested', phase: 'condition' },
  // ── Phase D: Canning day ─────────────────────────────
  { n: 11, key: 'ccp1',         label: 'CCP1 — pH check',         phase: 'canning', ccp: 'CCP1' },
  { n: 12, key: 'precan',       label: 'Pre-can quality check',   phase: 'canning' },
  { n: 13, key: 'ccp3',         label: 'CCP3 — O₂ purge',         phase: 'canning', ccp: 'CCP3' },
  { n: 14, key: 'canning',      label: 'Canning run',             phase: 'canning' },
  { n: 15, key: 'ccp4',         label: 'CCP4 — Seam integrity',   phase: 'canning', ccp: 'CCP4' },
  { n: 16, key: 'ccp2',         label: 'CCP2 — Pasteurisation',   phase: 'canning', ccp: 'CCP2' },
  { n: 17, key: 'inspect',      label: 'Can inspection',          phase: 'canning' },
  // ── Phase E: Post-production ─────────────────────────
  { n: 18, key: 'label',        label: 'Labelling & storage',     phase: 'post' },
]

export const PHASE_LABELS: Record<StagePhase, string> = {
  brew: 'Brew day',
  ferment: 'Fermentation',
  condition: 'Secondary & conditioning',
  canning: 'Canning day',
  post: 'Post-production',
}

export const CCP_LIMITS = {
  CCP1: { ph: { max: 4.6 } },
  CCP2: { tempMin: 75, holdTimeMin: 10 },
  CCP3: { doMax: 0.3 },
  CCP4: {},
} as const

export const DEFAULT_RECIPE: BatchRecipe = {
  teaLeaves: 500,
  sugar: 4500,
  yeast: 40,
  yeastNutrients: 30,
  waterBrew: 20,
  waterDilution: 40,
}

// Equipment checklist for sanitise stage
export const EQUIPMENT_CHECKLIST = [
  'Brew kettle',
  'Fermenter vessel',
  'Airlock & bung',
  'Thermometer',
  'Hydrometer / refractometer',
  'Transfer hose & siphon',
  'Stirring spoon',
  'Measuring jugs',
  'Scales',
  'pH meter',
]
