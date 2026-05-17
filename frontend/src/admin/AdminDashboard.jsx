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
import { 
  FiPlus, 
  FiX,
  FiGrid,
  FiUsers,
  FiUserCheck,
  FiFolder,
  FiClock,
  FiBarChart2,
  FiSettings as FiSettingsIcon
} from 'react-icons/fi'

function AdminDashboard() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

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

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setMenuOpen(false)
  }

  // Actions with colors matching sidebar
  const actions = [
    { id: 'overview', icon: FiGrid, label: 'Overview', bgColor: 'bg-blue-500', hoverBg: 'hover:bg-blue-600' },
    { id: 'students', icon: FiUsers, label: 'Students', bgColor: 'bg-green-500', hoverBg: 'hover:bg-green-600' },
    { id: 'teachers', icon: FiUserCheck, label: 'Teachers', bgColor: 'bg-purple-500', hoverBg: 'hover:bg-purple-600' },
    { id: 'projects', icon: FiFolder, label: 'Projects', bgColor: 'bg-orange-500', hoverBg: 'hover:bg-orange-600' },
    { id: 'assign supervisors', icon: FiClock, label: 'Assign', bgColor: 'bg-pink-500', hoverBg: 'hover:bg-pink-600' },
    { id: 'reports', icon: FiBarChart2, label: 'Reports', bgColor: 'bg-red-500', hoverBg: 'hover:bg-red-600' },
    { id: 'settings', icon: FiSettingsIcon, label: 'Settings', bgColor: 'bg-gray-500', hoverBg: 'hover:bg-gray-600' },
  ]

  /**
   * ============================================================
   * TO MAKE ACTIONS CLOSER TO CENTER BUTTON:
   * ============================================================
   * 
   * REDUCE the X and Y values below to bring actions closer.
   * INCREASE the X and Y values to push actions farther away.
   * 
   * Current values (closer version):
   * - X and Y values are reduced by ~40% from original
   * - Actions will be positioned much closer to the center button
   * 
   * To adjust further:
   * - Make numbers smaller = closer to center
   * - Make numbers larger = farther from center
   */
  // THIS IS WHERE YOU CHANGE THE DISTANCE BETWEEN ACTIONS
const positions = [
  { x: -15, y: -60 },   // Overview - Up-Left
  { x: 40, y: -55 },    // Students - Up  
  { x: 60, y: -5 },    // Teachers - Up-Right
  { x: 48, y: 45 },    // Projects - Right-Up
  { x: -5, y: 58 },      // Assign - Right
  { x: -55, y: 30 },     // Reports - Right-Down
  { x: -55, y: -25 },      // Settings - Down
]
  // EVEN CLOSER (very tight around center button)
  // const positions = [
  //   { x: -12, y: -45 },   // Overview
  //   { x: 15, y: -50 },    // Students
  //   { x: 40, y: -40 },    // Teachers
  //   { x: 55, y: -20 },    // Projects
  //   { x: 50, y: 5 },      // Assign
  //   { x: 30, y: 25 },     // Reports
  //   { x: 5, y: 30 },      // Settings
  // ]

  // SLIGHTLY FARTHER (medium spacing)
  // const positions = [
  //   { x: -25, y: -90 },   // Overview
  //   { x: 30, y: -95 },    // Students
  //   { x: 80, y: -80 },    // Teachers
  //   { x: 110, y: -40 },   // Projects
  //   { x: 100, y: 10 },    // Assign
  //   { x: 65, y: 45 },     // Reports
  //   { x: 10, y: 60 },     // Settings
  // ]

  // FARTHER (original spacing)
  // const positions = [
  //   { x: -30, y: -110 },   // Overview
  //   { x: 35, y: -120 },    // Students
  //   { x: 95, y: -100 },    // Teachers
  //   { x: 130, y: -50 },    // Projects
  //   { x: 120, y: 10 },     // Assign
  //   { x: 75, y: 55 },      // Reports
  //   { x: 10, y: 75 },      // Settings
  // ]

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
    <>
      <AdminLayout 
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {renderPage()}
      </AdminLayout>

      {/* Floating Action Menu - Bottom Right */}
      <div className="fixed bottom-20 right-20 z-80 flex items-center justify-center">
        {/* Action Buttons */}
        {actions.map((action, index) => {
          const position = positions[index]
          return (
            <button
              key={action.id}
              onClick={() => handleTabChange(action.id)}
              className={`
                absolute w-11 h-11 rounded-full ${action.bgColor} text-white shadow-lg
                flex items-center justify-center transition-all duration-300
                ${action.hoverBg} hover:scale-110 hover:shadow-xl
                ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
              `}
              style={{
                transform: menuOpen 
                  ? `translate(${position.x}px, ${position.y}px) scale(1)` 
                  : `translate(0px, 0px) scale(0)`,
                transition: `all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1) ${index * 0.02}s`,
                pointerEvents: menuOpen ? 'auto' : 'none',
                right: '0',
                bottom: '0'
              }}
              title={action.label}
            >
              <action.icon size={18} />
            </button>
          )
        })}

        {/* Center Toggle Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`
            w-12 h-12 rounded-full bg-blue-600 text-white shadow-xl
            flex items-center justify-center transition-all duration-300
            hover:bg-blue-700 hover:scale-105
            ${menuOpen ? 'rotate-45' : 'rotate-0'}
            relative z-10
          `}
        >
          {menuOpen ? <FiX size={22} /> : <FiPlus size={22} />}
        </button>
      </div>

      {/* Floating Animation CSS */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </>
  )
}

export default AdminDashboard