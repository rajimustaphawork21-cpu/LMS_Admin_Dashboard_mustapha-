// src/types/quiz.ts

export interface ApiListResponse<T> {
  data: T[]
  total: number
}

export interface Quiz {
  id: string
  courseId: string
  title: string
  description?: string | null
  status: 'draft' | 'published' | string
  passScore: number
  timeLimitMin: number
  questionsCount: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateQuizDto {
  courseId: string
  title: string
  description?: string | null
  status?: 'draft' | 'published' | string
  passScore?: number
  timeLimitMin?: number
}

export interface UpdateQuizDto {
  courseId?: string
  title?: string
  description?: string | null
  status?: 'draft' | 'published' | string
  passScore?: number
  timeLimitMin?: number
}
