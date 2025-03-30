'use client';

import { useState, useEffect } from 'react';
import { 
  CodeBracketIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Interface for API usage statistics
interface ApiStat {
  title: string;
  count: string;
  trend: string;
  isPositive: boolean;
  icon: React.ComponentType<any>;
  color: string;
  textGradient: string;
  iconGradient: string;
  borderColor: string;
  shadowColor: string;
}

// Interface for API request logs
interface ApiRequest {
  id: number;
  endpoint: string;
  method: string;
  status: number;
  responseTime: string;
  timestamp: string;
  ip: string;
}

// Sorting configuration interface
interface SortConfig {
  key: keyof ApiRequest | null;
  direction: 'ascending' | 'descending';
}

// API monitoring singleton for tracking API calls across the application
class ApiMonitor {
  private static instance: ApiMonitor;
  private apiRequests: ApiRequest[] = [];
  private apiStats = {
    totalRequests: 0,
    successCount: 0,
    errorCount: 0,
    totalResponseTime: 0,
  };
  private listeners: (() => void)[] = [];

  private constructor() {
    // Load from localStorage on init if available
    this.loadFromStorage();
    
    // Monitor fetch calls
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      
      // Only track API calls
      if (!url.includes('/api/')) {
        return originalFetch(input, init);
      }
      
      const method = init?.method || 'GET';
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(input, init);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        // Add request to history
        this.trackRequest({
          url,
          method,
          status: response.status,
          responseTime
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        // Track failed request
        this.trackRequest({
          url,
          method,
          status: 500,
          responseTime
        });
        
        throw error;
      }
    };
  }

  public static getInstance(): ApiMonitor {
    if (!ApiMonitor.instance) {
      ApiMonitor.instance = new ApiMonitor();
    }
    return ApiMonitor.instance;
  }

  private loadFromStorage() {
    try {
      const savedRequests = localStorage.getItem('api_requests');
      const savedStats = localStorage.getItem('api_stats');
      
      if (savedRequests) {
        this.apiRequests = JSON.parse(savedRequests);
      }
      
      if (savedStats) {
        this.apiStats = JSON.parse(savedStats);
      }
    } catch (error) {
      console.error('Failed to load API monitoring data from localStorage', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('api_requests', JSON.stringify(this.apiRequests));
      localStorage.setItem('api_stats', JSON.stringify(this.apiStats));
    } catch (error) {
      console.error('Failed to save API monitoring data to localStorage', error);
    }
  }

  private trackRequest({ url, method, status, responseTime }: { 
    url: string, 
    method: string, 
    status: number, 
    responseTime: number 
  }) {
    // Parse endpoint from URL
    const urlObj = new URL(url, window.location.origin);
    const endpoint = urlObj.pathname;
    
    // Create request entry
    const request: ApiRequest = {
      id: Date.now(),
      endpoint,
      method,
      status,
      responseTime: `${Math.round(responseTime)}ms`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ip: '127.0.0.1' // Client-side we can't get real IP, so use localhost
    };
    
    // Update stats
    this.apiStats.totalRequests++;
    if (status >= 200 && status < 400) {
      this.apiStats.successCount++;
    } else {
      this.apiStats.errorCount++;
    }
    this.apiStats.totalResponseTime += responseTime;
    
    // Add to request history (keep most recent 100)
    this.apiRequests.unshift(request);
    if (this.apiRequests.length > 100) {
      this.apiRequests = this.apiRequests.slice(0, 100);
    }
    
    // Save to storage
    this.saveToStorage();
    
    // Notify listeners
    this.notifyListeners();
  }

  public getRequests(): ApiRequest[] {
    return [...this.apiRequests];
  }

  public getStats() {
    const { totalRequests, successCount, errorCount, totalResponseTime } = this.apiStats;
    const successRate = totalRequests ? ((successCount / totalRequests) * 100).toFixed(1) : '100.0';
    const errorRate = totalRequests ? ((errorCount / totalRequests) * 100).toFixed(1) : '0.0';
    const avgResponseTime = totalRequests ? Math.round(totalResponseTime / totalRequests) : 0;
    
    return {
      totalRequests,
      successRate,
      errorRate,
      avgResponseTime
    };
  }

  public clearHistory() {
    this.apiRequests = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  public addListener(callback: () => void) {
    this.listeners.push(callback);
  }

  public removeListener(callback: () => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Generate sample data for testing
  public generateSampleData() {
    const endpoints = [
      '/api/vehicles/lookup', 
      '/api/challans/create', 
      '/api/vehicles/stats',
      '/api/credits/purchase',
      '/api/auth/session'
    ];
    
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const statuses = [200, 201, 400, 403, 404, 500];
    
    // Clear existing data
    this.apiRequests = [];
    this.apiStats = {
      totalRequests: 0,
      successCount: 0,
      errorCount: 0,
      totalResponseTime: 0,
    };
    
    // Generate 20 random requests
    for (let i = 0; i < 20; i++) {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const method = methods[Math.floor(Math.random() * methods.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const responseTime = Math.floor(Math.random() * 500) + 50; // 50-550ms
      
      // Timestamp between last week and now
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 7));
      
      this.trackRequest({ 
        url: `${window.location.origin}${endpoint}`, 
        method, 
        status, 
        responseTime 
      });
    }
    
    this.saveToStorage();
    this.notifyListeners();
  }
}

export default function ApiHistoryPage() {
  // Initialize state with static dummy data (this will be replaced with real data)
  const [apiStats, setApiStats] = useState<ApiStat[]>([
    {
      title: 'Total Requests',
      count: '0',
      trend: '+0%',
      isPositive: true,
      icon: DocumentTextIcon,
      color: 'from-blue-500 to-blue-600',
      textGradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
      iconGradient: 'bg-gradient-to-br from-blue-500/10 to-blue-600/10',
      borderColor: 'border-blue-100',
      shadowColor: 'shadow-blue-500/20'
    },
    {
      title: 'Success Rate',
      count: '0%',
      trend: '0%',
      isPositive: true,
      icon: CheckCircleIcon,
      color: 'from-emerald-500 to-emerald-600',
      textGradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      iconGradient: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10',
      borderColor: 'border-emerald-100',
      shadowColor: 'shadow-emerald-500/20'
    },
    {
      title: 'Average Response',
      count: '0ms',
      trend: '0ms',
      isPositive: true,
      icon: ClockIcon,
      color: 'from-purple-500 to-purple-600',
      textGradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
      iconGradient: 'bg-gradient-to-br from-purple-500/10 to-purple-600/10',
      borderColor: 'border-purple-100',
      shadowColor: 'shadow-purple-500/20'
    },
    {
      title: 'Error Rate',
      count: '0%',
      trend: '0%',
      isPositive: false,
      icon: XCircleIcon,
      color: 'from-red-500 to-red-600',
      textGradient: 'bg-gradient-to-r from-red-500 to-red-600',
      iconGradient: 'bg-gradient-to-br from-red-500/10 to-red-600/10',
      borderColor: 'border-red-100',
      shadowColor: 'shadow-red-500/20'
    }
  ]);
  
  const [apiRequests, setApiRequests] = useState<ApiRequest[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showDataTooltip, setShowDataTooltip] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'timestamp', direction: 'descending' });

  // Initialize API monitor on component mount
  useEffect(() => {
    const apiMonitor = ApiMonitor.getInstance();
    
    // Update data initially
    updateData();
    setIsLoading(false);
    
    // Set up listener for real-time updates
    const handleUpdate = () => {
      updateData();
    };
    
    apiMonitor.addListener(handleUpdate);
    
    // Clean up listener on unmount
    return () => {
      apiMonitor.removeListener(handleUpdate);
    };
  }, []);
  
  // Function to update data from API monitor
  const updateData = () => {
    const apiMonitor = ApiMonitor.getInstance();
    const requests = apiMonitor.getRequests();
    const stats = apiMonitor.getStats();
    
    // Update requests state
    setApiRequests(requests);
    
    // Update stats card data
    setApiStats([
      {
        ...apiStats[0],
        count: stats.totalRequests.toString(),
        trend: '+0%', // We don't track historical data in this implementation
        isPositive: true
      },
      {
        ...apiStats[1],
        count: `${stats.successRate}%`,
        trend: '0%',
        isPositive: true
      },
      {
        ...apiStats[2],
        count: `${stats.avgResponseTime}ms`,
        trend: '0ms', 
        isPositive: true
      },
      {
        ...apiStats[3],
        count: `${stats.errorRate}%`,
        trend: '0%',
        isPositive: false
      }
    ]);
  };
  
  // Generate test data
  const generateTestData = () => {
    setIsActionLoading(true);
    
    try {
      const apiMonitor = ApiMonitor.getInstance();
      apiMonitor.generateSampleData();
    } finally {
      // Small delay to show loading state
      setTimeout(() => {
        setIsActionLoading(false);
      }, 500);
    }
  };
  
  // Clear history
  const clearHistory = () => {
    setIsActionLoading(true);
    
    try {
      const apiMonitor = ApiMonitor.getInstance();
      apiMonitor.clearHistory();
    } finally {
      // Small delay to show loading state
      setTimeout(() => {
        setIsActionLoading(false);
      }, 300);
    }
  };
  
  // Sort function
  const sortData = (key: keyof ApiRequest) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };
  
  // Apply sorting to the data
  const getSortedData = () => {
    if (!sortConfig.key) return apiRequests;
    
    // Create a copy of the data to avoid mutating state
    const sortedData = [...apiRequests];
    
    sortedData.sort((a, b) => {
      // Handle different types of data for sorting
      if (sortConfig.key === 'responseTime') {
        // Extract ms value from string for numeric comparison
        const aValue = parseInt(a[sortConfig.key].replace('ms', ''));
        const bValue = parseInt(b[sortConfig.key].replace('ms', ''));
        
        if (sortConfig.direction === 'ascending') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      } else if (sortConfig.key === 'timestamp') {
        // Sort dates
        const aDate = new Date(a[sortConfig.key]).getTime();
        const bDate = new Date(b[sortConfig.key]).getTime();
        
        if (sortConfig.direction === 'ascending') {
          return aDate - bDate;
        } else {
          return bDate - aDate;
        }
      } else if (sortConfig.key) { // Add this check to ensure key is not null
        // Default string or number comparison
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (sortConfig.direction === 'ascending') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      }
      
      // Default case if key is somehow null
      return 0;
    });
    
    return sortedData;
  };
  
  // Get sorted data
  const sortedData = getSortedData();
  
  // Get current page data from sorted data
  const indexOfLastRequest = currentPage * rowsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - rowsPerPage;
  const currentRequests = sortedData.slice(indexOfFirstRequest, indexOfLastRequest);
  
  // Make a test API call
  const makeTestApiCall = async () => {
    setIsActionLoading(true);
    
    try {
      // Make a fetch call to a random API endpoint
      const endpoints = [
        '/api/credits/purchase?limit=5&page=1',
        '/api/auth/session',
        '/api/vehicles/lookup?vrn=RJ09GB9450',
        '/api/challans/create',
      ];
      
      // Select a random endpoint
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      
      // Select a random method - GET for queries, POST for others
      const method = endpoint.includes('?') ? 'GET' : 'POST';
      
      // Create a body for POST requests
      const body = method === 'POST' ? 
        JSON.stringify({
          test: true,
          timestamp: new Date().toISOString()
        }) : undefined;
      
      // Make the request
      await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body
      });
      
      updateData();
    } catch (error) {
      console.error("Error making test API call:", error);
      
      // Even if the call fails, it should still be recorded by our monitor
      updateData();
    } finally {
      // Small delay to show loading state
      setTimeout(() => {
        setIsActionLoading(false);
      }, 300);
    }
  };

  // Get sort direction indicator
  const getSortDirectionIndicator = (key: keyof ApiRequest) => {
    if (sortConfig.key !== key) return null;
    
    return sortConfig.direction === 'ascending' 
      ? <span className="ml-1">↑</span> 
      : <span className="ml-1">↓</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">API History</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor your API usage and performance</p>
          </div>
          <div className="flex space-x-2">
            <button
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              onClick={makeTestApiCall}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <CodeBracketIcon className="h-4 w-4 mr-1" />
              )}
              Test API Call
            </button>
            <button
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              onClick={generateTestData}
              onMouseEnter={() => setShowDataTooltip(true)}
              onMouseLeave={() => setShowDataTooltip(false)}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <DocumentTextIcon className="h-4 w-4 mr-1" />
              )}
              Generate Data
              {showDataTooltip && !isActionLoading && (
                <div className="absolute mt-12 bg-black text-white text-xs rounded py-1 px-2 right-0 z-10">
                  Generate sample data for testing
                </div>
              )}
            </button>
            <button
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              onClick={clearHistory}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <XCircleIcon className="h-4 w-4 mr-1" />
              )}
              Clear History
            </button>
            <button 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={updateData}
              disabled={isActionLoading}
            >
              <ArrowPathIcon className={`w-5 h-5 mr-2 ${isActionLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* API Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {apiStats.map((stat, index) => (
            <div
              key={stat.title}
              className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer
                transform hover:scale-[1.02] hover:-translate-y-1`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Animated Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 
                transition-opacity duration-300 blur-xl
                ${hoveredCard === index ? 'opacity-20' : ''}`}
              />
              
              {/* Card Content */}
              <div className={`relative bg-white border ${stat.borderColor} p-6 h-full
                transition-all duration-300
                ${hoveredCard === index ? stat.shadowColor : 'shadow-sm'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${stat.iconGradient}`}>
                        <stat.icon className={`w-5 h-5 ${stat.textGradient} bg-clip-text`} />
                      </div>
                      <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                    </div>
                    <p className={`text-2xl font-bold mt-2 ${stat.textGradient} bg-clip-text text-transparent`}>
                      {stat.count}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {stat.isPositive ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className={stat.isPositive ? 'text-green-500' : 'text-red-500'}>
                      {stat.trend}
                    </span>
                  </div>
                </div>

                {/* Hover Effect Indicator */}
                <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full transition-all duration-300
                  bg-gradient-to-r ${stat.color}
                  ${hoveredCard === index ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* API Requests Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent API Requests</h2>
            {isActionLoading && (
              <div className="flex items-center text-sm text-blue-600">
                <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
                Processing...
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-gray-500">Loading...</span>
            </div>
          ) : apiRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <ExclamationTriangleIcon className="w-12 h-12 text-gray-300 mb-2" />
              <p>No API requests have been tracked yet</p>
              <p className="text-sm mt-1">Click "Test API Call" or "Generate Data" to see this in action</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => sortData('endpoint')}
                      >
                        Endpoint {getSortDirectionIndicator('endpoint')}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => sortData('method')}
                      >
                        Method {getSortDirectionIndicator('method')}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => sortData('status')}
                      >
                        Status {getSortDirectionIndicator('status')}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => sortData('responseTime')}
                      >
                        Response Time {getSortDirectionIndicator('responseTime')}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => sortData('timestamp')}
                      >
                        Timestamp {getSortDirectionIndicator('timestamp')}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => sortData('ip')}
                      >
                        IP Address {getSortDirectionIndicator('ip')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CodeBracketIcon className="w-5 h-5 text-gray-400 mr-3" />
                            <span className="text-sm font-medium text-gray-900">{request.endpoint}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            request.method === 'GET' 
                              ? 'bg-blue-100 text-blue-800'
                              : request.method === 'POST'
                              ? 'bg-green-100 text-green-800'
                              : request.method === 'PUT'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {request.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            request.status < 400
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.responseTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.timestamp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.ip}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {indexOfFirstRequest + 1} to {Math.min(indexOfLastRequest, sortedData.length)} of {sortedData.length} entries
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
                    <button 
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                      disabled={currentPage * rowsPerPage >= sortedData.length}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}