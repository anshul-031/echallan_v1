'use client';

import { useState, useCallback, useEffect } from 'react';
import { utils as xlsxUtils, read, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Toaster, toast } from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  TrashIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import LiveDataPanel from '../components/LiveDataPanel';
import { getSession } from 'next-auth/react';
import { Vehicle } from '@/app/types/vehicle';
import { getExpirationColor } from '@/lib/utils';
import { isDocumentExpiring, isDocumentExpired } from '@/lib/documentUtils';
import DocumentModal from '../components/DocumentModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const getSummaryCards = (vehicles: Vehicle[]) => [
  {
    title: 'TOTAL VEHICLES',
    count: vehicles.length.toString(),
    color: 'from-blue-500 to-blue-600',
    glowColor: 'blue',
    icon: ChartBarIcon,
    details: [
      { label: 'Active Vehicles', value: vehicles.filter((v) => v.status === 'Active').length.toString() },
      { label: 'Inactive Vehicles', value: vehicles.filter((v) => v.status === 'Inactive').length.toString() },
      { label: 'Under Maintenance', value: vehicles.filter((v) => v.status === 'Maintenance').length.toString() },
    ],
  },
  {
    title: 'EXPIRING DOCUMENTS',
    count: vehicles.filter((v) =>
      [v.roadTax, v.fitness, v.insurance, v.pollution].some((date) =>
        isDocumentExpiring(date)
      )
    ).length.toString(),
    color: 'from-amber-500 to-amber-600',
    glowColor: 'amber',
    icon: ClockIcon,
    details: [
      {
        label: 'Road Tax', value: vehicles.filter((v) => isDocumentExpiring(v.roadTax)).length.toString()
      },
      {
        label: 'Insurance', value: vehicles.filter((v) => isDocumentExpiring(v.insurance)).length.toString()
      },
      {
        label: 'Fitness', value: vehicles.filter((v) => isDocumentExpiring(v.fitness)).length.toString()
      },
      {
        label: 'Pollution', value: vehicles.filter((v) => isDocumentExpiring(v.pollution)).length.toString()
      },
    ],
  },
  {
    title: 'EXPIRED DOCUMENTS',
    count: vehicles.filter((v) =>
      [v.roadTax, v.fitness, v.insurance, v.pollution].some((date) =>
        isDocumentExpired(date)
      )
    ).length.toString(),
    color: 'from-red-500 to-red-600',
    glowColor: 'red',
    icon: DocumentChartBarIcon,
    details: [
      {
        label: 'Insurance', value: vehicles.filter((v) => isDocumentExpired(v.insurance)).length.toString()
      },
      {
        label: 'Road Tax', value: vehicles.filter((v) => isDocumentExpired(v.roadTax)).length.toString()
      },
      {
        label: 'Fitness Certificate', value: vehicles.filter((v) => isDocumentExpired(v.fitness)).length.toString()
      },
      {
        label: 'Pollution', value: vehicles.filter((v) => isDocumentExpired(v.pollution)).length.toString()
      },
    ],
  },
];

export default function Dashboard() {
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVRN, setSelectedVRN] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);
  const [updatingRows, setUpdatingRows] = useState<{ [key: number]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    setFilteredVehicles(vehicles);
  }, [vehicles]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/vehicles');
        if (!response.ok) throw new Error('Failed to fetch vehicles');
        const data = await response.json();
        setVehicles(data);
        setFilteredVehicles(data);
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to load vehicles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // File Upload Operation
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadResults(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        const vehiclesSheet = workbook.Sheets[workbook.SheetNames[0]];
        const vehicles = xlsxUtils.sheet_to_json(vehiclesSheet);

        const response = await fetch('/api/vehicles/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicles),
        });

        if (!response.ok) {
          throw new Error('Failed to upload vehicles');
        }


        const result = await response.json();
        setUploadResults(result);

        if (result.results && result.results.some((r: any) => r.success)) {
          toast.success(`Successfully uploaded ${result.results.filter((r: any) => r.success).length} vehicles`);
          // Refresh the vehicles list
          const fetchResponse = await fetch('/api/vehicles');
          if (fetchResponse.ok) {
            const updatedVehicles = await fetchResponse.json();
            setVehicles(updatedVehicles);
            setFilteredVehicles(updatedVehicles);
          }
        }

        if (result.results && result.results.some((r: any) => !r.success)) {
          toast.error(`Failed to upload ${result.results.filter((r: any) => !r.success).length} vehicles`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload vehicles');
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadSampleExcel = () => {
    // Create sample data
    const sampleData = [
      {
        vrn: 'AB12CD3456',
        roadTax: '2023-12-31',
        fitness: '2023-11-30',
        insurance: '2024-01-31',
        pollution: '2023-10-31',
        statePermit: '2023-12-15',
        nationalPermit: '2024-02-28',
        status: 'Active',
        registeredAt: '2022-01-01'
      },
      {
        vrn: 'XY98ZW7654',
        roadTax: '2024-01-15',
        fitness: '2023-12-20',
        insurance: '2024-02-15',
        pollution: '2023-11-10',
        statePermit: '2024-01-05',
        nationalPermit: '',
        status: 'Active',
        registeredAt: '2022-03-15'
      }
    ];

    // Create worksheet
    const ws = xlsxUtils.json_to_sheet(sampleData);

    // Add column descriptions in the second sheet
    const descriptions = [
      { Field: 'vrn', Description: 'Vehicle Registration Number (Required)', Format: 'Text, e.g., AB12CD3456' },
      { Field: 'roadTax', Description: 'Road Tax Expiry Date', Format: 'YYYY-MM-DD' },
      { Field: 'fitness', Description: 'Fitness Certificate Expiry Date', Format: 'YYYY-MM-DD' },
      { Field: 'insurance', Description: 'Insurance Expiry Date', Format: 'YYYY-MM-DD' },
      { Field: 'pollution', Description: 'Pollution Certificate Expiry Date', Format: 'YYYY-MM-DD' },
      { Field: 'statePermit', Description: 'State Permit Expiry Date', Format: 'YYYY-MM-DD' },
      { Field: 'nationalPermit', Description: 'National Permit Expiry Date', Format: 'YYYY-MM-DD' },
      { Field: 'status', Description: 'Vehicle Status', Format: 'Text: Active, Inactive, or Maintenance' },
      { Field: 'registeredAt', Description: 'Registration Date', Format: 'YYYY-MM-DD' }
    ];

    const wsDesc = xlsxUtils.json_to_sheet(descriptions);

    // Create workbook
    const wb = xlsxUtils.book_new();
    xlsxUtils.book_append_sheet(wb, ws, 'Sample Vehicles');
    xlsxUtils.book_append_sheet(wb, wsDesc, 'Field Descriptions');

    // Download
    writeFile(wb, 'vehicle_upload_template.xlsx');
  };

  const handleCreate = async (newVehicle: Omit<Vehicle, 'id' | 'lastUpdated'>) => {
    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle),
      });
      if (!response.ok) throw new Error('Failed to create vehicle');
      const createdVehicle = await response.json();
      setVehicles((prev) => [...prev, createdVehicle]);
      setFilteredVehicles((prev) => [...prev, createdVehicle]);
      toast.success('Vehicle created successfully');
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Failed to create vehicle');
    }
  };



  const handleUpdate = async (row: Vehicle) => {
    try {
      setUpdatingRows((prev) => ({ ...prev, [row.id]: true }));

      const vahanResponse = await fetch(`/api/vahanfin/vehicle?rc_no=${row.vrn}`);
      if (!vahanResponse.ok) {
        throw new Error(`Failed to fetch vehicle data from Vahan API: ${vahanResponse.status}`);
      }
      const vahanData = await vahanResponse.json();

      if (!vahanData?.data) {
        throw new Error("No vehicle data found from Vahan API");
      }

      const updatedVehicleData = {
        ...row,
        roadTax: vahanData.data.rc_tax_upto,
        fitness: vahanData.data.rc_fit_upto,
        insurance: vahanData.data.rc_insurance_upto,
        pollution: vahanData.data.rc_pucc_upto,
        statePermit: vahanData.data.rc_permit_valid_upto || "Not Available",
        nationalPermit: vahanData.data.rc_permit_valid_upto,
        lastUpdated: new Date().toISOString().slice(0, 10),
        status: vahanData.data.rc_status === "NOC ISSUED" ? "Inactive" : "Active",
      };

      const response = await fetch(`/api/vehicles/${row.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedVehicleData),
      });

      if (!response.ok) throw new Error('Failed to update vehicle in database');
      const updatedVehicle = await response.json();

      setVehicles((prev) => prev.map((v) => (v.id === row.id ? updatedVehicle : v)));
      setFilteredVehicles((prev) => prev.map((v) => (v.id === row.id ? updatedVehicle : v)));
      toast.success('Vehicle updated successfully');
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(`Failed to update vehicle: ${error.message}`);
    } finally {
      setUpdatingRows((prev) => ({ ...prev, [row.id]: false }));
    }
  };


  const handleDelete = (id: number) => {
    setVehicleToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      setIsDeletingVehicle(true);
      const response = await fetch(`/api/vehicles?id=${vehicleToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete vehicle');
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleToDelete));
      setFilteredVehicles((prev) => prev.filter((v) => v.id !== vehicleToDelete));
      toast.success('Vehicle deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete vehicle');
    } finally {
      setIsDeletingVehicle(false);
      setIsDeleteModalOpen(false);
      setVehicleToDelete(null);
    }
  };

  type ExportData = {
    vrn: string;
    roadTax: string;
    fitness: string;
    insurance: string;
    pollution: string;
    statePermit: string;
    nationalPermit: string;
    status: string;
    registeredAt: string;
  };

  const prepareExportData = (data: Vehicle[]): ExportData[] => {
    return data.map((vehicle) => {
      const lastUpdatedDate = vehicle.lastUpdated ? new Date(vehicle.lastUpdated) : null;
      const formattedLastUpdated = lastUpdatedDate ? lastUpdatedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) : "";

      return {
        vrn: vehicle.vrn,
        roadTax: vehicle.roadTax,
        fitness: vehicle.fitness,
        insurance: vehicle.insurance,
        pollution: vehicle.pollution,
        statePermit: vehicle.statePermit,
        nationalPermit: vehicle.nationalPermit,
        status: vehicle.status,
        registeredAt: vehicle.registeredAt,
        lastUpdated: formattedLastUpdated,
      };
    });
  };

  const handleExport = async (format: 'current-excel' | 'all-excel' | 'pdf' | 'csv' | 'json') => {
    try {
      setIsExporting(true);
      const data = format === 'current-excel' ? currentVehicles : vehicles;
      const exportData = prepareExportData(data);

      if (format === 'current-excel' || format === 'all-excel') {
        const worksheet = xlsxUtils.json_to_sheet(exportData);
        const workbook = xlsxUtils.book_new();
        xlsxUtils.book_append_sheet(workbook, worksheet, 'Fleet Data');
        const fileName = format === 'current-excel' ? 'current-fleet-data.xlsx' : 'all-fleet-data.xlsx';
        writeFile(workbook, fileName);
        toast.success(`${format === 'current-excel' ? 'Current' : 'All'} data exported to Excel`);
      } else if (format === 'csv') {
        const worksheet = xlsxUtils.json_to_sheet(exportData);
        const csv = xlsxUtils.sheet_to_csv(worksheet);
        const fileName = 'fleet-data.csv';
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Data exported to CSV');
      } else if (format === 'json') {
        const json = JSON.stringify(exportData, null, 2);
        const fileName = 'fleet-data.json';
        const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Data exported to JSON');
      } else {
        const doc = new jsPDF();
        autoTable(doc, {
          head: [Object.keys(exportData[0])],
          body: exportData.map((row) => Object.values(row)),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [249, 250, 251], textColor: [0, 0, 0], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          margin: { top: 20 },
        });
        doc.save('fleet-data.pdf');
        toast.success('Data exported to PDF');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  // Search Logic
  const handleSearch = useCallback(async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setSearchError('Please enter a VRN to search');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setCurrentPage(1);

    try {
      const response = await fetch(`/api/vehicles?vrn=${trimmedQuery}`);
      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }
      const data = await response.json();

      if (data.length === 0) {
        setFilteredVehicles([]);
        setSearchError('No results found');
      } else {
        setFilteredVehicles(data);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setSearchError('Failed to perform search');
      setFilteredVehicles([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredVehicles(vehicles);
    setSearchError(null);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen overflow-y-auto lg:overflow-hidden">
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

      <div className="flex-1 flex flex-col p-3 lg:p-6 space-y-4">
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Fleet Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {getSummaryCards(vehicles).map((card, index) => (
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
              <div
                className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 transition-opacity duration-300 blur-xl ${hoveredCard === index ? 'opacity-20' : ''}`}
              />

              {/* Card Content */}
              <div
                className={`relative bg-gradient-to-r ${card.color} p-2 lg:p-4 h-full transition-all duration-500 ${hoveredCard === index ? 'shadow-md lg:shadow-lg shadow-' + card.glowColor + '-500/50' : ''}`}
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
                    className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 transform ${expandedCard === index ? 'rotate-180' : 'rotate-0'}`}
                  >
                    <ChevronDownIcon className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Expandable Content */}
                <div
                  className={`mt-2 overflow-hidden transition-all duration-500 ease-in-out ${expandedCard === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
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

        {/* Table Controls */}
        {searchError && <div className="text-center mb-4 text-red-500">{searchError}</div>}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4">
          <div className="relative w-full md:w-64 lg:w-96">
            <input
              type="text"
              placeholder="Search by VRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-4 py-2 bg-white border border-blue-700 rounded-lg text-black focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
            >
              <MagnifyingGlassIcon className="h-5 w-5 bg-none" />
            </button>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-12 top-2.5"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-white" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              <CloudArrowUpIcon className="h-5 w-5" />
              <span>Bulk Upload</span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors text-white"
                  disabled={isExporting}
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  <span>Export</span>
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => handleExport('all-excel')}>
                  Excel (All Data)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('current-excel')}>
                  Excel (Current View)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv' as any)}>
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json' as any)}>
                  JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden relative overflow-x-auto">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm">
                <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-gray-500">Fetching results...</span>
              </div>
            </div>
          )}
          {/* Search Overlay (kept as-is) */}
          {isSearching && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm">
                <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-gray-500">Fetching results...</span>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '100%' }}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">S.no</th>
                  <th className="px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">VRN</th>
                  <th className="px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Road Tax</th>
                  <th className="px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Fitness</th>
                  <th className="px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Insurance</th>
                  <th className="px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Pollution</th>
                  <th className="px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Permit</th>
                  <th className="px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">National Permit</th>
                  <th className="px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Last Updated</th>
                  <th className="px-2 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Update</th>
                  <th className="px-2 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Upload</th>
                  <th className="px-2 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Delete</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchError && (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                      {searchError}
                    </td>
                  </tr>
                )}
                {!isLoading && filteredVehicles.length === 0 && !searchError && (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                      No vehicles found
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  currentVehicles.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-2 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-gray-500 whitespace-nowrap">
                        {row.id}
                      </td>
                      <td className="px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm font-medium text-gray-900 whitespace-nowrap">
                        {row.vrn}
                      </td>
                      <td
                        className={`px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm ${getExpirationColor(
                          row.roadTax
                        )} whitespace-nowrap`}
                      >
                        {row.roadTax}
                      </td>
                      <td
                        className={`px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm ${getExpirationColor(
                          row.fitness
                        )} whitespace-nowrap`}
                      >
                        {row.fitness === 'LTT' ? 'LTT' : row.fitness}
                      </td>
                      <td
                        className={`px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm ${getExpirationColor(
                          row.insurance
                        )} whitespace-nowrap`}
                      >
                        {row.insurance === 'LTT' ? 'LTT' : row.insurance}
                      </td>
                      <td
                        className={`px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm ${getExpirationColor(
                          row.pollution
                        )} whitespace-nowrap`}
                      >
                        {row.pollution === 'LTT' ? 'LTT' : row.pollution}
                      </td>
                      <td
                        className={`px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm ${getExpirationColor(
                          row.statePermit
                        )} whitespace-nowrap`}
                      >
                        {row.statePermit === 'LTT' ? 'LTT' : row.statePermit}
                      </td>
                      <td
                        className={`px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm ${getExpirationColor(
                          row.nationalPermit
                        )} whitespace-nowrap`}
                      >
                        {row.nationalPermit === 'LTT' ? 'LTT' : row.nationalPermit}
                      </td>
                      <td className="px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-gray-500 whitespace-nowrap">
                        {row.lastUpdated}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleUpdate(row)}
                          disabled={updatingRows[row.id]}
                          className={`p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors ${updatingRows[row.id] ? 'bg-blue-50' : ''
                            }`}
                        >
                          <ArrowPathIcon
                            className={`w-5 h-5 ${updatingRows[row.id] ? 'animate-spin' : ''}`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
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
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(row.id)}
                          disabled={isDeletingVehicle}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 bg-white border-t border-gray-200 sm:px-6 flex items-center justify-between">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, filteredVehicles.length)}</span> of{' '}
                <span className="font-medium">{filteredVehicles.length}</span> results
              </p>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-5 w-5 mr-1" />
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber =
                    currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                  if (pageNumber <= 0 || pageNumber > totalPages) return null;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNumber ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-5 w-5 mr-1" />
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </nav>
            </div>
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="mx-4 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Data Panel */}
      <div className={`
        w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-200
        ${showMobilePanel ? 'fixed inset-0 z-40 bg-white' : 'hidden'}
        lg:relative lg:block
      `}>
        <LiveDataPanel vehicles={vehicles} setVehicles={setVehicles} />
      </div>

      <DocumentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} vrn={selectedVRN} />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setVehicleToDelete(null);
        }}
        onConfirm={confirmDelete}
        isLoading={isDeletingVehicle}
      />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { background: '#fff', color: '#363636', borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
          success: { style: { background: 'linear-gradient(to right, #2563eb, #3b82f6)', color: '#fff' } },
          error: { style: { background: 'linear-gradient(to right, #dc2626, #ef4444)', color: '#fff' } },
        }}
      />

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Bulk Upload Vehicles</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setFile(null);
                  setUploadResults(null);
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-500 mb-2">Upload multiple vehicles using an Excel file.</p>
              <button
                onClick={downloadSampleExcel}
                className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors mb-4"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                <span>Download Sample Template</span>
              </button>

              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <CloudArrowUpIcon className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-gray-500">
                    {file ? file.name : 'Click to select Excel file'}
                  </span>
                </label>
              </div>
            </div>

            {file && (
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setFile(null);
                    setUploadResults(null);
                  }}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
                  disabled={isUploading}
                >
                  Clear
                </button>
                <button
                  onClick={handleUpload}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="h-5 w-5" />
                      <span>Upload</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {uploadResults && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h4 className="font-medium mb-2">Upload Results</h4>

                {uploadResults.results && uploadResults.results.length > 0 && (
                  <div className="max-h-60 overflow-y-auto bg-gray-100 rounded-md p-2">
                    <div className="text-sm mb-2">
                      <span className="text-green-500">{uploadResults.results.filter((r: any) => r.success).length} successful</span>
                      {' • '}
                      <span className="text-red-500">{uploadResults.results.filter((r: any) => !r.success).length} failed</span>
                    </div>

                    {uploadResults.results.filter((r: any) => !r.success).length > 0 && (
                      <div className="mb-2">
                        <h5 className="text-sm font-medium text-red-500 mb-1">Errors:</h5>
                        <ul className="list-disc pl-5 text-xs space-y-1">
                          {uploadResults.results
                            .filter((r: any) => !r.success)
                            .map((result: any, idx: number) => (
                              <li key={idx} className="text-gray-500">
                                <span className="font-medium">{result.vrn}</span>: {result.error}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {uploadResults.results.filter((r: any) => r.success).length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-green-500 mb-1">Successful Uploads:</h5>
                        <ul className="list-disc pl-5 text-xs space-y-1">
                          {uploadResults.results
                            .filter((r: any) => r.success)
                            .map((result: any, idx: number) => (
                              <li key={idx} className="text-gray-500">
                                <span className="font-medium">{result.vrn}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
