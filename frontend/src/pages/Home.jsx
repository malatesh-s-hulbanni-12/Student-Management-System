import React from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 animate-slide-up">
        <div className="text-center mb-12">
          <div className="inline-block mb-6 animate-float">
            <span className="text-7xl">🎓</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Final Year Project{' '}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Management System
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline your final year projects, collaborate with supervisors, and track progress efficiently
          </p>
          
          <button
            onClick={() => navigate('/login')}
            className="group bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center gap-2"
          >
            <span>Get Started</span>
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-50 rounded-xl p-6 text-center card-hover">
            <div className="text-4xl mb-3">👨‍🎓</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">For Students</h3>
            <p className="text-gray-600 text-sm">Submit projects, track progress, and communicate with supervisors</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 text-center card-hover">
            <div className="text-4xl mb-3">👨‍🏫</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">For Teachers</h3>
            <p className="text-gray-600 text-sm">Guide students, evaluate projects, and manage submissions</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 text-center card-hover">
            <div className="text-4xl mb-3">⚙️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">For Admins</h3>
            <p className="text-gray-600 text-sm">Oversee all activities, manage users, and ensure smooth operations</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home