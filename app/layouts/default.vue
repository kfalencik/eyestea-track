<template>
  <div class="shell">
    <!-- Sidebar -->
    <aside class="sidebar">
      <!-- Logo -->
      <div class="sidebar-logo">
        <img src="/Emblem_DoubleVision.svg" alt="EyesTea logo" width="20" height="20" />
        <span class="logo-word">Eyes<strong>Tea</strong></span>
      </div>

      <!-- Nav -->
      <nav class="sidebar-nav" aria-label="Main navigation">
        <NuxtLink to="/dashboard" class="nav-item" active-class="nav-item--active">
          <span class="nav-badge nav-badge--blue">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1.2" fill="currentColor"/>
              <rect x="8" y="1" width="5" height="5" rx="1.2" fill="currentColor"/>
              <rect x="1" y="8" width="5" height="5" rx="1.2" fill="currentColor"/>
              <rect x="8" y="8" width="5" height="5" rx="1.2" fill="currentColor"/>
            </svg>
          </span>
          <span class="nav-label">Overview</span>
        </NuxtLink>

        <NuxtLink to="/log" class="nav-item" active-class="nav-item--active">
          <span class="nav-badge nav-badge--purple">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 3.5h9M2.5 7h6.5M2.5 10.5h4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="nav-label">Log</span>
        </NuxtLink>

        <NuxtLink to="/inventory" class="nav-item" active-class="nav-item--active">
          <span class="nav-badge nav-badge--amber">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="5" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
              <path d="M2 7.5h10M5 5V4a2 2 0 014 0v1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="nav-label">Inventory</span>
        </NuxtLink>

        <NuxtLink to="/duty" class="nav-item" active-class="nav-item--active">
          <span class="nav-badge nav-badge--red">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="3.5" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
              <path d="M5 3.5V3a2 2 0 014 0v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              <path d="M4.5 8l1.5 1.5 3-3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="nav-label">Duty</span>
        </NuxtLink>

        <NuxtLink to="/intake" class="nav-item" active-class="nav-item--active">
          <span class="nav-badge nav-badge--orange">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="5" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
              <path d="M4.5 5V4a2.5 2.5 0 015 0v1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="nav-label">Ingredients</span>
        </NuxtLink>

        <NuxtLink to="/products" class="nav-item" active-class="nav-item--active">
          <span class="nav-badge nav-badge--teal">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5C4.5 1.5 2.5 3.5 2.5 6c0 1.5.7 2.8 1.8 3.7L7 12.5l2.7-2.8A4.5 4.5 0 0011.5 6C11.5 3.5 9.5 1.5 7 1.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
              <circle cx="7" cy="6" r="1.5" fill="currentColor"/>
            </svg>
          </span>
          <span class="nav-label">Products</span>
        </NuxtLink>

        <NuxtLink to="/sales" class="nav-item" active-class="nav-item--active">
          <span class="nav-badge nav-badge--indigo">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1.5" y="4" width="11" height="8.5" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
              <path d="M4.5 4V3.5a2.5 2.5 0 015 0V4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              <path d="M4.5 7.5h5M4.5 9.5h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="nav-label">Sales</span>
        </NuxtLink>

        <NuxtLink to="/customers" class="nav-item" active-class="nav-item--active">
          <span class="nav-badge nav-badge--pink">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="5" r="2.5" stroke="currentColor" stroke-width="1.3"/>
              <path d="M2 12c0-3.3 5-3.3 5-3.3s5 0 5 3.3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="nav-label">Customers</span>
        </NuxtLink>
      </nav>

      <!-- Section label -->
      <p class="sidebar-section">Production</p>

      <button class="nav-item" @click="newBatchOpen = true">
        <span class="nav-badge nav-badge--green">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="nav-label">New batch</span>
      </button>

      <div class="sidebar-spacer" />

      <!-- User -->
      <button class="sidebar-user" @click="authStore.logout()" title="Sign out">
        <div class="user-avatar">KF</div>
        <div class="user-info">
          <div class="user-name">{{ displayName }}</div>
          <div class="user-sub">Sign out</div>
        </div>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" class="signout-icon">
          <path d="M4.5 2H3A1.5 1.5 0 001.5 3.5v6A1.5 1.5 0 003 11h1.5M8.5 9.5L12 6.5 8.5 3.5M12 6.5H4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </aside>

    <!-- New batch drawer -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="newBatchOpen" class="overlay" @click.self="newBatchOpen = false">
          <Transition name="panel">
            <div v-if="newBatchOpen" class="form-panel">
              <div class="panel-header">
                <h2 class="panel-title">Start new batch</h2>
                <button class="panel-close" @click="newBatchOpen = false" aria-label="Close">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
              <div class="panel-body">
                <!-- Product field -->
                <div class="field">
                  <label class="field-label">Product name</label>
                  <select v-if="products.length" v-model="newBatchForm.selectedProductId" class="field-input">
                    <option value="">Custom name…</option>
                    <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                  <input
                    v-if="!newBatchForm.selectedProductId"
                    v-model="newBatchForm.productName"
                    type="text"
                    class="field-input"
                    :class="{ 'field-input--mt': products.length }"
                    placeholder="e.g. Lemon Original"
                    autocomplete="off"
                  />
                </div>

                <!-- Fermenter -->
                <div class="field">
                  <label class="field-label">Fermenter</label>
                  <div class="radio-group">
                    <label class="radio-option" :class="{ selected: newBatchFermenter === 'A', disabled: fermenterAInUse }">
                      <input v-model="newBatchFermenter" type="radio" value="A" :disabled="fermenterAInUse" />
                      Fermenter A
                      <span v-if="fermenterAInUse" class="in-use">In use</span>
                    </label>
                    <label class="radio-option" :class="{ selected: newBatchFermenter === 'B', disabled: fermenterBInUse }">
                      <input v-model="newBatchFermenter" type="radio" value="B" :disabled="fermenterBInUse" />
                      Fermenter B
                      <span v-if="fermenterBInUse" class="in-use">In use</span>
                    </label>
                  </div>
                </div>

                <!-- Brew date -->
                <div class="field">
                  <label class="field-label">Brew date</label>
                  <input v-model="newBatchForm.startDate" type="date" class="field-input field-input--short" />
                </div>

                <!-- Error -->
                <div v-if="newBatchError" class="form-error" role="alert">{{ newBatchError }}</div>
              </div>
              <div class="panel-footer">
                <button class="btn-cancel" @click="newBatchOpen = false">Cancel</button>
                <button
                  class="btn-submit"
                  :disabled="!resolveNewBatchProduct() || !newBatchFermenter || newBatchLoading"
                  @click="submitNewBatch()"
                >
                  {{ newBatchLoading ? 'Starting…' : 'Start brew day' }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Mobile bottom nav -->
    <nav class="mobile-nav" aria-label="Main navigation">
      <NuxtLink to="/dashboard" class="mobile-nav-item" active-class="mobile-nav-item--active">
        <span class="mobile-nav-badge nav-badge--blue">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1.2" fill="currentColor"/>
            <rect x="8" y="1" width="5" height="5" rx="1.2" fill="currentColor"/>
            <rect x="1" y="8" width="5" height="5" rx="1.2" fill="currentColor"/>
            <rect x="8" y="8" width="5" height="5" rx="1.2" fill="currentColor"/>
          </svg>
        </span>
        Overview
      </NuxtLink>
      <NuxtLink to="/log" class="mobile-nav-item" active-class="mobile-nav-item--active">
        <span class="mobile-nav-badge nav-badge--purple">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 3.5h9M2.5 7h6.5M2.5 10.5h4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </span>
        Log
      </NuxtLink>
      <button class="mobile-nav-item mobile-nav-item--new" @click="newBatchOpen = true">
        <span class="mobile-nav-badge nav-badge--green">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>
        New batch
      </button>
      <NuxtLink to="/inventory" class="mobile-nav-item" active-class="mobile-nav-item--active">
        <span class="mobile-nav-badge nav-badge--amber">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <rect x="2" y="5" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
            <path d="M2 7.5h10M5 5V4a2 2 0 014 0v1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
        </span>
        Inventory
      </NuxtLink>
      <button class="mobile-nav-item" :class="{ 'mobile-nav-item--active': mobileMenuOpen }" @click="mobileMenuOpen = true">
        <span class="mobile-nav-badge mobile-nav-badge--more">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <circle cx="3" cy="7" r="1.2" fill="currentColor"/>
            <circle cx="7" cy="7" r="1.2" fill="currentColor"/>
            <circle cx="11" cy="7" r="1.2" fill="currentColor"/>
          </svg>
        </span>
        More
      </button>
    </nav>

    <!-- Mobile "More" menu -->
    <Teleport to="body">
      <Transition name="mobile-menu">
        <div v-if="mobileMenuOpen" class="mobile-menu-overlay" @click.self="mobileMenuOpen = false">
          <div class="mobile-menu-sheet">
            <div class="mobile-menu-handle" />
            <div class="mobile-menu-header">
              <span class="mobile-menu-title">Menu</span>
              <button class="mobile-menu-close" @click="mobileMenuOpen = false" aria-label="Close menu">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <nav class="mobile-menu-nav">
              <NuxtLink to="/dashboard" class="mobile-menu-item" active-class="mobile-menu-item--active" @click="mobileMenuOpen = false">
                <span class="nav-badge nav-badge--blue"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.2" fill="currentColor"/><rect x="8" y="1" width="5" height="5" rx="1.2" fill="currentColor"/><rect x="1" y="8" width="5" height="5" rx="1.2" fill="currentColor"/><rect x="8" y="8" width="5" height="5" rx="1.2" fill="currentColor"/></svg></span>
                Overview
              </NuxtLink>
              <NuxtLink to="/log" class="mobile-menu-item" active-class="mobile-menu-item--active" @click="mobileMenuOpen = false">
                <span class="nav-badge nav-badge--purple"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 3.5h9M2.5 7h6.5M2.5 10.5h4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></span>
                Log
              </NuxtLink>
              <NuxtLink to="/inventory" class="mobile-menu-item" active-class="mobile-menu-item--active" @click="mobileMenuOpen = false">
                <span class="nav-badge nav-badge--amber"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="5" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M2 7.5h10M5 5V4a2 2 0 014 0v1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></span>
                Inventory
              </NuxtLink>
              <NuxtLink to="/duty" class="mobile-menu-item" active-class="mobile-menu-item--active" @click="mobileMenuOpen = false">
                <span class="nav-badge nav-badge--red"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="3.5" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M5 3.5V3a2 2 0 014 0v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M4.5 8l1.5 1.5 3-3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                Duty
              </NuxtLink>
              <NuxtLink to="/intake" class="mobile-menu-item" active-class="mobile-menu-item--active" @click="mobileMenuOpen = false">
                <span class="nav-badge nav-badge--orange"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="5" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M4.5 5V4a2.5 2.5 0 015 0v1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></span>
                Ingredients
              </NuxtLink>
              <NuxtLink to="/products" class="mobile-menu-item" active-class="mobile-menu-item--active" @click="mobileMenuOpen = false">
                <span class="nav-badge nav-badge--teal"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5C4.5 1.5 2.5 3.5 2.5 6c0 1.5.7 2.8 1.8 3.7L7 12.5l2.7-2.8A4.5 4.5 0 0011.5 6C11.5 3.5 9.5 1.5 7 1.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="7" cy="6" r="1.5" fill="currentColor"/></svg></span>
                Products
              </NuxtLink>
              <NuxtLink to="/sales" class="mobile-menu-item" active-class="mobile-menu-item--active" @click="mobileMenuOpen = false">
                <span class="nav-badge nav-badge--indigo"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="4" width="11" height="8.5" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 4V3.5a2.5 2.5 0 015 0V4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M4.5 7.5h5M4.5 9.5h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></span>
                Sales
              </NuxtLink>
              <NuxtLink to="/customers" class="mobile-menu-item" active-class="mobile-menu-item--active" @click="mobileMenuOpen = false">
                <span class="nav-badge nav-badge--pink"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke="currentColor" stroke-width="1.3"/><path d="M2 12c0-3.3 5-3.3 5-3.3s5 0 5 3.3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></span>
                Customers
              </NuxtLink>
              <div class="mobile-menu-divider" />
              <button class="mobile-menu-item" @click="newBatchOpen = true; mobileMenuOpen = false">
                <span class="nav-badge nav-badge--green"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span>
                New batch
              </button>
              <div class="mobile-menu-divider" />
              <button class="mobile-menu-user" @click="authStore.logout()">
                <div class="user-avatar">KF</div>
                <div class="user-info">
                  <div class="user-name">{{ displayName }}</div>
                  <div class="user-sub">Sign out</div>
                </div>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" class="signout-icon"><path d="M4.5 2H3A1.5 1.5 0 001.5 3.5v6A1.5 1.5 0 003 11h1.5M8.5 9.5L12 6.5 8.5 3.5M12 6.5H4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </nav>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Main content -->
    <main class="content">
      <slot />
    </main>

    <!-- Toasts -->
    <div class="toasts" role="status" aria-live="polite">
      <TransitionGroup name="toast">
        <div v-for="t in uiStore.toasts" :key="t.id" class="toast" :class="`toast--${t.type}`">
          <div class="toast-pip" />
          <span class="toast-msg">{{ t.message }}</span>
          <button class="toast-close" @click="uiStore.dismiss(t.id)" aria-label="Dismiss">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const uiStore   = useUiStore()

const displayName = computed(() => {
  const u = authStore.user
  if (!u) return 'Operator'
  return u.displayName || u.email?.split('@')[0] || 'Operator'
})

// ── Mobile menu ───────────────────────────────────────────
const mobileMenuOpen = ref(false)
const route = useRoute()
watch(() => route.path, () => { mobileMenuOpen.value = false })

// ── New batch drawer ──────────────────────────────────────
const { batches: activeBatches } = useActiveBatches()
const { products } = useProducts()

const newBatchOpen = ref(false)
const newBatchForm = reactive({
  productName: '',
  selectedProductId: '',
  startDate: new Date().toISOString().slice(0, 10),
})
const newBatchFermenter = ref<'A' | 'B' | ''>('')
const newBatchLoading = ref(false)
const newBatchError = ref<string | null>(null)

const fermenterAInUse = computed(() =>
  (activeBatches.value ?? []).some((b: { fermenter: string }) => b.fermenter === 'A')
)
const fermenterBInUse = computed(() =>
  (activeBatches.value ?? []).some((b: { fermenter: string }) => b.fermenter === 'B')
)

watch([fermenterAInUse, fermenterBInUse], () => {
  if (!fermenterAInUse.value) newBatchFermenter.value = 'A'
  else if (!fermenterBInUse.value) newBatchFermenter.value = 'B'
  else newBatchFermenter.value = ''
}, { immediate: true })

function resolveNewBatchProduct(): string {
  if (newBatchForm.selectedProductId) {
    const p = (products.value ?? []).find((p: { id: string; name: string }) => p.id === newBatchForm.selectedProductId)
    return p?.name ?? ''
  }
  return newBatchForm.productName
}

async function submitNewBatch() {
  const productName = resolveNewBatchProduct()
  if (!productName || !newBatchFermenter.value) return
  newBatchLoading.value = true
  newBatchError.value = null
  try {
    const id = await createBatch({
      productName,
      fermenter: newBatchFermenter.value as 'A' | 'B',
      userId: authStore.user!.uid,
      startDate: new Date(newBatchForm.startDate),
    })
    uiStore.toast(`${productName} — brew day started`, 'ok')
    newBatchOpen.value = false
    newBatchForm.productName = ''
    newBatchForm.selectedProductId = ''
    newBatchForm.startDate = new Date().toISOString().slice(0, 10)
    await navigateTo(`/batches/${id}`)
  } catch (e) {
    console.error('createBatch failed:', e)
    newBatchError.value = 'Failed to create batch. Please try again.'
  } finally {
    newBatchLoading.value = false
  }
}
</script>

<style scoped>
/* ── Shell ───────────────────────────────────────── */
.shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

/* ── Sidebar ─────────────────────────────────────── */
.sidebar {
  width: 260px;
  flex-shrink: 0;
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border-right: 1px solid rgba(0,0,0,0.07);
  display: flex;
  flex-direction: column;
  padding: 20px 14px 16px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 20px;
}
.logo-icon {
  width: 28px; height: 28px;
  border-radius: 8px;
  background: var(--accent);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(48,168,90,0.35);
}
.logo-word {
  font-family: var(--font-sans);
  font-size: 0.95rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--text-secondary);
}
.logo-word strong {
  font-weight: 700;
  color: var(--text-primary);
}

/* Nav */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-section {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-placeholder);
  padding: 16px 10px 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 8px 10px;
  border-radius: var(--r-sm);
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--text-secondary);
  letter-spacing: -0.01em;
  transition: background var(--t-fast), color var(--t-fast);
  width: 100%;
  text-align: left;
}
.nav-item:hover {
  background: rgba(0,0,0,0.05);
  color: var(--text-primary);
}
.nav-item--active {
  background: rgba(0,0,0,0.06);
  color: var(--text-primary);
  font-weight: 600;
}

/* Colored icon badges — the iOS signature */
.nav-badge {
  width: 28px; height: 28px;
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  color: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.18);
}
.nav-badge--blue   { background: linear-gradient(145deg, #4A9EFF, #1C7EF0); }
.nav-badge--purple { background: linear-gradient(145deg, #BF6EF7, #9B45E0); }
.nav-badge--orange { background: linear-gradient(145deg, #FF9640, #F0710A); }
.nav-badge--green  { background: linear-gradient(145deg, #4CD97B, #28A852); }
.nav-badge--teal   { background: linear-gradient(145deg, #5AC8FA, #32ADE6); }
.nav-badge--amber  { background: linear-gradient(145deg, #FFD60A, #FF9F0A); }
.nav-badge--indigo { background: linear-gradient(145deg, #7D6EF0, #5147D4); }
.nav-badge--pink   { background: linear-gradient(145deg, #FF6EB4, #E0367A); }
.nav-badge--red    { background: linear-gradient(145deg, #FF6B6B, #FF3B30); }

.nav-label { line-height: 1; }

.sidebar-spacer { flex: 1; }

/* User row */
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px;
  border-radius: var(--r-sm);
  border-top: 1px solid rgba(0,0,0,0.06);
  padding-top: 14px;
  margin-top: 2px;
  transition: background var(--t-fast);
}
.sidebar-user:hover { background: rgba(0,0,0,0.04); }

.user-avatar {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: linear-gradient(145deg, #4A9EFF, #1C7EF0);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono);
  font-size: 0.60rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 4px rgba(0,0,0,0.18);
}
.user-info { flex: 1; min-width: 0; text-align: left; }
.user-name {
  font-size: 0.80rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-sub { font-size: 0.67rem; color: var(--text-quarternary); margin-top: 1px; }
.signout-icon { color: var(--text-placeholder); flex-shrink: 0; }

/* ── Content ─────────────────────────────────────── */
.content { flex: 1; min-width: 0; padding: 36px 44px 64px; }

/* ── Toasts ──────────────────────────────────────── */
.toasts {
  position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  z-index: 9999; pointer-events: none;
}
.toast {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 20px;
  background: rgba(28,28,30,0.94);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-radius: 99px;
  border: 1px solid rgba(255,255,255,0.10);
  box-shadow: 0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.18);
  color: rgba(255,255,255,0.92);
  font-size: 0.92rem;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: all;
  letter-spacing: -0.01em;
}
.toast-pip {
  width: 8px; height: 8px;
  border-radius: 50%; flex-shrink: 0;
  background: var(--accent);
}
.toast--warn  .toast-pip { background: var(--amber); }
.toast--error .toast-pip { background: var(--red); }
.toast-msg { flex: 1; }
.toast-close {
  color: rgba(255,255,255,0.30);
  display: flex; align-items: center;
  margin-left: 4px;
  transition: color var(--t-fast);
}
.toast-close:hover { color: rgba(255,255,255,0.80); }

.toast-enter-active { transition: opacity 220ms var(--ease-out), transform 220ms var(--ease-spring); }
.toast-leave-active { transition: opacity 160ms var(--ease); }
.toast-enter-from   { opacity: 0; transform: translateY(-12px) scale(0.95); }
.toast-leave-to     { opacity: 0; transform: translateY(-6px) scale(0.97); }
@media (prefers-reduced-motion: reduce) {
  .toast-enter-active, .toast-leave-active { transition: none; }
}

/* ── Tablet ───────────────────────────────────────── */
@media (max-width: 1024px) {
  .sidebar { width: 220px; padding: 16px 10px 14px; }
  .content { padding: 28px 28px 64px; }
}

/* ── Mobile ───────────────────────────────────────── */
@media (max-width: 800px) {
  .shell { flex-direction: column; }
  .sidebar { display: none; }
  .content { padding: 16px 16px calc(72px + env(safe-area-inset-bottom)); }
  /* Bottom nav bar appears via .mobile-nav injected below */
}

/* ── Mobile nav bar ──────────────────────────────── */
.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 200;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(0,0,0,0.08);
  padding: 8px 4px max(8px, env(safe-area-inset-bottom));
  gap: 0;
}
@media (max-width: 800px) {
  .mobile-nav { display: flex; align-items: flex-end; justify-content: space-around; }
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 10px;
  border-radius: var(--r-sm);
  font-size: 0.58rem;
  font-weight: 500;
  color: var(--text-quarternary);
  letter-spacing: -0.01em;
  transition: color var(--t-fast);
  text-decoration: none;
  min-width: 52px;
}
.mobile-nav-item--active,
.mobile-nav-item.router-link-active { color: var(--accent-deep); }

.mobile-nav-badge {
  width: 26px; height: 26px;
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.18);
}
.mobile-nav-badge--more {
  background: var(--surface-3);
  color: var(--text-secondary);
  box-shadow: none;
  border: 1px solid var(--separator);
}
.mobile-nav-item--active .mobile-nav-badge--more,
.mobile-nav-item--new .mobile-nav-badge { box-shadow: 0 2px 8px rgba(40,168,82,0.35); }

/* ── Mobile "More" menu sheet ────────────────────── */
.mobile-menu-overlay {
  position: fixed; inset: 0; z-index: 1100;
  background: rgba(0,0,0,0.30);
  backdrop-filter: blur(4px);
  display: flex; align-items: flex-end;
}
.mobile-menu-sheet {
  width: 100%;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  box-shadow: 0 -4px 32px rgba(0,0,0,0.14);
  display: flex; flex-direction: column;
}
.mobile-menu-handle {
  width: 36px; height: 4px; border-radius: 99px;
  background: var(--separator);
  align-self: center; margin: 10px 0 4px;
  flex-shrink: 0;
}
.mobile-menu-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 20px 12px;
  border-bottom: 1px solid var(--separator-2);
  flex-shrink: 0;
}
.mobile-menu-title {
  font-size: 0.84rem; font-weight: 700;
  letter-spacing: -0.02em; color: var(--text-primary);
}
.mobile-menu-close {
  width: 28px; height: 28px; border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-quarternary);
  transition: background var(--t-fast), color var(--t-fast);
}
.mobile-menu-close:hover { background: var(--surface-3); color: var(--text-primary); }

.mobile-menu-nav {
  padding: 8px 12px;
  display: flex; flex-direction: column; gap: 2px;
  overflow-y: auto;
}
.mobile-menu-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 10px;
  border-radius: var(--r-sm);
  font-size: 0.92rem; font-weight: 400;
  color: var(--text-secondary);
  letter-spacing: -0.01em;
  text-decoration: none;
  transition: background var(--t-fast), color var(--t-fast);
  width: 100%; text-align: left;
}
.mobile-menu-item:hover { background: rgba(0,0,0,0.04); color: var(--text-primary); }
.mobile-menu-item--active { background: rgba(0,0,0,0.05); color: var(--text-primary); font-weight: 600; }

.mobile-menu-divider {
  height: 1px; background: var(--separator-2);
  margin: 6px 0;
}

.mobile-menu-user {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 10px;
  border-radius: var(--r-sm);
  width: 100%; text-align: left;
  transition: background var(--t-fast);
}
.mobile-menu-user:hover { background: rgba(0,0,0,0.04); }

.mobile-menu-enter-active { transition: opacity 200ms var(--ease); }
.mobile-menu-leave-active { transition: opacity 160ms var(--ease); }
.mobile-menu-enter-from, .mobile-menu-leave-to { opacity: 0; }
.mobile-menu-enter-active .mobile-menu-sheet { transition: transform 260ms var(--ease-spring); }
.mobile-menu-leave-active .mobile-menu-sheet { transition: transform 180ms var(--ease); }
.mobile-menu-enter-from .mobile-menu-sheet,
.mobile-menu-leave-to .mobile-menu-sheet { transform: translateY(100%); }

/* Toast tweaks on mobile */
@media (max-width: 800px) {
  .toasts { top: 12px; width: calc(100vw - 32px); left: 16px; right: 16px; transform: none; }
  .toast { white-space: normal; font-size: 0.84rem; }
}

/* ── New batch drawer ─────────────────────────────── */
.overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.28); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: flex-end;
}
.overlay-enter-active, .overlay-leave-active { transition: opacity 180ms var(--ease); }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

.form-panel {
  width: 480px; max-width: 94vw; height: 100vh;
  background: #fff; display: flex; flex-direction: column;
  box-shadow: var(--shadow-xl);
}
.panel-enter-active { transition: transform 240ms var(--ease-spring); }
.panel-leave-active { transition: transform 180ms var(--ease); }
.panel-enter-from, .panel-leave-to { transform: translateX(100%); }

.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px 14px; border-bottom: 1px solid var(--separator-2); flex-shrink: 0;
  gap: 12px;
}
.panel-title { font-size: 1.05rem; font-weight: 700; letter-spacing: -0.03em; color: var(--text-primary); }
.panel-close {
  width: 28px; height: 28px; border-radius: var(--r-sm); margin-left: 2px;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-quarternary); transition: background var(--t-fast), color var(--t-fast);
}
.panel-close:hover { background: var(--surface-3); color: var(--text-primary); }
.panel-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 18px; }
.panel-footer {
  padding: 16px 24px; border-top: 1px solid var(--separator-2);
  display: flex; gap: 10px; justify-content: flex-end; flex-shrink: 0;
}
.nav-item.disabled { opacity: 0.45; pointer-events: none; }

@media (max-width: 800px) {
  .overlay { align-items: flex-end; justify-content: stretch; }
  .form-panel { width: 100%; max-width: 100%; height: auto; max-height: 90vh; border-radius: 20px 20px 0 0; }
  .panel-enter-from, .panel-leave-to { transform: translateY(100%); }
  .panel-enter-active { transition: transform 260ms var(--ease-spring); }
  .panel-leave-active { transition: transform 200ms var(--ease); }
}
</style>
