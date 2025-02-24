'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  TicketIcon,
  ArrowPathIcon,
  MapIcon,
  ChartBarIcon,
  CreditCardIcon,
  CodeBracketIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Fleet Dashboard', href: '/dashboard', icon: HomeIcon, color: '#2D9CDB' },
  { name: 'E-Challan', href: '/challan', icon: TicketIcon, color: '#F2994A' },
  { name: 'Renewals', href: '/renewals', icon: ArrowPathIcon, color: '#27AE60' },
  { name: 'Real Time Tracking', href: '/tracking', icon: MapIcon, color: '#9B51E0' },
  { name: 'Usage Insights', href: '/insights', icon: ChartBarIcon, color: '#EB5757' },
  { name: 'Credits and Pricing', href: '/credits', icon: CreditCardIcon, color: '#219653' },
  { name: 'API History', href: '/api-history', icon: CodeBracketIcon, color: '#6B7280' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const profileMenu = document.getElementById('profile-menu');
      const profileButton = document.getElementById('profile-button');
      
      if (profileMenu && profileButton && 
          !profileMenu.contains(event.target as Node) && 
          !profileButton.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profileMenuItems = [
    { name: 'My Profile', icon: UserIcon, href: '/profile' },
    { name: 'Settings', icon: Cog6ToothIcon, href: '/settings' },
    { name: 'Notifications', icon: BellIcon, href: '/notifications' },
    { name: 'Logout', icon: ArrowRightOnRectangleIcon, href: '/auth/login' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-gray-50"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-40 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col bg-[#F7F9FC] border-r border-[#E4E7EC] ${
          isCollapsed ? 'w-20' : 'w-64'
        } h-screen`}
      >
        {/* Header */}
        <div className={`flex items-center h-16 px-4 border-b border-[#E4E7EC] ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center">
            <Image
              src="https://echallan.app/application/fleet/logoicon.png"
              alt="Fleet Manager"
              width={48}
              height={48}
              className={`
                object-contain
                transition-all duration-1000
                hover:rotate-360
                ${isCollapsed ? 'animate-spin-slow' : ''}
              `}
              style={{
                padding: '4px',
                margin: isCollapsed ? '0' : '0 8px 0 0'
              }}
            />
            {!isCollapsed && (
              <h1 className="ml-3 text-xl font-bold text-[#2D3748] transition-opacity duration-300">
                Fleet Manager
              </h1>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="p-2 rounded-lg hover:bg-[#EDF2F7] flex items-center justify-center text-[#4A5568] transition-colors ml-2"
              aria-label="Collapse sidebar"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Collapse button for collapsed state */}
        {isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="absolute top-4 -right-3 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 text-[#4A5568] transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setIsOpen(false);
                  }
                }}
                className={`flex items-center ${
                  isCollapsed ? 'justify-center' : 'px-4'
                } py-3 rounded-lg group transition-all duration-200 ${
                  isActive
                    ? 'bg-white shadow-sm'
                    : 'hover:bg-white hover:shadow-sm'
                }`}
              >
                <item.icon 
                  className={`w-6 h-6 ${isCollapsed ? 'mx-0' : 'mr-3'}`}
                  style={{ color: item.color }}
                />
                {!isCollapsed && (
                  <span 
                    className="whitespace-nowrap font-medium"
                    style={{ color: isActive ? item.color : '#4A5568' }}
                  >
                    {item.name}
                  </span>
                )}
                {isCollapsed && (
                  <div className="absolute left-16 transform -translate-x-2 bg-[#2D3748] text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile Section */}
        <div className={`p-4 border-t border-[#E4E7EC] relative`}>
          <button
            id="profile-button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`w-full flex ${isCollapsed ? 'justify-center' : 'items-center space-x-3'} 
              group transition-transform duration-300 hover:scale-105`}
          >
            <div className="relative">
              <UserCircleIcon className="w-10 h-10 text-gray-400 transition-transform duration-300 group-hover:rotate-12" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            {!isCollapsed && (
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-700">John Doe</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            )}
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div
              id="profile-menu"
              className={`absolute ${isCollapsed ? 'left-20' : 'left-4'} bottom-full mb-2 w-48 
                bg-white rounded-lg shadow-lg border border-gray-100 py-2 
                transform origin-bottom-left transition-all duration-200 
                animate-[fadeIn_0.2s_ease-in-out]`}
            >
              {profileMenuItems.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 
                    transition-colors duration-150
                    ${index === profileMenuItems.length - 1 ? 'text-red-600 hover:text-red-700' : ''}
                    animate-[slideIn_0.2s_ease-in-out]`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}