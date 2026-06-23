<template>
  <article class="card" :class="{ 'card--warn': isWarn }">
    <!-- Accent bar -->
    <div class="accent-bar" />

    <!-- Head -->
    <div class="card-head">
      <div class="head-row">
        <span class="chip chip--fermenter">F{{ batch.fermenter }}</span>
        <span class="chip" :class="statusChipClass">{{ statusLabel }}</span>
        <div class="progress-pill">
          <div class="progress-fill" :style="{ width: progressPct + '%' }" />
        </div>
        <span class="pct-label">{{ progressPct }}%</span>
      </div>
      <h3 class="batch-name">{{ batch.productName }}</h3>
      <p class="batch-id">{{ batch.batchId }}</p>
    </div>

    <!-- Metrics row -->
    <div class="metrics">
      <div class="metric">
        <span class="metric-v">{{ dayCount }}</span>
        <span class="metric-u">day{{ dayCount !== 1 ? 's' : '' }}</span>
      </div>
      <div class="metric-sep" />
      <div class="metric">
        <span class="metric-v">{{ currentStage?.label ?? '—' }}</span>
        <span class="metric-u">stage</span>
      </div>
      <div v-if="ogDisplay" class="metric-sep" />
      <div v-if="ogDisplay" class="metric">
        <span class="metric-v">{{ ogDisplay }}</span>
        <span class="metric-u">OG</span>
      </div>
    </div>

    <!-- CCPs -->
    <div class="ccps">
      <CcpRow ccp="CCP1" :batch="batch" />
      <CcpRow ccp="CCP2" :batch="batch" />
      <CcpRow v-if="batch.stage >= 14" ccp="CCP3" :batch="batch" />
      <CcpRow v-if="batch.stage >= 15" ccp="CCP4" :batch="batch" />
    </div>

    <!-- Footer -->
    <div class="card-foot">
      <p v-if="isWarn" class="foot-alert">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1L11 10H1L6 1z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
          <path d="M6 5v2.5M6 9v.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        Corrective action needed
      </p>
      <p v-else class="foot-note">{{ batch.notes || 'No notes' }}</p>
      <NuxtLink :to="`/batches/${batch.id}`" class="btn-open" :class="isWarn ? 'btn-open--warn' : ''">
        {{ actionLabel }}
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M2 5.5h7M6 3l2.5 2.5L6 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Batch } from '~/types/batch'
import { STAGE_MAP } from '~/types/batch'

const props = defineProps<{ batch: Batch }>()

const isWarn       = computed(() => props.batch.status === 'hold' || props.batch.status === 'disposed')
const dayCount     = computed(() => {
  const s = props.batch.startDate?.toDate()
  return s ? Math.floor((Date.now() - s.getTime()) / 86400000) : 0
})
const progressPct  = computed(() => Math.round((props.batch.stage / 18) * 100))
const ogDisplay    = computed(() => {
  const og = props.batch.stageData?.pitch?.ogRecorded
  return og ? Number(og).toFixed(3) : null
})
const currentStage = computed(() => STAGE_MAP.find(s => s.n === props.batch.stage))

const statusLabel = computed(() => ({
  active: 'Fermenting', conditioning: 'Conditioning',
  ready_to_can: 'Ready to can', canning: 'Canning',
  complete: 'Complete', hold: 'On hold', disposed: 'Disposed',
}[props.batch.status] ?? props.batch.status))

const statusChipClass = computed(() => ({
  active: 'chip--green', conditioning: 'chip--amber',
  ready_to_can: 'chip--green', canning: 'chip--green',
  complete: 'chip--green',
  hold: 'chip--red', disposed: 'chip--red',
}[props.batch.status] ?? ''))

const actionLabel = computed(() => ({
  ready_to_can: 'Start canning',
  hold: 'View & correct',
  complete: 'View record',
}[props.batch.status] ?? 'Open batch'))
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: var(--r-lg);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 1px rgba(0,0,0,0.03);
  border: 1px solid rgba(60,60,67,0.10);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform var(--t-base) var(--ease-spring), box-shadow var(--t-base) var(--ease);
}
.card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.05); }
.card--warn { border-color: rgba(239,68,68,0.25); box-shadow: var(--shadow-sm), 0 0 0 1px rgba(239,68,68,0.15); }

/* Accent bar */
.accent-bar {
  height: 3px;
  background: linear-gradient(90deg, #4CD97B, #28A852);
}
.card--warn .accent-bar {
  background: linear-gradient(90deg, #FF6B6B, #E53935);
}

/* Head */
.card-head { padding: 18px 18px 14px; border-bottom: 1px solid var(--separator-2); }
.head-row {
  display: flex; align-items: center; gap: 6px;
  margin-bottom: 12px; flex-wrap: wrap;
}

/* Progress pill */
.progress-pill {
  flex: 1; height: 4px;
  background: var(--surface-3);
  border-radius: 99px;
  overflow: hidden;
  min-width: 40px;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent) 0%, #00E676 100%);
  border-radius: 99px;
  transition: width 0.8s var(--ease);
  min-width: 4px;
}
.card--warn .progress-fill { background: linear-gradient(90deg, var(--red) 0%, #FF8A80 100%); }

.pct-label {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-quarternary);
}

/* Chips */
.chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.62rem; font-weight: 600;
  letter-spacing: -0.01em;
  padding: 3px 9px; border-radius: 99px;
  background: var(--surface-2); color: var(--text-tertiary);
}
.chip--fermenter { background: var(--surface-3); color: var(--text-secondary); font-family: var(--font-mono); }
.chip--green { background: rgba(76,217,123,0.12); color: #1A6B38; }
.chip--amber { background: rgba(245,158,11,0.12); color: #92400E; }
.chip--red   { background: rgba(229,57,53,0.10);  color: #C62828; }

.batch-name {
  font-size: 1.05rem; font-weight: 700;
  letter-spacing: -0.03em; line-height: 1.2;
  color: var(--text-primary);
}
.batch-id {
  font-family: var(--font-mono);
  font-size: 0.63rem; color: var(--text-quarternary);
  margin-top: 3px; letter-spacing: 0.03em;
}

/* Metrics */
.metrics {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 13px 18px;
  background: var(--surface-2);
  border-bottom: 1px solid var(--separator-2);
}
.metric { display: flex; align-items: baseline; gap: 5px; }
.metric-v {
  font-size: 1.3rem; font-weight: 700;
  letter-spacing: -0.04em; color: var(--text-primary);
  line-height: 1;
}
.metric-v small { font-size: 0.75em; }
.metric-u { font-size: 0.65rem; color: var(--text-quarternary); }
.metric-sep { width: 1px; height: 20px; background: var(--separator); }

/* CCPs */
.ccps { border-bottom: 1px solid var(--separator-2); }

/* Footer */
.card-foot {
  padding: 12px 18px;
  display: flex; align-items: center;
  justify-content: space-between; gap: 10px;
}
.foot-alert {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.72rem; font-weight: 600; color: var(--red);
  flex: 1;
}
.foot-note {
  font-size: 0.72rem; color: var(--text-quarternary);
  flex: 1; min-width: 0; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;
}
.btn-open {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.75rem; font-weight: 600;
  padding: 6px 12px; border-radius: var(--r-sm);
  background: linear-gradient(145deg, #4CD97B, #28A852);
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 1px 6px rgba(40,168,82,0.25);
  transition: box-shadow var(--t-fast), transform var(--t-fast) var(--ease-spring);
}
.btn-open:hover { box-shadow: 0 3px 10px rgba(40,168,82,0.35); transform: translateY(-1px); }
.btn-open--warn {
  background: linear-gradient(145deg, #FF6B6B, #E53935);
  box-shadow: 0 1px 6px rgba(229,57,53,0.25);
}
.btn-open--warn:hover { box-shadow: 0 3px 10px rgba(229,57,53,0.35); }

@media (prefers-reduced-motion: reduce) {
  .progress-fill, .card { transition: none; }
}
</style>
