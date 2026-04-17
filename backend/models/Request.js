import mongoose from 'mongoose'

const requestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true
  },
  teacherId: {
    type: String,
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  proposalId: {
    type: String,
    default: null
  },
  projectTitle: {
    type: String,
    required: true
  },
  requestType: {
    type: String,
    enum: ['meeting', 'extension', 'guidance', 'feedback', 'approval', 'message'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  responseMessage: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

const Request = mongoose.model('Request', requestSchema)
export default Request