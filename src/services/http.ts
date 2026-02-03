import axios, { AxiosError } from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 15000,
  headers: { Accept: 'application/json' },
})

// Request interceptor (اختياري)
api.interceptors.request.use(config => {
  config.headers['X-App'] = 'LMS-Admin'
  return config
})

// Response interceptor (باش توحّد errors)
api.interceptors.response.use(
  res => res,
  (err: AxiosError<any>) => {
    const status = err.response?.status ?? 0
    const data = err.response?.data
    const message =
      (data && (data.message || data.error)) ||
      err.message ||
      'Request failed'
    return Promise.reject({ status, message, data })
  },
)
