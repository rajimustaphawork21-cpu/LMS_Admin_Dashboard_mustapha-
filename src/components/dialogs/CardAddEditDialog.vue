<script setup lang="ts">
import { ref, watch } from 'vue'
import type { VForm } from 'vuetify/components/VForm'

interface Details {
  number: string | number
  name: string
  expiry: string
  cvv: string
  isPrimary: boolean
  type: string
}
interface Emit {
  (e: 'submit', value: Details): void
  (e: 'update:isDialogVisible', value: boolean): void
}

interface Props {
  cardDetails?: Details
  isDialogVisible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  cardDetails: () => ({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    isPrimary: false,
    type: '',
  }),
})

const emit = defineEmits<Emit>()

const refForm = ref<VForm>()
const submitted = ref(false)

const cardDetails = ref<Details>(structuredClone(toRaw(props.cardDetails)))

watch(() => props, () => {
  cardDetails.value = structuredClone(toRaw(props.cardDetails))
})

const formSubmit = async () => {
  submitted.value = true
  const result = await refForm.value?.validate()
  if (!result?.valid) return

  emit('submit', cardDetails.value)
}

const dialogModelValueUpdate = (val: boolean) => {
  submitted.value = false
  refForm.value?.resetValidation()
  emit('update:isDialogVisible', val)
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 600"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-2 pa-sm-10">
      <!-- 👉 Title -->
      <VCardItem class="text-center">
        <VCardTitle>
          <h4 class="text-h4 mb-2">
            {{ props.cardDetails.name ? 'Edit Card' : 'Add New Card' }}
          </h4>
        </VCardTitle>
        <p class="text-body-1 mb-0">
          {{ props.cardDetails.name ? 'Edit your saved card details' : 'Add card for future billing' }}
        </p>
      </VCardItem>

      <VCardText class="pt-6">
        <VForm
          ref="refForm"
          @submit.prevent="formSubmit"
        >
          <VRow>
            <!-- 👉 Card Number -->
            <VCol cols="12">
              <AppTextField
                v-model="cardDetails.number"
                label="Card Number"
                placeholder="1356 3215 6548 7898"
                type="number"
                :error="submitted && !cardDetails.number"
                hide-details
              />
            </VCol>

            <!-- 👉 Card Name -->
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="cardDetails.name"
                label="Name"
                placeholder="John Doe"
                :error="submitted && !cardDetails.name"
                hide-details
              />
            </VCol>

            <!-- 👉 Card Expiry -->
            <VCol
              cols="12"
              md="3"
            >
              <AppTextField
                v-model="cardDetails.expiry"
                label="Expiry Date"
                placeholder="MM/YY"
                :error="submitted && !cardDetails.expiry"
                hide-details
              />
            </VCol>

            <!-- 👉 Card CVV -->
            <VCol
              cols="12"
              md="3"
            >
              <AppTextField
                v-model="cardDetails.cvv"
                type="number"
                label="CVV Code"
                placeholder="654"
                :error="submitted && !cardDetails.cvv"
                hide-details
              />
            </VCol>

            <!-- 👉 Card Primary Set -->
            <VCol cols="12">
              <VSwitch
                v-model="cardDetails.isPrimary"
                label="Save Card for future billing?"
              />
            </VCol>

            <!-- 👉 Card actions -->
            <VCol
              cols="12"
              class="text-center"
            >
              <VBtn
                class="me-4"
                type="submit"
              >
                Submit
              </VBtn>
              <VBtn
                color="secondary"
                variant="tonal"
                @click="dialogModelValueUpdate(false)"
              >
                Cancel
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
