<!-- src/components/shared/EmptyState.vue -->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  actionText?: string
}>(), {
  title: 'No data',
  subtitle: 'Nothing to show here yet.',
  actionText: '',
})

const emit = defineEmits<{
  (e: 'action'): void
}>()
</script>

<template>
  <div class="text-center py-10">
    <div class="text-h6 mb-1">{{ props.title }}</div>
    <div class="text-body-2 text-medium-emphasis mb-4">{{ props.subtitle }}</div>

    <VBtn v-if="props.actionText" variant="tonal" @click="emit('action')">
      {{ props.actionText }}
    </VBtn>
  </div>
</template>
