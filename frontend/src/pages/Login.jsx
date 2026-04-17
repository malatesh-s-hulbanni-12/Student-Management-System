import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import authService from '../services/authService'

function Login() {
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authService.login(email, password, role)

      if (response.success) {
        // Show success toast
        toast.success(`Welcome ${response.user.name}! Login successful!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })

        // Store user data and token
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        
        // Redirect based on role after a small delay
        setTimeout(() => {
          switch(role) {
            case 'admin':
              navigate('/admin')
              break
            case 'teacher':
              navigate('/teacher')
              break
            case 'student':
              navigate('/student')
              break
            default:
              navigate('/student')
          }
        }, 1500)
      }
    } catch (err) {
      // Show error toast
      toast.error(err.message || 'Login failed. Please try again.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Demo credentials helper
  const fillDemoCredentials = () => {
    if (role === 'admin') {
      setEmail('admin@fypms.com')
      setPassword('admin123')
      toast.info('Admin credentials filled!', {
        position: "top-right",
        autoClose: 2000,
      })
    } else if (role === 'teacher') {
      setEmail('teacher@fypms.com')
      setPassword('teacher123')
      toast.info('Teacher credentials filled!', {
        position: "top-right",
        autoClose: 2000,
      })
    } else {
      setEmail('student@fypms.com')
      setPassword('student123')
      toast.info('Student credentials filled!', {
        position: "top-right",
        autoClose: 2000,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 flex items-center justify-center p-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">Login to access your dashboard</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Role
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRole('student')
                  setError('')
                  toast.info('Student role selected', {
                    position: "top-right",
                    autoClose: 1500,
                  })
                }}
                className={`py-3 rounded-lg font-medium transition-all duration-200 ${
                  role === 'student'
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👨‍🎓 Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('teacher')
                  setError('')
                  toast.info('Teacher role selected', {
                    position: "top-right",
                    autoClose: 1500,
                  })
                }}
                className={`py-3 rounded-lg font-medium transition-all duration-200 ${
                  role === 'teacher'
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👨‍🏫 Teacher
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('admin')
                  setError('')
                  toast.info('Admin role selected', {
                    position: "top-right",
                    autoClose: 1500,
                  })
                }}
                className={`py-3 rounded-lg font-medium transition-all duration-200 ${
                  role === 'admin'
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ⚙️ Admin
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={fillDemoCredentials}
            className="w-full text-primary-600 hover:text-primary-700 text-sm font-medium py-2"
          >
            Fill Demo Credentials
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Demo Credentials:
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>🔹 Admin: admin@fypms.com / admin123</p>
            <p>🔹 Teacher: teacher@fypms.com / teacher123</p>
            <p>🔹 Student: student@fypms.com / student123</p>
          </div>
          <Link to="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1 mt-4">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login