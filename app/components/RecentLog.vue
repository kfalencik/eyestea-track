<template>
  <div style="overflow-x: auto;">
    <table class="log-table" aria-label="Recent production log entries">
      <thead>
        <tr>
          <th scope="col">Batch</th>
          <th scope="col">Date</th>
          <th scope="col">Event</th>
          <th scope="col">Reading</th>
          <th scope="col">Operator</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!rows.length">
          <td colspan="5" class="empty-row">No readings yet — start your first batch.</td>
        </tr>
        <tr v-for="row in rows" :key="row.id">
          <td><NuxtLink :to="`/batches/${row.batchDocId}`" class="batch-link">{{ row.batchDocId }}</NuxtLink></td>
          <td>{{ row.date }}</td>
          <td>{{ row.event }}</td>
          <td>{{ row.reading }}</td>
          <td>{{ row.operator }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { query, orderBy, limit, collectionGroup } from 'firebase/firestore'
import { useCollection, useFirestore, useCurrentUser } from 'vuefire'
import type { BatchReading } from '~/types/batch'

const db = useFirestore()
const user = useCurrentUser()

const readings = useCollection<BatchReading & { id: string }>(
  computed(() => user.value ? query(collectionGroup(db, 'readings'), orderBy('recordedAt', 'desc'), limit(20)) : null)
)

const rows = computed(() => {
  return (readings.value ?? []).map(r => {
    const path = (r as unknown as { _path?: { segments: string[] } })._path
    const batchDocId = path?.segments[1] ?? ''
    return {
      id: r.id,
      batchDocId,
      date: r.recordedAt?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) ?? '',
      event: r.type === 'gravity' ? 'Gravity reading' : 'Temperature reading',
      reading: r.type === 'gravity' ? r.value.toFixed(3) + ' SG' : r.value + '°C',
      operator: r.recordedBy ?? '',
    }
  }).slice(0, 15)
})
</script>

<style scoped>
.log-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
.log-table th {
  text-align: left;
  padding: 14px 24px 10px;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-quarternary);
  border-bottom: 1px solid var(--separator-2);
  white-space: nowrap;
}
.log-table td {
  padding: 13px 24px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--separator-2);
  vertical-align: middle;
}
.log-table tbody tr:last-child td { border-bottom: none; }
.log-table tbody tr { transition: background var(--t-fast); }
.log-table tbody tr:hover td { background: var(--surface-2); }
.batch-link {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.02em;
  transition: color var(--t-fast);
}
.batch-link:hover { color: var(--accent); }
.empty-row {
  text-align: center;
  padding: 48px 0;
  color: var(--text-quarternary);
  font-size: 0.88rem;
}
</style>
