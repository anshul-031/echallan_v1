import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ChallanDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  challans: any[];
}

export function ChallanDetails({ isOpen, onClose, challans }: ChallanDetailsProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl rounded bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium">
              Challan Details
            </Dialog.Title>
            <button onClick={onClose} className="p-1">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Challan Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Challan No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {challans.map((challan, index) => (
                  <tr key={challan.challan_no}>
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {challan.challan_status === 'Pending' ? 'Pending Challan' : 'Disposed Challan'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{challan.challan_no}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(challan.challan_date_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">₹{challan.fine_imposed}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{challan.challan_status}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{challan.state_code}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">Pay</button>
                        <button className="text-green-600 hover:text-green-800">Update</button>
                        <button className="text-red-600 hover:text-red-800">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}