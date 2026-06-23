<template>
  <div class="duty-page">

    <!-- Page header -->
    <div class="page-header">
      <div>
        <p class="page-eyebrow">HMRC</p>
        <h1 class="page-title">Alcohol Duty</h1>
      </div>
      <div class="page-actions">
        <div class="month-nav">
          <button class="month-btn" :disabled="!canGoPrev" @click="prevMonth">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 3L5 7l3.5 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <span class="month-label">{{ monthLabel }}</span>
          <button class="month-btn" :disabled="!canGoNext" @click="nextMonth">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 3L9 7l-3.5 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
        <button class="btn-new" @click="printReport">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="2" y="4" width="9" height="6.5" rx="1" stroke="currentColor" stroke-width="1.3"/>
            <path d="M4 4V2.5h5V4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            <path d="M4 8h5M4 10h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          Print report
        </button>
      </div>
    </div>

    <!-- Summary strip -->
    <div class="summary-strip">
      <div class="summary-stat">
        <div class="summary-val">{{ monthRows.length }}</div>
        <div class="summary-label">Can runs this month</div>
      </div>
      <div class="summary-sep" />
      <div class="summary-stat">
        <div class="summary-val mono">{{ monthTotalLpa.toFixed(3) }} L</div>
        <div class="summary-label">Pure alcohol produced</div>
      </div>
      <div class="summary-sep" />
      <div class="summary-stat">
        <div class="summary-val">{{ monthEstimatedDuty != null ? '£' + monthEstimatedDuty.toFixed(2) : '—' }}</div>
        <div class="summary-label">Estimated duty</div>
      </div>
      <div class="summary-sep" />
      <div class="summary-stat">
        <div class="summary-val">
          <span v-if="monthSubmitted" class="submitted-chip">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2 2.5L8.5 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Submitted
          </span>
          <span v-else class="pending-chip">Not submitted</span>
        </div>
        <div class="summary-label">HMRC return status</div>
      </div>
      <div class="summary-sep" />
      <div class="summary-stat">
        <div class="summary-val">{{ ytdEstimatedDuty != null ? '£' + ytdEstimatedDuty.toFixed(2) : '—' }}</div>
        <div class="summary-label">Year to date (est.)</div>
      </div>
      <div v-if="!monthSubmitted && monthRows.length" class="summary-sep" />
      <div v-if="!monthSubmitted && monthRows.length" class="summary-stat">
        <button class="btn-submit-return" :disabled="markingSubmitted" @click="markMonthSubmitted">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3 3L11 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          {{ markingSubmitted ? 'Saving…' : 'Mark return submitted' }}
        </button>
        <div class="summary-label">Due ~1st of next month</div>
      </div>
    </div>

    <!-- Batch table -->
    <div v-if="monthRows.length" class="duty-table-wrap">
      <table class="duty-table">
        <thead>
          <tr>
            <th>Batch</th>
            <th>Product</th>
            <th>Canned</th>
            <th>Size</th>
            <th>Cans</th>
            <th>OG</th>
            <th>FG</th>
            <th>ABV</th>
            <th>Total volume</th>
            <th>Pure alcohol (LPA)</th>
            <th>Duty band</th>
            <th>Est. duty</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in monthRows" :key="row.key">
            <td class="mono">{{ row.batchId }}</td>
            <td class="strong">{{ row.productName }}</td>
            <td>{{ row.canDate }}</td>
            <td class="mono">{{ row.sizeMl ? row.sizeMl + ' ml' : '—' }}</td>
            <td class="mono">{{ row.qty ?? '—' }}</td>
            <td class="mono">{{ row.og != null ? row.og.toFixed(3) : '—' }}</td>
            <td class="mono">{{ row.fg != null ? row.fg.toFixed(3) : '—' }}</td>
            <td class="mono bold accent">{{ row.abv != null ? row.abv.toFixed(2) + '%' : '—' }}</td>
            <td class="mono">{{ row.totalVolL != null ? row.totalVolL.toFixed(2) + ' L' : '—' }}</td>
            <td class="mono bold">{{ row.lpa != null ? row.lpa.toFixed(4) + ' L' : '—' }}</td>
            <td>
              <span v-if="row.dutyBand" class="band-chip" :class="row.dutyTier">{{ row.dutyBand }}</span>
              <span v-else>—</span>
            </td>
            <td class="mono bold">{{ row.estimatedDuty != null ? '£' + row.estimatedDuty.toFixed(2) : '—' }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="9" class="foot-label">Month total</td>
            <td class="mono bold">{{ monthTotalLpa.toFixed(4) }} L</td>
            <td></td>
            <td class="mono bold accent-dark">{{ monthEstimatedDuty != null ? '£' + monthEstimatedDuty.toFixed(2) : '—' }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="8" y="6" width="24" height="28" rx="3" stroke="currentColor" stroke-width="1.6"/>
          <path d="M14 16h12M14 22h8M14 28h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="empty-title">No batches canned in {{ monthLabel }}</p>
      <p class="empty-sub">Batches appear here once the canning stage is completed.</p>
    </div>

    <!-- HMRC guidance panel -->
    <div v-if="monthRows.length" class="guidance-card">
      <div class="guidance-header">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" stroke-width="1.3"/>
          <path d="M7.5 7v4.5M7.5 5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        How to file this on HMRC Beer Duty return
      </div>
      <ol class="guidance-list">
        <li>Log in to <strong>HMRC Online Services</strong> and select <em>Beer Duty</em></li>
        <li>Enter the <strong>accounting period</strong>: {{ monthLabel }}</li>
        <li>For each row below, enter the <strong>description</strong> (product name — Kombucha), <strong>ABV %</strong>, and <strong>quantity in litres of pure alcohol (LPA)</strong></li>
        <li>The total LPA for this period is <strong>{{ monthTotalLpa.toFixed(4) }} L</strong></li>
        <li>Estimated duty payable: <strong>{{ monthEstimatedDuty != null ? '£' + monthEstimatedDuty.toFixed(2) : '—' }}</strong> — confirm the exact figure HMRC calculates</li>
        <li>Submit by <strong>the 25th of the month following the accounting period</strong></li>
      </ol>
    </div>

    <!-- Print-only layout -->
    <div id="print-area" class="print-area">
      <div class="print-header">
        <div class="print-title-block">
          <div class="print-brand">EyesTea Brewery</div>
          <div class="print-doc-title">Beer Duty Return — {{ monthLabel }}</div>
          <div class="print-meta">Generated {{ new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) }}</div>
        </div>
        <div class="print-summary-block">
          <div class="print-kv"><span>Total LPA</span><strong>{{ monthTotalLpa.toFixed(4) }} L</strong></div>
          <div class="print-kv"><span>Estimated duty</span><strong>{{ monthEstimatedDuty != null ? '£' + monthEstimatedDuty.toFixed(2) : '—' }}</strong></div>
          <div class="print-kv"><span>Runs</span><strong>{{ monthRows.length }}</strong></div>
        </div>
      </div>
      <table class="print-table">
        <thead>
          <tr>
            <th>Batch ID</th>
            <th>Product</th>
            <th>Canned</th>
            <th>Size</th>
            <th>Cans</th>
            <th>ABV %</th>
            <th>Total vol (L)</th>
            <th>Pure alcohol (LPA)</th>
            <th>Duty band</th>
            <th>Est. duty £</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in monthRows" :key="'p' + row.key">
            <td>{{ row.batchId }}</td>
            <td>{{ row.productName }}</td>
            <td>{{ row.canDate }}</td>
            <td>{{ row.sizeMl ? row.sizeMl + ' ml' : '—' }}</td>
            <td>{{ row.qty ?? '—' }}</td>
            <td>{{ row.abv != null ? row.abv.toFixed(2) : '—' }}</td>
            <td>{{ row.totalVolL != null ? row.totalVolL.toFixed(2) : '—' }}</td>
            <td><strong>{{ row.lpa != null ? row.lpa.toFixed(4) : '—' }}</strong></td>
            <td>{{ row.dutyBand || '—' }}</td>
            <td>{{ row.estimatedDuty != null ? row.estimatedDuty.toFixed(2) : '—' }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="7"><strong>TOTAL</strong></td>
            <td><strong>{{ monthTotalLpa.toFixed(4) }} L</strong></td>
            <td></td>
            <td><strong>{{ monthEstimatedDuty != null ? monthEstimatedDuty.toFixed(2) : '—' }}</strong></td>
          </tr>
        </tfoot>
      </table>
      <div class="print-footer">
        <p>Duty rates: ≤1.2% ABV — Exempt &nbsp;|&nbsp; 1.2–2.8% ABV — £9.27/LPA &nbsp;|&nbsp; 2.8–7.5% ABV — £21.01/LPA &nbsp;|&nbsp; >7.5% ABV — £28.50/LPA (2024/25 rates)</p>
        <p>Small Producer Relief may apply. Verify final figures on HMRC Beer Duty return. Submit by 25th of following month.</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { doc, setDoc, getDoc, getFirestore, serverTimestamp } from 'firebase/firestore'
import type { Timestamp } from 'firebase/firestore'
import type { Batch } from '~/types/batch'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const uiStore = useUiStore()

const { batches: allBatches } = useBatches(['complete', 'active', 'conditioning', 'canning', 'ready_to_can'])

// ── Month navigation ────────────────────────────────────────
const today = new Date()
const selectedYear = ref(today.getFullYear())
const selectedMonth = ref(today.getMonth())

const earliestYear = 2024

const canGoPrev = computed(() =>
  selectedYear.value > earliestYear || selectedMonth.value > 0
)
const canGoNext = computed(() =>
  selectedYear.value < today.getFullYear() ||
  (selectedYear.value === today.getFullYear() && selectedMonth.value < today.getMonth())
)

function prevMonth() {
  if (selectedMonth.value === 0) { selectedMonth.value = 11; selectedYear.value-- }
  else selectedMonth.value--
}
function nextMonth() {
  if (selectedMonth.value === 11) { selectedMonth.value = 0; selectedYear.value++ }
  else selectedMonth.value++
}

const monthLabel = computed(() =>
  new Date(selectedYear.value, selectedMonth.value, 1)
    .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
)

// ── Duty rates (2024/25) ────────────────────────────────────
const DUTY_RATES = {
  exempt:   { rate: 0,     label: 'Exempt',      band: '≤1.2% ABV' },
  low:      { rate: 9.27,  label: '£9.27/LPA',   band: '1.2–2.8% ABV' },
  standard: { rate: 21.01, label: '£21.01/LPA',  band: '2.8–7.5% ABV' },
  high:     { rate: 28.50, label: '£28.50/LPA',  band: '>7.5% ABV' },
}
type DutyTier = keyof typeof DUTY_RATES

interface CanRun { sizeMl: number; qty: number; defect: boolean }

interface DutyRow {
  key: string
  id: string
  batchId: string
  productName: string
  sizeMl: number
  qty: number
  canDate: string
  canningDate: Date | null
  og: number | null
  fg: number | null
  abv: number | null
  totalVolL: number | null
  lpa: number | null
  dutyTier: DutyTier | null
  dutyBand: string | null
  estimatedDuty: number | null
}

function calcRows(b: Batch & { id: string }): DutyRow[] {
  const og = b.stageData?.pitch?.ogRecorded ? Number(b.stageData.pitch.ogRecorded) : null
  const fg = b.stageData?.ferment?.fgRecorded ? Number(b.stageData.ferment.fgRecorded) : null
  const abv = og && fg ? Math.round((og - fg) * 131.25 * 100) / 100 : null

  const canningTs: Timestamp | null = b.stageData?.canning?.confirmedAt ?? null
  const canningDate = canningTs?.toDate ? canningTs.toDate() : null
  const canDate = canningDate
    ? canningDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  const runs = ((b.stageData?.canning?.canRuns ?? []) as CanRun[]).filter(r => !r.defect && r.qty > 0)

  // Aggregate by size
  const bySize = new Map<number, number>()
  for (const r of runs) bySize.set(r.sizeMl, (bySize.get(r.sizeMl) ?? 0) + r.qty)

  if (bySize.size === 0) {
    // Canning stage saved but no runs — still show for duty purposes
    return [{
      key: b.id,
      id: b.id,
      batchId: b.batchId,
      productName: b.productName,
      sizeMl: 0,
      qty: 0,
      canDate,
      canningDate,
      og,
      fg,
      abv,
      totalVolL: null,
      lpa: null,
      dutyTier: null,
      dutyBand: null,
      estimatedDuty: null,
    }]
  }

  return [...bySize.entries()].sort((a, b) => a[0] - b[0]).map(([sizeMl, qty]) => {
    const totalVolL = (qty * sizeMl) / 1000
    const lpa = abv != null ? Math.round(totalVolL * abv / 100 * 10000) / 10000 : null

    let dutyTier: DutyTier | null = null
    if (abv != null) {
      if (abv <= 1.2) dutyTier = 'exempt'
      else if (abv <= 2.8) dutyTier = 'low'
      else if (abv <= 7.5) dutyTier = 'standard'
      else dutyTier = 'high'
    }

    const estimatedDuty = dutyTier && lpa != null
      ? Math.round(DUTY_RATES[dutyTier].rate * lpa * 100) / 100
      : null

    return {
      key: `${b.id}-${sizeMl}`,
      id: b.id,
      batchId: b.batchId,
      productName: b.productName,
      sizeMl,
      qty,
      canDate,
      canningDate,
      og,
      fg,
      abv,
      totalVolL,
      lpa,
      dutyTier,
      dutyBand: dutyTier ? DUTY_RATES[dutyTier].band : null,
      estimatedDuty,
    }
  })
}

const monthRows = computed(() => {
  const y = selectedYear.value
  const m = selectedMonth.value
  return (allBatches.value ?? [])
    .filter(b => b.stageData?.canning != null)
    .flatMap(calcRows)
    .filter(row => {
      if (!row.canningDate) return false
      return row.canningDate.getFullYear() === y && row.canningDate.getMonth() === m
    })
    .sort((a, b) => (a.canningDate?.getTime() ?? 0) - (b.canningDate?.getTime() ?? 0))
})

const monthTotalLpa = computed(() =>
  monthRows.value.reduce((s, r) => s + (r.lpa ?? 0), 0)
)
const monthEstimatedDuty = computed(() => {
  const rows = monthRows.value.filter(r => r.estimatedDuty != null)
  if (!rows.length) return null
  return rows.reduce((s, r) => s + (r.estimatedDuty ?? 0), 0)
})

const ytdEstimatedDuty = computed(() => {
  const y = selectedYear.value
  const rows = (allBatches.value ?? [])
    .filter(b => b.stageData?.canning != null)
    .flatMap(calcRows)
    .filter(row => row.canningDate?.getFullYear() === y && row.estimatedDuty != null)
  if (!rows.length) return null
  return rows.reduce((s, r) => s + (r.estimatedDuty ?? 0), 0)
})

// ── Submitted tracking ──────────────────────────────────────
const monthSubmitted = ref(false)
const markingSubmitted = ref(false)

async function loadSubmittedState() {
  const db = getFirestore()
  const key = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, '0')}`
  try {
    const snap = await getDoc(doc(db, 'duty-returns', key))
    monthSubmitted.value = snap.exists() && snap.data()?.submitted === true
  } catch {
    monthSubmitted.value = false
  }
}

watch([selectedYear, selectedMonth], loadSubmittedState, { immediate: true })

async function markMonthSubmitted() {
  if (!authStore.user) return
  markingSubmitted.value = true
  try {
    const db = getFirestore()
    const key = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, '0')}`
    await setDoc(doc(db, 'duty-returns', key), {
      submitted: true,
      submittedAt: serverTimestamp(),
      submittedBy: authStore.user.uid,
      month: monthLabel.value,
      totalLpa: monthTotalLpa.value,
      estimatedDuty: monthEstimatedDuty.value ?? 0,
    })
    monthSubmitted.value = true
    uiStore.toast(`${monthLabel.value} return marked as submitted`, 'ok')
  } catch {
    uiStore.toast('Failed to save — please try again', 'error')
  } finally {
    markingSubmitted.value = false
  }
}

function printReport() { window.print() }
</script>

<style scoped>
.duty-page { display: flex; flex-direction: column; gap: 24px; }

.month-nav {
  display: inline-flex; align-items: center; gap: 2px;
  background: var(--surface-2); border-radius: var(--r-sm); padding: 3px;
}
.month-btn {
  width: 28px; height: 28px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-secondary);
  transition: background var(--t-fast), color var(--t-fast);
}
.month-btn:hover:not(:disabled) { background: var(--surface-3); color: var(--text-primary); }
.month-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.month-label {
  padding: 0 10px; font-size: 0.84rem; font-weight: 600;
  color: var(--text-primary); min-width: 140px; text-align: center;
}

.summary-strip {
  display: flex; align-items: center; flex-wrap: wrap;
  background: #fff; border: 1px solid rgba(60,60,67,0.10);
  border-radius: var(--r-lg); overflow: visible;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.summary-stat { padding: 16px 24px; display: flex; flex-direction: column; gap: 5px; }
.summary-val { font-size: 1.45rem; font-weight: 700; letter-spacing: -0.04em; color: var(--text-primary); line-height: 1; }
.summary-label { font-size: 0.66rem; color: var(--text-quarternary); letter-spacing: 0.01em; }
.summary-sep { width: 1px; align-self: stretch; background: var(--separator-2); }
.mono { font-family: var(--font-mono); }

.submitted-chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.78rem; font-weight: 700; padding: 4px 10px;
  border-radius: 99px; background: rgba(76,217,123,0.12); color: #1A6B38;
}
.pending-chip {
  display: inline-flex; align-items: center;
  font-size: 0.78rem; font-weight: 700; padding: 4px 10px;
  border-radius: 99px; background: rgba(255,149,64,0.12); color: #8a4400;
}
.btn-submit-return {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 16px; border-radius: var(--r-sm);
  background: linear-gradient(145deg, #4CD97B, #28A852);
  color: #fff; font-size: 0.82rem; font-weight: 600;
  box-shadow: 0 1px 6px rgba(40,168,82,0.25); white-space: nowrap;
  transition: box-shadow var(--t-fast), transform var(--t-fast) var(--ease-spring);
}
.btn-submit-return:hover:not(:disabled) { box-shadow: 0 3px 10px rgba(40,168,82,0.35); transform: translateY(-1px); }
.btn-submit-return:disabled { opacity: 0.5; cursor: not-allowed; }

.duty-table-wrap {
  background: #fff; border: 1px solid rgba(60,60,67,0.10);
  border-radius: var(--r-lg); overflow-x: auto;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.duty-table { width: 100%; border-collapse: collapse; font-size: 0.80rem; }
.duty-table thead tr { background: var(--surface-2); border-bottom: 1px solid var(--separator-2); }
.duty-table th {
  padding: 9px 14px; text-align: left;
  font-size: 0.60rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--text-quarternary); white-space: nowrap;
}
.duty-table td { padding: 11px 14px; border-bottom: 1px solid var(--separator-2); color: var(--text-primary); white-space: nowrap; }
.duty-table tbody tr:last-child td { border-bottom: none; }
.duty-table tbody tr:hover td { background: var(--surface-2); }
.duty-table tfoot td { padding: 10px 14px; border-top: 2px solid var(--separator-2); background: var(--surface-2); font-size: 0.82rem; }
.duty-table .strong { font-weight: 600; }
.duty-table .bold { font-weight: 700; }
.duty-table .accent { color: var(--accent-deep); }
.duty-table .accent-dark { color: var(--accent-deep); font-size: 0.88rem; }
.duty-table .foot-label { font-weight: 700; font-size: 0.78rem; color: var(--text-secondary); }

.band-chip {
  display: inline-block; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.02em;
  padding: 2px 8px; border-radius: 99px; white-space: nowrap;
}
.band-chip.exempt   { background: rgba(142,142,147,0.12); color: #636366; }
.band-chip.low      { background: rgba(90,200,250,0.15); color: #0070A8; }
.band-chip.standard { background: rgba(255,149,64,0.15); color: #8B4A00; }
.band-chip.high     { background: rgba(255,59,48,0.10); color: #C62828; }

.guidance-card {
  background: #fff; border: 1px solid rgba(60,60,67,0.10);
  border-radius: var(--r-lg); padding: 18px 22px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.guidance-header {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.82rem; font-weight: 700; color: var(--text-primary); margin-bottom: 14px;
}
.guidance-list { display: flex; flex-direction: column; gap: 8px; padding-left: 20px; margin: 0; }
.guidance-list li { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; }
.guidance-list strong { color: var(--text-primary); }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 64px 32px; gap: 10px; text-align: center;
  border: 1px dashed rgba(60,60,67,0.18); border-radius: var(--r-lg); background: #fff;
}
.empty-icon { color: var(--text-placeholder); margin-bottom: 4px; }
.empty-title { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
.empty-sub { font-size: 0.82rem; color: var(--text-quarternary); max-width: 300px; line-height: 1.5; }

.print-area { display: none; }

@media print {
  .duty-page > *:not(.print-area) { display: none !important; }
  .print-area { display: block !important; font-family: -apple-system, Helvetica, Arial, sans-serif; }
  .print-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
  .print-brand { font-size: 20px; font-weight: 800; letter-spacing: -0.03em; }
  .print-doc-title { font-size: 13px; font-weight: 600; margin-top: 4px; }
  .print-meta { font-size: 10px; color: #666; margin-top: 2px; }
  .print-summary-block { text-align: right; }
  .print-kv { display: flex; gap: 12px; justify-content: flex-end; font-size: 11px; }
  .print-kv span { color: #666; }
  .print-kv strong { font-size: 13px; }
  .print-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 16px; }
  .print-table th { background: #f0f0f0; padding: 6px 8px; text-align: left; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #ddd; }
  .print-table td { padding: 6px 8px; border: 1px solid #ddd; }
  .print-table tfoot td { background: #f0f0f0; font-weight: 700; border-top: 2px solid #000; }
  .print-footer { font-size: 8px; color: #666; border-top: 1px solid #ccc; padding-top: 8px; line-height: 1.6; }
}
</style>
