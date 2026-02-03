// src/types/certificate.ts

export type CertificateStatus = 'generated' | 'pending' | 'revoked' | string

export interface CertificateStudent {
  id: string
  fullName: string
  email: string
  avatar: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CertificateCourse {
  id: string
  title: string
  category?: string | null // Frontend / Backend / ...
  level?: string | null
  status?: string | null
  thumbnail?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Certificate {
  id: string
  studentId: string
  courseId: string
  issuedAt: string
  status: CertificateStatus
  student?: CertificateStudent
  course?: CertificateCourse
}

export interface CertificatesListResponse {
  data: Certificate[]
  total: number
}

export interface UpdateCertificateDto {
  status?: CertificateStatus
  issuedAt?: string
}
