// 'use client';

// import React, { useState } from 'react';
// import { 
//   MagnifyingGlassIcon, 
//   ArrowPathIcon, 
//   EyeIcon,
//   ExclamationCircleIcon
// } from '@heroicons/react/24/outline';
// import PendingChallansModal from '../../components/PendingChallansModal';
// import { toast } from 'react-hot-toast';

// export default function LiveChallanPanel() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchPendingResults, setSearchPendingResults] = useState<any[]>([]); 
//   const [searchDisposedData, setSearchDisposedData] = useState<any[]>([]);
//   const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
//   const [isDisposedModalOpen, setIsDisposedModalOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSearch = async (event: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
//     if ('key' in event && event.key !== 'Enter') return;
    
//     setIsLoading(true);
//     setError(null); // Clear previous errors
    
//     if (!searchQuery.trim()) {
//       setError('Please enter a vehicle RC number');
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch(`/api/vahanfin/echallan?rc_no=${searchQuery}`);
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to fetch vehicle data');
//       }

//       if (!data.data) {
//         throw new Error('No data found for this vehicle');
//       }

//       console.log(data);
//       setSearchPendingResults(data.data.Pending_data || []); 
//       setSearchDisposedData(data.data.Disposed_data || []);

//       // Clear error if successful
//       setError(null);

//     } catch (error) {
//       console.error('API call error:', error);
//       setError(error instanceof Error ? error.message : 'An error occurred while fetching data');
//       setSearchPendingResults([]);
//       setSearchDisposedData([]);
//     } finally {
//       setTimeout(() => {
//         setIsLoading(false);
//       }, 500);
//     }
//   };

//   const handleSyncChallans = async () => {
//     if (!searchQuery || isLoading) return;

//     try {
//       setIsLoading(true);
      
//       const challans = [
//         ...(searchPendingResults || []).map(challan => ({
//           rc_no: searchQuery,
//           challan_no: challan.challan_no,
//           challan_status: 'Pending' as const,
//           sent_to_reg_court: challan.sent_to_reg_court || 'No',
//           sent_to_virtual_court: challan.sent_to_virtual_court || 'No',
//           fine_imposed: challan.fine_imposed || '0',
//           amount_of_fine: parseFloat(challan.amount_of_fine_imposed || '0'),
//           state_code: challan.state_code,
//           challan_date_time: new Date(challan.challan_date_time),
//           remark: challan.remark,
//           receipt_no: challan.receipt_no,
//           last_update: new Date()
//         })),
//         ...(searchDisposedData || []).map(challan => ({
//           rc_no: searchQuery,
//           challan_no: challan.challan_no,
//           challan_status: 'Disposed' as const,
//           sent_to_reg_court: challan.sent_to_reg_court || 'No',
//           sent_to_virtual_court: challan.sent_to_virtual_court || 'No',
//           fine_imposed: challan.fine_imposed || '0',
//           amount_of_fine: parseFloat(challan.amount_of_fine_imposed || '0'),
//           state_code: challan.state_code,
//           challan_date_time: new Date(challan.challan_date_time),
//           remark: challan.remark,
//           receipt_no: challan.receipt_no,
//           last_update: new Date()
//         }))
//       ];

//       const response = await fetch('/api/challans/sync', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           rc_no: searchQuery,
//           challans
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to sync challans');
//       }

//       toast.success('Challans synced successfully');
//     } catch (error) {
//       console.error('Sync error:', error);
//       toast.error('Failed to sync challans');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Loading Spinner Component
//   const LoadingSpinner = () => (
//     <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-10">
//       <div className="animate-spin">
//         <svg 
//           className="w-12 h-12 text-blue-600" 
//           fill="none" 
//           stroke="currentColor" 
//           viewBox="0 0 24 24" 
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <path 
//             strokeLinecap="round" 
//             strokeLinejoin="round" 
//             strokeWidth={2} 
//             d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
//           />
//         </svg>
//       </div>
//     </div>
//   );

//   return (
//     <div className="w-full xl:w-96 bg-white p-4 h-full border-l border-gray-200">
//       {/* Loading Overlay */}
//       {isLoading && <LoadingSpinner />}

//       <div className="bg-[#4c4e50] p-4">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-white">Live Challan Updates</h2>
//           <div className="flex gap-2">
//             {(searchPendingResults.length > 0 || searchDisposedData.length > 0) && (
//               <button
//                 onClick={handleSyncChallans}
//                 disabled={isLoading}
//                 className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
//               >
//                 <ArrowPathIcon className="w-4 h-4" />
//                 Add/Update All Challan
//               </button>
//             )}
//             <button 
//               className="p-1.5 text-white hover:bg-blue-700 rounded-full transition-colors"
//               onClick={() => {
//                 setSearchQuery('');
//                 setSearchPendingResults([]);
//                 setSearchDisposedData([]);
//                 setError(null);
//               }}
//             >
//               <ArrowPathIcon className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         <div className="relative">
//           <input
//             type="text"
//             placeholder="Search by Vehicle RC Number"
//             className={`w-full pl-10 pr-4 py-2.5 border ${
//               error ? 'border-red-400' : 'border-blue-400'
//             } bg-white/10 text-white placeholder-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 ${
//               error ? 'focus:ring-red-400' : 'focus:ring-white'
//             }`}
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             onKeyPress={handleSearch}
//             disabled={isLoading}
//           />
//           <MagnifyingGlassIcon 
//             className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
//               error ? 'text-red-400' : 'text-white'
//             }`}
//             onClick={!isLoading ? handleSearch as any : undefined}
//           />
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
//             <ExclamationCircleIcon className="w-5 h-5" />
//             <span>{error}</span>
//           </div>
//         )}

//         {/* No Results Message */}
//         {!isLoading && searchQuery && !error && 
//          searchPendingResults.length === 0 && searchDisposedData.length === 0 && (
//           <div className="mt-2 text-blue-200 text-sm text-center">
//             No challans found for this vehicle
//           </div>
//         )}
//       </div>

//       {/* Summary Table */}
//       <div className="p-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div className="bg-red-50 rounded-lg p-4 shadow-sm">
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-sm font-medium text-red-700">Pending Challans</span>
              
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-2xl font-bold text-red-800">
//                 {searchPendingResults.length}
//               </span>
//               <button 
//                 onClick={() => setIsPendingModalOpen(true)} 
//                 className="text-red-600 hover:text-red-800 text-sm"
//                 disabled={isLoading}
//               >
//                 View Details
//               </button>
//             </div>
//           </div>

//           <div className="bg-green-50 rounded-lg p-4 shadow-sm">
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-sm font-medium text-green-700">Disposed Challans</span>
              
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-2xl font-bold text-green-800">
//                 {searchDisposedData.length}
//               </span>
//               <button 
//                 onClick={() => setIsDisposedModalOpen(true)} 
//                 className="text-green-600 hover:text-green-800 text-sm"
//                 disabled={isLoading}
//               >
//                 View Details
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       {isPendingModalOpen && (
//         <PendingChallansModal
//           isOpen={isPendingModalOpen}
//           onClose={() => setIsPendingModalOpen(false)}
//           pendingChallans={searchPendingResults}
//         />
//       )}
//       {isDisposedModalOpen && (
//         <PendingChallansModal
//           isOpen={isDisposedModalOpen}
//           onClose={() => setIsDisposedModalOpen(false)}
//           pendingChallans={searchDisposedData}
//         />
//       )}
//     </div>
//   );
// }

'use client';

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import PendingChallansModal from '../../components/PendingChallansModal';
import { toast } from 'react-hot-toast';

export default function LiveChallanPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPendingResults, setSearchPendingResults] = useState<any[]>([]); 
  const [searchDisposedData, setSearchDisposedData] = useState<any[]>([]);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [isDisposedModalOpen, setIsDisposedModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (event: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ('key' in event && event.key !== 'Enter') return;
    
    setIsLoading(true);
    setError(null);
    
    if (!searchQuery.trim()) {
      setError('Please enter a vehicle RC number');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/vahanfin/echallan?rc_no=${searchQuery}`);
      const data = await response.json();
      console.log(data);
      // if (!response.ok) {
      //   throw new Error(data.message || 'Failed to fetch vehicle data');
      // }

      if (!data.response[0]) {
        throw new Error('No data found for this vehicle');
      }

      setSearchPendingResults(data.response[0]?.response?.data?.Pending_data || []);
      setSearchDisposedData(data.response[0]?.response?.data?.Disposed_data || []);//data.response[0]?.response?.data?.Disposed_data || []
      setError(null);

    } catch (error) {
      console.error('API call error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching data');
      setSearchPendingResults([]);
      setSearchDisposedData([]);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const handleSyncChallans = async () => {
    if (!searchQuery || isLoading) return;

    try {
      setIsLoading(true);
      
      const challans = [
        ...(searchPendingResults || []).map(challan => ({
          rc_no: searchQuery,
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
        ...(searchDisposedData || []).map(challan => ({
          rc_no: searchQuery,
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

      const response = await fetch('/api/challans/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rc_no: searchQuery,
          challans
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync challans');
      }

      toast.success('Challans synced successfully');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync challans');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setSearchPendingResults([]);
    setSearchDisposedData([]);
    setError(null);
  };

  return (
    <div className="w-full xl:w-96 bg-white shadow-sm rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Challan Search</h2>
          <button 
            className="p-1.5 text-white hover:bg-blue-700 rounded-full transition-colors"
            onClick={resetSearch}
            title="Reset search"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Enter Vehicle RC Number"
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
              error ? 'border-red-400 ring-1 ring-red-400' : 'border-transparent'
            }`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearch}
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            {isLoading ? (
              <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />
            ) : (
              <MagnifyingGlassIcon 
                className={`w-5 h-5 ${error ? 'text-red-500' : 'text-blue-500'}`}
                onClick={!isLoading ? handleSearch as any : undefined}
              />
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 flex items-center gap-2 text-white text-sm bg-red-500/20 p-2 rounded">
            <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Area */}
      <div className="p-4">
        {/* No Results Message */}
        {!isLoading && searchQuery && !error && 
         searchPendingResults.length === 0 && searchDisposedData.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-6">
            No challans found for this vehicle
          </div>
        )}

        {/* Stats Cards */}
        {(searchPendingResults.length > 0 || searchDisposedData.length > 0) && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Pending Challans Card */}
              <div 
                className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setIsPendingModalOpen(true)}
              >
                <div className="text-sm font-medium text-red-700 mb-1">Pending</div>
                <div className="text-2xl font-bold text-red-800">
                  {searchPendingResults.length}
                </div>
                <div className="text-xs text-red-600 mt-2">Tap to view details</div>
              </div>

              {/* Disposed Challans Card */}
              <div 
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setIsDisposedModalOpen(true)}
              >
                <div className="text-sm font-medium text-green-700 mb-1">Disposed</div>
                <div className="text-2xl font-bold text-green-800">
                  {searchDisposedData.length}
                </div>
                <div className="text-xs text-green-600 mt-2">Tap to view details</div>
              </div>
            </div>

            {/* Sync Button */}
            <button
              onClick={handleSyncChallans}
              disabled={isLoading}
              className="w-full py-2.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              {isLoading ? 'Syncing...' : 'Sync Challans to Database'}
            </button>
          </>
        )}
      </div>

      {/* Modals */}
      {isPendingModalOpen && (
        <PendingChallansModal
          isOpen={isPendingModalOpen}
          onClose={() => setIsPendingModalOpen(false)}
          pendingChallans={searchPendingResults}
        />
      )}
      {isDisposedModalOpen && (
        <PendingChallansModal
          isOpen={isDisposedModalOpen}
          onClose={() => setIsDisposedModalOpen(false)}
          pendingChallans={searchDisposedData}
        />
      )}
    </div>
  );
}