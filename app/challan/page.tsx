'use client';

import { useEffect, useState } from 'react';
import {

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
// import { prisma } from '@/lib/prisma';
import { ChallanDetailPopup } from '../components/ChallanDetailPopup';
import axios from 'axios';
// import { ChallanDetailPopup } from '../components/ChallanDetailPopup';

// import Mukul from '../components/Mukul';
// import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
    Status: ['Unpaid', 'Paid'],
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

interface ChallanType {
  id?: string;
  rc_no: string;
  challan_no: string;
  challan_status: 'Pending' | 'Disposed';
  sent_to_reg_court: string;
  sent_to_virtual_court: string;
  fine_imposed: string;
  amount_of_fine: number;
  state_code: string;
  challan_date_time: Date;
  last_update: Date;
  receipt_no?: string;
  remark?: string;
}

interface VehicleSummary {
  rc_no: string;
  totalChallans: number;
  totalAmount: number;
  pendingChallans: number;
  onlineChallans: number;
  offlineChallans: number;
  lastUpdated: Date;
  status: 'Paid' | 'Unpaid';
}

// Add this function after the existing interface declarations
const processChallansToSummaries = (challans: ChallanType[]): VehicleSummary[] => {
  const summariesMap = new Map<string, VehicleSummary>();

  challans.forEach(challan => {
    const existing = summariesMap.get(challan.rc_no);

    if (existing) {
      existing.totalChallans++;
      // Only add amount and count pending challans
      if (challan.challan_status === 'Pending') {
        existing.totalAmount += parseFloat(challan.fine_imposed);
        existing.pendingChallans++;
      }
      // Fix online/offline challan counting
      // if (challan.sent_to_virtual_court === 'Yes') {
      //   existing.onlineChallans++;
      // }
      if (challan.sent_to_reg_court === 'Yes') {
        existing.offlineChallans++;
      }
      else {
        existing.onlineChallans++;
      }
      if (challan.last_update > existing.lastUpdated) {
        existing.lastUpdated = challan.last_update;
      }
    } else {
      summariesMap.set(challan.rc_no, {
        rc_no: challan.rc_no,
        totalChallans: 1,
        totalAmount: challan.challan_status === 'Pending' ? parseFloat(challan.fine_imposed) : 0,
        pendingChallans: challan.challan_status === 'Pending' ? 1 : 0,
        onlineChallans: challan.sent_to_reg_court === 'No' ? 1 : 0,
        offlineChallans: challan.sent_to_reg_court === 'Yes' ? 1 : 0,
        lastUpdated: new Date(challan.last_update),
        status: challan.challan_status === 'Pending' ? 'Unpaid' : 'Paid'
      });
    }
  });

  return Array.from(summariesMap.values());
};

async function fetchChallanData(rc_no: string) {
  try {
    const response = await axios.get(`/api/vahanfin/echallan?rc_no=${rc_no}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching challan data:', error);
    throw error;
  }
}

interface VehicleRow {
  rc_no: string;
  totalChallans: number;
  // ...other row properties
}

export default function ChallanDashboard() {
  const router = useRouter();

  const [challans, setChallans] = useState<ChallanType[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [challanToDelete, setChallanToDelete] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleSummaries, setVehicleSummaries] = useState<VehicleSummary[]>([]);
  const [selectedChallan, setSelectedChallan] = useState<ChallanType | null>(null);
  const [updatingVehicles, setUpdatingVehicles] = useState<Set<string>>(new Set());
  const [selectedChallans, setSelectedChallans] = useState<ChallanType[]>([]);
  console.log(vehicleSummaries)

  const updateChallanData = async (rc_no: string) => {
    if (updatingVehicles.has(rc_no)) return;

    try {
      setUpdatingVehicles(prev => new Set(prev).add(rc_no));

      toast.loading(`Updating challans for vehicle ${rc_no}...`, {
        id: `update-${rc_no}`,
      });

      const response = await axios.get(`/api/vahanfin/echallan?rc_no=${rc_no}`);
      const data = response.data;

      if (!data?.data?.Pending_data && !data?.data?.Disposed_data) {
        throw new Error('Invalid data format received from API');
      }

      const newChallans = [
        ...(data.data.Pending_data || []).map((challan: any) => ({
          rc_no,
          challan_no: challan.challan_no,
          challan_status: 'Pending' as const,
          sent_to_reg_court: challan.sent_to_reg_court || 'No',
          sent_to_virtual_court: challan.sent_to_virtual_court || 'No',
          fine_imposed: challan.fine_imposed || '0',
          amount_of_fine: parseFloat(challan.amount_of_fine_imposed || '0'),
          state_code: challan.state_code,
          challan_date_time: new Date(challan.challan_date_time),
          remark: challan.remark,
          receipt_no: challan.receipt_no,
          last_update: new Date()
        })),
        ...(data.data.Disposed_data || []).map((challan: any) => ({
          rc_no,
          challan_no: challan.challan_no,
          challan_status: 'Disposed' as const,
          sent_to_reg_court: challan.sent_to_reg_court || 'No',
          sent_to_virtual_court: challan.sent_to_virtual_court || 'No',
          fine_imposed: challan.fine_imposed || '0',
          amount_of_fine: parseFloat(challan.amount_of_fine_imposed || '0'),
          state_code: challan.state_code,
          challan_date_time: new Date(challan.challan_date_time),
          remark: challan.remark,
          receipt_no: challan.receipt_no,
          last_update: new Date()
        }))
      ];

      // Update challans state
      setChallans(prevChallans => {
        const otherChallans = prevChallans.filter(c => c.rc_no !== rc_no);
        return [...otherChallans, ...newChallans];
      });

      // Create new summary for the updated vehicle
      const updatedVehicleSummary = processChallansToSummaries(newChallans)[0];

      // Update vehicle summaries while maintaining order
      setVehicleSummaries(prevSummaries => {
        return prevSummaries.map(summary =>
          summary.rc_no === rc_no
            ? {
              ...updatedVehicleSummary,
              lastUpdated: new Date() // Set current time as last update
            }
            : summary
        );
      });

      toast.success(`Successfully updated ${newChallans.length} challans for vehicle ${rc_no}`, {
        id: `update-${rc_no}`,
        duration: 3000,
      });

    } catch (error) {
      console.error('Error updating challan data:', error);
      toast.error(`Failed to update challans for vehicle ${rc_no}`, {
        id: `update-${rc_no}`,
        duration: 3000,
      });
    } finally {
      setUpdatingVehicles(prev => {
        const next = new Set(prev);
        next.delete(rc_no);
        return next;
      });
    }
  };

  const deleteVehicleChallans = async (rc_no: string) => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/challans/${rc_no}`);

      setChallans(prevChallans => prevChallans.filter(challan => challan.rc_no !== rc_no));
      toast.success('Challans deleted successfully');
    } catch (error) {
      console.error('Error deleting challans:', error);
      toast.error('Failed to delete challans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewChallans = (rc_no: string) => {
    setSelectedVehicle(rc_no);
  };

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
      console.log(`Deleting challan with ID ${challanToDelete}`);

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

      const exportData = challans.map(challan => ({
        RC_Number: challan.rc_no,
        Challan_Number: challan.challan_no,
        Status: challan.challan_status,
        Fine_Amount: challan.fine_imposed,
        Amount_of_Fine: challan.amount_of_fine,
        State: challan.state_code,
        Date_Time: new Date(challan.challan_date_time).toLocaleString('en-IN'),
        Virtual_Court: challan.sent_to_virtual_court,
        Regular_Court: challan.sent_to_reg_court,
        Receipt_Number: challan.receipt_no || 'N/A',
        Remarks: challan.remark || 'N/A',
        Last_Updated: new Date(challan.last_update).toLocaleString('en-IN')
      }));

      if (format === 'excel') {
        const worksheet = xlsxUtils.json_to_sheet(exportData);
        const workbook = xlsxUtils.book_new();
        xlsxUtils.book_append_sheet(workbook, worksheet, 'Challan Data');
        writeFile(workbook, 'detailed-challan-data.xlsx');
        toast.success('Data exported to Excel');
      } else if (format === 'csv') {
        const worksheet = xlsxUtils.json_to_sheet(exportData);
        const csv = xlsxUtils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'detailed-challan-data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Data exported to CSV');
      } else if (format === 'pdf') {
        const doc = new jsPDF('l', 'mm', 'a4'); // landscape mode for better fit
        autoTable(doc, {
          head: [Object.keys(exportData[0]).map(key => key.replace(/_/g, ' '))],
          body: exportData.map(row => Object.values(row)),
          styles: { fontSize: 7 }, // smaller font size to fit all columns
          headStyles: {
            fillColor: [249, 250, 251],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
          },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          margin: { top: 20 },
          columnStyles: {
            // Adjust column widths as needed
            RC_Number: { cellWidth: 25 },
            Challan_Number: { cellWidth: 25 },
            Status: { cellWidth: 20 },
            Fine_Amount: { cellWidth: 20 },
            Amount_of_Fine: { cellWidth: 20 },
            State: { cellWidth: 15 },
            Date_Time: { cellWidth: 30 },
            Virtual_Court: { cellWidth: 20 },
            Regular_Court: { cellWidth: 20 },
            Receipt_Number: { cellWidth: 25 },
            Remarks: { cellWidth: 30 },
            Last_Updated: { cellWidth: 30 }
          }
        });
        doc.save('detailed-challan-data.pdf');
        toast.success('Data exported to PDF');
      } else if (format === 'json') {
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'detailed-challan-data.json');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Data exported to JSON');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/challans');
        const fetchedChallans = response.data;
        setChallans(fetchedChallans);

        // Process challans into summaries
        const summaries = processChallansToSummaries(fetchedChallans);
        setVehicleSummaries(summaries);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Failed to load initial data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 ">
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
        <div className="flex-1 p-4 lg:p-6 overflow-hidden">
          <div className="max-w-[calc(100vw-2rem)] lg:max-w-[calc(100vw-26rem)] mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Challan Dashboard</h1>

            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="flex w-full justify-between">
                    <div className="relative w-64">

                    </div>

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
              {summaryData.map((item, index) => (
                <div
                  key={item.title}
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1`}
                >
                  <div className={`absolute inset-0 ${item.gradient} animate-gradient`} />

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
                          {item.title === 'Total Challans' ? vehicleSummaries.reduce((total, data) => total + data.totalChallans, 0) : ''}
                          {item.title === 'Total Vehicles' ? vehicleSummaries.length : ''}
                          {item.title === 'Total Amount' ? `₹${vehicleSummaries.reduce((total, data) => total + data.totalAmount, 0)}` : ''}
                        </p>
                      </div>


                    </div>

                  </div>
                </div>
              ))}
            </div>

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
                  {vehicleSummaries.map((item, index) => (
                    <tr key={item.rc_no} className="hover:bg-gray-50">
                      <td className="px-3 py-4 text-sm font-medium">{item.rc_no}</td>
                      <td className="px-3 py-4 text-sm text-gray-500 text-center">{item.totalChallans}</td>
                      <td className="py-4 text-center">
                        <button className="px-3 py-1 rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50">
                          Pay
                        </button>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <button
                          onClick={() => setExpandedId(index)}
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

            {expandedId !== null && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
                  <h2 className="text-lg font-semibold mb-4">Challan Details</h2>
                  {vehicleSummaries
                    .filter(item => typeof expandedId === 'number' && item.rc_no === vehicleSummaries[expandedId].rc_no)
                    .map(item => (
                      <div key={item.rc_no} className="space-y-2">
                        <p><strong>Vehicle No:</strong> {item.rc_no}</p>
                        <p><strong>Challans:</strong> {item.totalChallans}</p>
                        <p><strong>Amount:</strong> ₹{item.totalAmount}</p>
                        <p><strong>Online:</strong> {item.onlineChallans}</p>
                        <p><strong>Court:</strong> {item.offlineChallans}</p>
                        <p><strong>Last Updated:</strong> {item.lastUpdated.toLocaleString()}</p>
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

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Update</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stutus</th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delete</th> */}
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">View</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vehicleSummaries.map((row, index) => (
                      <tr
                        key={row.rc_no}
                        className={`hover:bg-gray-50 transition-colors duration-200 ${!updatingVehicles.has(row.rc_no) && row.lastUpdated instanceof Date && row.lastUpdated.getTime() > Date.now() - 1000
                          ? 'pop-animation bg-green-50'
                          : ''
                          }`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.rc_no}</td>
                        <td className="px-6 py-4 text-sm text-center text-gray-500">{row.totalChallans}</td>

                        <td className="px-6 py-4 text-sm text-gray-900">₹{row.totalAmount}</td>
                        <td className="px-6 py-4 text-sm text-center">{row.onlineChallans}</td>
                        <td className="px-6 py-4 text-sm text-center">{row.offlineChallans}</td>
                        <td className="px-2 py-4 text-sm text-center text-gray-500">

                          <button
                            onClick={() => router.push(`/challanpay?rc_no=${row.rc_no}`)}
                            className="px-4 py-1 rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                            disabled={row.pendingChallans < 1} // Disable if no pending challans
                          >
                            Pay
                          </button>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => updateChallanData(row.rc_no)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                            disabled={isLoading}
                          >
                            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${row.pendingChallans < 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {row.pendingChallans >= 1 ? 'Unpaid' : 'Paid'}
                          </span>
                        </td>
                        {/* <td className="px-6 py-4 text-sm text-center">Reciept</td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleDelete(String(row.rc_no))} 
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </td> */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => {
                              const vehicleChallans = challans.filter(c => c.rc_no === row.rc_no);
                              setSelectedChallans(vehicleChallans);
                            }}
                            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(row.lastUpdated).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

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

        <div className={`
          lg:block
          ${showMobilePanel ? 'fixed inset-0 z-40 bg-white' : 'hidden'}
          lg:relative lg:flex-none
        `}>
          <LiveChallanPanel />
        </div>
      </div>

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

      {/* {selectedVehicle && (
        <ChallanDetails
          isOpen={!!selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          challans={challans.filter(challan => challan.rc_no === selectedVehicle)}
        />
      )} */}

      {selectedChallans.length > 0 && (
        <ChallanDetailPopup
          challans={selectedChallans}
          onClose={() => setSelectedChallans([])}
        />
      )}

    </div>
  );
}