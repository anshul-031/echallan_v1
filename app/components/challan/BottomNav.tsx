'use client';

import { HomeIcon, TruckIcon, ClockIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { id: 'vehicles', label: 'Vehicles', icon: TruckIcon },
  { id: 'history', label: 'History', icon: ClockIcon },
  { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
];

export default function BottomNav() {
  const [active, setActive] = useState('dashboard');

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`flex flex-col items-center py-3 px-5 ${
              active === item.id
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}