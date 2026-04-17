import axiosInstance from './axiosConfig'

const authService = {
  // Login user
  login: async (email, password, role) => {
    try {
      const response = await axiosInstance.post('/login', {
        email,
        password,
        role
      })
      return response.data
    } catch (error) {
      console.error('Login error:', error)
      throw error.response?.data || { message: 'Network error occurred' }
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await axiosInstance.post('/verify')
      return response.data
    } catch (error) {
      console.error('Verify token error:', error)
      throw error.response?.data || { message: 'Token verification failed' }
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      return JSON.parse(userStr)
    }
    return null
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token')
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    return !!(token && user)
  }
}

export default authService