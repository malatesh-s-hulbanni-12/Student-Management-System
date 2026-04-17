import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axiosInstance from '../../services/axiosConfig'
import { FiEye, FiCheckCircle, FiXCircle, FiRefreshCw, FiMessageSquare } from 'react-icons/fi'

function Projects() {
  const { showSuccess, showError } = useToast()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Fetch all proposals
  const fetchProposals = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/proposals/all')
      if (response.data.success) {
        setProposals(response.data.proposals)
      }
    } catch (error) {
      console.error('Fetch proposals error:', error)
      showError('Failed to fetch proposals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProposals()
  }, [])

  // Update proposal status
  const updateStatus = async (id, status, feedbackText = '') => {
    try {
      const response = await axiosInstance.put(`/proposals/${id}/status`, { 
        status, 
        feedback: feedbackText 
      })
      if (response.data.success) {
        showSuccess(`Proposal ${status} successfully!`)
        fetchProposals()
        setShowFeedbackModal(false)
        setFeedback('')
      }
    } catch (error) {
      showError('Failed to update status')
    }
  }

  // View proposal details
  const viewProposal = (proposal) => {
    setSelectedProposal(proposal)
    setShowViewModal(true)
  }

  // Open feedback modal for rejection/revision
  const openFeedbackModal = (proposal, status) => {
    setSelectedProposal(proposal)
    setShowFeedbackModal(true)
    // Store the status to apply after feedback
    window.pendingStatus = status
  }

  // Submit with feedback
  const submitWithFeedback = () => {
    if (!feedback.trim()) {
      showError('Please provide feedback')
      return
    }
    updateStatus(selectedProposal._id, window.pendingStatus, feedback)
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'approved': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'revision': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusBadge = (status) => {
    const colors = getStatusColor(status)
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors}`}>
      {status.toUpperCase()}
    </span>
  }

  // Filter proposals by status
  const filteredProposals = proposals.filter(proposal => {
    if (statusFilter === 'all') return true
    return proposal.status === statusFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading proposals...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Projects Management</h2>
          <p className="text-gray-600">Manage all student project proposals</p>
        </div>
        <button
          onClick={fetchProposals}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-all"
        >
          <FiRefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg transition-all ${
            statusFilter === 'all'
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({proposals.length})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-lg transition-all ${
            statusFilter === 'pending'
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending ({proposals.filter(p => p.status === 'pending').length})
        </button>
        <button
          onClick={() => setStatusFilter('approved')}
          className={`px-4 py-2 rounded-lg transition-all ${
            statusFilter === 'approved'
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Approved ({proposals.filter(p => p.status === 'approved').length})
        </button>
        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-4 py-2 rounded-lg transition-all ${
            statusFilter === 'rejected'
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Rejected ({proposals.filter(p => p.status === 'rejected').length})
        </button>
        <button
          onClick={() => setStatusFilter('revision')}
          className={`px-4 py-2 rounded-lg transition-all ${
            statusFilter === 'revision'
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Revision ({proposals.filter(p => p.status === 'revision').length})
        </button>
      </div>

      {/* Proposals Table */}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No proposals found
                   </td>
                </tr>
              ) : (
                filteredProposals.map((proposal) => (
                  <tr key={proposal._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                          {proposal.studentName?.charAt(0) || 'S'}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{proposal.studentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {proposal.rollNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 max-w-xs">
                      <div className="truncate">{proposal.projectTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {proposal.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Semester {proposal.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(proposal.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(proposal.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewProposal(proposal)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Details"
                        >
                          <FiEye size={18} />
                        </button>
                        {proposal.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(proposal._id, 'approved')}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="Approve"
                            >
                              <FiCheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => {
                                window.pendingStatus = 'rejected'
                                openFeedbackModal(proposal, 'rejected')
                              }}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Reject"
                            >
                              <FiXCircle size={18} />
                            </button>
                            <button
                              onClick={() => {
                                window.pendingStatus = 'revision'
                                openFeedbackModal(proposal, 'revision')
                              }}
                              className="text-orange-600 hover:text-orange-800 transition-colors"
                              title="Request Revision"
                            >
                              <FiMessageSquare size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Proposal Modal */}
      {showViewModal && selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Proposal Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Student Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Student Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Name:</span> {selectedProposal.studentName}</div>
                  <div><span className="text-gray-500">Roll No:</span> {selectedProposal.rollNumber}</div>
                  <div><span className="text-gray-500">Email:</span> {selectedProposal.email}</div>
                  <div><span className="text-gray-500">Department:</span> {selectedProposal.department}</div>
                  <div><span className="text-gray-500">Semester:</span> {selectedProposal.semester}</div>
                  <div><span className="text-gray-500">Submitted:</span> {new Date(selectedProposal.submittedAt).toLocaleString()}</div>
                </div>
              </div>

              {/* Project Details */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Project Title</h4>
                <p className="text-gray-700">{selectedProposal.projectTitle}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Project Description</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedProposal.projectDescription}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Technologies</h4>
                <p className="text-gray-700">{selectedProposal.technologies || 'Not specified'}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Objectives</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedProposal.objectives || 'Not specified'}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Expected Outcomes</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedProposal.expectedOutcomes || 'Not specified'}</p>
              </div>

              {selectedProposal.feedback && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Admin Feedback</h4>
                  <p className="text-yellow-700">{selectedProposal.feedback}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal for Rejection/Revision */}
      {showFeedbackModal && selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {window.pendingStatus === 'rejected' ? 'Reject Proposal' : 'Request Revision'}
              </h3>
              <button onClick={() => {
                setShowFeedbackModal(false)
                setFeedback('')
              }} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                {window.pendingStatus === 'rejected' 
                  ? 'Please provide a reason for rejection:' 
                  : 'Please provide feedback for revision:'}
              </p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={window.pendingStatus === 'rejected' 
                  ? "Enter rejection reason..." 
                  : "Enter revision suggestions..."}
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false)
                    setFeedback('')
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={submitWithFeedback}
                  className={`px-4 py-2 rounded-lg text-white ${
                    window.pendingStatus === 'rejected' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  Confirm
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