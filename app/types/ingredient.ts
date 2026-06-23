import type { Timestamp } from 'firebase/firestore'

export type IngredientUnit = 'g' | 'kg' | 'ml' | 'L' | 'units' | 'tbsp' | 'tsp'
export type IngredientCategory = 'tea' | 'sugar' | 'yeast' | 'flavour' | 'acid' | 'packaging' | 'gas' | 'other'

export interface Ingredient {
  id: string
  name: string
  category: IngredientCategory
  unit: IngredientUnit           // default unit for stock & recipe
  reorderThresholdQty: number    // alert when stock falls below this
  notes: string
  createdAt: Timestamp
  createdBy: string
}

export interface IngredientIntake {
  id: string
  ingredientId: string
  ingredientName: string         // denormalised for display
  quantityReceived: number
  unit: IngredientUnit
  supplier: string
  lotNumber: string
  bestBefore: string             // ISO date string or ''
  costPerUnit: number            // £ per unit, 0 if not tracked
  certReceived: boolean
  certRef: string
  notes: string
  receivedAt: Timestamp
  receivedBy: string
}

export interface IngredientUsage {
  id: string
  ingredientId: string
  ingredientName: string         // denormalised
  quantityUsed: number
  unit: IngredientUnit
  batchId: string
  batchRef: string               // e.g. EYT-2026-06-23-A
  stageKey: string               // e.g. 'ingredients'
  notes: string
  usedAt: Timestamp
  usedBy: string
}

// Computed from intakes minus usages
export interface IngredientStock {
  ingredientId: string
  name: string
  category: IngredientCategory
  unit: IngredientUnit
  reorderThresholdQty: number
  totalReceived: number
  totalUsed: number
  currentStock: number
  isLow: boolean                 // currentStock <= reorderThresholdQty
}
