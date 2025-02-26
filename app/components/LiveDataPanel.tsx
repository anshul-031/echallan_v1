'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon, ArrowRightIcon, DocumentTextIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface VehicleDetails {
  stautsMessage: string;
  rc_regn_no: string;
  rc_regn_dt: string;
  rc_owner_name: string;
  rc_chasi_no: string;
  rc_eng_no: string;
  rc_maker_desc: string;
  rc_maker_model: string;
  rc_body_type_desc: string;
  rc_fuel_desc: string;
  rc_insurance_comp: string;
  rc_insurance_upto: string;
  rc_status: string;
  rc_blacklist_status: string;
}

interface LiveDataPanelProps {
  collapsed?: boolean;
}

export default function LiveDataPanel({ collapsed = false }: LiveDataPanelProps) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(null);
  const [searchValue, setSearchValue] = useState('');

  const handleViewDetails = () => {
    // Mock data - replace with actual API call
    const mockDetails: VehicleDetails = {
      stautsMessage: "Active",
      rc_regn_no: "RJ09GB9453",
      rc_regn_dt: "2020-01-01",
      rc_owner_name: "John Doe",
      rc_chasi_no: "MALA851ALJM312345",
      rc_eng_no: "EDZ3E1234567",
      rc_maker_desc: "Toyota",
      rc_maker_model: "Innova",
      rc_body_type_desc: "SUV",
      rc_fuel_desc: "Diesel",
      rc_insurance_comp: "National Insurance",
      rc_insurance_upto: "2024-12-31",
      rc_status: "Active",
      rc_blacklist_status: "Clean"
    };
    
    setVehicleDetails(mockDetails);
    setShowDetailsModal(true);
  };

  if (collapsed) {
    return (
      <div className="w-20 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col items-center space-y-4">
          <DocumentTextIcon className="w-8 h-8 text-blue-600" />
          <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full xl:w-96 bg-white h-screen max-h-screen">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Live Data Fetch</h2>
        <p className="text-sm text-gray-500">Search and verify vehicle information</p>
      </div>

      <div className="p-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <img 
              src="https://echallan.app/application/fleet/images/india.svg"
              alt="India"
              className="w-5 h-5"
            />
          </div>
          <input
            type="text"
            placeholder="Enter Vehicle Number"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
            className="w-full pl-11 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <ClockIcon className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Validity</p>
            <p className="text-sm font-medium text-gray-900">6 months</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <ShieldCheckIcon className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Status</p>
            <p className="text-sm font-medium text-gray-900">Active</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-2 text-center">
            <DocumentTextIcon className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Documents</p>
            <p className="text-sm font-medium text-gray-900">5/6</p>
          </div>
        </div>

        {/* Document Status */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Document Status</h3>
          <div className="space-y-2">
            {[
              { label: 'Insurance', status: 'Valid till Dec 2024' },
              { label: 'Fitness', status: 'Valid till Nov 2024' },
              { label: 'Pollution', status: 'Valid till Oct 2024' },
              { label: 'Road Tax', status: 'Valid till Sep 2024' },
              { label: 'Permit', status: 'Not Available' },
              { label: 'NP Permit', status: 'Valid till Aug 2024' }
            ].map((doc, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{doc.label}</span>
                  <span className={`text-sm font-medium ${
                    doc.status === 'Not Available' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
            <PlusIcon className="w-5 h-5" />
            <span>Add New Vehicle</span>
          </button>
          <button 
            onClick={handleViewDetails}
            className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowRightIcon className="w-5 h-5" />
            <span>View Full Details</span>
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && vehicleDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowDetailsModal(false)} />

            <div className="relative inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Vehicle Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Basic Information</h4>
                    <div className="space-y-3">
                      {Object.entries(vehicleDetails)
                        .filter(([key]) => key.startsWith('rc_'))
                        .map(([key, value]) => (
                          <div key={key} className="bg-gray-50 p-3 rounded-lg">
                            <label className="text-sm text-gray-500">
                              {key.replace('rc_', '').split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </label>
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}