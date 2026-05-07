import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axios from 'axios'
import { FiMail, FiMessageSquare, FiUser, FiBookOpen, FiSend, FiSearch, FiRefreshCw, FiUserCheck, FiUsers } from 'react-icons/fi'

function Supervisor() {
  const { showSuccess, showError } = useToast()
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [assignedSupervisors, setAssignedSupervisors] = useState([])
  const [allTeachers, setAllTeachers] = useState([])
  const [filteredTeachers, setFilteredTeachers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Faculty & Supervisors</h1>
            <p className="text-gray-500 text-sm mt-1">Connect with your supervisors and faculty members</p>
          </div>
          <button
            onClick={fetchData}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* ============ SECTION 1: CURRENT SUPERVISORS ============ */}
      {assignedSupervisors.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiUserCheck className="text-blue-600" size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Current Supervisors</h2>
              <p className="text-xs text-gray-400">Your assigned project supervisors</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {assignedSupervisors.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-sm">
                        {item.supervisor?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{item.supervisor?.name}</h3>
                        <p className="text-xs text-gray-500">Supervisor ID: {item.supervisor?.id}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(item.projectStatus)}`}>
                            {item.projectStatus?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Project</p>
                      <p className="text-sm font-medium text-gray-800">{item.projectTitle}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div>
                        <p className="text-[10px] text-gray-400">Roll No</p>
                        <p className="text-xs text-gray-700">{item.rollNumber}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Department</p>
                        <p className="text-xs text-gray-700">{item.department}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Semester</p>
                        <p className="text-xs text-gray-700">{item.semester}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <FiMail className="text-gray-400" size={14} />
                      <span className="text-xs text-gray-600 break-all">{item.supervisor?.email}</span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => openMessageModal(item.supervisor)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all"
                      >
                        <FiMessageSquare size={14} /> Message
                      </button>
                      <button
                        onClick={() => openRequestModal(item.supervisor)}
                        className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-700 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all"
                      >
                        <FiSend size={14} /> Request
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ SECTION 2: ALL FACULTY MEMBERS ============ */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
            <FiUsers className="text-purple-600" size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">All Faculty Members</h2>
            <p className="text-xs text-gray-400">Browse and connect with faculty</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, department, or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Faculty Grid */}
        {filteredTeachers.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-3">👨‍🏫</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No Faculty Found</h3>
            <p className="text-sm text-gray-500">
              {searchTerm ? 'Try a different search term' : 'No faculty members available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTeachers.map((teacher) => (
              <div key={teacher._id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 text-lg font-bold group-hover:bg-blue-50 transition-colors">
                      {teacher.name?.charAt(0) || 'T'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{teacher.name}</h3>
                      <p className="text-xs text-gray-500">{teacher.employeeId}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{teacher.designation}</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Department</p>
                    <p className="text-sm text-gray-700">{teacher.department}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Email</p>
                    <div className="flex items-center gap-2">
                      <FiMail className="text-gray-400 flex-shrink-0" size={12} />
                      <span className="text-xs text-gray-600 truncate">{teacher.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4 pt-2">
                    <button
                      onClick={() => openMessageModal(teacher)}
                      className="flex-1 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 py-2 rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
                    >
                      <FiMessageSquare size={14} /> Message
                    </button>
                    <button
                      onClick={() => openRequestModal(teacher)}
                      className="flex-1 bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-700 py-2 rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
                    >
                      <FiSend size={14} /> Request
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Send Message</h3>
                <p className="text-xs text-gray-500 mt-0.5">to {selectedTeacher.name}</p>
              </div>
              <button onClick={() => setShowMessageModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all">
                ✕
              </button>
            </div>
            <div className="p-5">
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">To:</p>
                <p className="font-medium text-gray-800 text-sm">{selectedTeacher.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{selectedTeacher.email}</p>
              </div>
              
              {/* Project Selection Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Project (Optional)
                </label>
                <select
                  value={selectedProject?._id || ''}
                  onChange={(e) => {
                    const project = allProposals.find(p => p._id === e.target.value)
                    setSelectedProject(project || null)
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">-- No specific project --</option>
                  {allProposals.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.projectTitle} ({project.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                placeholder={`Type your message to ${selectedTeacher.name}...`}
              />
              <div className="flex justify-end gap-3 mt-5">
                <button onClick={() => setShowMessageModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all text-sm">Cancel</button>
                <button onClick={handleSendMessage} disabled={sending || !messageText.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 transition-all text-sm disabled:opacity-50">
                  <FiSend size={14} /> {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Send Request</h3>
                <p className="text-xs text-gray-500 mt-0.5">to {selectedTeacher.name}</p>
              </div>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all">
                ✕
              </button>
            </div>
            <div className="p-5">
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">To:</p>
                <p className="font-medium text-gray-800 text-sm">{selectedTeacher.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{selectedTeacher.email}</p>
              </div>
              
              {/* Project Selection Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Project (Optional)
                </label>
                <select
                  value={selectedProject?._id || ''}
                  onChange={(e) => {
                    const project = allProposals.find(p => p._id === e.target.value)
                    setSelectedProject(project || null)
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">-- No specific project --</option>
                  {allProposals.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.projectTitle} ({project.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Request Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Type *
                </label>
                <select
                  value={requestData.requestType}
                  onChange={(e) => setRequestData({ ...requestData, requestType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Details *
                </label>
                <textarea
                  value={requestData.message}
                  onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="Please describe your request in detail..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all text-sm">Cancel</button>
                <button onClick={handleSendRequest} disabled={sending || !requestData.message.trim()} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl flex items-center gap-2 transition-all text-sm disabled:opacity-50">
                  <FiSend size={14} /> {sending ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Supervisor