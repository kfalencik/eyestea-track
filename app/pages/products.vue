<template>
  <div class="products-page">

    <div class="page-header">
      <div>
        <p class="page-eyebrow">Recipes</p>
        <h1 class="page-title">Products</h1>
      </div>
      <button class="btn-new" @click="openNew()">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1.5v11M1.5 7h11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
        New product
      </button>
    </div>

    <!-- Product list -->
    <div v-if="products.length" class="product-list">
      <div v-for="p in products" :key="p.id" class="product-row">
        <div class="product-main">
          <div class="product-name">{{ p.name }}</div>
          <div class="product-tags">
            <span v-if="p.recipe && p.recipe.length" class="tag">{{ p.recipe.length }} ingredient{{ p.recipe.length === 1 ? '' : 's' }}</span>
            <span v-else class="tag tag--empty">No recipe yet</span>
            <span v-for="ri in (p.recipe ?? []).slice(0, 3)" :key="ri.ingredientId" class="tag tag--ing">
              {{ ri.amountPerBatch }}{{ ri.unit }} {{ ri.ingredientName }}
            </span>
            <span v-if="(p.recipe ?? []).length > 3" class="tag tag--more">+{{ p.recipe.length - 3 }} more</span>
          </div>
          <div v-if="p.description" class="product-desc">{{ p.description }}</div>
        </div>
        <div class="product-actions">
          <button class="btn-icon" title="Duplicate" @click="openDuplicate(p)">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="4.5" y="4.5" width="7" height="8" rx="1.2" stroke="currentColor" stroke-width="1.3"/>
              <path d="M2.5 9.5V2.5h7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="btn-icon" title="Edit" @click="openEdit(p)">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="btn-icon btn-icon--danger" title="Delete" @click="confirmDelete(p)">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 3.5h10M5 3.5V2.5h4v1M5.5 6v4.5M8.5 6v4.5M3.5 3.5l.5 8h6l.5-8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M9 12h22l-2 16a3 3 0 01-3 2.5H14a3 3 0 01-3-2.5L9 12z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
          <path d="M14 12V10a6 6 0 0112 0v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M28 18c2.5-1 4.5.2 4.5 2.5S30.5 23.5 28 22.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="empty-title">No products yet</p>
      <p class="empty-sub">Create your first product recipe to reuse it when starting batches.</p>
      <button class="btn-new" @click="openNew()">Create first product</button>
    </div>

    <!-- Slide-over / modal form -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="formOpen" class="overlay" @click.self="closeForm()">
          <Transition name="panel">
            <div v-if="formOpen" class="form-panel">
              <div class="panel-header">
                <div>
                  <p class="panel-eyebrow">{{ editingId ? 'Edit' : isDuplicate ? 'Duplicate' : 'New' }} product</p>
                  <h2 class="panel-title">{{ editingId ? form.name || 'Edit product' : isDuplicate ? form.name : 'Create product' }}</h2>
                </div>
                <button class="panel-close" @click="closeForm()">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>

              <div class="panel-body">
                <!-- Name -->
                <div class="field">
                  <label class="field-label">Product name</label>
                  <input v-model="form.name" type="text" class="field-input" placeholder="e.g. Lemon Original" autofocus />
                </div>

                <!-- Description -->
                <div class="field">
                  <label class="field-label">Description (optional)</label>
                  <input v-model="form.description" type="text" class="field-input" placeholder="Short description of this product" />
                </div>

                <!-- Brew-day ingredients -->
                <div class="recipe-section">
                  <div class="recipe-section-header">
                    <span class="recipe-section-label">Brew-day ingredients</span>
                    <span class="recipe-count">{{ form.recipe.length }} ingredient{{ form.recipe.length === 1 ? '' : 's' }}</span>
                  </div>
                  <p class="recipe-section-desc">Tea, sugar, yeast — deducted from stock when the ingredients stage is confirmed.</p>

                  <div v-if="form.recipe.length" class="recipe-list">
                    <div v-for="(ri, idx) in form.recipe" :key="idx" class="recipe-line">
                      <div class="recipe-line-info">
                        <span class="recipe-ing-name">{{ ri.ingredientName }}</span>
                        <span class="recipe-ing-amount">{{ ri.amountPerBatch }} {{ ri.unit }}</span>
                      </div>
                      <button class="btn-icon btn-icon--danger" title="Remove" @click="removeRecipeLine(idx)">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div class="recipe-add-row">
                    <select v-model="addIngId" class="field-input recipe-add-select" @change="onAddIngSelect">
                      <option value="">— Add ingredient —</option>
                      <option v-for="ing in availableBrewIngredients" :key="ing.id" :value="ing.id">{{ ing.name }}</option>
                    </select>
                    <input v-model.number="addIngAmount" type="number" class="field-input recipe-add-amount" min="0" step="0.001" placeholder="Qty" />
                    <select v-model="addIngUnit" class="field-input recipe-add-unit">
                      <option value="g">g</option><option value="kg">kg</option>
                      <option value="ml">ml</option><option value="L">L</option>
                      <option value="tbsp">tbsp</option><option value="tsp">tsp</option>
                      <option value="units">units</option>
                    </select>
                    <button class="recipe-add-btn" :disabled="!addIngId || !addIngAmount" @click="addRecipeLine()">Add</button>
                  </div>

                  <p v-if="!ingredients.length" class="recipe-no-ings">
                    No ingredients yet. <NuxtLink to="/intake" class="recipe-link">Set them up first</NuxtLink>
                  </p>
                </div>

                <!-- Conditioning ingredients -->
                <div class="recipe-section">
                  <div class="recipe-section-header">
                    <span class="recipe-section-label">Conditioning additions</span>
                    <span class="recipe-count">{{ form.conditioning.length }} ingredient{{ form.conditioning.length === 1 ? '' : 's' }}</span>
                  </div>
                  <p class="recipe-section-desc">Flavourings, acids, sweeteners — deducted from stock at the conditioning stage.</p>

                  <div v-if="form.conditioning.length" class="recipe-list">
                    <div v-for="(ri, idx) in form.conditioning" :key="idx" class="recipe-line">
                      <div class="recipe-line-info">
                        <span class="recipe-ing-name">{{ ri.ingredientName }}</span>
                        <span class="recipe-ing-amount">{{ ri.amountPerBatch }} {{ ri.unit }}</span>
                      </div>
                      <button class="btn-icon btn-icon--danger" title="Remove" @click="removeConditioningLine(idx)">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div class="recipe-add-row">
                    <select v-model="addCondId" class="field-input recipe-add-select" @change="onAddCondSelect">
                      <option value="">— Add ingredient —</option>
                      <option v-for="ing in availableCondIngredients" :key="ing.id" :value="ing.id">{{ ing.name }}</option>
                    </select>
                    <input v-model.number="addCondAmount" type="number" class="field-input recipe-add-amount" min="0" step="0.001" placeholder="Qty" />
                    <select v-model="addCondUnit" class="field-input recipe-add-unit">
                      <option value="g">g</option><option value="kg">kg</option>
                      <option value="ml">ml</option><option value="L">L</option>
                      <option value="tbsp">tbsp</option><option value="tsp">tsp</option>
                      <option value="units">units</option>
                    </select>
                    <button class="recipe-add-btn" :disabled="!addCondId || !addCondAmount" @click="addConditioningLine()">Add</button>
                  </div>
                </div>

                <!-- Notes -->
                <div class="field">
                  <label class="field-label">Notes (optional)</label>
                  <textarea v-model="form.notes" class="field-input field-textarea" rows="2" placeholder="Brewing notes, yield, serving suggestions…" />
                </div>

                <div v-if="formError" class="form-error">{{ formError }}</div>
              </div>

              <div class="panel-footer">
                <button class="btn-cancel" @click="closeForm()">Cancel</button>
                <button class="btn-submit" :disabled="!form.name || saving" @click="submitForm()">
                  {{ saving ? 'Saving…' : editingId ? 'Save changes' : isDuplicate ? 'Save copy' : 'Create product' }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete confirmation -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="deletingProduct" class="overlay" @click.self="deletingProduct = null">
          <div class="confirm-dialog">
            <p class="confirm-title">Delete "{{ deletingProduct.name }}"?</p>
            <p class="confirm-sub">This recipe will be removed. Existing batches won't be affected.</p>
            <div class="confirm-actions">
              <button class="btn-cancel" @click="deletingProduct = null">Cancel</button>
              <button class="btn-danger" :disabled="deleting" @click="doDelete()">
                {{ deleting ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

import { useProducts, createProduct, updateProduct, deleteProduct } from '~/composables/useProducts'
import { useIngredients } from '~/composables/useIngredients'
import type { Product, RecipeIngredient } from '~/types/product'
import type { ProductInput } from '~/composables/useProducts'
import type { IngredientUnit } from '~/types/ingredient'

const authStore = useAuthStore()
const uiStore = useUiStore()
const { products } = useProducts()
const { ingredients } = useIngredients()

// ── Form state ─────────────────────────────────────
const formOpen = ref(false)
const editingId = ref<string | null>(null)
const isDuplicate = ref(false)
const saving = ref(false)
const formError = ref<string | null>(null)

interface FormState {
  name: string
  description: string
  recipe: RecipeIngredient[]
  conditioning: RecipeIngredient[]
  notes: string
}

const form = reactive<FormState>({
  name: '',
  description: '',
  recipe: [],
  conditioning: [],
  notes: '',
})

// ── Brew-day ingredient add-row ────────────────────
const addIngId = ref('')
const addIngName = ref('')
const addIngAmount = ref<number | null>(null)
const addIngUnit = ref<IngredientUnit>('g')

const availableBrewIngredients = computed(() =>
  ingredients.value.filter(ing => !form.recipe.some(r => r.ingredientId === ing.id))
)

function onAddIngSelect() {
  const ing = ingredients.value.find(i => i.id === addIngId.value)
  if (ing) { addIngName.value = ing.name; addIngUnit.value = ing.unit }
}

function addRecipeLine() {
  if (!addIngId.value || !addIngAmount.value) return
  form.recipe.push({ ingredientId: addIngId.value, ingredientName: addIngName.value, amountPerBatch: addIngAmount.value, unit: addIngUnit.value })
  addIngId.value = ''; addIngName.value = ''; addIngAmount.value = null; addIngUnit.value = 'g'
}

function removeRecipeLine(idx: number) { form.recipe.splice(idx, 1) }

// ── Conditioning ingredient add-row ───────────────
const addCondId = ref('')
const addCondName = ref('')
const addCondAmount = ref<number | null>(null)
const addCondUnit = ref<IngredientUnit>('g')

const availableCondIngredients = computed(() =>
  ingredients.value.filter(ing => !form.conditioning.some(r => r.ingredientId === ing.id))
)

function onAddCondSelect() {
  const ing = ingredients.value.find(i => i.id === addCondId.value)
  if (ing) { addCondName.value = ing.name; addCondUnit.value = ing.unit }
}

function addConditioningLine() {
  if (!addCondId.value || !addCondAmount.value) return
  form.conditioning.push({ ingredientId: addCondId.value, ingredientName: addCondName.value, amountPerBatch: addCondAmount.value, unit: addCondUnit.value })
  addCondId.value = ''; addCondName.value = ''; addCondAmount.value = null; addCondUnit.value = 'g'
}

function removeConditioningLine(idx: number) { form.conditioning.splice(idx, 1) }

// ── Open / close ───────────────────────────────────
function resetAddRows() {
  addIngId.value = ''; addIngName.value = ''; addIngAmount.value = null; addIngUnit.value = 'g'
  addCondId.value = ''; addCondName.value = ''; addCondAmount.value = null; addCondUnit.value = 'g'
}

function openNew() {
  editingId.value = null
  isDuplicate.value = false
  form.name = ''; form.description = ''; form.recipe = []; form.conditioning = []; form.notes = ''
  resetAddRows()
  formError.value = null
  formOpen.value = true
}

function openDuplicate(p: Product) {
  editingId.value = null
  isDuplicate.value = true
  form.name = p.name + ' (copy)'
  form.description = p.description ?? ''
  form.recipe = (p.recipe ?? []).map(r => ({ ...r }))
  form.conditioning = (p.conditioning ?? []).map(r => ({ ...r }))
  form.notes = p.notes ?? ''
  resetAddRows()
  formError.value = null
  formOpen.value = true
}

function openEdit(p: Product) {
  editingId.value = p.id
  isDuplicate.value = false
  form.name = p.name
  form.description = p.description ?? ''
  form.recipe = (p.recipe ?? []).map(r => ({ ...r }))
  form.conditioning = (p.conditioning ?? []).map(r => ({ ...r }))
  form.notes = p.notes ?? ''
  resetAddRows()
  formError.value = null
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
}

async function submitForm() {
  if (!form.name || !authStore.user) return
  saving.value = true
  formError.value = null
  try {
    const data: ProductInput = {
      name: form.name.trim(),
      description: form.description,
      recipe: form.recipe,
      conditioning: form.conditioning,
      notes: form.notes,
    }
    if (editingId.value) {
      await updateProduct(editingId.value, data)
      uiStore.toast(`${data.name} updated`, 'ok')
    } else {
      await createProduct(data, authStore.user.uid)
      uiStore.toast(`${data.name} created`, 'ok')
    }
    closeForm()
  } catch {
    formError.value = 'Something went wrong. Please try again.'
  } finally {
    saving.value = false
  }
}

// ── Delete ─────────────────────────────────────────
const deletingProduct = ref<Product | null>(null)
const deleting = ref(false)

function confirmDelete(p: Product) {
  deletingProduct.value = p
}

async function doDelete() {
  if (!deletingProduct.value) return
  deleting.value = true
  try {
    await deleteProduct(deletingProduct.value.id)
    uiStore.toast(`${deletingProduct.value.name} deleted`, 'ok')
    deletingProduct.value = null
  } catch {
    uiStore.toast('Failed to delete', 'error')
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.products-page { display: flex; flex-direction: column; gap: 32px; }

/* Product list */
.product-list {
  display: flex; flex-direction: column; gap: 0;
  border: 1px solid var(--separator-2);
  border-radius: var(--r-lg);
  overflow: hidden;
  background: var(--surface);
}
.product-row {
  display: flex; align-items: flex-start; gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--separator-2);
  transition: background var(--t-fast);
}
.product-row:last-child { border-bottom: none; }
.product-row:hover { background: var(--surface-2); }

.product-main { flex: 1; min-width: 0; }
.product-name {
  font-size: 0.92rem; font-weight: 600;
  color: var(--text-primary); letter-spacing: -0.02em;
  margin-bottom: 5px;
}
.product-desc {
  font-size: 0.76rem; color: var(--text-quarternary);
  margin-top: 4px; line-height: 1.4;
}
.product-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.tag {
  font-size: 0.65rem; font-weight: 600; letter-spacing: 0.01em;
  padding: 2px 8px; border-radius: 99px;
  background: var(--surface-3); color: var(--text-quarternary);
}
.tag--ing {
  background: var(--accent-tint); color: var(--accent-deep);
}
.tag--more {
  background: var(--surface-2); color: var(--text-placeholder);
}
.tag--empty {
  background: var(--surface-2); color: var(--text-placeholder); font-style: italic;
}

.product-actions { display: flex; gap: 6px; flex-shrink: 0; padding-top: 2px; }

/* Empty state */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 64px 32px; gap: 10px; text-align: center;
  border: 1px dashed var(--separator-2); border-radius: var(--r-lg);
  background: var(--surface);
}
.empty-icon { color: var(--text-placeholder); margin-bottom: 4px; }
.empty-title { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
.empty-sub { font-size: 0.82rem; color: var(--text-quarternary); max-width: 300px; line-height: 1.5; margin-bottom: 8px; }

/* Overlay */
.overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.28);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: flex-end;
}
.overlay-enter-active, .overlay-leave-active { transition: opacity 180ms var(--ease); }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

/* Slide-over panel */
.form-panel {
  width: 480px; max-width: 94vw;
  height: 100vh;
  background: var(--surface);
  display: flex; flex-direction: column;
  box-shadow: var(--shadow-xl);
}
.panel-enter-active { transition: transform 240ms var(--ease-spring); }
.panel-leave-active { transition: transform 180ms var(--ease); }
.panel-enter-from, .panel-leave-to { transform: translateX(100%); }

.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--separator-2);
  flex-shrink: 0; gap: 12px;
}
.panel-eyebrow { font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-quarternary); margin-bottom: 2px; }
.panel-title { font-size: 1.05rem; font-weight: 700; letter-spacing: -0.03em; color: var(--text-primary); }
.panel-close {
  width: 28px; height: 28px; border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-quarternary);
  transition: background var(--t-fast), color var(--t-fast);
}
.panel-close:hover { background: var(--surface-3); color: var(--text-primary); }

.panel-body {
  flex: 1; overflow-y: auto;
  padding: 20px; display: flex; flex-direction: column; gap: 18px;
}

.panel-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--separator-2);
  display: flex; gap: 10px; justify-content: flex-end;
  flex-shrink: 0;
}

/* Recipe section */
.recipe-section {
  display: flex; flex-direction: column; gap: 10px;
  padding: 14px;
  background: var(--surface-2);
  border-radius: var(--r-md);
  border: 1px solid var(--separator-2);
}
.recipe-section-header {
  display: flex; align-items: center; justify-content: space-between;
}
.recipe-section-label {
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em;
  text-transform: uppercase; color: var(--text-quarternary);
}
.recipe-section-desc {
  font-size: 0.74rem; color: var(--text-placeholder); line-height: 1.4;
}
.recipe-count {
  font-size: 0.72rem; font-weight: 600; color: var(--text-placeholder);
}

.recipe-list {
  display: flex; flex-direction: column; gap: 4px;
}
.recipe-line {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 8px 10px;
  background: #fff;
  border-radius: var(--r-sm);
  border: 1px solid var(--separator-2);
}
.recipe-line-info {
  display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;
}
.recipe-ing-name {
  font-size: 0.84rem; font-weight: 600; color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.recipe-ing-amount {
  font-family: var(--font-mono); font-size: 0.76rem;
  color: var(--text-quarternary); white-space: nowrap; flex-shrink: 0;
}

.recipe-add-row {
  display: flex; gap: 6px; align-items: center;
}
.recipe-add-select { flex: 1; min-width: 0; }
.recipe-add-amount { width: 72px; flex-shrink: 0; }
.recipe-add-unit { width: 64px; flex-shrink: 0; }
.recipe-add-btn {
  padding: 8px 14px;
  border-radius: var(--r-sm);
  background: var(--accent-tint);
  color: var(--accent-deep);
  font-size: 0.82rem; font-weight: 600;
  flex-shrink: 0;
  transition: background var(--t-fast);
}
.recipe-add-btn:hover:not(:disabled) { background: rgba(48,168,90,0.18); }
.recipe-add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.recipe-no-ings {
  font-size: 0.76rem; color: var(--text-quarternary); text-align: center; padding: 8px 0;
}
.recipe-link {
  color: var(--accent); font-weight: 600; text-decoration: underline;
}

.form-error {
  font-size: 0.78rem; color: var(--red); padding: 8px 12px;
  background: rgba(229,57,53,0.07); border-radius: var(--r-sm);
  border: 1px solid rgba(229,57,53,0.2);
}

/* Confirm dialog */
.confirm-dialog {
  background: var(--surface); border-radius: var(--r-lg);
  padding: 24px; width: 360px; max-width: 92vw;
  box-shadow: var(--shadow-xl); margin: auto;
}
.confirm-title { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
.confirm-sub { font-size: 0.82rem; color: var(--text-quarternary); line-height: 1.5; margin-bottom: 20px; }
.confirm-actions { display: flex; gap: 8px; justify-content: flex-end; }

.btn-danger {
  padding: 9px 16px; border-radius: var(--r-sm);
  background: linear-gradient(145deg, #FF6B6B, #E53935);
  color: #fff; font-size: 0.85rem; font-weight: 600;
  box-shadow: 0 1px 6px rgba(229,57,53,0.25);
  transition: box-shadow var(--t-fast), opacity var(--t-fast);
}
.btn-danger:hover:not(:disabled) { box-shadow: 0 3px 10px rgba(229,57,53,0.35); }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
