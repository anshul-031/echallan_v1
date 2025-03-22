'use client';

import { useEffect, useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  TrashIcon, 
  EyeIcon,
  Bars3Icon,
  XMarkIcon,
  TruckIcon,
  BanknotesIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import LiveChallanPanel from '../components/challan/LiveChallanPanel';

// import Mukul from '../components/Mukul';
// import { getSession } from 'next-auth/react';

const summaryData = [
  {
    title: 'Total Vehicles',
    count: '213',
    icon: TruckIcon,
    gradient: 'bg-gradient-to-r from-blue-500/10 via-blue-400/10 to-blue-300/10',
    iconGradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
    textGradient: 'bg-gradient-to-r from-blue-600 to-blue-500',
    borderGradient: 'border-blue-100',
    shadowColor: 'shadow-blue-500/20',
    trend: '+12%',
    isPositive: true,
    details: [
      { label: 'Active', value: '189', trend: '+8%' },
      { label: 'Inactive', value: '24', trend: '-3%' }
    ],
    chart: {
      data: [35, 45, 55, 65, 75, 85, 95],
      color: 'blue'
    }
  },
  {
    title: 'Total Challans',
    count: '587',
    icon: DocumentDuplicateIcon,
    gradient: 'bg-gradient-to-r from-purple-500/10 via-purple-400/10 to-purple-300/10',
    iconGradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
    textGradient: 'bg-gradient-to-r from-purple-600 to-purple-500',
    borderGradient: 'border-purple-100',
    shadowColor: 'shadow-purple-500/20',
    trend: '+8%',
    isPositive: true,
    details: [
      { label: 'Pending', value: '145', trend: '+5%' },
      { label: 'Resolved', value: '442', trend: '+18%' }
    ],
    chart: {
      data: [45, 55, 45, 65, 55, 75, 65],
      color: 'purple'
    }
  },
  {
    title: 'Total Amount',
    count: '₹2,57,255',
    icon: BanknotesIcon,
    gradient: 'bg-gradient-to-r from-emerald-500/10 via-emerald-400/10 to-emerald-300/10',
    iconGradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    textGradient: 'bg-gradient-to-r from-emerald-600 to-emerald-500',
    borderGradient: 'border-emerald-100',
    shadowColor: 'shadow-emerald-500/20',
    trend: '+15%',
    isPositive: true,
    details: [
      { label: 'Collected', value: '₹1,98,255', trend: '+22%' },
      { label: 'Pending', value: '₹59,000', trend: '-8%' }
    ],
    chart: {
      data: [25, 35, 45, 55, 45, 65, 55],
      color: 'emerald'
    }
  }
];

const challanData = [
  {
    id: 1,
    vehicleNo: 'RJ09GB9453',
    challans: 5,
    amount: 29200,
    online: 3,
    offline: 2,
    lastUpdated: '2025-01-23 13:38:52'
  },
  {
    id: 2,
    vehicleNo: 'RJ09GB9450',
    challans: 2,
    amount: 22500,
    online: 1,
    offline: 1,
    lastUpdated: '2025-01-23 13:38:53'
  }
];

export default function ChallanDashboard() {
  // const [selectedVehicle, setSelectedVehicle] = useState('');
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [pendingChallans, setPendingChallans] = useState<any[]>([]);
  const [disposedCount, setDisposedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  

  const renderMiniChart = (data: number[], color: string) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    return (
      <div className="flex items-end h-12 gap-1">
        {data.map((value, i) => {
          const height = ((value - min) / range) * 100;
          return (
            <div
              key={i}
              style={{ height: `${height}%` }}
              className={`w-1 rounded-t-sm bg-${color}-500 opacity-50 transition-all duration-300
                ${hoveredCard !== null ? 'hover:opacity-100' : ''}`}
            />
          );
        })}
      </div>
    );
  };

  const handleSearch = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      try {
        const response = await fetch(`/api/vahanfin/vehicle?rc_no=${searchQuery}`);
        if (!response.ok) throw new Error('Failed to fetch vehicle data');
        const data = await response.json();
        console.log(data); // Log the API output
        setVehicleData(data);

        // Extract disposed and pending data
        const disposedData = data.data.Disposed_data || [];
        const pendingData = data.data.Pending_data || [];

        setDisposedCount(disposedData.length);
        setPendingCount(pendingData.length);
        setPendingChallans(pendingData); // Store pending data for modal
      } catch (error) {
        console.error('API call error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setShowMobilePanel(!showMobilePanel)}
        className="fixed right-4 top-4 z-50 lg:hidden bg-white p-2 rounded-lg shadow-md"
      >
        {showMobilePanel ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-[calc(100vw-2rem)] lg:max-w-[calc(100vw-26rem)] mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Challan Dashboard</h1>
              
            </div>

            {/* Enhanced Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
              {summaryData.map((item, index) => (
                <div
                  key={item.title}
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1`}
                >
                  {/* Card Background with Gradient */}
                  <div className={`absolute inset-0 ${item.gradient} animate-gradient`} />
                  
                  {/* Card Content */}
                  <div className={`relative bg-white/80 backdrop-blur-sm border ${item.borderGradient} p-6 h-full transition-all duration-300`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-xl ${item.iconGradient}`}>
                            <item.icon className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-gray-600 font-medium">{item.title}</p>
                        </div>
                        <p className={`text-2xl font-bold mt-3 ${item.textGradient} bg-clip-text text-transparent`}>
                          {item.title === 'Total Challans' ? challanData.reduce((total, data) => total + data.challans, 0) : ''}
                          {item.title === 'Total Vehicles' ? challanData.length : ''}
                          {item.title === 'Total Amount' ? `₹${challanData.reduce((total, data) => total + data.amount, 0)}` : ''}
                        </p>
                      </div>
                      
                     
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Mobile View */}
            <div className="lg:hidden bg-white rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">VRN</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Challans</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pay</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {challanData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 text-sm font-medium">{item.vehicleNo}</td>
                      <td className="px-3 py-4 text-sm text-gray-500 text-center">{item.challans}</td>
                      <td className="py-4 text-center">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full">
                          {/* <ArrowPathIcon className="w-5 h-5" /> */}
                          <button className="px-3 py-1 rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                          >
                            {/* onClick={(e) => this.parentElement.classList.toggle('bg-blue-500')} */}
                            Pay
                          </button>
                        </button>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <button 
                          onClick={() => setExpandedId(item.id)} 
                          className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Details Modal */}
            {expandedId !== null && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
                  <h2 className="text-lg font-semibold mb-4">Challan Details</h2>
                  {challanData.filter(item => item.id === expandedId).map(item => (
                    <div key={item.id} className="space-y-2">
                      <p><strong>Vehicle No:</strong> {item.vehicleNo}</p>
                      <p><strong>Challans:</strong> {item.challans}</p>
                      <p><strong>Amount:</strong> ₹{item.amount}</p>
                      <p><strong>Online:</strong> {item.online}</p>
                      <p><strong>Offline:</strong> {item.offline}</p>
                      <p><strong>Last Updated:</strong> {item.lastUpdated}</p>
                    </div>
                  ))}
                  <button 
                    onClick={() => setExpandedId(null)} 
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Challans</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Online</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Offline</th>
                      
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pay</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Update</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delete</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {challanData.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">{row.id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.vehicleNo}</td>
                        <td className="px-6 py-4 text-sm text-center text-gray-500">{row.challans}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">₹{row.amount}</td>
                        <td className="px-6 py-4 text-sm text-center">{row.online}</td>
                        <td className="px-6 py-4 text-sm text-center">{row.offline}</td>
                        <td className="px-2 py-4 text-sm text-gray-500">
                          <button className="px-4 py-1 rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                          >
                            {/* onClick={(e) => this.parentElement.classList.toggle('bg-blue-500')} */}
                            Pay
                          </button>
                        </td>
                        {/* <td className="px-6 py-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full">
                              <ArrowPathIcon className="w-5 h-5" />
                            </button>
                            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-full">
                              <TrashIcon className="w-5 h-5" />
                            </button>
                            <button className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full">
                              <EyeIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td> */}
                        <td className="px-6 py-4 text-center">
                          
                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full">
                              <ArrowPathIcon className="w-5 h-5" />
                            </button>
                            </td>
                            <td className="px-6 py-4 text-center">
                            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-full">
                              <TrashIcon className="w-5 h-5" />
                            </button>
                            </td>
                            <td className="px-6 py-4 text-center">
                            <button className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full">
                              <EyeIcon className="w-5 h-5" />
                            </button>
                          
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{row.lastUpdated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Table */}
            {/* <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">View</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium">Disposed</td>
                    <td className="px-4 py-2 text-sm">{disposedCount}</td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => console.log('View Disposed Data')} className="text-blue-600 hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium">Pending</td>
                    <td className="px-4 py-2 text-sm">{pendingCount}</td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => setIsPendingModalOpen(true)} className="text-blue-600 hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div> */}

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg mt-4">
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">First</button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">Prev</button>
                <span className="px-3 py-1 text-sm text-white bg-blue-600 rounded">1</span>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">Next</button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">Last</button>
              </div>
            </div>

            {/* Pending Challans Modal */}
            {/* {isPendingModalOpen && (
              <PendingChallansModal
                isOpen={isPendingModalOpen}
                onClose={() => setIsPendingModalOpen(false)}
                pendingChallans={pendingChallans}
              />
            )} */}
          </div>
        </div>

        {/* Live Challan Panel */}
        <div className={`
          lg:block
          ${showMobilePanel ? 'fixed inset-0 z-40 bg-white' : 'hidden'}
          lg:relative lg:flex-none
        `}>
          {/* <LiveChallanPanel vehicleData={vehicleData} /> */}
          <LiveChallanPanel />
        </div>
      </div>
    </div>
  );
}