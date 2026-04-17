import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import authService from '../services/authService'
import TeacherLayout from './TeacherLayout'
import Overview from './pages/Overview'
import MyStudents from './pages/MyStudents'
import Projects from './pages/Projects'
import Requests from './pages/Requests'
import Settings from './pages/Settings'
import Notifications from './pages/TeacherNotifications'  // Make sure this file exists
import Studentfiles from './pages/StudentFiles'  // Make sure this file exists

function TeacherDashboard() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken()
      const currentUser = authService.getCurrentUser()
      
      if (!token || !currentUser || currentUser.role !== 'teacher') {
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

  const handleTabChange = (tabId) => {
    console.log('Teacher changing tab to:', tabId)
    setActiveTab(tabId)
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
    console.log('Rendering page for tab:', activeTab)
    switch(activeTab) {
      case 'overview':
        return <Overview />
      case 'students':
        return <MyStudents />
      case 'projects':
        return <Projects />
      case 'requests':
        return <Requests />
      case 'notifications':
        return <Notifications />  // Return the component, not a string
      case 'students-reports':
        return <Studentfiles />  // case 'reports':
      case 'settings':
        return <Settings />
      default:
        return <Overview />
    }
  }

  return (
    <TeacherLayout 
      user={user}
      onLogout={handleLogout}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {renderPage()}
    </TeacherLayout>
  )
}

export default TeacherDashboard