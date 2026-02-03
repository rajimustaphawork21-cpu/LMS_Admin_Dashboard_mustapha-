<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useCertificatesStore } from '@/stores/certificates.store'
import CertificateCard from '@/components/certificates/CertificateCard.vue'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton.vue'

const route = useRoute()
const router = useRouter()
const store = useCertificatesStore()

const id = computed(() => String(route.params.id ?? ''))

console.log('ID:', route.params?.id)

const snackbar = ref(false)
const snackbarText = ref('')
function toast(msg: string) {
  snackbarText.value = msg
  snackbar.value = true
}

onMounted(async () => {
  try {
    await store.fetchById(id.value)
  } catch {
    toast('Failed to load certificate')
  }
})
</script>

<template>
  <div class="pa-6">
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 mb-1">Certificate</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">Preview certificate</p>
      </div>

      <VBtn variant="tonal" @click="router.go(-1)">
        <VIcon icon="tabler-arrow-left" class="me-2" />
        Back
      </VBtn>
    </div>

    <LoadingSkeleton v-if="store.byIdLoading" type="card" />

    <div v-else-if="store.current" class="mx-auto" style="max-width: 980px">
      <CertificateCard :certificate="store.current" />

      <div class="d-flex flex-column align-end gap-3 mt-6">
        <VBtn color="error" variant="tonal" @click="toast('Coming soon')">
          <VIcon icon="tabler-trash" class="me-2" />
          Delete (Coming soon)
        </VBtn>

        <VBtn color="primary" @click="toast('Coming soon')">
          <VIcon icon="tabler-download" class="me-2" />
          Download PDF (Coming soon)
        </VBtn>
      </div>
    </div>

    <VAlert v-else type="warning" variant="tonal">
      Certificate not found.
    </VAlert>

    <VSnackbar v-model="snackbar" timeout="2500" location="bottom end">
      {{ snackbarText }}
    </VSnackbar>
  </div>
</template>
