import React, { useState } from 'react'
import { useToast } from '../../context/ToastContext'
import axiosInstance from '../../services/axiosConfig'
import { FiSend } from 'react-icons/fi'

function SubmitProposal() {
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectDescription: '',
    technologies: '',
    objectives: '',
    expectedOutcomes: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await axiosInstance.post('/proposals', formData)
      
      if (response.data.success) {
        showSuccess('✅ Project proposal submitted successfully!')
        // Reset form
        setFormData({
          projectTitle: '',
          projectDescription: '',
          technologies: '',
          objectives: '',
          expectedOutcomes: ''
        })
      }
    } catch (error) {
      console.error('Submit error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to submit proposal'
      showError(`❌ ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Submit Project Proposal</h2>
        <p className="text-gray-600">
          Please fill out all sections of your project proposal. Make sure to be detailed and clear about your project goals.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              name="projectTitle"
              value={formData.projectTitle}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your project title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Description *
            </label>
            <textarea
              name="projectDescription"
              value={formData.projectDescription}
              onChange={handleChange}
              required
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Provide a detailed description of your project including problem statement, solution approach, and expected impact..."
            />
            <p className="text-xs text-gray-500 mt-1">Provide a detailed description of your project</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Technologies to be Used
            </label>
            <input
              type="text"
              name="technologies"
              value={formData.technologies}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., React, Node.js, MongoDB, Python, etc."
            />
            <p className="text-xs text-gray-500 mt-1">List all technologies, frameworks, and tools you plan to use</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Objectives
            </label>
            <textarea
              name="objectives"
              value={formData.objectives}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="List the main objectives of your project..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Expected Outcomes
            </label>
            <textarea
              name="expectedOutcomes"
              value={formData.expectedOutcomes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe what you expect to achieve from this project..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-70"
            >
              <FiSend size={18} />
              {loading ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SubmitProposal