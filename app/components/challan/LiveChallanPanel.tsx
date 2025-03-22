'use client';

import React, { useState } from 'react';
import { MagnifyingGlassIcon, ArrowPathIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import PendingChallansModal from '../../components/PendingChallansModal';

// interface LiveChallanPanelProps {
//   vehicleData: any; // Adjust the type based on the structure of vehicleData
// }

export default function LiveChallanPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPendingResults, setSearchPendingResults] = useState<any[]>([]); // State to hold search results
  const [searchDisposedData, setSearchDisposedData] = useState<any[]>([]);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  // const disposedData = vehicleData?.data?.Disposed_data || [];
  // const pendingData = vehicleData?.data?.Pending_data || [];

  const handleSearch = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      try {
        const response = await fetch(`/api/vahanfin/echallan?rc_no=${searchQuery}`);
        if (!response.ok) throw new Error('Failed to fetch vehicle data');
        const data = await response.json();
        console.log(data); // Log the API output
        setSearchPendingResults(data.data.Pending_data || []); // Assuming you want to show pending data
        setSearchDisposedData(data.data.Disposed_data || []);
      } catch (error) {
        console.error('API call error:', error);
      }
    }
  };

  return (
    <div className="w-full xl:w-96 bg-white p-4 h-full border-l border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Live Updates</h2>
        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full">
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search vehicles..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearch} // Call handleSearch on key press
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* Summary Table */}
      <div className="overflow-x-auto">
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
              <td className="px-4 py-2 text-sm">{searchDisposedData.length}</td>
              <td className="px-4 py-2 text-center">
              <button onClick={() => setIsPendingModalOpen(true)} className="text-blue-600 hover:underline">
                        View
                      </button>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-sm font-medium">Pending</td>
              <td className="px-4 py-2 text-sm">{searchPendingResults.length}</td>
              <td className="px-4 py-2 text-center">
              <button onClick={() => setIsPendingModalOpen(true)} className="text-blue-600 hover:underline">
                        View
                      </button>
              </td>
            </tr>
          </tbody>
        </table>
        {isPendingModalOpen && (
              <PendingChallansModal
                isOpen={isPendingModalOpen}
                onClose={() => setIsPendingModalOpen(false)}
                pendingChallans={searchPendingResults}
              />
            )}
            {isPendingModalOpen && (
              <PendingChallansModal
                isOpen={isPendingModalOpen}
                onClose={() => setIsPendingModalOpen(false)}
                pendingChallans={searchDisposedData}
              />
            )}
      </div>
    </div>
  );
};

// export default LiveChallanPanel;

// 'use client';


// import React from 'react';
// import { useState } from 'react';
// import { MagnifyingGlassIcon, ArrowPathIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';


// interface LiveChallanPanelProps {
//   vehicleData: any; // Adjust the type based on the structure of vehicleData
// }


// const LiveChallanPanel: React.FC<LiveChallanPanelProps> = ({ vehicleData }) => {
//   const disposedData = vehicleData?.data?.Disposed_data || [];
//   const pendingData = vehicleData?.data?.Pending_data || [];


//   return (
//     <div className="w-full xl:w-96 bg-white p-4 h-full border-l border-gray-200">
//       <div className="flex items-center justify-between mb-6">
//       <h2 className="text-lg font-semibold mb-4">Challan Summary</h2>
//       </div>
//       <table className="min-w-full divide-y divide-gray-200">
//         <thead className="bg-gray-50">
//           <tr>
//             <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//             <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
//             <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">View</th>
//           </tr>
//         </thead>
//         <tbody className="bg-white divide-y divide-gray-200">
//           <tr>
//             <td className="px-4 py-2 text-sm font-medium">Disposed</td>
//             <td className="px-4 py-2 text-sm">{disposedData.length}</td>
//             <td className="px-4 py-2 text-center">
//               <button onClick={() => console.log('View Disposed Data')} className="text-blue-600 hover:underline">
//                 View
//               </button>
//             </td>
//           </tr>
//           <tr>
//             <td className="px-4 py-2 text-sm font-medium">Pending</td>
//             <td className="px-4 py-2 text-sm">{pendingData.length}</td>
//             <td className="px-4 py-2 text-center">
//               <button onClick={() => console.log('View Pending Data')} className="text-blue-600 hover:underline">
//                 View
//               </button>
//             </td>
//           </tr>
//         </tbody>
//       </table>
//     </div>
//   );
// };


// export default LiveChallanPanel;