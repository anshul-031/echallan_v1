import { useState } from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';

interface ChallanType {
  id: string;
  rc_no: string;
  challan_no: string;
  challan_status: string;
  sent_to_reg_court: string;
  sent_to_virtual_court: boolean;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Challan Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <EyeIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-3">
          <p><strong>Challan No:</strong> {challan.challan_no}</p>
          <p><strong>Status:</strong> 
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium 
              ${challan.challan_status === 'Pending' ? 
                'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'}`}>
              {challan.challan_status}
            </span>
          </p>
          <p><strong>Amount:</strong> ₹{challan.fine_imposed}</p>
          <p><strong>Date:</strong> {challan.challan_date_time.toLocaleString()}</p>
          <p><strong>State:</strong> {challan.state_code}</p>
          <p><strong>Court Type:</strong> {challan.sent_to_reg_court === "Yes" ? 'Regular Court' : 'Virtual Court'}</p>
          {challan.remark && <p><strong>Remark:</strong> {challan.remark}</p>}
          {challan.receipt_no && <p><strong>Receipt No:</strong> {challan.receipt_no}</p>}
        </div>
        <button 
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}

const [selectedChallan, setSelectedChallan] = useState<ChallanType | null>(null);

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

{selectedChallan && (
  <ChallanDetailPopup
    challan={selectedChallan}
    onClose={() => setSelectedChallan(null)}
  />
)}