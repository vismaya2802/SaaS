// hooks/useAPI.js — Axios instance pre-configured for the FastAPI backend
import axios from 'axios'

// Use environment variable or fallback to relative path for local dev
const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: baseURL,
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
