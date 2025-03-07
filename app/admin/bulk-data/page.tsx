'use client';

import { useState } from 'react';
import { CloudArrowUpIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function BulkDataManagement() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    // Handle file upload logic here
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Bulk Data Management</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="max-w-xl mx-auto text-center">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">Upload Bulk Data</h2>
            <p className="text-gray-500 mb-6">
              Upload your Excel or CSV file containing vehicle data for bulk processing
            </p>

            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <CloudArrowUpIcon className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">Excel or CSV files only</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {selectedFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Selected file: {selectedFile.name}</p>
                <button
                  onClick={handleUpload}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Process File
                </button>
              </div>
            )}

            <div className="mt-8 text-left">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Instructions</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                <li>File must be in Excel (.xlsx, .xls) or CSV format</li>
                <li>First row should contain column headers</li>
                <li>Required columns: Vehicle Number, Type, Model, Capacity</li>
                <li>Maximum file size: 10MB</li>
                <li>Make sure data follows the required format</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}