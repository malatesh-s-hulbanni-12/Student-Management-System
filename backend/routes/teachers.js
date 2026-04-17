import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Teacher from '../models/Teacher.js'

const router = express.Router()

// ============ PUBLIC ROUTES (NO AUTHENTICATION) ============
// Public route - no authentication required (MUST be first)
router.get('/public-list', async (req, res) => {
  try {
    console.log('Public endpoint called - fetching all teachers')
    const teachers = await Teacher.find({ status: 'active' }).select('name email employeeId department designation')
    console.log(`Public endpoint: Found ${teachers.length} teachers`)
    res.json({ success: true, teachers })
  } catch (error) {
    console.error('Error fetching teachers:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// ============ AUTHENTICATION MIDDLEWARE ============
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
    console.log('Token verified. User role:', user.role, 'User ID:', user.id)
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

// ============ PROTECTED ROUTES (require authentication) ============

// Get all teachers (admin only)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ createdAt: -1 })
    console.log(`Found ${teachers.length} teachers`)
    res.json({ success: true, teachers })
  } catch (error) {
    console.error('Error fetching teachers:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get single teacher by ID (admin only)
router.get('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' })
    }
    res.json({ success: true, teacher })
  } catch (error) {
    console.error('Error fetching teacher:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Add new teacher (admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, employeeId, email, password, department, designation, contactNumber, specialization } = req.body

    if (!name || !employeeId || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, Employee ID, Email, and Password are required' 
      })
    }

    const existingTeacher = await Teacher.findOne({ $or: [{ email }, { employeeId }] })
    if (existingTeacher) {
      return res.status(400).json({ 
        success: false, 
        message: 'Teacher with this email or employee ID already exists' 
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const teacher = new Teacher({
      name,
      employeeId,
      email,
      password: hashedPassword,
      department: department || 'Computer Science',
      designation: designation || 'Lecturer',
      contactNumber: contactNumber || '',
      specialization: specialization || '',
      status: 'active'
    })

    await teacher.save()
    console.log('Teacher added:', teacher.name, teacher.employeeId)

    const teacherResponse = teacher.toObject()
    delete teacherResponse.password

    res.status(201).json({ 
      success: true, 
      message: 'Teacher added successfully', 
      teacher: teacherResponse
    })
  } catch (error) {
    console.error('Error adding teacher:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Update teacher (admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, employeeId, email, department, designation, contactNumber, specialization, status } = req.body

    const teacher = await Teacher.findById(req.params.id)
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' })
    }

    if (email && email !== teacher.email) {
      const emailExists = await Teacher.findOne({ email, _id: { $ne: req.params.id } })
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already exists' })
      }
    }

    if (employeeId && employeeId !== teacher.employeeId) {
      const employeeIdExists = await Teacher.findOne({ employeeId, _id: { $ne: req.params.id } })
      if (employeeIdExists) {
        return res.status(400).json({ success: false, message: 'Employee ID already exists' })
      }
    }

    teacher.name = name || teacher.name
    teacher.employeeId = employeeId || teacher.employeeId
    teacher.email = email || teacher.email
    teacher.department = department || teacher.department
    teacher.designation = designation || teacher.designation
    teacher.contactNumber = contactNumber || teacher.contactNumber
    teacher.specialization = specialization || teacher.specialization
    teacher.status = status || teacher.status
    teacher.updatedAt = Date.now()

    await teacher.save()
    console.log('Teacher updated:', teacher.name)

    const teacherResponse = teacher.toObject()
    delete teacherResponse.password

    res.json({ 
      success: true, 
      message: 'Teacher updated successfully', 
      teacher: teacherResponse
    })
  } catch (error) {
    console.error('Error updating teacher:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Delete teacher (admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' })
    }

    await Teacher.findByIdAndDelete(req.params.id)
    console.log('Teacher deleted:', teacher.name)

    res.json({ success: true, message: 'Teacher deleted successfully' })
  } catch (error) {
    console.error('Error deleting teacher:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get active teachers list for admin dropdown (admin only)
router.get('/list/active', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const teachers = await Teacher.find({ status: 'active' })
      .select('name email employeeId department designation')
      .sort({ name: 1 })
    res.json({ success: true, teachers })
  } catch (error) {
    console.error('Error fetching active teachers:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get all teachers for students (to send requests) - STUDENT ACCESS
router.get('/all-for-students', verifyToken, async (req, res) => {
  try {
    console.log('Student accessing teachers list. User role:', req.user?.role)
    
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can access this endpoint' })
    }
    
    const teachers = await Teacher.find({ status: 'active' }).select('name email employeeId department designation')
    console.log(`Found ${teachers.length} teachers for student`)
    res.json({ success: true, teachers })
  } catch (error) {
    console.error('Error fetching teachers for students:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router