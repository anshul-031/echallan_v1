'use client';

import { useState, useEffect } from 'react';
import { 
  KeyIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  ClipboardIcon, 
  ArrowPathIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function ApiCredentialsPage() {
  const [apiKey, setApiKey] = useState('sk_test_51NcELKSIhT7vTbBhJYjkN8KqLZzXHY2pIQWLx');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerateConfirm, setRegenerateConfirm] = useState(false);
  const [keyCreatedDate] = useState('2024-01-15');
  const [keyLastUsed] = useState('2024-01-23');
  const [usageStats] = useState({
    totalRequests: 1245,
    successRate: 99.2,
    averageResponseTime: 235, // ms
    lastHourRequests: 42
  });

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
  };

  const handleRegenerateKey = () => {
    if (regenerateConfirm) {
      // In a real app, this would call an API to regenerate the key
      setApiKey('sk_test_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
      setRegenerateConfirm(false);
    } else {
      setRegenerateConfirm(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header with animated gradient */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white shadow-lg animate-gradient">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mt-20 -mr-20 transform rotate-45"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-semibold text-white mb-2">API Credentials</h1>
            <p className="text-amber-100 max-w-2xl">Manage your API keys and access credentials for integrating with our services.</p>
          </div>
        </div>

        {/* API Key Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <KeyIcon className="w-5 h-5 text-amber-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Your API Key</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={showApiKey ? "Hide API key" : "Show API key"}
              >
                {showApiKey ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1">
                <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex-1 font-mono text-sm overflow-hidden">
                    {showApiKey ? (
                      <span>{apiKey}</span>
                    ) : (
                      <span>••••••••••••••••••••••••••••••••</span>
                    )}
                  </div>
                  <button
                    onClick={handleCopyApiKey}
                    className="ml-2 p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"
                    aria-label="Copy API key"
                  >
                    {copied ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <ClipboardIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                
                {/* Copy confirmation message */}
                <div className={`absolute -bottom-6 left-0 text-xs text-green-600 transition-opacity duration-300 ${
                  copied ? 'opacity-100' : 'opacity-0'
                }`}>
                  API key copied to clipboard!
                </div>
              </div>
              
              <div>
                <button
                  onClick={handleRegenerateKey}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    regenerateConfirm 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                >
                  {regenerateConfirm ? 'Confirm Regenerate' : ' Regenerate Key'}
                </button>
                
                {regenerateConfirm && (
                  <div className="mt-2 text-xs text-red-600">
                    Warning: Regenerating will invalidate your existing key.
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <ClockIcon className="w-5 h-5 text-gray-500 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900">Key Details</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Created</span>
                    <span className="text-sm font-medium">{new Date(keyCreatedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last used</span>
                    <span className="text-sm font-medium">{new Date(keyLastUsed).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Environment</span>
                    <span className="text-sm font-medium">Production</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <ShieldCheckIcon className="w-5 h-5 text-gray-500 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900">Security Recommendations</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Store your API key securely and never expose it in client-side code.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Regenerate your key immediately if you suspect it has been compromised.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* API Usage Stats */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">API Usage Statistics</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Requests</p>
                <p className="text-2xl font-semibold mt-1">{usageStats.totalRequests.toLocaleString()}</p>
                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-2xl font-semibold mt-1">{usageStats.successRate}%</p>
                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${usageStats.successRate}%` }}></div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Avg Response Time</p>
                <p className="text-2xl font-semibold mt-1">{usageStats.averageResponseTime} ms</p>
                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Last Hour</p>
                <p className="text-2xl font-semibold mt-1">{usageStats.lastHourRequests} requests</p>
                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                View Detailed Analytics →
              </button>
            </div>
          </div>
        </div>
        
        {/* API Access Control */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">API Access Control</h2>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">IP Restrictions</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableIpRestrictions"
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableIpRestrictions" className="ml-2 block text-sm text-gray-900">
                      Enable IP restrictions
                    </label>
                  </div>
                  <button className="text-sm text-amber-600 hover:text-amber-700">
                    Configure
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Restrict API access to specific IP addresses or ranges for enhanced security.
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Rate Limits</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-900">Current rate limit: <span className="font-medium">100 requests/minute</span></p>
                  </div>
                  <button className="text-sm text-amber-600 hover:text-amber-700">
                    Upgrade
                  </button>
                </div>
                <div className="mt-3 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  65% of your rate limit used in the current period. Resets in 35 minutes.
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Webhook Configuration</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableWebhooks"
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableWebhooks" className="ml-2 block text-sm text-gray-900">
                      Enable webhooks
                    </label>
                  </div>
                  <button className="text-sm text-amber-600 hover:text-amber-700">
                    Configure
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Receive real-time notifications for API events via webhooks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}