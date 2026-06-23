<template>
  <div class="login-card">
    <div class="login-brand">
      <img src="/Emblem_DoubleVision.svg" alt="EyesTea logo" width="20" height="20" />
      <span class="brand-name">Eyes<span>Tea</span></span>
    </div>

    <div class="login-head">
      <h1 class="login-title">Welcome back</h1>
      <p class="login-sub">Brewing Tool · Authorised access only</p>
    </div>

    <form class="login-form" @submit.prevent="submit">
      <div class="field">
        <label for="email" class="field-label">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="field-input"
          autocomplete="email"
          required
          :disabled="loading"
        />
      </div>

      <div class="field">
        <label for="password" class="field-label">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="field-input"
          autocomplete="current-password"
          required
          :disabled="loading"
        />
      </div>

      <div v-if="authStore.error" class="login-error" role="alert">
        {{ authStore.error }}
      </div>

      <button type="submit" class="login-btn" :disabled="loading">
        {{ loading ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'auth' })

const authStore = useAuthStore()
const email     = ref('')
const password  = ref('')
const loading   = ref(false)

async function submit() {
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    await navigateTo('/dashboard')
  } catch {
    // error stored in authStore.error
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-card {
  background: var(--surface);
  border: 1px solid var(--separator-2);
  border-radius: var(--r-xl);
  padding: 40px 36px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  box-shadow: var(--shadow-lg);
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-mark {
  width: 36px; height: 36px;
  background: linear-gradient(145deg, #4CD97B, #28A852);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 10px rgba(40,168,82,0.30);
  flex-shrink: 0;
}
.brand-name {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--text-secondary);
}
.brand-name span { font-weight: 700; color: var(--text-primary); }

.login-head { display: flex; flex-direction: column; gap: 6px; }
.login-title {
  font-size: 1.7rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: var(--text-primary);
  line-height: 1;
}
.login-sub {
  font-size: 0.78rem;
  color: var(--text-quarternary);
  letter-spacing: -0.01em;
}

.login-form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 7px; }
.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
}
.field-input {
  font-size: 0.9rem;
  color: var(--text-primary);
  background: var(--surface-2);
  border: 1px solid var(--separator);
  border-radius: var(--r-sm);
  padding: 12px 14px;
  width: 100%;
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
}
.field-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-tint);
}
.field-input:disabled { opacity: 0.45; }

.login-error {
  font-size: 0.78rem;
  color: var(--red);
  background: var(--red-tint);
  border: 1px solid rgba(255,59,48,0.18);
  border-radius: var(--r-sm);
  padding: 10px 14px;
}

.login-btn {
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #fff;
  background: linear-gradient(145deg, #4CD97B, #28A852);
  border-radius: var(--r-sm);
  padding: 13px;
  margin-top: 4px;
  box-shadow: 0 2px 10px rgba(40,168,82,0.30);
  transition: box-shadow var(--t-fast), transform var(--t-fast) var(--ease-spring);
}
.login-btn:hover:not(:disabled) { box-shadow: 0 4px 16px rgba(40,168,82,0.40); transform: translateY(-1px); }
.login-btn:disabled { opacity: 0.45; cursor: not-allowed; }
</style>
