// components/PendingChallansModal.tsx
import React from 'react';

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

const PendingChallansModal: React.FC<PendingChallansModalProps> = ({ isOpen, onClose, pendingChallans }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
        <h2 className="text-lg font-semibold mb-4">Pending Challans</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Challan Place</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Owner Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Challan Date Time</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fine Imposed</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">RTO District Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Challan Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pendingChallans.map((challan, index) => (
              <tr key={index}>
                <td className="px-4 py-2 text-sm">{challan.challan_place}</td>
                <td className="px-4 py-2 text-sm">{challan.owner_name}</td>
                <td className="px-4 py-2 text-sm">{challan.challan_date_time}</td>
                <td className="px-4 py-2 text-sm">{challan.fine_imposed}</td>
                <td className="px-4 py-2 text-sm">{challan.rto_distric_name}</td>
                <td className="px-4 py-2 text-sm">{challan.challan_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          Close
        </button>
      </div>
    </div>
  );
};

export default PendingChallansModal;