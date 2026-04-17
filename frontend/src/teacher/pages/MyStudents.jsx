import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axiosInstance from '../../services/axiosConfig'
import { FiUser, FiMail, FiBookOpen, FiClock, FiEye, FiRefreshCw } from 'react-icons/fi'

function MyStudents() {
  const { showSuccess, showError } = useToast()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

  // Fetch assigned students
  const fetchAssignedStudents = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/proposals/my-students')
      console.log('Assigned students response:', response.data)
      
      if (response.data.success) {
        if (response.data.hasStudents) {
          setStudents(response.data.students)
        } else {
          setStudents([])
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      showError('Failed to load assigned students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignedStudents()
  }, [])

  // View student details
  const viewStudentDetails = (student) => {
    setSelectedStudent(student)
    setShowViewModal(true)
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-700'
      case 'Pending': return 'bg-yellow-100 text-yellow-700'
      case 'Completed': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading assigned students...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Students</h2>
          <p className="text-gray-600">Manage and supervise your assigned students</p>
        </div>
        <button
          onClick={fetchAssignedStudents}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-all"
        >
          <FiRefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">👨‍🎓</div>
          <div className="text-2xl font-bold">{students.length}</div>
          <div className="text-sm opacity-90">Total Students Assigned</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">🚀</div>
          <div className="text-2xl font-bold">{students.filter(s => s.projectStatus === 'assigned').length}</div>
          <div className="text-sm opacity-90">Active Projects</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">📚</div>
          <div className="text-2xl font-bold">{students.length} Projects</div>
          <div className="text-sm opacity-90">Total Projects</div>
        </div>
      </div>

      {/* Students Table */}
      {students.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-6xl mb-4">👨‍🏫</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Students Assigned Yet</h3>
          <p className="text-gray-600">
            You haven't been assigned any students as supervisor yet.<br />
            Once admin assigns students to you, they will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                          {student.studentName?.charAt(0) || 'S'}
                        </div>
                        <span className="font-medium text-gray-900">{student.studentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 max-w-xs">
                      <div className="truncate">{student.projectTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Semester {student.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor('Active')}`}>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => viewStudentDetails(student)}
                        className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                      >
                        <FiEye size={16} /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Student Details Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Student Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Student Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiUser className="text-primary-500" /> Student Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-gray-800 font-medium">{selectedStudent.studentName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Roll Number</p>
                    <p className="text-gray-800 font-medium">{selectedStudent.rollNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-800 font-medium">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="text-gray-800 font-medium">{selectedStudent.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Semester</p>
                    <p className="text-gray-800 font-medium">Semester {selectedStudent.semester}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Submitted</p>
                    <p className="text-gray-800 font-medium">{new Date(selectedStudent.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiBookOpen className="text-primary-500" /> Project Details
                </h4>
                <div className="mb-3">
                  <p className="text-xs text-gray-500">Project Title</p>
                  <p className="text-gray-800 font-medium">{selectedStudent.projectTitle}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Project Description</p>
                  <p className="text-gray-700 text-sm mt-1">{selectedStudent.projectDescription || 'No description provided'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <FiMail size={16} /> Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyStudents