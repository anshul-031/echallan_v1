
// 'use client';

// import React, { useState } from 'react';
// import { 
//   MagnifyingGlassIcon, 
//   ArrowPathIcon, 
//   EyeIcon 
// } from '@heroicons/react/24/outline';
// import PendingChallansModal from '../../components/PendingChallansModal';

// export default function LiveChallanPanel() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchPendingResults, setSearchPendingResults] = useState<any[]>([]); 
//   const [searchDisposedData, setSearchDisposedData] = useState<any[]>([]);
//   const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
//   const [isDisposedModalOpen, setIsDisposedModalOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSearch = async (event: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
//     if ('key' in event && event.key !== 'Enter') return;
    
//     setIsLoading(true);
//     try {
//       const response = await fetch(`/api/vahanfin/echallan?rc_no=${searchQuery}`);
//       if (!response.ok) throw new Error('Failed to fetch vehicle data');
//       const data = await response.json();
//       console.log(data);
//       setSearchPendingResults(data.data.Pending_data || []); 
//       setSearchDisposedData(data.data.Disposed_data || []);
//     } catch (error) {
//       console.error('API call error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="w-full xl:w-96 bg-white p-4 h-full border-l border-gray-200">
//       <div className="bg-[#4c4e50] p-4">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-white">Live Challan Updates</h2>
//           <button 
//             className="p-1.5 text-white hover:bg-blue-700 rounded-full transition-colors"
//             onClick={() => {
//               setSearchQuery('');
//               setSearchPendingResults([]);
//               setSearchDisposedData([]);
//             }}
//           >
//             <ArrowPathIcon className="w-5 h-5" />
//           </button>
//         </div>

//         <div className="relative">
//           <input
//             type="text"
//             placeholder="Search by Vehicle RC Number"
//             className="w-full pl-10 pr-4 py-2.5 border border-blue-400 bg-white/10 text-white placeholder-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             onKeyPress={handleSearch}
//           />
//           <MagnifyingGlassIcon 
//             className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" 
//             onClick={handleSearch as any}
//           />
//         </div>
//       </div>

//       {/* Summary Table */}
//       <div className="p-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div className="bg-red-50 rounded-lg p-4 shadow-sm">
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-sm font-medium text-red-700">Pending Challans</span>
//               <EyeIcon className="w-5 h-5 text-red-500" />
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-2xl font-bold text-red-800">
//                 {searchPendingResults.length}
//               </span>
//               <button 
//                 onClick={() => setIsPendingModalOpen(true)} 
//                 className="text-red-600 hover:text-red-800 text-sm"
//               >
//                 View Details
//               </button>
//             </div>
//           </div>

//           <div className="bg-green-50 rounded-lg p-4 shadow-sm">
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-sm font-medium text-green-700">Disposed Challans</span>
//               <EyeIcon className="w-5 h-5 text-green-500" />
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-2xl font-bold text-green-800">
//                 {searchDisposedData.length}
//               </span>
//               <button 
//                 onClick={() => setIsDisposedModalOpen(true)} 
//                 className="text-green-600 hover:text-green-800 text-sm"
//               >
//                 View Details
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modals - Kept exactly the same as original implementation */}
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
  EyeIcon 
} from '@heroicons/react/24/outline';
import PendingChallansModal from '../../components/PendingChallansModal';

export default function LiveChallanPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPendingResults, setSearchPendingResults] = useState<any[]>([]); 
  const [searchDisposedData, setSearchDisposedData] = useState<any[]>([]);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [isDisposedModalOpen, setIsDisposedModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (event: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ('key' in event && event.key !== 'Enter') return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/vahanfin/echallan?rc_no=${searchQuery}`);
      if (!response.ok) throw new Error('Failed to fetch vehicle data');
      const data = await response.json();
      console.log(data);
      setSearchPendingResults(data.data.Pending_data || []); 
      setSearchDisposedData(data.data.Disposed_data || []);
    } catch (error) {
      console.error('API call error:', error);
    } finally {
      // Simulate a minimum loading time for smoother user experience
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-10">
      <div className="animate-spin">
        <svg 
          className="w-12 h-12 text-blue-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="w-full xl:w-96 bg-white p-4 h-full border-l border-gray-200">
      {/* Loading Overlay */}
      {isLoading && <LoadingSpinner />}

      <div className="bg-[#4c4e50] p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Live Challan Updates</h2>
          <button 
            className="p-1.5 text-white hover:bg-blue-700 rounded-full transition-colors"
            onClick={() => {
              setSearchQuery('');
              setSearchPendingResults([]);
              setSearchDisposedData([]);
            }}
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search by Vehicle RC Number"
            className="w-full pl-10 pr-4 py-2.5 border border-blue-400 bg-white/10 text-white placeholder-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearch}
            disabled={isLoading}
          />
          <MagnifyingGlassIcon 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" 
            onClick={!isLoading ? handleSearch as any : undefined}
          />
        </div>
      </div>

      {/* Summary Table */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-red-700">Pending Challans</span>
              <EyeIcon className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-red-800">
                {searchPendingResults.length}
              </span>
              <button 
                onClick={() => setIsPendingModalOpen(true)} 
                className="text-red-600 hover:text-red-800 text-sm"
                disabled={isLoading}
              >
                View Details
              </button>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-green-700">Disposed Challans</span>
              <EyeIcon className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-green-800">
                {searchDisposedData.length}
              </span>
              <button 
                onClick={() => setIsDisposedModalOpen(true)} 
                className="text-green-600 hover:text-green-800 text-sm"
                disabled={isLoading}
              >
                View Details
              </button>
            </div>
          </div>
        </div>
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