'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, CalendarIcon, DocumentTextIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

const violations = [
  {
    id: 1,
    vrn: 'RJ09GB9453',
    details: {
      roadTax: '27-03-2025',
      fitness: '27-03-2025',
      insurance: '27-03-2025',
      permit: 'Not available'
    }
  },
  {
    id: 2,
    vrn: 'RJ09GB9450',
    details: {
      roadTax: '12-05-2025',
      fitness: '12-05-2025',
      insurance: '12-05-2025',
      permit: 'Not available'
    }
  }
];

export default function ChallanList() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-base font-semibold">Recent Violations</h2>
      </div>
      
      {/* Mobile View */}
      <div className="lg:hidden">
        {/* Table Header */}
        <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b dark:border-gray-700 bg-gray-50">
          <div className="text-xs font-medium text-gray-500 uppercase">#</div>
          <div className="text-xs font-medium text-gray-500 uppercase">VRN</div>
          <div className="text-xs font-medium text-gray-500 uppercase text-center">Action</div>
        </div>

        {/* Table Body */}
        {violations.map((violation) => (
          <div 
            key={violation.id} 
            className="border-b dark:border-gray-700 hover:bg-gray-50"
          >
            <div className="grid grid-cols-3 gap-2 px-4 py-3 items-center">
              <div className="text-sm text-gray-500">#{violation.id}</div>
              <div className="text-sm font-medium text-gray-900">{violation.vrn}</div>
              <div className="flex justify-center">
                <button 
                  onClick={() => setExpandedId(expandedId === violation.id ? null : violation.id)}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <EllipsisHorizontalIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Expandable Details */}
            {expandedId === violation.id && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Road Tax:</span>
                    <span className="text-sm font-medium">{violation.details.roadTax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fitness:</span>
                    <span className="text-sm font-medium">{violation.details.fitness}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Insurance:</span>
                    <span className="text-sm font-medium">{violation.details.insurance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Permit:</span>
                    <span className="text-sm font-medium text-red-500">{violation.details.permit}</span>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2 mt-2 border-t border-gray-200">
                    <button className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
                      Update
                    </button>
                    <button className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg">
                      View
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block divide-y dark:divide-gray-700">
        {violations.map((violation) => (
          <div 
            key={violation.id} 
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedId(expandedId === violation.id ? null : violation.id)}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">{violation.vrn}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <CalendarIcon className="w-3.5 h-3.5 inline mr-1" />
                      Last updated: Today
                    </p>
                  </div>
                </div>
              </div>
              <button 
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                aria-label={expandedId === violation.id ? "Hide details" : "Show details"}
              >
                {expandedId === violation.id ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
            
            {expandedId === violation.id && (
              <div className="mt-4 space-y-3 text-sm bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Road Tax</span>
                  <span className="font-medium">{violation.details.roadTax}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Fitness</span>
                  <span className="font-medium">{violation.details.fitness}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Insurance</span>
                  <span className="font-medium">{violation.details.insurance}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Permit</span>
                  <span className="font-medium text-red-500">{violation.details.permit}</span>
                </div>
                <div className="flex justify-end space-x-2 mt-4 pt-3 border-t dark:border-gray-600">
                  <button className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    Update
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
                    View Documents
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Showing 1-10 of 50 entries</span>
          <div className="flex items-center space-x-1">
            <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50">
              ←
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50">
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}