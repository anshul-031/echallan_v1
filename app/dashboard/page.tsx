// 'use client';

// import { useState, useCallback } from 'react';
// import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
// } from '../components/ui/dropdown-menu';
// import { utils as xlsxUtils, writeFile } from 'xlsx';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import { Toaster, toast } from 'react-hot-toast';
// import {
//   MagnifyingGlassIcon,
//   ArrowPathIcon,
//   EyeIcon,
//   TrashIcon,
//   ChevronDownIcon,
//   DocumentArrowDownIcon,
//   DocumentTextIcon,
//   ArrowRightIcon,
//   CloudArrowUpIcon,
//   ChartBarIcon,
//   ClockIcon,
//   DocumentChartBarIcon,
//   XMarkIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon
// } from '@heroicons/react/24/outline';
// import LiveDataPanel from '../components/LiveDataPanel';
// import DocumentModal from '../components/DocumentModal';

// // Extended demo data
// interface Vehicle {
//   id: number;
//   vrn: string;
//   roadTax: string;
//   fitness: string;
//   insurance: string;
//   pollution: string;
//   statePermit: string;
//   nationalPermit: string;
//   lastUpdated: string;
//   status: string;
//   owner: string;
//   registeredAt: string;
//   documents: number;
// }

// const initialVehicles: Vehicle[] = Array.from({ length: 15 }, (_, index) => ({
//   id: index + 1,
//   vrn: `RJ09GB${9453 + index}`,
//   roadTax: '30-11-2025',
//   fitness: '06-12-2026',
//   insurance: '02-12-2025',
//   pollution: '02-01-2026',
//   statePermit: 'Not available',
//   nationalPermit: '01-11-2025',
//   lastUpdated: new Date().toLocaleDateString('en-GB', {
//     day: '2-digit',
//     month: '2-digit',
//     year: 'numeric'
//   }).replace(/\//g, '-'),
//   status: 'Active',
//   owner: 'John Doe',
//   registeredAt: 'Mumbai RTO',
//   documents: 5
// }));

// const getSummaryCards = (vehicles: Vehicle[]) => [
//   {
//     title: 'TOTAL VEHICLES',
//     count: vehicles.length.toString(),
//     color: 'from-blue-500 to-blue-600',
//     glowColor: 'blue',
//     icon: ChartBarIcon,
//     details: [
//       {
//         label: 'Active Vehicles',
//         value: vehicles.filter((v: Vehicle) => v.status === 'Active').length.toString()
//       },
//       { label: 'Inactive Vehicles', value: '0' },
//       { label: 'Under Maintenance', value: '0' }
//     ]
//   },
//   {
//     title: 'EXPIRING DOCUMENTS',
//     count: vehicles.length.toString(),
//     color: 'from-amber-500 to-amber-600',
//     glowColor: 'amber',
//     icon: ClockIcon,
//     details: [
//       { label: 'Road Tax', value: vehicles.length.toString() },
//       { label: 'Insurance', value: vehicles.length.toString() },
//       { label: 'Fitness', value: vehicles.length.toString() }
//     ]
//   },
//   {
//     title: 'EXPIRED DOCUMENTS',
//     count: '0',
//     color: 'from-red-500 to-red-600',
//     glowColor: 'red',
//     icon: DocumentChartBarIcon,
//     details: [
//       { label: 'Insurance', value: '0' },
//       { label: 'Road Tax', value: '0' },
//       { label: 'Fitness Certificate', value: '0' }
//     ]
//   }
// ];
// export default function Dashboard() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
//   const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>(initialVehicles);
//   const [isSearching, setIsSearching] = useState(false);
//   const [searchError, setSearchError] = useState<string | null>(null);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [hoveredCard, setHoveredCard] = useState<number | null>(null);
//   const [expandedCard, setExpandedCard] = useState<number | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedVRN, setSelectedVRN] = useState<string>('');
//   const [isExporting, setIsExporting] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null);
//   const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);

//   const [updatingRows, setUpdatingRows] = useState<{ [key: number]: boolean }>({});

//   const handleDelete = (id: number) => {
//     setVehicleToDelete(id);
//     setIsDeleteModalOpen(true);
//   };

//   const handleUpdate = async (row: Vehicle) => {
//     try {
//       setUpdatingRows(prev => ({ ...prev, [row.id]: true }));

//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 1000));

//       // Generate random dates for demonstration
//       const getRandomDate = () => {
//         const date = new Date();
//         date.setDate(date.getDate() + Math.floor(Math.random() * 365 * 2)); // Random date within 2 years
//         const day = String(date.getDate()).padStart(2, '0');
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const year = date.getFullYear();
//         return `${day}-${month}-${year}`;
//       };

//       const updatedVehicle = {
//         ...row,
//         roadTax: getRandomDate(),
//         fitness: getRandomDate(),
//         insurance: getRandomDate(),
//         pollution: getRandomDate(),
//         lastUpdated: new Date().toLocaleDateString('en-GB', {
//           day: '2-digit',
//           month: '2-digit',
//           year: 'numeric'
//         }).replace(/\//g, '-')
//       };

//       setVehicles(prevVehicles =>
//         prevVehicles.map(v => v.id === row.id ? updatedVehicle : v)
//       );
//       setFilteredVehicles(prevFiltered =>
//         prevFiltered.map(v => v.id === row.id ? updatedVehicle : v)
//       );

//       toast.success('Vehicle data updated successfully');
//     } catch (error) {
//       toast.error('Failed to update vehicle data');
//     } finally {
//       setUpdatingRows(prev => ({ ...prev, [row.id]: false }));
//     }
//   };

//   const confirmDelete = async () => {
//     if (!vehicleToDelete) return;

//     try {
//       setIsDeletingVehicle(true);
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 1000));

//       // Update the vehicles list
//       const updatedVehicles = vehicles.filter(v => v.id !== vehicleToDelete);
//       setVehicles(updatedVehicles);
//       setFilteredVehicles(prevFiltered =>
//         prevFiltered.filter(v => v.id !== vehicleToDelete)
//       );

//       setIsDeleteModalOpen(false);
//       setVehicleToDelete(null);
//       await new Promise(resolve => setTimeout(resolve, 100)); // Small delay before showing toast
//       toast.success('Record deleted successfully');
//     } catch (error) {
//       toast.error('Failed to delete the record');
//     } finally {
//       setIsDeletingVehicle(false);
//     }
//   };

//   // Define type for export data
//   type ExportData = {
//     'S.no': number;
//     'VRN': string;
//     'Road Tax': string;
//     'Fitness': string;
//     'Insurance': string;
//     'Pollution': string;
//     'State Permit': string;
//     'National Permit': string;
//     'Last Updated': string;
//   };

//   // Function to prepare data for export
//   const prepareExportData = (data: typeof vehicles): ExportData[] => {
//     return data.map((vehicle, index) => ({
//       'S.no': index + 1,
//       'VRN': vehicle.vrn,
//       'Road Tax': vehicle.roadTax,
//       'Fitness': vehicle.fitness,
//       'Insurance': vehicle.insurance,
//       'Pollution': vehicle.pollution,
//       'State Permit': vehicle.statePermit,
//       'National Permit': vehicle.nationalPermit,
//       'Last Updated': vehicle.lastUpdated
//     }));
//   };

//   const handleExport = async (format: 'current-excel' | 'all-excel' | 'pdf') => {
//     try {
//       setIsExporting(true);

//       const data = format === 'current-excel' ? currentVehicles : vehicles;
//       const exportData = prepareExportData(data);

//       if (format === 'current-excel' || format === 'all-excel') {
//         const worksheet = xlsxUtils.json_to_sheet(exportData);
//         const workbook = xlsxUtils.book_new();
//         xlsxUtils.book_append_sheet(workbook, worksheet, 'Fleet Data');

//         // Auto-size columns
//         const colWidths = Object.keys(exportData[0]).map(key => ({
//           wch: Math.max(key.length, ...exportData.map(row => String(row[key as keyof ExportData]).length))
//         }));
//         worksheet['!cols'] = colWidths;

//         const fileName = format === 'current-excel' ? 'current-fleet-data.xlsx' : 'all-fleet-data.xlsx';
//         writeFile(workbook, fileName);
//         toast.success(`${format === 'current-excel' ? 'Current' : 'All'} data exported to Excel successfully`);
//       } else {
//         // PDF Export
//         const doc = new jsPDF();
//         const tableHeaders = Object.keys(exportData[0]);
//         const tableData = exportData.map(row => Object.values(row));

//         autoTable(doc, {
//           head: [tableHeaders],
//           body: tableData,
//           styles: { fontSize: 8 },
//           headStyles: {
//             fillColor: [249, 250, 251],
//             textColor: [0, 0, 0],
//             fontSize: 8,
//             fontStyle: 'bold',
//           },
//           alternateRowStyles: { fillColor: [249, 250, 251] },
//           margin: { top: 20 },
//         });

//         doc.save('fleet-data.pdf');
//         toast.success('Data exported to PDF successfully');
//       }
//     } catch (error) {
//       console.error('Export error:', error);
//       toast.error('Failed to export data. Please try again.');
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   // Handle search
//   const handleSearch = useCallback(async () => {
//     if (!searchQuery.trim()) {
//       setFilteredVehicles(vehicles);
//       setSearchError(null);
//       return;
//     }

//     setIsSearching(true);
//     setSearchError(null);
//     setCurrentPage(1);

//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 1000));

//     const results = vehicles.filter(vehicle =>
//       vehicle.vrn.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     setFilteredVehicles(results);
//     if (results.length === 0) {
//       setSearchError('No results found');
//     }
//     setIsSearching(false);
//   }, [searchQuery]);

//   // Handle clear search
//   const handleClearSearch = () => {
//     setSearchQuery('');
//     setFilteredVehicles(vehicles);
//     setSearchError(null);
//     setCurrentPage(1);
//   };

//   // Calculate pagination
//   const totalPages = Math.ceil(filteredVehicles.length / rowsPerPage);
//   const startIndex = (currentPage - 1) * rowsPerPage;
//   const endIndex = startIndex + rowsPerPage;
//   const currentVehicles = filteredVehicles.slice(startIndex, endIndex);


//   return (
//     <div className="flex flex-col lg:flex-row min-h-screen overflow-y-auto lg:overflow-hidden">
//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         <div className="flex-1 flex flex-col p-3 lg:p-6 space-y-4">
//           {/* Header */}
//           <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Fleet Dashboard</h1>

//           {/* Summary Cards */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//             {getSummaryCards(vehicles).map((card, index) => (
//               <div
//                 key={card.title}
//                 className={`relative overflow-hidden rounded-lg transition-all duration-500 cursor-pointer
//                   ${expandedCard === index ? 'row-span-2' : 'row-span-1'}
//                   ${expandedCard === 0 ? (
//                     index === 0 ? 'lg:col-span-2 lg:row-span-2' :
//                       index === 1 ? 'lg:col-start-3 lg:col-span-1 lg:row-start-1 lg:row-span-1' :
//                         'lg:col-start-3 lg:col-span-1 lg:row-start-2 lg:row-span-1'
//                   ) : expandedCard === 1 ? (
//                     index === 0 ? 'lg:col-span-1 lg:row-span-1' :
//                       index === 1 ? 'lg:col-start-2 lg:col-span-2 lg:row-span-2' :
//                         'lg:col-start-1 lg:col-span-1 lg:row-start-2 lg:row-span-1'
//                   ) : expandedCard === 2 ? (
//                     index === 0 ? 'lg:col-span-1 lg:row-span-1' :
//                       index === 1 ? 'lg:col-start-1 lg:col-span-1 lg:row-start-2 lg:row-span-1' :
//                         'lg:col-start-2 lg:col-span-2 lg:row-span-2 lg:row-start-1'
//                   ) : (
//                     index === 0 ? 'lg:col-span-1 lg:row-span-1 lg:col-start-1' :
//                       index === 1 ? 'lg:col-span-1 lg:row-span-1 lg:col-start-2' :
//                         'lg:col-span-1 lg:row-span-1 lg:col-start-3'
//                   )}`}
//                 onMouseEnter={() => setHoveredCard(index)}
//                 onMouseLeave={() => setHoveredCard(null)}
//               >
//                 {/* Glow Effect */}
//                 <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0
//                   transition-opacity duration-300 blur-xl
//                   ${hoveredCard === index ? 'opacity-20' : ''}`}
//                 />

//                 {/* Card Content */}
//                 <div className={`relative bg-gradient-to-r ${card.color} p-2 lg:p-4 h-full
//                   transition-all duration-500
//                   ${hoveredCard === index ? 'shadow-md lg:shadow-lg shadow-' + card.glowColor + '-500/50' : ''}`}
//                 >
//                   <div className="flex items-start justify-between">
//                     <div>
//                       <div className="flex items-center space-x-1 lg:space-x-2">
//                         <card.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white/80" />
//                         <p className="text-white/80 text-xs lg:text-sm font-medium">{card.title}</p>
//                       </div>
//                       <p className="text-white text-xl lg:text-2xl font-bold mt-1">{card.count}</p>
//                     </div>
//                     <button
//                       onClick={() => setExpandedCard(expandedCard === index ? null : index)}
//                       className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 transform
//                         ${expandedCard === index ? 'rotate-180' : 'rotate-0'}
//                       `}
//                     >
//                       <ChevronDownIcon className="w-4 h-4 text-white" />
//                     </button>
//                   </div>

//                   {/* Expandable Content */}
//                   <div className={`mt-2 overflow-hidden transition-all duration-500 ease-in-out
//                     ${expandedCard === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
//                   >
//                     <div className="pt-1.5 lg:pt-2 border-t border-white/20">
//                       <div className="space-y-1 lg:space-y-2">
//                         {card.details.map((detail, idx) => (
//                           <div key={idx} className="flex justify-between items-center">
//                             <span className="text-white/80 text-xs lg:text-sm">{detail.label}</span>
//                             <span className="text-white text-xs lg:text-sm font-medium">{detail.value}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Table Controls */}
//           {searchError && (
//             <div className="text-center mb-4">
//               <span className="text-red-500">{searchError}</span>
//             </div>
//           )}

//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//             <div className="w-full md:w-64">
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Search Vehicle"
//                   className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   onKeyPress={(e) => {
//                     if (e.key === 'Enter') {
//                       handleSearch();
//                     }
//                   }}
//                 />
//                 <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 {searchQuery && (
//                   <button
//                     onClick={handleClearSearch}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
//                   >
//                     <XMarkIcon className="w-4 h-4 text-gray-400" />
//                   </button>
//                 )}
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               {/* Rows Dropdown */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center text-sm">
//                     {rowsPerPage} rows
//                     <ChevronDownIcon className="w-4 h-4 ml-2 opacity-50" />
//                   </button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent>
//                   {[5, 10, 20, 50].map((value) => (
//                     <DropdownMenuItem key={value} onClick={() => setRowsPerPage(value)}>
//                       {value} rows
//                     </DropdownMenuItem>
//                   ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               {/* Export Button with Dropdown */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <button
//                     disabled={isExporting}
//                     className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {isExporting ? (
//                       <>
//                         <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         Exporting...
//                       </>
//                     ) : (
//                       <>
//                         <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
//                         Export
//                       </>
//                     )}
//                     <ChevronDownIcon className="w-4 h-4 ml-2" />
//                   </button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="start" className="w-48">
//                   {['Current Excel', 'All Excel', 'PDF'].map((option) => (
//                     <DropdownMenuItem
//                       key={option}
//                       onClick={() => handleExport(option.toLowerCase().replace(' ', '-') as any)}
//                       className="flex items-center cursor-pointer text-sm"
//                     >
//                       <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
//                       {option}
//                     </DropdownMenuItem>
//                   ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>

//           {/* Table Container */}
//           <div className="bg-white rounded-lg shadow-sm overflow-hidden relative">
//             {isSearching && (
//               <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
//                 <div className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm">
//                   <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   <span className="text-gray-500">Fetching the results...</span>
//                 </div>
//               </div>
//             )}
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="w-12 px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">S.no</th>
//                     <th className="w-32 px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">VRN</th>
//                     <th className="w-28 px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Road tax</th>
//                     <th className="w-28 px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Fitness</th>
//                     <th className="w-28 px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Insurance</th>
//                     <th className="w-28 px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Pollution</th>
//                     <th className="w-28 px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Permit</th>
//                     <th className="w-32 px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">National Permit</th>
//                     <th className="w-28 px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Last Updated</th>
//                     <th className="w-16 px-2 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Update</th>
//                     <th className="w-16 px-2 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Upload</th>
//                     <th className="w-16 px-2 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Delete</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {currentVehicles.map((row) => (
//                     <tr key={row.id} className="hover:bg-gray-50">
//                       <td className="px-2 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-gray-500 whitespace-nowrap">{row.id}</td>
//                       <td className="px-2 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm font-medium text-gray-900 whitespace-nowrap">{row.vrn}</td>
//                       <td className="px-2 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-green-600 whitespace-nowrap">{row.roadTax}</td>
//                       <td className="px-2 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-green-600 whitespace-nowrap">{row.fitness}</td>
//                       <td className="px-2 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-green-600 whitespace-nowrap">{row.insurance}</td>
//                       <td className="px-2 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-green-600 whitespace-nowrap">{row.pollution}</td>
//                       <td className="px-2 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-red-500 whitespace-nowrap">{row.statePermit}</td>
//                       <td className="px-2 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-green-600 whitespace-nowrap">{row.nationalPermit}</td>
//                       <td className="px-2 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-gray-500 whitespace-nowrap">{row.lastUpdated}</td>
//                       <td className="px-4 py-4 text-center">
//                         <button
//                           onClick={() => handleUpdate(row)}
//                           disabled={updatingRows[row.id]}
//                           className={`p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors ${updatingRows[row.id] ? 'bg-blue-50' : ''
//                             }`}
//                         >
//                           <ArrowPathIcon className={`w-5 h-5 ${updatingRows[row.id] ? 'animate-spin' : ''
//                             }`} />
//                         </button>
//                       </td>
//                       <td className="px-4 py-4 text-center">
//                         <button
//                           onClick={() => {
//                             setSelectedVRN(row.vrn);
//                             setIsModalOpen(true);
//                           }}
//                           className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
//                         >
//                           <CloudArrowUpIcon className="w-5 h-5" />
//                         </button>
//                       </td>
//                       <td className="px-4 py-4 text-center">
//                         <button
//                           onClick={() => handleDelete(row.id)}
//                           disabled={isDeletingVehicle}
//                           className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed"
//                         >
//                           <TrashIcon className="w-5 h-5" />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                   {currentVehicles.length === 0 && (
//                     <tr>
//                       <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
//                         {searchError || 'No vehicles found'}
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             <div className="px-4 py-3 bg-white border-t border-gray-200 sm:px-6 flex items-center justify-between">
//               <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
//                 <div>
//                   <p className="text-sm text-gray-700">
//                     Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
//                     <span className="font-medium">
//                       {Math.min(endIndex, filteredVehicles.length)}
//                     </span>{' '}
//                     of <span className="font-medium">{filteredVehicles.length}</span> results
//                   </p>
//                 </div>
//                 <div>
//                   <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
//                     <button
//                       onClick={() => setCurrentPage(1)}
//                       disabled={currentPage === 1}
//                       className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       <span className="sr-only">First</span>
//                       <ChevronLeftIcon className="h-5 w-5 mr-1" />
//                       <ChevronLeftIcon className="h-5 w-5" />
//                     </button>
//                     <button
//                       onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                       disabled={currentPage === 1}
//                       className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       <span className="sr-only">Previous</span>
//                       <ChevronLeftIcon className="h-5 w-5" />
//                     </button>

//                     {/* Page numbers */}
//                     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                       const pageNumber = currentPage <= 3
//                         ? i + 1
//                         : currentPage >= totalPages - 2
//                           ? totalPages - 4 + i
//                           : currentPage - 2 + i;

//                       if (pageNumber <= 0 || pageNumber > totalPages) return null;

//                       return (
//                         <button
//                           key={pageNumber}
//                           onClick={() => setCurrentPage(pageNumber)}
//                           className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNumber
//                             ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
//                             : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
//                             }`}
//                         >
//                           {pageNumber}
//                         </button>
//                       );
//                     })}

//                     <button
//                       onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                       disabled={currentPage === totalPages}
//                       className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       <span className="sr-only">Next</span>
//                       <ChevronRightIcon className="h-5 w-5" />
//                     </button>
//                     <button
//                       onClick={() => setCurrentPage(totalPages)}
//                       disabled={currentPage === totalPages}
//                       className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       <span className="sr-only">Last</span>
//                       <ChevronRightIcon className="h-5 w-5 mr-1" />
//                       <ChevronRightIcon className="h-5 w-5" />
//                     </button>
//                   </nav>
//                 </div>
//               </div>

//               {/* Mobile pagination */}
//               <div className="flex items-center sm:hidden">
//                 <button
//                   onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                   disabled={currentPage === 1}
//                   className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
//                 >
//                   Previous
//                 </button>
//                 <div className="mx-4">
//                   <span className="text-sm text-gray-700">
//                     Page {currentPage} of {totalPages}
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                   disabled={currentPage === totalPages}
//                   className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Live Data Panel */}
//       <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-200">
//         <LiveDataPanel />
//       </div>

//       {/* Document Modal */}
//       <DocumentModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         vrn={selectedVRN}
//       />

//       {/* Delete Confirmation Modal */}
//       <DeleteConfirmationModal
//         isOpen={isDeleteModalOpen}
//         onClose={() => {
//           setIsDeleteModalOpen(false);
//           setVehicleToDelete(null);
//         }}
//         onConfirm={confirmDelete}
//         isLoading={isDeletingVehicle}
//       />

//       {/* Toast */}
//       <Toaster
//         position="top-center"
//         toastOptions={{
//           duration: 3000,
//           style: {
//             background: '#fff',
//             color: '#363636',
//             borderRadius: '0.5rem',
//             boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//           },
//           success: {
//             style: {
//               background: 'linear-gradient(to right, #2563eb, #3b82f6)',
//               color: '#fff',
//             },
//           },
//           error: {
//             style: {
//               background: 'linear-gradient(to right, #dc2626, #ef4444)',
//               color: '#fff',
//             },
//           },
//         }}
//       />
//     </div>
//   );
// }

'use client';

import { useState, useCallback, useEffect } from 'react';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import DocumentModal from '../components/DocumentModal';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../components/ui/dropdown-menu';
import { utils as xlsxUtils, writeFile } from 'xlsx';
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
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import LiveDataPanel from '../components/LiveDataPanel';
import { getSession } from 'next-auth/react';

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
  owner: string;
  registeredAt: string;
  documents: number;
}

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
    count: vehicles.filter((v) => {
      const today = new Date();
      return [v.roadTax, v.fitness, v.insurance].some((date) => new Date(date) < today);
    }).length.toString(),
    color: 'from-amber-500 to-amber-600',
    glowColor: 'amber',
    icon: ClockIcon,
    details: [
      { label: 'Road Tax', value: vehicles.filter((v) => new Date(v.roadTax) < new Date()).length.toString() },
      { label: 'Insurance', value: vehicles.filter((v) => new Date(v.insurance) < new Date()).length.toString() },
      { label: 'Fitness', value: vehicles.filter((v) => new Date(v.fitness) < new Date()).length.toString() },
    ],
  },
  {
    title: 'EXPIRED DOCUMENTS',
    count: vehicles.filter((v) => {
      const today = new Date();
      return [v.roadTax, v.fitness, v.insurance].some((date) => new Date(date) < today);
    }).length.toString(),
    color: 'from-red-500 to-red-600',
    glowColor: 'red',
    icon: DocumentChartBarIcon,
    details: [
      { label: 'Insurance', value: vehicles.filter((v) => new Date(v.insurance) < new Date()).length.toString() },
      { label: 'Road Tax', value: vehicles.filter((v) => new Date(v.roadTax) < new Date()).length.toString() },
      { label: 'Fitness Certificate', value: vehicles.filter((v) => new Date(v.fitness) < new Date()).length.toString() },
    ],
  },
];

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);
  const [updatingRows, setUpdatingRows] = useState<{ [key: number]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true);
        const session = await getSession();
        console.log(session)
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

  // CRUD Operations
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

      // Only update the lastUpdated field if something has actually changed
      const payload = {
        ...row,
        lastUpdated: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).replace(/\//g, '-'),
      };

      const response = await fetch(`/api/vehicles/${row.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update vehicle');
      const updatedVehicle = await response.json();
      setVehicles((prev) => prev.map((v) => (v.id === row.id ? updatedVehicle : v)));
      setFilteredVehicles((prev) => prev.map((v) => (v.id === row.id ? updatedVehicle : v)));
      toast.success('Vehicle updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update vehicle');
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

  // Export Logic
  type ExportData = {
    'S.no': number;
    VRN: string;
    'Road Tax': string;
    Fitness: string;
    Insurance: string;
    Pollution: string;
    'State Permit': string;
    'National Permit': string;
    'Last Updated': string;
  };

  const prepareExportData = (data: Vehicle[]): ExportData[] => {
    return data.map((vehicle, index) => ({
      'S.no': index + 1,
      VRN: vehicle.vrn,
      'Road Tax': vehicle.roadTax,
      Fitness: vehicle.fitness,
      Insurance: vehicle.insurance,
      Pollution: vehicle.pollution,
      'State Permit': vehicle.statePermit,
      'National Permit': vehicle.nationalPermit,
      'Last Updated': vehicle.lastUpdated,
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
        const fileName = format === 'current-excel' ? 'current-fleet-data.xlsx' : 'all-fleet-data.xlsx';
        writeFile(workbook, fileName);
        toast.success(`${format === 'current-excel' ? 'Current' : 'All'} data exported to Excel`);
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
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setFilteredVehicles(vehicles);
      setSearchError(null);
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    setCurrentPage(1);

    const results = vehicles.filter((vehicle) =>
      vehicle.vrn.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredVehicles(results);
    if (results.length === 0) setSearchError('No results found');
    setIsSearching(false);
  }, [searchQuery, vehicles]);

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full md:w-64 relative">
            <input
              type="text"
              placeholder="Search Vehicle"
              className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center text-sm">
                  {rowsPerPage} rows
                  <ChevronDownIcon className="w-4 h-4 ml-2 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {[5, 10, 20, 50].map((value) => (
                  <DropdownMenuItem key={value} onClick={() => setRowsPerPage(value)}>
                    {value} rows
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  disabled={isExporting}
                  className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium text-sm disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                      Export
                    </>
                  )}
                  <ChevronDownIcon className="w-4 h-4 ml-2" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {['Current Excel', 'All Excel', 'PDF'].map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => handleExport(option.toLowerCase().replace(' ', '-') as any)}
                    className="flex items-center cursor-pointer text-sm"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden relative">
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">S.no</th>
                  <th className="w-32 px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">VRN</th>
                  <th className="w-28 px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Road Tax</th>
                  <th className="w-28 px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Fitness</th>
                  <th className="w-28 px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Insurance</th>
                  <th className="w-28 px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Pollution</th>
                  <th className="w-28 px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Permit</th>
                  <th className="w-32 px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">National Permit</th>
                  <th className="w-28 px-2 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="w-16 px-2 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Update</th>
                  <th className="w-16 px-2 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Upload</th>
                  <th className="w-16 px-2 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!isLoading && currentVehicles.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-2 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-gray-500">{row.id}</td>
                    <td className="px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm font-medium text-gray-900">{row.vrn}</td>
                    <td className="px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-green-600">{row.roadTax}</td>
                    <td className="px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-green-600">{row.fitness}</td>
                    <td className="px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-green-600">{row.insurance}</td>
                    <td className="px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-green-600">{row.pollution}</td>
                    <td className="px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-red-500">{row.statePermit}</td>
                    <td className="px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-green-600">{row.nationalPermit}</td>
                    <td className="px-1 lg:px-4 py-2 lg:py-4 text-xs lg:text-sm text-gray-500">{row.lastUpdated}</td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleUpdate(row)}
                        disabled={updatingRows[row.id]}
                        className={`p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors ${updatingRows[row.id] ? 'bg-blue-50' : ''}`}
                      >
                        <ArrowPathIcon className={`w-5 h-5 ${updatingRows[row.id] ? 'animate-spin' : ''}`} />
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
                {!isLoading && currentVehicles.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                      {searchError || 'No vehicles found'}
                    </td>
                  </tr>
                )}
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

      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-200">
        <LiveDataPanel />
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
    </div>
  );
}