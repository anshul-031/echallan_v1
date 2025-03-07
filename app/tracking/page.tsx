'use client';

import { useState, useEffect } from 'react';
import {
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckIcon,
  CodeBracketIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  BellAlertIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const statusCards = [
  {
    title: 'Received Vehicles',
    count: 213,
    icon: TruckIcon,
    color: 'blue',
    trend: '+12%',
    isPositive: true
  },
  {
    title: 'Processed',
    count: 187,
    icon: CheckCircleIcon,
    color: 'green',
    trend: '+8%',
    isPositive: true
  },
  {
    title: 'Pending',
    count: 26,
    icon: ClockIcon,
    color: 'orange',
    trend: '-3%',
    isPositive: false
  },
  {
    title: 'Delivered',
    count: 175,
    icon: TruckIcon,
    color: 'indigo',
    trend: '+15%',
    isPositive: true
  }
];

const serviceSteps = [
  { id: 1, name: 'Government Fees', completed: true, date: '2025-01-15' },
  { id: 2, name: 'RTO Approval', completed: true, date: '2025-01-18' },
  { id: 3, name: 'Inspection', completed: true, date: '2025-01-20' },
  { id: 4, name: 'Certificate', completed: true, date: '2025-01-22' },
  { id: 5, name: 'Document Delivered', completed: false, date: 'Pending' }
];

const apiTrackingData = [
  {
    id: 1,
    api: 'Vehicle Registration Lookup',
    rate: '₹10/request',
    tasksCompleted: 145,
    creditsConsumed: 1450,
    trend: '+12%',
    isPositive: true
  },
  {
    id: 2,
    api: 'Challan Status Check',
    rate: '₹5/request',
    tasksCompleted: 278,
    creditsConsumed: 1390,
    trend: '+8%',
    isPositive: true
  },
  {
    id: 3,
    api: 'Document Verification',
    rate: '₹15/request',
    tasksCompleted: 92,
    creditsConsumed: 1380,
    trend: '-3%',
    isPositive: false
  },
  {
    id: 4,
    api: 'Insurance Validation',
    rate: '₹8/request',
    tasksCompleted: 156,
    creditsConsumed: 1248,
    trend: '+5%',
    isPositive: true
  },
  {
    id: 5,
    api: 'Bulk Vehicle Lookup',
    rate: '₹8/request',
    tasksCompleted: 210,
    creditsConsumed: 1680,
    trend: '+15%',
    isPositive: true
  }
];

const vehicleTrackingData = [
  {
    id: 1,
    vehicleNo: 'RJ09GB9453',
    service: 'Registration Renewal',
    status: 'In Progress',
    location: 'Mumbai RTO',
    lastUpdated: '2025-01-23 10:30 AM'
  },
  {
    id: 2,
    vehicleNo: 'RJ09GB9450',
    service: 'Fitness Certificate',
    status: 'Completed',
    location: 'Delhi RTO',
    lastUpdated: '2025-01-22 02:15 PM'
  },
  {
    id: 3,
    vehicleNo: 'RJ09GB9451',
    service: 'Permit Renewal',
    status: 'Pending',
    location: 'Jaipur RTO',
    lastUpdated: '2025-01-21 11:45 AM'
  }
];

export default function TrackingDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [apiCurrentPage, setApiCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [animatedNumbers, setAnimatedNumbers] = useState(statusCards.map(() => 0));
  const [selectedVehicle, setSelectedVehicle] = useState<typeof vehicleTrackingData[0] | null>(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);

  // Animate numbers on load
  useEffect(() => {
    statusCards.forEach((card, index) => {
      const targetValue = card.count;
      let startValue = 0;
      const duration = 1500; // ms
      const frameDuration = 1000 / 60; // 60fps
      const totalFrames = Math.round(duration / frameDuration);
      let frame = 0;

      const timer = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const currentValue = Math.round(startValue + progress * (targetValue - startValue));
        
        setAnimatedNumbers(prev => {
          const newValues = [...prev];
          newValues[index] = currentValue;
          return newValues;
        });

        if (frame === totalFrames) {
          clearInterval(timer);
        }
      }, frameDuration);

      return () => clearInterval(timer);
    });
  }, []);

  // Calculate pagination for API tracking
  const totalApiPages = Math.ceil(apiTrackingData.length / rowsPerPage);
  const apiStartIndex = (apiCurrentPage - 1) * rowsPerPage;
  const apiEndIndex = apiStartIndex + rowsPerPage;
  const currentApiData = apiTrackingData.slice(apiStartIndex, apiEndIndex);

  // Calculate pagination for vehicle tracking
  const totalVehiclePages = Math.ceil(vehicleTrackingData.length / rowsPerPage);
  const vehicleStartIndex = (currentPage - 1) * rowsPerPage;
  const vehicleEndIndex = vehicleStartIndex + rowsPerPage;
  const currentVehicleData = vehicleTrackingData.slice(vehicleStartIndex, vehicleEndIndex);

  const handleViewDetails = (vehicle: typeof vehicleTrackingData[0]) => {
    setSelectedVehicle(vehicle);
    setShowVehicleDetails(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header with animated gradient */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white shadow-lg animate-gradient">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mt-20 -mr-20 transform rotate-45"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-semibold text-white mb-2">Real Time Tracking Dashboard</h1>
            <p className="text-blue-100 max-w-2xl">Monitor your fleet in real-time with advanced tracking capabilities and detailed analytics.</p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCards.map((card, index) => (
            <div
              key={card.title}
              className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-${card.color}-500/20`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <div className="flex items-baseline mt-2">
                    <p className="text-2xl font-semibold">{animatedNumbers[index].toLocaleString()}</p>
                    <span className={`ml-2 text-xs font-medium ${card.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {card.trend}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-${card.color}-50 transition-all duration-300 ${hoveredCard === index ? `bg-${card.color}-100` : ''}`}>
                  <card.icon className={`w-6 h-6 text-${card.color}-500`} />
                </div>
              </div>
              
              {/* Animated progress bar */}
              <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-${card.color}-500 rounded-full transition-all duration-1000 ease-out`}
                  style={{ 
                    width: `${(animatedNumbers[index] / card.count) * 100}%`,
                    transition: 'width 1.5s ease-out'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tracking Table */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Vehicle Tracking</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search vehicle..."
                    className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SL.NO.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        VEHICLE NO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SERVICES
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        LOCATION
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentVehicleData.map((vehicle, index) => (
                      <tr 
                        key={vehicle.id} 
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {vehicleStartIndex + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-blue-50">
                              <TruckIcon className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{vehicle.vehicleNo}</div>
                              <div className="text-xs text-gray-500">{vehicle.lastUpdated}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vehicle.service}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <MapPinIcon className="h-4 w-4 text-gray-500 mr-1" />
                            {vehicle.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            vehicle.status === 'Completed' 
                              ? 'bg-green-100 text-green-800' 
                              : vehicle.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button 
                            onClick={() => handleViewDetails(vehicle)}
                            className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                    {currentVehicleData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No vehicles currently being tracked
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex items-center">
                  <button className="p-1 rounded-md hover:bg-gray-100 transition-colors">
                    <ArrowPathIcon className="w-5 h-5 text-gray-400" />
                  </button>
                  <span className="ml-3 text-sm text-gray-500">
                    Showing {vehicleTrackingData.length > 0 ? vehicleStartIndex + 1 : 0} to {Math.min(vehicleEndIndex, vehicleTrackingData.length)} of {vehicleTrackingData.length} entries
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="p-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-white bg-blue-600 rounded">
                    {currentPage}
                  </span>
                  <button 
                    className="p-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                    disabled={currentPage === totalVehiclePages || totalVehiclePages === 0}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalVehiclePages))}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Service Progress */}
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Service Progress</h3>
              <div className="space-y-6">
                {serviceSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className="relative"
                  >
                    {/* Vertical line connecting steps */}
                    {index < serviceSteps.length - 1 && (
                      <div className={`absolute left-5 top-8 w-0.5 h-12 ${
                        step.completed ? 'bg-blue-500' : 'bg-gray-200'
                      } transition-colors duration-500`}></div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                        step.completed 
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-200' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {step.completed ? (
                          <CheckIcon className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-medium">{step.id}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          step.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{step.date}</p>
                        
                        {/* Progress details */}
                        {step.completed && (
                          <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg animate-fadeIn">
                            <div className="flex items-center">
                              <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                              <span>Completed successfully</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Overall progress */}
              <div className="mt-8 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Overall Progress</span>
                  <span className="text-sm font-medium text-blue-600">80%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: '80%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Tracking Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">API Usage Tracking</h2>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search API..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S. No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasks Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits Consumed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentApiData.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-indigo-50">
                          <CodeBracketIcon className="h-6 w-6 text-indigo-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.api}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <CurrencyRupeeIcon className="h-4 w-4 text-gray-500 mr-1" />
                        {item.rate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.tasksCompleted.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{item.creditsConsumed.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.isPositive ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          item.isPositive ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {item.trend}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* API Table Pagination */}
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Showing {apiStartIndex + 1} to {Math.min(apiEndIndex, apiTrackingData.length)} of {apiTrackingData.length} entries
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="p-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                disabled={apiCurrentPage === 1}
                onClick={() => setApiCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-white bg-blue-600 rounded">
                {apiCurrentPage}
              </span>
              <button 
                className="p-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                disabled={apiCurrentPage === totalApiPages}
                onClick={() => setApiCurrentPage(prev => Math.min(prev + 1, totalApiPages))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Details Modal */}
      {showVehicleDetails && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl transform transition-all animate-[fadeIn_0.3s_ease-in-out]">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Vehicle Tracking Details
              </h3>
              <button
                onClick={() => setShowVehicleDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="bg-blue-50 p-4 rounded-xl mb-6 flex items-start">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <TruckIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{selectedVehicle.vehicleNo}</h4>
                  <p className="text-sm text-gray-600 mt-1">Last updated: {selectedVehicle.lastUpdated}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="font-medium text-gray-900 mt-1">{selectedVehicle.service}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Location</p>
                  <div className="flex items-center mt-1">
                    <MapPinIcon className="w-4 h-4 text-gray-500 mr-1" />
                    <p className="font-medium text-gray-900">{selectedVehicle.location}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`font-medium mt-1 ${
                    selectedVehicle.status === 'Completed' 
                      ? 'text-green-600' 
                      : selectedVehicle.status === 'In Progress'
                        ? 'text-blue-600'
                        : 'text-yellow-600'
                  }`}>
                    {selectedVehicle.status}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Estimated Completion</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {selectedVehicle.status === 'Completed' 
                      ? 'Completed' 
                      : selectedVehicle.status === 'In Progress'
                        ? '2 days remaining'
                        : '5 days remaining'
                    }
                  </p>
                </div>
              </div>
              
              {/* Service Timeline */}
              <h4 className="text-lg font-medium text-gray-900 mb-4">Service Timeline</h4>
              <div className="space-y-6 mb-6">
                {serviceSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className="relative"
                  >
                    {/* Vertical line connecting steps */}
                    {index < serviceSteps.length - 1 && (
                      <div className={`absolute left-5 top-8 w-0.5 h-12 ${
                        step.completed ? 'bg-blue-500' : 'bg-gray-200'
                      }`}></div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {step.completed ? (
                          <CheckIcon className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-medium">{step.id}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          step.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{step.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Document Status */}
              <h4 className="text-lg font-medium text-gray-900 mb-4">Document Status</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">Required Documents</span>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                    4/5 Complete
                  </span>
                </div>
                
                <div className="space-y-3">
                  {[
                    { name: 'Application Form', status: 'Verified', date: '2025-01-15' },
                    { name: 'Identity Proof', status: 'Verified', date: '2025-01-16' },
                    { name: 'Address Proof', status: 'Verified', date: '2025-01-17' },
                    { name: 'Previous Certificate', status: 'Verified', date: '2025-01-18' },
                    { name: 'Payment Receipt', status: 'Pending', date: '-' }
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                      <span className="text-sm text-gray-600">{doc.name}</span>
                      <div className="flex items-center">
                        <span className={`text-xs font-medium ${
                          doc.status === 'Verified' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {doc.status}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">{doc.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowVehicleDetails(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mr-2"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}