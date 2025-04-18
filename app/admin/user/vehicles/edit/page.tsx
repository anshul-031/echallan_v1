'use client';

import { useEffect, useState } from 'react';
import { format, parse } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Vehicle {
    id: number;
    vrn: string;
    roadTax: string;
    roadTaxDoc?: string;
    fitness: string;
    fitnessDoc?: string;
    insurance: string;
    insuranceDoc?: string;
    pollution: string;
    pollutionDoc?: string;
    statePermit: string;
    statePermitDoc?: string;
    nationalPermit: string;
    nationalPermitDoc?: string;
    status: string;
    registeredAt: string;
    lastUpdated: string;
}

type DocumentType = 'roadTax' | 'fitness' | 'insurance' | 'pollution' | 'statePermit' | 'nationalPermit';

export default function EditVehicle() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [uploadingDoc, setUploadingDoc] = useState<DocumentType | null>(null);

    useEffect(() => {
        if (id) fetchVehicle();
    }, [id]);

    const fetchVehicle = async () => {
        try {
            const response = await fetch(`/api/admin/user/vehicles/${id}`);
            if (!response.ok) throw new Error('Failed to fetch vehicle');
            const data = await response.json();

            // Format dates for display
            const formattedData = {
                ...data,
                roadTax: data.roadTax ? formatDateToDDMMYYYY(data.roadTax) : '',
                fitness: data.fitness ? formatDateToDDMMYYYY(data.fitness) : '',
                insurance: data.insurance ? formatDateToDDMMYYYY(data.insurance) : '',
                pollution: data.pollution ? formatDateToDDMMYYYY(data.pollution) : '',
                statePermit: data.statePermit ? formatDateToDDMMYYYY(data.statePermit) : '',
                nationalPermit: data.nationalPermit ? formatDateToDDMMYYYY(data.nationalPermit) : ''
            };
            setVehicle(formattedData);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load vehicle');
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentUpload = async (docType: DocumentType, file: File) => {
        if (!file || !vehicle) return;

        setUploadingDoc(docType);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('vehicleId', id || '');
        formData.append('docType', docType);

        try {
            const response = await fetch('/api/admin/user/vehicles/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Upload failed');

            setVehicle(prev => prev ? {
                ...prev,
                [`${docType}Doc`]: data.url
            } : null);

            toast.success('Document uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload document');
        } finally {
            setUploadingDoc(null);
        }
    };

    function formatDateToDDMMYYYY(dateString: string | null) {
        try {
            if (!dateString) return '';
            // First try parsing as DD-MM-YYYY
            if (dateString.includes('-') && dateString.length === 10) {
                const [day, month, year] = dateString.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                if (!isNaN(date.getTime())) {
                    return dateString;
                }
            }
            // Then try as ISO date
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return format(date, 'dd-MM-yyyy');
        } catch (error) {
            return '';
        }
    }

    function parseDate(dateString: string) {
        try {
            if (!dateString) return '';
            if (dateString.includes('-')) {
                const [day, month, year] = dateString.split('-').map(Number);
                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    return format(new Date(year, month - 1, day), 'yyyy-MM-dd');
                }
            }
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return format(date, 'yyyy-MM-dd');
        } catch (error) {
            return '';
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vehicle || submitting) return;

        setSubmitting(true);
        try {
            const response = await fetch(`/api/admin/user/vehicles/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...vehicle,
                    roadTax: parseDate(vehicle.roadTax),
                    fitness: parseDate(vehicle.fitness),
                    insurance: parseDate(vehicle.insurance),
                    pollution: parseDate(vehicle.pollution),
                    statePermit: parseDate(vehicle.statePermit),
                    nationalPermit: parseDate(vehicle.nationalPermit)
                }),
            });

            if (!response.ok) throw new Error('Update failed');

            toast.success('Vehicle updated successfully');
            router.back();
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update vehicle');
        } finally {
            setSubmitting(false);
        }
    };

    function DocumentRow({ docType, label }: { docType: DocumentType; label: string }) {
        return (
            <div className="flex items-center bg-gray-50 shadow-lg justify-between p-8   rounded-lg">
                <div>
                    <p className="font-medium text-gray-900">{label}</p>
                    <input
                        type="date"
                        value={parseDate(vehicle?.[docType] || '')}
                        onChange={(e) => setVehicle(prev => prev ? {
                            ...prev,
                            [docType]: formatDateToDDMMYYYY(e.target.value)
                        } : null)}
                        className="mt-1 block w-44 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 text-gray-700 bg-white shadow-sm cursor-pointer relative [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:hover:bg-gray-100 [&::-webkit-calendar-picker-indicator]:rounded"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDocumentUpload(docType, file);
                        }}
                        className="hidden"
                        id={`file-${docType}`}
                    />
                    <label
                        htmlFor={`file-${docType}`}
                        className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer
                            ${uploadingDoc === docType
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {uploadingDoc === docType ? 'Uploading...' : 'Upload'}
                    </label>
                    {vehicle?.[`${docType}Doc`] && (
                        <button
                            type="button"
                            onClick={() => window.open(vehicle[`${docType}Doc`], '_blank')}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-gray-600 text-white hover:bg-gray-700"
                        >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />
                            View
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (loading) return <div className="p-6">Loading...</div>;
    if (!vehicle) return <div className="p-6">Vehicle not found</div>;

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back
                </button>

                <form onSubmit={handleSubmit}>
                    {/* Vehicle Header */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{vehicle.vrn}</h1>
                                <p className="text-sm text-gray-500">Vehicle Registration Number</p>
                            </div>
                            <select
                                value={vehicle.status}
                                onChange={(e) => setVehicle({ ...vehicle, status: e.target.value })}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${vehicle.status === 'Active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Document Fields */}
                    <div className="flex flex-col gap-10 rounded-lg shadow-sm">
                        <DocumentRow docType="roadTax" label="Road Tax" />
                        <DocumentRow docType="insurance" label="Insurance" />
                        <DocumentRow docType="fitness" label="Fitness" />
                        <DocumentRow docType="pollution" label="Pollution" />
                        <DocumentRow docType="statePermit" label="State Permit" />
                        <DocumentRow docType="nationalPermit" label="National Permit" />
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                        >
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}