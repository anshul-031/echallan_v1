'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ChartBarIcon,
    BuildingOfficeIcon,
    UserGroupIcon,
    TruckIcon,
    BriefcaseIcon,
    NewspaperIcon,
    EnvelopeIcon,
    InboxStackIcon,
    ShoppingBagIcon,
    UsersIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: ChartBarIcon },
    { name: 'Company Management', href: '/admin/company', icon: BuildingOfficeIcon },
    { name: 'Employee Management', href: '/admin/employee', icon: UserGroupIcon },
    { name: 'Vendor Management', href: '/admin/vendor', icon: ShoppingBagIcon },
    { name: 'User Management', href: '/admin/user', icon: UsersIcon },
    { name: 'Vehicles Management', href: '/admin/vehicles', icon: TruckIcon },
    { name: 'Apply Online Data', href: '/admin/apply-online', icon: DocumentTextIcon },
    { name: 'Job Management', href: '/admin/jobs', icon: BriefcaseIcon },
    { name: 'Blog Management', href: '/admin/blog', icon: NewspaperIcon },
    { name: 'Contact Management', href: '/admin/contact', icon: EnvelopeIcon },
    { name: 'Newsletter Management', href: '/admin/newsletter', icon: InboxStackIcon },
    { name: 'Bulk Data Management', href: '/admin/bulk-data', icon: DocumentTextIcon },
];

export default function AdminNav() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Desktop Navigation Sidebar */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
                    <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4">
                            <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
                        </div>
                        <nav className="mt-5 flex-1 px-2 space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`${pathname === item.href
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                                >
                                    <item.icon
                                        className={`${pathname === item.href
                                            ? 'text-gray-500'
                                            : 'text-gray-400 group-hover:text-gray-500'
                                            } mr-3 flex-shrink-0 h-6 w-6`}
                                    />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="fixed top-4 right-4 z-50 p-2 rounded-md bg-white shadow-md text-gray-500 hover:text-gray-600 focus:outline-none"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 flex">
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
                        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                                <div className="flex-shrink-0 flex items-center px-4">
                                    <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
                                </div>
                                <nav className="mt-5 px-2 space-y-1">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`${pathname === item.href
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                                        >
                                            <item.icon
                                                className={`${pathname === item.href
                                                    ? 'text-gray-500'
                                                    : 'text-gray-400 group-hover:text-gray-500'
                                                    } mr-4 flex-shrink-0 h-6 w-6`}
                                            />
                                            {item.name}
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}