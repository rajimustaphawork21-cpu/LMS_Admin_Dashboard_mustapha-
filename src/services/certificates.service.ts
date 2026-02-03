// src/services/certificates.service.ts
import { api } from './api'
import type { Certificate, CertificatesListResponse, UpdateCertificateDto } from '@/types/certificate'

export const CertificatesService = {
  async list(params?: { page?: number; limit?: number; studentId?: string }) {
    const res = await api.get<CertificatesListResponse>('/certificates', { params })
    return res.data
  },

  async getById(id: string) {
    const res = await api.get<Certificate>(`/certificates/${id}`)
    return res.data
  },

  async update(id: string, dto: UpdateCertificateDto) {
    const res = await api.patch<Certificate>(`/certificates/${id}`, dto)
    return res.data
  },

  async remove(id: string) {
    await api.delete(`/certificates/${id}`)
  },
}
