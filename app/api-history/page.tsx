'use client';

import { useState } from 'react';
import { 
  CodeBracketIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const apiStats = [
  {
    title: 'Total Requests',
    count: '12,453',
    trend: '+8%',
    isPositive: true,
    icon: DocumentTextIcon,
    color: 'from-blue-500 to-blue-600',
    textGradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
    iconGradient: 'bg-gradient-to-br from-blue-500/10 to-blue-600/10',
    borderColor: 'border-blue-100',
    shadowColor: 'shadow-blue-500/20'
  },
  {
    title: 'Success Rate',
    count: '99.8%',
    trend: '+0.2%',
    isPositive: true,
    icon: CheckCircleIcon,
    color: 'from-emerald-500 to-emerald-600',
    textGradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    iconGradient: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10',
    borderColor: 'border-emerald-100',
    shadowColor: 'shadow-emerald-500/20'
  },
  {
    title: 'Average Response',
    count: '245ms',
    trend: '-12ms',
    isPositive: true,
    icon: ClockIcon,
    color: 'from-purple-500 to-purple-600',
    textGradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
    iconGradient: 'bg-gradient-to-br from-purple-500/10 to-purple-600/10',
    borderColor: 'border-purple-100',
    shadowColor: 'shadow-purple-500/20'
  },
  {
    title: 'Error Rate',
    count: '0.2%',
    trend: '+0.1%',
    isPositive: false,
    icon: XCircleIcon,
    color: 'from-red-500 to-red-600',
    textGradient: 'bg-gradient-to-r from-red-500 to-red-600',
    iconGradient: 'bg-gradient-to-br from-red-500/10 to-red-600/10',
    borderColor: 'border-red-100',
    shadowColor: 'shadow-red-500/20'
  }
];

const apiRequests = [
  {
    id: 1,
    endpoint: '/api/vehicles/lookup',
    method: 'GET',
    status: 200,
    responseTime: '235ms',
    timestamp: '2024-01-23 14:30:25',
    ip: '192.168.1.100'
  },
  {
    id: 2,
    endpoint: '/api/challans/create',
    method: 'POST',
    status: 201,
    responseTime: '312ms',
    timestamp: '2024-01-23 14:29:15',
    ip: '192.168.1.101'
  }
];

export default function ApiHistoryPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">API History</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor your API usage and performance</p>
          </div>
          <button 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Refresh
          </button>
        </div>

        {/* API Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {apiStats.map((stat, index) => (
            <div
              key={stat.title}
              className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer
                transform hover:scale-[1.02] hover:-translate-y-1`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Animated Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 
                transition-opacity duration-300 blur-xl
                ${hoveredCard === index ? 'opacity-20' : ''}`}
              />
              
              {/* Card Content */}
              <div className={`relative bg-white border ${stat.borderColor} p-6 h-full
                transition-all duration-300
                ${hoveredCard === index ? stat.shadowColor : 'shadow-sm'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${stat.iconGradient}`}>
                        <stat.icon className={`w-5 h-5 ${stat.textGradient} bg-clip-text`} />
                      </div>
                      <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                    </div>
                    <p className={`text-2xl font-bold mt-2 ${stat.textGradient} bg-clip-text text-transparent`}>
                      {stat.count}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {stat.isPositive ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className={stat.isPositive ? 'text-green-500' : 'text-red-500'}>
                      {stat.trend}
                    </span>
                  </div>
                </div>

                {/* Hover Effect Indicator */}
                <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full transition-all duration-300
                  bg-gradient-to-r ${stat.color}
                  ${hoveredCard === index ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* API Requests Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent API Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CodeBracketIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">{request.endpoint}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        request.method === 'GET' 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {request.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        request.status < 400
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.responseTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, apiRequests.length)} of {apiRequests.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
                <button 
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  disabled={currentPage * rowsPerPage >= apiRequests.length}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}