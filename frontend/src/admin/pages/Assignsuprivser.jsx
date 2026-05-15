import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axiosInstance from '../../services/axiosConfig'
import { 
  FiUserCheck, 
  FiRefreshCw, 
  FiUserPlus, 
  FiX, 
  FiCheckCircle, 
  FiClock, 
  FiEdit2,
  FiUsers,
  FiBookOpen,
  FiUser
} from 'react-icons/fi'

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
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  const refreshAll = async () => {
    setIsRefreshing(true)
    await Promise.all([fetchApprovedProjects(), fetchAssignedProjects(), fetchTeachers()])
    setTimeout(() => setIsRefreshing(false), 500)
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
        await refreshAll()
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
        await refreshAll()
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
      {/* Header with Refresh Button */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Assign Supervisor</h2>
          <p className="text-gray-600">Assign or change supervisors for projects</p>
        </div>
        <button
          onClick={refreshAll}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
        >
          <FiRefreshCw 
            size={16} 
            className={`${isRefreshing ? 'animate-spin text-blue-500' : 'text-gray-500'}`} 
          />
          Refresh
        </button>
      </div>

      {/* Stats Summary with React Icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <FiClock className="text-2xl text-yellow-500 mb-1" />
          <div className="text-xl font-bold text-gray-800">{approvedProjects.length}</div>
          <div className="text-xs text-gray-500">Awaiting Assignment</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <FiCheckCircle className="text-2xl text-green-500 mb-1" />
          <div className="text-xl font-bold text-gray-800">{assignedProjects.length}</div>
          <div className="text-xs text-gray-500">Assigned Projects</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <FiUsers className="text-2xl text-blue-500 mb-1" />
          <div className="text-xl font-bold text-gray-800">{teachers.length}</div>
          <div className="text-xs text-gray-500">Available Supervisors</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-1 font-medium text-sm transition-all ${
            activeTab === 'pending'
              ? 'text-blue-600 border-b-2 border-blue-600'
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
          className={`pb-3 px-1 font-medium text-sm transition-all ${
            activeTab === 'assigned'
              ? 'text-blue-600 border-b-2 border-blue-600'
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
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
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
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm">
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
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-all"
                        >
                          <FiUserPlus size={14} />
                          Assign
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
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supervisor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
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
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm">
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
                          className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm transition-all"
                        >
                          <FiEdit2 size={14} />
                          Change
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Assign Supervisor</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-5">
              {/* Project Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 mb-1">Project Details</p>
                <p className="font-semibold text-gray-800">{selectedProject.projectTitle}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><FiUser size={12} /> {selectedProject.studentName}</span>
                  <span><FiBookOpen size={12} /> {selectedProject.department}</span>
                </div>
              </div>

              {/* Select Supervisor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Supervisor *
                </label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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

              <div className="mt-3 text-xs text-gray-400">
                {teachers.length} supervisors available
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={assigning || !selectedTeacher}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 transition-all text-sm disabled:opacity-50"
                >
                  <FiUserCheck size={14} />
                  {assigning ? 'Assigning...' : 'Assign Supervisor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Supervisor Modal */}
      {showChangeModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Change Supervisor</h3>
              <button onClick={() => setShowChangeModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-5">
              {/* Project Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 mb-1">Project Details</p>
                <p className="font-semibold text-gray-800">{selectedProject.projectTitle}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><FiUser size={12} /> {selectedProject.studentName}</span>
                  <span><FiBookOpen size={12} /> {selectedProject.department}</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">Current: <span className="font-semibold">{selectedProject.assignedSupervisor?.name}</span></p>
              </div>

              {/* Select New Supervisor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Supervisor *
                </label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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

              <div className="mt-3 text-xs text-gray-400">
                {teachers.length} supervisors available
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowChangeModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangeSupervisor}
                  disabled={assigning || !selectedTeacher}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl flex items-center gap-2 transition-all text-sm disabled:opacity-50"
                >
                  <FiEdit2 size={14} />
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