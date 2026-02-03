<script setup lang="ts">
import { ref, watch } from 'vue'
import type { VForm } from 'vuetify/components/VForm'

interface Emit {
  (e: 'update:isDialogVisible', value: boolean): void
  (e: 'submit', value: string): void
}
interface Props {
  mobileNumber?: string
  isDialogVisible: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const refForm = ref<VForm>()
const submitted = ref(false)

const phoneNumber = ref(structuredClone(toRaw(props.mobileNumber)))

const formSubmit = async () => {
  submitted.value = true
  const result = await refForm.value?.validate()
  if (!result?.valid) return

  if (phoneNumber.value) {
    emit('submit', phoneNumber.value)
    emit('update:isDialogVisible', false)
  }
}

const resetPhoneNumber = () => {
  phoneNumber.value = structuredClone(toRaw(props.mobileNumber))
  emit('update:isDialogVisible', false)
}

const dialogModelValueUpdate = (val: boolean) => {
  submitted.value = false
  refForm.value?.resetValidation()
  emit('update:isDialogVisible', val)
}

watch(props, () => {
  if (!props.isDialogVisible) {
    submitted.value = false
    refForm.value?.resetValidation()
  }
})
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-2 pa-sm-10">
      <VCardText>
        <!-- 👉 Title -->
        <h5 class="text-h5 mb-2">
          Verify Your Mobile Number for SMS
        </h5>
        <p class="text-body-1 mb-6">
          Enter your mobile phone number with country code and  we will send you a verification code.
        </p>

        <VForm
          ref="refForm"
          @submit.prevent="formSubmit"
        >
          <AppTextField
            v-model="phoneNumber"
            name="mobile"
            label="Phone Number"
            placeholder="+1 123 456 7890"
            type="number"
            class="mb-6"
            :error="submitted && !phoneNumber"
            hide-details
          />

          <div class="d-flex flex-wrap justify-end gap-4">
            <VBtn
              color="secondary"
              variant="tonal"
              @click="resetPhoneNumber"
            >
              Cancel
            </VBtn>
            <VBtn
              type="submit"
            >
              continue
              <VIcon
                end
                icon="tabler-arrow-right"
                class="flip-in-rtl"
              />
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
