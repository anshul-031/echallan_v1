// // components/PendingChallansModal.tsx
// import React from 'react';

// interface PendingChallansModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   pendingChallans: Array<{
//     challan_place: string;
//     owner_name: string;
//     challan_date_time: string;
//     fine_imposed: string;
//     rto_distric_name: string;
//     challan_status: string;
//   }>;
// }

// const PendingChallansModal: React.FC<PendingChallansModalProps> = ({ isOpen, onClose, pendingChallans }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//       <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
//         <h2 className="text-lg font-semibold mb-4">Pending Challans</h2>
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Challan Place</th>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Owner Name</th>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Challan Date Time</th>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fine Imposed</th>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">RTO District Name</th>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Challan Status</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {pendingChallans.map((challan, index) => (
//               <tr key={index}>
//                 <td className="px-4 py-2 text-sm">{challan.challan_place}</td>
//                 <td className="px-4 py-2 text-sm">{challan.owner_name}</td>
//                 <td className="px-4 py-2 text-sm">{challan.challan_date_time}</td>
//                 <td className="px-4 py-2 text-sm">{challan.fine_imposed}</td>
//                 <td className="px-4 py-2 text-sm">{challan.rto_distric_name}</td>
//                 <td className="px-4 py-2 text-sm">{challan.challan_status}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
//           Close
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PendingChallansModal;

import React from 'react';
import { 
  XMarkIcon, 
  DocumentCheckIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface PendingChallansModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingChallans: Array<{
    challan_place: string;
    owner_name: string;
    challan_date_time: string;
    fine_imposed: string;
    rto_distric_name: string;
    challan_status: string;
  }>;
}

const PendingChallansModal: React.FC<PendingChallansModalProps> = ({ 
  isOpen, 
  onClose, 
  pendingChallans 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-0 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <DocumentCheckIcon className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Challan Details 
              <span className="ml-2 text-sm text-gray-500">
                ({pendingChallans.length} Records)
              </span>
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {[
                  'Challan Place', 
                  'Owner Name', 
                  'Challan Date', 
                  'Fine Imposed', 
                  'RTO District', 
                  'Status'
                ].map((header) => (
                  <th 
                    key={header}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingChallans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500" />
                      <p className="text-gray-600 text-lg">No Challans Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pendingChallans.map((challan, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {challan.challan_place}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {challan.owner_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {challan.challan_date_time}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-red-600">
                      ₹ {challan.fine_imposed}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {challan.rto_distric_name}
                    </td>
                    <td className="px-4 py-3">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          challan.challan_status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {challan.challan_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
            <span className="text-sm text-gray-600">
              Please clear your pending challans to avoid further penalties.
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingChallansModal;