import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import axiosInstance from '../../services/axiosConfig'
import { FiUpload, FiFile, FiCheckCircle, FiX, FiDownload, FiTrash2, FiFolder, FiImage, FiFileText } from 'react-icons/fi'

function UploadFiles() {
  const { showSuccess, showError } = useToast()
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileType, setFileType] = useState('report')
  const [selectedProposal, setSelectedProposal] = useState('')
  const [myProposals, setMyProposals] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [loading, setLoading] = useState(true)

  const API_URL = 'http://localhost:5000'

  // Fetch student's proposals and uploaded files
  const fetchData = async () => {
    try {
      const [proposalsRes, filesRes] = await Promise.all([
        axiosInstance.get('/proposals/my-proposals'),
        axiosInstance.get('/files/my-files')
      ])
      
      if (proposalsRes.data.success) {
        // Filter only approved/assigned proposals
        const activeProposals = proposalsRes.data.proposals.filter(p => 
          p.status === 'approved' || p.status === 'assigned'
        )
        setMyProposals(activeProposals)
      }
      
      if (filesRes.data.success) {
        setUploadedFiles(filesRes.data.files)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      showError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      showError('Please select a file to upload')
      return
    }
    
    if (!selectedProposal) {
      showError('Please select a project')
      return
    }

    const proposal = myProposals.find(p => p._id === selectedProposal)
    if (!proposal) {
      showError('Invalid proposal selected')
      return
    }

    setUploading(true)
    
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('proposalId', selectedProposal)
    formData.append('projectTitle', proposal.projectTitle)
    formData.append('fileType', fileType)

    try {
      const response = await axiosInstance.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (response.data.success) {
        showSuccess('File uploaded successfully!')
        setSelectedFile(null)
        setSelectedProposal('')
        setFileType('report')
        fetchData()
        // Reset file input
        document.getElementById('fileInput').value = ''
      }
    } catch (error) {
      console.error('Upload error:', error)
      showError(error.response?.data?.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const deleteFile = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        const response = await axiosInstance.delete(`/files/${fileId}`)
        if (response.data.success) {
          showSuccess('File deleted successfully')
          fetchData()
        }
      } catch (error) {
        showError('Failed to delete file')
      }
    }
  }

  const downloadFile = (file) => {
    window.open(`${API_URL}${file.fileUrl}`, '_blank')
  }

  const getFileTypeIcon = (type) => {
    switch(type) {
      case 'report': return <FiFileText className="text-blue-500" size={20} />
      case 'presentation': return <FiFile className="text-orange-500" size={20} />
      case 'image': return <FiImage className="text-green-500" size={20} />
      default: return <FiFile className="text-gray-500" size={20} />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Upload Files</h2>
        <p className="text-gray-600">Upload project documents, reports, and other relevant files</p>
      </div>

      {/* File Type Selection Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setFileType('report')}
          className={`p-4 rounded-xl border-2 transition-all ${
            fileType === 'report' 
              ? 'border-primary-500 bg-primary-50 text-primary-700' 
              : 'border-gray-200 hover:border-primary-300'
          }`}
        >
          <FiFileText className="text-2xl mx-auto mb-2" />
          <p className="font-semibold">Report</p>
          <p className="text-xs text-gray-500">.pdf, .doc, .docx</p>
        </button>
        <button
          onClick={() => setFileType('presentation')}
          className={`p-4 rounded-xl border-2 transition-all ${
            fileType === 'presentation' 
              ? 'border-primary-500 bg-primary-50 text-primary-700' 
              : 'border-gray-200 hover:border-primary-300'
          }`}
        >
          <FiFile className="text-2xl mx-auto mb-2" />
          <p className="font-semibold">Presentation</p>
          <p className="text-xs text-gray-500">.ppt, .pptx</p>
        </button>
        <button
          onClick={() => setFileType('image')}
          className={`p-4 rounded-xl border-2 transition-all ${
            fileType === 'image' 
              ? 'border-primary-500 bg-primary-50 text-primary-700' 
              : 'border-gray-200 hover:border-primary-300'
          }`}
        >
          <FiImage className="text-2xl mx-auto mb-2" />
          <p className="font-semibold">Image</p>
          <p className="text-xs text-gray-500">.jpg, .png</p>
        </button>
        <button
          onClick={() => setFileType('other')}
          className={`p-4 rounded-xl border-2 transition-all ${
            fileType === 'other' 
              ? 'border-primary-500 bg-primary-50 text-primary-700' 
              : 'border-gray-200 hover:border-primary-300'
          }`}
        >
          <FiFolder className="text-2xl mx-auto mb-2" />
          <p className="font-semibold">Other</p>
          <p className="text-xs text-gray-500">Other formats</p>
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
          <FiUpload className="mx-auto text-4xl text-gray-400 mb-3" />
          <p className="text-gray-600 mb-2">Click to browse or drag and drop</p>
          
          {/* Project Selection Dropdown */}
          {myProposals.length > 0 && (
            <div className="mb-4 max-w-md mx-auto">
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                Select Project *
              </label>
              <select
                value={selectedProposal}
                onChange={(e) => setSelectedProposal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">-- Select a project --</option>
                {myProposals.map((proposal) => (
                  <option key={proposal._id} value={proposal._id}>
                    {proposal.projectTitle} ({proposal.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}

          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="fileInput"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
          />
          <label
            htmlFor="fileInput"
            className="inline-block bg-primary-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary-600 transition-colors"
          >
            Select File
          </label>
        </div>

        {selectedFile && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 mb-3">File to Upload</h3>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getFileTypeIcon(fileType)}
                <div>
                  <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {getFileTypeLabel(fileType)}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-700">
                <FiX size={20} />
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedProposal}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-70"
              >
                <FiUpload size={18} />
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
          </div>
        )}

        {myProposals.length === 0 && (
          <div className="mt-4 text-center text-yellow-600 bg-yellow-50 p-3 rounded-lg">
            No active projects found. Please wait for your proposal to be approved.
          </div>
        )}
      </div>

      {/* Uploaded Files Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Files</h3>
        {uploadedFiles.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No files uploaded yet</p>
        ) : (
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                <div className="flex items-center gap-3 flex-1">
                  {getFileTypeIcon(file.fileType)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{file.fileOriginalName}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                      <span>📁 {getFileTypeLabel(file.fileType)}</span>
                      <span>📅 {new Date(file.createdAt).toLocaleDateString()}</span>
                      <span>📊 {file.fileSize}</span>
                      <span>📋 Project: {file.projectTitle}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadFile(file)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                    title="Download"
                  >
                    <FiDownload size={18} />
                  </button>
                  <button
                    onClick={() => deleteFile(file._id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                    title="Delete"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadFiles