'use client';

import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
    const { data: session } = useSession();
    const [showDropdown, setShowDropdown] = useState(false);
    const router = useRouter();

    return (
        <header className="bg-white shadow-sm">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex-1"></div>
                    <div className="flex items-center">
                        <div className="ml-3 relative">
                            <div>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center max-w-xs bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <span className="sr-only">Open user menu</span>
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-gray-700">{session?.user?.name || session?.user?.email}</span>
                                </button>
                            </div>
                            {showDropdown && (
                                <div
                                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                                    role="menu"
                                    aria-orientation="vertical"
                                    aria-labelledby="user-menu"
                                >
                                    <a
                                        href="/admin/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowDropdown(false);
                                            router.push('/admin/profile');
                                        }}
                                    >
                                        My Profile
                                    </a>
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/admin/login' })}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}