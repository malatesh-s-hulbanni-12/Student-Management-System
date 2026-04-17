import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import authService from '../services/authService'
import StudentLayout from './StudentLayout'
import Overview from './pages/Overview'
import SubmitProposal from './pages/SubmitProposal'
import UploadFiles from './pages/UploadFiles'
import Supervisor from './pages/Supervisor'
import Feedback from './pages/Feedback'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'

function StudentDashboard() {
  const navigate = useNavigate()
  const { showSuccess } = useToast()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken()
      const currentUser = authService.getCurrentUser()
      
      if (!token || !currentUser || currentUser.role !== 'student') {
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
    authService.logout()
    navigate('/')
  }

  const handleTabChange = (tabId) => {
    console.log('Changing tab to:', tabId)
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
    console.log('Current activeTab:', activeTab)
    
    if (activeTab === 'overview') return <Overview />
    if (activeTab === 'submit-proposal') return <SubmitProposal />
    if (activeTab === 'upload-files') return <UploadFiles />
    if (activeTab === 'supervisor') return <Supervisor />
    if (activeTab === 'feedback') return <Feedback />
    if (activeTab === 'notifications') return <Notifications />
    if (activeTab === 'settings') return <Settings />
    
    return <Overview />
  }

  return (
    <StudentLayout 
      user={user}
      onLogout={handleLogout}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {renderPage()}
    </StudentLayout>
  )
}

export default StudentDashboard