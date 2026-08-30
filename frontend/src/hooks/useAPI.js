// hooks/useAPI.js — Axios instance pre-configured for the FastAPI backend
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',          // Vite proxy rewrites → http://localhost:8000/api
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: attach JWT ──────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vf_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: handle 401 ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vf_token')
      localStorage.removeItem('vf_user')
      // Optionally trigger OTP modal — handled in AuthContext
    }
    return Promise.reject(error)
  }
)

export default api

