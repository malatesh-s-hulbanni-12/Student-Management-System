import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axiosInstance from '../../services/axiosConfig'
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi'

function Teachers() {
  const { showSuccess, showError } = useToast()
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: '',
    password: '',
    department: 'Computer Science',
    designation: 'Lecturer',
    contactNumber: '',
    specialization: ''
  })

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      const response = await axiosInstance.get('/teachers')
      if (response.data.success) {
        setTeachers(response.data.teachers)
      }
    } catch (error) {
      showError('Failed to fetch teachers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [])

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Add or update teacher
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTeacher) {
        // Update teacher
        const response = await axiosInstance.put(`/teachers/${editingTeacher._id}`, formData)
        if (response.data.success) {
          showSuccess('Teacher updated successfully!')
          setShowModal(false)
          fetchTeachers()
          resetForm()
        }
      } else {
        // Add new teacher
        const response = await axiosInstance.post('/teachers', formData)
        if (response.data.success) {
          showSuccess('Teacher added successfully!')
          setShowModal(false)
          fetchTeachers()
          resetForm()
        }
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Operation failed')
    }
  }

  // Edit teacher
  const handleEdit = (teacher) => {
    setEditingTeacher(teacher)
    setFormData({
      name: teacher.name,
      employeeId: teacher.employeeId,
      email: teacher.email,
      password: '',
      department: teacher.department,
      designation: teacher.designation,
      contactNumber: teacher.contactNumber || '',
      specialization: teacher.specialization || ''
    })
    setShowModal(true)
  }

  // Delete teacher
  const handleDelete = async (teacher) => {
    if (window.confirm(`Are you sure you want to delete ${teacher.name}?`)) {
      try {
        const response = await axiosInstance.delete(`/teachers/${teacher._id}`)
        if (response.data.success) {
          showSuccess('Teacher deleted successfully!')
          fetchTeachers()
        }
      } catch (error) {
        showError('Failed to delete teacher')
      }
    }
  }

  // Reset form
  const resetForm = () => {
    setEditingTeacher(null)
    setFormData({
      name: '',
      employeeId: '',
      email: '',
      password: '',
      department: 'Computer Science',
      designation: 'Lecturer',
      contactNumber: '',
      specialization: ''
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
        <div className="text-gray-600">Loading teachers...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Teachers Management</h2>
          <p className="text-gray-600">Manage all teachers and supervisors in the system</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <FiPlus size={20} />
          Add New Teacher
        </button>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No teachers found. Click "Add New Teacher" to add one.
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {teacher.employeeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                          {teacher.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{teacher.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {teacher.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {teacher.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {teacher.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {teacher.contactNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        teacher.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {teacher.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="text-blue-600 hover:text-blue-800 mr-3 transition-colors"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher)}
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
                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
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
                    placeholder="Enter teacher name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter employee ID"
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
                    placeholder="teacher@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {editingTeacher ? 'New Password (optional)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingTeacher}
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
                    Designation
                  </label>
                  <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option>Lecturer</option>
                    <option>Assistant Professor</option>
                    <option>Associate Professor</option>
                    <option>Professor</option>
                    <option>Senior Lecturer</option>
                  </select>
                </div>

                <div>
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Web Development, AI, etc."
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
                  {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Teachers