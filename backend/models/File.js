import mongoose from 'mongoose'

const fileSchema = new mongoose.Schema({
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
  proposalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: true
  },
  projectTitle: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['report', 'presentation', 'other', 'image', 'document'],
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: String,
    default: ''
  },
  fileOriginalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const File = mongoose.model('File', fileSchema)
export default File