// src/types/student.ts

export interface Student {
  id: string
  fullName: string
  email: string
  avatar?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateStudentDto {
  fullName: string
  email: string
  avatar?: string | null
}

export interface UpdateStudentDto {
  fullName?: string
  email?: string
  avatar?: string | null
}

export interface ApiListResponse<T> {
  data: T[]
  total: number
}
