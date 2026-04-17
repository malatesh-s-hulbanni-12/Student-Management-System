import React, { useState } from 'react'
import { FiBell, FiChevronDown, FiMenu, FiLogOut } from 'react-icons/fi'
import { FaChalkboardTeacher } from 'react-icons/fa'

function TeacherNavbar({ user, onLogout, onMenuClick }) {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <nav className="bg-white shadow-md sticky top-0 z-20">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="text-gray-600 hover:text-primary-600 transition-all duration-200 focus:outline-none lg:hidden"
            >
              <FiMenu size={24} />
            </button>
            <div className="hidden lg:block">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Final Year Project Management System
              </h1>
              <p className="text-gray-600 text-sm">Teacher Dashboard</p>
            </div>
            <div className="lg:hidden">
              <div className="flex items-center gap-2">
                <FaChalkboardTeacher className="text-2xl text-primary-600" />
                <span className="font-bold text-gray-800">Teacher Panel</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative text-gray-600 hover:text-primary-600 transition-colors">
              <FiBell size={22} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                5
              </span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 focus:outline-none group"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {user?.name?.charAt(0).toUpperCase() || 'T'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">
                    {user?.name || 'Teacher User'}
                  </p>
                  <p className="text-xs text-gray-500">Teacher</p>
                </div>
                <FiChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
              </button>

              {/* Dropdown Menu - Only Logout option */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-700">{user?.name || 'Teacher User'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'teacher@example.com'}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <FiLogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default TeacherNavbar