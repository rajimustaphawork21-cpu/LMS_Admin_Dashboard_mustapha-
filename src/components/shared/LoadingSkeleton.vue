<!-- src/components/shared/LoadingSkeleton.vue -->
<script setup lang="ts">
withDefaults(defineProps<{ type?: 'table' | 'cards' }>(), {
  type: 'table',
})
</script>

<template>
  <div v-if="type === 'table'">
    <VSkeletonLoader type="table" />
  </div>
  <div v-else class="d-flex gap-4 flex-wrap">
    <VSkeletonLoader type="card" width="240" />
    <VSkeletonLoader type="card" width="240" />
    <VSkeletonLoader type="card" width="240" />
  </div>
</template>
