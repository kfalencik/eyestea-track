import type { Timestamp } from 'firebase/firestore'
import type { IngredientUnit } from './ingredient'

export interface RecipeIngredient {
  ingredientId: string
  ingredientName: string   // denormalised
  amountPerBatch: number
  unit: IngredientUnit
}

export interface Product {
  id: string
  name: string
  description: string
  recipe: RecipeIngredient[]        // brew-day ingredients
  conditioning: RecipeIngredient[]  // conditioning-stage additions
  notes: string
  createdAt: Timestamp
  createdBy: string
}
