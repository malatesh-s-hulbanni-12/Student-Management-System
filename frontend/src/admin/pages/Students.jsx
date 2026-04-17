import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axiosInstance from '../../services/axiosConfig'
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi'

function Students() {
  const { showSuccess, showError } = useToast()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    password: '',
    department: 'Computer Science',
    semester: 1,
    contactNumber: ''
  })

  // Fetch students
  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get('/students')
      console.log('Fetch students response:', response.data)
      if (response.data.success) {
        setStudents(response.data.students)
      }
    } catch (error) {
      console.error('Fetch error:', error)
      showError('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Add or update student
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      console.log('Submitting form data:', formData)
      
      if (editingStudent) {
        // Update student
        const response = await axiosInstance.put(`/students/${editingStudent._id}`, formData)
        console.log('Update response:', response.data)
        if (response.data.success) {
          showSuccess('Student updated successfully!')
          setShowModal(false)
          fetchStudents()
          resetForm()
        }
      } else {
        // Add new student
        const response = await axiosInstance.post('/students', formData)
        console.log('Add response:', response.data)
        if (response.data.success) {
          showSuccess('Student added successfully!')
          setShowModal(false)
          fetchStudents()
          resetForm()
        }
      }
    } catch (error) {
      console.error('Submit error:', error)
      console.error('Error response:', error.response)
      showError(error.response?.data?.message || 'Operation failed')
    }
  }

  // Edit student
  const handleEdit = (student) => {
    setEditingStudent(student)
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email,
      password: '',
      department: student.department,
      semester: student.semester,
      contactNumber: student.contactNumber || ''
    })
    setShowModal(true)
  }

  // Delete student
  const handleDelete = async (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      try {
        const response = await axiosInstance.delete(`/students/${student._id}`)
        if (response.data.success) {
          showSuccess('Student deleted successfully!')
          fetchStudents()
        }
      } catch (error) {
        showError('Failed to delete student')
      }
    }
  }

  // Reset form
  const resetForm = () => {
    setEditingStudent(null)
    setFormData({
      name: '',
      rollNumber: '',
      email: '',
      password: '',
      department: 'Computer Science',
      semester: 1,
      contactNumber: ''
    })
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading students...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Students Management</h2>
          <p className="text-gray-600">Manage all students in the system</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <FiPlus size={20} />
          Add New Student
        </button>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No students found. Click "Add New Student" to add one.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Semester {student.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.contactNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        student.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {student.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-blue-600 hover:text-blue-800 mr-3 transition-colors"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(student)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter student name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter roll number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="student@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {editingStudent ? 'New Password (optional)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingStudent}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option>Computer Science</option>
                    <option>Software Engineering</option>
                    <option>Information Technology</option>
                    <option>Electrical Engineering</option>
                    <option>Mechanical Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Semester
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {[1,2,3,4,5,6,7,8].map(num => (
                      <option key={num} value={num}>Semester {num}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter contact number"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  {editingStudent ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Students