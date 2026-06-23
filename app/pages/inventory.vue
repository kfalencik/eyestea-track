<template>
  <div class="inventory-page">

    <div class="page-header">
      <div>
        <p class="page-eyebrow">Stock</p>
        <h1 class="page-title">Inventory</h1>
      </div>
    </div>

    <!-- Summary strip -->
    <div v-if="inventoryRows.length" class="summary-strip">
      <div class="summary-stat">
        <div class="summary-val">{{ totalCans }}</div>
        <div class="summary-label">Total cans</div>
      </div>
      <div class="summary-sep" />
      <div class="summary-stat">
        <div class="summary-val">{{ totalRemaining }}</div>
        <div class="summary-label">In stock</div>
      </div>
      <div class="summary-sep" />
      <div class="summary-stat">
        <div class="summary-val">{{ totalOnOrder }}</div>
        <div class="summary-label">On order</div>
      </div>
      <div class="summary-sep" />
      <div class="summary-stat">
        <div class="summary-val">{{ totalDispatched }}</div>
        <div class="summary-label">Dispatched</div>
      </div>
    </div>

    <!-- Inventory table -->
    <div v-if="inventoryRows.length" class="inv-list">
      <div class="inv-header inv-grid">
        <span>Product</span>
        <span>Batch ID</span>
        <span>Size</span>
        <span>Canned</span>
        <span>Produced</span>
        <span>Dispatched</span>
        <span>On order</span>
        <span>Remaining</span>
        <span>ABV</span>
        <span>Best before</span>
      </div>
      <template v-for="row in inventoryRows" :key="row.key">
        <div class="inv-row inv-grid">
          <span class="inv-product">
            <NuxtLink :to="`/batches/${row.batchDocId}`" class="inv-link">{{ row.productName }}</NuxtLink>
          </span>
          <span class="inv-mono">{{ row.batchId }}</span>
          <span class="inv-size">{{ row.sizeMl }} ml</span>
          <span class="inv-date">{{ row.canDate }}</span>
          <span class="inv-mono inv-num">{{ row.cansProduced }}</span>
          <span class="inv-mono inv-num">{{ row.cansDispatched || '—' }}</span>
          <span class="inv-mono inv-num">{{ row.cansOnOrder || '—' }}</span>
          <span class="inv-mono inv-num" :class="row.cansRemaining > 0 ? 'inv-remaining--positive' : row.cansRemaining === 0 ? 'inv-remaining--zero' : ''">
            {{ row.cansRemaining > 0 ? row.cansRemaining : row.cansRemaining === 0 ? 'Sold out' : '—' }}
          </span>
          <span class="inv-mono inv-num">{{ row.abv != null ? row.abv.toFixed(1) + '%' : '—' }}</span>
          <span class="inv-date">{{ row.bestBefore ?? '—' }}</span>
        </div>
      </template>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="4" y="10" width="32" height="22" rx="3" stroke="currentColor" stroke-width="1.6"/>
          <path d="M4 17h32M4 24h32" stroke="currentColor" stroke-width="1.3"/>
          <path d="M13 10V8m14 2V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="empty-title">No inventory yet</p>
      <p class="empty-sub">Batches appear here once the labelling & storage stage is completed.</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { Timestamp } from 'firebase/firestore'
import { useOrders } from '~/composables/useOrders'

definePageMeta({ middleware: 'auth' })

const { batches: allBatches } = useBatches(['complete', 'ready_to_can', 'canning', 'conditioning', 'active'])
const { orders } = useOrders()

interface CanRun { sizeMl: number; qty: number; defect: boolean }

interface InventoryRow {
  key: string
  batchDocId: string
  batchId: string
  productName: string
  sizeMl: number
  cansProduced: number
  cansDispatched: number
  cansOnOrder: number
  cansRemaining: number
  canDate: string
  bestBefore: string | null
  abv: number | null
}

function ordersDispatched(batchDocId: string, sizeMl: number): number {
  return (orders.value ?? [])
    .filter(o => o.status === 'dispatched')
    .reduce((sum: number, o: { lines: Array<{ batchId: string; canSizeMl?: number; cans: number }> }) =>
      sum + o.lines.filter(l => l.batchId === batchDocId && l.canSizeMl === sizeMl).reduce((s, l) => s + l.cans, 0), 0)
}

function ordersOnOrder(batchDocId: string, sizeMl: number): number {
  return (orders.value ?? [])
    .filter(o => o.status === 'confirmed')
    .reduce((sum: number, o: { lines: Array<{ batchId: string; canSizeMl?: number; cans: number }> }) =>
      sum + o.lines.filter(l => l.batchId === batchDocId && l.canSizeMl === sizeMl).reduce((s, l) => s + l.cans, 0), 0)
}

const inventoryRows = computed((): InventoryRow[] => {
  const rows: InventoryRow[] = []

  for (const b of (allBatches.value ?? [])) {
    if (!b.stageData?.label) continue

    const canRuns = (b.stageData?.canning?.canRuns ?? []) as CanRun[]
    const goodRuns = canRuns.filter(r => !r.defect && r.qty > 0)

    const og = b.stageData?.pitch?.ogRecorded ? Number(b.stageData.pitch.ogRecorded) : null
    const fg = b.stageData?.ferment?.fgRecorded ? Number(b.stageData.ferment.fgRecorded) : null
    const abv = og && fg ? Math.round((og - fg) * 131.25 * 100) / 100 : null

    const canDate = formatDate(b.stageData?.canning?.confirmedAt)
    const bestBefore = b.stageData?.label?.bestBefore ?? null

    if (goodRuns.length === 0) {
      rows.push({
        key: b.id,
        batchDocId: b.id,
        batchId: b.batchId,
        productName: b.productName,
        sizeMl: 0,
        cansProduced: 0,
        cansDispatched: 0,
        cansOnOrder: 0,
        cansRemaining: 0,
        canDate,
        bestBefore,
        abv,
      })
      continue
    }

    // One row per can size, orders looked up by exact batchDocId + sizeMl
    const bySize = new Map<number, number>()
    for (const r of goodRuns) {
      bySize.set(r.sizeMl, (bySize.get(r.sizeMl) ?? 0) + r.qty)
    }

    for (const sizeMl of [...bySize.keys()].sort((a, b) => a - b)) {
      const qty = bySize.get(sizeMl)!
      const sizeDispatched = ordersDispatched(b.id, sizeMl)
      const sizeOnOrder = ordersOnOrder(b.id, sizeMl)
      rows.push({
        key: `${b.id}-${sizeMl}`,
        batchDocId: b.id,
        batchId: b.batchId,
        productName: b.productName,
        sizeMl,
        cansProduced: qty,
        cansDispatched: sizeDispatched,
        cansOnOrder: sizeOnOrder,
        cansRemaining: qty - sizeDispatched - sizeOnOrder,
        canDate,
        bestBefore,
        abv,
      })
    }
  }

  return rows.sort((a, b) => (a.canDate < b.canDate ? 1 : -1))
})

const totalCans = computed(() => inventoryRows.value.reduce((s, r) => s + r.cansProduced, 0))
const totalRemaining = computed(() => inventoryRows.value.reduce((s, r) => s + Math.max(0, r.cansRemaining), 0))
const totalOnOrder = computed(() => inventoryRows.value.reduce((s, r) => s + r.cansOnOrder, 0))
const totalDispatched = computed(() => inventoryRows.value.reduce((s, r) => s + r.cansDispatched, 0))

function formatDate(ts: Timestamp | null | undefined): string {
  if (!ts?.toDate) return '—'
  return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.inventory-page { display: flex; flex-direction: column; gap: 24px; }

/* Summary */
.summary-strip {
  display: flex; align-items: center;
  background: #fff; border: 1px solid rgba(60,60,67,0.10);
  border-radius: var(--r-lg); overflow: hidden; align-self: flex-start;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.summary-stat { padding: 14px 24px; display: flex; flex-direction: column; gap: 2px; }
.summary-val { font-size: 1.6rem; font-weight: 700; letter-spacing: -0.04em; color: var(--text-primary); line-height: 1; }
.summary-label { font-size: 0.68rem; color: var(--text-quarternary); }
.summary-sep { width: 1px; align-self: stretch; background: var(--separator-2); }

/* Table */
.inv-list {
  border: 1px solid rgba(60,60,67,0.10);
  border-radius: var(--r-lg); overflow: hidden;
  background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.inv-grid {
  display: grid;
  grid-template-columns: 1.6fr 1.4fr 0.6fr 0.9fr 0.7fr 0.7fr 0.7fr 0.7fr 0.6fr 0.9fr;
  align-items: center;
}
.inv-header {
  padding: 9px 20px;
  background: var(--surface-2); border-bottom: 1px solid var(--separator-2);
  font-size: 0.62rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-quarternary);
}
.inv-row {
  padding: 12px 20px; border-bottom: 1px solid var(--separator-2);
  font-size: 0.83rem; color: var(--text-primary);
}
.inv-row:last-child { border-bottom: none; }
.inv-row:hover { background: var(--surface-2); }

.inv-link {
  font-weight: 600; letter-spacing: -0.02em; color: var(--text-primary);
  text-decoration: none; transition: color var(--t-fast);
}
.inv-link:hover { color: var(--accent); }
.inv-mono { font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-secondary); }
.inv-date { font-size: 0.80rem; color: var(--text-secondary); }
.inv-size { font-family: var(--font-mono); font-size: 0.80rem; font-weight: 600; color: var(--text-primary); }
.inv-num { font-size: 0.83rem; color: var(--text-primary); }
.inv-remaining--positive { font-weight: 700; color: #1A6B38; }
.inv-remaining--zero { color: var(--text-placeholder); }

/* ── Responsive ─────────────────────────────────────── */
@media (max-width: 1024px) {
  .inv-grid {
    grid-template-columns: 1.4fr 1.1fr 0.6fr 0.8fr 0.7fr 0.7fr 0.7fr 0.7fr 0.5fr 0.8fr;
  }
  .inv-header, .inv-row { padding-left: 14px; padding-right: 14px; }
}

@media (max-width: 800px) {
  .summary-strip { min-width: 100%; }
  .summary-stat { padding: 12px 14px; flex: 1; }
  .summary-val { font-size: 1.3rem; }

  /* Switch to card-style rows: hide desktop header, show label/value pairs */
  .inv-header { display: none; }

  .inv-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 12px;
    padding: 14px 16px;
    align-items: start;
  }

  /* Product spans full width as the card title */
  .inv-product {
    grid-column: 1 / -1;
    font-size: 0.92rem;
    font-weight: 700;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--separator-2);
    margin-bottom: 2px;
  }

  /* Each data cell gets a label above it via ::before */
  .inv-row span:not(.inv-product) {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .inv-row span:not(.inv-product)::before {
    font-size: 0.58rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-quarternary);
  }

  /* Assign label text to each column position via nth-child */
  /* Order in DOM: inv-product(1), inv-mono batchId(2), inv-size(3),
     inv-date canDate(4), inv-num produced(5), inv-num dispatched(6),
     inv-num onOrder(7), inv-num remaining(8), inv-num abv(9), inv-date bestBefore(10) */
  .inv-row span:nth-child(2)::before { content: 'Batch ID'; }
  .inv-row span:nth-child(3)::before { content: 'Size'; }
  .inv-row span:nth-child(4)::before { content: 'Canned'; }
  .inv-row span:nth-child(5)::before { content: 'Produced'; }
  .inv-row span:nth-child(6)::before { content: 'Dispatched'; }
  .inv-row span:nth-child(7)::before { content: 'On order'; }
  .inv-row span:nth-child(8)::before { content: 'Remaining'; }
  .inv-row span:nth-child(9)::before { content: 'ABV'; }
  .inv-row span:nth-child(10)::before { content: 'Best before'; }
}

/* Empty */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 64px 32px; gap: 10px; text-align: center;
  border: 1px dashed rgba(60,60,67,0.18); border-radius: var(--r-lg);
  background: #fff;
}
.empty-icon { color: var(--text-placeholder); margin-bottom: 4px; }
.empty-title { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
.empty-sub { font-size: 0.82rem; color: var(--text-quarternary); max-width: 300px; line-height: 1.5; }
</style>
