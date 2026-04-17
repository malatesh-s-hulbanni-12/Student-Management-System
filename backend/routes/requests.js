import express from 'express'
import jwt from 'jsonwebtoken'
import Request from '../models/Request.js'
import Student from '../models/Student.js'
import Proposal from '../models/Proposal.js'
import { createNotification } from './notifications.js'

const router = express.Router()

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err.message)
      return res.status(403).json({ success: false, message: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Student: Create a new request/message
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('Received request body:', req.body)
    console.log('User from token:', req.user)
    
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can create requests' })
    }
    
    const { teacherId, teacherName, proposalId, projectTitle, requestType, message } = req.body
    
    if (!teacherId || !requestType || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }
    
    // Get student details
    const student = await Student.findById(req.user.id)
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }
    
    const request = new Request({
      studentId: req.user.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      teacherId,
      teacherName,
      proposalId: proposalId || null,
      projectTitle: projectTitle || 'General Request',
      requestType,
      message,
      status: 'pending'
    })
    
    await request.save()
    console.log('Request saved:', request._id)
    
    // Create notification for teacher
    await createNotification(
      teacherId,
      'teacher',
      'request',
      `New ${requestType} Request`,
      `${student.name} has sent a ${requestType} request for project "${projectTitle || 'General'}".`,
      request._id
    )
    
    res.status(201).json({ success: true, message: 'Request sent successfully', request })
  } catch (error) {
    console.error('Error creating request:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get student's requests
router.get('/my-requests', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can access this endpoint' })
    }
    
    const requests = await Request.find({ studentId: req.user.id }).sort({ createdAt: -1 })
    res.json({ success: true, requests })
  } catch (error) {
    console.error('Error fetching my requests:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get teacher's requests with proposal approval status
router.get('/teacher-requests', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Only teachers can access this endpoint' })
    }
    
    const requests = await Request.find({ teacherId: req.user.id }).sort({ createdAt: -1 })
    
    // Check proposal approval status for each request
    const requestsWithStatus = await Promise.all(requests.map(async (request) => {
      let canApprove = true
      let proposalStatus = null
      
      if (request.proposalId) {
        const proposal = await Proposal.findById(request.proposalId)
        if (proposal) {
          proposalStatus = proposal.status
          // Only allow approve if proposal is approved or assigned
          canApprove = proposal.status === 'approved' || proposal.status === 'assigned'
        }
      }
      
      return {
        ...request.toObject(),
        canApprove,
        proposalStatus
      }
    }))
    
    res.json({ success: true, requests: requestsWithStatus })
  } catch (error) {
    console.error('Error fetching teacher requests:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Teacher: Update request status
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Only teachers can update request status' })
    }
    
    const { status, responseMessage } = req.body
    const request = await Request.findById(req.params.id)
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' })
    }
    
    if (request.teacherId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }
    
    // Check if proposal is approved before allowing approve action
    if (status === 'approved' && request.proposalId) {
      const proposal = await Proposal.findById(request.proposalId)
      if (proposal && proposal.status !== 'approved' && proposal.status !== 'assigned') {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot approve request until the project proposal is approved by admin' 
        })
      }
    }
    
    request.status = status
    if (responseMessage) request.responseMessage = responseMessage
    request.updatedAt = Date.now()
    
    await request.save()
    
    // Create notification for student
    await createNotification(
      request.studentId,
      'student',
      'request_response',
      `Request ${status}`,
      `Your ${request.requestType} request for "${request.projectTitle}" has been ${status}. ${responseMessage || ''}`,
      request._id
    )
    
    res.json({ success: true, message: `Request ${status} successfully`, request })
  } catch (error) {
    console.error('Error updating request status:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router