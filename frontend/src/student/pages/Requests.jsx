import React from 'react'

function Requests() {
  const requests = [
    { type: 'Supervisor Request', status: 'Approved', date: '2024-01-10', response: 'Request accepted by supervisor' },
    { type: 'Extension Request', status: 'Pending', date: '2024-01-15', response: 'Awaiting approval' },
    { type: 'Meeting Request', status: 'Approved', date: '2024-01-12', response: 'Meeting scheduled for Jan 20' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Requests</h2>
        <p className="text-gray-600">Track your submitted requests</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((request, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{request.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{request.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      request.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{request.response}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Requests