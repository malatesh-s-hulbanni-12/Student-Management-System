import React, { useState } from 'react'
import StudentSidebar from './StudentSidebar'
import StudentNavbar from './StudentNavbar'

function StudentLayout({ children, user, onLogout, activeTab, onTabChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentSidebar 
        activeTab={activeTab}
        onTabChange={onTabChange}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onLogout={onLogout}
      />
      
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} transition-all duration-300 min-h-screen`}>
        <StudentNavbar user={user} onLogout={onLogout} onMenuClick={toggleSidebar} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default StudentLayout