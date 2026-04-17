import React from 'react'
import { 
  FiGrid, 
  FiFileText, 
  FiUpload, 
  FiUserCheck, 
  FiMessageSquare, 
  FiBell, 
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut
} from 'react-icons/fi'
import { FaUserGraduate } from 'react-icons/fa'

function StudentSidebar({ activeTab, onTabChange, isOpen, onToggle, onLogout }) {
  const menuItems = [
    { id: 'overview', icon: FiGrid, label: 'Overview' },
    { id: 'submit-proposal', icon: FiFileText, label: 'Submit Proposal' },
    { id: 'upload-files', icon: FiUpload, label: 'Upload Files' },
    { id: 'supervisor', icon: FiUserCheck, label: 'Supervisor' },
    { id: 'feedback', icon: FiMessageSquare, label: 'Feedback' },
    { id: 'notifications', icon: FiBell, label: 'Notifications' },
    { id: 'settings', icon: FiSettings, label: 'Settings' },
  ]

  const handleClick = (id) => {
    console.log('Sidebar clicked:', id)
    onTabChange(id)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white shadow-xl transition-all duration-300 z-30
        ${isOpen ? 'w-64' : 'w-20'}
        lg:fixed
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className={`flex items-center gap-2 ${!isOpen && 'justify-center w-full'}`}>
            <FaUserGraduate className="text-2xl text-primary-600" />
            {isOpen && (
              <div>
                <span className="font-bold text-gray-800 text-lg">Student Panel</span>
                <p className="text-xs text-gray-500">Project Dashboard</p>
              </div>
            )}
          </div>
          <button
            onClick={onToggle}
            className="hidden lg:flex text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg p-1 transition-all"
          >
            {isOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <div className="py-4 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 mb-1 rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-primary-600'
                  }
                  ${!isOpen && 'justify-center'}
                `}
                title={!isOpen ? item.label : ''}
              >
                <Icon size={20} />
                {isOpen && <span className="font-medium">{item.label}</span>}
              </button>
            )
          })}
        </div>

        {/* Bottom Section with Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={onLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
              text-red-600 hover:bg-red-50
              ${!isOpen && 'justify-center'}
            `}
            title={!isOpen ? 'Logout' : ''}
          >
            <FiLogOut size={20} />
            {isOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  )
}

export default StudentSidebar