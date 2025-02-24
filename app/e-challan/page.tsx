'use client';

import { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  TrashIcon, 
  EyeIcon,
  CurrencyRupeeIcon,
  XMarkIcon,
  DocumentTextIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  TruckIcon,
  DocumentDuplicateIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const summaryData = [
  {
    title: 'Total Vehicles',
    count: '213',
    icon: TruckIcon,
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-500',
    bgGradient: 'bg-gradient-to-r from-blue-500/10 to-blue-600/10',
    borderColor: 'border-blue-200',
    details: [
      { label: 'Active', value: '189', trend: '+12%' },
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
    color: 'from-orange-500 to-orange-600',
    textColor: 'text-orange-500',
    bgGradient: 'bg-gradient-to-r from-orange-500/10 to-orange-600/10',
    borderColor: 'border-orange-200',
    details: [
      { label: 'Pending', value: '145', trend: '+5%' },
      { label: 'Resolved', value: '442', trend: '+18%' }
    ],
    chart: {
      data: [45, 55, 45, 65, 55, 75, 65],
      color: 'orange'
    }
  },
  {
    title: 'Total Amount',
    count: '₹2,57,255',
    icon: CurrencyRupeeIcon,
    color: 'from-green-500 to-green-600',
    textColor: 'text-green-500',
    bgGradient: 'bg-gradient-to-r from-green-500/10 to-green-600/10',
    borderColor: 'border-green-200',
    details: [
      { label: 'Collected', value: '₹1,98,255', trend: '+22%' },
      { label: 'Pending', value: '₹59,000', trend: '-8%' }
    ],
    chart: {
      data: [25, 35, 45, 55, 45, 65, 55],
      color: 'green'
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
    lastUpdated: '2025-01-23 13:38:52',
    location: 'City Center',
    status: 'Pending'
  },
  {
    id: 2,
    vehicleNo: 'RJ09GB9450',
    challans: 2,
    amount: 22500,
    online: 1,
    offline: 1,
    lastUpdated: '2025-01-23 13:38:53',
    location: 'Highway Junction',
    status: 'Paid'
  }
];

interface ChallanDetails {
  id: string;
  location: string;
  status: 'Pending' | 'Disposed';
  offence: string;
  date: string;
  stateCode: string;
  remarks: string;
  amount: number;
}

export default function EChallanPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'disposed'>('pending');
  const [vehicleInput, setVehicleInput] = useState('');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [challanDetails, setChallanDetails] = useState<ChallanDetails[]>([
    {
      id: 'CH001',
      location: 'City Center',
      status: 'Pending',
      offence: 'Speed Limit Violation',
      date: '2024-01-23',
      stateCode: 'RJ',
      remarks: 'Exceeded speed limit by 20km/h',
      amount: 1000
    }
  ]);

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

  const handleViewDetails = (vehicleNo: string) => {
    setSelectedVehicle(vehicleNo);
    setShowDetailsModal(true);
  };

  const handleDelete = (vehicleNo: string) => {
    setSelectedVehicle(vehicleNo);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handlePayChallan = (vehicleNo: string) => {
    console.log('Processing payment for', vehicleNo);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-[calc(100vw-2rem)] lg:max-w-[calc(100vw-26rem)] mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">E-Challan Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Manage and track vehicle challans</p>
              </div>
              <div className="w-full lg:w-72">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Vehicle"
                    className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Enhanced Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {summaryData.map((item, index) => (
                <div
                  key={item.title}
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer
                    transform hover:scale-[1.02] hover:-translate-y-1
                    ${expandedCard === index ? 'md:col-span-2 md:row-span-2' : ''}
                  `}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                >
                  {/* Animated Background Gradient */}
                  <div className={`absolute inset-0 ${item.bgGradient} opacity-50 animate-gradient`} />
                  
                  {/* Card Content */}
                  <div className={`relative bg-white border ${item.borderColor} p-6 h-full
                    transition-all duration-300
                    ${hoveredCard === index ? 'shadow-lg shadow-' + item.color.split('-')[1] + '-500/20' : 'shadow-sm'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className={`p-2 rounded-lg ${item.bgGradient}`}>
                            <item.icon className={`w-5 h-5 ${item.textColor}`} />
                          </div>
                          <p className="text-gray-500 text-sm font-medium">{item.title}</p>
                        </div>
                        <p className={`text-2xl font-bold mt-2 bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                          {item.count}
                        </p>
                      </div>
                      
                      <ChartBarIcon 
                        className={`w-5 h-5 ${item.textColor} transition-transform duration-300
                          ${expandedCard === index ? 'rotate-180' : ''}`}
                      />
                    </div>

                    {/* Mini Chart */}
                    <div className={`mt-4 transition-all duration-300
                      ${expandedCard === index ? 'opacity-0 h-0' : 'opacity-100'}`}>
                      {renderMiniChart(item.chart.data, item.chart.color)}
                    </div>

                    {/* Expandable Details */}
                    <div className={`space-y-4 transition-all duration-300 ease-in-out
                      ${expandedCard === index ? 'opacity-100 max-h-96 mt-4' : 'opacity-0 max-h-0'}`}
                    >
                      {item.details.map((detail, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                          <span className="text-gray-600 text-sm">{detail.label}</span>
                          <div className="text-right">
                            <span className="font-medium block">{detail.value}</span>
                            <span className={`text-xs ${
                              detail.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {detail.trend}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {/* Detailed Chart */}
                      <div className="h-32 mt-4">
                        {renderMiniChart(item.chart.data.concat(item.chart.data), item.chart.color)}
                      </div>
                    </div>

                    {/* Hover Effect Indicator */}
                    <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full transition-all duration-300
                      bg-gradient-to-r ${item.color}
                      ${hoveredCard === index ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Challan Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challans</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Online/Offline</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {challanData.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3" />
                            <span className="text-sm font-medium text-gray-900">{row.vehicleNo}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {row.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{row.challans}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">₹{row.amount.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">Online: {row.online}</span>
                            <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">Offline: {row.offline}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            row.status === 'Pending' 
                              ? 'bg-yellow-50 text-yellow-600' 
                              : 'bg-green-50 text-green-600'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center space-x-2">
                            <button 
                              onClick={() => handlePayChallan(row.vehicleNo)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                              title="Pay Challan"
                            >
                              <CurrencyRupeeIcon className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleViewDetails(row.vehicleNo)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              title="View Details"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button 
                              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                              title="Refresh"
                            >
                              <ArrowPathIcon className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(row.vehicleNo)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="Delete"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                <div className="flex items-center text-sm text-gray-500">
                  <span>Showing 1 to 10 of 100 entries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">First</button>
                  <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">Prev</button>
                  <span className="px-3 py-1 text-sm text-white bg-blue-600 rounded">1</span>
                  <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">Next</button>
                  <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">Last</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Challan Status Sidebar */}
        <div className="w-full lg:w-96 bg-white p-6 lg:border-l border-gray-200">
          <div className="sticky top-0 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Live Challan Status</h2>
              <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-50 transition-colors">
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Vehicle Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Vehicle Number"
                className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={vehicleInput}
                onChange={(e) => setVehicleInput(e.target.value.toUpperCase())}
              />
              <DocumentTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>

            {/* Status Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'pending'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('pending')}
              >
                Pending
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'disposed'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('disposed')}
              >
                Disposed
              </button>
            </div>

            {/* Challan Details */}
            <div className="space-y-4">
              {challanDetails.map((challan) => (
                <div
                  key={challan.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                      <h3 className="font-medium text-gray-900">Challan #{challan.id}</h3>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      challan.status === 'Pending'
                        ? 'bg-yellow-50 text-yellow-600'
                        : 'bg-green-50 text-green-600'
                    }`}>
                      {challan.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-500">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      {challan.location}
                    </div>
                    <div className="flex items-center text-gray-500">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {challan.date}
                    </div>
                    <div className="flex items-center text-gray-500">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      {challan.offence}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <span className="font-medium text-gray-900">₹{challan.amount}</span>
                      <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                        Pay Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Challan Details - {selectedVehicle}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Detailed challan information for {selectedVehicle}</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the challan record for {selectedVehicle}?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}