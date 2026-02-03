<script setup lang="ts">
import { computed } from 'vue'
import type { Certificate } from '@/types/certificate'

const props = defineProps<{ certificate: Certificate }>()

function t(v?: string | null) {
  return String(v ?? '').trim().toLowerCase()
}

const type = computed(() => t(props.certificate.course?.category))

const palette = computed(() => {
  // English comments: map type -> colors
  if (type.value.includes('front')) return { main: '#6D28D9', soft: '#EDE9FE' } // purple
  if (type.value.includes('back')) return { main: '#2563EB', soft: '#DBEAFE' } // blue
  if (type.value.includes('design') || type.value.includes('ui') || type.value.includes('ux')) return { main: '#DB2777', soft: '#FCE7F3' } // pink
  return { main: '#4F46E5', soft: '#E0E7FF' } // default indigo
})

const student = computed(() => props.certificate.student?.fullName ?? '—')
const email = computed(() => props.certificate.student?.email ?? '—')
const course = computed(() => props.certificate.course?.title ?? '—')
const category = computed(() => props.certificate.course?.category ?? 'General')

const issued = computed(() => {
  const d = new Date(props.certificate.issuedAt)
  return Number.isNaN(d.getTime()) ? props.certificate.issuedAt : d.toLocaleDateString()
})
</script>

<template>
  <VCard class="cert-root" elevation="2">
    <div class="cert-top" :style="{ backgroundColor: palette.main }">
      <div class="d-flex align-center justify-space-between">
        <div>
          <div class="text-overline text-white opacity-90">CERTIFICATE</div>
          <div class="text-h5 text-white font-weight-bold">{{ category }}</div>
        </div>

        <VChip size="small" variant="elevated" color="white">
          <span class="font-weight-semibold" :style="{ color: palette.main }">
            {{ certificate.status }}
          </span>
        </VChip>
      </div>
    </div>

    <VCardText class="cert-body" :style="{ backgroundColor: palette.soft }">
      <div class="text-center">
        <div class="text-body-2 text-medium-emphasis mb-2">This certificate is presented to</div>
        <div class="name" :style="{ color: palette.main }">{{ student }}</div>
        <div class="text-caption text-medium-emphasis mb-6">{{ email }}</div>

        <div class="text-body-1 mb-2">For completing</div>
        <div class="course font-weight-semibold">“{{ course }}”</div>

        <div class="d-flex justify-space-between mt-8">
          <div>
            <div class="text-caption text-medium-emphasis">Issued</div>
            <div class="font-weight-medium">{{ issued }}</div>
          </div>
          <div class="text-right">
            <div class="text-caption text-medium-emphasis">Certificate ID</div>
            <div class="font-weight-medium">{{ certificate.id.slice(0, 8) }}…</div>
          </div>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.cert-root { border-radius: 16px; overflow: hidden; }
.cert-top { padding: 18px 20px; }
.cert-body { padding: 28px; }
.name { font-size: 34px; font-weight: 800; }
.course { font-size: 18px; }
</style>
