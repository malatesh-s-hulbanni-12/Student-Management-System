import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axiosInstance from '../../services/axiosConfig'
import { 
  FiDownload, 
  FiFile, 
  FiImage, 
  FiFileText, 
  FiRefreshCw, 
  FiSearch, 
  FiUser, 
  FiBookOpen
} from 'react-icons/fi'

function StudentFiles() {
  const { showSuccess, showError } = useToast()
  const [files, setFiles] = useState([])
  const [filteredFiles, setFilteredFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [projects, setProjects] = useState([])

  const API_URL = 'http://localhost:5000'

  const fetchData = async () => {
    try {
      const [filesRes, studentsRes] = await Promise.all([
        axiosInstance.get('/files/teacher-files'),
        axiosInstance.get('/proposals/my-students')
      ])
      
      if (filesRes.data.success) {
        setFiles(filesRes.data.files)
        setFilteredFiles(filesRes.data.files)
      }
      
      if (studentsRes.data.success && studentsRes.data.hasStudents) {
        const studentList = studentsRes.data.students
        const projectList = [...new Map(studentList.map(s => [s.proposalId, { id: s.proposalId, title: s.projectTitle, studentName: s.studentName }])).values()]
        setProjects(projectList)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      showError('Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = [...files]
    if (selectedStudent) filtered = filtered.filter(f => f.studentId === selectedStudent)
    if (selectedProject) filtered = filtered.filter(f => f.proposalId === selectedProject)
    if (searchTerm) {
      filtered = filtered.filter(f => 
        f.fileOriginalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredFiles(filtered)
  }, [searchTerm, selectedStudent, selectedProject, files])

  const downloadFile = (file) => {
    window.open(`${API_URL}${file.fileUrl}`, '_blank')
  }

  const getFileTypeIcon = (type) => {
    switch(type) {
      case 'report': return <FiFileText className="text-blue-500" size={24} />
      case 'presentation': return <FiFile className="text-orange-500" size={24} />
      case 'image': return <FiImage className="text-green-500" size={24} />
      default: return <FiFile className="text-gray-500" size={24} />
    }
  }

  const getFileTypeLabel = (type) => {
    switch(type) {
      case 'report': return '📄 Report'
      case 'presentation': return '📊 Presentation'
      case 'image': return '🖼️ Image'
      default: return '📁 Other'
    }
  }

  const uniqueStudents = [...new Map(files.map(f => [f.studentId, { id: f.studentId, name: f.studentName, rollNumber: f.rollNumber }])).values()]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading files...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Student Files</h2>
        <p className="text-gray-600">View and download files uploaded by your assigned students</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">📁</div>
          <div className="text-2xl font-bold">{files.length}</div>
          <div className="text-sm opacity-90">Total Files</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">📄</div>
          <div className="text-2xl font-bold">{files.filter(f => f.fileType === 'report').length}</div>
          <div className="text-sm opacity-90">Reports</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">📊</div>
          <div className="text-2xl font-bold">{files.filter(f => f.fileType === 'presentation').length}</div>
          <div className="text-sm opacity-90">Presentations</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">👨‍🎓</div>
          <div className="text-2xl font-bold">{uniqueStudents.length}</div>
          <div className="text-sm opacity-90">Students</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Students</option>
            {uniqueStudents.map(student => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.rollNumber})
              </option>
            ))}
          </select>
          
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Files Found</h3>
          <p className="text-gray-600">
            {files.length === 0 ? "No files uploaded yet." : "No files match your filters."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <tr key={file._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getFileTypeIcon(file.fileType)}
                      <span className="text-sm text-gray-800">{file.fileOriginalName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium">{file.studentName}</p>
                      <p className="text-xs text-gray-500">{file.rollNumber}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{file.projectTitle}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                      {getFileTypeLabel(file.fileType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{file.fileSize}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => downloadFile(file)} className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                      <FiDownload size={16} /> Download
                    </button>
                  </td>
                 </tr>
              ))}
            </tbody>
           </table>
        </div>
      )}
    </div>
  )
}

export default StudentFiles