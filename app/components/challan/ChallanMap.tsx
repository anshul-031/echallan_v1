'use client';

import { MapPinIcon } from '@heroicons/react/24/solid';

export default function ChallanMap() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Violation Locations</h2>
        <button className="text-sm text-blue-500 dark:text-blue-400">View All</button>
      </div>
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400 flex items-center">
            <MapPinIcon className="w-5 h-5 mr-2" />
            Map integration placeholder
          </p>
        </div>
      </div>
    </div>
  );
}