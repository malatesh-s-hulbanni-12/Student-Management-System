import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Student from '../models/Student.js'
import Proposal from '../models/Proposal.js'
import Teacher from '../models/Teacher.js'

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
      return res.status(403).json({ success: false, message: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Middleware to verify admin
const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' })
  }
  next()
}

// Get all students
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 })
    console.log(`Found ${students.length} students`)
    res.json({ success: true, students })
  } catch (error) {
    console.error('Error fetching students:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get single student by ID
router.get('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }
    // Remove password from response
    const studentResponse = student.toObject()
    delete studentResponse.password
    res.json({ success: true, student: studentResponse })
  } catch (error) {
    console.error('Error fetching student:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Add new student
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, rollNumber, email, password, department, semester, contactNumber } = req.body

    // Validate required fields
    if (!name || !rollNumber || !email || !password || !semester) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, Roll Number, Email, Password, and Semester are required' 
      })
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ $or: [{ email }, { rollNumber }] })
    if (existingStudent) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student with this email or roll number already exists' 
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new student
    const student = new Student({
      name,
      rollNumber,
      email,
      password: hashedPassword,
      department: department || 'Computer Science',
      semester,
      contactNumber: contactNumber || '',
      status: 'active'
    })

    await student.save()
    console.log('Student added:', student.name, student.rollNumber)

    // Remove password from response
    const studentResponse = student.toObject()
    delete studentResponse.password

    res.status(201).json({ 
      success: true, 
      message: 'Student added successfully', 
      student: studentResponse
    })
  } catch (error) {
    console.error('Error adding student:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Update student
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, rollNumber, email, department, semester, contactNumber, status } = req.body

    const student = await Student.findById(req.params.id)
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }

    // Check if email or rollNumber already exists for another student
    if (email && email !== student.email) {
      const emailExists = await Student.findOne({ email, _id: { $ne: req.params.id } })
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already exists' })
      }
    }

    if (rollNumber && rollNumber !== student.rollNumber) {
      const rollNumberExists = await Student.findOne({ rollNumber, _id: { $ne: req.params.id } })
      if (rollNumberExists) {
        return res.status(400).json({ success: false, message: 'Roll number already exists' })
      }
    }

    // Update student fields
    student.name = name || student.name
    student.rollNumber = rollNumber || student.rollNumber
    student.email = email || student.email
    student.department = department || student.department
    student.semester = semester || student.semester
    student.contactNumber = contactNumber || student.contactNumber
    student.status = status || student.status
    student.updatedAt = Date.now()

    await student.save()
    console.log('Student updated:', student.name)

    // Remove password from response
    const studentResponse = student.toObject()
    delete studentResponse.password

    res.json({ 
      success: true, 
      message: 'Student updated successfully', 
      student: studentResponse
    })
  } catch (error) {
    console.error('Error updating student:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Delete student
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }

    // Also delete student's proposals
    await Proposal.deleteMany({ studentId: req.params.id })
    
    await Student.findByIdAndDelete(req.params.id)
    console.log('Student deleted:', student.name)

    res.json({ success: true, message: 'Student deleted successfully' })
  } catch (error) {
    console.error('Error deleting student:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get approved proposals (for assigning supervisors)
router.get('/approved-proposals', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const proposals = await Proposal.find({ status: 'approved' })
      .sort({ submittedAt: -1 })
      .populate('studentId', 'name rollNumber email department semester')
    res.json({ success: true, proposals })
  } catch (error) {
    console.error('Error fetching approved proposals:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Assign supervisor to a proposal
router.put('/assign-supervisor/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { supervisorId, supervisorName, supervisorEmail } = req.body
    const proposal = await Proposal.findById(req.params.id)
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' })
    }
    
    proposal.assignedSupervisor = {
      id: supervisorId,
      name: supervisorName,
      email: supervisorEmail
    }
    proposal.status = 'assigned'
    proposal.updatedAt = Date.now()
    
    await proposal.save()
    
    res.json({ success: true, message: 'Supervisor assigned successfully', proposal })
  } catch (error) {
    console.error('Error assigning supervisor:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get all teachers (supervisors) for dropdown
router.get('/teachers-list', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const teachers = await Teacher.find({ status: 'active' })
      .select('name email employeeId department designation')
      .sort({ name: 1 })
    res.json({ success: true, teachers })
  } catch (error) {
    console.error('Error fetching teachers:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get student statistics
router.get('/stats/summary', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments()
    const activeStudents = await Student.countDocuments({ status: 'active' })
    const totalProposals = await Proposal.countDocuments()
    const approvedProposals = await Proposal.countDocuments({ status: 'approved' })
    const pendingProposals = await Proposal.countDocuments({ status: 'pending' })
    
    res.json({ 
      success: true, 
      stats: {
        totalStudents,
        activeStudents,
        totalProposals,
        approvedProposals,
        pendingProposals
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router