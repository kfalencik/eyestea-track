import type { Timestamp } from 'firebase/firestore'

export type IntakeUnit = 'g' | 'kg' | 'ml' | 'L' | 'units'

export const MATERIAL_NAMES = [
  'Tea leaves (brewing)',
  'Tea leaves (conditioning)',
  'White sugar',
  'Brewing yeast',
  'Yeast nutrients',
  'Stevia blend',
  'Citric acid',
  'Lemon essence',
  'Secondary flavour essence',
  'Aluminium cans',
  'Can lids',
  'CO2 / N2 gas cylinder',
] as const

export type MaterialName = typeof MATERIAL_NAMES[number] | string

export interface RawMaterialIntake {
  id: string
  batchId: string | null
  material: MaterialName
  supplier: string
  lotNumber: string
  quantity: number
  unit: IntakeUnit
  receivedDate: Timestamp
  bestBefore: Timestamp | null
  inspectionPassed: boolean
  nonConformanceRef: string | null
  notes: string
  recordedBy: string
  recordedAt: Timestamp
}
