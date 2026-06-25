<template>
  <div class="ingredients-page">

    <!-- Page header -->
    <div class="page-header">
      <div>
        <p class="page-eyebrow">Traceability</p>
        <h1 class="page-title">Ingredients</h1>
      </div>
      <div class="page-actions">
        <button v-if="activeTab === 'Stock'" class="btn-new" @click="openIntakePanel()">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1.5v10M1.5 6.5h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          Record intake
        </button>
        <button v-if="activeTab === 'Ingredients'" class="btn-new" @click="openIngredientPanel()">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1.5v10M1.5 6.5h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          New ingredient
        </button>
        <button v-if="activeTab === 'Intake log'" class="btn-new" @click="openIntakePanel()">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1.5v10M1.5 6.5h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          Record intake
        </button>
      </div>
    </div>

    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        v-for="tab in ['Stock', 'Ingredients', 'Intake log']"
        :key="tab"
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
        <span v-if="tab === 'Stock' && lowStockCount > 0" class="tab-badge tab-badge--red">{{ lowStockCount }}</span>
        <span v-if="tab === 'Ingredients'" class="tab-badge">{{ ingredients.length }}</span>
        <span v-if="tab === 'Intake log'" class="tab-badge">{{ allIntakes.length }}</span>
      </button>
    </div>

    <!-- ── Stock tab ── -->
    <div v-if="activeTab === 'Stock'">
      <div v-if="stockItems.length" class="stock-grid">
        <div
          v-for="item in stockItems"
          :key="item.ingredientId"
          class="stock-card"
          :class="{ 'stock-card--low': item.isLow }"
        >
          <div class="stock-card-top">
            <div class="stock-cat-badge" :class="`cat--${item.category}`">
              {{ catLabel(item.category) }}
            </div>
            <span v-if="item.isLow" class="low-badge">Low stock</span>
          </div>
          <div class="stock-name">{{ item.name }}</div>
          <div class="stock-qty">
            <span class="stock-val">{{ formatQty(item.currentStock) }}</span>
            <span class="stock-unit">{{ item.unit }}</span>
          </div>
          <div class="stock-bar-wrap">
            <div
              class="stock-bar"
              :class="item.isLow ? 'stock-bar--low' : 'stock-bar--ok'"
              :style="{ width: stockBarPct(item) + '%' }"
            />
          </div>
          <div class="stock-detail">
            <span>{{ formatQty(item.totalReceived) }} received · {{ formatQty(item.totalUsed) }} used</span>
            <span v-if="item.reorderThresholdQty > 0" class="stock-threshold">reorder at {{ item.reorderThresholdQty }} {{ item.unit }}</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="8" y="10" width="24" height="22" rx="3" stroke="currentColor" stroke-width="1.6"/>
            <path d="M15 10V8a5 5 0 0110 0v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <path d="M15 21h10M15 26h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="empty-title">No stock data yet</p>
        <p class="empty-sub">Add ingredients and record intake to track stock levels.</p>
        <button class="btn-new" style="margin-top:8px" @click="activeTab = 'Ingredients'">Add first ingredient</button>
      </div>
    </div>

    <!-- ── Ingredients tab ── -->
    <div v-if="activeTab === 'Ingredients'">
      <div v-if="ingredients.length" class="ing-list">
        <div v-for="ing in ingredients" :key="ing.id" class="ing-row">
          <div class="ing-row-left">
            <div class="ing-cat-dot" :class="`cat--${ing.category}`" />
            <div>
              <div class="ing-name">{{ ing.name }}</div>
              <div class="ing-meta">{{ catLabel(ing.category) }} · {{ ing.unit }}</div>
            </div>
          </div>
          <div class="ing-row-right">
            <span v-if="ing.reorderThresholdQty > 0" class="ing-threshold">reorder at {{ ing.reorderThresholdQty }} {{ ing.unit }}</span>
            <button class="btn-icon" title="Edit" @click="openIngredientPanel(ing)">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M8.5 2.5l2 2-6.5 6.5H2.5v-2L8.5 2.5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="btn-icon btn-icon--danger" title="Delete" @click="confirmDelete(ing)">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 3.5h9M5 3.5V2.5h3v1M5.5 5.5v4M7.5 5.5v4M3.5 3.5l.5 7h5l.5-7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p class="empty-title">No ingredients yet</p>
        <p class="empty-sub">Configure your ingredients to start tracking stock and tying them to product recipes.</p>
        <button class="btn-new" style="margin-top:8px" @click="openIngredientPanel()">Add first ingredient</button>
      </div>
    </div>

    <!-- ── Intake log tab ── -->
    <div v-if="activeTab === 'Intake log'">
      <div v-if="allIntakes.length" class="page-table-wrap">
        <table class="log-table" aria-label="Ingredient intake log">
          <thead>
            <tr>
              <th>Date</th>
              <th>Ingredient</th>
              <th>Qty received</th>
              <th>Supplier</th>
              <th>Lot ref</th>
              <th>Cert</th>
              <th>Recorded by</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in allIntakes" :key="entry.id">
              <td>{{ formatDate(entry.receivedAt) }}</td>
              <td>{{ entry.ingredientName }}</td>
              <td><span style="font-family:var(--font-mono); font-weight:600">{{ entry.quantityReceived }} {{ entry.unit }}</span></td>
              <td>{{ entry.supplier || '—' }}</td>
              <td>{{ entry.lotNumber || '—' }}</td>
              <td>
                <span :class="entry.certReceived ? 'cert-ok' : 'cert-miss'">
                  <svg v-if="entry.certReceived" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 3L10 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <svg v-else width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </span>
              </td>
              <td>{{ entry.receivedBy }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <p class="empty-title">No intake records yet</p>
        <p class="empty-sub">Record your first ingredient delivery to start stock tracking.</p>
        <button class="btn-new" style="margin-top:8px" @click="openIntakePanel()">Record first intake</button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════
         INGREDIENT PANEL (create / edit)
    ══════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="ingPanelOpen" class="overlay" @click.self="ingPanelOpen = false">
          <Transition name="panel">
            <div v-if="ingPanelOpen" class="form-panel">
              <div class="panel-header">
                <div>
                  <p class="panel-eyebrow">{{ editingIngredient ? 'Edit' : 'New' }} ingredient</p>
                  <h2 class="panel-title">{{ editingIngredient ? editingIngredient.name : 'Configure ingredient' }}</h2>
                </div>
                <button class="panel-close" @click="ingPanelOpen = false">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
              </div>
              <div class="panel-body">
                <div class="field">
                  <label class="field-label">Ingredient name</label>
                  <input v-model="ingForm.name" type="text" class="field-input" placeholder="e.g. Citric acid" />
                </div>
                <div class="field-row">
                  <div class="field">
                    <label class="field-label">Category</label>
                    <select v-model="ingForm.category" class="field-input">
                      <option value="tea">Tea</option>
                      <option value="sugar">Sugar</option>
                      <option value="yeast">Yeast</option>
                      <option value="flavour">Flavour / essence</option>
                      <option value="acid">Acid / adjunct</option>
                      <option value="packaging">Packaging</option>
                      <option value="gas">Gas</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div class="field">
                    <label class="field-label">Default unit</label>
                    <select v-model="ingForm.unit" class="field-input">
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="L">L</option>
                      <option value="tbsp">tbsp</option>
                      <option value="tsp">tsp</option>
                      <option value="units">units</option>
                    </select>
                  </div>
                </div>
                <div class="field">
                  <label class="field-label">Reorder threshold ({{ ingForm.unit || 'units' }})</label>
                  <input v-model.number="ingForm.reorderThresholdQty" type="number" class="field-input field-input--short" min="0" step="0.1" placeholder="0" />
                  <span class="field-hint">Alert when stock falls below this amount</span>
                </div>
                <div class="field">
                  <label class="field-label">Notes (optional)</label>
                  <textarea v-model="ingForm.notes" class="field-input field-textarea" rows="2" placeholder="Supplier preference, storage conditions…" />
                </div>
                <div v-if="ingError" class="form-error">{{ ingError }}</div>
              </div>
              <div class="panel-footer">
                <button class="btn-cancel" @click="ingPanelOpen = false">Cancel</button>
                <button class="btn-submit" :disabled="!ingForm.name || ingLoading" @click="submitIngredient()">
                  {{ ingLoading ? 'Saving…' : editingIngredient ? 'Save changes' : 'Add ingredient' }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- ═══════════════════════════════════════
         INTAKE PANEL
    ══════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="intakePanelOpen" class="overlay" @click.self="intakePanelOpen = false">
          <Transition name="panel">
            <div v-if="intakePanelOpen" class="form-panel">
              <div class="panel-header">
                <div>
                  <p class="panel-eyebrow">Stock</p>
                  <h2 class="panel-title">Record intake</h2>
                </div>
                <button class="panel-close" @click="intakePanelOpen = false">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
              </div>
              <div class="panel-body">
                <div class="field">
                  <label class="field-label">Ingredient</label>
                  <select v-model="intakeForm.ingredientId" class="field-input" @change="onIngredientSelect">
                    <option value="">— Select ingredient —</option>
                    <option v-for="ing in ingredients" :key="ing.id" :value="ing.id">{{ ing.name }}</option>
                  </select>
                </div>
                <div class="field-row">
                  <div class="field">
                    <label class="field-label">Quantity received</label>
                    <input v-model.number="intakeForm.quantityReceived" type="number" class="field-input" min="0" step="0.001" placeholder="0" />
                  </div>
                  <div class="field">
                    <label class="field-label">Unit</label>
                    <select v-model="intakeForm.unit" class="field-input field-input--short">
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="L">L</option>
                      <option value="tbsp">tbsp</option>
                      <option value="tsp">tsp</option>
                      <option value="units">units</option>
                    </select>
                  </div>
                </div>
                <div class="field-row">
                  <div class="field">
                    <label class="field-label">Supplier</label>
                    <input v-model="intakeForm.supplier" type="text" class="field-input" placeholder="Supplier name" />
                  </div>
                  <div class="field">
                    <label class="field-label">Lot / batch ref</label>
                    <input v-model="intakeForm.lotNumber" type="text" class="field-input" placeholder="ABC-12345" />
                  </div>
                </div>
                <div class="field-row">
                  <div class="field">
                    <label class="field-label">Best before</label>
                    <input v-model="intakeForm.bestBefore" type="date" class="field-input" />
                  </div>
                  <div class="field">
                    <label class="field-label">Cost per unit (£)</label>
                    <input v-model.number="intakeForm.costPerUnit" type="number" class="field-input" min="0" step="0.01" placeholder="0.00" />
                  </div>
                </div>
                <div class="field">
                  <label class="field-label">Certificate / paperwork received?</label>
                  <div class="radio-group">
                    <label class="radio-option" :class="{ selected: intakeForm.certReceived === true }">
                      <input v-model="intakeForm.certReceived" type="radio" :value="true" /> Yes
                    </label>
                    <label class="radio-option" :class="{ selected: intakeForm.certReceived === false }">
                      <input v-model="intakeForm.certReceived" type="radio" :value="false" /> No
                    </label>
                  </div>
                </div>
                <div class="field">
                  <label class="field-label">Cert ref (optional)</label>
                  <input v-model="intakeForm.certRef" type="text" class="field-input" placeholder="CoA-2025-001" />
                </div>
                <div class="field">
                  <label class="field-label">Notes (optional)</label>
                  <textarea v-model="intakeForm.notes" class="field-input field-textarea" rows="2" placeholder="Condition on arrival, any concerns…" />
                </div>
                <div v-if="intakeError" class="form-error">{{ intakeError }}</div>
              </div>
              <div class="panel-footer">
                <button class="btn-cancel" @click="intakePanelOpen = false">Cancel</button>
                <button
                  class="btn-submit"
                  :disabled="!intakeForm.ingredientId || !intakeForm.quantityReceived || intakeLoading"
                  @click="submitIntake()"
                >
                  {{ intakeLoading ? 'Saving…' : 'Record intake' }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import type { Timestamp } from 'firebase/firestore'
import type { Ingredient, IngredientUnit, IngredientCategory } from '~/types/ingredient'
import {
  useIngredients, useAllIntakes, useAllUsages, useAllIntakesLoader,
  computeStock, createIngredient, updateIngredient, deleteIngredient, addIntake,
} from '~/composables/useIngredients'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const uiStore = useUiStore()

const { ingredients } = useIngredients()
useAllIntakesLoader()
const { allIntakes } = useAllIntakes()
const { allUsages } = useAllUsages()

const activeTab = ref('Stock')

// ── Stock computation ──────────────────────────────────────
const stockItems = computed(() =>
  computeStock(ingredients.value, allIntakes.value, allUsages.value)
    .sort((a, b) => {
      if (a.isLow !== b.isLow) return a.isLow ? -1 : 1 // low stock first
      return a.name.localeCompare(b.name)
    })
)

const lowStockCount = computed(() => stockItems.value.filter(s => s.isLow).length)

// ── Ingredient panel ───────────────────────────────────────
const ingPanelOpen = ref(false)
const editingIngredient = ref<Ingredient | null>(null)
const ingLoading = ref(false)
const ingError = ref<string | null>(null)

const ingForm = reactive({
  name: '',
  category: 'tea' as IngredientCategory,
  unit: 'g' as IngredientUnit,
  reorderThresholdQty: 0,
  notes: '',
})

function openIngredientPanel(ing?: Ingredient) {
  editingIngredient.value = ing ?? null
  if (ing) {
    ingForm.name = ing.name
    ingForm.category = ing.category
    ingForm.unit = ing.unit
    ingForm.reorderThresholdQty = ing.reorderThresholdQty
    ingForm.notes = ing.notes
  } else {
    ingForm.name = ''
    ingForm.category = 'tea'
    ingForm.unit = 'g'
    ingForm.reorderThresholdQty = 0
    ingForm.notes = ''
  }
  ingError.value = null
  ingPanelOpen.value = true
}

async function submitIngredient() {
  if (!ingForm.name.trim()) return
  ingLoading.value = true
  ingError.value = null
  try {
    const data = {
      name: ingForm.name.trim(),
      category: ingForm.category,
      unit: ingForm.unit,
      reorderThresholdQty: ingForm.reorderThresholdQty,
      notes: ingForm.notes,
    }
    if (editingIngredient.value) {
      await updateIngredient(editingIngredient.value.id, data)
      uiStore.toast(`${data.name} updated`, 'ok')
    } else {
      await createIngredient(data, authStore.user!.uid)
      uiStore.toast(`${data.name} added`, 'ok')
    }
    ingPanelOpen.value = false
  } catch {
    ingError.value = 'Failed to save. Please try again.'
  } finally {
    ingLoading.value = false
  }
}

async function confirmDelete(ing: Ingredient) {
  if (!confirm(`Delete "${ing.name}"? This cannot be undone.`)) return
  try {
    await deleteIngredient(ing.id)
    uiStore.toast(`${ing.name} deleted`, 'ok')
  } catch {
    uiStore.toast('Failed to delete', 'error')
  }
}

// ── Intake panel ───────────────────────────────────────────
const intakePanelOpen = ref(false)
const intakeLoading = ref(false)
const intakeError = ref<string | null>(null)

const intakeForm = reactive({
  ingredientId: '',
  ingredientName: '',
  quantityReceived: null as number | null,
  unit: 'g' as IngredientUnit,
  supplier: '',
  lotNumber: '',
  bestBefore: '',
  costPerUnit: 0,
  certReceived: null as boolean | null,
  certRef: '',
  notes: '',
})

function openIntakePanel() {
  Object.assign(intakeForm, {
    ingredientId: '', ingredientName: '', quantityReceived: null,
    unit: 'g', supplier: '', lotNumber: '', bestBefore: '',
    costPerUnit: 0, certReceived: null, certRef: '', notes: '',
  })
  intakeError.value = null
  intakePanelOpen.value = true
}

function onIngredientSelect() {
  const ing = ingredients.value.find(i => i.id === intakeForm.ingredientId)
  if (ing) {
    intakeForm.ingredientName = ing.name
    intakeForm.unit = ing.unit
  }
}

async function submitIntake() {
  if (!intakeForm.ingredientId || !intakeForm.quantityReceived) return
  intakeLoading.value = true
  intakeError.value = null
  try {
    await addIntake(intakeForm.ingredientId, {
      ingredientId: intakeForm.ingredientId,
      ingredientName: intakeForm.ingredientName,
      quantityReceived: intakeForm.quantityReceived,
      unit: intakeForm.unit,
      supplier: intakeForm.supplier,
      lotNumber: intakeForm.lotNumber,
      bestBefore: intakeForm.bestBefore,
      costPerUnit: intakeForm.costPerUnit ?? 0,
      certReceived: intakeForm.certReceived ?? false,
      certRef: intakeForm.certRef,
      notes: intakeForm.notes,
    }, authStore.user!.uid)
    uiStore.toast(`Intake recorded for ${intakeForm.ingredientName}`, 'ok')
    intakePanelOpen.value = false
  } catch (e) {
    console.error('addIntake failed:', e)
    intakeError.value = 'Failed to save intake. Please try again.'
  } finally {
    intakeLoading.value = false
  }
}

// ── Helpers ────────────────────────────────────────────────
function formatDate(ts: Timestamp | null | undefined): string {
  if (!ts?.toDate) return '—'
  return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatQty(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(2)
}

function stockBarPct(item: ReturnType<typeof computeStock>[0]): number {
  if (item.totalReceived === 0) return 0
  const pct = (item.currentStock / item.totalReceived) * 100
  return Math.min(100, Math.max(2, pct))
}

const CAT_LABELS: Record<string, string> = {
  tea: 'Tea', sugar: 'Sugar', yeast: 'Yeast', flavour: 'Flavour',
  acid: 'Acid', packaging: 'Packaging', gas: 'Gas', other: 'Other',
}
function catLabel(cat: string): string { return CAT_LABELS[cat] ?? cat }
</script>

<style scoped>
.ingredients-page { display: flex; flex-direction: column; gap: 24px; }

/* ── Tab bar ─────────────────────────────────────────── */
.tab-bar {
  display: flex; gap: 2px;
  background: var(--surface-2);
  border-radius: var(--r-sm);
  padding: 3px;
  width: fit-content;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.tab-bar::-webkit-scrollbar { display: none; }
.tab-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 0.84rem; font-weight: 500;
  color: var(--text-secondary);
  transition: background var(--t-fast), color var(--t-fast);
  white-space: nowrap;
  flex-shrink: 0;
}
.tab-btn--active {
  background: var(--surface);
  color: var(--text-primary);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.tab-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: 99px;
  font-size: 0.60rem; font-weight: 700; letter-spacing: 0;
  background: var(--surface-3); color: var(--text-quarternary);
}
.tab-badge--red { background: var(--red-tint); color: var(--red); }

/* ── Stock grid ──────────────────────────────────────── */
.stock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}
.stock-card {
  background: var(--surface);
  border: 1px solid var(--separator-2);
  border-radius: var(--r-lg);
  padding: 16px;
  display: flex; flex-direction: column; gap: 8px;
  box-shadow: var(--shadow-xs);
  transition: box-shadow var(--t-fast);
}
.stock-card--low { border-color: rgba(255,59,48,0.22); }
.stock-card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.stock-cat-badge {
  font-size: 0.62rem; font-weight: 700; letter-spacing: 0.05em;
  text-transform: uppercase; padding: 3px 8px; border-radius: 99px;
}
.low-badge {
  font-size: 0.62rem; font-weight: 700; letter-spacing: 0.04em;
  text-transform: uppercase; color: var(--red); background: var(--red-tint);
  padding: 3px 8px; border-radius: 99px;
}
.stock-name { font-size: 0.92rem; font-weight: 600; color: var(--text-primary); letter-spacing: -0.02em; }
.stock-qty { display: flex; align-items: baseline; gap: 4px; }
.stock-val { font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.03em; line-height: 1; }
.stock-unit { font-size: 0.78rem; font-weight: 500; color: var(--text-quarternary); }
.stock-bar-wrap { height: 4px; background: var(--surface-2); border-radius: 99px; overflow: hidden; }
.stock-bar { height: 100%; border-radius: 99px; transition: width 0.4s var(--ease); }
.stock-bar--ok { background: linear-gradient(90deg, #4CD97B, #28A852); }
.stock-bar--low { background: var(--red); }
.stock-detail { font-size: 0.70rem; color: var(--text-quarternary); display: flex; justify-content: space-between; gap: 6px; flex-wrap: wrap; }
.stock-threshold { font-weight: 600; }

/* Category colours */
.cat--tea       { background: rgba(90,200,250,0.15); color: #0070A8; }
.cat--sugar     { background: rgba(255,214,10,0.18); color: #7A5500; }
.cat--yeast     { background: rgba(255,159,10,0.15); color: #8B4A00; }
.cat--flavour   { background: rgba(191,110,247,0.15); color: #6B1FA8; }
.cat--acid      { background: rgba(255,59,48,0.10); color: #C62828; }
.cat--packaging { background: rgba(60,60,67,0.10); color: #3C3C43; }
.cat--gas       { background: rgba(76,217,123,0.12); color: #1A6B38; }
.cat--other     { background: rgba(142,142,147,0.12); color: #636366; }

/* ── Ingredients list ────────────────────────────────── */
.ing-list {
  background: var(--surface);
  border: 1px solid var(--separator-2);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--shadow-xs);
}
.ing-row {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--separator-2);
  transition: background var(--t-fast);
}
.ing-row:last-child { border-bottom: none; }
.ing-row:hover { background: var(--surface-2); }
.ing-row-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.ing-cat-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.ing-name { font-size: 0.90rem; font-weight: 600; color: var(--text-primary); letter-spacing: -0.01em; }
.ing-meta { font-size: 0.74rem; color: var(--text-quarternary); margin-top: 1px; }
.ing-row-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.ing-threshold { font-size: 0.72rem; color: var(--text-quarternary); font-weight: 500; }

/* Cat dot colors — matching badge palette */
.ing-cat-dot.cat--tea       { background: #5AC8FA; }
.ing-cat-dot.cat--sugar     { background: #FFD60A; }
.ing-cat-dot.cat--yeast     { background: #FF9F0A; }
.ing-cat-dot.cat--flavour   { background: #BF6EF7; }
.ing-cat-dot.cat--acid      { background: #FF3B30; }
.ing-cat-dot.cat--packaging { background: #8E8E93; }
.ing-cat-dot.cat--gas       { background: #30A85A; }
.ing-cat-dot.cat--other     { background: #AEAEB2; }

/* ── Empty state ──────────────────────────────────────── */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 64px 32px; gap: 10px; text-align: center;
  border: 1px dashed var(--separator); border-radius: var(--r-lg);
  background: var(--surface);
}
.empty-icon { color: var(--text-placeholder); margin-bottom: 4px; }
.empty-title { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
.empty-sub { font-size: 0.82rem; color: var(--text-quarternary); max-width: 320px; line-height: 1.5; }

/* ── Stock grid responsive ───────────────────────────── */
@media (max-width: 480px) {
  .stock-grid { grid-template-columns: 1fr; }
}

/* ── Cert indicators ─────────────────────────────────── */
.cert-ok  { display:inline-flex; align-items:center; color: var(--accent); }
.cert-miss { display:inline-flex; align-items:center; color: var(--red); }

/* ── Panel overrides (shared.css provides base styles) ── */
/* Width override — shared default is 520px; use 480px here */
.form-panel { width: 480px; }

/* panel-body uses panel-body-scroll name in shared.css;
   replicate scroll + touch behaviour under local class name */
.panel-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Vue transition names used locally (shared.css uses overlay/form-panel combo) */
.overlay-enter-active, .overlay-leave-active { transition: opacity 180ms var(--ease); }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
.panel-enter-active { transition: transform 240ms var(--ease-spring); }
.panel-leave-active { transition: transform 180ms var(--ease); }
.panel-enter-from, .panel-leave-to { transform: translateX(100%); }

@media (max-width: 800px) {
  .form-panel { width: 100%; max-width: 100%; height: auto; max-height: 92vh; border-radius: var(--r-xl) var(--r-xl) 0 0; }
  .panel-enter-from, .panel-leave-to { transform: translateY(100%); }
  .panel-enter-active { transition: transform 260ms var(--ease-spring); }
  .panel-leave-active { transition: transform 200ms var(--ease); }
}
</style>
