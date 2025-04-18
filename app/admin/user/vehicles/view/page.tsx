'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeftIcon, DocumentArrowDownIcon, ArrowDownTrayIcon, PencilIcon } from '@heroicons/react/24/outline';

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

export default function ViewVehicle() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);

    useEffect(() => {
        if (id) fetchVehicle();
    }, [id]);

    const fetchVehicle = async () => {
        try {
            const response = await fetch(`/api/admin/user/vehicles/${id}`);
            if (!response.ok) throw new Error('Failed to fetch vehicle');
            const data = await response.json();
            setVehicle(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

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

                {/* Vehicle Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center mb-4 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{vehicle.vrn}</h1>
                            <p className="text-sm text-gray-500">Vehicle Registration Number</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${vehicle.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {vehicle.status}
                            </span>
                            <button
                                onClick={() => router.push(`/admin/user/vehicles/edit?id=${vehicle.id}`)}
                                className="p-1.5 rounded-lg hover:bg-gray-100"
                            >
                                <PencilIcon className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Document Details */}
                <div className="flex flex-col gap-10 rounded-lg">
                    <DocumentRow
                        label="Road Tax"
                        date={vehicle.roadTax}
                        docUrl={vehicle.roadTaxDoc}
                        vrn={vehicle.vrn}
                    />
                    <DocumentRow
                        label="Insurance"
                        date={vehicle.insurance}
                        docUrl={vehicle.insuranceDoc}
                        vrn={vehicle.vrn}
                    />
                    <DocumentRow
                        label="Fitness"
                        date={vehicle.fitness}
                        docUrl={vehicle.fitnessDoc}
                        vrn={vehicle.vrn}
                    />
                    <DocumentRow
                        label="Pollution"
                        date={vehicle.pollution}
                        docUrl={vehicle.pollutionDoc}
                        vrn={vehicle.vrn}
                    />
                    <DocumentRow
                        label="State Permit"
                        date={vehicle.statePermit}
                        docUrl={vehicle.statePermitDoc}
                        vrn={vehicle.vrn}
                    />
                    <DocumentRow
                        label="National Permit"
                        date={vehicle.nationalPermit}
                        docUrl={vehicle.nationalPermitDoc}
                        vrn={vehicle.vrn}
                    />
                </div>
            </div>
        </div>
    );
}

function DocumentRow({ label, date, docUrl, vrn }: { label: string; date: string; docUrl?: string; vrn: string }) {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        if (!docUrl) return

            ;

        try {
            setDownloading(true);

            const fileExtension = docUrl.substring(docUrl.lastIndexOf('.'));
            const fileName = `${vrn}_${label.toLowerCase().replace(' ', '_')}${fileExtension}`;
            const downloadUrl = `/api/admin/user/vehicles/download?url=${encodeURIComponent(docUrl)}&fileName=${encodeURIComponent(fileName)}`;

            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error('Failed to download file');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="flex bg-gray-50 shadow-md rounded-lg items-center justify-between p-8">
            <div>
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-500">Expires: {date}</p>
            </div>
            {(!docUrl) && <p>No Document</p>}
            {docUrl && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.open(docUrl, '_blank')}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                        <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />
                        View
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-green-50 text-green-600 hover:bg-green-100 disabled:bg-green-50/50 disabled:text-green-500"
                    >
                        {downloading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Downloading...
                            </>
                        ) : (
                            <>
                                <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
                                Download
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}