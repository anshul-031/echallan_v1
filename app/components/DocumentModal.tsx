'use client';

import { useState } from 'react';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import { DocumentArrowDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import 'react-toastify/dist/ReactToastify.css';

// Document types
const documentTypes = [
    'Registration Certificate',
    'Pollution',
    'Insurance',
    'Fitness',
    'Permit',
    'National Permit',
    'Speed Limit Device',
    'Reflective Tape',
    'Road Tax'
];

// Set app element for accessibility
if (typeof window !== 'undefined') {
    Modal.setAppElement('body');
}

interface DocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    vrn: string;
}

export default function DocumentModal({ isOpen, onClose, vrn }: DocumentModalProps) {
    const [uploading, setUploading] = useState<string | null>(null);
    const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});

    const handleFileUpload = async (docType: string, file: File | null) => {
        if (!file) return;

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        // Validate file type
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            toast.error('Only PDF, JPG, and PNG files are allowed');
            return;
        }

        setUploading(docType);

        try {
            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulate successful upload
            setUploadedDocs(prev => ({ ...prev, [docType]: true }));
            toast.success(`${docType} uploaded successfully`);
        } catch (error) {
            toast.error(`Failed to upload ${docType}`);
        } finally {
            setUploading(null);
        }
    };

    const handleDownload = (docType: string) => {
        // Simulate download - in real implementation, this would call an API endpoint
        toast.info(`Downloading ${docType}...`);
        // window.open(`/api/download-document?vrn=${vrn}&docType=${docType}`, '_blank');
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onRequestClose={onClose}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[500px] max-w-[90vw] outline-none"
                overlayClassName="fixed inset-0 bg-black/50"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Upload/Download Documents for VRN: {vrn}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {documentTypes.map((docType) => (
                        <div key={docType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">{docType}</span>
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => handleFileUpload(docType, e.target.files?.[0] || null)}
                                        className="hidden"
                                        id={`file-${docType}`}
                                    />
                                    <label
                                        htmlFor={`file-${docType}`}
                                        className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md
                      ${uploading === docType
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                            } cursor-pointer transition-colors`}
                                    >
                                        {uploading === docType ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Uploading...
                                            </span>
                                        ) : 'Upload'}
                                    </label>
                                </div>

                                <button
                                    onClick={() => handleDownload(docType)}
                                    disabled={!uploadedDocs[docType]}
                                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md
                    ${uploadedDocs[docType]
                                            ? 'bg-gray-600 text-white hover:bg-gray-700'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        } transition-colors`}
                                >
                                    <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                                    Preview
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            toast.success('Documents updated successfully');
                            onClose();
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Update
                    </button>
                </div>
            </Modal>
            <ToastContainer position="bottom-right" />
        </>
    );
}