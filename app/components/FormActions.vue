<template>
  <div>
    <div v-if="error" class="form-error" role="alert">{{ error }}</div>
    <div class="form-actions">
      <NuxtLink :to="back" class="btn-cancel">Cancel</NuxtLink>
      <button type="submit" class="btn-submit" :disabled="loading">
        {{ loading ? 'Saving…' : submitLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean
  error: string | null
  back: string
  submitLabel: string
}>()
</script>

<style scoped>
.form-error { font-family: var(--font-mono); font-size: 0.7rem; color: var(--warn); background: var(--warn-bg); padding: 10px 14px; border-left: 3px solid var(--warn); margin-bottom: 12px; }
.form-actions { display: flex; gap: 12px; align-items: center; }
.btn-cancel { font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); border: 1.5px solid var(--border); padding: 10px 20px; text-decoration: none; transition: color var(--transition); }
.btn-cancel:hover { color: var(--text); }
.btn-submit { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; background: var(--text); color: var(--ground); border: none; padding: 10px 24px; transition: background var(--transition); }
.btn-submit:hover:not(:disabled) { background: var(--accent); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
