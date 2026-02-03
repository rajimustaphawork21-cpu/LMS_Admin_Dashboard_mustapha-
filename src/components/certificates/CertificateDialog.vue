<script setup lang="ts">
import { computed, watch } from 'vue'
import type { CreateCertificateDto } from '@/types/certificate'
import { useRedValidation } from '@/composables/useRedValidation'

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  saving: boolean
  form: CreateCertificateDto
  students: Array<{ id: string; fullName: string; email: string }>
  courses: Array<{ id: string; title: string; category?: string | null }>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save'): void
  (e: 'cancel'): void
}>()

const dialogOpen = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const { refForm, errorAny, validate, resetValidation } = useRedValidation()

watch(
  () => props.modelValue,
  isOpen => {
    if (isOpen) resetValidation()
  },
)

async function onSave() {
  const ok = await validate([
    !errorAny(props.form.studentId),
    !errorAny(props.form.courseId),
  ])
  if (!ok) return
  emit('save')
}
</script>

<template>
  <VDialog v-model="dialogOpen" width="700">
    <VCard>
      <VCardTitle class="text-h6">
        {{ mode === 'create' ? 'Create Certificate' : 'Edit Certificate' }}
      </VCardTitle>

      <VCardText>
        <VForm ref="refForm" @submit.prevent="onSave">
          <VRow>
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.studentId"
                label="Student"
                :items="students"
                item-title="fullName"
                item-value="id"
                :error="errorAny(form.studentId)"
                hide-details
              >
                <template #item="{ props: p, item }">
                  <VListItem v-bind="p" :title="item.raw.fullName" :subtitle="item.raw.email" />
                </template>
              </VSelect>
            </VCol>

            <VCol cols="12" md="6">
              <VSelect
                v-model="form.courseId"
                label="Course"
                :items="courses"
                item-title="title"
                item-value="id"
                :error="errorAny(form.courseId)"
                hide-details
              >
                <template #item="{ props: p, item }">
                  <VListItem v-bind="p" :title="item.raw.title" :subtitle="item.raw.category ?? ''" />
                </template>
              </VSelect>
            </VCol>

            <VCol cols="12" md="6">
              <VSelect
                v-model="form.status"
                label="Status"
                :items="['generated', 'pending', 'revoked']"
                hide-details
              />
            </VCol>

            <VCol cols="12" md="6">
              <VTextField
                v-model="form.issuedAt"
                label="Issued At (optional)"
                placeholder="2026-02-02T11:07:39.272Z"
                hide-details
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn variant="text" :disabled="saving" @click="emit('cancel'); dialogOpen=false">
          Cancel
        </VBtn>
        <VBtn color="primary" :loading="saving" type="submit" @click="onSave">
          Save
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
