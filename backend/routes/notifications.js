import express from 'express'
import Notification from '../models/Notification.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Get all notifications for logged-in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      userId: req.user.id,
      userRole: req.user.role
    }).sort({ createdAt: -1 })
    
    res.json({ success: true, notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get unread count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.user.id,
      userRole: req.user.role,
      isRead: false 
    })
    res.json({ success: true, count })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    )
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' })
    }
    res.json({ success: true, notification })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Mark all as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, userRole: req.user.role, isRead: false },
      { isRead: true }
    )
    res.json({ success: true, message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Error marking all as read:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    })
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' })
    }
    res.json({ success: true, message: 'Notification deleted' })
  } catch (error) {
    console.error('Error deleting notification:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Create notification (internal use)
export const createNotification = async (userId, userRole, type, title, message, relatedId = null) => {
  try {
    console.log('Creating notification with:', { userId, userRole, type, title, message, relatedId })
    
    const notification = new Notification({
      userId: userId.toString(),
      userRole,
      type,
      title,
      message,
      relatedId: relatedId ? relatedId.toString() : null
    })
    await notification.save()
    console.log('✅ Notification created successfully:', notification._id)
    return notification
  } catch (error) {
    console.error('❌ Error creating notification:', error)
    return null
  }
}

export default router