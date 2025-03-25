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
import { toast } from 'react-hot-toast';

const summaryCards = [
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
    // Implementation to delete the selected challan
    try {
      // Here we would typically call an API endpoint to delete the challan
      // Since we don't have an actual API endpoint, this is a mock implementation
      console.log(`Deleting challan for vehicle ${selectedVehicle}`);
      
      // Filter out the deleted challan from the mock data
      const updatedChallanData = challanData.filter(
        challan => challan.vehicleNo !== selectedVehicle
      );
      
      // In a real app, this would be replaced with actual API calls
      // For this demo, we're just updating the local state
      toast.success(`Challan for ${selectedVehicle} deleted successfully`);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete challan');
    }
  };

  const handlePayChallan = (vehicleNo: string) => {
    console.log('Processing payment for', vehicleNo);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 lg:p-6 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaryCards.map((card, index) => (
            <div
              key={card.title}
              className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer
                transform hover:scale-[1.02] hover:-translate-y-1`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Animated Background Gradient */}
              <div className={`absolute inset-0 ${card.bgGradient} opacity-50 animate-gradient`} />
              
              {/* Card Content */}
              <div className={`relative bg-white border ${card.borderColor} p-4 h-full
                transition-all duration-300
                ${hoveredCard === index ? 'shadow-lg shadow-' + card.color.split('-')[1] + '-500/20' : 'shadow-sm'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className={`p-3 rounded-lg ${card.bgGradient} flex items-center justify-center`}>
                        <card.icon className={`w-7 h-7 ${card.textColor}`} />
                      </div>
                      <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                    </div>
                    <p className={`text-2xl font-bold mt-2 bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                      {card.count}
                    </p>
                  </div>
                  
                  <ChartBarIcon 
                    className={`w-5 h-5 ${card.textColor} transition-transform duration-300 mt-1
                      ${expandedCard === index ? 'rotate-180' : ''}`}
                  />
                </div>

                {/* Mini Chart */}
                <div className={`mt-3 transition-all duration-300
                  ${expandedCard === index ? 'opacity-0 h-0' : 'opacity-100'}`}>
                  {renderMiniChart(card.chart.data, card.chart.color)}
                </div>

                {/* Expandable Details */}
                <div className={`space-y-3 transition-all duration-300 ease-in-out
                  ${expandedCard === index ? 'opacity-100 max-h-48 mt-3' : 'opacity-0 max-h-0'}`}
                >
                  {card.details.map((detail, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <span className="text-gray-600 text-sm">{detail.label}</span>
                      <div className="text-right">
                        <span className="font-medium block text-sm">{detail.value}</span>
                        <span className={`text-xs ${
                          detail.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {detail.trend}
                        </span>
                      </div>
                    </div>
                  ))}
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

        {/* Search Bar */}
        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search challans..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add New Challan
          </button>
        </div>

        {/* Challan Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challans</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {challanData.map((challan) => (
                <tr key={challan.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{challan.vehicleNo}</div>
                        <div className="text-sm text-gray-500">{challan.lastUpdated}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{challan.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{challan.challans}</div>
                    <div className="text-sm text-gray-500">
                      Online: {challan.online} | Offline: {challan.offline}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{challan.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      challan.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {challan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(challan.vehicleNo)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(challan.vehicleNo)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Challan Details - {selectedVehicle}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              {/* Modal content */}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this challan? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
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