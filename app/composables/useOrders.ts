import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  where,
  getDocs,
  serverTimestamp,
  getFirestore,
} from 'firebase/firestore'
import { useCollection, useFirestore, useCurrentUser } from 'vuefire'
import type { Order, OrderStatus, OrderLine } from '~/types/order'

export function useOrders() {
  const db = useFirestore()
  const user = useCurrentUser()

  const orders = useCollection<Order>(
    computed(() => {
      if (!user.value) return null
      return query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    }),
    { ssrKey: 'orders' }
  )

  return { orders }
}

const VAT_RATE = 0.20

function calcVat(lines: OrderLine[]) {
  const subtotal = lines.reduce((s, l) => s + l.cans * l.unitPrice, 0)
  const vatAmount = Math.round(subtotal * VAT_RATE * 100) / 100
  const total = Math.round((subtotal + vatAmount) * 100) / 100
  return { subtotal: Math.round(subtotal * 100) / 100, vatRate: VAT_RATE, vatAmount, total }
}

export async function createOrder(params: {
  customer: string
  customerId?: string
  lines: OrderLine[]
  notes: string
  userId: string
}): Promise<string> {
  const db = getFirestore()
  const ordersRef = collection(db, 'orders')

  const today = new Date()
  const ymd = today.toISOString().slice(0, 10)
  const prefix = `ORD-${ymd}-`

  const existing = await getDocs(
    query(ordersRef, where('orderRef', '>=', prefix), where('orderRef', '<', prefix + '�'))
  )
  const seq = String(existing.size + 1).padStart(3, '0')
  const orderRef = `${prefix}${seq}`

  const ref = await addDoc(ordersRef, {
    orderRef,
    customer: params.customer,
    ...(params.customerId ? { customerId: params.customerId } : {}),
    status: 'confirmed' as OrderStatus,
    lines: params.lines,
    notes: params.notes,
    ...calcVat(params.lines),
    orderedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    createdBy: params.userId,
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateOrder(orderId: string, fields: Partial<Omit<Order, 'id' | 'createdAt' | 'createdBy'>>) {
  const db = getFirestore()
  const extra = fields.lines ? calcVat(fields.lines) : {}
  await updateDoc(doc(db, 'orders', orderId), {
    ...fields,
    ...extra,
    updatedAt: serverTimestamp(),
  })
}

export async function markDispatched(orderId: string) {
  const db = getFirestore()
  await updateDoc(doc(db, 'orders', orderId), {
    status: 'dispatched' as OrderStatus,
    dispatchedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}
