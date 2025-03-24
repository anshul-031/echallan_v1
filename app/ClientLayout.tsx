'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { Toaster } from 'react-hot-toast';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth/');

  if (isAuthPage) {
    return (
      <>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { background: '#fff', color: '#363636', borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
            success: { style: { background: 'linear-gradient(to right, #2563eb, #3b82f6)', color: '#fff' } },
            error: { style: { background: 'linear-gradient(to right, #dc2626, #ef4444)', color: '#fff' } },
          }}
        />
      </>
    );
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
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { background: '#fff', color: '#363636', borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
          success: { style: { background: 'linear-gradient(to right, #2563eb, #3b82f6)', color: '#fff' } },
          error: { style: { background: 'linear-gradient(to right, #dc2626, #ef4444)', color: '#fff' } },
        }}
      />
    </div>
  );
}