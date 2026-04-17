import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,  // String type to handle "admin" and ObjectIds
    required: true
  },
  userRole: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    required: true
  },
  type: {
    type: String,
    enum: ['message', 'deadline', 'approval', 'rejection', 'revision', 'assignment', 'reminder', 'submission', 'file_upload', 'request', 'request_response'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: String,  // String type
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Notification = mongoose.model('Notification', notificationSchema)
export default Notification