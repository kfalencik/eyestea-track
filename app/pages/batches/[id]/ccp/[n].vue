<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const route = useRoute()
await navigateTo(`/batches/${route.params.id}`, { replace: true })
</script>
