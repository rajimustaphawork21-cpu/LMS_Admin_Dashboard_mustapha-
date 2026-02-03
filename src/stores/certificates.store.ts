// src/stores/certificates.store.ts
import { defineStore } from 'pinia'
import { CertificatesService } from '@/services/certificates.service'
import type { Certificate, UpdateCertificateDto } from '@/types/certificate'

export const useCertificatesStore = defineStore('certificates', {
  state: () => ({
    items: [] as Certificate[],
    total: 0,
    loading: false,

    page: 1,
    limit: 10,
    studentId: '' as string,

    current: null as Certificate | null,
    byIdLoading: false,
  }),

  actions: {
    async fetchList() {
      this.loading = true
      try {
        const res = await CertificatesService.list({
          page: this.page,
          limit: this.limit,
          studentId: this.studentId || undefined,
        })
        this.items = res.data
        this.total = res.total
      } finally {
        this.loading = false
      }
    },

    async fetchById(id: string) {
      this.byIdLoading = true
      try {
        this.current = await CertificatesService.getById(id)
      } finally {
        this.byIdLoading = false
      }
    },

    async update(id: string, dto: UpdateCertificateDto) {
      await CertificatesService.update(id, dto)
    },

    async remove(id: string) {
      await CertificatesService.remove(id)
    },
  },
})
