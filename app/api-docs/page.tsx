'use client';

import { useState } from 'react';
import { 
  BookOpenIcon, 
  CodeBracketIcon, 
  DocumentTextIcon,
  ClipboardIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const apiEndpoints = [
  {
    id: 'vehicle-lookup',
    name: 'Vehicle Lookup',
    description: 'Retrieve detailed information about a vehicle using its registration number.',
    method: 'GET',
    endpoint: '/api/v1/vehicles/{registration_number}',
    parameters: [
      { name: 'registration_number', type: 'string', required: true, description: 'Vehicle registration number' }
    ],
    responses: [
      { code: '200', description: 'Success', example: '{\n  "status": "success",\n  "data": {\n    "registration_number": "RJ09GB9453",\n    "make": "Toyota",\n    "model": "Innova",\n    "year": 2022,\n    "engine_number": "EDZ3E1234567",\n    "chassis_number": "MALA851ALJM312345",\n    "registration_date": "2022-01-15",\n    "fitness_expiry": "2024-11-24",\n    "insurance_validity": "2024-10-16",\n    "road_tax_expiry": "2025-03-31"\n  }\n}' },
      { code: '404', description: 'Vehicle not found', example: '{\n  "status": "error",\n  "message": "Vehicle not found"\n}' },
      { code: '401', description: 'Unauthorized', example: '{\n  "status": "error",\n  "message": "Invalid API key"\n}' }
    ]
  },
  {
    id: 'challan-status',
    name: 'Challan Status',
    description: 'Check the status of challans associated with a vehicle.',
    method: 'GET',
    endpoint: '/api/v1/challans/{registration_number}',
    parameters: [
      { name: 'registration_number', type: 'string', required: true, description: 'Vehicle registration number' }
    ],
    responses: [
      { code: '200', description: 'Success', example: '{\n  "status": "success",\n  "data": {\n    "registration_number": "RJ09GB9453",\n    "total_challans": 3,\n    "total_amount": 2500,\n    "challans": [\n      {\n        "id": "CH001",\n        "violation": "Speed Limit",\n        "date": "2024-01-10",\n        "amount": 1000,\n        "status": "Pending"\n      },\n      {\n        "id": "CH002",\n        "violation": "Parking",\n        "date": "2024-01-15",\n        "amount": 500,\n        "status": "Paid"\n      }\n    ]\n  }\n}' },
      { code: '404', description: 'No challans found', example: '{\n  "status": "success",\n  "data": {\n    "registration_number": "RJ09GB9453",\n    "total_challans": 0,\n    "total_amount": 0,\n    "challans": []\n  }\n}' }
    ]
  },
  {
    id: 'document-verification',
    name: 'Document Verification',
    description: 'Verify the authenticity and validity of vehicle documents.',
    method: 'POST',
    endpoint: '/api/v1/documents/verify',
    parameters: [
      { name: 'registration_number', type: 'string', required: true, description: 'Vehicle registration number' },
      { name: 'document_type', type: 'string', required: true, description: 'Type of document (insurance, fitness, roadtax)' },
      { name: 'document_number', type: 'string', required: true, description: 'Document reference number' }
    ],
    responses: [
      { code: '200', description: 'Success', example: '{\n  "status": "success",\n  "data": {\n    "is_valid": true,\n    "expiry_date": "2024-10-16",\n    "issuer": "National Insurance",\n    "verification_id": "VER123456"\n  }\n}' },
      { code: '400', description: 'Invalid request', example: '{\n  "status": "error",\n  "message": "Invalid document type"\n}' }
    ]
  }
];

export default function ApiDocumentationPage() {
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>('vehicle-lookup');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedExample, setCopiedExample] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('curl');

  const handleCopyExample = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedExample(`${index}`);
    setTimeout(() => setCopiedExample(null), 2000);
  };

  const filteredEndpoints = apiEndpoints.filter(endpoint => 
    endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCodeExample = (endpoint: typeof apiEndpoints[0], language: string) => {
    const baseUrl = 'https://api.fleetmanager.com';
    const fullEndpoint = endpoint.endpoint.replace('{registration_number}', 'RJ09GB9453');
    
    switch (language) {
      case 'curl':
        return `curl -X ${endpoint.method} \\\n  "${baseUrl}${fullEndpoint}" \\\n  -H "Authorization: Bearer YOUR_API_KEY"`;
      case 'javascript':
        return `fetch("${baseUrl}${fullEndpoint}", {\n  method: "${endpoint.method}",\n  headers: {\n    "Authorization": "Bearer YOUR_API_KEY"\n  }\n})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error(error));`;
      case 'python':
        return `import requests\n\nurl = "${baseUrl}${fullEndpoint}"\nheaders = {\n    "Authorization": "Bearer YOUR_API_KEY"\n}\n\nresponse = requests.${endpoint.method.toLowerCase()}(url, headers=headers)\ndata = response.json()\nprint(data)`;
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header with animated gradient */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white shadow-lg animate-gradient">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mt-20 -mr-20 transform rotate-45"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-semibold text-white mb-2">API Documentation</h1>
            <p className="text-blue-100 max-w-2xl">Comprehensive guide to integrating with our Fleet Management API.</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-64 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search endpoints..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            <div className="p-2">
              <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Endpoints
              </h3>
              <nav className="space-y-1">
                {filteredEndpoints.map((endpoint) => (
                  <button
                    key={endpoint.id}
                    onClick={() => setActiveEndpoint(endpoint.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeEndpoint === endpoint.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <CodeBracketIcon className={`w-5 h-5 mr-2 ${
                      activeEndpoint === endpoint.id ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                    {endpoint.name}
                  </button>
                ))}
              </nav>
              
              <h3 className="px-3 py-2 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Guides
              </h3>
              <nav className="space-y-1">
                {['Getting Started', 'Authentication', 'Rate Limits', 'Errors'].map((guide) => (
                  <button
                    key={guide}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-400" />
                    {guide}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Main Documentation */}
          <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
            {activeEndpoint && (
              <div>
                {apiEndpoints.filter(e => e.id === activeEndpoint).map((endpoint) => (
                  <div key={endpoint.id}>
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          endpoint.method === 'GET' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {endpoint.method}
                        </span>
                        <h2 className="text-lg font-medium text-gray-900 ml-2">{endpoint.name}</h2>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{endpoint.description}</p>
                    </div>
                    
                    <div className="p-6">
                      {/* Endpoint URL */}
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Endpoint</h3>
                        <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm overflow-x-auto">
                          {endpoint.endpoint}
                        </div>
                      </div>
                      
                      {/* Parameters */}
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Parameters</h3>
                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {endpoint.parameters.map((param) => (
                                <tr key={param.name}>
                                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{param.name}</td>
                                  <td className="px-4 py-2 text-sm text-gray-500">{param.type}</td>
                                  <td className="px-4 py-2 text-sm text-gray-500">{param.required ? 'Yes' : 'No'}</td>
                                  <td className="px-4 py-2 text-sm text-gray-500">{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      {/* Code Examples */}
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Code Examples</h3>
                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                          <div className="flex border-b border-gray-200">
                            {['curl', 'javascript', 'python'].map((lang) => (
                              <button
                                key={lang}
                                onClick={() => setSelectedLanguage(lang)}
                                className={`px-4 py-2 text-sm font-medium ${
                                  selectedLanguage === lang
                                    ? 'bg-white text-blue-600 border-b-2 border-blue-500'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                              >
                                {lang.charAt(0).toUpperCase() + lang.slice(1)}
                              </button>
                            ))}
                          </div>
                          <div className="p-4 relative">
                            <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
                              {getCodeExample(endpoint, selectedLanguage)}
                            </pre>
                            <button
                              onClick={() => handleCopyExample(getCodeExample(endpoint, selectedLanguage), 0)}
                              className="absolute top-4 right-4 p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"
                            >
                              {copiedExample === '0' ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                              ) : (
                                <ClipboardIcon className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Responses */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Responses</h3>
                        <div className="space-y-4">
                          {endpoint.responses.map((response, index) => (
                            <div key={response.code} className="bg-gray-50 rounded-lg overflow-hidden">
                              <div className="px-4 py-2 bg-gray-100 flex justify-between items-center">
                                <div className="flex items-center">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    response.code.startsWith('2') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {response.code}
                                  </span>
                                  <span className="ml-2 text-sm text-gray-700">{response.description}</span>
                                </div>
                                <button
                                  onClick={() => handleCopyExample(response.example, index + 1)}
                                  className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"
                                >
                                  {copiedExample === `${index + 1}` ? (
                                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <ClipboardIcon className="w-5 h-5" />
                                  )}
                                </button>
                              </div>
                              <div className="p-4">
                                <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
                                  {response.example}
                                </pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Additional Resources */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Additional Resources</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a href="#" className="block group">
                <div className="bg-gray-50 p-4 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="flex items-center mb-3">
                    <BookOpenIcon className="w-5 h-5 text-blue-500 mr-2" />
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">API Reference</h3>
                  </div>
                  <p className="text-sm text-gray-600">Complete reference documentation for all API endpoints.</p>
                  <div className="mt-3 flex items-center text-blue-600 text-sm font-medium">
                    <span>View Reference</span>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </a>
              
              <a href="#" className="block group">
                <div className="bg-gray-50 p-4 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="flex items-center mb-3">
                    <CodeBracketIcon className="w-5 h-5 text-blue-500 mr-2" />
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">SDK Libraries</h3>
                  </div>
                  <p className="text-sm text-gray-600">Client libraries for popular programming languages.</p>
                  <div className="mt-3 flex items-center text-blue-600 text-sm font-medium">
                    <span>View Libraries</span>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </a>
              
              <a href="#" className="block group">
                <div className="bg-gray-50 p-4 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="flex items-center mb-3">
                    <DocumentTextIcon className="w-5 h-5 text-blue-500 mr-2" />
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Tutorials</h3>
                  </div>
                  <p className="text-sm text-gray-600">Step-by-step guides for common integration scenarios.</p>
                  <div className="mt-3 flex items-center text-blue-600 text-sm font-medium">
                    <span>View Tutorials</span>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}