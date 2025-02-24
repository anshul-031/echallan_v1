'use client';

import { useState } from 'react';
import {
  UsersIcon,
  DocumentTextIcon,
  CogIcon,
  BellIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  TruckIcon,
  BriefcaseIcon,
  NewspaperIcon,
  EnvelopeIcon,
  InboxStackIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', icon: ChartBarIcon },
  { name: 'Company Management', icon: BuildingOfficeIcon },
  { name: 'Employee Management', icon: UserGroupIcon },
  { name: 'Vendor Management', icon: ShoppingBagIcon },
  { name: 'User Management', icon: UsersIcon },
  { name: 'Vehicles Management', icon: TruckIcon },
  { name: 'Apply Online Data', icon: DocumentTextIcon },
  { name: 'Job Management', icon: BriefcaseIcon },
  { name: 'Blog Management', icon: NewspaperIcon },
  { name: 'Contact Management', icon: EnvelopeIcon },
  { name: 'Newsletter Management', icon: InboxStackIcon },
  { name: 'Bulk Data Management', icon: DocumentTextIcon },
];

const summaryCards = [
  {
    title: 'Total Users',
    count: '1,234',
    icon: UsersIcon,
    color: 'bg-blue-500',
  },
  {
    title: 'Active Sessions',
    count: '56',
    icon: DocumentTextIcon,
    color: 'bg-green-500',
  },
  {
    title: 'System Health',
    count: '98%',
    icon: ChartBarIcon,
    color: 'bg-purple-500',
  },
  {
    title: 'Alerts',
    count: '3',
    icon: BellIcon,
    color: 'bg-red-500',
  },
];

const users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-01-23 10:30 AM',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'Active',
    lastLogin: '2024-01-23 09:15 AM',
  },
];

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [selectedNav, setSelectedNav] = useState('Dashboard');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Navigation Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setSelectedNav(item.name)}
                  className={`${
                    selectedNav === item.name
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
                >
                  <item.icon
                    className={`${
                      selectedNav === item.name
                        ? 'text-gray-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Admin Dashboard</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {summaryCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{card.title}</p>
                    <p className="text-2xl font-semibold mt-2">{card.count}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                    <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Content for selected navigation item would go here */}
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {selectedNav}
              </h2>
              <p className="text-gray-500">
                Content for {selectedNav} will be displayed here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}