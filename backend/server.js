import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'
import Student from './models/Student.js'
import Teacher from './models/Teacher.js'
import studentRoutes from './routes/students.js'
import teacherRoutes from './routes/teachers.js'
import proposalRoutes from './routes/proposals.js'
import notificationRoutes from './routes/notifications.js'
import requestRoutes from './routes/requests.js'
import fileRoutes from './routes/files.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL],
  credentials: true
}))
app.use(express.json())

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err))

// Routes
app.use('/api/students', studentRoutes)
app.use('/api/teachers', teacherRoutes)
app.use('/api/proposals', proposalRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/files', fileRoutes)

// Admin credentials from .env
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

// Login endpoint
app.post('/api/login', async (req, res) => {
  console.log('Login request received:', { email: req.body.email, role: req.body.role })
  const { email, password, role } = req.body

  try {
    // Handle Admin login from .env only
    if (role === 'admin') {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const token = jwt.sign(
          { id: 'admin', email: ADMIN_EMAIL, role: 'admin', name: 'Admin User' },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        )
        
        console.log('Admin login successful')
        return res.json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: 'admin',
            name: 'Admin User',
            email: ADMIN_EMAIL,
            role: 'admin'
          }
        })
      } else {
        console.log('Invalid admin credentials')
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        })
      }
    }
    
    // Handle Teacher login from MongoDB only
    if (role === 'teacher') {
      const teacher = await Teacher.findOne({ email })
      
      if (!teacher) {
        console.log('Teacher not found:', email)
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        })
      }
      
      const isValidPassword = await bcrypt.compare(password, teacher.password)
      
      if (!isValidPassword) {
        console.log('Invalid password for teacher:', email)
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        })
      }
      
      const token = jwt.sign(
        { id: teacher._id, email: teacher.email, role: 'teacher', name: teacher.name },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      )
      
      console.log('Teacher login successful:', email)
      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          role: 'teacher'
        }
      })
    }
    
    // Handle Student login from MongoDB only
    if (role === 'student') {
      const student = await Student.findOne({ email })
      
      if (!student) {
        console.log('Student not found:', email)
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        })
      }
      
      const isValidPassword = await bcrypt.compare(password, student.password)
      
      if (!isValidPassword) {
        console.log('Invalid password for student:', email)
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        })
      }
      
      const token = jwt.sign(
        { id: student._id, email: student.email, role: 'student', name: student.name },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      )
      
      console.log('Student login successful:', email)
      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: student._id,
          name: student.name,
          email: student.email,
          role: 'student'
        }
      })
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid role' 
    })
    
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Verify token endpoint
app.post('/api/verify', (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' })
    }
    res.json({ success: true, user: user })
  })
})

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working!' })
})

// For Vercel serverless function - export the app
export default app

// Start server only when running locally (not in Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`)
    console.log('\n📝 Available endpoints:')
    console.log(`  POST   http://localhost:${PORT}/api/login`)
    console.log(`  POST   http://localhost:${PORT}/api/verify`)
    console.log(`  GET    http://localhost:${PORT}/api/test`)
    console.log(`  GET    http://localhost:${PORT}/api/students`)
    console.log(`  POST   http://localhost:${PORT}/api/students`)
    console.log(`  GET    http://localhost:${PORT}/api/teachers`)
    console.log(`  POST   http://localhost:${PORT}/api/teachers`)
    console.log(`  POST   http://localhost:${PORT}/api/proposals`)
    console.log(`  GET    http://localhost:${PORT}/api/proposals/my-proposals`)
    console.log(`  POST   http://localhost:${PORT}/api/files/upload`)
    console.log(`  GET    http://localhost:${PORT}/api/files/my-files`)
    console.log(`  GET    http://localhost:${PORT}/api/files/teacher-files`)
    console.log('\n🔑 Login Methods:')
    console.log('📧 Admin: admin@fypms.com / admin123')
    console.log('📧 Teacher: Login from MongoDB database')
    console.log('📧 Student: Login from MongoDB database\n')
  })
}