'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  BellIcon,
  KeyIcon,
  DocumentTextIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Fleet Dashboard', href: '/dashboard', icon: HomeIcon, color: '#2D9CDB' },
  { name: 'E-Challan', href: '/challan', icon: TicketIcon, color: '#F2994A' },
  { name: 'Renewals', href: '/renewals', icon: ArrowPathIcon, color: '#27AE60' },
  { name: 'Real Time Tracking', href: '/tracking', icon: MapIcon, color: '#9B51E0' },
  { name: 'Usage Insights', href: '/insights', icon: ChartBarIcon, color: '#EB5757' },
  { name: 'Credits and Pricing', href: '/credits', icon: CreditCardIcon, color: '#219653' },
  { name: 'API History', href: '/api-history', icon: CodeBracketIcon, color: '#6B7280' },
  { name: 'API Credentials', href: '/api-credentials', icon: KeyIcon, color: '#F59E0B' },
  { name: 'API Documentation', href: '/api-docs', icon: BookOpenIcon, color: '#3B82F6' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState<number | null>(null);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavHover = (index: number | null) => {
    setActiveNavItem(index);
  };

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
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-40 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-all duration-300 ease-in-out flex flex-col bg-[#F7F9FC] dark:bg-gray-900 border-r border-[#E4E7EC] dark:border-gray-800 h-screen ${isCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        <div className={`flex items-center h-16 px-4 border-b border-[#E4E7EC] dark:border-gray-800 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center">
            <Image
              src="https://echallan.app/application/fleet/logoicon.png"
              alt="Fleet Manager"
              width={56}
              height={56}
              className="transition-all duration-500 hover:rotate-360"
              style={{ padding: '2px' }}
            />
            <div className={`ml-2 flex items-center transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>
              <h1 className="text-xl font-bold text-[#2D3748] dark:text-white">
                Fleet Manager
              </h1>
            </div>
          </div>
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="p-2 rounded-lg hover:bg-[#EDF2F7] dark:hover:bg-gray-800 flex items-center justify-center text-[#4A5568] dark:text-gray-300 transition-colors ml-2"
              aria-label="Collapse sidebar"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="absolute top-4 -right-3 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-[#4A5568] dark:text-gray-300 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        )}

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            const isHovered = activeNavItem === index;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setIsOpen(false);
                  }
                }}
                onMouseEnter={() => handleNavHover(index)}
                onMouseLeave={() => handleNavHover(null)}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'
                  } py-3 rounded-lg group transition-all duration-200 ${isActive
                    ? 'bg-white dark:bg-gray-800 shadow-sm'
                    : 'hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm'
                  }`}
              >
                <div className={`relative transition-all duration-300 ${(isActive || isHovered) && !isCollapsed ? 'scale-110' : ''
                  }`}>
                  <item.icon
                    className={`w-6 h-6 ${isCollapsed ? 'mx-0' : 'mr-3'} transition-all duration-300`}
                    style={{ color: item.color }}
                  />

                  {isActive && (
                    <span
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-current animate-pulse"
                      style={{ color: item.color }}
                    ></span>
                  )}
                </div>

                <span
                  className={`whitespace-nowrap font-medium transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 absolute' : 'opacity-100 w-auto relative'
                    }`}
                  style={{ color: isActive ? item.color : '#4A5568' }}
                >
                  {item.name}
                </span>

                {isCollapsed && (
                  <div className={`absolute left-16 transform -translate-x-2 bg-[#2D3748] dark:bg-gray-700 text-white px-2 py-1 rounded text-sm 
                    transition-all duration-200 whitespace-nowrap z-50 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
                    }`}>
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E4E7EC] dark:border-gray-800 relative">
          <button
            id="profile-button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`w-full flex ${isCollapsed ? 'justify-center' : 'items-center space-x-3'} 
              group transition-transform duration-300 hover:scale-105`}
          >
            <div className="relative">
              <UserCircleIcon className="w-10 h-10 text-gray-400 dark:text-gray-300 transition-transform duration-300 group-hover:rotate-12" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div className={`flex-1 text-left transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 absolute' : 'opacity-100 w-auto relative'
              }`}>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">John Doe</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
            </div>
          </button>

          {showProfileMenu && (
            <div
              id="profile-menu"
              className={`absolute ${isCollapsed ? 'left-20' : 'left-4'} bottom-full mb-2 w-48 
                bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-2 
                transform origin-bottom-left transition-all duration-200 
                animate-[fadeIn_0.2s_ease-in-out] overflow-hidden`}
            >
              {profileMenuItems.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 
                    transition-colors duration-150
                    ${index === profileMenuItems.length - 1 ? 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300' : ''}
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