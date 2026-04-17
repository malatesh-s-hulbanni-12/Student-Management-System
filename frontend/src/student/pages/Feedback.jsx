import React, { useState } from 'react'
import { useToast } from '../../context/ToastContext'
import { FiStar, FiSend, FiMessageCircle } from 'react-icons/fi'

function Feedback() {
  const { showSuccess } = useToast()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const feedbackHistory = [
    {
      id: 1,
      from: 'Dr. Ahmed Raza (Supervisor)',
      message: 'Great progress on the project! Keep up the good work.',
      date: '2024-01-15',
      rating: 5
    },
    {
      id: 2,
      from: 'Project Review Committee',
      message: 'Please improve the documentation and add more details.',
      date: '2024-01-10',
      rating: 3
    }
  ]

  const handleSubmit = () => {
    if (!feedback.trim()) {
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      showSuccess('Feedback submitted successfully!')
      setFeedback('')
      setRating(0)
      setSubmitting(false)
    }, 1000)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Feedback & Reviews</h2>
        <p className="text-gray-600">Share your feedback and view reviews from supervisors</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Submit Your Feedback</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rate Your Experience
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <FiStar
                    size={28}
                    className={`${
                      (hoverRating || rating) >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Share your thoughts about the project management system..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !feedback.trim()}
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
          >
            <FiSend size={18} />
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Feedback History</h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {feedbackHistory.map((item) => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <FiMessageCircle className="text-primary-500" />
                    <span className="font-semibold text-gray-800">{item.from}</span>
                  </div>
                  <span className="text-xs text-gray-500">{item.date}</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{item.message}</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      size={14}
                      className={star <= item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Feedback