<template>
  <div class="row">
    <span class="ccp-dot" :class="`dot--${props.ccp.toLowerCase()}`" />
    <span class="label">{{ label }}</span>
    <span class="value" :class="valueClass">{{ displayValue }}</span>
    <span class="badge" :class="badgeClass">{{ badgeLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import type { CcpNumber, Batch } from '~/types/batch'

const props = defineProps<{ ccp: CcpNumber; batch: Batch }>()

const CCP_STAGE_KEY: Record<CcpNumber, string> = {
  CCP1: 'ccp1', CCP2: 'ccp2', CCP3: 'ccp3', CCP4: 'ccp4',
}

const stageData = computed(() => props.batch.stageData?.[CCP_STAGE_KEY[props.ccp]])

const label = computed(() => ({
  CCP1: 'CCP1 — pH', CCP2: 'CCP2 — Pasteur.',
  CCP3: 'CCP3 — O₂', CCP4: 'CCP4 — Seam',
}[props.ccp]))

const displayValue = computed(() => {
  const d = stageData.value
  if (!d) return '—'
  if (props.ccp === 'CCP1') return d.ph != null ? `${Number(d.ph).toFixed(2)}` : '—'
  if (props.ccp === 'CCP2') return d.waterBathTempEnd != null ? `${d.waterBathTempEnd}°C` : '—'
  if (props.ccp === 'CCP3') return d.purgeConfirmed ? 'Purged' : 'No purge'
  if (props.ccp === 'CCP4') return d.seamVisualPass ? 'Pass' : 'Check'
  return '—'
})

const pass = computed(() => {
  if (!stageData.value) return null
  return stageData.value.phPass === true
})

const badgeLabel  = computed(() => pass.value === null ? 'Pending' : pass.value ? 'In limit' : 'Over limit')
const valueClass  = computed(() => pass.value === null ? 'v-pend' : pass.value ? 'v-ok' : 'v-warn')
const badgeClass  = computed(() => pass.value === null ? 'b-pend' : pass.value ? 'b-ok' : 'b-warn')
</script>

<style scoped>
.row { display: flex; align-items: center; gap: 10px; padding: 9px 18px; }
.row + .row { border-top: 1px solid var(--separator-2); }
.ccp-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.dot--ccp1 { background: linear-gradient(135deg, #4A9EFF, #1C7EF0); }
.dot--ccp2 { background: linear-gradient(135deg, #BF6EF7, #9B45E0); }
.dot--ccp3 { background: linear-gradient(135deg, #FF9640, #F0710A); }
.dot--ccp4 { background: linear-gradient(135deg, #4CD97B, #28A852); }
.label { font-size: 0.75rem; color: var(--text-quarternary); flex: 1; letter-spacing: -0.01em; }
.value { font-size: 0.82rem; font-weight: 600; font-family: var(--font-mono); letter-spacing: 0; }
.v-ok   { color: #1A6B38; }
.v-warn { color: var(--red); }
.v-pend { color: var(--text-placeholder); }
.badge {
  font-size: 0.60rem; font-weight: 700;
  letter-spacing: 0.03em; text-transform: uppercase;
  padding: 2px 8px; border-radius: 99px; flex-shrink: 0;
}
.b-ok   { background: rgba(76,217,123,0.12); color: #1A6B38; }
.b-warn { background: rgba(229,57,53,0.10);  color: #C62828; }
.b-pend { background: var(--surface-2);      color: var(--text-quarternary); }
</style>
