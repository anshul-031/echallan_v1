'use client';

import { TruckIcon, DocumentIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const summaryData = [
  {
    title: 'Total Vehicles',
    count: 213,
    icon: TruckIcon,
    color: 'bg-[#2D5DE9]'
  },
  {
    title: 'Expiring Documents',
    count: 36,
    icon: DocumentIcon,
    color: 'bg-[#FFB946]'
  },
  {
    title: 'Expired Documents',
    count: 9,
    icon: ExclamationCircleIcon,
    color: 'bg-[#F7685B]'
  }
];

export default function ChallanSummary() {
  return (
    <div className="overflow-x-auto -mx-3 px-3">
      <div className="flex space-x-4 min-w-max">
        {summaryData.map((item) => (
          <div
            key={item.title}
            className="zoho-card w-72"
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${item.color} bg-opacity-10`}>
                <item.icon className={`w-6 h-6 ${item.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="zoho-text-secondary">{item.title}</p>
                <p className="zoho-heading-xl mt-1">{item.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}