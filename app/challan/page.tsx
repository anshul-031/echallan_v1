'use client';

import { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  TrashIcon, 
  EyeIcon,
  Bars3Icon,
  XMarkIcon,
  TruckIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  DocumentDuplicateIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import LiveChallanPanel from '../components/challan/LiveChallanPanel';

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
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

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
              <div className="w-full lg:w-72">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Vehicle"
                    className="w-full h-10 pl-4 pr-10 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Enhanced Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
              {summaryData.map((item, index) => (
                <div
                  key={item.title}
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer
                    ${expandedId === index ? 'md:col-span-2 md:row-span-2' : ''}
                    transform hover:scale-[1.02] hover:-translate-y-1`}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => setExpandedId(expandedId === index ? null : index)}
                >
                  {/* Card Background with Gradient */}
                  <div className={`absolute inset-0 ${item.gradient} animate-gradient`} />
                  
                  {/* Card Content */}
                  <div className={`relative bg-white/80 backdrop-blur-sm border ${item.borderGradient} p-6 h-full
                    transition-all duration-300 ${hoveredCard === index ? item.shadowColor : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-xl ${item.iconGradient}`}>
                            <item.icon className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-gray-600 font-medium">{item.title}</p>
                        </div>
                        <p className={`text-2xl font-bold mt-3 ${item.textGradient} bg-clip-text text-transparent`}>
                          {item.count}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {item.isPositive ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                        )}
                        <span className={item.isPositive ? 'text-green-500' : 'text-red-500'}>
                          {item.trend}
                        </span>
                      </div>
                    </div>

                    {/* Mini Chart */}
                    <div className={`mt-4 transition-all duration-300
                      ${expandedId === index ? 'opacity-0 h-0' : 'opacity-100'}`}>
                      {renderMiniChart(item.chart.data, item.chart.color)}
                    </div>

                    {/* Expandable Details */}
                    <div className={`space-y-4 transition-all duration-300 ease-in-out
                      ${expandedId === index ? 'opacity-100 max-h-96 mt-4' : 'opacity-0 max-h-0'}`}
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
                      ${item.iconGradient}
                      ${hoveredCard === index ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile View */}
            <div className="lg:hidden bg-white rounded-lg shadow-sm">
              <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b bg-gray-50">
                <div className="text-xs font-medium text-gray-500 uppercase">#</div>
                <div className="text-xs font-medium text-gray-500 uppercase">VRN</div>
                <div className="text-xs font-medium text-gray-500 uppercase text-center">Actions</div>
              </div>
              {challanData.map((item) => (
                <div key={item.id} className="border-b last:border-b-0">
                  <div className="grid grid-cols-3 gap-2 px-4 py-3 items-center">
                    <div className="text-sm text-gray-500">#{item.id}</div>
                    <div className="text-sm font-medium">{item.vehicleNo}</div>
                    <div className="flex justify-center">
                      <button 
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {expandedId === item.id && (
                    <div className="px-4 py-3 bg-gray-50 border-t">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Challans:</span>
                          <span className="text-sm font-medium">{item.challans}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Amount:</span>
                          <span className="text-sm font-medium">₹{item.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Online/Offline:</span>
                          <span className="text-sm font-medium">{item.online}/{item.offline}</span>
                        </div>
                        <div className="flex justify-end space-x-2 pt-2 mt-2 border-t">
                          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full">
                            <ArrowPathIcon className="w-5 h-5" />
                          </button>
                          <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-full">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

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
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {challanData.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">{row.id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.vehicleNo}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{row.challans}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">₹{row.amount}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{row.online}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{row.offline}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <button className="px-4 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                          >
                            {/* onClick={(e) => this.parentElement.classList.toggle('bg-blue-500')} */}
                            Pay
                          </button>
                        </td>
                        <td className="px-6 py-4 text-center">
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
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{row.lastUpdated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

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
          </div>
        </div>

        {/* Live Challan Panel */}
        <div className={`
          lg:block
          ${showMobilePanel ? 'fixed inset-0 z-40 bg-white' : 'hidden'}
          lg:relative lg:flex-none
        `}>
          <LiveChallanPanel />
        </div>
      </div>
    </div>
  );
}