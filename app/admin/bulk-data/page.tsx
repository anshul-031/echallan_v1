'use client';

import { useState } from 'react';
import { CloudArrowUpIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function BulkDataManagement() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    }, 500);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Bulk Data Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Data</h2>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                className="hidden"
                id="file-upload"
                onChange={handleFileSelect}
                accept=".csv,.xlsx"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-4" />
                <span className="text-sm text-gray-600">
                  {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  CSV, Excel files are supported
                </span>
              </label>
            </div>

            {uploadProgress > 0 && (
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      Uploading...
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {uploadProgress}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                  <div
                    style={{ width: `${uploadProgress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Upload File
            </button>
          </div>
        </div>

        {/* Template Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Download Templates</h2>
          
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <DocumentTextIcon className="w-6 h-6 text-blue-500 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Vehicle Template</p>
                  <p className="text-xs text-gray-500">CSV format for vehicle data import</p>
                </div>
              </div>
              <span className="text-sm text-blue-600">Download</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <DocumentTextIcon className="w-6 h-6 text-green-500 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Challan Template</p>
                  <p className="text-xs text-gray-500">Excel format for challan data import</p>
                </div>
              </div>
              <span className="text-sm text-blue-600">Download</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <DocumentTextIcon className="w-6 h-6 text-purple-500 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Employee Template</p>
                  <p className="text-xs text-gray-500">CSV format for employee data import</p>
                </div>
              </div>
              <span className="text-sm text-blue-600">Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}