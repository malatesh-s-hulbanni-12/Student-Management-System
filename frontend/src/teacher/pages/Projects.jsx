import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axiosInstance from '../../services/axiosConfig'
import { FiBookOpen, FiUser, FiCalendar, FiEye, FiRefreshCw, FiCheckCircle, FiClock, FiPlus, FiTrash2, FiX, FiEdit2 } from 'react-icons/fi'

function Projects() {
  const { showSuccess, showError } = useToast()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeadlineModal, setShowDeadlineModal] = useState(false)
  const [showEditDeadlineModal, setShowEditDeadlineModal] = useState(false)
  const [dueDate, setDueDate] = useState('')
  const [editingDeadline, setEditingDeadline] = useState(null)

  // Fetch assigned projects
  const fetchAssignedProjects = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/proposals/my-students')
      console.log('Assigned projects response:', response.data)
      
      if (response.data.success) {
        if (response.data.hasStudents) {
          setProjects(response.data.students)
        } else {
          setProjects([])
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      showError('Failed to load assigned projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignedProjects()
  }, [])

  // View project details
  const viewProjectDetails = (project) => {
    setSelectedProject(project)
    setShowViewModal(true)
  }

  // Open deadline modal (only if no deadline exists)
  const openDeadlineModal = (project) => {
    setSelectedProject(project)
    setDueDate('')
    setShowDeadlineModal(true)
  }

  // Open edit deadline modal
  const openEditDeadlineModal = (project, deadline) => {
    setSelectedProject(project)
    setEditingDeadline(deadline)
    const formattedDate = new Date(deadline.dueDate).toISOString().slice(0, 16)
    setDueDate(formattedDate)
    setShowEditDeadlineModal(true)
  }

  // Add deadline
  const handleAddDeadline = async () => {
    if (!dueDate) {
      showError('Please select a due date')
      return
    }

    try {
      const response = await axiosInstance.post(`/proposals/${selectedProject.proposalId}/deadlines`, {
        dueDate: dueDate
      })
      
      if (response.data.success) {
        showSuccess('Deadline added successfully!')
        setShowDeadlineModal(false)
        fetchAssignedProjects()
      }
    } catch (error) {
      console.error('Error adding deadline:', error)
      showError(error.response?.data?.message || 'Failed to add deadline')
    }
  }

  // Edit deadline
  const handleEditDeadline = async () => {
    if (!dueDate) {
      showError('Please select a due date')
      return
    }

    try {
      const response = await axiosInstance.put(`/proposals/${selectedProject.proposalId}/deadlines/${editingDeadline._id}`, {
        dueDate: dueDate
      })
      
      if (response.data.success) {
        showSuccess('Deadline updated successfully!')
        setShowEditDeadlineModal(false)
        fetchAssignedProjects()
      }
    } catch (error) {
      console.error('Error updating deadline:', error)
      showError(error.response?.data?.message || 'Failed to update deadline')
    }
  }

  // Mark deadline as complete
  const markDeadlineComplete = async (proposalId, deadlineId) => {
    try {
      const response = await axiosInstance.put(`/proposals/${proposalId}/deadlines/${deadlineId}`, {
        status: 'completed'
      })
      if (response.data.success) {
        showSuccess('Deadline marked as completed!')
        fetchAssignedProjects()
      }
    } catch (error) {
      showError('Failed to update deadline')
    }
  }

  // Delete deadline
  const deleteDeadline = async (proposalId, deadlineId) => {
    if (window.confirm('Are you sure you want to delete this deadline?')) {
      try {
        const response = await axiosInstance.delete(`/proposals/${proposalId}/deadlines/${deadlineId}`)
        if (response.data.success) {
          showSuccess('Deadline deleted successfully!')
          fetchAssignedProjects()
        }
      } catch (error) {
        showError('Failed to delete deadline')
      }
    }
  }

  const getDeadlineStatusColor = (status, dueDate) => {
    if (status === 'completed') return 'bg-green-100 text-green-700 border-green-200'
    if (new Date(dueDate) < new Date() && status !== 'completed') return 'bg-red-100 text-red-700 border-red-200'
    return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }

  const getDeadlineStatusText = (status, dueDate) => {
    if (status === 'completed') return '✓ Completed'
    if (new Date(dueDate) < new Date() && status !== 'completed') return '⚠ Overdue'
    return '⏳ Pending'
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-700'
      case 'assigned': return 'bg-blue-100 text-blue-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'revision': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Check if project has deadline
  const hasDeadline = (project) => {
    return project.deadlines && project.deadlines.length > 0
  }

  // Get the first deadline (assuming one deadline per project)
  const getFirstDeadline = (project) => {
    if (hasDeadline(project)) {
      return project.deadlines[0]
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading assigned projects...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Assigned Projects</h2>
          <p className="text-gray-600">Projects assigned to you as supervisor</p>
        </div>
        <button
          onClick={fetchAssignedProjects}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-all"
        >
          <FiRefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">📚</div>
          <div className="text-2xl font-bold">{projects.length}</div>
          <div className="text-sm opacity-90">Total Projects</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-2xl font-bold">{projects.filter(p => p.projectStatus === 'assigned').length}</div>
          <div className="text-sm opacity-90">Active Projects</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">👨‍🎓</div>
          <div className="text-2xl font-bold">{projects.length}</div>
          <div className="text-sm opacity-90">Students</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">⏰</div>
          <div className="text-2xl font-bold">
            {projects.reduce((sum, p) => sum + (p.deadlines?.filter(d => d.status === 'pending' && new Date(d.dueDate) < new Date()).length || 0), 0)}
          </div>
          <div className="text-sm opacity-90">Overdue</div>
        </div>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Projects Assigned</h3>
          <p className="text-gray-600">
            You haven't been assigned any projects as supervisor yet.<br />
            Once admin assigns students to you, their projects will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project, index) => {
            const projectHasDeadline = hasDeadline(project)
            const deadline = getFirstDeadline(project)
            
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4 text-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1 truncate">{project.projectTitle}</h3>
                      <p className="text-sm opacity-90">👨‍🎓 {project.studentName} | 📚 {project.rollNumber}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.projectStatus)}`}>
                      {project.projectStatus?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  {/* Deadline Section */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                        <FiClock className="text-primary-500" /> Deadline
                      </h4>
                      {!projectHasDeadline ? (
                        <button
                          onClick={() => openDeadlineModal(project)}
                          className="bg-primary-500 hover:bg-primary-600 text-white text-xs px-3 py-1 rounded-lg flex items-center gap-1 transition-all"
                        >
                          <FiPlus size={12} /> Add Deadline
                        </button>
                      ) : (
                        <button
                          onClick={() => openEditDeadlineModal(project, deadline)}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-lg flex items-center gap-1 transition-all"
                        >
                          <FiEdit2 size={12} /> Edit Deadline
                        </button>
                      )}
                    </div>
                    
                    {projectHasDeadline && deadline ? (
                      <div className={`rounded-lg p-3 border ${getDeadlineStatusColor(deadline.status, deadline.dueDate)}`}>
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <FiCalendar size={14} />
                              <span className="text-sm font-medium">
                                Due: {formatDate(deadline.dueDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs">
                                {getDeadlineStatusText(deadline.status, deadline.dueDate)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {deadline.status !== 'completed' && (
                              <button
                                onClick={() => markDeadlineComplete(project.proposalId, deadline._id)}
                                className="p-1.5 rounded-lg hover:bg-white/50 transition-all"
                                title="Mark as Complete"
                              >
                                <FiCheckCircle size={14} className="text-green-600" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteDeadline(project.proposalId, deadline._id)}
                              className="p-1.5 rounded-lg hover:bg-white/50 transition-all"
                              title="Delete Deadline"
                            >
                              <FiTrash2 size={14} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <FiClock className="mx-auto text-gray-400 text-3xl mb-2" />
                        <p className="text-sm text-gray-500">No deadline set yet</p>
                        <p className="text-xs text-gray-400">Click "Add Deadline" to set one</p>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => viewProjectDetails(project)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <FiEye size={16} />
                    View Full Details
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Deadline Modal */}
      {showDeadlineModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Add Deadline</h3>
              <button onClick={() => setShowDeadlineModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Project:</p>
                <p className="font-semibold text-gray-800">{selectedProject.projectTitle}</p>
                <p className="text-sm text-gray-600 mt-1">Student: {selectedProject.studentName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Due Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowDeadlineModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDeadline}
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Add Deadline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Deadline Modal */}
      {showEditDeadlineModal && selectedProject && editingDeadline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Edit Deadline</h3>
              <button onClick={() => setShowEditDeadlineModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Project:</p>
                <p className="font-semibold text-gray-800">{selectedProject.projectTitle}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Due Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowEditDeadlineModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditDeadline}
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Update Deadline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Project Details Modal */}
      {showViewModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Project Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Project Title */}
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-gray-800">{selectedProject.projectTitle}</h4>
                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedProject.projectStatus)}`}>
                  {selectedProject.projectStatus?.toUpperCase()}
                </span>
              </div>

              {/* Student Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiUser className="text-primary-500" /> Student Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-500">Student Name</p><p className="font-medium">{selectedProject.studentName}</p></div>
                  <div><p className="text-gray-500">Roll Number</p><p className="font-medium">{selectedProject.rollNumber}</p></div>
                  <div><p className="text-gray-500">Email</p><p className="font-medium">{selectedProject.email}</p></div>
                  <div><p className="text-gray-500">Department</p><p className="font-medium">{selectedProject.department}</p></div>
                  <div><p className="text-gray-500">Semester</p><p className="font-medium">Semester {selectedProject.semester}</p></div>
                  <div><p className="text-gray-500">Submitted</p><p className="font-medium">{new Date(selectedProject.submittedAt).toLocaleDateString()}</p></div>
                </div>
              </div>

              {/* Project Description */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FiBookOpen className="text-primary-500" /> Project Description
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedProject.projectDescription || 'No description provided'}</p>
              </div>

              {/* Deadline Info */}
              {hasDeadline(selectedProject) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FiClock className="text-primary-500" /> Deadline Information
                  </h4>
                  <div className={`rounded-lg p-3 border ${getDeadlineStatusColor(getFirstDeadline(selectedProject).status, getFirstDeadline(selectedProject).dueDate)}`}>
                    <div className="flex items-center gap-2">
                      <FiCalendar size={14} />
                      <span className="text-sm font-medium">
                        Due: {formatDate(getFirstDeadline(selectedProject).dueDate)}
                      </span>
                    </div>
                    <p className="text-xs mt-1">{getDeadlineStatusText(getFirstDeadline(selectedProject).status, getFirstDeadline(selectedProject).dueDate)}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects