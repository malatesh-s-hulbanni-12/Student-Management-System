import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  department: {
    type: String,
    default: 'Computer Science'
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  contactNumber: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated'],
    default: 'active'
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

const Student = mongoose.model('Student', studentSchema)
export default Student