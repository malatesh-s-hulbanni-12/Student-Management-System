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
import Notifications from './pages/TeacherNotifications'
import Studentfiles from './pages/StudentFiles'
import { 
  FiPlus, 
  FiFileText, 
  FiUsers, 
  FiBarChart2, 
  FiFolder,
  FiBell,
  FiSettings as FiSettingsIcon,
  FiX
} from 'react-icons/fi'

function TeacherDashboard() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [showQuickActions, setShowQuickActions] = useState(false)

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
    setShowQuickActions(false)
  }

  // Quick action items in vertical list (layers style)
  const quickActions = [
    { id: 'overview', icon: FiBarChart2, label: 'Overview', color: 'text-blue-600', bgHover: 'hover:bg-blue-50' },
    { id: 'students', icon: FiUsers, label: 'My Students', color: 'text-green-600', bgHover: 'hover:bg-green-50' },
    { id: 'projects', icon: FiFileText, label: 'Projects', color: 'text-purple-600', bgHover: 'hover:bg-purple-50' },
    { id: 'requests', icon: FiBarChart2, label: 'Requests', color: 'text-orange-600', bgHover: 'hover:bg-orange-50' },
    { id: 'students-reports', icon: FiFolder, label: 'Student Files', color: 'text-pink-600', bgHover: 'hover:bg-pink-50' },
    { id: 'notifications', icon: FiBell, label: 'Notifications', color: 'text-red-600', bgHover: 'hover:bg-red-50' },
    { id: 'settings', icon: FiSettingsIcon, label: 'Settings', color: 'text-gray-600', bgHover: 'hover:bg-gray-50' },
  ]

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
        return <Notifications />
      case 'students-reports':
        return <Studentfiles />
      case 'settings':
        return <Settings />
      default:
        return <Overview />
    }
  }

  return (
    <>
      <TeacherLayout 
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        {renderPage()}
      </TeacherLayout>

      {/* Floating Quick Actions Menu - Vertical List (Layers Style) */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Quick Actions Menu - Vertical List */}
        {showQuickActions && (
          <div className="absolute bottom-14 right-0 mb-2 space-y-2 animate-in fade-in slide-in-from-bottom-5 duration-200">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleTabChange(action.id)}
                className={`flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 shadow-lg hover:shadow-xl transition-all w-44 border border-gray-100 ${action.bgHover}`}
              >
                <div className="p-1.5 rounded-full bg-gray-50">
                  <action.icon size={16} className={action.color} />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        )}
        
        {/* Main Floating Button */}
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className={`
            w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg 
            hover:bg-blue-700 hover:shadow-xl transition-all duration-300 
            flex items-center justify-center
            ${showQuickActions ? 'rotate-45 bg-blue-700' : 'rotate-0'}
          `}
        >
          {showQuickActions ? <FiX size={22} /> : <FiPlus size={22} />}
        </button>
      </div>
    </>
  )
}

export default TeacherDashboard