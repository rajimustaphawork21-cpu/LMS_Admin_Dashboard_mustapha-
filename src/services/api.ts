import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://emerald-unascertained-aidan.ngrok-free.dev/api',
  timeout: 20000,
  headers: {
    // Required for ngrok to skip browser warning page
    'ngrok-skip-browser-warning': 'true',
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  res => res,
  err => {
    // Keep it simple for now
    console.error('API Error:', err?.response?.status, err?.message)
    return Promise.reject(err)
  },
)
