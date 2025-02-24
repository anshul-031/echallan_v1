'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth/');

  if (isAuthPage) {
    return children;
  }

  return (
    <div className="flex h-screen bg-[#f5f6fa]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}