// src/types/course.ts

export interface Course {
  id: string
  title: string
  description?: string | null
  category?: string | null
  level?: string | null
  status?: string | null
  price?: string | number | null
  thumbnail?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateCourseDto {
  title: string
  description?: string | null
  category?: string | null
  level?: string | null
  status?: string | null
  price?: string | number | null
  thumbnail?: string | null
}

export interface UpdateCourseDto {
  title?: string
  description?: string | null
  category?: string | null
  level?: string | null
  status?: string | null
  price?: string | number | null
  thumbnail?: string | null
}

export interface ApiListResponse<T> {
  data: T[]
  total: number
}
