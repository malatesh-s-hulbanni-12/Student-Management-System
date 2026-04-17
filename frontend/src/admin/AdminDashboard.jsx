import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import authService from '../services/authService'
import AdminLayout from './AdminLayout'
import Overview from './pages/Overview'
import Students from './pages/Students'
import Teachers from './pages/Teachers'
import Projects from './pages/Projects'
import Assignsuprivser from './pages/Assignsuprivser'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function AdminDashboard() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken()
      const currentUser = authService.getCurrentUser()
      
      if (!token || !currentUser || currentUser.role !== 'admin') {
        navigate('/login')
        return
      }

      try {
        const response = await authService.verifyToken()
        if (response.success) {
          setUser(currentUser)
          showSuccess(`Welcome back, ${currentUser.name}!`)
        } else {
          authService.logout()
          navigate('/login')
        }
      } catch (error) {
        authService.logout()
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [navigate, showSuccess])

  const handleLogout = () => {
    showSuccess('Logged out successfully!')
    authService.logout()
    setTimeout(() => {
      navigate('/')
    }, 1500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const renderPage = () => {
    switch(activeTab) {
      case 'overview':
        return <Overview />
      case 'students':
        return <Students />
      case 'teachers':
        return <Teachers />
      case 'projects':
        return <Projects />
      case 'assign supervisors':
        return <Assignsuprivser />
      case 'reports':
        return <Reports />
      case 'settings':
        return <Settings />
      default:
        return <Overview />
    }
  }

  return (
    <AdminLayout 
      user={user}
      onLogout={handleLogout}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderPage()}
    </AdminLayout>
  )
}

export default AdminDashboard