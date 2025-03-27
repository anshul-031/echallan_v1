import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

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
  receipt_no?: string;
  remark?: string;
}

interface ChallanDetailPopupProps {
  challan: ChallanType;
  onClose: () => void;
}

export function ChallanDetailPopup({ challan, onClose }: ChallanDetailPopupProps) {
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                    Challan Details
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Challan No</p>
                      <p className="text-sm font-medium text-gray-900">{challan.challan_no}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${challan.challan_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {challan.challan_status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="text-sm font-medium text-gray-900">₹{challan.fine_imposed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {challan.challan_date_time.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">State</p>
                      <p className="text-sm font-medium text-gray-900">{challan.state_code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Court Type</p>
                      <p className="text-sm font-medium text-gray-900">
                        {challan.sent_to_reg_court === "Yes" ? 'Regular Court' : 'Virtual Court'}
                      </p>
                    </div>
                    {challan.remark && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Remark</p>
                        <p className="text-sm font-medium text-gray-900">{challan.remark}</p>
                      </div>
                    )}
                    {challan.receipt_no && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Receipt No</p>
                        <p className="text-sm font-medium text-gray-900">{challan.receipt_no}</p>
                      </div>
                    )}
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

// const [selectedChallan, setSelectedChallan] = useState<ChallanType | null>(null);

<td className="px-6 py-4 text-center">
  {/* <button 
    onClick={() => {
      const vehicleChallans = challans.filter(c => c.rc_no === row.rc_no);
      setSelectedChallan(vehicleChallans[0]); // Shows first challan by default
    }}
    className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full"
  >
    <EyeIcon className="w-5 h-5" />
  </button> */}
</td>

// {selectedChallan && (
//   <ChallanDetailPopup
//     challan={selectedChallan}
//     onClose={() => setSelectedChallan(null)}
//   />
// )}