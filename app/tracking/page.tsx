'use client';

import { useState } from 'react';
import {
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckIcon,
  MapPinIcon,
  ChartBarIcon,
  BellAlertIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const statusCards = [
  {
    title: 'Active Vehicles',
    count: 189,
    trend: '+12%',
    isPositive: true,
    icon: TruckIcon,
    color: 'from-blue-500 to-blue-600',
    textGradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
    iconGradient: 'bg-gradient-to-br from-blue-500/10 to-blue-600/10',
    borderColor: 'border-blue-100',
    shadowColor: 'shadow-blue-500/20'
  },
  {
    title: 'In Transit',
    count: 45,
    trend: '+8%',
    isPositive: true,
    icon: MapPinIcon,
    color: 'from-purple-500 to-purple-600',
    textGradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
    iconGradient: 'bg-gradient-to-br from-purple-500/10 to-purple-600/10',
    borderColor: 'border-purple-100',
    shadowColor: 'shadow-purple-500/20'
  },
  {
    title: 'Alerts',
    count: 12,
    trend: '-3%',
    isPositive: false,
    icon: BellAlertIcon,
    color: 'from-red-500 to-red-600',
    textGradient: 'bg-gradient-to-r from-red-500 to-red-600',
    iconGradient: 'bg-gradient-to-br from-red-500/10 to-red-600/10',
    borderColor: 'border-red-100',
    shadowColor: 'shadow-red-500/20'
  },
  {
    title: 'Performance',
    count: '98%',
    trend: '+5%',
    isPositive: true,
    icon: ChartBarIcon,
    color: 'from-emerald-500 to-emerald-600',
    textGradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    iconGradient: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10',
    borderColor: 'border-emerald-100',
    shadowColor: 'shadow-emerald-500/20'
  }
];

const vehicles = [
  {
    id: 1,
    vrn: 'RJ09GB9453',
    driver: 'John Smith',
    location: 'City Center',
    status: 'Active',
    lastUpdate: '2 mins ago',
    progress: 75,
    route: 'Mumbai → Delhi',
    eta: '2h 45m'
  },
  {
    id: 2,
    vrn: 'RJ09GB9450',
    driver: 'Sarah Johnson',
    location: 'Highway 101',
    status: 'In Transit',
    lastUpdate: '5 mins ago',
    progress: 45,
    route: 'Delhi → Jaipur',
    eta: '4h 15m'
  }
];

const serviceSteps = [
  { id: 1, name: 'Government Fees', completed: true },
  { id: 2, name: 'RTO Approval', completed: true },
  { id: 3, name: 'Inspection', completed: true },
  { id: 4, name: 'Certificate', completed: false },
  { id: 5, name: 'Document Delivered', completed: false }
];

export default function TrackingDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<typeof vehicles[0] | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Real Time Tracking</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor your fleet in real-time</p>
          </div>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Refresh Data
          </button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCards.map((card, index) => (
            <div
              key={card.title}
              className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer
                transform hover:scale-[1.02] hover:-translate-y-1`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Animated Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 
                transition-opacity duration-300 blur-xl
                ${hoveredCard === index ? 'opacity-20' : ''}`}
              />
              
              {/* Card Content */}
              <div className={`relative bg-white border ${card.borderColor} p-6 h-full
                transition-all duration-300
                ${hoveredCard === index ? card.shadowColor : 'shadow-sm'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${card.iconGradient}`}>
                        <card.icon className={`w-5 h-5 ${card.textGradient} bg-clip-text`} />
                      </div>
                      <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                    </div>
                    <p className={`text-2xl font-bold mt-2 ${card.textGradient} bg-clip-text text-transparent`}>
                      {card.count}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {card.isPositive ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className={card.isPositive ? 'text-green-500' : 'text-red-500'}>
                      {card.trend}
                    </span>
                  </div>
                </div>

                {/* Hover Effect Indicator */}
                <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full transition-all duration-300
                  bg-gradient-to-r ${card.color}
                  ${hoveredCard === index ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Vehicle Tracking Table */}
          <div className="flex-1 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Vehicle Status</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETA</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vehicles.map((vehicle) => (
                    <tr 
                      key={vehicle.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedVehicle(vehicle)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <TruckIcon className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">{vehicle.vrn}</div>
                            <div className="text-sm text-gray-500">{vehicle.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{vehicle.driver}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{vehicle.route}</td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${vehicle.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{vehicle.progress}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          vehicle.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{vehicle.eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Service Progress Panel */}
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Service Progress</h3>
              <div className="space-y-6">
                {serviceSteps.map((step, index) => (
                  <div key={step.id} className="relative">
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        step.completed ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <CheckIcon className={`w-5 h-5 ${
                          step.completed ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className={`text-sm font-medium ${
                          step.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.name}
                        </h4>
                      </div>
                    </div>
                    {index < serviceSteps.length - 1 && (
                      <div className={`absolute left-4 top-8 w-0.5 h-10 transform -translate-x-1/2 ${
                        step.completed ? 'bg-blue-200' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}