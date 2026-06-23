<template>
  <div class="narrow-page">
    <div class="page-header">
      <NuxtLink :to="`/batches/${batchDocId}`" class="back-link">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L4 7l5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Batch detail
      </NuxtLink>
      <h1 class="page-title">Log fermentation reading</h1>
      <p v-if="batch" class="page-sub">{{ batch.batchId }} — {{ batch.productName }}</p>
    </div>

    <form class="form-card" @submit.prevent="submit">
      <div class="form-section">
        <div class="field">
          <label class="field-label">Reading type</label>
          <div class="radio-group">
            <label class="radio-option" :class="{ selected: form.type === 'gravity' }">
              <input v-model="form.type" type="radio" value="gravity" /> Specific gravity (SG)
            </label>
            <label class="radio-option" :class="{ selected: form.type === 'temperature' }">
              <input v-model="form.type" type="radio" value="temperature" /> Temperature (°C)
            </label>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="field">
          <label for="value" class="field-label">
            {{ form.type === 'gravity' ? 'SG reading (e.g. 1.014)' : 'Temperature (°C)' }}
          </label>
          <input
            id="value"
            v-model.number="form.value"
            type="number"
            class="field-input field-input--short"
            :step="form.type === 'gravity' ? 0.001 : 0.5"
            :min="form.type === 'gravity' ? 1.000 : 0"
            :max="form.type === 'gravity' ? 1.150 : 50"
            :placeholder="form.type === 'gravity' ? '1.014' : '18'"
            required
          />
        </div>

        <div class="field" style="margin-top: 14px;">
          <label for="day" class="field-label">Day since pitch (Day 0 = OG)</label>
          <input id="day" v-model.number="form.day" type="number" class="field-input field-input--short" min="0" max="30" required />
        </div>

        <div class="field" style="margin-top: 14px;">
          <label for="notes" class="field-label">Notes (optional)</label>
          <textarea id="notes" v-model="form.notes" class="field-input field-textarea" rows="2" placeholder="Airlock activity, clarity, any observations…" />
        </div>

        <div v-if="form.type === 'gravity' && gravityReadings?.length" class="gravity-history">
          <p class="gravity-history-title">Previous readings</p>
          <div v-for="r in gravityReadings" :key="r.id" class="gravity-history-row">
            <span class="text-muted">Day {{ r.day }}</span>
            <span style="font-family: var(--font-mono); font-weight: 600;">{{ r.value.toFixed(3) }} SG</span>
          </div>
          <div v-if="isStable" class="stability-alert--ok">
            SG stable across last 2 readings (≥48 h apart) — fermentation may be complete.
          </div>
        </div>
      </div>

      <div v-if="error" class="form-section">
        <div class="form-error" role="alert">{{ error }}</div>
      </div>

      <div class="form-actions">
        <NuxtLink :to="`/batches/${batchDocId}`" class="btn-cancel">Cancel</NuxtLink>
        <button type="submit" class="btn-submit" :disabled="loading">{{ loading ? 'Saving…' : 'Save reading' }}</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const uiStore = useUiStore()
const route = useRoute()
const batchDocId = route.params.id as string

const { batch, gravityReadings, addReading } = useBatch(batchDocId)

const daysSincePitch = computed(() => {
  if (!batch.value?.startDate) return 0
  return Math.floor((Date.now() - batch.value.startDate.toDate().getTime()) / 86400000)
})

const form = reactive({
  type: 'gravity' as 'gravity' | 'temperature',
  value: null as number | null,
  day: daysSincePitch.value,
  notes: '',
})

watch(daysSincePitch, d => { form.day = d }, { immediate: true })

const isStable = computed(() => {
  const gs = gravityReadings.value
  if (!gs || gs.length < 2) return false
  const last = gs[gs.length - 1]
  const prev = gs[gs.length - 2]
  return Math.abs(last.value - prev.value) < 0.001 && (last.day - prev.day) >= 2
})

const loading = ref(false)
const error = ref<string | null>(null)

async function submit() {
  if (form.value == null) return
  loading.value = true
  error.value = null
  try {
    await addReading({ type: form.type, value: form.value, day: form.day, notes: form.notes, userId: authStore.user!.uid })
    uiStore.toast('Reading saved', 'ok')
    await navigateTo(`/batches/${batchDocId}`)
  } catch {
    error.value = 'Failed to save reading. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.narrow-page { max-width: 560px; }
.gravity-history {
  margin-top: 14px;
  background: var(--surface-2);
  border-radius: var(--r-sm);
  border: 1px solid var(--separator-2);
  padding: 12px 14px;
  display: flex; flex-direction: column; gap: 6px;
}
.gravity-history-title {
  font-size: 0.65rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--text-quarternary); margin-bottom: 2px;
}
.gravity-history-row {
  display: flex; justify-content: space-between;
  font-size: 0.82rem; color: var(--text-secondary);
}
</style>
