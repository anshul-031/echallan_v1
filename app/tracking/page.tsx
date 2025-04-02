'use client';

import dynamic from 'next/dynamic';


// Create a loading component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 p-4 lg:p-6 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600">Loading tracking dashboard...</p>
    </div>
  </div>
);

// Dynamically import the dashboard content with SSR disabled
const TrackingContent = dynamic(
  () => import('./tracking-content'),
  {
    ssr: false,
    loading: LoadingFallback
  }
);

export default function TrackingPage() {
  return <TrackingContent />;
}