'use client';

import { useState, useEffect } from 'react';
import { ArrowPathIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import type { Vehicle } from '../types/vehicle';

// Sample data - in a real app, this would come from an API
const vehicles: Vehicle[] = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  vrn: `GJ04TA${9424 + index}`,
  roadTaxExpiry: '2024-05-15',
  fitnessExpiry: '2024-03-20',
  insuranceValidity: '2024-02-10',
  pollutionExpiry: '2023-12-25',
  permitExpiry: '2024-06-30',
  nationalPermitExpiry: '2024-06-30',
  lastUpdated: '2023-11-15T10:30:00',
}));

const DESKTOP_ITEMS_PER_PAGE = 10;
const MOBILE_ITEMS_PER_PAGE = 5;

function VehicleTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const itemsPerPage = isMobile ? MOBILE_ITEMS_PER_PAGE : DESKTOP_ITEMS_PER_PAGE;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = vehicles.slice(startIndex, endIndex);

  const totalPages = Math.ceil(vehicles.length / itemsPerPage);

  const DetailsModal = () => {
    if (!selectedVehicle) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-medium">Vehicle Details</h3>
            <button 
              onClick={() => setShowDetailsModal(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">VRN:</span>
              <span className="font-medium">{selectedVehicle.vrn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Road Tax Expiry:</span>
              <span className="font-medium">{format(new Date(selectedVehicle.roadTaxExpiry), 'dd-MM-yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fitness Expiry:</span>
              <span className="font-medium">{format(new Date(selectedVehicle.fitnessExpiry), 'dd-MM-yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Insurance Validity:</span>
              <span className="font-medium">{format(new Date(selectedVehicle.insuranceValidity), 'dd-MM-yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pollution Expiry:</span>
              <span className="font-medium">{format(new Date(selectedVehicle.pollutionExpiry), 'dd-MM-yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Permit Expiry:</span>
              <span className="font-medium">{format(new Date(selectedVehicle.permitExpiry), 'dd-MM-yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">National Permit Expiry:</span>
              <span className="font-medium">{format(new Date(selectedVehicle.nationalPermitExpiry), 'dd-MM-yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium">{format(new Date(selectedVehicle.lastUpdated), 'dd-MM-yyyy')}</span>
            </div>
          </div>
          <div className="p-4 border-t flex justify-end space-x-2">
            <button 
              onClick={() => setShowDetailsModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="min-w-max w-full table-auto">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left whitespace-nowrap">S.No.</th>
              <th className="py-3 px-6 text-left whitespace-nowrap">VRN</th>
              <th className="py-3 px-6 text-left whitespace-nowrap">Road Tax</th>
              <th className="py-3 px-6 text-left whitespace-nowrap">Fitness</th>
              <th className="py-3 px-6 text-left whitespace-nowrap">Insurance</th>
              <th className="py-3 px-6 text-left whitespace-nowrap">Pollution</th>
              <th className="py-3 px-6 text-left whitespace-nowrap">Permit</th>
              <th className="py-3 px-6 text-left whitespace-nowrap">National Permit</th>
              <th className="py-3 px-6 text-left whitespace-nowrap">Last Updated</th>
              <th className="py-3 px-6 text-center whitespace-nowrap">Update</th>
              <th className="py-3 px-6 text-center whitespace-nowrap">Documents</th>
              <th className="py-3 px-6 text-center whitespace-nowrap">Delete</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {currentVehicles.map((vehicle, index) => (
              <tr key={vehicle.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {startIndex + index + 1}
                </td>
                <td className="py-3 px-6 text-left whitespace-nowrap font-medium">
                  {vehicle.vrn}
                </td>
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {format(new Date(vehicle.roadTaxExpiry), 'dd-MM-yyyy')}
                </td>
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {format(new Date(vehicle.fitnessExpiry), 'dd-MM-yyyy')}
                </td>
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {format(new Date(vehicle.insuranceValidity), 'dd-MM-yyyy')}
                </td>
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {format(new Date(vehicle.pollutionExpiry), 'dd-MM-yyyy')}
                </td>
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {format(new Date(vehicle.permitExpiry), 'dd-MM-yyyy')}
                </td>
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {format(new Date(vehicle.nationalPermitExpiry), 'dd-MM-yyyy')}
                </td>
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {format(new Date(vehicle.lastUpdated), 'dd-MM-yyyy')}
                </td>
                <td className="py-3 px-6 text-center">
                  <button className="text-blue-600 hover:text-blue-900">
                    <ArrowPathIcon className="w-5 h-5" />
                  </button>
                </td>
                <td className="py-3 px-6 text-center">
                  <button 
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setShowDetailsModal(true);
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </td>
                <td className="py-3 px-6 text-center">
                  <button className="text-red-600 hover:text-red-900">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(endIndex, vehicles.length)} of {vehicles.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(curr => curr - 1)}
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-white bg-blue-600 rounded">
            {currentPage}
          </span>
          <button 
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
            disabled={endIndex >= vehicles.length}
            onClick={() => setCurrentPage(curr => curr + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {showDetailsModal && <DetailsModal />}
    </div>
  );
}

export default VehicleTable;