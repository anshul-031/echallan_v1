'use client';

import { signOut, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

export default function Header() {
    const [session, setSession] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        getSession().then((session) => {
            setSession(session);
        });
    }, []);

    return (
        <header className="bg-white shadow-sm">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex-1"></div>
                    <div className="flex items-center">
                        <div className="ml-3 relative">
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center max-w-xs bg-white rounded-full">
                                    <span className="sr-only">Open user menu</span>
                                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                                        {session?.user?.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt="Profile picture"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <UserCircleIcon className="h-full w-full text-gray-400 p-1" />
                                        )}
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-gray-700 flex items-center">
                                        {session?.user?.name || session?.user?.email}
                                    </span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center" className='w-48'>
                                    <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
                                        My Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/admin' })}>
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}