import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axiosInstance from '../../services/axiosConfig'
import { FiBell, FiUserCheck, FiCheckCircle, FiXCircle, FiClock, FiFileText, FiTrash2, FiMail, FiUserPlus } from 'react-icons/fi'

function TeacherNotifications() {
  const { showSuccess, showError } = useToast()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get('/notifications')
      if (response.data.success) {
        setNotifications(response.data.notifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      showError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Mark as read
  const markAsRead = async (id) => {
    try {
      const response = await axiosInstance.put(`/notifications/${id}/read`)
      if (response.data.success) {
        setNotifications(notifications.map(notif =>
          notif._id === id ? { ...notif, isRead: true } : notif
        ))
      }
    } catch (error) {
      showError('Failed to mark as read')
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await axiosInstance.put('/notifications/mark-all-read')
      if (response.data.success) {
        setNotifications(notifications.map(notif => ({ ...notif, isRead: true })))
        showSuccess('All notifications marked as read')
      }
    } catch (error) {
      showError('Failed to mark all as read')
    }
  }

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      const response = await axiosInstance.delete(`/notifications/${id}`)
      if (response.data.success) {
        setNotifications(notifications.filter(notif => notif._id !== id))
        showSuccess('Notification deleted')
      }
    } catch (error) {
      showError('Failed to delete notification')
    }
  }

  const getIconAndColors = (type) => {
    switch(type) {
      case 'assignment':
        return { icon: FiUserPlus, color: 'text-purple-500', bgColor: 'bg-purple-100', label: 'New Assignment' }
      case 'request':
        return { icon: FiMail, color: 'text-blue-500', bgColor: 'bg-blue-100', label: 'Student Request' }
      case 'request_response':
        return { icon: FiCheckCircle, color: 'text-green-500', bgColor: 'bg-green-100', label: 'Request Response' }
      case 'submission':
        return { icon: FiFileText, color: 'text-indigo-500', bgColor: 'bg-indigo-100', label: 'Proposal Submitted' }
      case 'approval':
        return { icon: FiCheckCircle, color: 'text-green-500', bgColor: 'bg-green-100', label: 'Approved' }
      case 'rejection':
        return { icon: FiXCircle, color: 'text-red-500', bgColor: 'bg-red-100', label: 'Rejected' }
      case 'revision':
        return { icon: FiClock, color: 'text-orange-500', bgColor: 'bg-orange-100', label: 'Revision Required' }
      default:
        return { icon: FiBell, color: 'text-gray-500', bgColor: 'bg-gray-100', label: 'Notification' }
    }
  }

  const formatDate = (date) => {
    const now = new Date()
    const notifDate = new Date(date)
    const diffMs = now - notifDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return 'Yesterday'
    return notifDate.toLocaleDateString()
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead
    if (filter === 'read') return notif.isRead
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading notifications...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
          <p className="text-gray-600">Stay updated with your teaching activities</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead} 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
          >
            <FiCheckCircle size={14} /> Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'all'
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'unread'
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'read'
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Read ({notifications.filter(n => n.isRead).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FiBell className="mx-auto text-5xl text-gray-300 mb-3" />
            <p className="text-gray-500">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">When students send requests or admin assigns projects, you'll see them here</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const { icon: Icon, color, bgColor, label } = getIconAndColors(notification.type)
            return (
              <div
                key={notification._id}
                className={`bg-white rounded-xl shadow-sm p-4 transition-all hover:shadow-md ${
                  !notification.isRead ? 'border-l-4 border-primary-500' : ''
                }`}
              >
                <div className="flex gap-4">
                  <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className={color} size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <button 
                            onClick={() => markAsRead(notification._id)} 
                            className="text-xs text-primary-600 hover:text-primary-700"
                          >
                            Mark as read
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notification._id)} 
                          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <FiTrash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Tips Section */}
      {notifications.length > 0 && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-800 flex items-center gap-2">
            <FiBell size={16} />
            💡 You receive notifications when:
          </p>
          <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-6">
            <li>• Admin assigns a new student project to you</li>
            <li>• Students send you requests or messages</li>
            <li>• Students respond to your feedback</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default TeacherNotifications