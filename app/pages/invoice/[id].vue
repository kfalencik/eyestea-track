<template>
  <div class="invoice-page">

    <!-- Screen toolbar (hidden on print) -->
    <div class="toolbar no-print">
      <NuxtLink to="/sales" class="toolbar-back">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back to Sales
      </NuxtLink>
      <div class="toolbar-actions">
        <button class="toolbar-btn" @click="printPage()">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="2" y="4" width="10" height="7" rx="1.2" stroke="currentColor" stroke-width="1.2"/>
            <path d="M4 4V2.5h6V4M4 8.5h6M4 10.5h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          Print / Save PDF
        </button>
      </div>
    </div>

    <!-- Invoice document -->
    <div v-if="order" class="invoice">

      <!-- Header -->
      <div class="inv-header">
        <div class="inv-from">
          <div class="inv-brand">EyesTea</div>
          <div class="inv-from-details">
            <div>EyesTea Brewing Ltd</div>
            <div>123 Brewery Lane</div>
            <div>Birmingham, B1 1AA</div>
            <div>United Kingdom</div>
            <div class="inv-vat">VAT No. GB 000 0000 00</div>
          </div>
        </div>
        <div class="inv-meta">
          <div class="inv-title">Invoice</div>
          <table class="inv-meta-table">
            <tr>
              <td class="meta-key">Invoice no.</td>
              <td class="meta-val">{{ order.orderRef }}</td>
            </tr>
            <tr>
              <td class="meta-key">Date</td>
              <td class="meta-val">{{ formatDate(order.orderedAt) }}</td>
            </tr>
            <tr v-if="order.dispatchedAt">
              <td class="meta-key">Dispatched</td>
              <td class="meta-val">{{ formatDate(order.dispatchedAt) }}</td>
            </tr>
            <tr>
              <td class="meta-key">Status</td>
              <td class="meta-val">
                <span class="status-chip" :class="`status-chip--${order.status}`">
                  {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
                </span>
              </td>
            </tr>
          </table>
        </div>
      </div>

      <div class="inv-divider" />

      <!-- Bill to -->
      <div class="inv-parties">
        <div class="inv-to">
          <div class="inv-section-label">Bill to</div>
          <div class="inv-to-name">{{ order.customer }}</div>
          <template v-if="customer">
            <div v-if="customer.company && customer.company !== customer.name" class="inv-to-sub">{{ customer.company }}</div>
            <div v-if="customer.address?.line1">{{ customer.address.line1 }}</div>
            <div v-if="customer.address?.line2">{{ customer.address.line2 }}</div>
            <div v-if="customer.address?.city || customer.address?.county">
              {{ [customer.address.city, customer.address.county].filter(Boolean).join(', ') }}
            </div>
            <div v-if="customer.address?.postcode">{{ customer.address.postcode }}</div>
            <div v-if="customer.address?.country">{{ customer.address.country }}</div>
            <div v-if="customer.vatNumber" class="inv-to-vat">VAT No. {{ customer.vatNumber }}</div>
          </template>
        </div>
        <div class="inv-payment">
          <div class="inv-section-label">Payment</div>
          <div class="inv-payment-terms">
            {{ paymentTerms }}
          </div>
          <div class="inv-bank">
            <div class="bank-row"><span>Bank</span><span>Placeholder Bank plc</span></div>
            <div class="bank-row"><span>Sort code</span><span>00-00-00</span></div>
            <div class="bank-row"><span>Account</span><span>00000000</span></div>
            <div class="bank-row"><span>Reference</span><span>{{ order.orderRef }}</span></div>
          </div>
        </div>
      </div>

      <div class="inv-divider" />

      <!-- Line items -->
      <table class="inv-table">
        <thead>
          <tr>
            <th class="th-left">Product</th>
            <th class="th-left">Batch / Lot</th>
            <th class="th-right">Size</th>
            <th class="th-right">Qty</th>
            <th class="th-right">Unit price</th>
            <th class="th-right">Line total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(line, i) in order.lines" :key="i">
            <td>{{ line.productName }}</td>
            <td class="td-mono">{{ line.batchRef }}<span v-if="line.lotCode" class="lot-code"> · {{ line.lotCode }}</span></td>
            <td class="td-right">{{ line.canSizeMl }}mL</td>
            <td class="td-right">{{ line.cans }}</td>
            <td class="td-right">£{{ line.unitPrice.toFixed(2) }}</td>
            <td class="td-right td-bold">£{{ (line.cans * line.unitPrice).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Totals -->
      <div class="inv-totals">
        <table class="totals-table">
          <tr>
            <td class="totals-key">Subtotal (ex. VAT)</td>
            <td class="totals-val">£{{ subtotal.toFixed(2) }}</td>
          </tr>
          <tr>
            <td class="totals-key">VAT @ 20%</td>
            <td class="totals-val">£{{ vatAmount.toFixed(2) }}</td>
          </tr>
          <tr class="totals-row--total">
            <td class="totals-key">Total</td>
            <td class="totals-val">£{{ total.toFixed(2) }}</td>
          </tr>
        </table>
      </div>

      <!-- Notes -->
      <div v-if="order.notes" class="inv-notes">
        <div class="inv-section-label">Notes</div>
        <p>{{ order.notes }}</p>
      </div>

      <!-- Footer -->
      <div class="inv-footer">
        <div>EyesTea Brewing Ltd · Registered in England & Wales · VAT No. GB 000 0000 00</div>
        <div>AWRS URN: XXAW00000000000</div>
      </div>

    </div>

    <div v-else-if="pending" class="loading">Loading invoice…</div>
    <div v-else class="loading">Order not found.</div>

  </div>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { Order } from '~/types/order'
import type { Customer } from '~/types/customer'
import type { Timestamp } from 'firebase/firestore'

definePageMeta({ layout: 'print', middleware: 'auth' })

const route = useRoute()
const db = useFirestore()

// ── Load order ─────────────────────────────────────────────
const pending = ref(true)
const order = ref<Order | null>(null)
const customer = ref<Customer | null>(null)

onMounted(async () => {
  try {
    const snap = await getDoc(doc(db, 'orders', route.params.id as string))
    if (snap.exists()) {
      order.value = { id: snap.id, ...snap.data() } as Order
      // Load linked customer if present
      if (order.value.customerId) {
        const cSnap = await getDoc(doc(db, 'customers', order.value.customerId))
        if (cSnap.exists()) customer.value = { id: cSnap.id, ...cSnap.data() } as Customer
      }
    }
  } finally {
    pending.value = false
  }
})

// ── VAT calculations ───────────────────────────────────────
// Use stored values if present (new orders), otherwise recalculate
const subtotal = computed(() => {
  if (order.value?.subtotal != null) return order.value.subtotal
  return order.value?.lines.reduce((s, l) => s + l.cans * l.unitPrice, 0) ?? 0
})
const vatAmount = computed(() => {
  if (order.value?.vatAmount != null) return order.value.vatAmount
  return Math.round(subtotal.value * 0.20 * 100) / 100
})
const total = computed(() => {
  if (order.value?.total != null) return order.value.total
  return Math.round((subtotal.value + vatAmount.value) * 100) / 100
})

// ── Payment terms ──────────────────────────────────────────
const paymentTerms = computed(() => {
  const days = customer.value?.paymentTermsDays ?? 0
  if (!days) return 'Pro-forma — payment with order'
  const due = order.value?.orderedAt?.toDate()
  if (due) {
    due.setDate(due.getDate() + days)
    return `${days} days — due ${due.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
  }
  return `${days} days net`
})

// ── Helpers ────────────────────────────────────────────────
function formatDate(ts: Timestamp | null | undefined): string {
  if (!ts?.toDate) return '—'
  return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function printPage() {
  window.print()
}
</script>

<style scoped>
/* ── Screen wrapper ─────────────────────────────────────── */
.invoice-page {
  min-height: 100vh;
  background: #f2f2f7;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 60px;
}

/* ── Toolbar ────────────────────────────────────────────── */
.toolbar {
  width: 100%;
  max-width: 860px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}
.toolbar-back {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.82rem; font-weight: 500; color: #555;
  text-decoration: none;
  transition: color 120ms;
}
.toolbar-back:hover { color: #111; }
.toolbar-btn {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 0.82rem; font-weight: 600; padding: 8px 16px;
  border-radius: 8px;
  background: linear-gradient(145deg, #4CD97B, #28A852); color: #fff;
  box-shadow: 0 1px 6px rgba(40,168,82,0.25);
  transition: box-shadow 120ms, transform 120ms;
}
.toolbar-btn:hover { box-shadow: 0 3px 10px rgba(40,168,82,0.35); transform: translateY(-1px); }

/* ── Invoice document ───────────────────────────────────── */
.invoice {
  width: 100%;
  max-width: 860px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.10);
  padding: 56px 64px;
  box-sizing: border-box;
}

/* Header */
.inv-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
}
.inv-brand {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.05em;
  color: #1C1C1E;
  margin-bottom: 10px;
}
.inv-from-details {
  font-size: 0.82rem;
  color: #555;
  line-height: 1.7;
}
.inv-vat { color: #888; margin-top: 4px; }

.inv-meta { text-align: right; }
.inv-title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: #1C1C1E;
  margin-bottom: 14px;
}
.inv-meta-table { margin-left: auto; border-collapse: collapse; }
.meta-key {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #8E8E93;
  padding: 2px 14px 2px 0;
  white-space: nowrap;
}
.meta-val {
  font-size: 0.85rem;
  color: #1C1C1E;
  font-weight: 500;
  text-align: right;
}

.status-chip {
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; padding: 2px 8px; border-radius: 99px;
}
.status-chip--confirmed { background: rgba(76,217,123,0.12); color: #1A6B38; }
.status-chip--dispatched { background: rgba(28,126,240,0.10); color: #1C5EBF; }
.status-chip--draft { background: #F2F2F7; color: #8E8E93; }

.inv-divider {
  border: none;
  border-top: 1px solid #E5E5EA;
  margin: 32px 0;
}

/* Bill to / payment */
.inv-parties {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}
.inv-section-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #8E8E93;
  margin-bottom: 8px;
}
.inv-to-name { font-size: 1rem; font-weight: 700; color: #1C1C1E; margin-bottom: 2px; }
.inv-to-sub { font-size: 0.80rem; color: #555; margin-bottom: 4px; }
.inv-to { font-size: 0.82rem; color: #555; line-height: 1.7; }
.inv-to-vat { color: #8E8E93; margin-top: 4px; }

.inv-payment-terms {
  font-size: 0.85rem; font-weight: 600; color: #1C1C1E; margin-bottom: 12px;
}
.inv-bank {
  display: flex; flex-direction: column; gap: 3px;
  background: #F9F9FB; border-radius: 8px; padding: 10px 14px;
}
.bank-row {
  display: flex; justify-content: space-between;
  font-size: 0.75rem; color: #555;
}
.bank-row span:first-child { color: #8E8E93; }
.bank-row span:last-child { font-weight: 600; color: #1C1C1E; font-family: ui-monospace, monospace; }

/* Line items table */
.inv-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
}
.inv-table th {
  padding: 8px 10px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #8E8E93;
  border-bottom: 1.5px solid #E5E5EA;
}
.th-left { text-align: left; }
.th-right { text-align: right; }

.inv-table td {
  padding: 11px 10px;
  color: #1C1C1E;
  border-bottom: 1px solid #F2F2F7;
  vertical-align: top;
}
.td-mono { font-family: ui-monospace, monospace; font-size: 0.75rem; color: #8E8E93; }
.lot-code { color: #AEAEB2; }
.td-right { text-align: right; }
.td-bold { font-weight: 700; }

/* Totals */
.inv-totals {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
.totals-table {
  border-collapse: collapse;
  min-width: 280px;
}
.totals-table td { padding: 5px 10px; font-size: 0.85rem; }
.totals-key { color: #555; text-align: left; padding-right: 32px; }
.totals-val { text-align: right; font-weight: 500; color: #1C1C1E; font-family: ui-monospace, monospace; }
.totals-row--total td {
  font-size: 1rem; font-weight: 700;
  border-top: 1.5px solid #E5E5EA;
  padding-top: 10px; margin-top: 4px;
  color: #1C1C1E;
}

/* Notes */
.inv-notes {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #F2F2F7;
}
.inv-notes p {
  font-size: 0.83rem; color: #555; line-height: 1.6; margin: 6px 0 0;
  white-space: pre-wrap;
}

/* Footer */
.inv-footer {
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid #E5E5EA;
  font-size: 0.70rem;
  color: #AEAEB2;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* Loading */
.loading {
  padding: 80px;
  text-align: center;
  color: #8E8E93;
  font-size: 0.9rem;
}

/* ── Print styles ───────────────────────────────────────── */
@media print {
  .no-print { display: none !important; }

  .invoice-page {
    background: #fff;
    padding: 0;
    display: block;
  }
  .invoice {
    box-shadow: none;
    border-radius: 0;
    max-width: 100%;
    padding: 24mm 20mm;
  }

  @page {
    size: A4;
    margin: 0;
  }
}
</style>
