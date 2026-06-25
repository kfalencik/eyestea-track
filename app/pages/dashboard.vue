<template>
  <div class="dashboard">

    <!-- ── Header ── -->
    <div class="page-header">
      <div>
        <p class="page-eyebrow">{{ todayLabel }}</p>
        <h1 class="page-title">Overview</h1>
      </div>
      <div class="page-actions">
        <button class="btn-new" @click="newBatchOpen = true">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1.5v10M1.5 6.5h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          New batch
        </button>
      </div>
    </div>

    <!-- ── KPI strip ── -->
    <div class="kpi-strip">
      <div class="kpi">
        <div class="kpi-val">{{ activeBatches.length }}</div>
        <div class="kpi-label">Brewing now</div>
      </div>
      <div class="kpi-sep" />
      <div class="kpi">
        <div class="kpi-val" :class="{ 'kpi-val--warn': holdCount > 0 }">{{ holdCount }}</div>
        <div class="kpi-label">On hold</div>
      </div>
      <div class="kpi-sep" />
      <div class="kpi">
        <div class="kpi-val">{{ inventoryRemaining }}</div>
        <div class="kpi-label">Cans in stock</div>
      </div>
      <div class="kpi-sep" />
      <div class="kpi">
        <div class="kpi-val">{{ pendingOrderCount }}</div>
        <div class="kpi-label">Pending orders</div>
      </div>
      <div class="kpi-sep" />
      <div class="kpi">
        <div class="kpi-val">{{ freeSlots }}</div>
        <div class="kpi-label">Fermenters free</div>
      </div>
    </div>

    <!-- ── Two-column body ── -->
    <div class="body-grid">

      <!-- LEFT: active batches + new batch slots -->
      <div class="col-main">

        <div class="section-head">
          <h2 class="section-title">Active batches</h2>
          <NuxtLink to="/log" class="section-link">View all →</NuxtLink>
        </div>

        <div class="batch-list">

          <!-- Active batch rows -->
          <NuxtLink
            v-for="b in activeBatches"
            :key="b.id"
            :to="`/batches/${b.id}`"
            class="batch-row"
            :class="{
              'batch-row--warn': b.status === 'hold',
              'batch-row--ready': b.status === 'ready_to_can',
            }"
          >
            <div class="batch-row-accent" />
            <div class="batch-row-body">
              <div class="batch-row-top">
                <span class="batch-fermenter">F{{ b.fermenter }}</span>
                <span class="batch-status-chip" :class="statusChipClass(b)">{{ statusLabel(b) }}</span>
                <span class="batch-days">Day {{ dayCount(b) }}</span>
                <div class="batch-progress-wrap">
                  <div class="batch-progress-fill" :style="{ width: progressPct(b) + '%' }" :class="b.status === 'hold' ? 'fill--red' : 'fill--green'" />
                </div>
                <span class="batch-pct">{{ progressPct(b) }}%</span>
              </div>
              <div class="batch-row-name">{{ b.productName }}</div>
              <div class="batch-row-meta">
                <span class="batch-id-label">{{ b.batchId }}</span>
                <span class="batch-stage-label">Step {{ b.stage }} of 19</span>
                <span v-if="b.stageData?.pitch?.ogRecorded" class="batch-og">OG {{ Number(b.stageData.pitch.ogRecorded).toFixed(3) }}</span>
                <span v-if="b.status === 'hold'" class="batch-warn-label">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1L10 10H1L5.5 1z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M5.5 4.5v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                  Corrective action needed
                </span>
              </div>
            </div>
            <div class="batch-row-arrow">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 6.5h7M7 3.5l3 3-3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </NuxtLink>

          <!-- Empty fermenter slots -->
          <div
            v-for="slot in emptySlots"
            :key="slot"
            class="batch-row batch-row--empty"
            :class="{ 'batch-row--empty-open': startingSlot === slot }"
          >
            <template v-if="startingSlot !== slot">
              <button class="empty-slot-btn" @click="openStart(slot)">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M7 4h8l2 3H5l2-3z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
                  <rect x="5" y="7" width="12" height="11" rx="2" stroke="currentColor" stroke-width="1.3"/>
                  <path d="M9 12h4M11 10v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
                <div>
                  <div class="empty-slot-label">Fermenter {{ slot }} — free</div>
                  <div class="empty-slot-hint">Tap to start a new batch</div>
                </div>
              </button>
            </template>
            <template v-else>
              <div class="quick-start">
                <div class="qs-header">
                  <span class="qs-title">Fermenter {{ slot }} — new batch</span>
                  <button class="qs-close" @click="startingSlot = null">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
                  </button>
                </div>
                <div class="field">
                  <label class="field-label">Product</label>
                  <select v-model="startForm.selectedProductId" class="field-input" @change="onProductSelect">
                    <option value="">— Type a name below —</option>
                    <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                  <input
                    v-if="!startForm.selectedProductId"
                    v-model="startForm.productName"
                    type="text"
                    class="field-input field-input--mt"
                    placeholder="e.g. Lemon Original"
                  />
                </div>
                <div class="field">
                  <label class="field-label">Brew date</label>
                  <input v-model="startForm.startDate" type="date" class="field-input" />
                </div>
                <div v-if="startError" class="form-error">{{ startError }}</div>
                <button class="btn-submit btn-full" :disabled="!resolvedProductName() || startLoading" @click="submitQuickStart(slot)">
                  {{ startLoading ? 'Starting…' : 'Start brew day →' }}
                </button>
              </div>
            </template>
          </div>

          <!-- All occupied -->
          <div v-if="activeBatches.length === 0 && emptySlots.length === 0" class="batch-row batch-row--empty">
            <span class="empty-slot-label">Both fermenters in use</span>
          </div>
        </div>

      </div>

      <!-- RIGHT: reminders + alerts -->
      <div class="col-side">

        <!-- Alerts -->
        <div v-if="alerts.length" class="side-section">
          <h2 class="section-title">Alerts</h2>
          <div class="alert-list">
            <div v-for="alert in alerts" :key="alert.id" class="alert-item" :class="`alert--${alert.level}`">
              <div class="alert-icon">
                <svg v-if="alert.level === 'warn'" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5L13 12.5H1L7 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M7 5.5v3M7 10v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                <svg v-else-if="alert.level === 'info'" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M7 6.5v4M7 5v-.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 7l2 2 3-3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div class="alert-body">
                <div class="alert-title">{{ alert.title }}</div>
                <div class="alert-sub">{{ alert.sub }}</div>
              </div>
              <NuxtLink v-if="alert.href" :to="alert.href" class="alert-link">→</NuxtLink>
            </div>
          </div>
        </div>

        <!-- Compliance calendar -->
        <div class="side-section">
          <h2 class="section-title">Compliance</h2>
          <div class="reminders-list">
            <div
              v-for="r in reminders"
              :key="r.id"
              class="reminder-item"
              :class="`reminder--${r.urgency}`"
            >
              <div class="reminder-date-col">
                <div class="reminder-day">{{ r.dayLabel }}</div>
                <div class="reminder-month">{{ r.monthLabel }}</div>
              </div>
              <div class="reminder-body">
                <div class="reminder-title">{{ r.title }}</div>
                <div class="reminder-sub">{{ r.sub }}</div>
              </div>
              <div class="reminder-badge" :class="`badge--${r.urgency}`">{{ r.daysLabel }}</div>
            </div>
          </div>
        </div>

        <!-- Low stock -->
        <div v-if="lowStockItems.length" class="side-section">
          <h2 class="section-title">Low stock</h2>
          <div class="stock-warn-list">
            <NuxtLink
              v-for="item in lowStockItems"
              :key="item.ingredientId"
              to="/intake"
              class="stock-warn-item"
            >
              <div class="stock-warn-name">{{ item.name }}</div>
              <div class="stock-warn-qty">
                <span class="stock-warn-val">{{ formatQty(item.currentStock) }}</span>
                <span class="stock-warn-unit">{{ item.unit }}</span>
                <span class="stock-warn-threshold">/ {{ item.reorderThresholdQty }} {{ item.unit }} min</span>
              </div>
              <div class="stock-warn-bar">
                <div class="stock-warn-fill" :style="{ width: stockBarPct(item) + '%' }" />
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Pending orders -->
        <div v-if="pendingOrders.length" class="side-section">
          <h2 class="section-title">Pending orders</h2>
          <div class="order-list">
            <NuxtLink
              v-for="o in pendingOrders"
              :key="o.id"
              to="/sales"
              class="order-item"
            >
              <div class="order-ref">{{ o.orderRef }}</div>
              <div class="order-customer">{{ o.customer }}</div>
              <div class="order-cans">{{ totalCans(o) }} cans</div>
              <div class="order-val">£{{ o.total.toFixed(2) }}</div>
            </NuxtLink>
          </div>
        </div>

      </div>
    </div>

    <!-- ── New batch drawer (reused from layout) ── -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="newBatchOpen" class="overlay" @click.self="newBatchOpen = false">
          <Transition name="panel">
            <div v-if="newBatchOpen" class="form-panel">
              <div class="panel-header">
                <div>
                  <p class="panel-eyebrow">Brewing</p>
                  <h2 class="panel-title">New batch</h2>
                </div>
                <button class="panel-close" @click="newBatchOpen = false">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
              </div>
              <div class="panel-body">
                <div class="field">
                  <label class="field-label">Product</label>
                  <select v-model="newBatchForm.selectedProductId" class="field-input" @change="resolveNewBatchProduct">
                    <option value="">— Type a name —</option>
                    <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                  <input
                    v-if="!newBatchForm.selectedProductId"
                    v-model="newBatchForm.productName"
                    type="text"
                    class="field-input field-input--mt"
                    placeholder="e.g. Lemon Original"
                  />
                </div>
                <div class="field">
                  <label class="field-label">Fermenter</label>
                  <div class="radio-group">
                    <label class="radio-option" :class="{ selected: newBatchFermenter === 'A', disabled: fermenterAInUse }" style="flex:1">
                      <input v-model="newBatchFermenter" type="radio" value="A" :disabled="fermenterAInUse" />
                      Fermenter A{{ fermenterAInUse ? ' (in use)' : '' }}
                    </label>
                    <label class="radio-option" :class="{ selected: newBatchFermenter === 'B', disabled: fermenterBInUse }" style="flex:1">
                      <input v-model="newBatchFermenter" type="radio" value="B" :disabled="fermenterBInUse" />
                      Fermenter B{{ fermenterBInUse ? ' (in use)' : '' }}
                    </label>
                  </div>
                </div>
                <div class="field">
                  <label class="field-label">Brew date</label>
                  <input v-model="newBatchForm.startDate" type="date" class="field-input" />
                </div>
              </div>
              <div class="panel-footer">
                <button class="btn-cancel" @click="newBatchOpen = false">Cancel</button>
                <button class="btn-submit" :disabled="!resolvedNewBatchName || newBatchLoading" @click="submitNewBatch">
                  {{ newBatchLoading ? 'Creating…' : 'Start brew day' }}
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
import { STAGE_MAP } from '~/types/batch'
import type { Batch, BatchStatus } from '~/types/batch'
import type { Order } from '~/types/order'
import { useProducts } from '~/composables/useProducts'
import { useOrders } from '~/composables/useOrders'
import { useIngredients, useAllIntakes, useAllUsages, useAllIntakesLoader, computeStock } from '~/composables/useIngredients'
import type { IngredientStock } from '~/types/ingredient'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const uiStore = useUiStore()

const { batches: activeBatchList } = useActiveBatches()
const { batches: completedBatches } = useBatches(['complete'])
const { products } = useProducts()
const { orders } = useOrders()
const { ingredients } = useIngredients()
useAllIntakesLoader()
const { allIntakes } = useAllIntakes()
const { allUsages } = useAllUsages()

// ── Batches ─────────────────────────────────────────────────
const activeBatches = computed(() =>
  (activeBatchList.value ?? []).slice().sort((a, b) => {
    const order: Record<BatchStatus, number> = {
      hold: 0, ready_to_can: 1, canning: 2, active: 3, conditioning: 4, complete: 5, disposed: 6
    }
    return (order[a.status] ?? 9) - (order[b.status] ?? 9)
  })
)
const holdCount = computed(() => activeBatches.value.filter(b => b.status === 'hold').length)
const usedFermenters = computed(() => new Set(activeBatches.value.map(b => b.fermenter)))
const freeSlots = computed(() => ['A', 'B'].filter(f => !usedFermenters.value.has(f)).length)
const emptySlots = computed(() => ['A', 'B'].filter(f => !usedFermenters.value.has(f)))
const fermenterAInUse = computed(() => usedFermenters.value.has('A'))
const fermenterBInUse = computed(() => usedFermenters.value.has('B'))

function dayCount(b: Batch) {
  const s = b.startDate?.toDate?.()
  return s ? Math.floor((Date.now() - s.getTime()) / 86400000) : 0
}
function progressPct(b: Batch) { return Math.round((b.stage / 18) * 100) }
function statusLabel(b: Batch): string {
  if (b.status === 'hold') return 'On hold'
  if (b.status === 'disposed') return 'Disposed'
  if (b.status === 'complete') return 'Complete'
  if (b.status === 'ready_to_can') return 'Ready to can'
  // For active/canning/conditioning — show the actual current stage name
  if (b.stage === 0) return 'Not started'
  return STAGE_MAP.find(s => s.n === b.stage)?.label ?? 'In progress'
}
function statusChipClass(b: Batch): string {
  if (b.status === 'hold') return 'chip--red'
  if (b.status === 'disposed') return 'chip--red'
  if (b.status === 'complete') return 'chip--green'
  if (b.status === 'ready_to_can') return 'chip--blue'
  if (b.status === 'canning') return 'chip--green'
  if (b.status === 'conditioning') return 'chip--amber'
  // active
  if (b.stage === 0) return 'chip--amber'
  return 'chip--green'
}

// ── Inventory ────────────────────────────────────────────────
const allOrders = computed(() => orders.value ?? [])
const inventoryRemaining = computed(() => {
  const allComplete = completedBatches.value ?? []
  return allComplete
    .filter(b => b.stageData?.label != null)
    .reduce((total, b) => {
      const produced = b.stageData?.canning?.cansProduced ?? 0
      const dispatched = allOrders.value
        .filter(o => o.status === 'dispatched')
        .reduce((s, o) => s + o.lines.filter(l => l.batchId === b.id).reduce((ss, l) => ss + l.cans, 0), 0)
      const onOrder = allOrders.value
        .filter(o => o.status === 'confirmed')
        .reduce((s, o) => s + o.lines.filter(l => l.batchId === b.id).reduce((ss, l) => ss + l.cans, 0), 0)
      return total + Math.max(0, produced - dispatched - onOrder)
    }, 0)
})

// ── Orders ───────────────────────────────────────────────────
const pendingOrders = computed(() =>
  allOrders.value.filter(o => o.status === 'confirmed').slice(0, 5)
)
const pendingOrderCount = computed(() => allOrders.value.filter(o => o.status === 'confirmed').length)
function totalCans(o: Order) { return o.lines.reduce((s, l) => s + l.cans, 0) }

// ── Stock ────────────────────────────────────────────────────
const stockItems = computed(() => computeStock(ingredients.value, allIntakes.value, allUsages.value))
const lowStockItems = computed<IngredientStock[]>(() =>
  stockItems.value.filter(s => s.isLow && s.reorderThresholdQty > 0).slice(0, 6)
)
function formatQty(n: number) { return n % 1 === 0 ? String(n) : n.toFixed(2) }
function stockBarPct(item: IngredientStock) {
  if (item.totalReceived === 0 || item.reorderThresholdQty === 0) return 0
  return Math.min(100, Math.max(2, (item.currentStock / item.reorderThresholdQty) * 100))
}

// ── Date helpers ─────────────────────────────────────────────
const today = new Date()
const todayLabel = computed(() =>
  today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
)

// ── Compliance reminders ─────────────────────────────────────
interface Reminder {
  id: string
  title: string
  sub: string
  due: Date
  dayLabel: string
  monthLabel: string
  daysLabel: string
  urgency: 'overdue' | 'urgent' | 'soon' | 'ok'
}

const reminders = computed<Reminder[]>(() => {
  const now = today
  const upcoming: Array<{ id: string; title: string; sub: string; due: Date }> = []

  // Alcohol duty — 1st of each month, covering previous month's production
  // Find the next (or current) 1st that hasn't passed
  {
    const d = new Date(now.getFullYear(), now.getMonth(), 1)
    // If we're past the 1st, next one is next month
    const due = now.getDate() > 1 ? new Date(now.getFullYear(), now.getMonth() + 1, 1) : d
    const periodMonth = new Date(due.getFullYear(), due.getMonth() - 1, 1)
      .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    upcoming.push({
      id: `duty-${due.getFullYear()}-${due.getMonth()}`,
      title: 'Alcohol Duty return',
      sub: `For ${periodMonth} production`,
      due,
    })
  }

  // VAT — 7th of June, Sept, Dec, March (quarters from June)
  const vatDueMonths = [5, 8, 11, 2] // 0-indexed: June=5, Sept=8, Dec=11, Mar=2
  for (let offset = 0; offset <= 12; offset++) {
    const checkDate = new Date(now.getFullYear(), now.getMonth() + offset, 7)
    if (vatDueMonths.includes(checkDate.getMonth())) {
      if (checkDate >= now) {
        // Quarter covers the 3 months ending the month before this due date
        const quarterEndMonth = new Date(checkDate.getFullYear(), checkDate.getMonth() - 1, 1)
          .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
        upcoming.push({
          id: `vat-${checkDate.getFullYear()}-${checkDate.getMonth()}`,
          title: 'VAT return & payment',
          sub: `Quarter ending ${quarterEndMonth}`,
          due: checkDate,
        })
        break
      }
    }
  }

  // Annual accounts — 9 months after financial year end (assume Apr year end = Jan due)
  const annualDue = new Date(now.getFullYear(), 0, 31) // Jan 31
  if (annualDue < now) annualDue.setFullYear(annualDue.getFullYear() + 1)
  upcoming.push({
    id: `accounts-${annualDue.getFullYear()}`,
    title: 'Annual accounts filing',
    sub: 'Companies House submission',
    due: annualDue,
  })

  // Corporation tax — 9 months + 1 day after year end (assume Apr year end = Jan due)
  const ctDue = new Date(now.getFullYear(), 0, 31)
  if (ctDue < now) ctDue.setFullYear(ctDue.getFullYear() + 1)
  upcoming.push({
    id: `ct-${ctDue.getFullYear()}`,
    title: 'Corporation tax payment',
    sub: 'HMRC payment deadline',
    due: new Date(ctDue.getFullYear(), 8, 1), // Sept 1 approx
  })

  return upcoming
    .sort((a, b) => a.due.getTime() - b.due.getTime())
    .slice(0, 5)
    .map(r => {
      const diffMs = r.due.getTime() - now.getTime()
      const diffDays = Math.ceil(diffMs / 86400000)
      const urgency: Reminder['urgency'] =
        diffDays < 0 ? 'overdue' :
        diffDays <= 7 ? 'urgent' :
        diffDays <= 21 ? 'soon' : 'ok'
      const daysLabel =
        diffDays < 0 ? `${Math.abs(diffDays)}d overdue` :
        diffDays === 0 ? 'Today' :
        diffDays <= 7 ? `${diffDays}d` :
        diffDays <= 30 ? `${diffDays}d` :
        `${Math.ceil(diffDays / 7)}w`
      return {
        ...r,
        dayLabel: r.due.getDate().toString(),
        monthLabel: r.due.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
        daysLabel,
        urgency,
      }
    })
})

// ── Alerts ───────────────────────────────────────────────────
interface Alert {
  id: string
  level: 'warn' | 'info' | 'ok'
  title: string
  sub: string
  href?: string
}

const alerts = computed<Alert[]>(() => {
  const list: Alert[] = []

  // Batches on hold
  const onHold = activeBatches.value.filter(b => b.status === 'hold')
  for (const b of onHold) {
    list.push({
      id: `hold-${b.id}`,
      level: 'warn',
      title: `${b.productName} — on hold`,
      sub: `${b.batchId} needs a corrective action`,
      href: `/batches/${b.id}`,
    })
  }

  // Batches ready to can
  const readyCan = activeBatches.value.filter(b => b.status === 'ready_to_can')
  for (const b of readyCan) {
    list.push({
      id: `ready-${b.id}`,
      level: 'info',
      title: `${b.productName} — ready to can`,
      sub: `${b.batchId} · Day ${dayCount(b)}`,
      href: `/batches/${b.id}`,
    })
  }

  // Low stock
  if (lowStockItems.value.length > 0) {
    list.push({
      id: 'low-stock',
      level: 'warn',
      title: `${lowStockItems.value.length} ingredient${lowStockItems.value.length > 1 ? 's' : ''} low`,
      sub: lowStockItems.value.map(i => i.name).join(', '),
      href: '/intake',
    })
  }

  // Overdue compliance
  const overdue = reminders.value.filter(r => r.urgency === 'overdue')
  for (const r of overdue) {
    list.push({ id: `comp-${r.id}`, level: 'warn', title: `${r.title} overdue`, sub: r.sub })
  }

  return list
})

// ── Quick start (inline) ─────────────────────────────────────
const startingSlot = ref<string | null>(null)
const startLoading = ref(false)
const startError = ref<string | null>(null)
const startForm = reactive({ productName: '', selectedProductId: '', startDate: today.toISOString().slice(0, 10) })

function openStart(slot: string) {
  startingSlot.value = slot
  startForm.productName = ''
  startForm.selectedProductId = ''
  startForm.startDate = today.toISOString().slice(0, 10)
  startError.value = null
}
function onProductSelect() {
  const p = products.value.find(p => p.id === startForm.selectedProductId)
  if (p) startForm.productName = p.name
}
function resolvedProductName() {
  if (startForm.selectedProductId) return products.value.find(p => p.id === startForm.selectedProductId)?.name ?? ''
  return startForm.productName
}
async function submitQuickStart(slot: string) {
  const name = resolvedProductName()
  if (!name || !authStore.user) return
  startLoading.value = true
  startError.value = null
  try {
    const id = await createBatch({ productName: name, fermenter: slot as 'A' | 'B', userId: authStore.user.uid, startDate: new Date(startForm.startDate) })
    uiStore.toast(`${name} — brew day started`, 'ok')
    await navigateTo(`/batches/${id}`)
  } catch {
    startError.value = 'Failed to create. Please try again.'
    startLoading.value = false
  }
}

// ── New batch drawer ─────────────────────────────────────────
const newBatchOpen = ref(false)
const newBatchLoading = ref(false)
const newBatchFermenter = ref<'A' | 'B'>('A')
const newBatchForm = reactive({ productName: '', selectedProductId: '', startDate: today.toISOString().slice(0, 10) })
const resolvedNewBatchName = computed(() => {
  if (newBatchForm.selectedProductId) return products.value.find(p => p.id === newBatchForm.selectedProductId)?.name ?? ''
  return newBatchForm.productName
})
function resolveNewBatchProduct() {
  const p = products.value.find(p => p.id === newBatchForm.selectedProductId)
  if (p) newBatchForm.productName = p.name
}
async function submitNewBatch() {
  if (!resolvedNewBatchName.value || !authStore.user) return
  newBatchLoading.value = true
  try {
    const id = await createBatch({ productName: resolvedNewBatchName.value, fermenter: newBatchFermenter.value, userId: authStore.user.uid, startDate: new Date(newBatchForm.startDate) })
    uiStore.toast(`${resolvedNewBatchName.value} — brew day started`, 'ok')
    newBatchOpen.value = false
    await navigateTo(`/batches/${id}`)
  } catch {
    uiStore.toast('Failed to create batch', 'error')
    newBatchLoading.value = false
  }
}
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 24px; }

/* ── KPI strip ─────────────────────────────────────── */
.kpi-strip {
  display: flex;
  align-items: stretch;
  background: var(--surface);
  border: 1px solid var(--separator-2);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-sm);
  overflow-x: auto;
  flex-wrap: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.kpi-strip::-webkit-scrollbar { display: none; }
.kpi {
  padding: 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 90px;
}
.kpi-val {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.06em;
  color: var(--text-primary);
  line-height: 1;
}
.kpi-val--warn { color: var(--red); }
.kpi-label {
  font-size: 0.64rem;
  font-weight: 500;
  color: var(--text-quarternary);
  letter-spacing: 0.02em;
  white-space: nowrap;
  text-transform: uppercase;
}
.kpi-sep { width: 1px; align-self: stretch; background: var(--separator-2); flex-shrink: 0; }

/* ── Body grid ─────────────────────────────────────── */
.body-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: start;
}

/* ── Columns ───────────────────────────────────────── */
.col-main, .col-side { display: flex; flex-direction: column; gap: 14px; }
.side-section { display: flex; flex-direction: column; gap: 8px; }

/* ── Batch list ────────────────────────────────────── */
.batch-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--separator-2);
  border-radius: var(--r-lg);
  overflow: hidden;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.batch-row {
  display: flex;
  align-items: center;
  gap: 0;
  border-bottom: 1px solid var(--separator-2);
  text-decoration: none;
  color: inherit;
  transition: background var(--t-fast);
  position: relative;
  overflow: hidden;
}
.batch-row:last-child { border-bottom: none; }
.batch-row:hover { background: var(--surface-2); }
.batch-row--warn  { background: rgba(255,59,48,0.025); }
.batch-row--warn:hover  { background: rgba(255,59,48,0.055); }
.batch-row--ready { background: rgba(48,168,90,0.025); }
.batch-row--ready:hover { background: rgba(48,168,90,0.055); }

.batch-row-accent {
  width: 4px;
  align-self: stretch;
  flex-shrink: 0;
  background: linear-gradient(180deg, #3FD072, #25A04E);
}
.batch-row--warn  .batch-row-accent { background: linear-gradient(180deg, #FF6B6B, #FF3B30); }
.batch-row--ready .batch-row-accent { background: linear-gradient(180deg, #4A9EFF, #1C7EF0); }
.batch-row--empty .batch-row-accent { background: var(--separator-2); }

.batch-row-body { flex: 1; padding: 15px 16px; min-width: 0; }
.batch-row-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 7px;
  flex-wrap: wrap;
}

.batch-fermenter {
  font-family: var(--font-mono);
  font-size: 0.64rem;
  font-weight: 700;
  background: var(--surface-3);
  color: var(--text-secondary);
  padding: 2px 7px;
  border-radius: 99px;
  flex-shrink: 0;
  letter-spacing: 0.01em;
}
.batch-status-chip {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  padding: 2px 8px;
  border-radius: 99px;
  flex-shrink: 0;
}
.chip--green { background: rgba(63,208,114,0.13); color: var(--accent-deep); }
.chip--amber { background: rgba(245,158,11,0.12); color: #92400E; }
.chip--blue  { background: rgba(28,126,240,0.10); color: var(--blue-deep); }
.chip--red   { background: rgba(255,59,48,0.10);  color: var(--red-deep); }

.batch-days { font-size: 0.64rem; color: var(--text-placeholder); flex-shrink: 0; }

.batch-progress-wrap {
  flex: 1;
  height: 3px;
  background: var(--surface-3);
  border-radius: 99px;
  overflow: hidden;
  min-width: 40px;
}
.batch-progress-fill { height: 100%; border-radius: 99px; transition: width 0.7s var(--ease); }
.fill--green { background: linear-gradient(90deg, #3FD072, #25A04E); }
.fill--red   { background: linear-gradient(90deg, #FF6B6B, #FF3B30); }
.batch-pct {
  font-family: var(--font-mono);
  font-size: 0.60rem;
  color: var(--text-placeholder);
  flex-shrink: 0;
}

.batch-row-name {
  font-size: 0.94rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.batch-row-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  flex-wrap: wrap;
}
.batch-id-label    { font-family: var(--font-mono); font-size: 0.64rem; color: var(--text-placeholder); }
.batch-stage-label { font-size: 0.70rem; color: var(--text-tertiary); }
.batch-og          { font-family: var(--font-mono); font-size: 0.64rem; color: var(--text-quarternary); }
.batch-warn-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.64rem;
  font-weight: 600;
  color: var(--red);
}

.batch-row-arrow { padding: 0 14px; color: var(--text-placeholder); flex-shrink: 0; transition: color var(--t-fast), transform var(--t-fast); }
.batch-row:hover .batch-row-arrow { color: var(--accent); transform: translateX(2px); }

/* ── Empty slots ───────────────────────────────────── */
.batch-row--empty { cursor: default; }
.batch-row--empty-open { min-height: 0; }
.empty-slot-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 20px 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-placeholder);
  transition: color var(--t-fast), background var(--t-fast);
  touch-action: manipulation;
}
.empty-slot-btn:hover { color: var(--accent); background: var(--accent-tint-2); }
.empty-slot-label { font-size: 0.84rem; font-weight: 600; color: inherit; letter-spacing: -0.01em; }
.empty-slot-hint  { font-size: 0.70rem; margin-top: 2px; color: inherit; opacity: 0.65; }

.quick-start { padding: 16px; display: flex; flex-direction: column; gap: 12px; width: 100%; }
.qs-header   { display: flex; align-items: center; justify-content: space-between; }
.qs-title    { font-size: 0.82rem; font-weight: 700; color: var(--text-primary); }
.qs-close {
  width: 26px; height: 26px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-quarternary);
  transition: background var(--t-fast), color var(--t-fast);
}
.qs-close:hover { background: var(--surface-3); color: var(--text-primary); }

/* ── Alerts ────────────────────────────────────────── */
.alert-list { display: flex; flex-direction: column; gap: 6px; }
.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 11px 13px;
  border-radius: var(--r-md);
  border: 1px solid transparent;
}
.alert--warn { background: rgba(255,59,48,0.05);   border-color: rgba(255,59,48,0.14); }
.alert--info { background: rgba(28,126,240,0.05);  border-color: rgba(28,126,240,0.14); }
.alert--ok   { background: rgba(63,208,114,0.05);  border-color: rgba(63,208,114,0.14); }

.alert-icon { flex-shrink: 0; margin-top: 1px; }
.alert--warn .alert-icon { color: var(--red); }
.alert--info .alert-icon { color: var(--blue); }
.alert--ok   .alert-icon { color: var(--accent); }

.alert-body  { flex: 1; min-width: 0; }
.alert-title { font-size: 0.78rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.01em; }
.alert-sub   { font-size: 0.68rem; color: var(--text-quarternary); margin-top: 2px; }
.alert-link  {
  font-size: 0.78rem; font-weight: 600; color: var(--accent);
  flex-shrink: 0; padding: 2px 4px;
  transition: color var(--t-fast);
}
.alert-link:hover { color: var(--accent-deep); }

/* ── Reminders ─────────────────────────────────────── */
.reminders-list {
  background: var(--surface);
  border: 1px solid var(--separator-2);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.reminder-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-bottom: 1px solid var(--separator-2);
  transition: background var(--t-fast);
}
.reminder-item:last-child { border-bottom: none; }
.reminder-item:hover { background: var(--surface-2); }

.reminder-date-col {
  width: 38px;
  flex-shrink: 0;
  text-align: center;
  border-radius: var(--r-xs);
  padding: 5px 3px;
  background: var(--surface-2);
}
.reminder-day   {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--text-primary);
  line-height: 1;
}
.reminder-month {
  font-size: 0.55rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-quarternary);
  margin-top: 2px;
}
.reminder--overdue .reminder-date-col { background: rgba(255,59,48,0.08); }
.reminder--overdue .reminder-day      { color: var(--red); }
.reminder--urgent  .reminder-date-col { background: rgba(255,149,64,0.10); }
.reminder--urgent  .reminder-day      { color: #CC6600; }

.reminder-body  { flex: 1; min-width: 0; }
.reminder-title { font-size: 0.78rem; font-weight: 600; color: var(--text-primary); letter-spacing: -0.01em; }
.reminder-sub   { font-size: 0.66rem; color: var(--text-quarternary); margin-top: 1px; }

.reminder-badge {
  flex-shrink: 0;
  font-size: 0.60rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 3px 8px;
  border-radius: 99px;
}
.badge--overdue { background: rgba(255,59,48,0.10);   color: var(--red-deep); }
.badge--urgent  { background: rgba(255,149,64,0.12);  color: #8B4A00; }
.badge--soon    { background: rgba(255,214,10,0.12);  color: #6B4C00; }
.badge--ok      { background: var(--surface-2); color: var(--text-quarternary); }

/* ── Low stock ─────────────────────────────────────── */
.stock-warn-list {
  background: var(--surface);
  border: 1px solid var(--separator-2);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.stock-warn-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 11px 14px;
  border-bottom: 1px solid var(--separator-2);
  text-decoration: none;
  color: inherit;
  transition: background var(--t-fast);
}
.stock-warn-item:last-child { border-bottom: none; }
.stock-warn-item:hover { background: var(--surface-2); }
.stock-warn-name { font-size: 0.78rem; font-weight: 600; color: var(--text-primary); letter-spacing: -0.01em; }
.stock-warn-qty { display: flex; align-items: baseline; gap: 3px; }
.stock-warn-val       { font-family: var(--font-mono); font-size: 0.88rem; font-weight: 700; color: var(--red); }
.stock-warn-unit      { font-size: 0.68rem; color: var(--text-quarternary); }
.stock-warn-threshold { font-size: 0.65rem; color: var(--text-placeholder); margin-left: 4px; }
.stock-warn-bar  { height: 3px; background: var(--surface-3); border-radius: 99px; overflow: hidden; }
.stock-warn-fill { height: 100%; background: var(--red); border-radius: 99px; max-width: 100%; }

/* ── Pending orders ────────────────────────────────── */
.order-list {
  background: var(--surface);
  border: 1px solid var(--separator-2);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.order-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-bottom: 1px solid var(--separator-2);
  text-decoration: none;
  color: inherit;
  transition: background var(--t-fast);
}
.order-item:last-child { border-bottom: none; }
.order-item:hover { background: var(--surface-2); }
.order-ref      { font-family: var(--font-mono); font-size: 0.64rem; color: var(--text-placeholder); }
.order-customer { font-size: 0.78rem; font-weight: 600; color: var(--text-primary); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.order-cans     { font-size: 0.70rem; color: var(--text-quarternary); white-space: nowrap; }
.order-val      { font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700; color: var(--accent-deep); white-space: nowrap; }

/* ── Responsive ────────────────────────────────────── */
@media (max-width: 1024px) {
  .body-grid { grid-template-columns: 1fr 260px; gap: 16px; }
  .kpi { padding: 16px 18px; }
}

@media (max-width: 800px) {
  .dashboard { gap: 20px; }
  .kpi { padding: 14px 16px; min-width: 90px; flex: 0 0 auto; }
  .kpi-sep { display: none; }
  .kpi-val { font-size: 1.7rem; }

  .body-grid { grid-template-columns: 1fr; gap: 20px; }
  .col-side { order: -1; }

  .batch-row-body { padding: 14px 12px; }
  .batch-row-arrow { padding: 0 12px; }
}

.field-input--mt { margin-top: 6px; }
</style>
