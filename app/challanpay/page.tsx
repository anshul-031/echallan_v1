
'use client';

import { useEffect, useState, Fragment } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';

interface ChallanType {
  id: string;
  challan_no: string;
  challan_status: string;
  fine_imposed: string;
  state_code: string;
  challan_date_time: Date;
  sent_to_reg_court: string;
}

interface UserType {
  id: string;
  email: string;
  name: string | null;
  role: string;
  credits: number;
  expiring_documents: number;
  expired_documents: number;
  joinDate: string;
}

export default function ChallanPayment() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rc_no = searchParams.get('rc_no');
  
  const [challans, setChallans] = useState<ChallanType[]>([]);
  const [selectedChallans, setSelectedChallans] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [activeTab, setActiveTab] = useState<'online' | 'court'>('online');
  const [isPriceBreakdownOpen, setIsPriceBreakdownOpen] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [showCreditAlert, setShowCreditAlert] = useState(false);
  const [filteredChallans, setFilteredChallans] = useState<ChallanType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!rc_no) return;
      
      try {
        setIsLoading(true);
        

        // Fetch pending challans from database
        const challansResponse = await axios.get(`/api/challans/vechicalnumberwisechallan?rc_no=${rc_no}`);
        if (challansResponse.data) {
          const pendingChallans = challansResponse.data || [];
          setChallans(pendingChallans.map((challan: any) => ({
            ...challan,
            id: challan.id, // Use the database ID

            challan_date_time: new Date(challan.challan_date_time)
          })));
        }

        // Fetch user profile data
        const profileResponse = await axios.get('/api/profile');
        setUser(profileResponse.data);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [rc_no]);

  useEffect(() => {
    setFilteredChallans(
      challans.filter(challan => 
        activeTab === 'online' 
          ? challan.sent_to_reg_court === 'No'
          : challan.sent_to_reg_court === 'Yes'
      )
    );
  }, [challans, activeTab]);

  const handleSelectChallan = (challanId: string) => {
    const challan = challans.find(c => c.id === challanId);
    if (!challan) return;

    const amount = parseFloat(challan.fine_imposed);
    const newSelected = new Set(selectedChallans);
    
    if (newSelected.has(challanId)) {
      newSelected.delete(challanId);
      setTotalAmount(prev => prev - amount);
    } else {
      newSelected.add(challanId);
      setTotalAmount(prev => prev + amount);
    }
    
    setSelectedChallans(newSelected);
  };

  const handlePayment = async () => {
    const selectedChallanDetails = Array.from(selectedChallans).map(id => {
      const challan = challans.find(c => c.id === id);
      if (!challan) return null;
      
      const base = parseFloat(challan.fine_imposed);
      const serviceFee = 100;
      const gst = 18;
      const total = base + serviceFee + gst;
      
      return {
        id: challan.id,
        challan_no: challan.challan_no,
        amount: base,
        serviceFee,
        gst,
        total
      };
    }).filter(Boolean);

    const totalWithFees = selectedChallanDetails.reduce((sum, challan) => 
      sum + challan!.total, 0
    );
    
    if (!user || totalWithFees > user.credits) {
      setShowCreditAlert(true);
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post('/api/payment', {
        challans: selectedChallanDetails,
        rc_no,
        total_amount: totalWithFees
      });

      if (response.data.success) {
        toast.success(`Successfully paid ${selectedChallans.size} challan(s)`);
        router.push(`/challan?rc_no=${rc_no}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const CreditAlertDialog = () => {
    const totalWithFees = totalAmount + (selectedChallans.size * 118);
    const requiredCredits = totalWithFees - (user?.credits || 0);
  
    return (
      <Transition appear show={showCreditAlert} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={() => setShowCreditAlert(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>
  
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title 
                    as="h3" 
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Insufficient Credits
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      You need {requiredCredits} more credits to complete this payment.
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Payment Amount:</span>
                        <span className="font-medium">₹{totalWithFees}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Your Available Credits:</span>
                        <span className="font-medium">₹{user?.credits || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm text-red-600 font-medium">
                        <span>Credits Required:</span>
                        <span>₹{requiredCredits}</span>
                      </div>
                    </div>
                  </div>
  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setShowCreditAlert(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      onClick={() => {
                        setShowCreditAlert(false);
                        router.push('/credits');
                      }}
                    >
                      Add Credits
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold">Pay E-Challans</h1>
          <p className="text-indigo-100 mt-1">Registration Number: {rc_no}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('online')}
              className={`px-6 py-4 font-medium flex-1 transition-colors duration-200 ${
                activeTab === 'online' 
                  ? 'text-indigo-700 border-b-2 border-indigo-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Online Challans
            </button>
            <button
              onClick={() => setActiveTab('court')}
              className={`px-6 py-4 font-medium flex-1 transition-colors duration-200 ${
                activeTab === 'court' 
                  ? 'text-indigo-700 border-b-2 border-indigo-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Court Challans
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Challans List */}
          <div className="lg:w-2/3 space-y-4">
            {/* Selection controls */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center mb-4">
              <span className="font-medium text-gray-700">
                {selectedChallans.size} challan{selectedChallans.size !== 1 ? 's' : ''} selected
              </span>
              <button 
                onClick={() => {
                  const visibleChallanIds = filteredChallans.map(c => c.id);
                  const allCurrentlySelected = visibleChallanIds.every(id => selectedChallans.has(id));
                  
                  if (allCurrentlySelected) {
                    // Unselect all visible challans
                    const newSelected = new Set(selectedChallans);
                    visibleChallanIds.forEach(id => {
                      newSelected.delete(id);
                      const challan = challans.find(c => c.id === id);
                      if (challan) {
                        setTotalAmount(prev => prev - parseFloat(challan.fine_imposed));
                      }
                    });
                    setSelectedChallans(newSelected);
                  } else {
                    // Select all visible challans
                    const newSelected = new Set(selectedChallans);
                    visibleChallanIds.forEach(id => {
                      if (!newSelected.has(id)) {
                        newSelected.add(id);
                        const challan = challans.find(c => c.id === id);
                        if (challan) {
                          setTotalAmount(prev => prev + parseFloat(challan.fine_imposed));
                        }
                      }
                    });
                    setSelectedChallans(newSelected);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <input 
                  type="checkbox" 
                  checked={filteredChallans.length > 0 && 
                    filteredChallans.every(challan => selectedChallans.has(challan.id))}
                  readOnly
                  className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                Select All {activeTab === 'online' ? 'Online' : 'Court'} Challans
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-gray-600">Loading challans...</p>
              </div>
            ) : filteredChallans.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="mt-2 text-lg font-medium text-gray-800">No {activeTab === 'online' ? 'online' : 'court'} challans found</p>
                <p className="text-gray-500">There are no pending {activeTab === 'online' ? 'online' : 'court'} challans for this vehicle.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredChallans.map(challan => (
                  <div key={challan.id} className="bg-white rounded-lg shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start p-4">
                      <div className="mr-4 mt-1">
                        <input
                          type="checkbox"
                          checked={selectedChallans.has(challan.id)}
                          onChange={() => handleSelectChallan(challan.id)}
                          className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                          <div>
                            <div className="flex items-center">
                              <span className="font-semibold text-gray-800">{challan.challan_no}</span>
                              <span className="ml-3 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {challan.challan_status}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                State: {challan.state_code}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                {new Date(challan.challan_date_time).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0 md:text-right">
                            <div className="bg-indigo-50 p-3 rounded-lg inline-block">
                              <p className="text-lg font-bold text-gray-800">₹{parseFloat(challan.fine_imposed) + 118}</p>
                              <div className="text-xs text-gray-500 mt-1">
                                <p>Fine: ₹{challan.fine_imposed}</p>
                                <p>Service Fee: ₹100</p>
                                <p>GST (18%): ₹18</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm sticky top-6">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Payment Summary</h2>
              </div>
              
              <div className="p-6">
                <div className="mb-6 flex items-center">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Available Credits</p>
                    <p className="text-2xl font-bold text-indigo-700">₹{user?.credits || 0}</p>
                  </div>
                  <button
                    onClick={() => router.push('/credits')}
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 font-medium rounded-lg hover:bg-indigo-200 transition-colors"
                  >
                    Add Credits
                  </button>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => setIsPriceBreakdownOpen(!isPriceBreakdownOpen)}
                    className="w-full flex justify-between items-center py-3 border-t text-gray-700"
                  >
                    <span className="font-medium">Price Breakdown</span>
                    {isPriceBreakdownOpen ? (
                      <ChevronUpIcon className="h-5 w-5" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5" />
                    )}
                  </button>

                  {isPriceBreakdownOpen && (
                    <div className="py-2 space-y-3 bg-gray-50 p-4 rounded-lg">
                      {Array.from(selectedChallans).map(id => {
                        const challan = challans.find(c => c.id === id);
                        if (!challan) return null;
                        
                        return (
                          <div key={id} className="border-b pb-3">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Challan {challan.challan_no}</span>
                              <span>₹{challan.fine_imposed}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>Service Fee</span>
                              <span>₹100</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>GST (18%)</span>
                              <span>₹18</span>
                            </div>
                          </div>
                        );
                      })}
                      
                      {selectedChallans.size > 0 && (
                        <div className="flex justify-between font-medium pt-2 text-gray-900">
                          <span>Total Amount</span>
                          <span>₹{totalAmount + (selectedChallans.size * 118)}</span>
                        </div>
                      )}
                      
                      {selectedChallans.size === 0 && (
                        <p className="text-center text-gray-500 py-2">No challans selected</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTermsAccepted}
                      onChange={(e) => setIsTermsAccepted(e.target.checked)}
                      className="h-4 w-4 mt-1 text-indigo-600 focus:ring-indigo-500 rounded"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the <span className="text-indigo-600 hover:underline">terms and conditions</span> for online challan payment
                    </span>
                  </label>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={!isTermsAccepted || isLoading || selectedChallans.size === 0}
                  className={`w-full mt-6 py-4 rounded-lg text-white font-medium text-lg transition-colors ${
                    !isTermsAccepted || isLoading || selectedChallans.size === 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isLoading 
                    ? 'Processing...' 
                    : selectedChallans.size === 0
                      ? 'Select Challans to Pay'
                      : `Pay ₹${totalAmount + (selectedChallans.size * 118)}`
                  }
                </button>
                
                {selectedChallans.size > 0 && (
                  <p className="text-center text-gray-500 text-sm mt-2">
                    Paying {selectedChallans.size} challan{selectedChallans.size !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <CreditAlertDialog />
    </div>
  );
}