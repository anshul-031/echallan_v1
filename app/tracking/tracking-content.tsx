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
  DocumentTextIcon,
  ExclamationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

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
    lastUpdated: '2025-01-23 10:30 AM',
    progress: {
      overall: 60,
      governmentFees: 100,
      rtoApproval: 100,
      inspection: 50,
      certificate: 50,
      documentDelivery: 0
    },
    details: {
      assignedTo: 'Rahul Sharma',
      priority: 'High',
      startDate: '2025-01-15',
      estimatedCompletion: '2025-01-30'
    }
  },
  {
    id: 2,
    vehicleNo: 'RJ09GB9450',
    service: 'Fitness Certificate',
    status: 'Completed',
    location: 'Delhi RTO',
    lastUpdated: '2025-01-22 02:15 PM',
    progress: {
      overall: 100,
      governmentFees: 100,
      rtoApproval: 100,
      inspection: 100,
      certificate: 100,
      documentDelivery: 100
    },
    details: {
      assignedTo: 'Amit Patel',
      priority: 'Medium',
      startDate: '2025-01-05',
      estimatedCompletion: '2025-01-20'
    }
  },
  {
    id: 3,
    vehicleNo: 'RJ09GB9451',
    service: 'Permit Renewal',
    status: 'Pending',
    location: 'Jaipur RTO',
    lastUpdated: '2025-01-21 11:45 AM',
    progress: {
      overall: 30,
      governmentFees: 100,
      rtoApproval: 50,
      inspection: 0,
      certificate: 0,
      documentDelivery: 0
    },
    details: {
      assignedTo: 'Priya Singh',
      priority: 'Low',
      startDate: '2025-01-18',
      estimatedCompletion: '2025-02-05'
    }
  }
];

export default function TrackingDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [apiCurrentPage, setApiCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [animatedNumbers, setAnimatedNumbers] = useState(statusCards.map(() => 0));
  const [selectedVehicle, setSelectedVehicle] = useState<{
    id: number;
    vehicleNo: string;
    service: string;
    status: string;
    location: string;
    lastUpdated: string;
    progress?: {
      overall: number;
      governmentFees: number;
      rtoApproval: number;
      inspection: number;
      certificate: number;
      documentDelivery: number;
    };
    details?: {
      assignedTo: string;
      priority: string;
      startDate: string;
      estimatedCompletion: string;
    };
  } | null>(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  
  // New state for real-time tracking data
  const [trackingData, setTrackingData] = useState<any[]>([]);
  const [isTrackingLoading, setIsTrackingLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  
  // Add an animation effect state for tracking
  const [trackedVehicleId, setTrackedVehicleId] = useState<number | null>(null);
  
  // Fetch tracking data from API
  useEffect(() => {
    const fetchTrackingData = async (retryCount = 0) => {
      if (!session?.user) return;
      
      try {
        setIsTrackingLoading(true);
        setError(null);
        
        console.log('Tracking: Fetching tracking data');
        const response = await fetch('/api/tracking', {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Error ${response.status}: Failed to fetch tracking data`);
        }
        
        const data = await response.json();
        
        // Check if this is real data (has vehicleData) or mock data
        const isRealData = data.length > 0 && data[0].vehicleData;
        console.log('Tracking: Received tracking data - Using real data:', isRealData);
        
        setTrackingData(data);
      } catch (err: any) {
        console.error('Error fetching tracking data:', err);
        
        // Retry logic - attempt up to 3 retries with increasing delay
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`Retrying tracking data fetch in ${delay}ms (attempt ${retryCount + 1}/3)`);
          
          setTimeout(() => {
            fetchTrackingData(retryCount + 1);
          }, delay);
        } else {
          setError('Failed to load tracking data. Using sample data instead.');
          // Use the existing mock data for demonstration
          setTrackingData(vehicleTrackingData.map(item => ({
            ...item,
            id: item.id,
            vehicleNo: item.vehicleNo,
            service: item.service,
            status: item.status
          })));
        }
      } finally {
        if (retryCount === 0) {
          setIsTrackingLoading(false);
        }
      }
    };
    
    fetchTrackingData();
  }, [session]);

  // Handle refresh for tracking data
  const handleRefreshTracking = () => {
    if (!session?.user) return;
    
    setIsTrackingLoading(true);
    setError(null);
    
    console.log('Tracking: Manually refreshing tracking data');
    toast.loading('Refreshing tracking data...');
    
    fetch('/api/tracking', {
      headers: { 
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache' 
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to refresh tracking data');
        }
        return response.json();
      })
      .then(data => {
        // Check if this is real data or mock data
        const isRealData = data.length > 0 && data[0].vehicleData;
        console.log('Tracking: Refresh complete - Using real data:', isRealData);
        
        setTrackingData(data);
        toast.dismiss();
        toast.success(isRealData ? 'Real tracking data refreshed' : 'Tracking data refreshed');
      })
      .catch(err => {
        console.error('Error refreshing tracking data:', err);
        setError('Failed to refresh tracking data. Please try again.');
        toast.dismiss();
        toast.error('Failed to refresh tracking data');
      })
      .finally(() => {
        setIsTrackingLoading(false);
      });
  };

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

  // Calculate pagination for vehicle tracking using real data
  const totalVehiclePages = Math.ceil(trackingData.length / rowsPerPage);
  const vehicleStartIndex = (currentPage - 1) * rowsPerPage;
  const vehicleEndIndex = vehicleStartIndex + rowsPerPage;
  const currentVehicleData = trackingData.slice(vehicleStartIndex, vehicleEndIndex);

  const handleViewDetails = (vehicle: typeof vehicleTrackingData[0]) => {
    setSelectedVehicle(vehicle);
    setShowVehicleDetails(true);
  };

  // Update the handleTrackVehicle function to include the animation effect
  const handleTrackVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setTrackedVehicleId(vehicle.id);
    toast.success(`Tracking vehicle ${vehicle.vehicleNo}`);
    
    // Reset the animation after 1.5 seconds
    setTimeout(() => {
      setTrackedVehicleId(null);
    }, 1500);
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
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-6">
                  <div className="flex justify-between items-center p-4 bg-white">
                    <h3 className="text-lg font-semibold text-gray-800">Vehicle Document Tracking</h3>
                    <button
                      onClick={handleRefreshTracking}
                      disabled={isTrackingLoading}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <ArrowPathIcon className={`-ml-0.5 mr-2 h-4 w-4 ${isTrackingLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                  
                  {error && (
                    <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg flex items-start">
                      <ExclamationCircleIcon className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}
                  
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">Vehicle No</th>
                        <th scope="col" className="px-6 py-3">Service</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Progress</th>
                        <th scope="col" className="px-6 py-3">Last Updated</th>
                        <th scope="col" className="px-6 py-3">Track</th>
                        <th scope="col" className="px-6 py-3">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isTrackingLoading ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            </div>
                          </td>
                        </tr>
                      ) : trackingData.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                            No tracking data available
                          </td>
                        </tr>
                      ) : (
                        currentVehicleData.map((item, index) => (
                          <tr key={index} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{item.vehicleNo}</td>
                            <td className="px-6 py-4">{item.service}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {item.progress ? (
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className={`h-2.5 rounded-full ${
                                      item.status === 'Completed' ? 'bg-green-500' : 
                                      item.progress?.overall >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                                    }`}
                                    style={{ width: `${item.progress?.overall || 0}%` }}
                                  ></div>
                                </div>
                              ) : (
                                <span className="text-gray-500">N/A</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleTrackVehicle(item)}
                                className={`font-medium text-blue-600 hover:underline ${
                                  trackedVehicleId === item.id ? 'animate-pulse bg-blue-100 px-3 py-1 rounded-full' : ''
                                }`}
                              >
                                Track
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => {
                                  setSelectedVehicle(item);
                                  setShowVehicleDetails(true);
                                }}
                                className="font-medium text-purple-600 hover:underline"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Pagination */}
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex items-center">
                  <button 
                    onClick={handleRefreshTracking}
                    disabled={isTrackingLoading}
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    <ArrowPathIcon className={`w-5 h-5 text-gray-400 ${isTrackingLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <span className="ml-3 text-sm text-gray-500">
                    Showing {vehicleStartIndex + 1} to {Math.min(vehicleEndIndex, trackingData.length)} of {trackingData.length} entries
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedVehicle ? `Service Progress: ${selectedVehicle.vehicleNo}` : 'Service Progress'}
              </h3>
              <div className="space-y-6">
                {selectedVehicle && selectedVehicle.progress ? (
                  <>
                    {/* Government Fees */}
                    <div className="relative">
                      <div className={`absolute left-5 top-8 w-0.5 h-12 ${
                        selectedVehicle.progress.governmentFees === 100 ? 'bg-blue-500' : 'bg-gray-200'
                      } transition-colors duration-500`}></div>
                      <div className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                          selectedVehicle.progress.governmentFees === 100 
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-200' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {selectedVehicle.progress.governmentFees === 100 ? (
                            <CheckIcon className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-medium">1</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            selectedVehicle.progress.governmentFees === 100 ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            Government Fees
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedVehicle.progress.governmentFees === 100 ? 'Completed' : 'In Progress'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* RTO Approval */}
                    <div className="relative">
                      <div className={`absolute left-5 top-8 w-0.5 h-12 ${
                        selectedVehicle.progress.rtoApproval === 100 ? 'bg-blue-500' : 'bg-gray-200'
                      } transition-colors duration-500`}></div>
                      <div className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                          selectedVehicle.progress.rtoApproval === 100 
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-200' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {selectedVehicle.progress.rtoApproval === 100 ? (
                            <CheckIcon className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-medium">2</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            selectedVehicle.progress.rtoApproval === 100 ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            RTO Approval
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedVehicle.progress.rtoApproval === 100 ? 'Completed' : selectedVehicle.progress.rtoApproval > 0 ? 'In Progress' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Inspection */}
                    <div className="relative">
                      <div className={`absolute left-5 top-8 w-0.5 h-12 ${
                        selectedVehicle.progress.inspection === 100 ? 'bg-blue-500' : 'bg-gray-200'
                      } transition-colors duration-500`}></div>
                      <div className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                          selectedVehicle.progress.inspection === 100 
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-200' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {selectedVehicle.progress.inspection === 100 ? (
                            <CheckIcon className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-medium">3</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            selectedVehicle.progress.inspection === 100 ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            Inspection
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedVehicle.progress.inspection === 100 ? 'Completed' : selectedVehicle.progress.inspection > 0 ? 'In Progress' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Certificate */}
                    <div className="relative">
                      <div className={`absolute left-5 top-8 w-0.5 h-12 ${
                        selectedVehicle.progress.certificate === 100 ? 'bg-blue-500' : 'bg-gray-200'
                      } transition-colors duration-500`}></div>
                      <div className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                          selectedVehicle.progress.certificate === 100 
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-200' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {selectedVehicle.progress.certificate === 100 ? (
                            <CheckIcon className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-medium">4</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            selectedVehicle.progress.certificate === 100 ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            Certificate
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedVehicle.progress.certificate === 100 ? 'Completed' : selectedVehicle.progress.certificate > 0 ? 'In Progress' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Document Delivered */}
                    <div className="relative">
                      <div className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                          selectedVehicle.progress.documentDelivery === 100 
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-200' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {selectedVehicle.progress.documentDelivery === 100 ? (
                            <CheckIcon className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-medium">5</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            selectedVehicle.progress.documentDelivery === 100 ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            Document Delivered
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedVehicle.progress.documentDelivery === 100 ? 'Completed' : selectedVehicle.progress.documentDelivery > 0 ? 'In Progress' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Overall progress */}
                    <div className="mt-8 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Overall Progress</span>
                        <span className="text-sm font-medium text-blue-600">{selectedVehicle.progress.overall}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${selectedVehicle.progress.overall}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Default service steps when no vehicle is selected
                  <>
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
                    
                    {/* Default overall progress */}
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
                  </>
                )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Tracking Details</h3>
                <button 
                  onClick={() => setShowVehicleDetails(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="bg-blue-50 p-3 rounded-full">
                  <TruckIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">{selectedVehicle.vehicleNo}</h4>
                  <p className="text-gray-500">{selectedVehicle.service}</p>
                </div>
                <div className="ml-auto">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedVehicle.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    selectedVehicle.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedVehicle.status}
                  </span>
                </div>
              </div>
              
              {selectedVehicle.progress && (
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Overall Progress</h5>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                          {selectedVehicle.progress.overall}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                      <div 
                        style={{ width: `${selectedVehicle.progress.overall}%` }} 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500">
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedVehicle.details && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Assigned To</p>
                    <p className="text-base font-medium">{selectedVehicle.details.assignedTo}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Priority</p>
                    <p className={`text-base font-medium ${
                      selectedVehicle.details.priority === 'High' ? 'text-red-600' : 
                      selectedVehicle.details.priority === 'Medium' ? 'text-amber-600' : 'text-blue-600'
                    }`}>
                      {selectedVehicle.details.priority}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Started Date</p>
                    <p className="text-base font-medium">
                      {selectedVehicle.details.startDate ? new Date(selectedVehicle.details.startDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Estimated Completion</p>
                    <p className="text-base font-medium">
                      {selectedVehicle.details.estimatedCompletion ? new Date(selectedVehicle.details.estimatedCompletion).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              )}
              
              {selectedVehicle.progress && (
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Detailed Progress</h5>
                  <div className="space-y-4">
                    <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Government Fees</p>
                      </div>
                      <div className="col-span-3">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="h-2.5 rounded-full bg-green-500" style={{ width: `${selectedVehicle.progress.governmentFees}%` }}></div>
                        </div>
                      </div>
                      <div className="col-span-1 text-right">
                        <p className="text-sm font-medium">{selectedVehicle.progress.governmentFees}%</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">RTO Approval</p>
                      </div>
                      <div className="col-span-3">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full ${selectedVehicle.progress.rtoApproval === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${selectedVehicle.progress.rtoApproval}%` }}></div>
                        </div>
                      </div>
                      <div className="col-span-1 text-right">
                        <p className="text-sm font-medium">{selectedVehicle.progress.rtoApproval}%</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Vehicle Inspection</p>
                      </div>
                      <div className="col-span-3">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full ${selectedVehicle.progress.inspection === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${selectedVehicle.progress.inspection}%` }}></div>
                        </div>
                      </div>
                      <div className="col-span-1 text-right">
                        <p className="text-sm font-medium">{selectedVehicle.progress.inspection}%</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Certificate Generation</p>
                      </div>
                      <div className="col-span-3">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full ${selectedVehicle.progress.certificate === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${selectedVehicle.progress.certificate}%` }}></div>
                        </div>
                      </div>
                      <div className="col-span-1 text-right">
                        <p className="text-sm font-medium">{selectedVehicle.progress.certificate}%</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Document Delivery</p>
                      </div>
                      <div className="col-span-3">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full ${selectedVehicle.progress.documentDelivery === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${selectedVehicle.progress.documentDelivery}%` }}></div>
                        </div>
                      </div>
                      <div className="col-span-1 text-right">
                        <p className="text-sm font-medium">{selectedVehicle.progress.documentDelivery}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}