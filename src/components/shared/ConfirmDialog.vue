<!-- src/components/shared/ConfirmDialog.vue -->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
}>(), {
  title: 'Confirm',
  message: 'Are you sure?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  loading: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm'): void
}>()

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <VDialog :model-value="props.modelValue" width="420" @update:model-value="emit('update:modelValue', $event)">
    <VCard>
      <VCardTitle class="text-h6">{{ props.title }}</VCardTitle>
      <VCardText class="text-body-2 text-medium-emphasis">
        {{ props.message }}
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn variant="text" :disabled="props.loading" @click="close">
          {{ props.cancelText }}
        </VBtn>
        <VBtn color="error" variant="tonal" :loading="props.loading" @click="emit('confirm')">
          {{ props.confirmText }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
