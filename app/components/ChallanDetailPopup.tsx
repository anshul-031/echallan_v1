import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';

interface ChallanType {
  rc_no: string;
  challan_no: string;
  challan_status: 'Pending' | 'Disposed';
  fine_imposed: string;
  state_code: string;
  challan_date_time: Date;
}

interface ChallanDetailPopupProps {
  challans: ChallanType[];
  onClose: () => void;
}

export function ChallanDetailPopup({ challans , onClose }: ChallanDetailPopupProps) {
  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                    Challan Details
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Challan No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {challans.map((challan) => (
                          <tr key={challan.challan_no} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">{challan.challan_no}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${challan.challan_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                {challan.challan_status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">₹{challan.fine_imposed}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{challan.state_code}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(challan.challan_date_time).toLocaleDateString('en-IN', {
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// const [selectedChallans, setSelectedChallans] = useState<ChallanType[]>([]);

{/* <td className="px-6 py-4 text-center">
  <button 
    onClick={() => {
      const vehicleChallans = challans.filter((c: ChallanType) => c.rc_no === 'some_rc_no'); // Replace 'some_rc_no' with the actual RC number logic
      setSelectedChallans(vehicleChallans);
    }}
    className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full"
  >
    <EyeIcon className="w-5 h-5" />
  </button>
</td>

{selectedChallans.length > 0 && (
  <ChallanDetailPopup
    challans={selectedChallans}
    onClose={() => setSelectedChallans([])}
  />
)} */}