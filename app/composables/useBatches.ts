import {
  collection,
  query,
  orderBy,
  where,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  getFirestore,
} from 'firebase/firestore'
import { useCollection, useFirestore, useCurrentUser } from 'vuefire'
import type { Batch, BatchStatus } from '~/types/batch'
import { DEFAULT_RECIPE } from '~/types/batch'

export function useBatches(statusFilter?: BatchStatus[]) {
  const db = useFirestore()
  const user = useCurrentUser()

  const _batches = useCollection<Batch>(
    computed(() => {
      if (!user.value) return null
      const batchesRef = collection(db, 'batches')
      // where+orderBy on different fields needs a composite index — filter client-side instead
      return statusFilter?.length
        ? query(batchesRef, where('status', 'in', statusFilter))
        : query(batchesRef, orderBy('startDate', 'desc'))
    }),
    { ssrKey: 'batches' }
  )

  // Sort client-side so we don't need a composite Firestore index
  const batches = computed(() =>
    (_batches.value ?? []).slice().sort((a, b) => {
      const at = a.startDate?.toDate?.()?.getTime() ?? 0
      const bt = b.startDate?.toDate?.()?.getTime() ?? 0
      return bt - at
    })
  )

  return { batches }
}

export function useActiveBatches() {
  return useBatches(['active', 'conditioning', 'ready_to_can', 'canning', 'hold'])
}

export async function createBatch(params: {
  productName: string
  fermenter: 'A' | 'B'
  userId: string
  startDate?: Date
  recipe?: Partial<import('~/types/batch').BatchRecipe>
}) {
  const db = getFirestore()
  const batchesRef = collection(db, 'batches')

  const date = params.startDate ?? new Date()
  const ymd = date.toISOString().slice(0, 10)
  const prefix = `EYT-${ymd}-`

  // Count batches already created on this date to get the next sequence number
  const existing = await getDocs(
    query(batchesRef, where('batchId', '>=', prefix), where('batchId', '<', prefix + '￿'))
  )
  const seq = String(existing.size + 1).padStart(3, '0')
  const batchId = `${prefix}${seq}`

  const data = {
    batchId,
    productName: params.productName,
    fermenter: params.fermenter,
    status: 'active' as BatchStatus,
    stage: 0,
    startDate: Timestamp.fromDate(date),
    recipe: { ...DEFAULT_RECIPE, ...params.recipe },
    stageData: {},
    notes: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: params.userId,
  }

  const ref = await addDoc(batchesRef, data)
  return ref.id
}

export async function updateBatchStage(batchDocId: string, stage: number, status?: BatchStatus) {
  const db = getFirestore()
  const updates: Record<string, unknown> = { stage, updatedAt: serverTimestamp() }
  if (status) updates.status = status
  await updateDoc(doc(db, 'batches', batchDocId), updates)
}

export async function updateBatch(batchDocId: string, fields: Partial<Omit<Batch, 'id'>>) {
  const db = getFirestore()
  await updateDoc(doc(db, 'batches', batchDocId), {
    ...fields,
    updatedAt: serverTimestamp(),
  })
}

export function calcAbv(og: number, fg: number): number {
  return Math.round((og - fg) * 131.25 * 10) / 10
}
