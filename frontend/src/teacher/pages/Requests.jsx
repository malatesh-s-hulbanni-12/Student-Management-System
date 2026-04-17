import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axiosInstance from '../../services/axiosConfig'
import { FiCheckCircle, FiXCircle, FiClock, FiMessageSquare, FiAlertCircle } from 'react-icons/fi'

function TeacherRequests() {
  const { showSuccess, showError } = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [responseMessage, setResponseMessage] = useState('')
  const [actionType, setActionType] = useState('')

  // Fetch requests
  const fetchRequests = async () => {
    try {
      const response = await axiosInstance.get('/requests/teacher-requests')
      if (response.data.success) {
        setRequests(response.data.requests)
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
      showError('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  // Open response modal
  const openResponseModal = (request, action) => {
    setSelectedRequest(request)
    setActionType(action)
    setResponseMessage('')
    setShowResponseModal(true)
  }

  // Update request status
  const handleUpdateStatus = async () => {
    try {
      const response = await axiosInstance.put(`/requests/${selectedRequest._id}/status`, {
        status: actionType,
        responseMessage: responseMessage
      })
      
      if (response.data.success) {
        showSuccess(`Request ${actionType} successfully!`)
        setShowResponseModal(false)
        fetchRequests()
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update request')
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700"><FiClock size={12} className="inline mr-1" /> Pending</span>
      case 'approved':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"><FiCheckCircle size={12} className="inline mr-1" /> Approved</span>
      case 'rejected':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700"><FiXCircle size={12} className="inline mr-1" /> Rejected</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>
    }
  }

  const getRequestTypeLabel = (type) => {
    const types = {
      meeting: '📅 Meeting Request',
      extension: '⏰ Extension Request',
      guidance: '💡 Guidance Request',
      feedback: '📝 Feedback Request',
      approval: '✅ Approval Request',
      message: '💬 Message',
      other: '📋 Other'
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading requests...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Student Requests</h2>
        <p className="text-gray-600">Manage requests from your assigned students</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">⏳</div>
          <div className="text-2xl font-bold">{requests.filter(r => r.status === 'pending').length}</div>
          <div className="text-sm opacity-90">Pending Requests</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-2xl font-bold">{requests.filter(r => r.status === 'approved').length}</div>
          <div className="text-sm opacity-90">Approved</div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">❌</div>
          <div className="text-2xl font-bold">{requests.filter(r => r.status === 'rejected').length}</div>
          <div className="text-sm opacity-90">Rejected</div>
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-6xl mb-4">📨</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Requests</h3>
          <p className="text-gray-600">No requests from students yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold text-gray-800">{getRequestTypeLabel(request.requestType)}</span>
                    {getStatusBadge(request.status)}
                    {request.proposalStatus && request.proposalStatus !== 'approved' && request.proposalStatus !== 'assigned' && request.status === 'pending' && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 flex items-center gap-1">
                        <FiAlertCircle size={12} /> Waiting for Admin Approval
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{request.message}</p>
                  <div className="text-sm text-gray-500">
                    <p>👨‍🎓 Student: <span className="font-medium">{request.studentName}</span> ({request.rollNumber})</p>
                    <p>📋 Project: <span className="font-medium">{request.projectTitle}</span></p>
                    <p>📅 Sent: {new Date(request.createdAt).toLocaleString()}</p>
                    {request.proposalStatus && request.proposalStatus !== 'approved' && request.proposalStatus !== 'assigned' && (
                      <p className="text-orange-600 mt-1">⚠️ Proposal status: {request.proposalStatus?.toUpperCase()} - Approve will be enabled after admin approves the project</p>
                    )}
                  </div>
                </div>
                
                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openResponseModal(request, 'approved')}
                      disabled={!request.canApprove}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                        request.canApprove 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      title={!request.canApprove ? 'Cannot approve until admin approves the project proposal' : 'Approve this request'}
                    >
                      <FiCheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => openResponseModal(request, 'rejected')}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                    >
                      <FiXCircle size={16} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {actionType === 'approved' ? 'Approve Request' : 'Reject Request'}
              </h3>
              <button onClick={() => setShowResponseModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-600">From: <span className="font-semibold">{selectedRequest.studentName}</span></p>
                <p className="text-sm text-gray-600">Project: <span className="font-semibold">{selectedRequest.projectTitle}</span></p>
                <p className="text-sm text-gray-600 mt-2">Message:</p>
                <p className="text-gray-700">{selectedRequest.message}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Response Message (optional)
                </label>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={actionType === 'approved' ? 'Add any notes or instructions...' : 'Provide reason for rejection...'}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
                    actionType === 'approved' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {actionType === 'approved' ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
                  Confirm {actionType === 'approved' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherRequests