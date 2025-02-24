'use client';

import { useState } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  TruckIcon,
  BoltIcon,
  CalendarIcon,
  MapPinIcon,
  DocumentChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const insightCards = [
  {
    title: 'Total Distance',
    value: '24,589',
    unit: 'km',
    change: '+12%',
    isIncrease: true,
    icon: TruckIcon,
    color: 'from-blue-500 to-blue-600',
    textGradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
    iconGradient: 'bg-gradient-to-br from-blue-500/10 to-blue-600/10',
    borderColor: 'border-blue-100',
    shadowColor: 'shadow-blue-500/20',
    details: [
      { label: 'Highway', value: '18,432 km' },
      { label: 'City', value: '6,157 km' }
    ]
  },
  {
    title: 'Average Speed',
    value: '45',
    unit: 'km/h',
    change: '-3%',
    isIncrease: false,
    icon: BoltIcon,
    color: 'from-amber-500 to-amber-600',
    textGradient: 'bg-gradient-to-r from-amber-500 to-amber-600',
    iconGradient: 'bg-gradient-to-br from-amber-500/10 to-amber-600/10',
    borderColor: 'border-amber-100',
    shadowColor: 'shadow-amber-500/20',
    details: [
      { label: 'Peak', value: '65 km/h' },
      { label: 'Off-Peak', value: '35 km/h' }
    ]
  },
  {
    title: 'Active Hours',
    value: '186',
    unit: 'hrs',
    change: '+8%',
    isIncrease: true,
    icon: ClockIcon,
    color: 'from-purple-500 to-purple-600',
    textGradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
    iconGradient: 'bg-gradient-to-br from-purple-500/10 to-purple-600/10',
    borderColor: 'border-purple-100',
    shadowColor: 'shadow-purple-500/20',
    details: [
      { label: 'Day', value: '142 hrs' },
      { label: 'Night', value: '44 hrs' }
    ]
  },
  {
    title: 'Fuel Efficiency',
    value: '8.2',
    unit: 'km/l',
    change: '+5%',
    isIncrease: true,
    icon: ChartBarIcon,
    color: 'from-emerald-500 to-emerald-600',
    textGradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    iconGradient: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10',
    borderColor: 'border-emerald-100',
    shadowColor: 'shadow-emerald-500/20',
    details: [
      { label: 'Best', value: '9.5 km/l' },
      { label: 'Worst', value: '6.8 km/l' }
    ]
  }
];

const performanceMetrics = [
  { label: 'On-Time Deliveries', value: '94%', trend: '+2.5%', isPositive: true },
  { label: 'Route Compliance', value: '88%', trend: '+4.2%', isPositive: true },
  { label: 'Idle Time', value: '12%', trend: '-1.8%', isPositive: true },
  { label: 'Maintenance Score', value: '96%', trend: '+1.2%', isPositive: true }
];

const timeRanges = [
  { value: 'day', label: 'Last 24 Hours' },
  { value: 'week', label: 'Last Week' },
  { value: 'month', label: 'Last Month' },
  { value: 'quarter', label: 'Last Quarter' },
  { value: 'year', label: 'Last Year' }
];

export default function InsightsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Usage Insights</h1>
            <p className="text-sm text-gray-500 mt-1">Analytics and performance metrics</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <button 
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => window.location.reload()}
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insightCards.map((card, index) => (
            <div
              key={card.title}
              className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer
                transform hover:scale-[1.02] hover:-translate-y-1`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Animated Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 
                transition-opacity duration-300 blur-xl
                ${hoveredCard === index ? 'opacity-20' : ''}`}
              />
              
              {/* Card Content */}
              <div className={`relative bg-white border ${card.borderColor} p-6 h-full
                transition-all duration-300
                ${hoveredCard === index ? card.shadowColor : 'shadow-sm'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${card.iconGradient}`}>
                        <card.icon className={`w-5 h-5 ${card.textGradient} bg-clip-text`} />
                      </div>
                      <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                    </div>
                    <div className="mt-2 flex items-baseline">
                      <p className={`text-2xl font-bold ${card.textGradient} bg-clip-text text-transparent`}>
                        {card.value}
                      </p>
                      <span className="ml-1 text-sm text-gray-500">{card.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {card.isIncrease ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className={card.isIncrease ? 'text-green-500' : 'text-red-500'}>
                      {card.change}
                    </span>
                  </div>
                </div>

                {/* Details Section - Automatically shows on hover */}
                <div className={`mt-4 space-y-2 transition-all duration-300 ease-in-out
                  ${hoveredCard === index ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}
                >
                  {card.details.map((detail, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-500">{detail.label}</span>
                      <span className="text-sm font-medium text-gray-900">{detail.value}</span>
                    </div>
                  ))}
                </div>

                {/* Hover Effect Indicator */}
                <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full transition-all duration-300
                  bg-gradient-to-r ${card.color}
                  ${hoveredCard === index ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Performance Metrics and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {performanceMetrics.map((metric, index) => (
                <div 
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-500">{metric.label}</span>
                    <div className="flex items-center space-x-1">
                      {metric.isPositive ? (
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                      )}
                      <span className={metric.isPositive ? 'text-green-500' : 'text-red-500'}>
                        {metric.trend}
                      </span>
                    </div>
                  </div>
                  <p className="text-2xl font-semibold mt-2">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Usage Trends</h2>
            <div className="h-[300px] bg-gray-50 rounded-lg flex items-center justify-center">
              <DocumentChartBarIcon className="w-12 h-12 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Routes</h3>
            <div className="space-y-4">
              {[
                { route: 'Mumbai → Delhi', trips: 45, distance: '1,400 km' },
                { route: 'Delhi → Jaipur', trips: 32, distance: '280 km' },
                { route: 'Pune → Mumbai', trips: 28, distance: '150 km' }
              ].map((route, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{route.route}</p>
                      <p className="text-xs text-gray-500">{route.distance}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{route.trips} trips</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Hours</h3>
            <div className="space-y-4">
              {[
                { time: '08:00 - 10:00', usage: '85%', type: 'Morning' },
                { time: '12:00 - 14:00', usage: '75%', type: 'Afternoon' },
                { time: '17:00 - 19:00', usage: '90%', type: 'Evening' }
              ].map((peak, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{peak.time}</p>
                      <p className="text-xs text-gray-500">{peak.type} Peak</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{peak.usage} usage</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Overview</h3>
            <div className="space-y-4">
              {[
                { month: 'January', trips: 245, growth: '+12%' },
                { month: 'February', trips: 278, growth: '+8%' },
                { month: 'March', trips: 312, growth: '+15%' }
              ].map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{month.month}</p>
                      <p className="text-xs text-gray-500">{month.trips} trips</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-500">{month.growth}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}