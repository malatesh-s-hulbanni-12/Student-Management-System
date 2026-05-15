import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axiosInstance from '../../services/axiosConfig'
import { 
  FiDownload, 
  FiFile, 
  FiFileText, 
  FiImage, 
  FiChevronDown, 
  FiSearch, 
  FiRefreshCw,
  FiBarChart2,
  FiUsers,
  FiFolder,
  FiBookOpen,
  FiUser
} from 'react-icons/fi'
import { FaFilePowerpoint } from 'react-icons/fa'

function Reports() {
  const { showSuccess, showError } = useToast()
  const [files, setFiles] = useState([])
  const [filteredFiles, setFilteredFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [openDropdown, setOpenDropdown] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  // Fetch all files (admin view - all student files)
  const fetchFiles = async () => {
    setIsRefreshing(true)
    console.log('Fetching all files...')
    try {
      const response = await axiosInstance.get('/files/all-files')
      console.log('Files response:', response.data)
      if (response.data.success) {
        console.log('Total files received:', response.data.files.length)
        setFiles(response.data.files)
        setFilteredFiles(response.data.files)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
      showError('Failed to load reports')
    } finally {
      setLoading(false)
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  // Filter files based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFiles(files)
    } else {
      const filtered = files.filter(file =>
        file.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredFiles(filtered)
    }
  }, [searchTerm, files])

  const downloadFile = (file) => {
    console.log('Downloading file:', file.fileOriginalName)
    window.open(file.fileUrl, '_blank')
  }

  const getFileIcon = (type) => {
    switch(type) {
      case 'report': return <FiFileText className="text-blue-500" size={18} />
      case 'presentation': return <FaFilePowerpoint className="text-orange-500" size={18} />
      case 'image': return <FiImage className="text-green-500" size={18} />
      default: return <FiFile className="text-gray-500" size={18} />
    }
  }

  const getFileTypeLabel = (type) => {
    switch(type) {
      case 'report': return 'Report'
      case 'presentation': return 'Presentation'
      case 'image': return 'Image'
      default: return 'Document'
    }
  }

  const toggleDropdown = (fileId) => {
    setOpenDropdown(openDropdown === fileId ? null : fileId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading reports...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header with Refresh Button */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
          <p className="text-gray-600">View and download all student reports and documents</p>
        </div>
        <button
          onClick={fetchFiles}
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

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <FiFolder className="text-2xl text-blue-500 mb-1" />
          <div className="text-xl font-bold text-gray-800">{files.length}</div>
          <div className="text-xs text-gray-500">Total Files</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <FiUsers className="text-2xl text-green-500 mb-1" />
          <div className="text-xl font-bold text-gray-800">{new Set(files.map(f => f.studentId)).size}</div>
          <div className="text-xs text-gray-500">Students</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <FiFileText className="text-2xl text-purple-500 mb-1" />
          <div className="text-xl font-bold text-gray-800">{files.filter(f => f.fileType === 'report').length}</div>
          <div className="text-xs text-gray-500">Reports</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <FiBarChart2 className="text-2xl text-orange-500 mb-1" />
          <div className="text-xl font-bold text-gray-800">{files.filter(f => f.fileType === 'presentation').length}</div>
          <div className="text-xs text-gray-500">Presentations</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by project title, student name, or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Files List - Row by Row with Project Title Prominently */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <FiBarChart2 className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Reports Found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'No files match your search criteria.' : 'No files have been uploaded yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredFiles.map((file) => (
              <div key={file._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  
                  {/* Left side - Project Title (Prominent) */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getFileIcon(file.fileType)}
                      <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full bg-gray-100">
                        {getFileTypeLabel(file.fileType)}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-base lg:text-lg">
                      {file.projectTitle || 'Untitled Project'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <FiUser size={12} /> {file.studentName || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <FiBookOpen size={12} /> {file.rollNumber || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Right side - Download button only */}
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(file._id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-all"
                    >
                      <FiDownload size={14} />
                      Download
                      <FiChevronDown size={12} className={`transition-transform ${openDropdown === file._id ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown menu */}
                    {openDropdown === file._id && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setOpenDropdown(null)}
                        />
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                          <div className="p-2 border-b border-gray-100 bg-gray-50">
                            <p className="text-xs font-medium text-gray-600">Download options</p>
                          </div>
                          <button
                            onClick={() => {
                              downloadFile(file)
                              setOpenDropdown(null)
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                          >
                            <FiDownload size={14} className="text-blue-500" />
                            {file.fileOriginalName || 'Download File'}
                          </button>
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <p className="px-3 py-1 text-xs text-gray-400 flex items-center gap-1">
                              <FiFolder size={10} /> Size: {file.fileSize || 'Unknown'}
                            </p>
                            <p className="px-3 py-1 text-xs text-gray-400">
                              📅 {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for no files */}
      {files.length === 0 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <FiFile size={12} /> No documents available for download
          </p>
        </div>
      )}
    </div>
  )
}

export default Reports