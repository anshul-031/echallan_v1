'use client';

import { useState } from 'react';
import {
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const statusCards = [
  {
    title: 'Received Vehicles',
    count: 0,
    icon: <TruckIcon className="w-6 h-6 text-blue-500" />,
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Processed',
    count: 0,
    icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
    bgColor: 'bg-green-50'
  },
  {
    title: 'Pending',
    count: 0,
    icon: <ClockIcon className="w-6 h-6 text-orange-500" />,
    bgColor: 'bg-orange-50'
  },
  {
    title: 'Delivered',
    count: 0,
    icon: <TruckIcon className="w-6 h-6 text-indigo-500" />,
    bgColor: 'bg-indigo-50'
  }
];

const serviceSteps = [
  { id: 1, name: 'Government Fees', completed: true },
  { id: 2, name: 'RTO Approval', completed: true },
  { id: 3, name: 'Inspection', completed: true },
  { id: 4, name: 'Certificate', completed: true },
  { id: 5, name: 'Document Delivered', completed: true }
];

export default function TrackingDashboard() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-gray-900">Real Time Tracking Dashboard</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCards.map((card) => (
            <div
              key={card.title}
              className={`${card.bgColor} rounded-lg p-4 shadow-sm border border-gray-100`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-2xl font-semibold mt-1">{card.count}</p>
                </div>
                <div className="p-2 rounded-full bg-white/60">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tracking Table */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SL.NO.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        VEHICLE NO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SERVICES
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STATUS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Empty state message */}
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No vehicles currently being tracked
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex items-center">
                  <button className="p-1 rounded-md hover:bg-gray-100">
                    <ArrowPathIcon className="w-5 h-5 text-gray-400" />
                  </button>
                  <span className="ml-3 text-sm text-gray-500">
                    Total Pages: 0
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md">
                    Previous
                  </button>
                  <button className="p-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Service Progress */}
          <div className="w-full lg:w-72">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="space-y-4">
                {serviceSteps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center space-x-3"
                  >
                    <div className={`p-1 rounded-full ${
                      step.completed ? 'bg-gray-100' : 'bg-gray-50'
                    }`}>
                      <CheckIcon className={`w-5 h-5 ${
                        step.completed ? 'text-gray-500' : 'text-gray-300'
                      }`} />
                    </div>
                    <span className={`text-sm ${
                      step.completed ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}