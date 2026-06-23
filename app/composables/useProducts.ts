import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  getFirestore,
} from 'firebase/firestore'
import { useCollection, useFirestore, useCurrentUser } from 'vuefire'
import type { Product } from '~/types/product'

export function useProducts() {
  const db = useFirestore()
  const user = useCurrentUser()

  const _products = useCollection<Product>(
    computed(() => {
      if (!user.value) return null
      return query(collection(db, 'products'), orderBy('name', 'asc'))
    }),
    { ssrKey: 'products' }
  )

  const products = computed(() => _products.value ?? [])

  return { products }
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'createdBy'>

export async function createProduct(data: ProductInput, userId: string) {
  const db = getFirestore()
  const ref = await addDoc(collection(db, 'products'), {
    ...data,
    createdAt: serverTimestamp(),
    createdBy: userId,
  })
  return ref.id
}

export async function updateProduct(productId: string, data: Partial<ProductInput>) {
  const db = getFirestore()
  // setDoc with merge:false would drop createdAt — use merge:true but pass explicit fields
  // to overwrite stale top-level fields from the old schema
  await setDoc(doc(db, 'products', productId), data, { merge: true })
}

export async function deleteProduct(productId: string) {
  const db = getFirestore()
  await deleteDoc(doc(db, 'products', productId))
}
