// src/types/quizQuestion.ts

export interface ApiListResponse<T> {
  data: T[]
  total: number
}

export type CorrectOption = 'A' | 'B' | 'C' | 'D'

export interface QuizQuestion {
  id: string
  quizId: string
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: CorrectOption
  points: number
}

export interface CreateQuizQuestionDto {
  quizId: string
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: CorrectOption
  points: number
}

export interface UpdateQuizQuestionDto {
  text?: string
  optionA?: string
  optionB?: string
  optionC?: string
  optionD?: string
  correctOption?: CorrectOption
  points?: number
}
