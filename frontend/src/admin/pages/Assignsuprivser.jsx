import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axiosInstance from '../../services/axiosConfig'
import { FiUserCheck, FiRefreshCw, FiUserPlus, FiX, FiCheckCircle, FiClock, FiEdit2 } from 'react-icons/fi'

function AssignSupervisor() {
  const { showSuccess, showError } = useToast()
  const [approvedProjects, setApprovedProjects] = useState([])
  const [assignedProjects, setAssignedProjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')

  // Fetch approved projects (status: approved)
  const fetchApprovedProjects = async () => {
    try {
      const response = await axiosInstance.get('/proposals/approved')
      if (response.data.success) {
        setApprovedProjects(response.data.proposals)
      }
    } catch (error) {
      console.error('Error fetching approved projects:', error)
      showError('Failed to fetch approved projects')
    }
  }

  // Fetch assigned projects (status: assigned)
  const fetchAssignedProjects = async () => {
    try {
      const response = await axiosInstance.get('/proposals/assigned')
      if (response.data.success) {
        setAssignedProjects(response.data.proposals)
      }
    } catch (error) {
      console.error('Error fetching assigned projects:', error)
    }
  }

  // Fetch teachers list
  const fetchTeachers = async () => {
    try {
      const response = await axiosInstance.get('/proposals/teachers/list')
      if (response.data.success) {
        setTeachers(response.data.teachers)
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
      showError('Failed to fetch teachers')
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([fetchApprovedProjects(), fetchAssignedProjects(), fetchTeachers()])
      setLoading(false)
    }
    fetchData()
  }, [])

  // Open assign modal
  const openAssignModal = (project) => {
    setSelectedProject(project)
    setSelectedTeacher('')
    setShowAssignModal(true)
  }

  // Open change supervisor modal
  const openChangeModal = (project) => {
    setSelectedProject(project)
    setSelectedTeacher(project.assignedSupervisor?.id || '')
    setShowChangeModal(true)
  }

  // Assign supervisor
  const handleAssign = async () => {
    if (!selectedTeacher) {
      showError('Please select a supervisor')
      return
    }

    const teacher = teachers.find(t => t._id === selectedTeacher)
    if (!teacher) {
      showError('Teacher not found')
      return
    }

    setAssigning(true)
    try {
      const response = await axiosInstance.put(`/proposals/${selectedProject._id}/assign-supervisor`, {
        supervisorId: teacher._id,
        supervisorName: teacher.name,
        supervisorEmail: teacher.email
      })

      if (response.data.success) {
        showSuccess(`Supervisor ${teacher.name} assigned to ${selectedProject.studentName}'s project!`)
        setShowAssignModal(false)
        await Promise.all([fetchApprovedProjects(), fetchAssignedProjects()])
      }
    } catch (error) {
      console.error('Error assigning supervisor:', error)
      showError('Failed to assign supervisor')
    } finally {
      setAssigning(false)
    }
  }

  // Change supervisor
  const handleChangeSupervisor = async () => {
    if (!selectedTeacher) {
      showError('Please select a supervisor')
      return
    }

    const teacher = teachers.find(t => t._id === selectedTeacher)
    if (!teacher) {
      showError('Teacher not found')
      return
    }

    setAssigning(true)
    try {
      const response = await axiosInstance.put(`/proposals/${selectedProject._id}/change-supervisor`, {
        supervisorId: teacher._id,
        supervisorName: teacher.name,
        supervisorEmail: teacher.email
      })

      if (response.data.success) {
        showSuccess(`Supervisor changed to ${teacher.name} for ${selectedProject.studentName}'s project!`)
        setShowChangeModal(false)
        await Promise.all([fetchApprovedProjects(), fetchAssignedProjects()])
      }
    } catch (error) {
      console.error('Error changing supervisor:', error)
      showError('Failed to change supervisor')
    } finally {
      setAssigning(false)
    }
  }

  const getDepartmentColor = (department) => {
    const colors = {
      'Computer Science': 'bg-blue-100 text-blue-700',
      'Software Engineering': 'bg-green-100 text-green-700',
      'Information Technology': 'bg-purple-100 text-purple-700',
      'Electrical Engineering': 'bg-yellow-100 text-yellow-700',
      'Mechanical Engineering': 'bg-orange-100 text-orange-700'
    }
    return colors[department] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading projects...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Assign Supervisor</h2>
          <p className="text-gray-600">Assign or change supervisors for projects</p>
        </div>
        <button
          onClick={() => {
            fetchApprovedProjects()
            fetchAssignedProjects()
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-all"
        >
          <FiRefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">⏳</div>
          <div className="text-2xl font-bold">{approvedProjects.length}</div>
          <div className="text-sm opacity-90">Awaiting Assignment</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-2xl font-bold">{assignedProjects.length}</div>
          <div className="text-sm opacity-90">Assigned Projects</div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">👨‍🏫</div>
          <div className="text-2xl font-bold">{teachers.length}</div>
          <div className="text-sm opacity-90">Available Supervisors</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'pending'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <FiClock size={16} />
            Awaiting Assignment ({approvedProjects.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('assigned')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'assigned'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <FiCheckCircle size={16} />
            Assigned ({assignedProjects.length})
          </span>
        </button>
      </div>

      {/* Approved Projects Table (Awaiting Assignment) */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {approvedProjects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No projects awaiting assignment. Please approve some proposals first.
                    </td>
                  </tr>
                ) : (
                  approvedProjects.map((project) => (
                    <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                            {project.studentName?.charAt(0) || 'S'}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{project.studentName}</span>
                        </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {project.rollNumber}
                       </td>
                      <td className="px-6 py-4 text-sm text-gray-800 max-w-xs">
                        <div className="truncate">{project.projectTitle}</div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDepartmentColor(project.department)}`}>
                          {project.department}
                        </span>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        Semester {project.semester}
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openAssignModal(project)}
                          className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
                        >
                          <FiUserPlus size={16} />
                          Assign Supervisor
                        </button>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assigned Projects Table with Change Option */}
      {activeTab === 'assigned' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Supervisor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignedProjects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No assigned projects yet. Assign supervisors to approved projects.
                     </td>
                  </tr>
                ) : (
                  assignedProjects.map((project) => (
                    <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                            {project.studentName?.charAt(0) || 'S'}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{project.studentName}</span>
                        </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {project.rollNumber}
                       </td>
                      <td className="px-6 py-4 text-sm text-gray-800 max-w-xs">
                        <div className="truncate">{project.projectTitle}</div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-semibold">
                            {project.assignedSupervisor?.name?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{project.assignedSupervisor?.name}</p>
                            <p className="text-xs text-gray-500">{project.assignedSupervisor?.email}</p>
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          ASSIGNED
                        </span>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openChangeModal(project)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                        >
                          <FiEdit2 size={16} />
                          Change Supervisor
                        </button>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Supervisor Modal */}
      {showAssignModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Assign Supervisor</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Project Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-500">Project Details</p>
                <p className="font-semibold text-gray-800">{selectedProject.projectTitle}</p>
                <p className="text-sm text-gray-600 mt-1">Student: {selectedProject.studentName}</p>
                <p className="text-sm text-gray-600">Department: {selectedProject.department}</p>
              </div>

              {/* Select Supervisor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Supervisor *
                </label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">-- Select a supervisor --</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} - {teacher.department} ({teacher.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Available Supervisors Count */}
              <div className="mt-4 text-sm text-gray-500">
                {teachers.length} supervisors available
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={assigning || !selectedTeacher}
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <FiUserCheck size={16} />
                  {assigning ? 'Assigning...' : 'Assign Supervisor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Supervisor Modal */}
      {showChangeModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Change Supervisor</h3>
              <button onClick={() => setShowChangeModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Project Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-500">Project Details</p>
                <p className="font-semibold text-gray-800">{selectedProject.projectTitle}</p>
                <p className="text-sm text-gray-600 mt-1">Student: {selectedProject.studentName}</p>
                <p className="text-sm text-gray-600">Current Supervisor: <span className="font-semibold">{selectedProject.assignedSupervisor?.name}</span></p>
              </div>

              {/* Select New Supervisor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select New Supervisor *
                </label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">-- Select a supervisor --</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} - {teacher.department} ({teacher.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Available Supervisors Count */}
              <div className="mt-4 text-sm text-gray-500">
                {teachers.length} supervisors available
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowChangeModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangeSupervisor}
                  disabled={assigning || !selectedTeacher}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <FiEdit2 size={16} />
                  {assigning ? 'Changing...' : 'Change Supervisor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssignSupervisor