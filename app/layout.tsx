import './globals.css';
import type { Metadata } from 'next';
import ClientLayout from './ClientLayout';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'E-Challan Management',
  description: 'A comprehensive e-challan management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const darkMode = localStorage.getItem('userSettings') ? 
                JSON.parse(localStorage.getItem('userSettings')).settings.darkMode : false;
              
              if (darkMode) {
                document.documentElement.classList.add('dark-mode');
              } else {
                document.documentElement.classList.remove('dark-mode');
              }
            } catch (e) {
              console.error('Error setting theme:', e);
            }
          `
        }} />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}