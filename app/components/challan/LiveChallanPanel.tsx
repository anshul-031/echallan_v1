'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, ArrowPathIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

const liveData = [
  {
    id: 1,
    vehicleNo: 'RJ09GB9453',
    location: 'Main Street',
    timestamp: '2 mins ago',
    status: 'Active'
  },
  {
    id: 2,
    vehicleNo: 'RJ09GB9450',
    location: 'Highway 101',
    timestamp: '5 mins ago',
    status: 'Active'
  }
];

export default function LiveChallanPanel() {
  const [searchQuery, setSearchQuery] = useState('');

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
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {liveData.map((item) => (
          <div
            key={item.id}
            className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-gray-900">{item.vehicleNo}</h3>
                <p className="text-sm text-gray-500">{item.location}</p>
              </div>
              <span className="text-xs text-gray-500">{item.timestamp}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                {item.status}
              </span>
              <div className="flex space-x-2">
                <button className="p-1 text-blue-600 hover:bg-blue-50 rounded-full">
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button className="p-1 text-red-600 hover:bg-red-50 rounded-full">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}