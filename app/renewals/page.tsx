'use client';

import { useState, useEffect, useCallback } from 'react';
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
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  UserIcon,
  TableCellsIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

// Interface for vehicle data
interface Vehicle {
  id: number;
  vrn: string;
  roadTax: string;
  fitness: string;
  insurance: string;
  pollution: string;
  statePermit: string;
  nationalPermit: string;
  lastUpdated: string;
  status: string;
  registeredAt: string;
  documents: number;
  ownerId?: string;
  owner?: {
    id: string;
    name: string | null;
    email: string;
  };
}

// Interface for renewal document
interface Document {
  type: string;
  status: string;
  expiry: string;
  lastUpdated: string;
}

// Interface for summary card data
interface SummaryCard {
  title: string;
  count: number;
  icon: any;
  color: string;
  hoverColor: string;
  shadowColor: string;
  textGradient: string;
  iconGradient: string;
  borderColor: string;
  vehicles: Vehicle[];
}

// Add interface for document with vehicle information
interface VehicleDocument {
  vehicleId: number;
  vrn: string;
  owner: string;
  docType: string;
  expiry: string;
  status: string;
}

// Sample data (will be replaced with API data)
const initialSummaryCards = [
  {
    title: 'Next 30 Days',
    count: 0,
    icon: BellAlertIcon,
    color: 'from-rose-500 to-pink-600',
    hoverColor: 'hover:from-rose-600 hover:to-pink-700',
    shadowColor: 'shadow-rose-500/20',
    textGradient: 'bg-gradient-to-r from-rose-500 to-pink-600',
    iconGradient: 'bg-gradient-to-br from-rose-500/10 to-pink-600/10',
    borderColor: 'border-rose-100',
    vehicles: []
  },
  {
    title: 'Next 3 months',
    count: 0,
    icon: CalendarIcon,
    color: 'from-amber-500 to-orange-600',
    hoverColor: 'hover:from-amber-600 hover:to-orange-700',
    shadowColor: 'shadow-amber-500/20',
    textGradient: 'bg-gradient-to-r from-amber-500 to-orange-600',
    iconGradient: 'bg-gradient-to-br from-amber-500/10 to-orange-600/10',
    borderColor: 'border-amber-100',
    vehicles: []
  },
  {
    title: 'Next 6 months',
    count: 0,
    icon: ShieldCheckIcon,
    color: 'from-blue-500 to-indigo-600',
    hoverColor: 'hover:from-blue-600 hover:to-indigo-700',
    shadowColor: 'shadow-blue-500/20',
    textGradient: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    iconGradient: 'bg-gradient-to-br from-blue-500/10 to-indigo-600/10',
    borderColor: 'border-blue-100',
    vehicles: []
  },
  {
    title: 'Next 12 months',
    count: 0,
    icon: DocumentCheckIcon,
    color: 'from-emerald-500 to-teal-600',
    hoverColor: 'hover:from-emerald-600 hover:to-teal-700',
    shadowColor: 'shadow-emerald-500/20',
    textGradient: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    iconGradient: 'bg-gradient-to-br from-emerald-500/10 to-teal-600/10',
    borderColor: 'border-emerald-100',
    vehicles: []
  }
];

// Date utility functions
const parseDate = (dateStr: string): Date => {
  if (!dateStr || dateStr === 'Not available') return new Date(8640000000000000); // Far future date
  
  try {
    // Handle DD-MM-YYYY format (common in the application)
    const dashRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
    const dashMatch = dateStr.match(dashRegex);
    if (dashMatch) {
      const day = parseInt(dashMatch[1]);
      const month = parseInt(dashMatch[2]) - 1; // JS months are 0-indexed
      const year = parseInt(dashMatch[3]);
      const date = new Date(year, month, day);
      // Check if valid date (handles cases like 31-02-2023)
      if (!isNaN(date.getTime()) && date.getDate() === day) {
        return date;
      }
    }
    
    // Handle DD/MM/YYYY format
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

    // Try standard date parsing as fallback
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  } catch (error) {
    console.error("Error parsing date:", error);
  }
  
  // Return far future date as fallback
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

// Function to check if date is in a time range
const isDateInRange = (dateStr: string, days: number): boolean => {
  if (!dateStr || dateStr === 'Not available') return false;
  const diff = getDaysDifference(dateStr);
  return diff >= 0 && diff <= days;
};

// Function to get the earliest expiry date for a vehicle
const getEarliestExpiryDate = (vehicle: Vehicle): string => {
  const dates = [
    vehicle.roadTax,
    vehicle.fitness,
    vehicle.insurance,
    vehicle.pollution,
    vehicle.statePermit !== 'Not available' ? vehicle.statePermit : '',
    vehicle.nationalPermit !== 'Not available' ? vehicle.nationalPermit : ''
  ].filter(date => date && date !== 'Not available');
  
  if (dates.length === 0) return '';
  
  return dates.reduce((earliest, current) => {
    if (!earliest) return current;
    return getDaysDifference(current) < getDaysDifference(earliest) ? current : earliest;
  }, '');
};

// Calculate if vehicle has any document expiring in given range
const isVehicleExpiringInRange = (vehicle: Vehicle, days: number): boolean => {
  return [
    vehicle.roadTax,
    vehicle.fitness,
    vehicle.insurance,
    vehicle.pollution,
    vehicle.statePermit,
    vehicle.nationalPermit
  ].some(date => isDateInRange(date, days));
};

// Get all documents for a vehicle with their expiry status
const getVehicleDocuments = (vehicle: Vehicle): Document[] => {
  return [
    { type: 'Road Tax', status: isDateInRange(vehicle.roadTax, 30) ? 'Expiring Soon' : 'Valid', expiry: vehicle.roadTax, lastUpdated: vehicle.lastUpdated },
    { type: 'Fitness', status: isDateInRange(vehicle.fitness, 30) ? 'Expiring Soon' : 'Valid', expiry: vehicle.fitness, lastUpdated: vehicle.lastUpdated },
    { type: 'Insurance', status: isDateInRange(vehicle.insurance, 30) ? 'Expiring Soon' : 'Valid', expiry: vehicle.insurance, lastUpdated: vehicle.lastUpdated },
    { type: 'Pollution', status: isDateInRange(vehicle.pollution, 30) ? 'Expiring Soon' : 'Valid', expiry: vehicle.pollution, lastUpdated: vehicle.lastUpdated },
    { type: 'State Permit', status: vehicle.statePermit === 'Not available' ? 'Not Available' : (isDateInRange(vehicle.statePermit, 30) ? 'Expiring Soon' : 'Valid'), expiry: vehicle.statePermit, lastUpdated: vehicle.lastUpdated },
    { type: 'National Permit', status: vehicle.nationalPermit === 'Not available' ? 'Not Available' : (isDateInRange(vehicle.nationalPermit, 30) ? 'Expiring Soon' : 'Valid'), expiry: vehicle.nationalPermit, lastUpdated: vehicle.lastUpdated }
  ];
};

export default function RenewalsPage() {
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Vehicle | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>(initialSummaryCards);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [viewingVehicles, setViewingVehicles] = useState<Vehicle[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignIdSelected, setAssignIdSelected] = useState<number | null>(null);
  const [documentsList, setDocumentsList] = useState<VehicleDocument[]>([]);
  
  // Function to update summary cards with vehicle data
  const updateSummaryCards = useCallback((vehiclesData: Vehicle[]) => {
    // Process data for summary cards
    const next30Days = vehiclesData.filter((v: Vehicle) => isVehicleExpiringInRange(v, 30));
    const next3Months = vehiclesData.filter((v: Vehicle) => isVehicleExpiringInRange(v, 90));
    const next6Months = vehiclesData.filter((v: Vehicle) => isVehicleExpiringInRange(v, 180));
    const next12Months = vehiclesData.filter((v: Vehicle) => isVehicleExpiringInRange(v, 365));
    
    setSummaryCards([
      {...initialSummaryCards[0], count: next30Days.length, vehicles: next30Days},
      {...initialSummaryCards[1], count: next3Months.length, vehicles: next3Months},
      {...initialSummaryCards[2], count: next6Months.length, vehicles: next6Months},
      {...initialSummaryCards[3], count: next12Months.length, vehicles: next12Months}
    ]);
  }, []);
  
  // Handle manual refresh of data
  const handleRefresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch data from the user vehicles API
      const response = await fetch('/api/vehicles/user', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: Failed to fetch vehicles`);
      }
      
      const data = await response.json();
      
      setVehicles(data);
      setFilteredVehicles(data);
      
      // Update the summary cards with the new data
      updateSummaryCards(data);
      
      toast.success('Vehicle data refreshed successfully');
    } catch (err: any) {
      console.error('Error refreshing vehicles:', err);
      setError('Failed to refresh vehicle data. Please try again.');
      toast.error('Failed to refresh vehicle data');
    } finally {
      setIsLoading(false);
    }
  }, [updateSummaryCards]);
  
  // Fetch vehicles data from API
  useEffect(() => {
    const fetchVehicles = async (retryCount = 0) => {
      if (!session?.user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch data from the user vehicles API
        const response = await fetch('/api/vehicles/user', {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Error ${response.status}: Failed to fetch vehicles`);
        }
        
        const data = await response.json();
        console.log('Fetched vehicles:', data);
        
        setVehicles(data);
        setFilteredVehicles(data);
        
        // Update the summary cards with the new data
        updateSummaryCards(data);
        
      } catch (err: any) {
        console.error('Error fetching vehicles:', err);
        
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.log(`Retrying in ${delay}ms (attempt ${retryCount + 1}/3)`);
          
          setTimeout(() => {
            fetchVehicles(retryCount + 1);
          }, delay);
        } else {
          setError('Failed to load vehicles. Please try again.');
        }
      } finally {
        if (retryCount === 0) {
          setIsLoading(false);
        }
      }
    };
    
    fetchVehicles();
  }, [session, updateSummaryCards]);
  
  // Fetch vehicles from API on component mount
  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);
  
  // Handle view details click on a period card
  const handleViewDetails = (period: string) => {
    const periodMap = {
      'Next 30 Days': 0,
      'Next 3 months': 1,
      'Next 6 months': 2,
      'Next 12 months': 3
    };
    
    const index = periodMap[period as keyof typeof periodMap];
    if (index !== undefined) {
      setSelectedPeriod(period);
      setViewingVehicles(summaryCards[index].vehicles);
    }
  };
  
  // Handle sorting
  const handleSort = (field: string) => {
    const newOrder = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field as keyof Vehicle);
    setSortDirection(newOrder);
    
    // Apply sorting if we're viewing specific period's vehicles
    if (selectedPeriod) {
      const sorted = [...viewingVehicles].sort((a, b) => {
        let aValue = a[field as keyof Vehicle] || '';
        let bValue = b[field as keyof Vehicle] || '';
        
        if (field === 'vrn') {
          const aStr = String(aValue || '');
          const bStr = String(bValue || '');
          return sortDirection === 'asc' 
            ? aStr.localeCompare(bStr) 
            : bStr.localeCompare(aStr);
        }
        
        // For date fields, convert to Date objects for comparison
        if (['roadTax', 'fitness', 'insurance', 'pollution', 'statePermit', 'nationalPermit'].includes(field)) {
          const dateA = parseDate(aValue as string);
          const dateB = parseDate(bValue as string);
          return sortDirection === 'asc' 
            ? dateA.getTime() - dateB.getTime() 
            : dateB.getTime() - dateA.getTime();
        }
        
        return 0;
      });
      
      setViewingVehicles(sorted);
    }
  };
  
  // Handle assign to user
  const handleAssign = (id: number) => {
    setAssignIdSelected(id);
    setShowAssignModal(true);
  };
  
  // Get sort icon based on current sort state
  const getSortIcon = (field: string) => {
    if (field !== sortField) {
      return <ArrowsUpDownIcon className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronRightIcon className="h-4 w-4 transform rotate-90 text-blue-500" /> : 
      <ChevronRightIcon className="h-4 w-4 transform -rotate-90 text-blue-500" />;
  };
  
  // Component for renewal card with vehicle details
  const RenewalCard = ({ data }: { data: Vehicle }) => {
    const documents = getVehicleDocuments(data);
    const expiringDocs = documents.filter(doc => doc.status === 'Expiring Soon');
    
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="p-5 border-b border-gray-100">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{data.vrn}</h3>
              <p className="text-sm text-gray-500">
                Registered at {data.registeredAt}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                expiringDocs.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
              }`}>
                {expiringDocs.length > 0 ? `${expiringDocs.length} Expiring Soon` : 'All Valid'}
              </span>
              <p className="text-xs text-gray-500 mt-1">Last updated: {data.lastUpdated}</p>
            </div>
          </div>
        </div>
        
        <div className="p-5">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Document Status</h4>
          <div className="space-y-2">
            {documents.map((doc, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{doc.type}</span>
                <div className="flex items-center">
                  <span 
                    className={`font-medium ${
                      doc.status === 'Expiring Soon' ? 'text-amber-600' : 
                      doc.status === 'Not Available' ? 'text-gray-400' : 'text-green-600'
                    }`}
                  >
                    {doc.expiry === 'Not available' ? 'N/A' : doc.expiry}
                  </span>
                  <span 
                    className={`ml-2 inline-block h-2 w-2 rounded-full ${
                      doc.status === 'Expiring Soon' ? 'bg-amber-500' : 
                      doc.status === 'Not Available' ? 'bg-gray-300' : 'bg-green-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="px-5 py-3 bg-gray-50 flex justify-between">
          <button
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
            onClick={() => handleAssign(data.id)}
          >
            <UserIcon className="h-3.5 w-3.5 mr-1" />
            Assign
          </button>
          <button className="text-xs text-gray-600 hover:text-gray-800 font-medium flex items-center">
            <EyeIcon className="h-3.5 w-3.5 mr-1" />
            Details
          </button>
        </div>
      </div>
    );
  };

  // Render summary cards
  const renderSummaryCards = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {summaryCards.map((card, index) => (
          <div 
            key={index}
            className={`bg-white border ${card.borderColor} rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow duration-300`}
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${card.iconGradient}`}>
                  <card.icon className={`h-6 w-6 ${card.textGradient} bg-clip-text text-transparent`} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <h3 className={`text-2xl font-bold ${card.textGradient} bg-clip-text text-transparent`}>
                    {card.count}
                  </h3>
                </div>
              </div>
              
              <button
                onClick={() => handleViewDetails(card.title)}
                className={`w-full py-2 px-3 text-sm rounded-lg bg-gradient-to-r ${card.color} ${card.hoverColor} text-white font-medium flex items-center justify-center shadow-sm ${card.shadowColor} transition-all duration-300`}
              >
                View Details
                <ArrowRightIcon className="h-4 w-4 ml-1.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Back to summary view
  const handleBackToSummary = () => {
    setSelectedPeriod(null);
  };

  // Create a flattened list of all documents for table view
  useEffect(() => {
    if (viewingVehicles.length > 0) {
      const docs: VehicleDocument[] = [];
      
      viewingVehicles.forEach(vehicle => {
        const documents = getVehicleDocuments(vehicle);
        documents.forEach(doc => {
          if (doc.expiry !== 'Not available') {
            docs.push({
              vehicleId: vehicle.id,
              vrn: vehicle.vrn,
              owner: vehicle.owner?.name || 'Unknown',
              docType: doc.type,
              expiry: doc.expiry,
              status: doc.status
            });
          }
        });
      });
      
      // Sort by expiry date
      docs.sort((a, b) => {
        return getDaysDifference(a.expiry) - getDaysDifference(b.expiry);
      });
      
      setDocumentsList(docs);
    }
  }, [viewingVehicles]);
  
  // Pagination calculations for table view
  const indexOfLastDoc = currentPage * rowsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - rowsPerPage;
  const currentDocs = documentsList.filter(doc => doc.vrn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                              doc.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                              doc.docType.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .slice(indexOfFirstDoc, indexOfLastDoc);
  const totalPages = Math.ceil(documentsList.filter(doc => doc.vrn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                   doc.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                   doc.docType.toLowerCase().includes(searchQuery.toLowerCase()))
                                         .length / rowsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Expiring Soon':
        return 'text-amber-600';
      case 'Expired':
        return 'text-red-600';
      case 'Not Available':
        return 'text-gray-400';
      default:
        return 'text-green-600';
    }
  };
  
  // Render table view
  const renderTableView = () => {
    return (
      <div className="overflow-x-auto table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">VRN</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Document Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Expiry Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentDocs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No documents found matching your search criteria
                </td>
              </tr>
            ) : (
              currentDocs.map((doc, index) => (
                <tr key={`${doc.vehicleId}-${doc.docType}`} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {doc.vrn}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {doc.owner}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {doc.docType}
                  </td>
                  <td className={`px-4 py-4 text-sm font-medium ${getStatusColor(doc.status)} whitespace-nowrap`}>
                    {doc.expiry}
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      doc.status === 'Expiring Soon' ? 'bg-amber-100 text-amber-800' : 
                      doc.status === 'Expired' ? 'bg-red-100 text-red-800' :
                      doc.status === 'Not Available' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => {
                        const vehicle = viewingVehicles.find(v => v.id === doc.vehicleId);
                        if (vehicle) {
                          handleAssign(vehicle.id);
                        }
                      }}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {documentsList.length > 0 && (
          <div className="px-4 py-3 bg-white border-t border-gray-200 sm:px-6 flex items-center justify-between">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstDoc + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastDoc, documentsList.filter(doc => 
                    doc.vrn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    doc.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    doc.docType.toLowerCase().includes(searchQuery.toLowerCase()))
                                         .length)}
                </span> of{' '}
                <span className="font-medium">
                  {documentsList.filter(doc => 
                    doc.vrn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    doc.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    doc.docType.toLowerCase().includes(searchQuery.toLowerCase()))
                                         .length}
                </span> results
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
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-5 w-5 mr-1" />
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    );
  };

  // After refreshing data, update the selected period view
  useEffect(() => {
    if (selectedPeriod) {
      const periodMap: {[key: string]: number} = {
        'Next 30 Days': 0,
        'Next 3 months': 1,
        'Next 6 months': 2,
        'Next 12 months': 3
      };
      const index = periodMap[selectedPeriod];
      if (index !== undefined && summaryCards[index]) {
        setViewingVehicles(summaryCards[index].vehicles);
      }
    }
  }, [summaryCards, selectedPeriod]);

  return (
    <div className="px-6 py-5 max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Renewals Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all your upcoming vehicle document renewals</p>
        </div>
        <button 
          onClick={handleRefresh} 
          disabled={isLoading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <ArrowPathIcon className={`-ml-0.5 mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {/* Summary section or Detail view */}
      {!selectedPeriod ? (
        <>
          {/* Summary Cards */}
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          ) : (
            renderSummaryCards()
          )}
          
          {/* Recent Expiring Vehicles */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Vehicles Expiring Soon</h2>
              <p className="text-sm text-gray-500 mt-1">Vehicles with documents expiring in the next 30 days</p>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : summaryCards[0].vehicles.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No vehicles with documents expiring in the next 30 days.
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {summaryCards[0].vehicles.slice(0, 6).map((vehicle) => (
                  <RenewalCard key={vehicle.id} data={vehicle} />
                ))}
              </div>
            )}
            
            {summaryCards[0].vehicles.length > 6 && (
              <div className="px-6 py-4 bg-gray-50 text-center">
                <button 
                  onClick={() => handleViewDetails('Next 30 Days')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all {summaryCards[0].vehicles.length} vehicles
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        // Detailed period view
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <button 
                onClick={handleBackToSummary}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium mb-2"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Back to Summary
              </button>
              <h2 className="text-lg font-semibold text-gray-900">{selectedPeriod} Renewals</h2>
              <p className="text-sm text-gray-500 mt-1">
                {viewingVehicles.length} vehicles with documents expiring in this period
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  className="px-3 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
              
              <div className="flex border border-gray-300 rounded-lg">
                <button 
                  className={`p-2 transition-colors ${viewMode === 'cards' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setViewMode('cards')}
                  title="Card View"
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button 
                  className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setViewMode('table')}
                  title="Table View"
                >
                  <TableCellsIcon className="h-4 w-4" />
                </button>
              </div>
              
              <button className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg">
                <FunnelIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="px-6 py-4">
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {viewingVehicles
                    .filter(v => v.vrn.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((vehicle) => (
                      <RenewalCard key={vehicle.id} data={vehicle} />
                    ))}
                </div>
              ) : (
                renderTableView()
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Assign Vehicle</h3>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to User
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select a user</option>
                <option value="user1">John Doe</option>
                <option value="user2">Jane Smith</option>
                <option value="user3">Robert Johnson</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Assign implementation would go here
                  setShowAssignModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}