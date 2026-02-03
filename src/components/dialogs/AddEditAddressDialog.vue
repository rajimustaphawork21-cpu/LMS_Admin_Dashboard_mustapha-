<script setup lang="ts">
import { ref, watch } from 'vue'
import type { VForm } from 'vuetify/components/VForm'
import home from '@images/svg/home.svg'
import office from '@images/svg/office.svg'

interface BillingAddress {
  firstName: string | undefined
  lastName: string | undefined
  selectedCountry: string | null
  addressLine1: string
  addressLine2: string
  landmark: string
  contact: string
  country: string | null
  city: string
  state: string
  zipCode: number | null
}
interface Props {
  billingAddress?: BillingAddress
  isDialogVisible: boolean
}
interface Emit {
  (e: 'update:isDialogVisible', value: boolean): void
  (e: 'submit', value: BillingAddress): void
}

const props = withDefaults(defineProps<Props>(), {
  billingAddress: () => ({
    firstName: '',
    lastName: '',
    selectedCountry: null,
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    contact: '',
    country: null,
    city: '',
    state: '',
    zipCode: null,
  }),
})

const emit = defineEmits<Emit>()

const refForm = ref<VForm>()
const submitted = ref(false)

const billingAddress = ref<BillingAddress>(structuredClone(toRaw(props.billingAddress)))

const resetForm = () => {
  emit('update:isDialogVisible', false)
  billingAddress.value = structuredClone(toRaw(props.billingAddress))
  submitted.value = false
  refForm.value?.resetValidation()
}

const onFormSubmit = async () => {
  submitted.value = true
  const result = await refForm.value?.validate()
  if (!result?.valid) return

  emit('update:isDialogVisible', false)
  emit('submit', billingAddress.value)
}

const selectedAddress = ref('Home')

const addressTypes = [
  {
    icon: { icon: home, size: '28' },
    title: 'Home',
    desc: 'Delivery Time (9am - 9pm)',
    value: 'Home',
  },
  {
    icon: { icon: office, size: '28' },
    title: 'Office',
    desc: 'Delivery Time (9am - 5pm)',
    value: 'Office',
  },
]

watch(props, () => {
  if (!props.isDialogVisible) {
    submitted.value = false
    refForm.value?.resetValidation()
  }
})
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900 "
    :model-value="props.isDialogVisible"
    @update:model-value="val => {
      $emit('update:isDialogVisible', val)
      if (!val) {
        submitted = false
        refForm?.resetValidation()
      }
    }"
  >
    <!-- 👉 Dialog close btn -->
    <DialogCloseBtn @click="$emit('update:isDialogVisible', false)" />

    <VCard
      v-if="props.billingAddress"
      class="pa-sm-10 pa-2"
    >
      <VCardText>
        <!-- 👉 Title -->
        <h4 class="text-h4 text-center mb-2">
          {{ (props.billingAddress.addressLine1 || props.billingAddress.addressLine2) ? 'Edit' : 'Add New' }} Address
        </h4>
        <p class="text-body-1 text-center mb-6">
          Add new address for express delivery
        </p>

        <div class="d-flex mb-6">
          <CustomRadiosWithIcon
            v-model:selected-radio="selectedAddress"
            :radio-content="addressTypes"
            :grid-column="{ sm: '6', cols: '12' }"
          />
        </div>

        <!-- 👉 Form -->
        <VForm
          ref="refForm"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <!-- 👉 First Name -->
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="billingAddress.firstName"
                label="First Name"
                placeholder="John"
                :error="submitted && !billingAddress.firstName"
                hide-details
              />
            </VCol>

            <!-- 👉 Last Name -->
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="billingAddress.lastName"
                label="Last Name"
                placeholder="Doe"
                :error="submitted && !billingAddress.lastName"
                hide-details
              />
            </VCol>

            <!-- 👉 Select Country -->
            <VCol cols="12">
              <AppSelect
                v-model="billingAddress.selectedCountry"
                label="Select Country"
                placeholder="Select Country"
                :items="['USA', 'Aus', 'Canada', 'NZ']"
                :error="submitted && !billingAddress.selectedCountry"
                hide-details
              />
            </VCol>

            <!-- 👉 Address Line 1 -->
            <VCol cols="12">
              <AppTextField
                v-model="billingAddress.addressLine1"
                label="Address Line 1"
                placeholder="12, Business Park"
                :error="submitted && !billingAddress.addressLine1"
                hide-details
              />
            </VCol>

            <!-- 👉 Address Line 2 -->
            <VCol cols="12">
              <AppTextField
                v-model="billingAddress.addressLine2"
                label="Address Line 2"
                placeholder="Mall Road"
                :error="submitted && !billingAddress.addressLine2"
                hide-details
              />
            </VCol>

            <!-- 👉 Landmark -->
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="billingAddress.landmark"
                label="Landmark"
                placeholder="Nr. Hard Rock Cafe"
                :error="submitted && !billingAddress.landmark"
                hide-details
              />
            </VCol>

            <!-- 👉 City -->
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="billingAddress.city"
                label="City"
                placeholder="Los Angeles"
                :error="submitted && !billingAddress.city"
                hide-details
              />
            </VCol>

            <!-- 👉 State -->
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="billingAddress.state"
                label="State"
                placeholder="California"
                :error="submitted && !billingAddress.state"
                hide-details
              />
            </VCol>

            <!-- 👉 Zip Code -->
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="billingAddress.zipCode"
                label="Zip Code"
                placeholder="99950"
                type="number"
                :error="submitted && !billingAddress.zipCode"
                hide-details
              />
            </VCol>

            <VCol cols="12">
              <VSwitch label="Use as a billing address?" />
            </VCol>

            <!-- 👉 Submit and Cancel button -->
            <VCol
              cols="12"
              class="text-center"
            >
              <VBtn
                type="submit"
                class="me-3"
              >
                submit
              </VBtn>

              <VBtn
                variant="tonal"
                color="secondary"
                @click="resetForm"
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
