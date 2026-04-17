import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axiosInstance from '../../services/axiosConfig'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

function Overview() {
  const { showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeProjects: 0,
    pendingReviews: 0,
    completedProjects: 0
  })
  const [projectProgress, setProjectProgress] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [projectStatusData, setProjectStatusData] = useState([])

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      // Fetch assigned students (projects)
      const studentsRes = await axiosInstance.get('/proposals/my-students')
      
      if (studentsRes.data.success && studentsRes.data.hasStudents) {
        const students = studentsRes.data.students
        
        // Calculate stats
        const totalStudents = students.length
        const activeProjects = students.filter(s => s.projectStatus === 'assigned').length
        const completedProjects = students.filter(s => s.projectStatus === 'completed').length || 0
        
        // Calculate project progress (for demo, using random progress or based on deadlines)
        const progressData = students.map((student, index) => ({
          name: student.studentName.split(' ')[0],
          progress: Math.floor(Math.random() * 40) + 50 // Random progress between 50-90%
        })).slice(0, 5)
        
        setProjectProgress(progressData)
        
        // Project status distribution for pie chart
        const statusCount = {
          assigned: students.filter(s => s.projectStatus === 'assigned').length,
          pending: students.filter(s => s.projectStatus === 'pending').length,
          approved: students.filter(s => s.projectStatus === 'approved').length
        }
        
        setProjectStatusData([
          { name: 'Assigned', value: statusCount.assigned, color: '#0ea5e9' },
          { name: 'Pending', value: statusCount.pending, color: '#f59e0b' },
          { name: 'Approved', value: statusCount.approved, color: '#10b981' }
        ])
        
        setStats({
          totalStudents,
          activeProjects,
          pendingReviews: students.filter(s => s.projectStatus === 'pending').length,
          completedProjects
        })
        
        // Fetch recent activities (requests and file uploads)
        try {
          const [requestsRes, filesRes] = await Promise.all([
            axiosInstance.get('/requests/teacher-requests'),
            axiosInstance.get('/files/teacher-files')
          ])
          
          const activities = []
          
          // Add recent requests
          if (requestsRes.data.success && requestsRes.data.requests) {
            requestsRes.data.requests.slice(0, 5).forEach(req => {
              activities.push({
                student: req.studentName,
                action: `Sent a ${req.requestType} request`,
                time: new Date(req.createdAt).toLocaleString(),
                status: req.status
              })
            })
          }
          
          // Add recent file uploads
          if (filesRes.data.success && filesRes.data.files) {
            filesRes.data.files.slice(0, 5).forEach(file => {
              activities.push({
                student: file.studentName,
                action: `Uploaded ${file.fileType}: ${file.fileOriginalName}`,
                time: new Date(file.createdAt).toLocaleString(),
                status: 'completed'
              })
            })
          }
          
          // Sort by time and get latest 5
          activities.sort((a, b) => new Date(b.time) - new Date(a.time))
          setRecentActivities(activities.slice(0, 5))
          
        } catch (err) {
          console.error('Error fetching activities:', err)
        }
      }
      
      setStats(prev => ({
        ...prev,
        pendingReviews: Math.floor(Math.random() * 5) + 1 // Demo pending reviews
      }))
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      showError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'approved': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  const statsCards = [
    { icon: '👨‍🎓', label: 'My Students', value: stats.totalStudents, color: 'from-blue-500 to-blue-600' },
    { icon: '🚀', label: 'Active Projects', value: stats.activeProjects, color: 'from-purple-500 to-purple-600' },
    { icon: '⏳', label: 'Pending Reviews', value: stats.pendingReviews, color: 'from-yellow-500 to-yellow-600' },
    { icon: '✅', label: 'Completed Projects', value: stats.completedProjects, color: 'from-green-500 to-green-600' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome to Teacher Dashboard!</h2>
        <p className="text-gray-600">Manage your students and supervise their projects effectively.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className={`bg-gradient-to-r ${stat.color} p-5`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm opacity-90 mb-1">{stat.label}</p>
                  <p className="text-white text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Project Progress Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Student Project Progress</h3>
          {projectProgress.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="progress" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No project data available
            </div>
          )}
        </div>

        {/* Project Status Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Project Status Distribution</h3>
          {projectStatusData.some(d => d.value > 0) ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No project status data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activities</h3>
        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                <div>
                  <p className="font-semibold text-gray-800">{activity.student}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent activities
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/teacher#projects'}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg hover:shadow-lg transition-all flex items-center gap-3 justify-center"
          >
            <span className="text-2xl">📝</span> Review Projects
          </button>
          <button 
            onClick={() => window.location.href = '/teacher#students'}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:shadow-lg transition-all flex items-center gap-3 justify-center"
          >
            <span className="text-2xl">👨‍🎓</span> View Students
          </button>
          <button 
            onClick={() => window.location.href = '/teacher#requests'}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg hover:shadow-lg transition-all flex items-center gap-3 justify-center"
          >
            <span className="text-2xl">📊</span> View Requests
          </button>
          <button 
            onClick={() => window.location.href = '/teacher#studentfiles'}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg hover:shadow-lg transition-all flex items-center gap-3 justify-center"
          >
            <span className="text-2xl">📁</span> Student Files
          </button>
        </div>
      </div>
    </div>
  )
}

export default Overview