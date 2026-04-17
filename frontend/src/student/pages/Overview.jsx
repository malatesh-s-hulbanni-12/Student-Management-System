import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axiosInstance from '../../services/axiosConfig'
import { FiBookOpen, FiCheckCircle, FiClock, FiUser, FiCalendar, FiAlertCircle } from 'react-icons/fi'

function Overview() {
  const { showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedTasks: 0,
    pendingTasks: 0,
    approvedProjects: 0,
    pendingProposals: 0
  })
  const [recentProposals, setRecentProposals] = useState([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([])

  // Fetch student data
  const fetchStudentData = async () => {
    try {
      // Fetch student's proposals
      const proposalsRes = await axiosInstance.get('/proposals/my-proposals')
      const proposals = proposalsRes.data.proposals || []
      
      // Calculate stats
      const totalProjects = proposals.length
      const approvedProjects = proposals.filter(p => p.status === 'approved' || p.status === 'assigned').length
      const pendingProposals = proposals.filter(p => p.status === 'pending').length
      
      // Calculate tasks (based on deadlines)
      let completedTasks = 0
      let pendingTasks = 0
      const allDeadlines = []
      
      proposals.forEach(proposal => {
        if (proposal.deadlines && proposal.deadlines.length > 0) {
          proposal.deadlines.forEach(deadline => {
            if (deadline.status === 'completed') {
              completedTasks++
            } else {
              pendingTasks++
            }
            allDeadlines.push({
              ...deadline,
              projectTitle: proposal.projectTitle,
              proposalId: proposal._id
            })
          })
        }
      })
      
      setStats({
        totalProjects,
        completedTasks,
        pendingTasks,
        approvedProjects,
        pendingProposals
      })
      
      // Get recent proposals (last 3)
      const recent = proposals.slice(0, 3).map(p => ({
        title: p.projectTitle,
        status: p.status,
        submittedAt: p.submittedAt,
        feedback: p.feedback
      }))
      setRecentProposals(recent)
      
      // Get upcoming deadlines (pending and future dates)
      const now = new Date()
      const upcoming = allDeadlines
        .filter(d => d.status !== 'completed' && new Date(d.dueDate) > now)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3)
      setUpcomingDeadlines(upcoming)
      
    } catch (error) {
      console.error('Error fetching student data:', error)
      showError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentData()
  }, [])

  const getStatusBadge = (status) => {
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
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Student Dashboard Overview</h2>
        <p className="text-gray-600">Welcome to your student dashboard. Track your projects and stay updated.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-sm font-semibold opacity-90">My Projects</h3>
              <p className="text-3xl font-bold mt-1">{stats.totalProjects}</p>
            </div>
            <FiBookOpen size={32} className="opacity-50" />
          </div>
          <p className="text-xs opacity-75 mt-2">{stats.approvedProjects} approved • {stats.pendingProposals} pending</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl mb-2">✅</div>
              <h3 className="text-sm font-semibold opacity-90">Completed Tasks</h3>
              <p className="text-3xl font-bold mt-1">{stats.completedTasks}</p>
            </div>
            <FiCheckCircle size={32} className="opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl mb-2">⏰</div>
              <h3 className="text-sm font-semibold opacity-90">Pending Tasks</h3>
              <p className="text-3xl font-bold mt-1">{stats.pendingTasks}</p>
            </div>
            <FiClock size={32} className="opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl mb-2">📋</div>
              <h3 className="text-sm font-semibold opacity-90">Active Projects</h3>
              <p className="text-3xl font-bold mt-1">{stats.approvedProjects}</p>
            </div>
            <FiBookOpen size={32} className="opacity-50" />
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Proposals */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiBookOpen className="text-primary-500" /> Recent Proposals
          </h3>
          {recentProposals.length > 0 ? (
            <div className="space-y-3">
              {recentProposals.map((proposal, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{proposal.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(proposal.status)}`}>
                          {proposal.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(proposal.submittedAt)}
                        </span>
                      </div>
                      {proposal.feedback && (
                        <p className="text-xs text-gray-500 mt-2">Feedback: {proposal.feedback}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No proposals submitted yet</p>
              <button 
                onClick={() => window.location.href = '/student#submit-proposal'}
                className="mt-2 text-primary-600 hover:text-primary-700 text-sm"
              >
                Submit your first proposal →
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiCalendar className="text-primary-500" /> Upcoming Deadlines
          </h3>
          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{deadline.projectTitle}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-red-600 font-medium">
                          Due: {formatDate(deadline.dueDate)}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                      Pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiCalendar className="mx-auto text-3xl mb-2 opacity-50" />
              <p>No upcoming deadlines</p>
              <p className="text-xs mt-1">Your deadlines will appear here once assigned</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/student#submit-proposal'}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg hover:shadow-lg transition-all flex items-center gap-3 justify-center"
          >
            <span className="text-2xl">📝</span>
            <span className="font-semibold">Submit Proposal</span>
          </button>
          <button 
            onClick={() => window.location.href = '/student#upload-files'}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:shadow-lg transition-all flex items-center gap-3 justify-center"
          >
            <span className="text-2xl">📁</span>
            <span className="font-semibold">Upload Files</span>
          </button>
          <button 
            onClick={() => window.location.href = '/student#supervisor'}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg hover:shadow-lg transition-all flex items-center gap-3 justify-center"
          >
            <span className="text-2xl">👨‍🏫</span>
            <span className="font-semibold">View Supervisor</span>
          </button>
          <button 
            onClick={() => window.location.href = '/student#notifications'}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg hover:shadow-lg transition-all flex items-center gap-3 justify-center"
          >
            <span className="text-2xl">🔔</span>
            <span className="font-semibold">Notifications</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Overview