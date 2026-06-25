<template>
  <div class="log-page">

    <div class="page-header">
      <div>
        <p class="page-eyebrow">Archive</p>
        <h1 class="page-title">Production log</h1>
      </div>
    </div>

    <!-- Batch list -->
    <div v-if="completedBatches.length" class="batch-list">
      <NuxtLink
        v-for="b in completedBatches"
        :key="b.id"
        :to="`/batches/${b.id}`"
        class="log-row"
      >
        <div class="log-row-left">
          <div class="log-batch-id batch-link">{{ b.batchId }}</div>
          <div class="log-product">{{ b.productName }}</div>
          <span v-if="b.status === 'disposed'" class="log-discarded-badge">Discarded</span>
        </div>
        <div class="log-row-mid">
          <template v-if="b.status === 'disposed'">
            <div class="log-discarded-reason">
              <span class="log-stat-label">Reason</span>
              <span class="log-stat-value log-discarded-reason-text">{{ (b as any).disposedReason || '—' }}</span>
            </div>
          </template>
          <template v-else>
          <div class="log-stat">
            <span class="log-stat-label">Cans</span>
            <span class="log-stat-value">{{ goodCans(b) || '—' }}</span>
          </div>
          <div class="log-stat">
            <span class="log-stat-label">Best before</span>
            <span class="log-stat-value mono">{{ b.stageData?.label?.bestBefore ?? '—' }}</span>
          </div>
          <div class="log-stat">
            <span class="log-stat-label">pH</span>
            <span class="log-stat-value mono">{{ b.stageData?.ccp1?.ph != null ? Number(b.stageData.ccp1.ph).toFixed(2) : '—' }}</span>
          </div>
          <div class="log-stat">
            <span class="log-stat-label">OG</span>
            <span class="log-stat-value mono">{{ b.stageData?.pitch?.ogRecorded != null ? Number(b.stageData.pitch.ogRecorded).toFixed(3) : '—' }}</span>
          </div>
          <div class="log-stat">
            <span class="log-stat-label">Dispatched</span>
            <span class="log-stat-value">{{ cansDispatched(b) || '—' }}</span>
          </div>
          <div class="log-stat">
            <span class="log-stat-label">On order</span>
            <span class="log-stat-value">{{ cansOnOrder(b) || '—' }}</span>
          </div>
          <div class="log-stat">
            <span class="log-stat-label">Remaining</span>
            <span class="log-stat-value log-stat-value--bold">{{ cansRemaining(b) > 0 ? cansRemaining(b) : '—' }}</span>
          </div>
          </template>
        </div>
        <div class="log-row-right">
          <span class="log-date">{{ formatDate(b.startDate) }}</span>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" class="log-arrow">
            <path d="M3 6.5h7M7 3.5l3 3-3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </NuxtLink>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="6" y="8" width="28" height="26" rx="3" stroke="currentColor" stroke-width="1.6"/>
          <path d="M12 16h16M12 22h12M12 28h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="empty-title">No completed batches yet</p>
      <p class="empty-sub">Completed and discarded batches appear here.</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { Timestamp } from 'firebase/firestore'
import type { Batch } from '~/types/batch'
import { useOrders } from '~/composables/useOrders'

definePageMeta({ middleware: 'auth' })

const { batches } = useBatches(['complete', 'disposed'])
const { orders } = useOrders()

const completedBatches = computed(() =>
  (batches.value ?? []).slice().sort((a, b) => {
    const at = a.startDate?.toDate?.()?.getTime() ?? 0
    const bt = b.startDate?.toDate?.()?.getTime() ?? 0
    return bt - at
  })
)

function goodCans(batch: Batch): number {
  const runs = batch.stageData?.canning?.canRuns as Array<{ sizeMl: number; qty: number; defect: boolean }> | undefined
  if (!runs?.length) return 0
  return runs.filter(r => !r.defect).reduce((s, r) => s + (r.qty ?? 0), 0)
}

function ordersForBatch(batchId: string) {
  return (orders.value ?? []).filter(o =>
    o.lines.some((line: { batchId: string }) => line.batchId === batchId)
  )
}

function cansDispatched(batch: Batch): number {
  return ordersForBatch(batch.id)
    .filter(o => o.status === 'dispatched')
    .reduce((sum, o) => {
      return sum + o.lines
        .filter((l: { batchId: string; cans: number }) => l.batchId === batch.id)
        .reduce((s: number, l: { cans: number }) => s + l.cans, 0)
    }, 0)
}

function cansOnOrder(batch: Batch): number {
  return ordersForBatch(batch.id)
    .filter(o => o.status === 'confirmed')
    .reduce((sum, o) => {
      return sum + o.lines
        .filter((l: { batchId: string; cans: number }) => l.batchId === batch.id)
        .reduce((s: number, l: { cans: number }) => s + l.cans, 0)
    }, 0)
}

function cansRemaining(batch: Batch): number {
  return goodCans(batch) - cansDispatched(batch) - cansOnOrder(batch)
}

function formatDate(ts: Timestamp | null | undefined): string {
  if (!ts?.toDate) return '—'
  return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.log-page { display: flex; flex-direction: column; gap: 24px; }

/* Batch list */
.batch-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--separator-2);
  border-radius: var(--r-lg);
  overflow: hidden;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.log-row {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--separator-2);
  transition: background var(--t-fast);
  text-decoration: none;
  color: inherit;
}
.log-row:last-child { border-bottom: none; }
.log-row:hover { background: var(--surface-2); }

.log-row-left { width: 200px; flex-shrink: 0; }
.log-batch-id {
  font-family: var(--font-mono);
  font-size: 0.67rem;
  color: var(--text-placeholder);
  letter-spacing: 0.02em;
  margin-bottom: 3px;
}
.log-product {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.log-row-mid {
  flex: 1;
  display: flex;
  gap: 0;
  min-width: 0;
}
.log-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0 16px;
  border-right: 1px solid var(--separator-2);
}
.log-stat:first-child { padding-left: 0; }
.log-stat:last-child  { border-right: none; }
.log-stat-label {
  font-size: 0.60rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-quarternary);
}
.log-stat-value {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
}
.log-stat-value--bold { font-weight: 700; }
.mono { font-family: var(--font-mono); }

/* Right side */
.log-row-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.log-date  { font-size: 0.74rem; color: var(--text-quarternary); }
.log-arrow { color: var(--text-placeholder); flex-shrink: 0; transition: color var(--t-fast), transform var(--t-fast); }
.log-row:hover .log-arrow { color: var(--accent); transform: translateX(2px); }

/* Discarded */
.log-discarded-badge {
  display: inline-block; margin-top: 4px;
  font-size: 0.60rem; font-weight: 700; letter-spacing: 0.05em;
  text-transform: uppercase; padding: 2px 8px; border-radius: 99px;
  background: var(--danger-light); color: var(--danger);
}
.log-discarded-reason {
  display: flex; flex-direction: column; gap: 2px;
  padding: 0 16px; flex: 1;
}
.log-discarded-reason-text {
  font-size: 0.82rem; color: var(--text-secondary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 480px;
}

/* ── Responsive ─────────────────────────────────────── */
@media (max-width: 800px) {
  .log-row { flex-wrap: wrap; gap: 10px; padding: 12px 14px; }
  .log-row-left { width: auto; flex: 1 1 100%; }
  .log-row-mid {
    flex: 1 1 100%;
    flex-wrap: wrap;
    gap: 0;
    border-top: 1px solid var(--separator-2);
    padding-top: 8px;
  }
  .log-stat {
    flex: 1 1 calc(33.33% - 1px);
    padding: 6px 10px;
    border-right: 1px solid var(--separator-2);
    border-bottom: 1px solid var(--separator-2);
  }
  .log-stat:nth-child(3n) { border-right: none; }
  .log-stat:nth-last-child(-n+3) { border-bottom: none; }
  .log-row-right { flex: 1 1 100%; justify-content: space-between; }
  .log-discarded-reason { padding: 8px 0 0; flex: 1 1 100%; }
}

/* Empty state */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 64px 32px; gap: 10px; text-align: center;
  border: 1px dashed var(--separator-2); border-radius: var(--r-lg);
  background: var(--surface);
}
.empty-icon { color: var(--text-placeholder); margin-bottom: 4px; }
.empty-title { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
.empty-sub { font-size: 0.82rem; color: var(--text-quarternary); max-width: 300px; line-height: 1.5; }
</style>
