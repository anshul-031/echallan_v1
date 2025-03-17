'use client';

import { useState, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  TrashIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  CloudArrowUpIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import LiveDataPanel from '../components/LiveDataPanel';
import DocumentModal from '../components/DocumentModal';

// Extended demo data
const vehicles = Array.from({ length: 15 }, (_, index) => ({
  id: index + 1,
  vrn: `RJ09GB${9453 + index}`,
  roadTax: '30-11-2025',
  fitness: '06-12-2026',
  insurance: '02-12-2025',
  pollution: '02-01-2026',
  statePermit: 'Not available',
  nationalPermit: '01-11-2025',
  lastUpdated: '21-02-2025',
  status: 'Active',
  owner: 'John Doe',
  registeredAt: 'Mumbai RTO',
  documents: 5
}));

const summaryCards = [
  {
    title: 'TOTAL VEHICLES',
    count: '533',
    color: 'from-blue-500 to-blue-600',
    glowColor: 'blue',
    icon: ChartBarIcon,
    details: [
      { label: 'Active Vehicles', value: '498' },
      { label: 'Inactive Vehicles', value: '35' },
      { label: 'Under Maintenance', value: '12' }
    ]
  },
  {
    title: 'EXPIRING DOCUMENTS',
    count: '33',
    color: 'from-amber-500 to-amber-600',
    glowColor: 'amber',
    icon: ClockIcon,
    details: [
      { label: 'Next 30 Days', value: '15' },
      { label: 'Next 60 Days', value: '8' },
      { label: 'Next 90 Days', value: '10' }
    ]
  },
  {
    title: 'EXPIRED DOCUMENTS',
    count: '71',
    color: 'from-red-500 to-red-600',
    glowColor: 'red',
    icon: DocumentChartBarIcon,
    details: [
      { label: 'Insurance', value: '28' },
      { label: 'Road Tax', value: '23' },
      { label: 'Fitness Certificate', value: '20' }
    ]
  }
];
export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState(vehicles);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVRN, setSelectedVRN] = useState<string>('');

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setFilteredVehicles(vehicles);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setCurrentPage(1);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const results = vehicles.filter(vehicle =>
      vehicle.vrn.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredVehicles(results);
    if (results.length === 0) {
      setSearchError('No results found');
    }
    setIsSearching(false);
  }, [searchQuery]);

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredVehicles(vehicles);
    setSearchError(null);
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredVehicles.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

  const handleExport = (format: 'current-excel' | 'all-excel' | 'pdf') => {
    console.log(`Exporting in ${format} format`);
    setShowExportDropdown(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Fleet Dashboard</h1>
            <div className="w-72">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Vehicle"
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <XMarkIcon className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                <button
  onClick={handleSearch}
  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
  disabled={isSearching}
>
  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
</button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            {summaryCards.map((card, index) => (
              <div
                key={card.title}
                className={`relative overflow-hidden rounded-lg transition-all duration-500 cursor-pointer
                  ${expandedCard === index ? 'col-span-2 row-span-2' : ''}
                  transform hover:scale-[1.02] hover:-translate-y-1
                `}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 
                  transition-opacity duration-300 blur-xl 
                  ${hoveredCard === index ? 'opacity-20' : ''}`}
                />

                {/* Card Content */}
                <div className={`relative bg-gradient-to-r ${card.color} p-4 h-full
                  transition-all duration-500
                  ${hoveredCard === index ? 'shadow-lg shadow-' + card.glowColor + '-500/50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <card.icon className="w-5 h-5 text-white/80" />
                        <p className="text-white/80 text-sm font-medium">{card.title}</p>
                      </div>
                      <p className="text-white text-2xl font-bold mt-1">{card.count}</p>
                    </div>
                    <button
                      onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                      className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 transform
                        ${expandedCard === index ? 'rotate-180' : 'rotate-0'}
                      `}
                    >
                      <ChevronDownIcon className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Expandable Content */}
                  <div className={`mt-2 overflow-hidden transition-all duration-500 ease-in-out
                    ${expandedCard === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="pt-2 border-t border-white/20">
                      <div className="space-y-2">
                        {card.details.map((detail, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-white/80 text-sm">{detail.label}</span>
                            <span className="text-white font-medium">{detail.value}</span>
                          </div>
                        ))}
                      </div>
                      <button className="mt-3 w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                        <span>View Details</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search Status Messages */}
          {isSearching && (
            <div className="flex items-center justify-center space-x-2 py-4">
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-500">Fetching the results...</span>
            </div>
          )}

          {searchError && (
            <div className="flex justify-center py-4">
              <span className="text-red-500">{searchError}</span>
            </div>
          )}

          {/* Table Container */}
          <div className="flex-1 flex flex-col min-h-0 bg-white rounded-lg shadow overflow-hidden">
            <div className="flex-1 overflow-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">S.no</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">VRN</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Road tax</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Fitness</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Insurance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Pollution</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Permit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">National Permit</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Assign</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Last Updated</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Update</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Upload</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Delete</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentVehicles.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-500">{row.id}</td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{row.vrn}</td>
                      <td className="px-4 py-4 text-sm text-green-600">{row.roadTax}</td>
                      <td className="px-4 py-4 text-sm text-green-600">{row.fitness}</td>
                      <td className="px-4 py-4 text-sm text-green-600">{row.insurance}</td>
                      <td className="px-4 py-4 text-sm text-green-600">{row.pollution}</td>
                      <td className="px-4 py-4 text-sm text-red-500">{row.statePermit}</td>
                      <td className="px-4 py-4 text-sm text-green-600">{row.nationalPermit}</td>
                      <td className="px-4 py-4 text-center">
                        <button className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                          <EyeIcon className="w-5 h-5" />
                        </button>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">{row.lastUpdated}</td>
                      <td className="px-4 py-4 text-center">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                          <ArrowPathIcon className="w-5 h-5" />
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedVRN(row.vrn);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                        >
                          <CloudArrowUpIcon className="w-5 h-5" />
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-3 border-t border-gray-200 bg-white">
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
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredVehicles.length)} of {filteredVehicles.length} entries
                  </span>

                  {/* Export Button with Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium text-sm"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                      Export
                      <ChevronDownIcon className="w-4 h-4 ml-2" />
                    </button>

                    {showExportDropdown && (
                      <div className="absolute left-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          {['Current Excel', 'All Excel', 'PDF'].map((option) => (
                            <button
                              key={option}
                              onClick={() => handleExport(option.toLowerCase().replace(' ', '-') as any)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center"
                            >
                              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
        </div>
      </div>

      {/* Live Data Panel */}
      <div className="w-96 border-l border-gray-200">
        <LiveDataPanel />
      </div>

      {/* Click Outside Handler */}
      {showExportDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowExportDropdown(false)}
        />
      )}

      {/* Document Modal */}
      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vrn={selectedVRN}
      />
    </div>
  );
}