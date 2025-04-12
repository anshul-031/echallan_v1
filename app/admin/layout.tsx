import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth";
import AdminNav from './AdminNav';
import { headers } from 'next/headers';
import Header from './components/Header';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const headerList = headers();
  const pathname = headerList.get("x-invoke-path") || "";
  const isLoginPage = pathname === '/admin/login';
  const isAdmin = session?.user?.role === 'ADMIN';  // We're consistently using role in the session now

  // If not authenticated and not on login page, redirect to admin login
  if (!session && !isLoginPage) {
    redirect('/admin');
  }


  // If authenticated but not an admin and not on login page, redirect to dashboard
  if (session && !isAdmin && !isLoginPage) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {!isLoginPage && isAdmin && <AdminNav />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isLoginPage && isAdmin && <Header />}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}