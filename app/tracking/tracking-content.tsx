'use client';

import { useState, useEffect } from 'react';
import {
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { getSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface RenewalService {
  id: number;
  services: string;
  vehicle_no: string;
  vehicleId: number;
  userId: string;
  gst: number;
  govFees: number;
  serviceCharge: number;
  price: number;
  govtFees: boolean;
  rtoApproval: boolean;
  inspection: boolean;
  certificate: boolean;
  govtFeesUpdate?: Date;
  rtoApprovalUpdate?: Date;
  inspectionUpdate?: Date;
  certificateUpdate?: Date;
  documentDeliveryUpdate?: Date;
  documentDelivered: boolean;
  documentRecieved: boolean;
  documentRecievedUpdate?: Date;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface StatusCard {
  title: string;
  count: number;
  icon: React.ElementType;
  color: string;
}

type ServiceStats = {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
};

const getStatusCards = (stats: ServiceStats): StatusCard[] => [
  {
    title: 'Total Services',
    count: stats.total,
    icon: TruckIcon,
    color: 'blue'
  },
  {
    title: 'Completed',
    count: stats.completed,
    icon: CheckCircleIcon,
    color: 'green'
  },
  {
    title: 'Pending',
    count: stats.pending,
    icon: ClockIcon,
    color: 'yellow'
  },
  {
    title: 'Processing',
    count: stats.processing,
    icon: TruckIcon,
    color: 'indigo'
  }
];



export default function TrackingDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [animatedNumbers, setAnimatedNumbers] = useState<number[]>([0, 0, 0, 0]);
  const [selectedVehicle, setSelectedVehicle] = useState<{
    id: number;
    vehicleNo: string;
    service: string;
    status: string;
    location: string;
    lastUpdated: string;
    govtFeesUpdate?: Date;
    rtoApprovalUpdate?: Date;
    inspectionUpdate?: Date;
    certificateUpdate?: Date;
    documentDeliveryUpdate?: Date;
    documentRecieved: boolean;
    documentRecievedUpdate?: Date;
    expectedDeliveryDate?: Date;
    deliveryPerformance?: {
      daysEarlyOrLate: number;
      isEarly: boolean;
    };
    progress?: {
      overall: number;
      governmentFees: number;
      rtoApproval: number;
      inspection: number;
      certificate: number;
      documentDelivery: number;
    };
  } | null>(null);

  // State for services data
  const [servicesData, setServicesData] = useState<RenewalService[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceStats, setServiceStats] = useState<ServiceStats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0
  });

  // Fetch services data
  // Add state for active status filter
  const [activeStatus, setActiveStatus] = useState<string | null>(null);

  // Function to fetch services with status filter
  const fetchServices = async (status?: string) => {
    try {
      const session = await getSession();
      if (!session?.user) return;

      setIsServicesLoading(true);
      setError(null);

      const url = status ? `/api/services?status=${status}` : '/api/services';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      console.log('Fetched data:', data);
      setServicesData(data.services || []);

      // Update stats from API response if available
      if (data.stats) {
        setServiceStats({
          total: data.stats.totalServices || 0,
          pending: data.stats.pendingCount || 0,
          processing: data.stats.processingCount || 0,
          completed: data.stats.completedCount || 0,
          cancelled: data.stats.cancelledCount || 0
        });
      }
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError('Failed to load services data');
    } finally {
      setIsServicesLoading(false);
    }
  };

  // Handle status card click
  const handleStatusCardClick = (status: string | null) => {
    setActiveStatus(status);
    fetchServices(status?.toLowerCase());
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).split(' ').join('-');
  };


  useEffect(() => {
    fetchServices();
  }, []);

  // Calculate progress percentage for a service
  const calculateServiceProgress = (service: RenewalService) => {
    const steps = [
      service.govtFees,
      service.rtoApproval,
      service.inspection,
      service.certificate,
      service.documentDelivered
    ];
    const completedSteps = steps.filter(Boolean).length;
    return (completedSteps / steps.length) * 100;
  };

  // Select a service to show progress
  const handleTrackService = (service: RenewalService) => {
    let expectedDeliveryDate: Date | undefined;
    let deliveryPerformance: { daysEarlyOrLate: number; isEarly: boolean } | undefined;

    // Calculate expected delivery and performance for completed services
    if (service.status === 'completed' && service.documentRecieved && service.documentRecievedUpdate) {
      // Expected delivery is 15 days from document received date
      expectedDeliveryDate = new Date(service.documentRecievedUpdate);
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 15);

      // Calculate performance if document was delivered
      if (service.documentDelivered && service.documentDeliveryUpdate) {
        const expectedDate = expectedDeliveryDate.getTime();
        const actualDate = new Date(service.documentDeliveryUpdate).getTime();
        const diffInDays = Math.floor((expectedDate - actualDate) / (1000 * 60 * 60 * 24));

        deliveryPerformance = {
          daysEarlyOrLate: Math.abs(diffInDays),
          isEarly: diffInDays > 0
        };
      }
    }

    setSelectedVehicle({
      id: service.id,
      vehicleNo: service.vehicle_no,
      service: service.services,
      status: service.status,
      location: 'RTO Office',
      lastUpdated: service.updatedAt,
      govtFeesUpdate: service.govtFeesUpdate,
      rtoApprovalUpdate: service.rtoApprovalUpdate,
      inspectionUpdate: service.inspectionUpdate,
      certificateUpdate: service.certificateUpdate,
      documentDeliveryUpdate: service.documentDeliveryUpdate,
      documentRecieved: service.documentRecieved,
      documentRecievedUpdate: service.documentRecievedUpdate,
      expectedDeliveryDate,
      deliveryPerformance,
      progress: {
        overall: calculateServiceProgress(service),
        governmentFees: service.govtFees ? 100 : 0,
        rtoApproval: service.rtoApproval ? 100 : 0,
        inspection: service.inspection ? 100 : 0,
        certificate: service.certificate ? 100 : 0,
        documentDelivery: service.documentDelivered ? 100 : 0
      }
    });
    toast.success(`Tracking service for vehicle ${service.vehicle_no}`);
  };

  // Handle refresh
  const handleRefreshServices = async () => {
    try {
      setIsServicesLoading(true);
      setError(null);
      toast.loading('Refreshing services...');

      const url = activeStatus ? `/api/services?status=${activeStatus}` : '/api/services';
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to refresh services');
      }

      const data = await response.json();
      const services = data.services || [];
      setServicesData(services);

      // Update stats from refreshed data
      if (data.stats) {
        setServiceStats({
          total: data.stats.totalServices || 0,
          pending: data.stats.pendingCount || 0,
          processing: data.stats.processingCount || 0,
          completed: data.stats.completedCount || 0,
          cancelled: data.stats.cancelledCount || 0
        });
      }

      // Update tracked vehicle if one is selected
      if (selectedVehicle) {
        const updatedService = services.find((service: RenewalService) => service.id === selectedVehicle.id);
        if (updatedService) {
          handleTrackService(updatedService);
        }
      }

      toast.dismiss();
      toast.success('Services refreshed successfully');
    } catch (err) {
      console.error('Error refreshing services:', err);
      toast.dismiss();
      toast.error('Failed to refresh services');
      setError('Failed to refresh services. Please try again.');
    } finally {
      setIsServicesLoading(false);
    }
  };

  // Animate numbers on load
  // Animate numbers when stats change
  useEffect(() => {
    const cards = getStatusCards(serviceStats);
    cards.forEach((card, index) => {
      const targetValue = card.count;
      let startValue = animatedNumbers[index];
      const duration = 1500;
      const frameDuration = 1000 / 60;
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
  }, [serviceStats]);



  // Calculate pagination for services
  const totalPages = Math.ceil(servicesData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;


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
          {getStatusCards(serviceStats).map((card, index) => {
            const status = card.title === 'Total Services' ? null : card.title.toLowerCase();
            const isActive = status === activeStatus;
            return (
              <div
                key={card.title}
                className={`bg-white rounded-xl p-6 shadow-sm border cursor-pointer
                  ${isActive ? `border-${card.color}-500 ring-2 ring-${card.color}-500` : 'border-gray-100'}
                  transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-${card.color}-500/20`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleStatusCardClick(status)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{card.title}</p>
                    <div className="flex items-baseline mt-2">
                      <p className="text-2xl font-semibold">{animatedNumbers[index].toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-${card.color}-50 transition-all duration-300
                    ${hoveredCard === index || isActive ? `bg-${card.color}-100` : ''}`}>
                    <card.icon className={`w-6 h-6 text-${card.color}-500`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tracking Table */}
          <div className="flex-1">
            <div className="rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                  <div className="flex justify-end items-center my-5 mr-5">
                    <button
                      onClick={handleRefreshServices}
                      disabled={isServicesLoading}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <ArrowPathIcon className={`-ml-0.5 mr-2 h-4 w-4 ${isServicesLoading ? 'animate-spin' : ''}`} />
                      Refresh Services
                    </button>
                  </div>

                  {error && (
                    <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg flex items-start">
                      <ExclamationCircleIcon className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <table className="w-full bg-white text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">Vehicle No</th>
                        <th scope="col" className="px-6 py-3">Service Type</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Gov Fees</th>
                        <th scope="col" className="px-6 py-3">Service Charge</th>
                        <th scope="col" className="px-6 py-3">GST</th>
                        <th scope="col" className="px-6 py-3">Total Price</th>
                        <th scope="col" className="px-6 py-3">Progress</th>
                        <th scope="col" className="px-6 py-3">Created At</th>
                        <th scope="col" className="px-6 py-3">Track</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isServicesLoading ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            </div>
                          </td>
                        </tr>
                      ) : servicesData.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                            No services data available
                          </td>
                        </tr>
                      ) : (
                        servicesData.map((service, index) => (
                          <tr key={service.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{service.vehicle_no}</td>
                            <td className="px-6 py-4">{service.services}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${service.status === 'completed' ? 'bg-green-100 text-green-800' :
                                service.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                  service.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4">₹{service.govFees}</td>
                            <td className="px-6 py-4">₹{service.serviceCharge}</td>
                            <td className="px-6 py-4">₹{service.gst}</td>
                            <td className="px-6 py-4">₹{service.govFees + service.serviceCharge}</td>
                            <td className="px-6 py-4">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full ${service.status === 'completed' ? 'bg-green-500' :
                                    service.status === 'processing' ? 'bg-blue-500' :
                                      service.status === 'cancelled' ? 'bg-red-500' :
                                        'bg-yellow-500'
                                    }`}
                                  style={{
                                    width: `${calculateServiceProgress(service)}%`
                                  }}
                                ></div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {new Date(service.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleTrackService(service)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                Track
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
                  <span className="ml-3 text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(endIndex, servicesData.length)} of {servicesData.length} entries
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
                  <span className="p-2 text-xs text-white bg-blue-600 rounded">
                    {currentPage}
                  </span>
                  <button
                    className="p-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
                    {activeStatus === 'completed' ? (
                      <>
                        {/* Document Received */}
                        <div className="relative">
                          <div className={`absolute left-5 top-8 w-0.5 h-12 ${selectedVehicle.documentRecieved ? 'bg-blue-500' : 'bg-gray-200'} transition-colors duration-500`}></div>
                          <div className="flex items-start space-x-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${selectedVehicle.documentRecieved ? 'bg-blue-500 text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}>
                              {selectedVehicle.documentRecieved ? (
                                <CheckIcon className="w-5 h-5" />
                              ) : (
                                <span className="text-sm font-medium">1</span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">Document Received</span>
                              {selectedVehicle.documentRecievedUpdate && (
                                <span className="text-xs text-gray-500">
                                  {formatDate(new Date(selectedVehicle.documentRecievedUpdate).toLocaleDateString())}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expected Delivery */}
                        <div className="relative">
                          <div className={`absolute left-5 top-8 w-0.5 h-12 ${selectedVehicle.expectedDeliveryDate ? 'bg-blue-500' : 'bg-gray-200'} transition-colors duration-500`}></div>
                          <div className="flex items-start space-x-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${selectedVehicle.expectedDeliveryDate ? 'bg-blue-500 text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}>
                              {selectedVehicle.documentRecieved ? (
                                <CheckIcon className="w-5 h-5" />
                              ) : (
                                <span className="text-sm font-medium">2</span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">Expected Delivery</span>
                              {selectedVehicle.expectedDeliveryDate && (
                                <span className="text-xs text-gray-500">
                                  {formatDate(new Date(selectedVehicle.expectedDeliveryDate).toLocaleDateString())}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Document Delivered */}
                        <div className="relative">
                          <div className={`absolute left-5 top-8 w-0.5 h-12 ${selectedVehicle.progress.documentDelivery === 100 ? 'bg-blue-500' : 'bg-gray-200'} transition-colors duration-500`}></div>
                          <div className="flex items-start space-x-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${selectedVehicle.progress.documentDelivery === 100 ? 'bg-blue-500 text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}>
                              {selectedVehicle.status === 'completed' ? (
                                <CheckIcon className="w-5 h-5" />
                              ) : (
                                <span className="text-sm font-medium">3</span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">Document Delivered</span>
                              {selectedVehicle.documentDeliveryUpdate && (
                                <span className="text-xs text-gray-500">
                                  {formatDate(new Date(selectedVehicle.documentDeliveryUpdate).toLocaleDateString())}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Delivery Performance */}
                        {selectedVehicle.deliveryPerformance && (
                          <div className="relative">
                            <div className="flex items-start space-x-4">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 text-white shadow-md shadow-blue-200`}>
                                {selectedVehicle.status === 'completed' && selectedVehicle.expectedDeliveryDate ? (
                                  <CheckIcon className="w-5 h-5" />
                                ) : (
                                  <span className="text-sm font-medium">4</span>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">Performance</span>
                                <span className={`text-xs ${selectedVehicle.deliveryPerformance.isEarly ? 'text-green-600' : 'text-red-600'}`}>
                                  {selectedVehicle.deliveryPerformance.isEarly
                                    ? `Delivered ${selectedVehicle.deliveryPerformance.daysEarlyOrLate} days early`
                                    : `Delivery was ${selectedVehicle.deliveryPerformance.daysEarlyOrLate} days late`}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                      </>
                    ) : (
                      <>
                        {/* Regular steps for non-completed services */}
                        {/* Government Fees */}
                        <div className="relative">
                          <div className={`absolute left-5 top-8 w-0.5 h-12 ${selectedVehicle.progress.governmentFees === 100 ? 'bg-blue-500' : 'bg-gray-200'} transition-colors duration-500`}></div>
                          <div className="flex items-start space-x-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${selectedVehicle.progress.governmentFees === 100 ? 'bg-blue-500 text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}>
                              {selectedVehicle.progress.governmentFees === 100 ? (
                                <CheckIcon className="w-5 h-5" />
                              ) : (
                                <span className="text-sm font-medium">1</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${selectedVehicle.progress.governmentFees === 100 ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                Government Fees
                              </p>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>
                                  {selectedVehicle.progress.governmentFees === 100
                                    ? 'Completed'
                                    : selectedVehicle.status === 'processing'
                                      ? 'In Progress'
                                      : 'Pending'}
                                </span>
                                {selectedVehicle.govtFeesUpdate && (
                                  <span>
                                    {new Date(selectedVehicle.govtFeesUpdate).toLocaleDateString('en-US', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* RTO Approval */}
                        <div className="relative">
                          <div className={`absolute left-5 top-8 w-0.5 h-12 ${selectedVehicle.progress.rtoApproval === 100 ? 'bg-blue-500' : 'bg-gray-200'
                            } transition-colors duration-500`}></div>
                          <div className="flex items-start space-x-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${selectedVehicle.progress.rtoApproval === 100
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
                              <p className={`text-sm font-medium ${selectedVehicle.progress.rtoApproval === 100 ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                RTO Approval
                              </p>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>
                                  {selectedVehicle.progress.rtoApproval === 100 ? 'Completed' : selectedVehicle.progress.rtoApproval > 0 ? 'In Progress' : 'Pending'}
                                </span>
                                {selectedVehicle.rtoApprovalUpdate && (
                                  <span>
                                    {new Date(selectedVehicle.rtoApprovalUpdate).toLocaleDateString('en-US', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Inspection */}
                        <div className="relative">
                          <div className={`absolute left-5 top-8 w-0.5 h-12 ${selectedVehicle.progress.inspection === 100 ? 'bg-blue-500' : 'bg-gray-200'
                            } transition-colors duration-500`}></div>
                          <div className="flex items-start space-x-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${selectedVehicle.progress.inspection === 100
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
                              <p className={`text-sm font-medium ${selectedVehicle.progress.inspection === 100 ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                Inspection
                              </p>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>
                                  {selectedVehicle.progress.inspection === 100 ? 'Completed' : selectedVehicle.progress.inspection > 0 ? 'In Progress' : 'Pending'}
                                </span>
                                {selectedVehicle.inspectionUpdate && (
                                  <span>
                                    {new Date(selectedVehicle.inspectionUpdate).toLocaleDateString('en-US', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Certificate */}
                        <div className="relative">
                          <div className={`absolute left-5 top-8 w-0.5 h-12 ${selectedVehicle.progress.certificate === 100 ? 'bg-blue-500' : 'bg-gray-200'
                            } transition-colors duration-500`}></div>
                          <div className="flex items-start space-x-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${selectedVehicle.progress.certificate === 100
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
                              <p className={`text-sm font-medium ${selectedVehicle.progress.certificate === 100 ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                Certificate
                              </p>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>
                                  {selectedVehicle.progress.certificate === 100 ? 'Completed' : selectedVehicle.progress.certificate > 0 ? 'In Progress' : 'Pending'}
                                </span>
                                {selectedVehicle.certificateUpdate && (
                                  <span>
                                    {new Date(selectedVehicle.certificateUpdate).toLocaleDateString('en-US', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Document Delivered */}
                        <div className="relative">
                          <div className="flex items-start space-x-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${selectedVehicle.progress.documentDelivery === 100
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
                              <p className={`text-sm font-medium ${selectedVehicle.progress.documentDelivery === 100 ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                Document Delivered
                              </p>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>
                                  {selectedVehicle.progress.documentDelivery === 100 ? 'Completed' : selectedVehicle.progress.documentDelivery > 0 ? 'In Progress' : 'Pending'}
                                </span>
                                {selectedVehicle.documentDeliveryUpdate && (
                                  <span>
                                    {new Date(selectedVehicle.documentDeliveryUpdate).toLocaleDateString('en-US', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Overall progress - only show for non-completed status */}
                        {activeStatus !== 'completed' && (
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
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Start Tracking</h3>
                    <p className="text-sm text-gray-500">
                      Click the Track button on any service to monitor its progress in real-time.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}