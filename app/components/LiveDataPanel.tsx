'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon, ArrowRightIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { getSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Vehicle } from '@/app/types/vehicle';
import { Dispatch, SetStateAction } from 'react';

interface VehicleDetails {
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
  rc_fit_upto: string;
  rc_pucc_upto: string;
  rc_tax_upto: string;
  rc_permit_valid_upto: string;
  rc_registered_at: string;
  rc_financer: string;
}

interface LiveDataPanelProps {
  collapsed?: boolean;
  vehicles: Vehicle[];
  setVehicles: Dispatch<SetStateAction<Vehicle[]>>;
}

export default function LiveDataPanel({ collapsed = false, vehicles, setVehicles }: LiveDataPanelProps) {
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleFetchVehicleData = useCallback(async () => {
    setIsLoading(true);
    setLoading(true);
    setError(null);
    setVehicleDetails(null);

    try {
      const response = await fetch(`/api/vahanfin/vehicle?rc_no=${searchValue}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data?.data) {
        setVehicleDetails(data.data);
        console.log(data)
      } else {
        setError("No vehicle found with this number");
      }
    } catch (error: any) {
      console.error("Error fetching vehicle data:", error);
      setError(`Failed to fetch vehicle data. ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [searchValue]);

  const handleAddVehicle = async () => {
    setIsAdding(true);
    try {
      const session = await getSession();
      if (!session?.user?.id || !vehicleDetails) {
        toast.error("Please sign in to add vehicle data.");
        return;
      }

      // Check if vehicle already exists
      const vehicleExists = vehicles.some((vehicle) => vehicle.vrn === vehicleDetails?.rc_regn_no);
      if (vehicleExists) {
        toast.error("Vehicle already exists in the table.");
        return;
      }

      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vrn: vehicleDetails.rc_regn_no,
          roadTax: vehicleDetails.rc_tax_upto,
          fitness: vehicleDetails.rc_fit_upto,
          insurance: vehicleDetails.rc_insurance_upto,
          pollution: vehicleDetails.rc_pucc_upto,
          statePermit: vehicleDetails.rc_permit_valid_upto || "Not Available",
          nationalPermit: vehicleDetails.rc_permit_valid_upto,
          lastUpdated: new Date().toISOString().slice(0, 10),
          status: vehicleDetails.rc_status === "NOC ISSUED" ? "Inactive" : "Active",
          ownerId: session.user.id,
          registeredAt: vehicleDetails.rc_regn_dt,
          documents: 0,
        }),
      });

      if (response.status === 201) {
        toast.success("Vehicle added successfully.");
        const newVehicle = await response.json();
        setVehicles((prevVehicles) => [...prevVehicles, newVehicle]);
      } else {
        toast.error("Failed to add vehicle.");
      }
    } catch (error) {
      toast.error("Failed to add vehicle.");
    } finally {
      setIsAdding(false);
    }
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
    <div className="w-full xl:w-96 bg-white h-auto lg:h-screen lg:max-h-screen overflow-y-auto">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Live Data Fetch</h2>
        <p className="text-sm text-gray-500">Search and verify vehicle information</p>
      </div>

      <div className="p-4">
        {/* Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchValue) {
              handleFetchVehicleData();
            }
          }}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Image
                src="https://echallan.app/application/fleet/images/india.svg"
                alt="India"
                width={20}
                height={20}
              />
            </div>
            <input
              type="text"
              placeholder="Enter Vehicle Number"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
              className="w-full pl-11 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!searchValue}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${!searchValue ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
        <div className='relative h-full w-full inset-0'>

          {isLoading && (
            <div className="bg-white/80 backdrop-blur-sm h-full w-full z-20 flex items-center justify-center">
              <div className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm">
                <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-gray-500">Fetching vehicle data...</span>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-red-500">{error}</p>}

        {vehicleDetails && (
          <>
            {/* Document Status */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Vehicle Details</h3>
              <div className="space-y-2 overflow-y-auto max-h-[70vh]">
                {[
                  { label: 'Insurance', value: vehicleDetails.rc_insurance_upto },
                  { label: 'Fitness', value: vehicleDetails.rc_fit_upto },
                  { label: 'Pollution', value: vehicleDetails.rc_pucc_upto },
                  { label: 'Road Tax', value: vehicleDetails.rc_tax_upto === "LTT" ? "Lifetime" : vehicleDetails.rc_tax_upto },
                  { label: 'Permit', value: vehicleDetails.rc_permit_valid_upto || "Not Available" },
                  { label: 'NP Permit', value: vehicleDetails.rc_permit_valid_upto },
                  { label: 'RTO Location', value: vehicleDetails.rc_registered_at },
                  { label: 'Chassis No.', value: vehicleDetails.rc_chasi_no },
                  { label: 'Engine No.', value: vehicleDetails.rc_eng_no },
                  { label: 'Financer Name', value: vehicleDetails.rc_financer || "" },
                  { label: 'Insurance Company', value: vehicleDetails.rc_insurance_comp },
                  { label: 'Blacklist Status', value: vehicleDetails.rc_blacklist_status },
                ].map((doc, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{doc.label}</span>
                      <span className={`text-sm font-medium ${doc.value === 'Not Available' ? 'text-red-600' : 'text-green-600'}`}>
                        {doc.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              <button
                onClick={handleAddVehicle}
                disabled={isLoading || isAdding}
                className={`w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2
                  ${isLoading || isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isAdding ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Adding Vehicle...</span>
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Vehicle Data</span>
                  </>
                )}
              </button>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
