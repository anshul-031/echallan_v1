'use client';

import { useEffect, useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  TrashIcon, 
  EyeIcon,
  Bars3Icon,
  XMarkIcon,
  TruckIcon,
  BanknotesIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import LiveChallanPanel from '../components/challan/LiveChallanPanel';
import { toast } from 'react-hot-toast';
import { utils as xlsxUtils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

// import Mukul from '../components/Mukul';
// import { getSession } from 'next-auth/react';

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
    Status:['Unpaid','Paid'],
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
  // const [selectedVehicle, setSelectedVehicle] = useState('');
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [challanToDelete, setChallanToDelete] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  

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

  

  

  const handleDelete = (id: string) => {
    setChallanToDelete(id);
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = () => {
    try {
      // Here we would typically call an API endpoint to delete the challan
      console.log(`Deleting challan with ID ${challanToDelete}`);
      
      // In a real app, this would be replaced with an actual API call
      // For demo purposes, we're just showing feedback
      toast.success('Challan deleted successfully');
      setShowDeleteConfirm(false);
      setChallanToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete challan');
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv' | 'json') => {
    try {
      setIsExporting(true);
      
      // Prepare the data for export
      const exportData = challanData.map(challan => ({
        vehicleNo: challan.vehicleNo,
        challans: challan.challans,
        amount: challan.amount,
        online: challan.online,
        offline: challan.offline,
        lastUpdated: challan.lastUpdated
      }));

      if (format === 'excel') {
        const worksheet = xlsxUtils.json_to_sheet(exportData);
        const workbook = xlsxUtils.book_new();
        xlsxUtils.book_append_sheet(workbook, worksheet, 'Challan Data');
        writeFile(workbook, 'challan-data.xlsx');
        toast.success('Data exported to Excel');
      } else if (format === 'csv') {
        const worksheet = xlsxUtils.json_to_sheet(exportData);
        const csv = xlsxUtils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'challan-data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Data exported to CSV');
      } else if (format === 'json') {
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'challan-data.json');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Data exported to JSON');
      } else if (format === 'pdf') {
        const doc = new jsPDF();
        autoTable(doc, {
          head: [Object.keys(exportData[0])],
          body: exportData.map((row) => Object.values(row)),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [249, 250, 251], textColor: [0, 0, 0], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          margin: { top: 20 },
        });
        doc.save('challan-data.pdf');
        toast.success('Data exported to PDF');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
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

      <div className="flex flex-col lg:flex-row min-h-screen ">
        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-hidden">
          <div className="max-w-[calc(100vw-2rem)] lg:max-w-[calc(100vw-26rem)] mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Challan Dashboard</h1>
              
            </div>

            {/* Search and Actions Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="flex w-full justify-between">
                    <div className="relative w-64">
                      <input
                        type="text"
                        placeholder="Search for challan..."
                        className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Export Dropdown */}
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
                        <DropdownMenuItem onClick={() => handleExport('excel')}>
                          Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('csv')}>
                          CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('pdf')}>
                          PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('json')}>
                          JSON
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
              {summaryData.map((item, index) => (
                <div
                  key={item.title}
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1`}
                >
                  {/* Card Background with Gradient */}
                  <div className={`absolute inset-0 ${item.gradient} animate-gradient`} />
                  
                  {/* Card Content */}
                  <div className={`relative bg-white/80 backdrop-blur-sm border ${item.borderGradient} p-6 h-full transition-all duration-300`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-xl ${item.iconGradient}`}>
                            <item.icon className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-gray-600 font-medium">{item.title}</p>
                        </div>
                        <p className={`text-2xl font-bold mt-3 ${item.textGradient} bg-clip-text text-transparent`}>
                          {item.title === 'Total Challans' ? challanData.reduce((total, data) => total + data.challans, 0) : ''}
                          {item.title === 'Total Vehicles' ? challanData.length : ''}
                          {item.title === 'Total Amount' ? `₹${challanData.reduce((total, data) => total + data.amount, 0)}` : ''}
                        </p>
                      </div>
                      
                     
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Mobile View */}
            <div className="lg:hidden bg-white rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">VRN</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Challans</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pay</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {challanData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 text-sm font-medium">{item.vehicleNo}</td>
                      <td className="px-3 py-4 text-sm text-gray-500 text-center">{item.challans}</td>
                      <td className="py-4 text-center">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full">
                          {/* <ArrowPathIcon className="w-5 h-5" /> */}
                          <button className="px-3 py-1 rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                          >
                            {/* onClick={(e) => this.parentElement.classList.toggle('bg-blue-500')} */}
                            Pay
                          </button>
                        </button>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <button 
                          onClick={() => setExpandedId(item.id)} 
                          className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Details Modal */}
            {expandedId !== null && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
                  <h2 className="text-lg font-semibold mb-4">Challan Details</h2>
                  {challanData.filter(item => item.id === expandedId).map(item => (
                    <div key={item.id} className="space-y-2">
                      <p><strong>Vehicle No:</strong> {item.vehicleNo}</p>
                      <p><strong>Challans:</strong> {item.challans}</p>
                      <p><strong>Amount:</strong> ₹{item.amount}</p>
                      <p><strong>Online:</strong> {item.online}</p>
                      <p><strong>Offline:</strong> {item.offline}</p>
                      <p><strong>Last Updated:</strong> {item.lastUpdated}</p>
                    </div>
                  ))}
                  <button 
                    onClick={() => setExpandedId(null)} 
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Update</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stutus</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delete</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {challanData.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">{row.id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.vehicleNo}</td>
                        <td className="px-6 py-4 text-sm text-center text-gray-500">{row.challans}</td>
                        
                        <td className="px-6 py-4 text-sm text-gray-900">₹{row.amount}</td>
                        <td className="px-6 py-4 text-sm text-center">{row.online}</td>
                        <td className="px-6 py-4 text-sm text-center">{row.offline}</td>
                        <td className="px-2 py-4 text-sm text-gray-500">
                          <button className="px-4 py-1 rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                          >
                            {/* onClick={(e) => this.parentElement.classList.toggle('bg-blue-500')} */}
                            Pay
                          </button>
                        </td>
                        
                        {/* <td className="px-6 py-4 text-center">
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
                        </td> */}
                        <td className="px-6 py-4 text-center">
                          
                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full">
                              <ArrowPathIcon className="w-5 h-5" />
                            </button>
                            </td>
                            <td className="px-6 py-4 text-sm text-center">Paid</td>
                        <td className="px-6 py-4 text-sm text-center">Reciept</td>
                            <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => handleDelete(String(row.id))} 
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                            </td>
                            <td className="px-6 py-4 text-center">
                            <button className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full">
                              <EyeIcon className="w-5 h-5" />
                            </button>
                          
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{row.lastUpdated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Table */}
            {/* <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">View</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium">Disposed</td>
                    <td className="px-4 py-2 text-sm">{disposedCount}</td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => console.log('View Disposed Data')} className="text-blue-600 hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium">Pending</td>
                    <td className="px-4 py-2 text-sm">{pendingCount}</td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => setIsPendingModalOpen(true)} className="text-blue-600 hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div> */}

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

            {/* Pending Challans Modal */}
            {/* {isPendingModalOpen && (
              <PendingChallansModal
                isOpen={isPendingModalOpen}
                onClose={() => setIsPendingModalOpen(false)}
                pendingChallans={pendingChallans}
              />
            )} */}
          </div>
        </div>

        {/* Live Challan Panel */}
        <div className={`
          lg:block
          ${showMobilePanel ? 'fixed inset-0 z-40 bg-white' : 'hidden'}
          lg:relative lg:flex-none
        `}>
          {/* <LiveChallanPanel vehicleData={vehicleData} /> */}
          <LiveChallanPanel />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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