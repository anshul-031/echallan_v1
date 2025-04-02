'use client';

import { useState, useCallback, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon,
  ClockIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Vehicle } from '@/app/types/vehicle';
import { getExpirationColor } from '@/lib/utils';
import DocumentModal from '../components/DocumentModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

// Interface for vehicle stats (updated for renewals)
type VehicleStats = {
  expiring_count: number;
  expiring_roadTax: number;
  expiring_fitness: number;
  expiring_insurance: number;
  expiring_pollution: number;
  expiring_statePermit: number;
  expiring_nationalPermit: number;
  expiring_3m_count: number;
  expiring_3m_roadTax: number;
  expiring_3m_fitness: number;
  expiring_3m_insurance: number;
  expiring_3m_pollution: number;
  expiring_3m_statePermit: number;
  expiring_3m_nationalPermit: number;
  expiring_6m_count: number;
  expiring_6m_roadTax: number;
  expiring_6m_fitness: number;
  expiring_6m_insurance: number;
  expiring_6m_pollution: number;
  expiring_6m_statePermit: number;
  expiring_6m_nationalPermit: number;
  expiring_1y_count: number;
  expiring_1y_roadTax: number;
  expiring_1y_fitness: number;
  expiring_1y_insurance: number;
  expiring_1y_pollution: number;
  expiring_1y_statePermit: number;
  expiring_1y_nationalPermit: number;
};

// Interface for summary card
interface SummaryCard {
  title: string;
  count: string;
  color: string;
  glowColor: string;
  icon: React.ComponentType<{ className?: string }>;
  timeframe: string; // To identify the timeframe for filtering
}

// Function to get summary cards for renewals
const getSummaryCards = (
  vehicleStats: VehicleStats,
  setSelectedTimeframe: (value: string) => void
): SummaryCard[] => [
    {
      title: 'NEXT 30 DAYS',
      count: vehicleStats.expiring_count.toString(),
      color: 'from-red-500 to-red-600',
      glowColor: 'red',
      icon: ClockIcon,
      timeframe: '30Days',
    },
    {
      title: 'NEXT 3 MONTHS',
      count: vehicleStats.expiring_3m_count.toString(),
      color: 'from-orange-500 to-orange-600',
      glowColor: 'orange',
      icon: ClockIcon,
      timeframe: '3Months',
    },
    {
      title: 'NEXT 6 MONTHS',
      count: vehicleStats.expiring_6m_count.toString(),
      color: 'from-yellow-500 to-yellow-600',
      glowColor: 'yellow',
      icon: ClockIcon,
      timeframe: '6Months',
    },
    {
      title: 'NEXT 12 MONTHS',
      count: vehicleStats.expiring_1y_count.toString(),
      color: 'from-green-500 to-green-600',
      glowColor: 'green',
      icon: ClockIcon,
      timeframe: '12Months',
    },
  ];

// Date utility functions
const parseDate = (dateStr: string): Date => {
  if (!dateStr || dateStr === 'Not available') return new Date(8640000000000000); // Far future date

  try {
    const dashRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
    const dashMatch = dateStr.match(dashRegex);
    if (dashMatch) {
      const day = parseInt(dashMatch[1]);
      const month = parseInt(dashMatch[2]) - 1; // JS months are 0-indexed
      const year = parseInt(dashMatch[3]);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime()) && date.getDate() === day) {
        return date;
      }
    }

    const slashRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const slashMatch = dateStr.match(slashRegex);
    if (slashMatch) {
      const day = parseInt(slashMatch[1]);
      const month = parseInt(slashMatch[2]) - 1;
      const year = parseInt(slashMatch[3]);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime()) && date.getDate() === day) {
        return date;
      }
    }

    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  } catch (error) {
    console.error("Error parsing date:", error);
  }

  return new Date(8640000000000000);
};

const getDaysDifference = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDate = parseDate(dateStr);
  expiryDate.setHours(0, 0, 0, 0);

  const diffTime = expiryDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Function to check if a date is in a specific range
const isDateInRange = (dateStr: string, days: number): boolean => {
  if (!dateStr || dateStr === 'Not available') return false;
  const diff = getDaysDifference(dateStr);
  return diff >= 0 && diff <= days;
};

// Function to get expiring documents for a vehicle in a specific timeframe
const getExpiringDocuments = (vehicle: Vehicle, days: number): string[] => {
  const documents: { [key: string]: string } = {
    'Road Tax': vehicle.roadTax,
    'Fitness': vehicle.fitness,
    'Insurance': vehicle.insurance,
    'Pollution': vehicle.pollution,
    'Permit': vehicle.statePermit,
    'National Permit': vehicle.nationalPermit,
  };

  return Object.keys(documents).filter((doc) => isDateInRange(documents[doc], days));
};

// Reused from dashboard for PDF export
type ExportData = {
  vrn: string;
  documentsExpiring: string;
};

const prepareExportData = (vehicles: Vehicle[], days: number): ExportData[] => {
  return vehicles.map((vehicle) => {
    const expiringDocs = getExpiringDocuments(vehicle, days);
    return {
      vrn: vehicle.vrn,
      documentsExpiring: expiringDocs.join(', '),
    };
  });
};

export default function RenewalsPage() {
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVRN, setSelectedVRN] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAssignVehicle, setSelectedAssignVehicle] = useState<Vehicle | null>(null);
  const [assigningServices, setAssigningServices] = useState<{ [key: number]: boolean }>({});
  const [assignedServices, setAssignedServices] = useState<{ [key: number]: boolean }>({});
  const [isDetailsPopupOpen, setIsDetailsPopupOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [updatingRows, setUpdatingRows] = useState<{ [key: number]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleStats, setVehicleStats] = useState<VehicleStats>({
    expiring_count: 0,
    expiring_roadTax: 0,
    expiring_fitness: 0,
    expiring_insurance: 0,
    expiring_pollution: 0,
    expiring_statePermit: 0,
    expiring_nationalPermit: 0,
    expiring_3m_count: 0,
    expiring_3m_roadTax: 0,
    expiring_3m_fitness: 0,
    expiring_3m_insurance: 0,
    expiring_3m_pollution: 0,
    expiring_3m_statePermit: 0,
    expiring_3m_nationalPermit: 0,
    expiring_6m_count: 0,
    expiring_6m_roadTax: 0,
    expiring_6m_fitness: 0,
    expiring_6m_insurance: 0,
    expiring_6m_pollution: 0,
    expiring_6m_statePermit: 0,
    expiring_6m_nationalPermit: 0,
    expiring_1y_count: 0,
    expiring_1y_roadTax: 0,
    expiring_1y_fitness: 0,
    expiring_1y_insurance: 0,
    expiring_1y_pollution: 0,
    expiring_1y_statePermit: 0,
    expiring_1y_nationalPermit: 0,
  });
  const [preferences, setPreferences] = useState({
    roadTaxVisibility: true,
    fitnessVisibility: true,
    insuranceVisibility: true,
    pollutionVisibility: true,
    statePermitVisibility: true,
    nationalPermitVisibility: true,
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null);
  const [filteredVehiclesForTimeframe, setFilteredVehiclesForTimeframe] = useState<Vehicle[]>([]);

  // Fetch vehicles and stats from /api/vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/vehicles', { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch vehicles');
        const data = await response.json();
        setVehicles(data.vehicles);
        setVehicleStats(data.vehicleStats);
        setFilteredVehicles(data.vehicles);
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to load vehicles');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/preferences');
        if (!response.ok) throw new Error('Failed to fetch preferences');
        const data = await response.json();
        setPreferences(data);
      } catch (error) {
        console.error('Fetch preferences error:', error);
        toast.error('Failed to load preferences');
      }
    };

    fetchVehicles();
    fetchPreferences();
  }, []);

  // Filter vehicles when a timeframe is selected
  useEffect(() => {
    if (selectedTimeframe) {
      let days: number;
      switch (selectedTimeframe) {
        case '30Days':
          days = 30;
          break;
        case '3Months':
          days = 90;
          break;
        case '6Months':
          days = 180;
          break;
        case '12Months':
          days = 365;
          break;
        default:
          days = 0;
      }

      const filtered = vehicles.filter((vehicle) =>
        [
          vehicle.roadTax,
          vehicle.fitness,
          vehicle.insurance,
          vehicle.pollution,
          vehicle.statePermit,
          vehicle.nationalPermit,
        ].some((date) => isDateInRange(date, days))
      );
      setFilteredVehiclesForTimeframe(filtered);
    }
  }, [selectedTimeframe, vehicles]);

  // Handle search
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
      const params = new URLSearchParams({ vrn: trimmedQuery });
      const response = await fetch(`/api/vehicles?${params.toString()}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data = await response.json();

      if (data.vehicles.length === 0) {
        setFilteredVehicles([]);
        setSearchError('No results found');
      } else {
        setFilteredVehicles(data.vehicles);
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

  // Handle update
  const handleUpdate = async (row: Vehicle) => {
    try {
      setUpdatingRows((prev) => ({ ...prev, [row.id]: true }));
      const vahanResponse = await fetch(`/api/vahanfin/vehicle?rc_no=${row.vrn}`);
      if (!vahanResponse.ok) throw new Error(`Failed to fetch vehicle data from Vahan API: ${vahanResponse.status}`);
      const vahanData = await vahanResponse.json();

      if (!vahanData?.data) throw new Error("No vehicle data found from Vahan API");

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

      const response = await fetch(`/api/vehicles?id=${row.id}`, {
        method: 'PUT',
        credentials: 'include',
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

  // Handle delete
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
      setIsDetailsPopupOpen(false);
      setSelectedVehicle(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete vehicle');
    } finally {
      setIsDeletingVehicle(false);
      setIsDeleteModalOpen(false);
      setVehicleToDelete(null);
    }
  };

  // Handle assign
  const handleAssign = (vehicle: Vehicle) => {
    setSelectedAssignVehicle(vehicle);
    setIsAssignModalOpen(true);
  };

  // Handle PDF download for expiring documents (adapted from dashboard)
  const handleDownloadPDF = async (docType: string, timeframe: string) => {
    if (!filteredVehiclesForTimeframe.length) return;

    try {
      let days: number;
      let timeframeLabel: string;
      switch (timeframe) {
        case '30Days':
          days = 30;
          timeframeLabel = 'Monthly';
          break;
        case '3Months':
          days = 90;
          timeframeLabel = '3Months';
          break;
        case '6Months':
          days = 180;
          timeframeLabel = '6Months';
          break;
        case '12Months':
          days = 365;
          timeframeLabel = '12Months';
          break;
        default:
          days = 0;
          timeframeLabel = '';
      }

      const vehiclesWithExpiringDoc = filteredVehiclesForTimeframe.filter((vehicle) => {
        const expiringDocs = getExpiringDocuments(vehicle, days);
        return expiringDocs.includes(docType);
      });

      const exportData = prepareExportData(vehiclesWithExpiringDoc, days);

      const doc = new jsPDF();

      // Add title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      const title = `List of vehicles no for expiring ${docType} document`;
      doc.text(title, doc.internal.pageSize.width / 2, 15, { align: 'center' });

      // Add table
      autoTable(doc, {
        head: [['Vehicle Registration Number']],
        body: exportData.map((vehicle) => [vehicle.vrn]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [249, 250, 251], textColor: [0, 0, 0], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { top: 30 },
      });

      const docTypeAbbr = docType === 'Road Tax' ? 'RT' : docType === 'Fitness' ? 'FIT' : docType === 'Insurance' ? 'INS' : docType === 'Pollution' ? 'PUC' : docType === 'Permit' ? 'SP' : 'NP';
      doc.save(`${docTypeAbbr}_${timeframeLabel}_expire.pdf`);
      toast.success(`Downloaded PDF for ${docType} expiring in ${timeframeLabel}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const totalPages = Math.ceil(filteredVehicles.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <div className="flex-1 flex flex-col p-3 lg:p-6 space-y-4">
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Renewals Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {getSummaryCards(vehicleStats, setSelectedTimeframe).map((card, index) => (
            <div
              key={card.title}
              className="relative overflow-hidden rounded-lg transition-all duration-500 cursor-pointer"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 transition-opacity duration-300 blur-xl ${hoveredCard === index ? 'opacity-20' : ''}`}
              />
              <div
                className={`relative bg-gradient-to-r ${card.color} p-2 lg:p-4 h-full transition-all duration-500 ${hoveredCard === index ? 'shadow-md lg:shadow-lg shadow-' + card.glowColor + '-500/50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-full">
                    <div className="flex items-center space-x-1 lg:space-x-2">
                      <card.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white/80" />
                      <p className="text-white/80 text-xs lg:text-sm font-medium">{card.title}</p>
                    </div>
                    <p className="text-white text-xl lg:text-2xl font-bold mt-1">{card.count}</p>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => setSelectedTimeframe(card.timeframe)}
                        className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-md transition-all duration-200"
                      >
                        Show Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Controls */}
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
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden relative overflow-x-auto min-w-full">
          {(isLoading || isSearching) && (
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
                  <th className="md:hidden px-2 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Details</th>
                  {preferences.roadTaxVisibility && (
                    <th className="hidden md:table-cell px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Road Tax</th>
                  )}
                  {preferences.fitnessVisibility && (
                    <th className="hidden md:table-cell px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Fitness</th>
                  )}
                  {preferences.insuranceVisibility && (
                    <th className="hidden md:table-cell px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Insurance</th>
                  )}
                  {preferences.pollutionVisibility && (
                    <th className="hidden md:table-cell px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Pollution</th>
                  )}
                  {preferences.statePermitVisibility && (
                    <th className="hidden md:table-cell px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Permit</th>
                  )}
                  {preferences.nationalPermitVisibility && (
                    <th className="hidden md:table-cell px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">National Permit</th>
                  )}
                  <th className="px-2 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Assign</th>
                  <th className="hidden md:table-cell px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Last Updated</th>
                  <th className="md:table-cell px-2 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Update</th>
                  <th className="md:table-cell px-2 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Upload</th>
                  <th className="hidden md:table-cell px-2 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Delete</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchError && (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-gray-500">{searchError}</td>
                  </tr>
                )}
                {!isLoading && filteredVehicles.length === 0 && !searchError && (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-gray-500">No vehicles found</td>
                  </tr>
                )}
                {!isLoading &&
                  currentVehicles.map((row, index) => (
                    <tr key={row.id} className="hover:bg-gray-50 py-6">
                      <td className="px-2 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-gray-500 whitespace-nowrap">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm font-medium text-gray-900 whitespace-nowrap">
                        {row.vrn}
                      </td>
                      <td className="md:hidden text-center min-w-[100px] whitespace-nowrap">
                        <button
                          onClick={() => {
                            setIsDetailsPopupOpen(true);
                            setSelectedVehicle(row);
                          }}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs whitespace-nowrap inline-block min-w-[90px]"
                        >
                          Show Details
                        </button>
                      </td>
                      {preferences.roadTaxVisibility && (
                        <td className={`hidden md:table-cell px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm ${getExpirationColor(row.roadTax)} whitespace-nowrap`}>
                          {row.roadTax}
                        </td>
                      )}
                      {preferences.fitnessVisibility && (
                        <td className={`hidden md:table-cell px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm ${getExpirationColor(row.fitness)} whitespace-nowrap`}>
                          {row.fitness}
                        </td>
                      )}
                      {preferences.insuranceVisibility && (
                        <td className={`hidden md:table-cell px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm ${getExpirationColor(row.insurance)} whitespace-nowrap`}>
                          {row.insurance}
                        </td>
                      )}
                      {preferences.pollutionVisibility && (
                        <td className={`hidden md:table-cell px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm ${getExpirationColor(row.pollution)} whitespace-nowrap`}>
                          {row.pollution}
                        </td>
                      )}
                      {preferences.statePermitVisibility && (
                        <td className={`hidden md:table-cell px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm ${getExpirationColor(row.statePermit)} whitespace-nowrap`}>
                          {row.statePermit}
                        </td>
                      )}
                      {preferences.nationalPermitVisibility && (
                        <td className={`hidden md:table-cell px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm ${getExpirationColor(row.nationalPermit)} whitespace-nowrap`}>
                          {row.nationalPermit}
                        </td>
                      )}
                      <td className="px-1 lg:px-4 py-2 lg:py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleAssign(row)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        >
                          <UserIcon className="w-5 h-5" />
                        </button>
                      </td>
                      <td className="hidden md:table-cell px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-gray-500 whitespace-nowrap">{row.lastUpdated}</td>
                      <td className="md:table-cell px-4 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleUpdate(row)}
                          disabled={updatingRows[row.id]}
                          className={`p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors ${updatingRows[row.id] ? 'bg-blue-50' : ''}`}
                        >
                          <ArrowPathIcon className={`w-5 h-5 ${updatingRows[row.id] ? 'animate-spin' : ''}`} />
                        </button>
                      </td>
                      <td className="md:table-cell px-4 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => { setSelectedVRN(row.vrn); setIsModalOpen(true); }}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                        >
                          <CloudArrowUpIcon className="w-5 h-5" />
                        </button>
                      </td>
                      <td className="hidden md:table-cell px-4 py-4 text-center whitespace-nowrap">
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

      {/* Popup for Expiring Documents */}
      {selectedTimeframe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {selectedTimeframe === '30Days' ? 'Next 30 Days' : selectedTimeframe === '3Months' ? 'Next 3 Months' : selectedTimeframe === '6Months' ? 'Next 6 Months' : 'Next 12 Months'} Expiring Documents
              </h3>
              <button
                onClick={() => setSelectedTimeframe(null)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EXPIRING</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOWNLOAD</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { label: 'Road Tax', value: selectedTimeframe === '30Days' ? vehicleStats.expiring_roadTax : selectedTimeframe === '3Months' ? vehicleStats.expiring_3m_roadTax : selectedTimeframe === '6Months' ? vehicleStats.expiring_6m_roadTax : vehicleStats.expiring_1y_roadTax },
                    { label: 'Fitness', value: selectedTimeframe === '30Days' ? vehicleStats.expiring_fitness : selectedTimeframe === '3Months' ? vehicleStats.expiring_3m_fitness : selectedTimeframe === '6Months' ? vehicleStats.expiring_6m_fitness : vehicleStats.expiring_1y_fitness },
                    { label: 'Insurance', value: selectedTimeframe === '30Days' ? vehicleStats.expiring_insurance : selectedTimeframe === '3Months' ? vehicleStats.expiring_3m_insurance : selectedTimeframe === '6Months' ? vehicleStats.expiring_6m_insurance : vehicleStats.expiring_1y_insurance },
                    { label: 'Permit', value: selectedTimeframe === '30Days' ? vehicleStats.expiring_statePermit : selectedTimeframe === '3Months' ? vehicleStats.expiring_3m_statePermit : selectedTimeframe === '6Months' ? vehicleStats.expiring_6m_statePermit : vehicleStats.expiring_1y_statePermit },
                    { label: 'PUC', value: selectedTimeframe === '30Days' ? vehicleStats.expiring_pollution : selectedTimeframe === '3Months' ? vehicleStats.expiring_3m_pollution : selectedTimeframe === '6Months' ? vehicleStats.expiring_6m_pollution : vehicleStats.expiring_1y_pollution },
                  ].map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.label}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.value}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleDownloadPDF(item.label, selectedTimeframe)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                          disabled={item.value === 0}
                        >
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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

      {/* Vehicle Details Popup */}
      {isDetailsPopupOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-lg p-6 max-w-md w-full md:w-[90vw] transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Vehicle Details</h3>
              <button
                onClick={() => {
                  setIsDetailsPopupOpen(false);
                  setSelectedVehicle(null);
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-2 flex gap-2">
              <span className="text-gray-600 mb-2">Vehicle No.:</span>
              <span className="text-gray-800 font-medium mb-2">{selectedVehicle.vrn}</span>
            </div>
            <div className="mb-2 flex gap-2">
              <span className="text-gray-600 mb-2">Road Tax:</span>
              <span className={`font-medium mb-2 ${getExpirationColor(selectedVehicle.roadTax)}`}>{selectedVehicle.roadTax}</span>
            </div>
            <div className="mb-2 flex gap-2">
              <span className="text-gray-600 mb-2">Fitness:</span>
              <span className={`text-gray-800 font-medium mb-2 ${getExpirationColor(selectedVehicle.fitness)}`}>{selectedVehicle.fitness}</span>
            </div>
            <div className="mb-2 flex gap-2">
              <span className="text-gray-600 mb-2">Insurance:</span>
              <span className={`text-gray-800 font-medium mb-2 ${getExpirationColor(selectedVehicle.insurance)}`}>{selectedVehicle.insurance}</span>
            </div>
            <div className="mb-2 flex gap-2">
              <span className="text-gray-600 mb-2">Pollution:</span>
              <span className={`text-gray-800 font-medium mb-2 ${getExpirationColor(selectedVehicle.pollution)}`}>{selectedVehicle.pollution}</span>
            </div>
            <div className="mb-2 flex gap-2">
              <span className="text-gray-600 mb-2">Permit:</span>
              <span className={`text-gray-800 font-medium mb-2 ${getExpirationColor(selectedVehicle.statePermit)}`}>{selectedVehicle.statePermit}</span>
            </div>
            <div className="mb-2 flex gap-2">
              <span className="text-gray-600 mb-2">National Permit:</span>
              <span className={`text-gray-800 font-medium mb-2 ${getExpirationColor(selectedVehicle.nationalPermit)}`}>{selectedVehicle.nationalPermit}</span>
            </div>
            <div className="mb-2 flex gap-2">
              <span className="text-gray-600 mb-2">Last Updated:</span>
              <span className="text-gray-800 font-medium mb-2">{selectedVehicle.lastUpdated}</span>
            </div>
            <button
              onClick={() => handleDelete(selectedVehicle.id)}
              className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors"
            >
              <TrashIcon className="h-5 w-5" />
              <span>Delete Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Price Table Modal */}
      {isAssignModalOpen && selectedAssignVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Price</h3>
              <button
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setSelectedAssignVehicle(null);
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.no</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Govt Fees</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Charge</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assign</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    {
                      id: 1,
                      service: 'Road Tax',
                      govtFees: '1200',
                      serviceCharge: 1500,
                    },
                    {
                      id: 2,
                      service: 'Fitness',
                      govtFees: '800',
                      serviceCharge: 1800,
                    },
                    {
                      id: 3,
                      service: 'Insurance',
                      govtFees: '0',
                      serviceCharge: 1000,
                    },
                    {
                      id: 4,
                      service: 'Pollution',
                      govtFees: '50',
                      serviceCharge: 200,
                    },
                    {
                      id: 5,
                      service: 'Permit',
                      govtFees: '5000',
                      serviceCharge: 2000,
                    },
                    {
                      id: 6,
                      service: 'National Permit',
                      govtFees: '17520',
                      serviceCharge: 6000,
                    }
                  ].map((service) => {
                    const gst = service.serviceCharge * 0.18;
                    const total = service.serviceCharge + gst + parseFloat(service.govtFees);

                    const handleAssign = async (checked: boolean) => {
                      if (!checked) return;

                      setAssigningServices(prev => ({ ...prev, [service.id]: true }));
                      const toastId = toast.loading(`Assigning ${service.service} service to vehicle ${selectedAssignVehicle?.vrn}`);

                      try {
                        console.log('Selected vehicle:', selectedAssignVehicle);

                        if (!selectedAssignVehicle.ownerId) {
                          throw new Error('Vehicle owner ID is missing');
                        }

                        const requestBody = {
                          services: service.service,
                          vehicle_no: selectedAssignVehicle.vrn,
                          vehicleId: parseInt(selectedAssignVehicle.id.toString()),
                          userId: selectedAssignVehicle.ownerId,
                          govFees: parseFloat(service.govtFees),
                          serviceCharge: parseFloat(service.serviceCharge.toString()),
                          price: parseFloat(total.toFixed(2)),
                          isAssignedService: true
                        };

                        console.log('Sending request:', requestBody);

                        const response = await fetch('/api/services', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(requestBody),
                        });

                        if (!response.ok) {
                          const errorData = await response.json();
                          throw new Error(errorData.error || 'Failed to assign service');
                        }

                        const result = await response.json();
                        console.log('Service created:', result);

                        setAssignedServices(prev => ({ ...prev, [service.id]: true }));
                        toast.success(`${service.service} service assigned for vehicle ${selectedAssignVehicle?.vrn}`, {
                          id: toastId
                        });
                      } catch (error: any) {
                        console.error('Service assignment error:', error);
                        toast.error(`Failed to assign service: ${error.message || 'Unknown error'}`, {
                          id: toastId
                        });
                        // Reset toggle
                        const checkbox = document.getElementById(`assign-${service.id}`) as HTMLInputElement;
                        if (checkbox) checkbox.checked = false;
                      } finally {
                        setAssigningServices(prev => ({ ...prev, [service.id]: false }));
                      }
                    };

                    return (
                      <tr key={service.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{service.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{service.service}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{service.govtFees}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{service.serviceCharge.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{gst.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{total.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <label className={`relative inline-flex items-center ${assignedServices[service.id] ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input
                              id={`assign-${service.id}`}
                              type="checkbox"
                              className="sr-only peer"
                              checked={assignedServices[service.id]}
                              disabled={assigningServices[service.id] || assignedServices[service.id]}
                              onChange={(e) => !assignedServices[service.id] && handleAssign(e.target.checked)}
                            />
                            <div className={`w-11 h-6 ${assigningServices[service.id] ? 'bg-gray-400' : assignedServices[service.id] ? 'bg-blue-600' : 'bg-gray-200'} rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}