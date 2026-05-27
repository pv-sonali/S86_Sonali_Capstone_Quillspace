import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor for error handling (#12)
// FIX: Don't hard-redirect on 401 — let the AuthContext handle it via its
// own /auth/me call. Only redirect if a non-auth endpoint gets a 401 AND
// we're not already on an auth endpoint (to prevent loops).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const requestUrl = error.config?.url || ''

    if (status === 401) {
      // Don't redirect if the 401 came from auth endpoints — AuthContext handles those
      const isAuthEndpoint =
        requestUrl.includes('/auth/me') ||
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register')

      if (!isAuthEndpoint) {
        // Clear stale auth data but use React routing instead of hard redirect
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Only hard redirect if we're not in a React context that can handle it
        if (typeof window !== 'undefined' && !window.__QUILLSPACE_AUTH_HANDLING__) {
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api
