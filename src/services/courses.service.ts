// src/services/courses.service.ts
import { api } from './api'
import type { ApiListResponse, Course, CreateCourseDto, UpdateCourseDto } from '@/types/course'

function normalizeListResponse<T>(payload: any): ApiListResponse<T> {
  // Supports either { data, total } or plain array
  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
    return {
      data: payload.data as T[],
      total: typeof payload.total === 'number' ? payload.total : payload.data.length,
    }
  }

  if (Array.isArray(payload)) {
    return { data: payload as T[], total: payload.length }
  }

  return { data: [], total: 0 }
}

export const CoursesService = {
  async list(params?: { page?: number; limit?: number; search?: string }) {
    const res = await api.get('/courses', { params })
    return normalizeListResponse<Course>(res.data)
  },

  async getById(id: string) {
    const res = await api.get<Course>(`/courses/${id}`)
    return res.data
  },

  async create(dto: CreateCourseDto) {
    const res = await api.post<Course>('/courses', dto)
    return res.data
  },

  async update(id: string, dto: UpdateCourseDto) {
    const res = await api.patch<Course>(`/courses/${id}`, dto)
    return res.data
  },

  async remove(id: string) {
    await api.delete(`/courses/${id}`)
    return true
  },
}
