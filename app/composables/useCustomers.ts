import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  getFirestore,
} from 'firebase/firestore'
import { useCollection, useFirestore, useCurrentUser } from 'vuefire'
import { type Ref, isRef, ref } from 'vue'
import type { Customer, DueDiligenceEntry } from '~/types/customer'

export function useCustomers() {
  const db = useFirestore()
  const user = useCurrentUser()

  const customers = useCollection<Customer>(
    computed(() => {
      if (!user.value) return null
      return query(collection(db, 'customers'), orderBy('name', 'asc'))
    }),
    { ssrKey: 'customers' }
  )

  return { customers }
}

type CustomerPayload = Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>

export async function createCustomer(params: CustomerPayload & { userId: string }): Promise<string> {
  const db = getFirestore()
  const { userId, ...fields } = params
  const ref = await addDoc(collection(db, 'customers'), {
    ...fields,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
  })
  return ref.id
}

export async function updateCustomer(
  customerId: string,
  fields: Partial<Omit<Customer, 'id' | 'createdAt' | 'createdBy'>>
) {
  const db = getFirestore()
  await updateDoc(doc(db, 'customers', customerId), {
    ...fields,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteCustomer(customerId: string) {
  const db = getFirestore()
  await deleteDoc(doc(db, 'customers', customerId))
}

// ── Due diligence log — subcollection ────────────────────────
export function useDueDiligence(customerId: Ref<string> | string) {
  const db = useFirestore()
  const user = useCurrentUser()
  const id = isRef(customerId) ? customerId : ref(customerId)

  const entries = useCollection<DueDiligenceEntry>(
    computed(() => {
      if (!user.value || !id.value) return null
      return query(
        collection(db, 'customers', id.value, 'dueDiligence'),
        orderBy('checkedAt', 'desc')
      )
    }),
    { ssrKey: `dd-${id.value}` }
  )

  return { entries }
}

export async function addDueDiligenceEntry(
  customerId: string,
  params: Omit<DueDiligenceEntry, 'id' | 'checkedAt' | 'checkedBy'> & { userId: string }
): Promise<void> {
  const db = getFirestore()
  const { userId, ...fields } = params
  await addDoc(collection(db, 'customers', customerId, 'dueDiligence'), {
    ...fields,
    checkedAt: serverTimestamp(),
    checkedBy: userId,
  })
}

export async function deleteDueDiligenceEntry(customerId: string, entryId: string): Promise<void> {
  const db = getFirestore()
  await deleteDoc(doc(db, 'customers', customerId, 'dueDiligence', entryId))
}
