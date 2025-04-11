'use client';

import { useRouter } from 'next/navigation';

export default function AdminUsers() {
    const router = useRouter();

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Users Management</h1>
                <button
                    onClick={() => router.back()}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Go Back
                </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
                <p>Users list will be displayed here.</p>
            </div>
        </div>
    );
}