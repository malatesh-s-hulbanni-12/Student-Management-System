import mongoose from 'mongoose'


const deadlineSchema = new mongoose.Schema({
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'overdue'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const proposalSchema = new mongoose.Schema({

  deadlines: {
    type: [deadlineSchema],
    default: []
  },
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
  semester: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  projectTitle: {
    type: String,
    required: true,
    trim: true
  },
  projectDescription: {
    type: String,
    required: true
  },
  technologies: {
    type: String,
    default: ''
  },
  objectives: {
    type: String,
    default: ''
  },
  expectedOutcomes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'revision', 'assigned'],
    default: 'pending'
  },
  feedback: {
    type: String,
    default: ''
  },
  assignedSupervisor: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    name: { type: String },
    email: { type: String }
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  assignedSupervisor: {
  id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  name: { type: String },
  email: { type: String },
  assignedAt: { type: Date, default: Date.now }
}
})

const Proposal = mongoose.model('Proposal', proposalSchema)
export default Proposal