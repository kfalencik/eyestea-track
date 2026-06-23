<template>
  <div class="page-corrective">
    <div class="page-header">
      <NuxtLink :to="`/batches/${batchDocId}`" class="back-link">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L4 7l5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Batch detail
      </NuxtLink>
      <h1 class="page-title">Corrective action</h1>
      <p class="page-sub">Required when a CCP is out of limit. Complete this before the batch can proceed.</p>
    </div>

    <!-- Existing open actions -->
    <div v-if="openActions.length" class="page-table-wrap" style="margin-bottom: 20px;">
      <div v-for="action in openActions" :key="action.id" class="open-action-card">
        <div class="open-action-head">
          <span class="open-action-ccp">{{ action.ccp }}</span>
          <span class="open-action-date">{{ formatDate(action.raisedAt) }}</span>
          <span v-if="!action.resolvedAt" class="result warn">Unresolved</span>
        </div>
        <div class="open-action-row"><span class="open-action-label">Deviation</span><span>{{ action.deviation }}</span></div>
        <div class="open-action-row"><span class="open-action-label">Action taken</span><span>{{ action.actionTaken }}</span></div>
        <div class="open-action-row"><span class="open-action-label">Disposition</span><span>{{ action.productDisposition }}</span></div>
        <div v-if="action.retestResult" class="open-action-row open-action-resolved">
          <span class="open-action-label">Retest</span><span>{{ action.retestResult }}</span>
        </div>
      </div>
    </div>

    <!-- New corrective action form -->
    <form class="form-card" @submit.prevent="submit">
      <div class="form-section">
        <p class="form-section-title">Raise new corrective action</p>

        <div class="field">
          <label for="ccp-select" class="field-label">CCP affected</label>
          <select id="ccp-select" v-model="form.ccp" class="field-input field-input--short" required>
            <option value="">Select…</option>
            <option value="CCP1">CCP1 — pH</option>
            <option value="CCP2">CCP2 — Pasteurisation</option>
            <option value="CCP3">CCP3 — O₂ purge</option>
            <option value="CCP4">CCP4 — Seam integrity</option>
          </select>
        </div>

        <div class="field" style="margin-top: 16px;">
          <label for="deviation" class="field-label">Deviation description</label>
          <textarea
            id="deviation"
            v-model="form.deviation"
            class="field-input field-textarea"
            rows="2"
            placeholder="e.g. pH reading was 4.82, above critical limit of 4.6"
            required
          />
        </div>

        <div class="field" style="margin-top: 16px;">
          <label for="rootCause" class="field-label">Root cause</label>
          <textarea
            id="rootCause"
            v-model="form.rootCause"
            class="field-input field-textarea"
            rows="2"
            placeholder="e.g. Insufficient citric acid added during conditioning"
            required
          />
        </div>

        <div class="field" style="margin-top: 16px;">
          <label for="actionTaken" class="field-label">Action taken</label>
          <textarea
            id="actionTaken"
            v-model="form.actionTaken"
            class="field-input field-textarea"
            rows="2"
            placeholder="e.g. Added 5 g additional citric acid, mixed thoroughly, re-measured pH after 30 minutes"
            required
          />
        </div>

        <div class="field" style="margin-top: 16px;">
          <label for="disposition" class="field-label">Product disposition</label>
          <select id="disposition" v-model="form.productDisposition" class="field-input field-input--short" required>
            <option value="">Select…</option>
            <option value="hold">Hold pending re-test</option>
            <option value="re-pasteurised">Re-pasteurised</option>
            <option value="disposed">Disposed / destroyed</option>
            <option value="released">Released after corrective action</option>
          </select>
        </div>

        <div class="field" style="margin-top: 16px;">
          <label for="retest" class="field-label">Re-test result (if resolved)</label>
          <input
            id="retest"
            v-model="form.retestResult"
            type="text"
            class="field-input"
            placeholder="e.g. pH re-measured at 4.1 — in limit. Batch released."
          />
        </div>
      </div>

      <div v-if="error" class="form-section">
        <div class="form-error" role="alert">{{ error }}</div>
      </div>

      <div class="form-actions">
        <NuxtLink :to="`/batches/${batchDocId}`" class="btn-cancel">Cancel</NuxtLink>
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Saving…' : 'Record corrective action' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { CcpNumber } from '~/types/batch'
import type { Timestamp } from 'firebase/firestore'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const uiStore = useUiStore()
const route = useRoute()
const batchDocId = route.params.id as string

const { correctiveActions, raiseCorrectiveAction } = useBatch(batchDocId)

const openActions = computed(() =>
  (correctiveActions.value ?? []).filter(ca => !ca.resolvedAt)
)

const form = reactive({
  ccp: (route.query.ccp as CcpNumber) || '' as CcpNumber | '',
  deviation: '',
  rootCause: '',
  actionTaken: '',
  productDisposition: '',
  retestResult: '',
})

const loading = ref(false)
const error = ref<string | null>(null)

function formatDate(ts: Timestamp | null): string {
  if (!ts) return ''
  return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function submit() {
  if (!form.ccp) return
  loading.value = true
  error.value = null
  try {
    await raiseCorrectiveAction({
      ccp: form.ccp as CcpNumber,
      deviation: form.deviation,
      rootCause: form.rootCause,
      actionTaken: form.actionTaken,
      productDisposition: form.productDisposition,
      retestResult: form.retestResult || undefined,
      userId: authStore.user!.uid,
    })
    uiStore.toast('Corrective action recorded', 'warn')
    await navigateTo(`/batches/${batchDocId}`)
  } catch {
    error.value = 'Failed to save. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-corrective { max-width: 560px; }

.open-action-card {
  padding: 16px 20px;
  border-bottom: 1px solid var(--separator-2);
  display: flex; flex-direction: column; gap: 6px;
}
.open-action-card:last-child { border-bottom: none; }
.open-action-head {
  display: flex; align-items: center; gap: 10px; margin-bottom: 4px;
}
.open-action-ccp {
  font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700;
  color: #C62828; letter-spacing: 0.04em;
}
.open-action-date {
  font-size: 0.72rem; color: var(--text-quarternary); flex: 1;
}
.open-action-row {
  display: flex; gap: 10px; font-size: 0.80rem; color: var(--text-secondary); line-height: 1.5;
}
.open-action-label {
  font-size: 0.72rem; font-weight: 600; color: var(--text-quarternary);
  min-width: 90px; flex-shrink: 0;
}
.open-action-resolved { color: #1A6B38; }
</style>
