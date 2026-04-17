import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axios from 'axios'
import { FiMail, FiMessageSquare, FiUser, FiBookOpen, FiAlertCircle, FiChevronDown, FiChevronUp, FiSend, FiSearch, FiRefreshCw } from 'react-icons/fi'

function Supervisor() {
  const { showSuccess, showError } = useToast()
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [assignedSupervisors, setAssignedSupervisors] = useState([])
  const [allTeachers, setAllTeachers] = useState([])
  const [filteredTeachers, setFilteredTeachers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCard, setExpandedCard] = useState(null)
  const [expandedTeacherCard, setExpandedTeacherCard] = useState(null)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestData, setRequestData] = useState({
    requestType: 'meeting',
    message: ''
  })
  const [allProposals, setAllProposals] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [error, setError] = useState(null)

  // Base URL from env (without /api)
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  // API URL with /api prefix
  const API_URL = `${BASE_URL}/api`

  // Fetch all data
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      console.log('Current user:', user)
      console.log('API_URL:', API_URL)
      
      // Fetch assigned supervisors (my-supervisors)
      if (token && user.role === 'student') {
        try {
          const supervisorsRes = await axios.get(`${API_URL}/proposals/my-supervisors`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          console.log('Assigned supervisors response:', supervisorsRes.data)
          
          if (supervisorsRes.data.success && supervisorsRes.data.hasSupervisors) {
            setAssignedSupervisors(supervisorsRes.data.supervisors)
          }
        } catch (err) {
          console.error('Error fetching assigned supervisors:', err)
        }
      }
      
      // Fetch all teachers using public endpoint
      console.log('Fetching all teachers...')
      const teachersRes = await axios.get(`${API_URL}/teachers/public-list`)
      console.log('All teachers response:', teachersRes.data)
      
      if (teachersRes.data.success) {
        setAllTeachers(teachersRes.data.teachers)
        setFilteredTeachers(teachersRes.data.teachers)
      } else {
        setError(teachersRes.data.message || 'Failed to load teachers')
      }
      
      // Fetch ALL proposals for dropdown
      if (token && user.role === 'student') {
        try {
          const proposalsRes = await axios.get(`${API_URL}/proposals/my-proposals`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          console.log('All proposals response:', proposalsRes.data)
          
          if (proposalsRes.data.success) {
            setAllProposals(proposalsRes.data.proposals)
          }
        } catch (projectError) {
          console.error('Error fetching proposals:', projectError)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(error.response?.data?.message || 'Failed to load data')
      showError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter teachers based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTeachers(allTeachers)
    } else {
      const filtered = allTeachers.filter(teacher =>
        teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredTeachers(filtered)
    }
  }, [searchTerm, allTeachers])

  // Open message modal
  const openMessageModal = (teacher) => {
    setSelectedTeacher(teacher)
    setSelectedProject(null)
    setMessageText('')
    setShowMessageModal(true)
  }

  // Open request modal
  const openRequestModal = (teacher) => {
    setSelectedTeacher(teacher)
    setSelectedProject(null)
    setRequestData({
      requestType: 'meeting',
      message: ''
    })
    setShowRequestModal(true)
  }

  // Send message to teacher
  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      showError('Please enter a message')
      return
    }
    
    setSending(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/requests`, {
        teacherId: selectedTeacher._id,
        teacherName: selectedTeacher.name,
        proposalId: selectedProject?._id || null,
        projectTitle: selectedProject?.projectTitle || 'General Inquiry',
        requestType: 'message',
        message: messageText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        showSuccess(`Message sent to ${selectedTeacher.name} successfully!`)
        setMessageText('')
        setShowMessageModal(false)
        setSelectedTeacher(null)
        setSelectedProject(null)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      showError(error.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // Send request to teacher
  const handleSendRequest = async () => {
    if (!requestData.message.trim()) {
      showError('Please enter request details')
      return
    }
    
    setSending(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/requests`, {
        teacherId: selectedTeacher._id,
        teacherName: selectedTeacher.name,
        proposalId: selectedProject?._id || null,
        projectTitle: selectedProject?.projectTitle || 'General Request',
        requestType: requestData.requestType,
        message: requestData.message
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        showSuccess(`${getRequestTypeLabel(requestData.requestType)} sent to ${selectedTeacher.name} successfully!`)
        setRequestData({ requestType: 'meeting', message: '' })
        setShowRequestModal(false)
        setSelectedTeacher(null)
        setSelectedProject(null)
      }
    } catch (error) {
      console.error('Error sending request:', error)
      showError(error.response?.data?.message || 'Failed to send request')
    } finally {
      setSending(false)
    }
  }

  const getRequestTypeLabel = (type) => {
    const types = {
      meeting: '📅 Meeting Request',
      extension: '⏰ Extension Request',
      guidance: '💡 Guidance Request',
      feedback: '📝 Feedback Request',
      approval: '✅ Approval Request',
      message: '💬 Message'
    }
    return types[type] || type
  }

  const getProjectStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'text-green-600'
      case 'assigned': return 'text-blue-600'
      case 'pending': return 'text-yellow-600'
      case 'rejected': return 'text-red-600'
      case 'revision': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const toggleAssignedCard = (index) => {
    if (expandedCard === index) {
      setExpandedCard(null)
    } else {
      setExpandedCard(index)
    }
  }

  const toggleTeacherCard = (index) => {
    if (expandedTeacherCard === index) {
      setExpandedTeacherCard(null)
    } else {
      setExpandedTeacherCard(index)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-700'
      case 'assigned': return 'bg-blue-100 text-blue-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Faculty & Supervisors</h2>
          <p className="text-gray-600">View your assigned supervisors and browse all faculty members</p>
        </div>
        <button
          onClick={fetchData}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-all"
        >
          <FiRefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* ============ SECTION 1: ASSIGNED SUPERVISORS ============ */}
      {assignedSupervisors.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">👨‍🏫</span> Your Assigned Supervisors
          </h3>
          <div className="space-y-4">
            {assignedSupervisors.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden border-l-4 border-primary-500">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleAssignedCard(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {item.supervisor?.name?.charAt(0) || 'S'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">{item.supervisor?.name}</h3>
                        <p className="text-sm text-gray-500">Employee ID: {item.supervisor?.id}</p>
                        <p className="text-xs text-gray-400 mt-1">Project: {item.projectTitle?.substring(0, 50)}...</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.projectStatus)}`}>
                        {item.projectStatus?.toUpperCase()}
                      </span>
                      {expandedCard === index ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                    </div>
                  </div>
                </div>
                {expandedCard === index && (
                  <div className="border-t border-gray-100 p-6 bg-gray-50">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Project Details</h4>
                      <div className="bg-white rounded-lg p-4">
                        <p className="font-medium text-gray-800">{item.projectTitle}</p>
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div><span className="text-gray-500">Roll Number:</span> {item.rollNumber}</div>
                          <div><span className="text-gray-500">Department:</span> {item.department}</div>
                          <div><span className="text-gray-500">Semester:</span> Semester {item.semester}</div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Contact Information</h4>
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <FiMail className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm text-gray-800">{item.supervisor?.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => openMessageModal(item.supervisor)}
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                      >
                        <FiMessageSquare size={16} /> Send Message
                      </button>
                      <button
                        onClick={() => openRequestModal(item.supervisor)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                      >
                        <FiSend size={16} /> Send Request
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ SECTION 2: ALL TEACHERS ============ */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">👨‍🏫</span> All Faculty Members
        </h3>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, department, or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="text-2xl mb-1">👨‍🏫</div>
            <div className="text-2xl font-bold">{allTeachers.length}</div>
            <div className="text-sm opacity-90">Total Faculty Members</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="text-2xl mb-1">📚</div>
            <div className="text-2xl font-bold">{allProposals.length}</div>
            <div className="text-sm opacity-90">Your Total Proposals</div>
          </div>
        </div>

        {/* All Teachers List */}
        {filteredTeachers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Teachers Found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No teachers match your search criteria.' : 'No teachers available in the system.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTeachers.map((teacher, index) => (
              <div key={teacher._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleTeacherCard(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {teacher.name?.charAt(0) || 'T'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">{teacher.name}</h3>
                        <p className="text-sm text-gray-500">Employee ID: {teacher.employeeId}</p>
                        <p className="text-sm text-gray-600">{teacher.designation} - {teacher.department}</p>
                      </div>
                    </div>
                    <div>
                      {expandedTeacherCard === index ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                    </div>
                  </div>
                </div>
                {expandedTeacherCard === index && (
                  <div className="border-t border-gray-100 p-6 bg-gray-50">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Contact Information</h4>
                      <div className="bg-white rounded-lg p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <FiMail className="text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="text-sm text-gray-800">{teacher.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <FiUser className="text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Employee ID</p>
                              <p className="text-sm text-gray-800">{teacher.employeeId}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => openMessageModal(teacher)}
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                      >
                        <FiMessageSquare size={16} /> Send Message
                      </button>
                      <button
                        onClick={() => openRequestModal(teacher)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                      >
                        <FiSend size={16} /> Send Request
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Send Message to {selectedTeacher.name}</h3>
              <button onClick={() => setShowMessageModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-1">👨‍🏫 To:</p>
                <p className="font-medium text-gray-800">{selectedTeacher.name}</p>
                <p className="text-sm text-gray-500">{selectedTeacher.email}</p>
              </div>
              
              {/* Project Selection Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Related Project (Optional)
                </label>
                <select
                  value={selectedProject?._id || ''}
                  onChange={(e) => {
                    const project = allProposals.find(p => p._id === e.target.value)
                    setSelectedProject(project || null)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- No specific project --</option>
                  {allProposals.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.projectTitle} ({project.status.toUpperCase()})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select a project to associate with this message</p>
              </div>

              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={`Type your message to ${selectedTeacher.name}...`}
              />
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowMessageModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleSendMessage} disabled={sending || !messageText.trim()} className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg flex items-center gap-2">
                  <FiSend size={16} /> {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Send Request to {selectedTeacher.name}</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-1">👨‍🏫 To:</p>
                <p className="font-medium text-gray-800">{selectedTeacher.name}</p>
                <p className="text-sm text-gray-500">{selectedTeacher.email}</p>
              </div>
              
              {/* Project Selection Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Related Project (Optional)
                </label>
                <select
                  value={selectedProject?._id || ''}
                  onChange={(e) => {
                    const project = allProposals.find(p => p._id === e.target.value)
                    setSelectedProject(project || null)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- No specific project --</option>
                  {allProposals.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.projectTitle} ({project.status.toUpperCase()})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select a project to associate with this request</p>
              </div>

              {/* Request Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Request Type *
                </label>
                <select
                  value={requestData.requestType}
                  onChange={(e) => setRequestData({ ...requestData, requestType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="meeting">📅 Meeting Request</option>
                  <option value="extension">⏰ Extension Request</option>
                  <option value="guidance">💡 Guidance Request</option>
                  <option value="feedback">📝 Feedback Request</option>
                  <option value="approval">✅ Approval Request</option>
                </select>
              </div>

              {/* Request Message */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Request Details *
                </label>
                <textarea
                  value={requestData.message}
                  onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Please describe your request in detail..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleSendRequest} disabled={sending || !requestData.message.trim()} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg flex items-center gap-2">
                  <FiSend size={16} /> {sending ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600 text-center">
          📍 Send messages or formal requests to any faculty member. You can associate your request with any of your projects.
        </p>
      </div>
    </div>
  )
}

export default Supervisor