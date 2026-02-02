// src/services/students.service.ts
import { api } from './api'
import type { Student, ApiListResponse, CreateStudentDto, UpdateStudentDto } from '@/types/student'

function normalize<T>(payload: any): ApiListResponse<T> {
  if (payload?.data && Array.isArray(payload.data)) {
    return {
      data: payload.data,
      total: typeof payload.total === 'number' ? payload.total : payload.data.length,
    }
  }
  if (Array.isArray(payload)) {
    return { data: payload, total: payload.length }
  }
  return { data: [], total: 0 }
}

export const StudentsService = {
  async list(params?: { page?: number; limit?: number; search?: string }) {
    const res = await api.get('/students', { params })
    return normalize<Student>(res.data)
  },

  async create(dto: CreateStudentDto) {
    const res = await api.post<Student>('/students', dto)
    return res.data
  },

  async update(id: string, dto: UpdateStudentDto) {
    const res = await api.patch<Student>(`/students/${id}`, dto)
    return res.data
  },

  async remove(id: string) {
    await api.delete(`/students/${id}`)
    return true
  },
}
