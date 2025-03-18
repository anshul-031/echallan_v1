'use client';

import { useState, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../components/ui/dropdown-menu';
import { utils as xlsxUtils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
    count: vehicles.length.toString(),
    color: 'from-blue-500 to-blue-600',
    glowColor: 'blue',
    icon: ChartBarIcon,
    details: [
      { label: 'Active Vehicles', value: vehicles.filter(v => v.status === 'Active').length.toString() },
      { label: 'Inactive Vehicles', value: '0' },
      { label: 'Under Maintenance', value: '0' }
    ]
  },
  {
    title: 'EXPIRING DOCUMENTS',
    count: vehicles.length.toString(),
    color: 'from-amber-500 to-amber-600',
    glowColor: 'amber',
    icon: ClockIcon,
    details: [
      { label: 'Road Tax', value: vehicles.length.toString() },
      { label: 'Insurance', value: vehicles.length.toString() },
      { label: 'Fitness', value: vehicles.length.toString() }
    ]
  },
  {
    title: 'EXPIRED DOCUMENTS',
    count: '0',
    color: 'from-red-500 to-red-600',
    glowColor: 'red',
    icon: DocumentChartBarIcon,
    details: [
      { label: 'Insurance', value: '0' },
      { label: 'Road Tax', value: '0' },
      { label: 'Fitness Certificate', value: '0' }
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
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVRN, setSelectedVRN] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  // Define type for export data
  type ExportData = {
    'S.no': number;
    'VRN': string;
    'Road Tax': string;
    'Fitness': string;
    'Insurance': string;
    'Pollution': string;
    'State Permit': string;
    'National Permit': string;
    'Last Updated': string;
  };

  // Function to prepare data for export
  const prepareExportData = (data: typeof vehicles): ExportData[] => {
    return data.map((vehicle, index) => ({
      'S.no': index + 1,
      'VRN': vehicle.vrn,
      'Road Tax': vehicle.roadTax,
      'Fitness': vehicle.fitness,
      'Insurance': vehicle.insurance,
      'Pollution': vehicle.pollution,
      'State Permit': vehicle.statePermit,
      'National Permit': vehicle.nationalPermit,
      'Last Updated': vehicle.lastUpdated
    }));
  };

  const handleExport = async (format: 'current-excel' | 'all-excel' | 'pdf') => {
    try {
      setIsExporting(true);

      const data = format === 'current-excel' ? currentVehicles : vehicles;
      const exportData = prepareExportData(data);

      if (format === 'current-excel' || format === 'all-excel') {
        const worksheet = xlsxUtils.json_to_sheet(exportData);
        const workbook = xlsxUtils.book_new();
        xlsxUtils.book_append_sheet(workbook, worksheet, 'Fleet Data');

        // Auto-size columns
        const colWidths = Object.keys(exportData[0]).map(key => ({
          wch: Math.max(key.length, ...exportData.map(row => String(row[key as keyof ExportData]).length))
        }));
        worksheet['!cols'] = colWidths;

        const fileName = format === 'current-excel' ? 'current-fleet-data.xlsx' : 'all-fleet-data.xlsx';
        writeFile(workbook, fileName);
        toast.success(`${format === 'current-excel' ? 'Current' : 'All'} data exported to Excel successfully`);
      } else {
        // PDF Export
        const doc = new jsPDF();
        const tableHeaders = Object.keys(exportData[0]);
        const tableData = exportData.map(row => Object.values(row));

        autoTable(doc, {
          head: [tableHeaders],
          body: tableData,
          styles: { fontSize: 8 },
          headStyles: {
            fillColor: [249, 250, 251],
            textColor: [0, 0, 0],
            fontSize: 8,
            fontStyle: 'bold',
          },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          margin: { top: 20 },
        });

        doc.save('fleet-data.pdf');
        toast.success('Data exported to PDF successfully');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

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


  return (
    <div className="flex flex-col lg:flex-row min-h-screen overflow-y-auto lg:overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col p-3 lg:p-6 space-y-4">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-3 lg:space-y-0">
            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Fleet Dashboard</h1>
            <div className="w-full lg:w-72">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {summaryCards.map((card, index) => (
              <div
                key={card.title}
                className={`relative overflow-hidden rounded-lg transition-all duration-500 cursor-pointer
                  ${expandedCard === index ? 'row-span-2' : 'row-span-1'}
                  ${expandedCard === 0 ? (
                    index === 0 ? 'lg:col-span-2 lg:row-span-2' :
                      index === 1 ? 'lg:col-start-3 lg:col-span-1 lg:row-start-1 lg:row-span-1' :
                        'lg:col-start-3 lg:col-span-1 lg:row-start-2 lg:row-span-1'
                  ) : expandedCard === 1 ? (
                    index === 0 ? 'lg:col-span-1 lg:row-span-1' :
                      index === 1 ? 'lg:col-start-2 lg:col-span-2 lg:row-span-2' :
                        'lg:col-start-1 lg:col-span-1 lg:row-start-2 lg:row-span-1'
                  ) : expandedCard === 2 ? (
                    index === 0 ? 'lg:col-span-1 lg:row-span-1' :
                      index === 1 ? 'lg:col-start-1 lg:col-span-1 lg:row-start-2 lg:row-span-1' :
                        'lg:col-start-2 lg:col-span-2 lg:row-span-2 lg:row-start-1'
                  ) : (
                    index === 0 ? 'lg:col-span-1 lg:row-span-1 lg:col-start-1' :
                      index === 1 ? 'lg:col-span-1 lg:row-span-1 lg:col-start-2' :
                        'lg:col-span-1 lg:row-span-1 lg:col-start-3'
                  )}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 
                  transition-opacity duration-300 blur-xl 
                  ${hoveredCard === index ? 'opacity-20' : ''}`}
                />

                {/* Card Content */}
                <div className={`relative bg-gradient-to-r ${card.color} p-2 lg:p-4 h-full
                  transition-all duration-500
                  ${hoveredCard === index ? 'shadow-md lg:shadow-lg shadow-' + card.glowColor + '-500/50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <card.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white/80" />
                        <p className="text-white/80 text-xs lg:text-sm font-medium">{card.title}</p>
                      </div>
                      <p className="text-white text-xl lg:text-2xl font-bold mt-1">{card.count}</p>
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
                    <div className="pt-1.5 lg:pt-2 border-t border-white/20">
                      <div className="space-y-1 lg:space-y-2">
                        {card.details.map((detail, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-white/80 text-xs lg:text-sm">{detail.label}</span>
                            <span className="text-white text-xs lg:text-sm font-medium">{detail.value}</span>
                          </div>
                        ))}
                      </div>
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
          <div className="bg-white rounded-lg shadow overflow-x-auto overflow-visible">
            <div className="min-w-full">
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
            <div className="px-3 lg:px-6 py-2 lg:py-3 border-t border-gray-200 bg-white overflow-visible">
              <div className="flex items-center justify-between overflow-visible">
                <div className="flex items-center space-x-2 lg:space-x-4 overflow-visible">
                  <span className="text-xs lg:text-sm text-gray-700">Rows:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    className="border rounded px-1.5 py-0.5 text-xs lg:text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-xs lg:text-sm text-gray-500 whitespace-nowrap">
                    {startIndex + 1}-{Math.min(endIndex, filteredVehicles.length)} of {filteredVehicles.length}
                  </span>

                  {/* Export Button with Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        disabled={isExporting}
                        className="flex items-center px-3 py-1.5 lg:px-4 lg:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium text-xs lg:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isExporting ? (
                          <>
                            <svg className="animate-spin h-3 w-3 lg:h-4 lg:w-4 mr-1.5 lg:mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Exporting...
                          </>
                        ) : (
                          <>
                            <DocumentArrowDownIcon className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5 lg:mr-2" />
                            Export
                          </>
                        )}
                        <ChevronDownIcon className="w-3 h-3 lg:w-4 lg:h-4 ml-1.5 lg:ml-2" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40 lg:w-48">
                      {['Current Excel', 'All Excel', 'PDF'].map((option) => (
                        <DropdownMenuItem
                          key={option}
                          onClick={() => handleExport(option.toLowerCase().replace(' ', '-') as any)}
                          className="flex items-center cursor-pointer text-xs lg:text-sm"
                        >
                          <DocumentArrowDownIcon className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5 lg:mr-2" />
                          {option}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center space-x-1 lg:space-x-2">
                  <button
                    className="p-0.5 lg:p-1 rounded text-sm lg:text-base hover:bg-gray-100 disabled:opacity-50"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                  >{'<<'}</button>
                  <button
                    className="p-0.5 lg:p-1 rounded text-sm lg:text-base hover:bg-gray-100 disabled:opacity-50"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >{'<'}</button>
                  <span className="px-2 lg:px-3 py-0.5 lg:py-1 bg-blue-600 text-white text-sm lg:text-base rounded">{currentPage}</span>
                  <button
                    className="p-0.5 lg:p-1 rounded text-sm lg:text-base hover:bg-gray-100 disabled:opacity-50"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >{'>'}</button>
                  <button
                    className="p-0.5 lg:p-1 rounded text-sm lg:text-base hover:bg-gray-100 disabled:opacity-50"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                  >{'>>'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Data Panel */}
      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-200">
        <LiveDataPanel />
      </div>


      {/* Document Modal */}
      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vrn={selectedVRN}
      />

      {/* Toast Container */}
      <div className="toastContainer">
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          className="!w-auto !max-w-[90vw]"
        />
      </div>
      <style jsx global>{`
        .Toastify__toast {
          border-radius: 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
        .Toastify__toast--success {
          background: linear-gradient(to right, #2563eb, #3b82f6) !important;
        }
        .Toastify__toast--error {
          background: linear-gradient(to right, #dc2626, #ef4444) !important;
        }
        .Toastify__toast-icon {
          width: 20px;
          height: 20px;
          margin-right: 12px;
        }
        @media (max-width: 768px) {
          .Toastify__toast {
            margin: 0.5rem;
            margin-bottom: 0.75rem;
          }
          .Toastify__toast-icon {
            width: 16px;
            height: 16px;
            margin-right: 8px;
          }
          .Toastify__toast-body {
            padding: 0.5rem 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}