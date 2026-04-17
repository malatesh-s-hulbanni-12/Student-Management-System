import axios from 'axios'

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create axios instance with base URL (adding /api prefix)
const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('Making request to:', config.baseURL + config.url)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data)
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance