import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axiosInstance from '../../services/axiosConfig'
import { FiBell, FiMail, FiCalendar, FiCheckCircle, FiAlertCircle, FiClock, FiUserCheck, FiFileText, FiTrash2 } from 'react-icons/fi'

function Notifications() {
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
      case 'approval':
        return { icon: FiCheckCircle, color: 'text-green-500', bgColor: 'bg-green-100' }
      case 'rejection':
        return { icon: FiAlertCircle, color: 'text-red-500', bgColor: 'bg-red-100' }
      case 'revision':
        return { icon: FiAlertCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-100' }
      case 'assignment':
        return { icon: FiUserCheck, color: 'text-purple-500', bgColor: 'bg-purple-100' }
      case 'submission':
        return { icon: FiFileText, color: 'text-blue-500', bgColor: 'bg-blue-100' }
      case 'deadline':
        return { icon: FiCalendar, color: 'text-orange-500', bgColor: 'bg-orange-100' }
      case 'message':
        return { icon: FiMail, color: 'text-indigo-500', bgColor: 'bg-indigo-100' }
      default:
        return { icon: FiBell, color: 'text-gray-500', bgColor: 'bg-gray-100' }
    }
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
          <p className="text-gray-600">Stay updated with your project activities</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead} 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Mark all as read ({unreadCount})
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
            <p className="text-gray-500">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const { icon: Icon, color, bgColor } = getIconAndColors(notification.type)
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
                        <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
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
    </div>
  )
}

export default Notifications