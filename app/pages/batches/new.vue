<template>
  <div class="page-new">
    <div class="page-header">
      <NuxtLink to="/dashboard" class="back-link">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L4 7l5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Dashboard
      </NuxtLink>
      <h1 class="page-title">Start new batch</h1>
      <p class="page-sub">You'll capture recipe amounts, temps, and readings as you brew.</p>
    </div>

    <form class="form-card" @submit.prevent="submit">
      <div class="form-section">
        <div class="field">
          <label for="productName" class="field-label">Product name</label>
          <input
            id="productName"
            v-model="form.productName"
            type="text"
            class="field-input"
            required
            placeholder="e.g. Lemon Original"
            list="product-names"
            autocomplete="off"
          />
          <datalist id="product-names">
            <option value="Lemon Original" />
            <option value="Peach & Ginger" />
            <option value="Raspberry" />
          </datalist>
        </div>

        <div class="field">
          <label class="field-label">Fermenter</label>
          <div class="radio-group">
            <label class="radio-option" :class="{ selected: form.fermenter === 'A', disabled: fermenterAInUse }">
              <input v-model="form.fermenter" type="radio" value="A" :disabled="fermenterAInUse" />
              Fermenter A
              <span v-if="fermenterAInUse" class="in-use-badge">In use</span>
            </label>
            <label class="radio-option" :class="{ selected: form.fermenter === 'B', disabled: fermenterBInUse }">
              <input v-model="form.fermenter" type="radio" value="B" :disabled="fermenterBInUse" />
              Fermenter B
              <span v-if="fermenterBInUse" class="in-use-badge">In use</span>
            </label>
          </div>
        </div>

        <div class="field">
          <label for="startDate" class="field-label">Brew date</label>
          <input
            id="startDate"
            v-model="form.startDate"
            type="date"
            class="field-input field-input--short"
            required
          />
        </div>
      </div>

      <div v-if="error" class="form-section">
        <div class="form-error" role="alert">{{ error }}</div>
      </div>

      <div class="form-actions">
        <NuxtLink to="/dashboard" class="btn-cancel">Cancel</NuxtLink>
        <button type="submit" class="btn-submit" :disabled="loading || (!form.fermenter)">
          <template v-if="loading">Starting batch…</template>
          <template v-else>Start brew day <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style="vertical-align:-1px"><path d="M2 5.5h7M6 3l2.5 2.5L6 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></template>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const uiStore = useUiStore()
const { batches } = useActiveBatches()

const today = new Date().toISOString().slice(0, 10)

const form = reactive({
  productName: '',
  fermenter: '' as 'A' | 'B' | '',
  startDate: today,
})

const fermenterAInUse = computed(() =>
  (batches.value ?? []).some(b => b.fermenter === 'A')
)
const fermenterBInUse = computed(() =>
  (batches.value ?? []).some(b => b.fermenter === 'B')
)

watch([fermenterAInUse, fermenterBInUse], () => {
  if (!fermenterAInUse.value) form.fermenter = 'A'
  else if (!fermenterBInUse.value) form.fermenter = 'B'
  else form.fermenter = ''
}, { immediate: true })

const loading = ref(false)
const error = ref<string | null>(null)

async function submit() {
  if (!form.fermenter) return
  loading.value = true
  error.value = null
  try {
    const id = await createBatch({
      productName: form.productName,
      fermenter: form.fermenter as 'A' | 'B',
      userId: authStore.user!.uid,
      startDate: new Date(form.startDate),
    })
    uiStore.toast(`${form.productName} — brew day started`, 'ok')
    await navigateTo(`/batches/${id}`)
  } catch (e) {
    console.error('createBatch failed:', e)
    error.value = 'Failed to create batch. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-new { max-width: 480px; }
.in-use-badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 99px;
  background: rgba(255,149,64,0.14);
  color: #B45309;
  margin-left: 6px;
}
.radio-option.disabled { opacity: 0.45; pointer-events: none; }
</style>
