// src/composables/useRedValidation.ts
import { ref } from 'vue'
import type { VForm } from 'vuetify/components/VForm'

// Red-only validation composable (no messages)
export function useRedValidation() {
  const refForm = ref<VForm>()
  const submitted = ref(false)

  // Empty helpers
  const isEmpty = (v: any) => v === null || v === undefined || v === ''
  const isEmptyText = (v: any) => !String(v ?? '').trim()

  // Use in template: :error="errorText(form.title)"
  const errorText = (v: any) => submitted.value && isEmptyText(v)
  const errorAny = (v: any) => submitted.value && isEmpty(v)

  // Call this before submit API
  const validate = async (checks?: boolean[]) => {
    submitted.value = true

    // If you pass custom checks: validate([cond1, cond2])
    if (checks?.length) return checks.every(Boolean)

    // If you use Vuetify rules and want validate() as well:
    const res = await refForm.value?.validate()
    return !!res?.valid
  }

  const resetValidation = () => {
    submitted.value = false
    refForm.value?.resetValidation()
  }

  return {
    refForm,
    submitted,
    isEmpty,
    isEmptyText,
    errorText,
    errorAny,
    validate,
    resetValidation,
  }
}
