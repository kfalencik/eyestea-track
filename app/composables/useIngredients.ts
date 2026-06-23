import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, getFirestore,
} from 'firebase/firestore'
import { useCollection, useFirestore, useCurrentUser } from 'vuefire'
import { ref, computed, watch, onUnmounted } from 'vue'
import type { Ingredient, IngredientIntake, IngredientUsage, IngredientStock, IngredientUnit } from '~/types/ingredient'

// ── Reactive list of all ingredients ──────────────────────
export function useIngredients() {
  const db = useFirestore()
  const user = useCurrentUser()
  const ingredients = useCollection<Ingredient>(
    computed(() => {
      if (!user.value) return null
      return query(collection(db, 'ingredients'), orderBy('name', 'asc'))
    }),
    { ssrKey: 'ingredients' }
  )
  return { ingredients: computed(() => ingredients.value ?? []) }
}

// ── Intake subcollection for one ingredient ────────────────
export function useIngredientIntakes(ingredientId: string) {
  const db = useFirestore()
  const user = useCurrentUser()
  const intakes = useCollection<IngredientIntake>(
    computed(() => {
      if (!user.value || !ingredientId) return null
      return query(
        collection(db, 'ingredients', ingredientId, 'intakes'),
        orderBy('receivedAt', 'desc')
      )
    }),
    { ssrKey: `intakes-${ingredientId}` }
  )
  return { intakes: computed(() => intakes.value ?? []) }
}

// ── Usage subcollection for one ingredient ─────────────────
export function useIngredientUsages(ingredientId: string) {
  const db = useFirestore()
  const user = useCurrentUser()
  const usages = useCollection<IngredientUsage>(
    computed(() => {
      if (!user.value || !ingredientId) return null
      return query(
        collection(db, 'ingredients', ingredientId, 'usages'),
        orderBy('usedAt', 'desc')
      )
    }),
    { ssrKey: `usages-${ingredientId}` }
  )
  return { usages: computed(() => usages.value ?? []) }
}

// ── All intakes and usages — fan out per ingredient (no collection group index needed) ─────
export function useAllIntakes() {
  const user = useCurrentUser()
  const allIntakes = computed<IngredientIntake[]>(() => user.value ? _allIntakesCache.value : [])
  return { allIntakes }
}

// Shared reactive cache populated by useAllIntakesLoader (called once at app level)
const _allIntakesCache = ref<IngredientIntake[]>([])
const _allUsagesCache = ref<IngredientUsage[]>([])

export function useAllIntakesLoader() {
  const db = useFirestore()
  const user = useCurrentUser()
  const { ingredients } = useIngredients()

  // Watch the ingredient list and subscribe to each subcollection
  const unsubscribers: Array<() => void> = []

  watch(
    [() => user.value, () => ingredients.value.map(i => i.id).join(',')],
    async ([u, _]) => {
      // Tear down old listeners
      unsubscribers.forEach(fn => fn())
      unsubscribers.length = 0
      _allIntakesCache.value = []
      _allUsagesCache.value = []

      if (!u || !ingredients.value.length) return

      const { onSnapshot, collection: col, query: q, orderBy: ob } = await import('firebase/firestore')

      for (const ing of ingredients.value) {
        const intakesRef = q(col(db, 'ingredients', ing.id, 'intakes'), ob('receivedAt', 'desc'))
        const usagesRef  = q(col(db, 'ingredients', ing.id, 'usages'),  ob('usedAt',     'desc'))

        const unsubI = onSnapshot(intakesRef, snap => {
          const fresh = snap.docs.map(d => ({ id: d.id, ...d.data() } as IngredientIntake))
          _allIntakesCache.value = [
            ..._allIntakesCache.value.filter(x => x.ingredientId !== ing.id),
            ...fresh,
          ].sort((a, b) => {
            const at = (a.receivedAt as any)?.toMillis?.() ?? 0
            const bt = (b.receivedAt as any)?.toMillis?.() ?? 0
            return bt - at
          })
        })

        const unsubU = onSnapshot(usagesRef, snap => {
          const fresh = snap.docs.map(d => ({ id: d.id, ...d.data() } as IngredientUsage))
          _allUsagesCache.value = [
            ..._allUsagesCache.value.filter(x => x.ingredientId !== ing.id),
            ...fresh,
          ]
        })

        unsubscribers.push(unsubI, unsubU)
      }
    },
    { immediate: true }
  )

  onUnmounted(() => unsubscribers.forEach(fn => fn()))
}

export function useAllUsages() {
  return { allUsages: computed(() => _allUsagesCache.value) }
}

// ── Stock calculation ──────────────────────────────────────
export function computeStock(
  ingredients: Ingredient[],
  allIntakes: IngredientIntake[],
  allUsages: IngredientUsage[]
): IngredientStock[] {
  return ingredients.map(ing => {
    const received = allIntakes
      .filter(i => i.ingredientId === ing.id)
      .reduce((s, i) => s + normalise(i.quantityReceived, i.unit, ing.unit), 0)
    const used = allUsages
      .filter(u => u.ingredientId === ing.id)
      .reduce((s, u) => s + normalise(u.quantityUsed, u.unit, ing.unit), 0)
    const currentStock = Math.max(0, received - used)
    return {
      ingredientId: ing.id,
      name: ing.name,
      category: ing.category,
      unit: ing.unit,
      reorderThresholdQty: ing.reorderThresholdQty,
      totalReceived: received,
      totalUsed: used,
      currentStock,
      isLow: currentStock <= ing.reorderThresholdQty,
    }
  })
}

// Convert between compatible units (g↔kg, ml↔L) — same family only
function normalise(qty: number, from: IngredientUnit, to: IngredientUnit): number {
  if (from === to) return qty
  if (from === 'g' && to === 'kg') return qty / 1000
  if (from === 'kg' && to === 'g') return qty * 1000
  if (from === 'ml' && to === 'L') return qty / 1000
  if (from === 'L' && to === 'ml') return qty * 1000
  return qty // tbsp/tsp/units — no cross-conversion
}

// ── CRUD ───────────────────────────────────────────────────
export async function createIngredient(data: Omit<Ingredient, 'id' | 'createdAt' | 'createdBy'>, userId: string) {
  const db = getFirestore()
  const ref = await addDoc(collection(db, 'ingredients'), {
    ...data,
    createdAt: serverTimestamp(),
    createdBy: userId,
  })
  return ref.id
}

export async function updateIngredient(id: string, data: Partial<Omit<Ingredient, 'id' | 'createdAt' | 'createdBy'>>) {
  const db = getFirestore()
  await updateDoc(doc(db, 'ingredients', id), data)
}

export async function deleteIngredient(id: string) {
  const db = getFirestore()
  await deleteDoc(doc(db, 'ingredients', id))
}

export async function addIntake(ingredientId: string, data: Omit<IngredientIntake, 'id' | 'receivedAt' | 'receivedBy'>, userId: string) {
  const db = getFirestore()
  await addDoc(collection(db, 'ingredients', ingredientId, 'intakes'), {
    ...data,
    receivedAt: serverTimestamp(),
    receivedBy: userId,
  })
}

export async function addUsage(ingredientId: string, data: Omit<IngredientUsage, 'id' | 'usedAt' | 'usedBy'>, userId: string) {
  const db = getFirestore()
  await addDoc(collection(db, 'ingredients', ingredientId, 'usages'), {
    ...data,
    usedAt: serverTimestamp(),
    usedBy: userId,
  })
}
