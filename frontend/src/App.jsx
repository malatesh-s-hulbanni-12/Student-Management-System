import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import Home from './pages/Home'
import Login from './pages/Login'
import AdminDashboard from './admin/AdminDashboard'
import TeacherDashboard from './teacher/TeacherDashboard'
import StudentDashboard from './student/StudentDashboard'

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/teacher/*" element={<TeacherDashboard />} />
        <Route path="/student/*" element={<StudentDashboard />} />
      </Routes>
    </ToastProvider>
  )
}

export default App