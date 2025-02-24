'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search vehicle by registration number, chassis number..."
          className="w-full h-12 pl-12 pr-10 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
        />
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Clear search"
          >
            <XMarkIcon className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
      
      {/* Optional: Search suggestions dropdown */}
      {searchQuery && (
        <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
          <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
            <p className="text-sm font-medium text-gray-900">MH02BR5544</p>
            <p className="text-xs text-gray-500">Toyota Innova • Mumbai</p>
          </div>
          <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
            <p className="text-sm font-medium text-gray-900">MH02BR5545</p>
            <p className="text-xs text-gray-500">Maruti Swift • Mumbai</p>
          </div>
        </div>
      )}
    </div>
  );
}