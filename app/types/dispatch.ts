import type { Timestamp } from 'firebase/firestore'

export interface DispatchRecord {
  id: string
  batchId: string
  quantity: number
  unit: 'cans' | 'cases'
  destination: string
  dispatchDate: Timestamp
  recordedBy: string
  recordedAt: Timestamp
  notes: string
}
