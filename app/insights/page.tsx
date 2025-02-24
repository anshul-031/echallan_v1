'use client';

import { useState } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const insightCards = [
  {
    title: 'Total Distance',
    value: '24,589 km',
    change: '+12%',
    isIncrease: true,
    icon: ChartBarIcon,
    color: 'bg-blue-500'
  },
  {
    title: 'Average Speed',
    value: '45 km/h',
    change: '-3%',
    isIncrease: false,
    icon: ArrowTrendingUpIcon,
    color: 'bg-green-500'
  },
  {
    title: 'Active Hours',
    value: '186 hrs',
    change: '+8%',
    isIncrease: true,
    icon: ClockIcon,
    color: 'bg-purple-500'
  },
  {
    title: 'Fuel Efficiency',
    value: '8.2 km/l',
    change: '+5%',
    isIncrease: true,
    icon: ArrowTrendingDownIcon,
    color: 'bg-orange-500'
  }
];

export default function InsightsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Usage Insights</h1>
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insightCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${card.color} bg-opacity-10`}>
                  <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
                </div>
                <span className={`text-sm font-medium ${
                  card.isIncrease ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.change}
                </span>
              </div>
              <h3 className="text-sm text-gray-600">{card.title}</h3>
              <p className="text-2xl font-semibold mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Placeholder for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-4 min-h-[400px]">
            <h3 className="text-lg font-medium mb-4">Vehicle Usage Trends</h3>
            <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart placeholder</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 min-h-[400px]">
            <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
            <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}