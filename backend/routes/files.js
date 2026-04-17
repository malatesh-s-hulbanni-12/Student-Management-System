import dotenv from 'dotenv'
dotenv.config()


import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'
import File from '../models/File.js'
import Proposal from '../models/Proposal.js'
import { authenticateToken } from '../middleware/auth.js'
import { createNotification } from './notifications.js'

const router = express.Router()

// Configure Cloudinary
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Debug
console.log('=== CLOUDINARY CONFIG IN FILES.JS ===')
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || '❌')
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅' : '❌')
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅' : '❌')

// Configure multer for memory storage (since Cloudinary handles the file)
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type'), false)
  }
}

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

// Upload file to Cloudinary
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    console.log('=== FILE UPLOAD REQUEST ===')
    console.log('User:', req.user)
    console.log('Request body:', req.body)
    
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can upload files' })
    }

    const { proposalId, projectTitle, fileType } = req.body
    
    if (!proposalId || !fileType || !req.file) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    // Verify proposal belongs to student
    const proposal = await Proposal.findById(proposalId)
    if (!proposal || proposal.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Invalid proposal' })
    }

    console.log('Proposal found:', proposal.projectTitle)
    console.log('Assigned supervisor:', proposal.assignedSupervisor)

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'student_projects',
          resource_type: 'auto',
          public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      
      const readableStream = new Readable()
      readableStream.push(req.file.buffer)
      readableStream.push(null)
      readableStream.pipe(uploadStream)
    })

    console.log('Cloudinary upload result:', uploadResult.secure_url)

    const file = new File({
      studentId: req.user.id,
      studentName: req.user.name,
      rollNumber: proposal.rollNumber,
      proposalId: proposalId,
      projectTitle: projectTitle,
      fileType: fileType,
      fileName: uploadResult.public_id,
      fileUrl: uploadResult.secure_url,
      fileSize: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB',
      fileOriginalName: req.file.originalname,
      mimeType: req.file.mimetype
    })

    await file.save()
    console.log('File saved:', file._id)

    // Send notification to teacher
    if (proposal.assignedSupervisor && proposal.assignedSupervisor.id) {
      const teacherId = proposal.assignedSupervisor.id.toString()
      const teacherName = proposal.assignedSupervisor.name
      
      console.log('Sending notification to teacher:', teacherId, teacherName)
      
      const notification = await createNotification(
        teacherId,
        'teacher',
        'file_upload',
        '📎 New File Uploaded',
        `Student ${req.user.name} has uploaded a ${fileType} file for project "${projectTitle}".`,
        file._id.toString()
      )
      
      if (notification) {
        console.log('✅ Notification sent successfully to teacher:', teacherName)
      } else {
        console.log('❌ Failed to send notification to teacher')
      }
    } else {
      console.log('No assigned supervisor found for this proposal')
    }

    res.json({ success: true, message: 'File uploaded successfully', file })
  } catch (error) {
    console.error('Error uploading file:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get files for a student
router.get('/my-files', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can access this endpoint' })
    }

    const files = await File.find({ studentId: req.user.id }).sort({ createdAt: -1 })
    res.json({ success: true, files })
  } catch (error) {
    console.error('Error fetching my files:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get files for a proposal (teacher view)
router.get('/proposal/:proposalId', authenticateToken, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.proposalId)
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' })
    }

    // Check access
    const isTeacher = req.user.role === 'teacher' && proposal.assignedSupervisor?.id === req.user.id
    const isStudent = req.user.role === 'student' && proposal.studentId.toString() === req.user.id

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }

    const files = await File.find({ proposalId: req.params.proposalId }).sort({ createdAt: -1 })
    res.json({ success: true, files })
  } catch (error) {
    console.error('Error fetching proposal files:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get all files for teacher's students
router.get('/teacher-files', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Only teachers can access this endpoint' })
    }

    console.log('Fetching files for teacher:', req.user.id)
    
    const proposals = await Proposal.find({ 'assignedSupervisor.id': req.user.id })
    console.log('Found proposals:', proposals.length)
    
    const proposalIds = proposals.map(p => p._id)
    const files = await File.find({ proposalId: { $in: proposalIds } }).sort({ createdAt: -1 })
    
    console.log('Found files:', files.length)
    res.json({ success: true, files })
  } catch (error) {
    console.error('Error fetching teacher files:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Delete file from Cloudinary and database
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
    
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' })
    }

    // Check authorization
    if (file.studentId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }

    // Delete file from Cloudinary
    try {
      await cloudinary.uploader.destroy(file.fileName)
      console.log('File deleted from Cloudinary:', file.fileName)
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError)
    }

    await File.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'File deleted successfully' })
  } catch (error) {
    console.error('Error deleting file:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router