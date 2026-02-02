// src/services/quizzes.service.ts
import { api } from './api'
import type { ApiListResponse, Quiz, CreateQuizDto, UpdateQuizDto } from '@/types/quiz'

function normalize<T>(payload: any): ApiListResponse<T> {
  if (payload?.data && Array.isArray(payload.data)) {
    return {
      data: payload.data,
      total: typeof payload.total === 'number' ? payload.total : payload.data.length,
    }
  }
  if (Array.isArray(payload)) return { data: payload, total: payload.length }
  return { data: [], total: 0 }
}

export const QuizzesService = {
  async list(params?: { page?: number; limit?: number; courseId?: string }) {
    const res = await api.get('/quizzes', { params })
    return normalize<Quiz>(res.data)
  },

  async getById(id: string) {
    const res = await api.get<Quiz>(`/quizzes/${id}`)
    return res.data
  },

  async create(dto: CreateQuizDto) {
    const res = await api.post<Quiz>('/quizzes', dto)
    return res.data
  },

  async update(id: string, dto: UpdateQuizDto) {
    const res = await api.patch<Quiz>(`/quizzes/${id}`, dto)
    return res.data
  },

  async remove(id: string) {
    await api.delete(`/quizzes/${id}`)
    return true
  },
}
