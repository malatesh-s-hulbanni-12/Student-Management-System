import React from 'react'

function MyProjects() {
  const projects = [
    { title: 'E-Learning Platform', description: 'A full-stack learning management system', progress: 75, dueDate: '2024-12-15', status: 'Active' },
    { title: 'AI Chatbot Assistant', description: 'Intelligent chatbot for student queries', progress: 45, dueDate: '2025-01-10', status: 'Active' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Projects</h2>
        <p className="text-gray-600">Track and manage your project progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">{project.title}</h3>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                {project.status}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-semibold text-gray-700">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">📅 Due: {project.dueDate}</span>
              <button className="text-primary-600 hover:text-primary-700 font-medium">View Details →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyProjects