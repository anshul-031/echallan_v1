'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface ServiceDetails {
    id: string;
    vehicle_no: string;
    services: string;
    isAssignedService: boolean;
    status: 'not_assigned' | 'pending' | 'processing' | 'completed';
    govtFees: boolean;
    govtFeesUpdate: Date | null;
    rtoApproval: boolean;
    rtoApprovalUpdate: Date | null;
    inspection: boolean;
    inspectionUpdate: Date | null;
    certificate: boolean;
    certificateUpdate: Date | null;
    documentDelivered: boolean;
    documentDeliveryUpdate: Date | null;
}

interface TrackingState {
    isProcessing: boolean;
    govtFees: boolean;
    rtoApproval: boolean;
    inspection: boolean;
    certificate: boolean;
    documentDelivered: boolean;
}

export default function TrackService() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const serviceId = searchParams.get('id');
    const [serviceDetails, setServiceDetails] = useState<ServiceDetails | null>(null);
    const [loading, setLoading] = useState(true);

    // Local state for each tracking step
    const [trackingState, setTrackingState] = useState<TrackingState>({
        isProcessing: false,
        govtFees: false,
        rtoApproval: false,
        inspection: false,
        certificate: false,
        documentDelivered: false
    });

    // Initialize tracking state from service details
    useEffect(() => {
        if (serviceDetails) {
            setTrackingState({
                isProcessing: serviceDetails.status !== 'not_assigned' && serviceDetails.status !== 'pending',
                govtFees: serviceDetails.govtFees,
                rtoApproval: serviceDetails.rtoApproval,
                inspection: serviceDetails.inspection,
                certificate: serviceDetails.certificate,
                documentDelivered: serviceDetails.documentDelivered
            });
        }
    }, [serviceDetails]);

    useEffect(() => {
        if (serviceId) {
            fetchServiceDetails();
        }
    }, [serviceId]);

    const fetchServiceDetails = async () => {
        try {
            const response = await fetch(`/api/services/${serviceId}`);
            if (!response.ok) throw new Error('Failed to fetch service details');
            const data = await response.json();
            setServiceDetails(data);
        } catch (error) {
            toast.error('Failed to load service details');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (field: keyof TrackingState) => {
        setTrackingState(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const updateTrack = async (field: string, displayName: string) => {
        const updatePromise = async () => {
            const response = await fetch(`/api/services/${serviceId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ field }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update track');
            }

            await fetchServiceDetails();
            return `Updated ${displayName} successfully`;
        };

        toast.promise(updatePromise(), {
            loading: `Updating ${displayName}...`,
            success: (message) => message,
            error: (err) => err.message
        });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!serviceDetails) {
        return <div>Service not found</div>;
    }

    return (
        <div className="p-6">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => router.back()}
                    className="text-gray-600 text-center min-w-fit hover:text-gray-900 mr-4"
                >
                    ← Back
                </button>
                <h1 className="text-2xl w-full text-center font-semibold text-gray-900">Track Vehicle Service</h1>
            </div>

            <div className="mb-6 flex bg-white shadow-md rounded-lg">
                <div className="px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">Vehicle Number</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{serviceDetails.vehicle_no}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">Service</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{serviceDetails.services}</dd>
                </div>
            </div>

            <div className="space-y-6">
                {/* Document Received Section */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Document Received</h2>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={trackingState.isProcessing}
                                onChange={() => handleCheckboxChange('isProcessing')}
                                className="rounded border-gray-300 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Document Received</span>
                        </label>
                        <button
                            onClick={() => updateTrack('status', 'Document Received')}
                            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm hover:bg-blue-200"
                        >
                            Update Track
                        </button>
                    </div>
                </div>

                {/* Process Steps Section */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Process Steps</h2>
                    <div className="space-y-4">
                        {/* Challan */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={trackingState.govtFees}
                                    onChange={() => handleCheckboxChange('govtFees')}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">Challan</span>
                            </label>
                            <button
                                onClick={() => updateTrack('govtFees', 'Challan')}
                                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm hover:bg-blue-200"
                            >
                                Update Challan Track
                            </button>
                        </div>

                        {/* DTO Passing */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={trackingState.rtoApproval}
                                    onChange={() => handleCheckboxChange('rtoApproval')}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">DTO Passing</span>
                            </label>
                            <button
                                onClick={() => updateTrack('rtoApproval', 'DTO')}
                                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm hover:bg-blue-200"
                            >
                                Update DTO Track
                            </button>
                        </div>

                        {/* MVI Passing */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={trackingState.inspection}
                                    onChange={() => handleCheckboxChange('inspection')}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">MVI Passing</span>
                            </label>
                            <button
                                onClick={() => updateTrack('inspection', 'MVI')}
                                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm hover:bg-blue-200"
                            >
                                Update MVI Track
                            </button>
                        </div>

                        {/* RC Card */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={trackingState.certificate}
                                    onChange={() => handleCheckboxChange('certificate')}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">RC Card</span>
                            </label>
                            <button
                                onClick={() => updateTrack('certificate', 'RC Card')}
                                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm hover:bg-blue-200"
                            >
                                Update RC Track
                            </button>
                        </div>
                    </div>
                </div>

                {/* Document Deliver Section */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Document Deliver</h2>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={trackingState.documentDelivered}
                                onChange={() => handleCheckboxChange('documentDelivered')}
                                className="rounded border-gray-300 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Complete</span>
                        </label>
                        <button
                            onClick={() => updateTrack('documentDelivered', 'Document Delivery')}
                            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm hover:bg-blue-200"
                        >
                            Update Track
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}