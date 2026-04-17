import React, { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminNavbar from './AdminNavbar'

function AdminLayout({ children, user, onLogout, activeTab, onTabChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar 
        activeTab={activeTab}
        onTabChange={onTabChange}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onLogout={onLogout}
      />
      
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} transition-all duration-300 min-h-screen`}>
        <AdminNavbar user={user} onLogout={onLogout} onMenuClick={toggleSidebar} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout