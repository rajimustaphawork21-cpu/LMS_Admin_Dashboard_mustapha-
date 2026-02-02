// src/services/dashboard.service.ts
import { api } from './api'

// ====== Students ======
export interface StudentDto {
  id: string
  fullName: string
  email: string
  avatar?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface ListResponse<T> {
  data: T[]
  total: number
}

// ====== Courses (minimal) ======
export interface CourseDto {
  id: string
  title: string
  description?: string | null
  category?: string | null
  level?: string
  status?: string
  price?: string | number | null
  thumbnail?: string | null
  createdAt?: string
  updatedAt?: string
}

// ====== Enrollment (from your Swagger response) ======
export interface EnrollmentDto {
  id: string
  studentId: string
  courseId: string
  progressPercent: number
  lastLessonTitle?: string | null
  lastActivityAt?: string | null
  student?: StudentDto
  course?: CourseDto
  createdAt?: string
  updatedAt?: string
}

export interface DashboardCounts {
  totalCourses: number
  totalLessons: number
  totalQuizzes: number
  totalStudents: number
  totalCertificates: number
}

export const DashboardService = {
  async getStudents(): Promise<ListResponse<StudentDto>> {
    const res = await api.get<ListResponse<StudentDto>>('/students')
    return res.data
  },

  async getEnrollments(params?: { page?: number; limit?: number; studentId?: string; courseId?: string }): Promise<ListResponse<EnrollmentDto>> {
    const res = await api.get<ListResponse<EnrollmentDto>>('/enrollments', { params })
    return res.data
  },

  // Helper: some endpoints might return {data,total} OR array
  async getCountFromEndpoint(endpoint: string): Promise<number> {
    const res = await api.get(endpoint)

    const payload = res.data as any

    // Case 1: wrapper { data: [], total: number }
    if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
      if (typeof payload.total === 'number') return payload.total
      return payload.data.length
    }

    // Case 2: plain array []
    if (Array.isArray(payload)) return payload.length

    // Unknown shape
    return 0
  },

  async getDashboardCounts(): Promise<DashboardCounts> {
    // Fetch counts in parallel
    const [courses, lessons, quizzes, students, certificates] = await Promise.all([
      this.getCountFromEndpoint('/courses'),
      this.getCountFromEndpoint('/lessons'),
      this.getCountFromEndpoint('/quizzes'),
      this.getCountFromEndpoint('/students'),
      this.getCountFromEndpoint('/certificates'),
    ])

    return {
      totalCourses: courses,
      totalLessons: lessons,
      totalQuizzes: quizzes,
      totalStudents: students,
      totalCertificates: certificates,
    }
  },
}
