import {
  doc,
  collection,
  addDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { useDocument, useCollection, useFirestore, useCurrentUser } from 'vuefire'
import type { Batch, BatchReading, CorrectiveAction, StageData, CcpNumber } from '~/types/batch'
import { CCP_LIMITS } from '~/types/batch'
import type { IngredientUnit } from '~/types/ingredient'

export function useBatch(batchDocId: string) {
  const db = useFirestore()
  const user = useCurrentUser()

  const batchRef = doc(db, 'batches', batchDocId)
  const readingsRef = collection(db, 'batches', batchDocId, 'readings')
  const correctiveActionsRef = collection(db, 'batches', batchDocId, 'correctiveActions')

  const batch = useDocument<Batch>(
    computed(() => user.value ? batchRef : null)
  )

  const readings = useCollection<BatchReading>(
    computed(() => user.value ? query(readingsRef, orderBy('day', 'asc')) : null)
  )

  const correctiveActions = useCollection<CorrectiveAction>(
    computed(() => user.value ? query(correctiveActionsRef, orderBy('raisedAt', 'desc')) : null)
  )

  const gravityReadings = computed(() =>
    (readings.value ?? []).filter(r => r.type === 'gravity')
  )

  const hasOpenCorrectiveActions = computed(() =>
    (correctiveActions.value ?? []).some(ca => !ca.resolvedAt)
  )

  async function addReading(params: {
    type: 'gravity' | 'temperature'
    value: number
    day: number
    notes?: string
    userId: string
  }) {
    await addDoc(readingsRef, {
      type: params.type,
      value: params.value,
      day: params.day,
      notes: params.notes ?? '',
      recordedAt: serverTimestamp(),
      recordedBy: params.userId,
    })
  }

  // Save a stage — merges measurement data into stageData[key] and advances stage number
  async function saveStage(params: {
    stageKey: string
    stageNum: number
    data: Partial<StageData>
    userId: string
  }) {
    const current = batch.value?.stage ?? 0
    const payload: Record<string, unknown> = {
      [`stageData.${params.stageKey}`]: {
        ...params.data,
        confirmedAt: serverTimestamp(),
        confirmedBy: params.userId,
        notes: params.data.notes ?? '',
      },
      updatedAt: serverTimestamp(),
    }
    if (params.stageNum > current) payload.stage = params.stageNum
    await updateDoc(batchRef, payload)
  }

  async function raiseCorrectiveAction(params: {
    ccp: CcpNumber
    deviation: string
    rootCause: string
    actionTaken: string
    productDisposition: string
    retestResult?: string
    userId: string
  }) {
    await addDoc(correctiveActionsRef, {
      ccp: params.ccp,
      deviation: params.deviation,
      rootCause: params.rootCause,
      actionTaken: params.actionTaken,
      productDisposition: params.productDisposition,
      retestResult: params.retestResult ?? null,
      resolvedAt: params.retestResult ? serverTimestamp() : null,
      resolvedBy: params.retestResult ? params.userId : null,
      raisedAt: serverTimestamp(),
      raisedBy: params.userId,
    })
  }

  async function updateBatch(data: Record<string, unknown>) {
    const payload: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) payload[k] = v
    }
    await updateDoc(batchRef, { ...payload, updatedAt: serverTimestamp() })
  }

  // Evaluate a CCP stage pass/fail from the stageData
  function evalCcp(ccp: CcpNumber, data: Partial<StageData>): 'pass' | 'fail' {
    if (ccp === 'CCP1') {
      if (data.ph == null) return 'fail'
      return data.ph <= CCP_LIMITS.CCP1.ph.max ? 'pass' : 'fail'
    }
    if (ccp === 'CCP2') {
      if ((data.waterBathTempC ?? 0) < CCP_LIMITS.CCP2.tempMin) return 'fail'
      if ((data.holdTimeMinutes ?? 0) < CCP_LIMITS.CCP2.holdTimeMin) return 'fail'
      return 'pass'
    }
    if (ccp === 'CCP3') {
      if (!data.purgeConfirmed) return 'fail'
      return 'pass'
    }
    if (ccp === 'CCP4') {
      if (!data.seamVisualPass || !data.leakTestPass || !data.metalFragmentsNone) return 'fail'
      return 'pass'
    }
    return 'fail'
  }

  // Determine if a stage is done
  function stageIsDone(key: string, b = batch.value): boolean {
    if (!b) return false
    if (b.stageData?.[key]) return true
    return false
  }

  // Convenience: get saved data for a stage key
  function stageDataFor(key: string): StageData | null {
    return batch.value?.stageData?.[key] ?? null
  }

  return {
    batch,
    readings,
    correctiveActions,
    gravityReadings,
    hasOpenCorrectiveActions,
    addReading,
    saveStage,
    raiseCorrectiveAction,
    updateBatch,
    evalCcp,
    stageIsDone,
    stageDataFor,
  }
}

export async function deductIngredients(params: {
  batchId: string
  batchRef: string
  stageKey: string
  usages: Array<{
    ingredientId: string
    ingredientName: string
    quantityUsed: number
    unit: IngredientUnit
    notes?: string
  }>
  userId: string
}) {
  const { addUsage } = await import('~/composables/useIngredients')
  for (const u of params.usages) {
    await addUsage(u.ingredientId, {
      ingredientId: u.ingredientId,
      ingredientName: u.ingredientName,
      quantityUsed: u.quantityUsed,
      unit: u.unit,
      batchId: params.batchId,
      batchRef: params.batchRef,
      stageKey: params.stageKey,
      notes: u.notes ?? '',
    }, params.userId)
  }
}
