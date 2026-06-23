import type { Timestamp } from 'firebase/firestore'

export type OrderStatus = 'draft' | 'confirmed' | 'dispatched'

export interface OrderLine {
  batchId: string       // Firestore doc ID
  batchRef: string      // human-readable e.g. EYT-2026-06-22-001
  productName: string
  lotCode: string
  cans: number
  canSizeMl: number
  unitPrice: number     // price per can in GBP
}

export interface Order {
  id: string
  orderRef: string        // ORD-YYYY-MM-DD-001
  customer: string        // display name (denormalised)
  customerId?: string     // Firestore customer doc ID
  status: OrderStatus
  lines: OrderLine[]
  notes: string
  // VAT financials — stored so invoice can read without recalculating
  subtotal: number        // ex-VAT total in GBP
  vatRate: number         // e.g. 0.20
  vatAmount: number       // subtotal * vatRate
  total: number           // subtotal + vatAmount
  orderedAt: Timestamp
  dispatchedAt?: Timestamp
  createdAt: Timestamp
  createdBy: string
  updatedAt: Timestamp
}
