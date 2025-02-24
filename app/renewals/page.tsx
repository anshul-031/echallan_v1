'use client';

import { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  CloudArrowUpIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  ArrowRightIcon,
  CalendarIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  BellAlertIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const summaryCards = [
  {
    title: 'Next 30 Days',
    count: '48',
    icon: BellAlertIcon,
    color: 'from-rose-500 to-pink-600',
    hoverColor: 'hover:from-rose-600 hover:to-pink-700',
    shadowColor: 'shadow-rose-500/20',
    textGradient: 'bg-gradient-to-r from-rose-500 to-pink-600',
    iconGradient: 'bg-gradient-to-br from-rose-500/10 to-pink-600/10',
    borderColor: 'border-rose-100'
  },
  {
    title: 'Next 3 months',
    count: '323',
    icon: CalendarIcon,
    color: 'from-amber-500 to-orange-600',
    hoverColor: 'hover:from-amber-600 hover:to-orange-700',
    shadowColor: 'shadow-amber-500/20',
    textGradient: 'bg-gradient-to-r from-amber-500 to-orange-600',
    iconGradient: 'bg-gradient-to-br from-amber-500/10 to-orange-600/10',
    borderColor: 'border-amber-100'
  },
  {
    title: 'Next 6 months',
    count: '394',
    icon: ShieldCheckIcon,
    color: 'from-blue-500 to-indigo-600',
    hoverColor: 'hover:from-blue-600 hover:to-indigo-700',
    shadowColor: 'shadow-blue-500/20',
    textGradient: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    iconGradient: 'bg-gradient-to-br from-blue-500/10 to-indigo-600/10',
    borderColor: 'border-blue-100'
  },
  {
    title: 'Next 12 months',
    count: '550',
    icon: DocumentCheckIcon,
    color: 'from-emerald-500 to-teal-600',
    hoverColor: 'hover:from-emerald-600 hover:to-teal-700',
    shadowColor: 'shadow-emerald-500/20',
    textGradient: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    iconGradient: 'bg-gradient-to-br from-emerald-500/10 to-teal-600/10',
    borderColor: 'border-emerald-100'
  }
];

const renewalData = [
  {
    id: 1,
    vrn: 'RJ09GB9453',
    roadTax: '31-03-2025',
    fitness: '24-11-2025',
    insurance: '16-10-2025',
    pollution: '27-03-2025',
    statePermit: 'Not available',
    nationalPermit: '01-11-2025',
    lastUpdated: '23-01-2025',
    vehicleDetails: {
      make: 'Toyota',
      model: 'Innova',
      year: '2022',
      engineNo: 'EDZ3E1234567',
      chassisNo: 'MALA851ALJM312345',
      registeredAt: 'RTO Mumbai',
      owner: 'John Doe',
      address: '123 Main Street, Mumbai'
    },
    documents: [
      { type: 'Road Tax', status: 'Valid', expiry: '31-03-2025', lastUpdated: '23-01-2024' },
      { type: 'Fitness', status: 'Valid', expiry: '24-11-2025', lastUpdated: '24-11-2023' },
      { type: 'Insurance', status: 'Valid', expiry: '16-10-2025', lastUpdated: '16-10-2023' },
      { type: 'Pollution', status: 'Valid', expiry: '27-03-2025', lastUpdated: '27-03-2024' },
      { type: 'State Permit', status: 'Not Available', expiry: '-', lastUpdated: '-' },
      { type: 'National Permit', status: 'Valid', expiry: '01-11-2025', lastUpdated: '01-11-2023' }
    ]
  },
  // Add more renewal data items here...
];

export default function RenewalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<typeof renewalData[0] | null>(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleViewDetails = (period: string) => {
    setSelectedPeriod(period);
    setShowDetailsModal(true);
  };

  const handleExport = (format: 'current-excel' | 'all-excel' | 'pdf') => {
    console.log(`Exporting in ${format} format`);
    setShowExportDropdown(false);
  };

  // Calculate pagination
  const totalPages = Math.ceil(renewalData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRenewals = renewalData.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header with Search */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Renewals Dashboard</h1>
          <div className="w-full lg:w-72">
            <div className="relative">
              <input
                type="text"
                placeholder="Search vehicles..."
                className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, index) => (
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
                </div>

                <button 
                  onClick={() => handleViewDetails(card.title)}
                  className={`mt-4 w-full px-4 py-2 bg-gradient-to-r ${card.color} ${card.hoverColor}
                    text-white rounded-lg shadow-sm transition-all duration-300
                    flex items-center justify-center space-x-2
                    transform hover:translate-y-[-2px]`}
                >
                  <span>View Details</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>

                {/* Hover Effect Indicator */}
                <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full transition-all duration-300
                  bg-gradient-to-r ${card.color}
                  ${hoveredCard === index ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Renewal Details</h2>
              
              {/* Export Button with Animated Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                  Export
                  <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform duration-200 ${showExportDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Animated Dropdown */}
                <div
                  className={`absolute bottom-full right-0 mb-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 transform transition-all duration-200 origin-bottom z-50
                    ${showExportDropdown 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-2 scale-95 pointer-events-none'}`}
                >
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {[
                      { label: 'Export Current Page', format: 'current-excel' },
                      { label: 'Export All Data', format: 'all-excel' },
                      { label: 'Export as PDF', format: 'pdf' }
                    ].map((option) => (
                      <button
                        key={option.format}
                        onClick={() => handleExport(option.format as any)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center transition-colors duration-150"
                      >
                        <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Click Outside Handler */}
              {showExportDropdown && (
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExportDropdown(false)}
                />
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VRN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Road Tax</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fitness</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insurance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pollution</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State Permit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">National Permit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRenewals.map((renewal) => (
                  <tr key={renewal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{renewal.vrn}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{renewal.roadTax}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{renewal.fitness}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{renewal.insurance}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{renewal.pollution}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">{renewal.statePermit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{renewal.nationalPermit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{renewal.lastUpdated}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedVehicle(renewal);
                            setShowDetailsModal(true);
                          }}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                          <ArrowPathIcon className="w-5 h-5" />
                        </button>
                        <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                          <CloudArrowUpIcon className="w-5 h-5" />
                        </button>
                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors">
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
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Show rows:</span>
                <select 
                  value={rowsPerPage} 
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(endIndex, renewalData.length)} of {renewalData.length} entries
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >⟪</button>
                <button 
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >⟨</button>
                <span className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
                <button 
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >⟩</button>
                <button 
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                >⟫</button>
              </div>
            </div>
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && (selectedPeriod || selectedVehicle) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedVehicle ? `Vehicle Details - ${selectedVehicle.vrn}` : `${selectedPeriod} Renewals`}
                </h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedPeriod(null);
                    setSelectedVehicle(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {selectedVehicle ? (
                  <div className="space-y-6">
                    {/* Vehicle Information */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(selectedVehicle.vehicleDetails).map(([key, value]) => (
                          <div key={key} className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm text-gray-500">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <p className="font-medium text-gray-900 mt-1">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Document Status */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Document Status</h4>
                      <div className="space-y-3">
                        {selectedVehicle.documents.map((doc) => (
                          <div key={doc.type} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">{doc.type}</h5>
                                <p className="text-sm text-gray-500 mt-1">Last updated: {doc.lastUpdated}</p>
                              </div>
                              <div className="flex items-center">
                                {doc.status === 'Valid' ? (
                                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                                ) : (
                                  <ExclamationCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                                )}
                                <span className={`text-sm font-medium ${
                                  doc.status === 'Valid' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {doc.status}
                                </span>
                              </div>
                            </div>
                            {doc.expiry !== '-' && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <span className="text-sm text-gray-500">Expires on: </span>
                                <span className="text-sm font-medium text-gray-900">{doc.expiry}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600">
                      Showing vehicles with renewals due in {selectedPeriod?.toLowerCase()}
                    </p>
                    {/* Add period-specific content here */}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedPeriod(null);
                      setSelectedVehicle(null);
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  {selectedVehicle && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Update Documents
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}