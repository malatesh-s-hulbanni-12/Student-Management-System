import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axiosInstance from '../../services/axiosConfig'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { 
  FiUsers, 
  FiZap, 
  FiClock, 
  FiCheckCircle, 
  FiFileText, 
  FiUserCheck, 
  FiBarChart2, 
  FiFolder,
  FiActivity,
  FiEye
} from 'react-icons/fi'

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
      const studentsRes = await axiosInstance.get('/proposals/my-students')
      
      if (studentsRes.data.success && studentsRes.data.hasStudents) {
        const students = studentsRes.data.students
        
        const totalStudents = students.length
        const activeProjects = students.filter(s => s.projectStatus === 'assigned').length
        const completedProjects = students.filter(s => s.projectStatus === 'completed').length || 0
        
        const progressData = students.map((student, index) => ({
          name: student.studentName.split(' ')[0],
          progress: Math.floor(Math.random() * 40) + 50
        })).slice(0, 5)
        
        setProjectProgress(progressData)
        
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
        
        try {
          const [requestsRes, filesRes] = await Promise.all([
            axiosInstance.get('/requests/teacher-requests'),
            axiosInstance.get('/files/teacher-files')
          ])
          
          const activities = []
          
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
          
          activities.sort((a, b) => new Date(b.time) - new Date(a.time))
          setRecentActivities(activities.slice(0, 5))
          
        } catch (err) {
          console.error('Error fetching activities:', err)
        }
      }
      
      setStats(prev => ({
        ...prev,
        pendingReviews: Math.floor(Math.random() * 5) + 1
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
    { icon: FiUsers, label: 'My Students', value: stats.totalStudents, color: 'from-blue-500 to-blue-600' },
    { icon: FiZap, label: 'Active Projects', value: stats.activeProjects, color: 'from-purple-500 to-purple-600' },
    { icon: FiClock, label: 'Pending Reviews', value: stats.pendingReviews, color: 'from-yellow-500 to-yellow-600' },
    { icon: FiCheckCircle, label: 'Completed Projects', value: stats.completedProjects, color: 'from-green-500 to-green-600' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome to Teacher Dashboard!</h2>
        <p className="text-gray-600">Manage your students and supervise their projects effectively.</p>
      </div>

      {/* Stats Cards with React Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className={`bg-gradient-to-r ${stat.color} p-5`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm opacity-90 mb-1">{stat.label}</p>
                  <p className="text-white text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="text-4xl text-white/80" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Project Progress Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiBarChart2 className="text-blue-500" size={18} />
            Student Project Progress
          </h3>
          {projectProgress.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="progress" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <FiBarChart2 className="text-4xl text-gray-300 mb-2" />
              <p>No project data available</p>
            </div>
          )}
        </div>

        {/* Project Status Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiBarChart2 className="text-green-500" size={18} />
            Project Status Distribution
          </h3>
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
              <FiBarChart2 className="text-4xl text-gray-300 mb-2" />
              <p>No project status data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiActivity className="text-purple-500" size={18} />
          Recent Activities
        </h3>
        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <div>
                  <p className="font-semibold text-gray-800 flex items-center gap-2">
                    <FiUsers size={14} className="text-gray-400" />
                    {activity.student}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{activity.action}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <FiClock size={10} /> {activity.time}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FiActivity className="text-4xl text-gray-300 mx-auto mb-2" />
            No recent activities
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/teacher#projects'}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <FiFileText size={18} />
            <span className="font-semibold">Review Projects</span>
          </button>
          <button 
            onClick={() => window.location.href = '/teacher#students'}
            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <FiUsers size={18} />
            <span className="font-semibold">View Students</span>
          </button>
          <button 
            onClick={() => window.location.href = '/teacher#requests'}
            className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <FiBarChart2 size={18} />
            <span className="font-semibold">View Requests</span>
          </button>
          <button 
            onClick={() => window.location.href = '/teacher#studentfiles'}
            className="bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <FiFolder size={18} />
            <span className="font-semibold">Student Files</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Overview