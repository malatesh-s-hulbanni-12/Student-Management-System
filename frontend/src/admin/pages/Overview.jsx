import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axiosInstance from '../../services/axiosConfig'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts'
import { 
  FiUsers, 
  FiUserCheck, 
  FiClock, 
  FiTrendingUp,
  FiUserPlus, 
  FiUser, 
  FiBookOpen, 
  FiBarChart2,
  FiActivity,
  FiEye,
  FiZap
} from 'react-icons/fi'

function Overview() {
  const { showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    pendingRequests: 0,
    activeProjects: 0
  })
  const [pieData, setPieData] = useState([])
  const [barData, setBarData] = useState([])
  const [activities, setActivities] = useState([])

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const studentsRes = await axiosInstance.get('/students')
      const teachersRes = await axiosInstance.get('/teachers')
      const proposalsRes = await axiosInstance.get('/proposals/all')
      
      const students = studentsRes.data.students || []
      const teachers = teachersRes.data.teachers || []
      const proposals = proposalsRes.data.proposals || []
      
      const totalStudents = students.length
      const totalTeachers = teachers.length
      const pendingRequests = proposals.filter(p => p.status === 'pending').length
      const activeProjects = proposals.filter(p => p.status === 'assigned' || p.status === 'approved').length
      
      setStats({
        totalStudents,
        totalTeachers,
        pendingRequests,
        activeProjects
      })
      
      // Calculate project distribution by supervisor
      const supervisorMap = new Map()
      proposals.forEach(proposal => {
        if (proposal.assignedSupervisor && proposal.assignedSupervisor.name) {
          const name = proposal.assignedSupervisor.name
          supervisorMap.set(name, (supervisorMap.get(name) || 0) + 1)
        }
      })
      
      const supervisorColors = ['#0ea5e9', '#d946ef', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
      const pieChartData = Array.from(supervisorMap.entries()).map(([name, value], index) => ({
        name: name,
        value: value,
        color: supervisorColors[index % supervisorColors.length]
      }))
      
      setPieData(pieChartData.length > 0 ? pieChartData : [
        { name: 'No supervisors assigned', value: 1, color: '#9ca3af' }
      ])
      
      const barChartData = Array.from(supervisorMap.entries()).map(([name, projects]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        projects: projects
      })).slice(0, 6)
      
      setBarData(barChartData.length > 0 ? barChartData : [
        { name: 'No data', projects: 0 }
      ])
      
      try {
        const requestsRes = await axiosInstance.get('/requests/teacher-requests')
        const recentActivities = []
        
        if (requestsRes.data.success && requestsRes.data.requests) {
          requestsRes.data.requests.slice(0, 5).forEach(req => {
            recentActivities.push({
              student: req.studentName,
              teacher: req.teacherName,
              status: 'Request',
              priority: 'Medium',
              time: new Date(req.createdAt).toLocaleString(),
              type: 'request'
            })
          })
        }
        
        proposals.slice(0, 5).forEach(proposal => {
          recentActivities.push({
            student: proposal.studentName,
            teacher: proposal.assignedSupervisor?.name || 'Not assigned',
            status: proposal.status,
            priority: proposal.status === 'pending' ? 'High' : 'Low',
            time: new Date(proposal.submittedAt).toLocaleString(),
            type: 'proposal'
          })
        })
        
        recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time))
        setActivities(recentActivities.slice(0, 5))
        
      } catch (err) {
        console.error('Error fetching activities:', err)
      }
      
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

  const getPriorityColor = (priority) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'approved': return 'bg-green-100 text-green-700'
      case 'assigned': return 'bg-blue-100 text-blue-700'
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
    { icon: FiUsers, label: 'Total Students', value: stats.totalStudents, color: 'from-blue-500 to-blue-600' },
    { icon: FiUserCheck, label: 'Total Teachers', value: stats.totalTeachers, color: 'from-green-500 to-green-600' },
    { icon: FiClock, label: 'Pending Requests', value: stats.pendingRequests, color: 'from-yellow-500 to-yellow-600' },
    { icon: FiZap, label: 'Active Projects', value: stats.activeProjects, color: 'from-purple-500 to-purple-600' },
  ]

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome back, Admin!</h2>
        <p className="text-gray-600">Manage the entire project management system and oversee all activities.</p>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pie Chart - Project Distribution */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiBarChart2 className="text-blue-500" size={18} />
            Project Distribution by Supervisor
          </h3>
          {pieData.length > 0 && pieData[0].name !== 'No supervisors assigned' ? (
            <>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {pieData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-all">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-gray-700 text-sm">{item.name}</span>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {item.value} Projects
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <FiUserCheck className="text-4xl text-gray-300 mb-2" />
              <p>No supervisors assigned yet</p>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiBarChart2 className="text-green-500" size={18} />
            Projects Distribution Overview
          </h3>
          {barData.length > 0 && barData[0].projects > 0 ? (
            <>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="projects" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center text-gray-500 text-xs">
                <p>X-Axis: Supervisors | Y-Axis: Number of Projects Assigned</p>
              </div>
            </>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <FiBarChart2 className="text-4xl text-gray-300 mb-2" />
              <p>No project data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiActivity className="text-purple-500" size={18} />
            Recent Activity
          </h3>
          <button 
            onClick={() => window.location.href = '/admin#projects'}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-all"
          >
            View All <FiEye size={14} />
          </button>
        </div>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <div className="flex-1">
                  <p className="text-gray-800 font-semibold flex items-center gap-2">
                    <FiUser size={14} className="text-gray-400" />
                    {activity.student}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.type === 'request' 
                      ? `has requested ${activity.teacher} to be their supervisor`
                      : `submitted proposal - Status: ${activity.status.toUpperCase()}`
                    }
                  </p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <FiClock size={10} /> {activity.time}
                  </p>
                </div>
                <div className="flex gap-2">
                  {activity.type === 'request' ? (
                    <>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(activity.priority)}`}>
                        {activity.status}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(activity.priority)}`}>
                        {activity.priority}
                      </span>
                    </>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(activity.status)}`}>
                      {activity.status.toUpperCase()}
                    </span>
                  )}
                </div>
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
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          ⚡ Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/admin#students'}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-md"
          >
            <FiUserPlus size={18} />
            <span className="font-semibold">Add Student</span>
          </button>
          <button 
            onClick={() => window.location.href = '/admin#teachers'}
            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-md"
          >
            <FiUserPlus size={18} />
            <span className="font-semibold">Add Teacher</span>
          </button>
          <button 
            onClick={() => window.location.href = '/admin#projects'}
            className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-md"
          >
            <FiBarChart2 size={18} />
            <span className="font-semibold">View Projects</span>
          </button>
          <button 
            onClick={() => window.location.href = '/admin#assign-supervisor'}
            className="bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-md"
          >
            <FiUserCheck size={18} />
            <span className="font-semibold">Assign Supervisor</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Overview