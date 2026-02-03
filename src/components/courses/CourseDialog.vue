<script setup lang="ts">
import { computed, watch } from 'vue'
import { VForm } from 'vuetify/components/VForm'

import type { CreateCourseDto } from '@/types/course'
import { useRedValidation } from '@/composables/useRedValidation'

type DialogMode = 'create' | 'edit'

const props = defineProps<{
  modelValue: boolean
  mode: DialogMode
  saving: boolean
  form: CreateCourseDto
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save'): void
  (e: 'cancel'): void
}>()

// ✅ v-model bridge
const dialogOpen = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

// ✅ Red-only validation (no messages)
const { refForm, errorText, errorAny, validate, resetValidation } = useRedValidation()

// ✅ Reset red validation every time dialog opens
watch(
  () => props.modelValue,
  isOpen => {
    if (isOpen) resetValidation()
  },
)

// ✅ Validate only required fields then emit save
async function onSave() {
  const ok = await validate([
    !errorText(props.form.title),    // required: title
    !errorText(props.form.category), // required: category
  ])

  if (!ok) return

  emit('save')
}

function onCancel() {
  emit('cancel')
  dialogOpen.value = false
}
</script>

<template>
  <VDialog v-model="dialogOpen" width="720">
    <VCard>
      <VCardTitle class="text-h6">
        {{ mode === 'create' ? 'Create Course' : 'Edit Course' }}
      </VCardTitle>

      <VCardText>
        <VForm ref="refForm" @submit.prevent="onSave">
          <VRow>
            <!-- Title (required) -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.title"
                label="Title"
                :error="errorText(form.title)"
                hide-details
              />
            </VCol>

            <!-- Category (required) -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.category"
                label="Category"
                :error="errorText(form.category)"
                hide-details
              />
            </VCol>

            <!-- Level -->
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.level"
                :items="['Beginner', 'Intermediate', 'Advanced']"
                label="Level"
                :error="errorAny(form.level)"
                hide-details
              />
            </VCol>

            <!-- Status -->
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.status"
                :items="['draft', 'published']"
                label="Status"
                :error="errorAny(form.status)"
                hide-details
              />
            </VCol>

            <!-- Price (optional) -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.price"
                label="Price"
                type="number"
                :error="errorText(form.price)"
                hide-details
              />
            </VCol>

            <!-- Thumbnail (optional) -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.thumbnail"
                label="Thumbnail URL"
                :error="errorText(form.thumbnail)"
                hide-details
              />
            </VCol>

            <!-- Description (optional) -->
            <VCol cols="12">
              <VTextarea
                v-model="form.description"
                label="Description"
                rows="3"
                :error="errorText(form.description)"
                hide-details
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn variant="text" :disabled="saving" @click="onCancel">
          Cancel
        </VBtn>

        <VBtn color="primary" :loading="saving" type="submit" @click="onSave">
          Save
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
