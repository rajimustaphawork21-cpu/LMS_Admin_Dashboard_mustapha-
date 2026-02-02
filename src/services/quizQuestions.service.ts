// src/services/quizQuestions.service.ts
import { api } from './api'
import type { ApiListResponse, QuizQuestion, CreateQuizQuestionDto, UpdateQuizQuestionDto } from '@/types/quizQuestion'

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

export const QuizQuestionsService = {
  async list(params?: { page?: number; limit?: number; quizId?: string }) {
    const res = await api.get('/quiz-questions', { params })
    return normalize<QuizQuestion>(res.data)
  },

  async create(dto: CreateQuizQuestionDto) {
    const res = await api.post<QuizQuestion>('/quiz-questions', dto)
    return res.data
  },

  async update(id: string, dto: UpdateQuizQuestionDto) {
    const res = await api.patch<QuizQuestion>(`/quiz-questions/${id}`, dto)
    return res.data
  },

  async remove(id: string) {
    await api.delete(`/quiz-questions/${id}`)
    return true
  },
}
