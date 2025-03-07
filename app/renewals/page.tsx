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
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  UserIcon
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

// Extended demo data for renewals table
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
    assignedTo: 'John Doe',
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
  {
    id: 2,
    vrn: 'RJ09GB9450',
    roadTax: '15-05-2025',
    fitness: '18-09-2025',
    insurance: '22-08-2025',
    pollution: '10-04-2025',
    statePermit: '05-06-2025',
    nationalPermit: 'Not available',
    lastUpdated: '25-01-2025',
    assignedTo: 'Jane Smith',
    vehicleDetails: {
      make: 'Maruti',
      model: 'Swift',
      year: '2023',
      engineNo: 'MSZ5F7654321',
      chassisNo: 'MSLA751BLJM654321',
      registeredAt: 'RTO Delhi',
      owner: 'Jane Smith',
      address: '456 Park Avenue, Delhi'
    },
    documents: [
      { type: 'Road Tax', status: 'Valid', expiry: '15-05-2025', lastUpdated: '15-05-2024' },
      { type: 'Fitness', status: 'Valid', expiry: '18-09-2025', lastUpdated: '18-09-2023' },
      { type: 'Insurance', status: 'Valid', expiry: '22-08-2025', lastUpdated: '22-08-2023' },
      { type: 'Pollution', status: 'Valid', expiry: '10-04-2025', lastUpdated: '10-04-2024' },
      { type: 'State Permit', status: 'Valid', expiry: '05-06-2025', lastUpdated: '05-06-2023' },
      { type: 'National Permit', status: 'Not Available', expiry: '-', lastUpdated: '-' }
    ]
  },
  {
    id: 3,
    vrn: 'RJ09GB9451',
    roadTax: '20-07-2025',
    fitness: '12-10-2025',
    insurance: '30-09-2025',
    pollution: '15-05-2025',
    statePermit: '18-08-2025',
    nationalPermit: '22-12-2025',
    lastUpdated: '28-01-2025',
    assignedTo: 'Robert Johnson',
    vehicleDetails: {
      make: 'Honda',
      model: 'City',
      year: '2021',
      engineNo: 'HCZ7G9876543',
      chassisNo: 'HCLA651CLJM987654',
      registeredAt: 'RTO Bangalore',
      owner: 'Robert Johnson',
      address: '789 Lake View, Bangalore'
    },
    documents: [
      { type: 'Road Tax', status: 'Valid', expiry: '20-07-2025', lastUpdated: '20-07-2024' },
      { type: 'Fitness', status: 'Valid', expiry: '12-10-2025', lastUpdated: '12-10-2023' },
      { type: 'Insurance', status: 'Valid', expiry: '30-09-2025', lastUpdated: '30-09-2023' },
      { type: 'Pollution', status: 'Valid', expiry: '15-05-2025', lastUpdated: '15-05-2024' },
      { type: 'State Permit', status: 'Valid', expiry: '18-08-2025', lastUpdated: '18-08-2023' },
      { type: 'National Permit', status: 'Valid', expiry: '22-12-2025', lastUpdated: '22-12-2023' }
    ]
  },
  {
    id: 4,
    vrn: 'RJ09GB9452',
    roadTax: '25-04-2025',
    fitness: '28-08-2025',
    insurance: '05-07-2025',
    pollution: '12-03-2025',
    statePermit: 'Not available',
    nationalPermit: '08-10-2025',
    lastUpdated: '30-01-2025',
    assignedTo: 'Emily Davis',
    vehicleDetails: {
      make: 'Hyundai',
      model: 'Creta',
      year: '2022',
      engineNo: 'HYZ9H1234567',
      chassisNo: 'HYLA551DLJM123456',
      registeredAt: 'RTO Chennai',
      owner: 'Emily Davis',
      address: '101 Beach Road, Chennai'
    },
    documents: [
      { type: 'Road Tax', status: 'Valid', expiry: '25-04-2025', lastUpdated: '25-04-2024' },
      { type: 'Fitness', status: 'Valid', expiry: '28-08-2025', lastUpdated: '28-08-2023' },
      { type: 'Insurance', status: 'Valid', expiry: '05-07-2025', lastUpdated: '05-07-2023' },
      { type: 'Pollution', status: 'Valid', expiry: '12-03-2025', lastUpdated: '12-03-2024' },
      { type: 'State Permit', status: 'Not Available', expiry: '-', lastUpdated: '-' },
      { type: 'National Permit', status: 'Valid', expiry: '08-10-2025', lastUpdated: '08-10-2023' }
    ]
  },
  {
    id: 5,
    vrn: 'RJ09GB9454',
    roadTax: '10-06-2025',
    fitness: '15-12-2025',
    insurance: '20-11-2025',
    pollution: '25-02-2025',
    statePermit: '30-07-2025',
    nationalPermit: 'Not available',
    lastUpdated: '02-02-2025',
    assignedTo: 'Michael Wilson',
    vehicleDetails: {
      make: 'Tata',
      model: 'Nexon',
      year: '2023',
      engineNo: 'TNZ1J7654321',
      chassisNo: 'TNLA451ELJM654321',
      registeredAt: 'RTO Kolkata',
      owner: 'Michael Wilson',
      address: '202 River View, Kolkata'
    },
    documents: [
      { type: 'Road Tax', status: 'Valid', expiry: '10-06-2025', lastUpdated: '10-06-2024' },
      { type: 'Fitness', status: 'Valid', expiry: '15-12-2025', lastUpdated: '15-12-2023' },
      { type: 'Insurance', status: 'Valid', expiry: '20-11-2025', lastUpdated: '20-11-2023' },
      { type: 'Pollution', status: 'Valid', expiry: '25-02-2025', lastUpdated: '25-02-2024' },
      { type: 'State Permit', status: 'Valid', expiry: '30-07-2025', lastUpdated: '30-07-2023' },
      { type: 'National Permit', status: 'Not Available', expiry: '-', lastUpdated: '-' }
    ]
  }
];

export default function RenewalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<typeof renewalData[0] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  // Calculate pagination
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  
  // Filter and sort data
  const filteredData = renewalData.filter(item => 
    item.vrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort data if sortField is set
  const sortedData = sortField 
    ? [...filteredData].sort((a, b) => {
        // @ts-ignore - dynamic access
        const aValue = a[sortField] || '';
        // @ts-ignore - dynamic access
        const bValue = b[sortField] || '';
        
        if (aValue === 'Not available' && bValue !== 'Not available') return sortDirection === 'asc' ? 1 : -1;
        if (aValue !== 'Not available' && bValue === 'Not available') return sortDirection === 'asc' ? -1 : 1;
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      })
    : filteredData;
  
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handleViewDetails = (period: string) => {
    setSelectedPeriod(period);
    setShowDetailsModal(true);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAssign = (id: number) => {
    setSelectedVehicleId(id);
    setShowAssignModal(true);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />;
    return sortDirection === 'asc' 
      ? <ChevronLeftIcon className="w-4 h-4 text-blue-500 rotate-90" />
      : <ChevronLeftIcon className="w-4 h-4 text-blue-500 -rotate-90" />;
  };

  const RenewalCard = ({ data }: { data: typeof renewalData[0] }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-medium text-gray-900">{data.vrn}</span>
        <span className="text-sm text-gray-500">#{data.id}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Road Tax:</span>
          <span className="ml-2 font-medium text-green-600">{data.roadTax}</span>
        </div>
        <div>
          <span className="text-gray-500">Fitness:</span>
          <span className="ml-2 font-medium text-green-600">{data.fitness}</span>
        </div>
        <div>
          <span className="text-gray-500">Insurance:</span>
          <span className="ml-2 font-medium text-green-600">{data.insurance}</span>
        </div>
        <div>
          <span className="text-gray-500">Pollution:</span>
          <span className="ml-2 font-medium text-green-600">{data.pollution}</span>
        </div>
      </div>
      <div className="flex justify-between items-center pt-2 border-t">
        <div className="text-xs text-gray-500">Last Updated: {data.lastUpdated}</div>
        <div className="flex space-x-2">
          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
            <ArrowPathIcon className="w-5 h-5" />
          </button>
          <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
            <CloudArrowUpIcon className="w-5 h-5" />
          </button>
          <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors">
            <TrashIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              setSelectedVehicle(data);
              setShowDetailsModal(true);
            }}
            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 lg:p-6 space-y-6">
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

        {/* Table Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search by VRN or assignee..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center space-x-2 hover:bg-gray-50">
                <FunnelIcon className="w-5 h-5 text-gray-500" />
                <span>Filter</span>
              </button>
            </div>
            
            <select 
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={5}>5 rows</option>
              <option value={10}>10 rows</option>
              <option value={20}>20 rows</option>
              <option value={50}>50 rows</option>
            </select>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <CloudArrowUpIcon className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Renewals Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('id')}>
                      S.No {getSortIcon('id')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('vrn')}>
                      VRN {getSortIcon('vrn')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('roadTax')}>
                      Road Tax {getSortIcon('roadTax')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('fitness')}>
                      Fitness {getSortIcon('fitness')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('insurance')}>
                      Insurance {getSortIcon('insurance')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('pollution')}>
                      Pollution {getSortIcon('pollution')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('statePermit')}>
                      State Permit {getSortIcon('statePermit')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('nationalPermit')}>
                      National Permit {getSortIcon('nationalPermit')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center justify-center cursor-pointer" onClick={() => handleSort('assignedTo')}>
                      Assign {getSortIcon('assignedTo')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('lastUpdated')}>
                      Last Updated {getSortIcon('lastUpdated')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Update
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Upload
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-800">{item.vrn.substring(0, 2)}</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{item.vrn}</div>
                          <div className="text-xs text-gray-500">{item.vehicleDetails.make} {item.vehicleDetails.model}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {item.roadTax}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {item.fitness}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {item.insurance}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {item.pollution}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={item.statePermit === 'Not available' ? 'text-red-500' : 'text-green-600'}>
                        {item.statePermit}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={item.nationalPermit === 'Not available' ? 'text-red-500' : 'text-green-600'}>
                        {item.nationalPermit}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={() => handleAssign(item.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <UserIcon className="w-4 h-4 mr-1 text-gray-500" />
                        {item.assignedTo}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.lastUpdated}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                        <ArrowPathIcon className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                        <CloudArrowUpIcon className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={13} className="px-4 py-8 text-center text-gray-500">
                      No renewals found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-4 py-3 bg-white border-t border-gray-200 sm:px-6 flex items-center justify-between">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredData.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredData.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">First</span>
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = currentPage <= 3
                      ? i + 1
                      : currentPage >= totalPages - 2
                        ? totalPages - 4 + i
                        : currentPage - 2 + i;
                    
                    if (pageNumber <= 0 || pageNumber > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Last</span>
                    <ChevronRightIcon className="h-5 w-5 mr-1" />
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Mobile pagination */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <div className="mx-4">
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
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

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Assign Vehicle
                </h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                    Assign to
                  </label>
                  <select
                    id="assignee"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    defaultValue=""
                  >
                    <option value="" disabled>Select an assignee</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Jane Smith">Jane Smith</option>
                    <option value="Robert Johnson">Robert Johnson</option>
                    <option value="Emily Davis">Emily Davis</option>
                    <option value="Michael Wilson">Michael Wilson</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any additional notes..."
                  ></textarea>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle assignment logic here
                    setShowAssignModal(false);
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}