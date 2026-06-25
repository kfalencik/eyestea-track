<template>
  <div class="sales-page">

    <div class="page-header">
      <div>
        <p class="page-eyebrow">Sales</p>
        <h1 class="page-title">Orders</h1>
      </div>
      <button class="btn-new" @click="openNew()">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M6.5 1.5v10M1.5 6.5h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
        New order
      </button>
    </div>

    <!-- Summary strip -->
    <div v-if="orders?.length" class="summary-strip">
      <div class="summary-stat">
        <div class="summary-val">{{ confirmedOrders.length }}</div>
        <div class="summary-label">Confirmed</div>
      </div>
      <div class="summary-sep" />
      <div class="summary-stat">
        <div class="summary-val">{{ dispatchedOrders.length }}</div>
        <div class="summary-label">Dispatched</div>
      </div>
      <div class="summary-sep" />
      <div class="summary-stat">
        <div class="summary-val">{{ totalCansCommitted }}</div>
        <div class="summary-label">Cans on order</div>
      </div>
    </div>

    <!-- Order list -->
    <div v-if="orders?.length" class="order-list">

      <!-- Confirmed orders -->
      <div v-if="confirmedOrders.length">
        <div class="list-section-label">Confirmed</div>
        <div class="order-rows">
          <div v-for="o in confirmedOrders" :key="o.id" class="order-row">
            <div class="order-row-main">
              <div class="order-meta">
                <span class="order-ref">{{ o.orderRef }}</span>
                <span class="order-customer">{{ o.customer }}</span>
              </div>
              <div class="order-lines-preview">
                <span v-for="(line, i) in o.lines" :key="i" class="line-tag">
                  {{ line.cans }} × {{ line.productName }}{{ line.canSizeMl ? ` (${line.canSizeMl} ml)` : '' }}
                </span>
              </div>
            </div>
            <div class="order-row-right">
              <span class="order-total">{{ orderTotal(o) }}</span>
              <span class="order-date">{{ formatDate(o.orderedAt) }}</span>
              <div class="order-actions">
                <button class="btn-icon" title="Edit" @click="openEdit(o)">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M8.5 2.5l2 2-6.5 6.5H2.5v-2L8.5 2.5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
                  </svg>
                </button>
                <NuxtLink :to="`/invoice/${o.id}`" class="btn-invoice" target="_blank" title="View invoice">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <rect x="2" y="1" width="8" height="10" rx="1.2" stroke="currentColor" stroke-width="1.2"/>
                    <path d="M4 4h4M4 6h4M4 8h2.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
                  </svg>
                  Invoice
                </NuxtLink>
                <button class="btn-dispatch" @click="confirmDispatch(o)">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1.5 6h9M7 2.5l3.5 3.5L7 9.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dispatched orders -->
      <div v-if="dispatchedOrders.length" :style="confirmedOrders.length ? 'margin-top:24px' : ''">
        <div class="list-section-label">Dispatched</div>
        <div class="order-rows order-rows--dispatched">
          <div v-for="o in dispatchedOrders" :key="o.id" class="order-row">
            <div class="order-row-main">
              <div class="order-meta">
                <span class="order-ref">{{ o.orderRef }}</span>
                <span class="order-customer">{{ o.customer }}</span>
                <span class="dispatched-badge">
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1 4.5l2.5 2.5L8 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  Dispatched {{ formatDate(o.dispatchedAt) }}
                </span>
              </div>
              <div class="order-lines-preview">
                <span v-for="(line, i) in o.lines" :key="i" class="line-tag line-tag--muted">
                  {{ line.cans }} × {{ line.productName }}{{ line.canSizeMl ? ` (${line.canSizeMl} ml)` : '' }}
                </span>
              </div>
            </div>
            <div class="order-row-right">
              <span class="order-total order-total--muted">{{ orderTotal(o) }}</span>
              <NuxtLink :to="`/invoice/${o.id}`" class="btn-invoice btn-invoice--muted" target="_blank" title="View invoice">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="2" y="1" width="8" height="10" rx="1.2" stroke="currentColor" stroke-width="1.2"/>
                  <path d="M4 4h4M4 6h4M4 8h2.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
                </svg>
                Invoice
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M8 14h24l-2 18H10L8 14z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
          <path d="M14 14v-3a6 6 0 0112 0v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M16 22l3 3 6-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <p class="empty-state-title">No orders yet</p>
      <p class="empty-state-sub">Create your first order to allocate duty-paid stock to a customer.</p>
      <button class="btn-new" @click="openNew()">Create first order</button>
    </div>

    <!-- ── Order form panel ── -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="formOpen" class="overlay" @click.self="closeForm()">
          <Transition name="panel">
            <div v-if="formOpen" class="form-panel">

              <div class="panel-header">
                <h2 class="panel-title">{{ editingId ? 'Edit order' : 'New order' }}</h2>
                <button class="panel-close" @click="closeForm()">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
              </div>

              <div class="panel-body">

                <!-- Customer -->
                <div class="field">
                  <label class="field-label">Customer</label>
                  <select
                    v-if="customers?.length"
                    v-model="form.customerId"
                    class="field-input"
                    @change="onCustomerSelect()"
                  >
                    <option value="">— Select customer —</option>
                    <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.name }}</option>
                    <option value="__new__">+ Enter name manually</option>
                  </select>
                  <input
                    v-if="!customers?.length || form.customerId === '__new__'"
                    v-model="form.customer"
                    type="text"
                    class="field-input field-input--mt"
                    placeholder="Customer name"
                  />
                </div>

                <!-- Selected customer preview -->
                <div v-if="selectedCustomer" class="customer-preview">
                  <div class="cp-name">{{ selectedCustomer.name }}</div>
                  <div v-if="selectedCustomer.company && selectedCustomer.company !== selectedCustomer.name" class="cp-sub">{{ selectedCustomer.company }}</div>
                  <div class="cp-rows">
                    <span v-if="selectedCustomer.contactName" class="cp-row">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="3.5" r="2" stroke="currentColor" stroke-width="1.1"/><path d="M1.5 9c0-2 1.6-3.5 3.5-3.5S8.5 7 8.5 9" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>
                      {{ selectedCustomer.contactName }}
                    </span>
                    <span v-if="selectedCustomer.email" class="cp-row">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="2.5" width="8" height="5" rx="1" stroke="currentColor" stroke-width="1.1"/><path d="M1 3.5l4 2.5 4-2.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>
                      {{ selectedCustomer.email }}
                    </span>
                    <span v-if="selectedCustomer.phone" class="cp-row">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2C2 1.7 2.3 1.5 2.6 1.5c.2 0 .4.1.5.2L4.3 3c.2.2.2.5 0 .7l-.5.6c.4.7.8 1.2 1.5 1.6l.6-.6c.2-.2.5-.2.7 0l1.2 1.2c.1.1.2.3.2.5C8 7 7.7 7.5 7 7.5 4.5 7.5 2.5 5.5 2 2z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>
                      {{ selectedCustomer.phone }}
                    </span>
                    <span v-if="deliveryAddress(selectedCustomer)" class="cp-row">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1C3.3 1 2 2.3 2 4c0 2.3 3 5 3 5s3-2.7 3-5c0-1.7-1.3-3-3-3z" stroke="currentColor" stroke-width="1.1"/><circle cx="5" cy="4" r="1" fill="currentColor"/></svg>
                      {{ deliveryAddress(selectedCustomer) }}
                    </span>
                  </div>
                  <div v-if="selectedCustomer.paymentTermsDays" class="cp-terms">
                    {{ selectedCustomer.paymentTermsDays }} day payment terms
                  </div>
                </div>

                <!-- Stock picker -->
                <div class="field-group-label">Stock allocation</div>

                <div v-if="!availableStock.length" class="stock-empty">
                  No labelled stock available yet. Complete the labelling stage for a batch first.
                </div>

                <div v-else class="stock-list">
                  <div
                    v-for="stock in availableStock"
                    :key="stock.key"
                    class="stock-row"
                    :class="{ 'stock-row--selected': lineFor(stock) != null }"
                  >
                    <div class="stock-info">
                      <div class="stock-product">{{ stock.productName }}</div>
                      <div class="stock-meta">
                        <span class="stock-ref">{{ stock.batchRef }}</span>
                        <span class="stock-sep">·</span>
                        <span class="stock-size">{{ stock.canSizeMl }} ml</span>
                        <span class="stock-sep">·</span>
                        <span class="stock-avail">{{ stock.available }} available</span>
                      </div>
                    </div>
                    <div class="stock-controls">
                      <div class="qty-row">
                        <label class="qty-label">Qty</label>
                        <input
                          :value="lineFor(stock)?.cans ?? ''"
                          type="number"
                          class="qty-input"
                          min="1"
                          :max="stock.available"
                          step="1"
                          placeholder="0"
                          @input="setLineQty(stock, ($event.target as HTMLInputElement).valueAsNumber)"
                        />
                      </div>
                      <div class="price-row">
                        <label class="qty-label">£/can</label>
                        <input
                          :value="lineFor(stock)?.unitPrice ?? ''"
                          type="number"
                          class="qty-input"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          @input="setLinePrice(stock, ($event.target as HTMLInputElement).valueAsNumber)"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Order total -->
                <div v-if="form.lines.length" class="order-summary">
                  <div class="order-summary-row">
                    <span>Total cans</span>
                    <span class="mono">{{ form.lines.reduce((s, l) => s + l.cans, 0) }}</span>
                  </div>
                  <div class="order-summary-row">
                    <span>Subtotal (ex. VAT)</span>
                    <span class="mono">£{{ formSubtotal.toFixed(2) }}</span>
                  </div>
                  <div class="order-summary-row">
                    <span>VAT (20%)</span>
                    <span class="mono">£{{ formVat.toFixed(2) }}</span>
                  </div>
                  <div class="order-summary-row order-summary-row--total">
                    <span>Total (inc. VAT)</span>
                    <span class="mono">£{{ formTotal.toFixed(2) }}</span>
                  </div>
                </div>

                <!-- Notes -->
                <div class="field" style="margin-top:4px">
                  <label class="field-label">Notes <span class="label-opt">(optional)</span></label>
                  <textarea v-model="form.notes" class="field-input field-textarea" rows="2" placeholder="Delivery instructions, PO number…" />
                </div>

                <div v-if="formError" class="form-error">{{ formError }}</div>

              </div>

              <div class="panel-footer">
                <button class="btn-cancel" @click="closeForm()">Cancel</button>
                <button
                  class="btn-submit"
                  :disabled="!form.customer.trim() || !form.lines.length || saving"
                  @click="submitForm()"
                >
                  {{ saving ? 'Saving…' : editingId ? 'Save changes' : 'Confirm order' }}
                </button>
              </div>

            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Dispatch confirmation ── -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="dispatchingOrder" class="overlay" @click.self="dispatchingOrder = null">
          <div class="confirm-dialog">
            <div class="confirm-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M2 11h18M14 4l7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="confirm-title">Dispatch order {{ dispatchingOrder.orderRef }}?</p>
            <p class="confirm-sub">
              {{ dispatchingOrder.customer }} —
              {{ dispatchingOrder.lines.reduce((s, l) => s + l.cans, 0) }} cans.
              This cannot be undone.
            </p>
            <div class="confirm-actions">
              <button class="btn-cancel" @click="dispatchingOrder = null">Cancel</button>
              <button class="btn-dispatch-confirm" :disabled="dispatching" @click="doDispatch()">
                {{ dispatching ? 'Dispatching…' : 'Mark as dispatched' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import type { Timestamp } from 'firebase/firestore'
import type { Order, OrderLine } from '~/types/order'
import type { Batch } from '~/types/batch'
import { useOrders, createOrder, updateOrder, markDispatched } from '~/composables/useOrders'
import { useCustomers } from '~/composables/useCustomers'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const uiStore = useUiStore()

// ── Data ───────────────────────────────────────────────────
const { orders: _orders } = useOrders()
const orders = computed(() => _orders.value ?? [])
const { customers } = useCustomers()

const { batches: allBatches } = useBatches(['complete'])

// All labelled batches are available for sale immediately
const dutyPaidBatches = computed<Batch[]>(() =>
  (allBatches.value ?? []).filter(b => b.stageData?.label != null)
)

// Cans already committed to confirmed orders (not dispatched), keyed by batchDocId-sizeMl
const committedCans = computed<Record<string, number>>(() => {
  const map: Record<string, number> = {}
  for (const o of orders.value) {
    if (o.status === 'confirmed') {
      for (const line of o.lines) {
        if (editingId.value && o.id === editingId.value) continue
        const key = `${line.batchId}-${line.canSizeMl ?? 0}`
        map[key] = (map[key] ?? 0) + line.cans
      }
    }
  }
  return map
})

interface CanRun { sizeMl: number; qty: number; defect: boolean }

interface StockItem {
  key: string
  batchDocId: string
  batchRef: string
  productName: string
  canSizeMl: number
  total: number
  available: number
}

const availableStock = computed<StockItem[]>(() => {
  const items: StockItem[] = []
  for (const b of dutyPaidBatches.value) {
    const runs = ((b.stageData?.canning?.canRuns ?? []) as CanRun[]).filter(r => !r.defect && r.qty > 0)
    const bySize = new Map<number, number>()
    for (const r of runs) bySize.set(r.sizeMl, (bySize.get(r.sizeMl) ?? 0) + r.qty)

    for (const [sizeMl, total] of [...bySize.entries()].sort((a, b) => a[0] - b[0])) {
      const key = `${b.id}-${sizeMl}`
      const committed = committedCans.value[key] ?? 0
      const available = total - committed
      if (available <= 0) continue
      items.push({ key, batchDocId: b.id, batchRef: b.batchId, productName: b.productName, canSizeMl: sizeMl, total, available })
    }
  }
  return items
})

// ── Derived order lists ────────────────────────────────────
const confirmedOrders = computed(() => orders.value.filter(o => o.status === 'confirmed'))
const dispatchedOrders = computed(() => orders.value.filter(o => o.status === 'dispatched'))
const totalCansCommitted = computed(() =>
  confirmedOrders.value.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.cans, 0), 0)
)

// ── Form state ─────────────────────────────────────────────
const formOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const formError = ref<string | null>(null)

const form = reactive({
  customer: '',
  customerId: '' as string,
  lines: [] as OrderLine[],
  notes: '',
})

const selectedCustomer = computed(() => {
  if (!form.customerId || form.customerId === '__new__') return null
  return customers.value?.find(c => c.id === form.customerId) ?? null
})

function onCustomerSelect() {
  if (form.customerId && form.customerId !== '__new__') {
    const c = customers.value?.find(c => c.id === form.customerId)
    if (c) form.customer = c.name
  } else if (form.customerId === '__new__') {
    form.customer = ''
  } else {
    form.customer = ''
  }
}

function deliveryAddress(c: { address?: { city?: string; postcode?: string; line1?: string } } | null): string {
  if (!c?.address) return ''
  return [c.address.line1, c.address.city, c.address.postcode].filter(Boolean).join(', ')
}

function lineFor(stock: StockItem): OrderLine | undefined {
  return form.lines.find(l => l.batchId === stock.batchDocId && l.canSizeMl === stock.canSizeMl)
}

function setLineQty(stock: StockItem, qty: number) {
  if (isNaN(qty) || qty <= 0) {
    form.lines = form.lines.filter(l => !(l.batchId === stock.batchDocId && l.canSizeMl === stock.canSizeMl))
    return
  }
  const capped = Math.min(qty, stock.available)
  const existing = lineFor(stock)
  if (existing) {
    existing.cans = capped
  } else {
    form.lines.push({
      batchId: stock.batchDocId,
      batchRef: stock.batchRef,
      productName: stock.productName,
      lotCode: '',
      cans: capped,
      canSizeMl: stock.canSizeMl,
      unitPrice: 0,
    })
  }
}

function setLinePrice(stock: StockItem, price: number) {
  const existing = lineFor(stock)
  if (existing) existing.unitPrice = isNaN(price) ? 0 : price
}

const VAT_RATE = 0.20
const formSubtotal = computed(() =>
  Math.round(form.lines.reduce((s, l) => s + l.cans * l.unitPrice, 0) * 100) / 100
)
const formVat = computed(() => Math.round(formSubtotal.value * VAT_RATE * 100) / 100)
const formTotal = computed(() => Math.round((formSubtotal.value + formVat.value) * 100) / 100)

function openNew() {
  editingId.value = null
  form.customer = ''
  form.customerId = ''
  form.lines = []
  form.notes = ''
  formError.value = null
  formOpen.value = true
}

function openEdit(order: Order) {
  editingId.value = order.id
  form.customer = order.customer
  form.customerId = order.customerId ?? ''
  form.lines = order.lines.map(l => ({ ...l }))
  form.notes = order.notes
  formError.value = null
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
}

async function submitForm() {
  const resolvedName = form.customer.trim()
  const resolvedId = form.customerId !== '__new__' ? form.customerId : undefined
  if (!resolvedName || !form.lines.length || !authStore.user) return
  saving.value = true
  formError.value = null
  try {
    if (editingId.value) {
      await updateOrder(editingId.value, {
        customer: resolvedName,
        ...(resolvedId ? { customerId: resolvedId } : {}),
        lines: [...form.lines],
        notes: form.notes,
      })
      uiStore.toast('Order updated', 'ok')
    } else {
      await createOrder({
        customer: resolvedName,
        customerId: resolvedId,
        lines: [...form.lines],
        notes: form.notes,
        userId: authStore.user.uid,
      })
      uiStore.toast(`Order confirmed for ${resolvedName}`, 'ok')
    }
    closeForm()
  } catch {
    formError.value = 'Something went wrong. Please try again.'
  } finally {
    saving.value = false
  }
}

// ── Dispatch ───────────────────────────────────────────────
const dispatchingOrder = ref<Order | null>(null)
const dispatching = ref(false)

function confirmDispatch(order: Order) {
  dispatchingOrder.value = order
}

async function doDispatch() {
  if (!dispatchingOrder.value) return
  dispatching.value = true
  try {
    await markDispatched(dispatchingOrder.value.id)
    uiStore.toast(`${dispatchingOrder.value.orderRef} dispatched`, 'ok')
    dispatchingOrder.value = null
  } catch {
    uiStore.toast('Failed to mark as dispatched', 'error')
  } finally {
    dispatching.value = false
  }
}

// ── Helpers ────────────────────────────────────────────────
function formatDate(ts: Timestamp | null | undefined): string {
  if (!ts?.toDate) return '—'
  return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function orderTotal(order: Order): string {
  // prefer stored total (inc. VAT), fall back to recalculating ex-VAT for legacy docs
  if (order.total != null) return `£${order.total.toFixed(2)}`
  const ex = order.lines.reduce((s, l) => s + l.cans * l.unitPrice, 0)
  return ex > 0 ? `£${(ex * 1.2).toFixed(2)}` : `${order.lines.reduce((s, l) => s + l.cans, 0)} cans`
}
</script>

<style scoped>
.sales-page { display: flex; flex-direction: column; gap: 28px; }

.page-eyebrow {
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em;
  text-transform: uppercase; color: var(--accent-deep); margin-bottom: 4px;
}
.page-title {
  font-size: 1.85rem; font-weight: 700;
  letter-spacing: -0.04em; color: var(--text-primary); line-height: 1;
}

/* Summary */
.summary-strip {
  display: flex; align-items: center;
  background: var(--surface); border: 1px solid var(--separator-2);
  border-radius: var(--r-lg); overflow: hidden; align-self: flex-start;
}
.summary-stat { padding: 14px 24px; display: flex; flex-direction: column; gap: 2px; }
.summary-val { font-size: 1.6rem; font-weight: 700; letter-spacing: -0.04em; color: var(--text-primary); line-height: 1; }
.summary-label { font-size: 0.68rem; color: var(--text-quarternary); }
.summary-sep { width: 1px; align-self: stretch; background: var(--separator-2); }

/* Section label */
.list-section-label {
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.07em;
  text-transform: uppercase; color: var(--text-placeholder);
  margin-bottom: 8px; padding-left: 2px;
}

/* Order list */
.order-rows {
  border: 1px solid var(--separator-2); border-radius: var(--r-lg);
  overflow: hidden; background: var(--surface);
}
.order-rows--dispatched { opacity: 0.72; }

.order-row {
  display: flex; align-items: center; gap: 20px;
  padding: 14px 18px; border-bottom: 1px solid var(--separator-2);
  transition: background var(--t-fast);
}
.order-row:last-child { border-bottom: none; }
.order-row:hover { background: var(--surface-2); }

.order-row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.order-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.order-ref {
  font-family: var(--font-mono); font-size: 0.72rem;
  color: var(--text-quarternary); letter-spacing: 0.03em;
}
.order-customer {
  font-size: 0.95rem; font-weight: 650; letter-spacing: -0.02em; color: var(--text-primary);
}
.dispatched-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 0.63rem; font-weight: 600;
  padding: 2px 7px; border-radius: 99px;
  background: var(--accent-tint); color: var(--accent-deep);
}

.order-lines-preview { display: flex; flex-wrap: wrap; gap: 5px; }
.line-tag {
  font-size: 0.68rem; font-weight: 500; padding: 2px 8px; border-radius: 99px;
  background: var(--surface-3); color: var(--text-secondary);
}
.line-tag--muted { color: var(--text-quarternary); }

.order-row-right {
  display: flex; align-items: center; gap: 14px; flex-shrink: 0;
}
.order-total {
  font-family: var(--font-mono); font-size: 0.88rem; font-weight: 700;
  color: var(--text-primary); white-space: nowrap;
}
.order-total--muted { color: var(--text-quarternary); }
.order-date { font-size: 0.72rem; color: var(--text-quarternary); white-space: nowrap; }

.order-actions { display: flex; gap: 6px; align-items: center; }

.btn-invoice {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.73rem; font-weight: 600; padding: 6px 12px;
  border-radius: var(--r-sm); text-decoration: none;
  border: 1px solid var(--separator-2); background: var(--surface);
  color: var(--text-secondary);
  transition: background var(--t-fast), color var(--t-fast);
}
.btn-invoice:hover { background: var(--surface-3); color: var(--text-primary); }
.btn-invoice--muted { color: var(--text-quarternary); border-color: transparent; background: transparent; padding: 6px 8px; }
.btn-invoice--muted:hover { background: var(--surface-2); color: var(--text-secondary); border-color: var(--separator-2); }

.btn-dispatch {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.73rem; font-weight: 600; padding: 6px 12px;
  border-radius: var(--r-sm);
  background: linear-gradient(145deg, #4A9EFF, #1C7EF0); color: #fff;
  box-shadow: 0 1px 5px rgba(28,126,240,0.22);
  transition: box-shadow var(--t-fast), transform var(--t-fast) var(--ease-spring);
}
.btn-dispatch:hover { box-shadow: 0 3px 9px rgba(28,126,240,0.32); transform: translateY(-1px); }

/* ── Responsive ─────────────────────────────────────── */
@media (max-width: 800px) {
  .summary-strip { min-width: 100%; }
  .summary-stat { padding: 12px 16px; flex: 1; }
  .summary-val { font-size: 1.3rem; }

  .order-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 14px 16px;
  }

  /* Prevent mono ref from breaking mid-character */
  .order-ref { word-break: keep-all; white-space: nowrap; }

  /* Stacked card: total + date on top row, actions filling width below */
  .order-row-right {
    flex-wrap: wrap;
    gap: 8px;
  }

  .order-total { font-size: 1rem; }
  .order-date { flex: 1; }

  /* Actions fill the remaining row width so buttons are easy to tap */
  .order-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .btn-dispatch, .btn-invoice {
    padding: 9px 14px; font-size: 0.78rem;
    touch-action: manipulation;
  }
}

/* Overlay & panel — shared.css provides base .overlay / .form-panel styles.
   Only panel slide-in transitions are local since they use the <Transition name="panel"> hook. */
.panel-enter-active { transition: transform 240ms var(--ease-spring); }
.panel-leave-active { transition: transform 180ms var(--ease); }
.panel-enter-from, .panel-leave-to { transform: translateX(100%); }
@media (max-width: 800px) {
  .panel-enter-from, .panel-leave-to { transform: translateY(100%); }
  .panel-enter-active { transition: transform 260ms var(--ease-spring); }
  .panel-leave-active { transition: transform 200ms var(--ease); }
}

/* Local panel padding — slightly wider than the shared.css default */
.panel-header {
  padding: 20px 24px 16px;
}
.panel-body {
  flex: 1; overflow-y: auto; padding: 20px 24px;
  display: flex; flex-direction: column; gap: 14px;
  -webkit-overflow-scrolling: touch;
}
.panel-footer {
  padding: 16px 24px;
}

/* Customer preview card */
.customer-preview {
  background: var(--surface-2); border: 1px solid var(--separator-2);
  border-radius: var(--r-sm); padding: 11px 14px;
  display: flex; flex-direction: column; gap: 4px;
  margin-top: -4px;
}
.cp-name { font-size: 0.90rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
.cp-sub { font-size: 0.72rem; color: var(--text-quarternary); }
.cp-rows { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.cp-row {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 0.72rem; color: var(--text-secondary);
}
.cp-row svg { flex-shrink: 0; color: var(--text-placeholder); }
.cp-terms {
  font-size: 0.65rem; font-weight: 600; color: var(--accent-deep);
  letter-spacing: 0.03em; margin-top: 2px;
}

/* .label-opt modifies .field-label inline — not in shared.css */
.label-opt { font-weight: 400; text-transform: none; letter-spacing: 0; }

.field-group-label {
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.07em;
  text-transform: uppercase; color: var(--text-placeholder);
  border-top: 1px solid var(--separator-2); padding-top: 8px; margin-top: 2px;
}

/* Stock picker */
.stock-empty {
  font-size: 0.82rem; color: var(--text-quarternary); line-height: 1.5;
  padding: 14px 16px; border-radius: var(--r-sm);
  background: var(--surface-2); border: 1px solid var(--separator-2);
}

.stock-list {
  display: flex; flex-direction: column; gap: 0;
  border: 1px solid var(--separator-2); border-radius: var(--r-lg); overflow: hidden;
}
.stock-row {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px;
  border-bottom: 1px solid var(--separator-2);
  background: var(--surface); transition: background var(--t-fast);
}
.stock-row:last-child { border-bottom: none; }
.stock-row--selected { background: var(--accent-tint-2); border-left: 3px solid var(--accent); }
.stock-row--selected:not(:last-child) { border-bottom-color: var(--separator-2); }

.stock-info { flex: 1; min-width: 0; }
.stock-product { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); letter-spacing: -0.02em; margin-bottom: 3px; }
.stock-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.stock-ref { font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-quarternary); }
.stock-sep { color: var(--text-placeholder); font-size: 0.7rem; }
.stock-size { font-family: var(--font-mono); font-size: 0.68rem; font-weight: 600; color: var(--text-primary); }
.stock-avail { font-size: 0.68rem; color: var(--accent-deep); font-weight: 600; }

.stock-controls { display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0; }
.qty-row, .price-row { display: flex; flex-direction: column; gap: 3px; }
.qty-label {
  font-size: 0.60rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--text-quarternary);
}
.qty-input {
  width: 72px; padding: 6px 8px; text-align: right;
  border: 1px solid var(--separator-2); border-radius: var(--r-sm);
  background: var(--surface-2); font-size: 0.85rem;
  font-family: var(--font-mono); color: var(--text-primary);
  transition: border-color var(--t-fast);
}
.qty-input:focus { outline: none; border-color: var(--accent); background: var(--surface); }

/* Order summary */
.order-summary {
  border: 1px solid var(--separator-2); border-radius: var(--r-sm);
  overflow: hidden; background: var(--surface-2);
}
.order-summary-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 9px 14px; font-size: 0.82rem; color: var(--text-secondary);
  border-bottom: 1px solid var(--separator-2);
}
.order-summary-row:last-child { border-bottom: none; }
.order-summary-row--total { font-weight: 700; color: var(--text-primary); background: var(--surface-3); }
.mono { font-family: var(--font-mono); }

/* Dispatch confirm dialog */
.confirm-dialog {
  background: var(--surface); border-radius: var(--r-lg);
  padding: 28px 24px; width: 380px; max-width: 92vw;
  box-shadow: var(--shadow-xl); margin: auto;
  display: flex; flex-direction: column; gap: 10px;
}
.confirm-icon {
  width: 44px; height: 44px; border-radius: var(--r-sm);
  background: rgba(28,126,240,0.10); color: #1C7EF0;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}
.confirm-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
.confirm-sub { font-size: 0.83rem; color: var(--text-quarternary); line-height: 1.5; }
.confirm-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }

.btn-dispatch-confirm {
  padding: 9px 16px; border-radius: var(--r-sm);
  background: linear-gradient(145deg, #4A9EFF, #1C7EF0); color: #fff;
  font-size: 0.85rem; font-weight: 600;
  box-shadow: 0 1px 6px rgba(28,126,240,0.25);
  transition: box-shadow var(--t-fast), opacity var(--t-fast);
}
.btn-dispatch-confirm:hover:not(:disabled) { box-shadow: 0 3px 9px rgba(28,126,240,0.35); }
.btn-dispatch-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
