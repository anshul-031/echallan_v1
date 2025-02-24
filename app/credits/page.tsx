'use client';

import { useState } from 'react';
import { CreditCardIcon, ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';

const creditPackages = [
  {
    id: 1,
    name: 'Basic',
    credits: 100,
    price: '₹499',
    features: [
      '100 Vehicle Lookups',
      'Basic Support',
      'Valid for 30 days'
    ]
  },
  {
    id: 2,
    name: 'Professional',
    credits: 500,
    price: '₹1,999',
    features: [
      '500 Vehicle Lookups',
      'Priority Support',
      'Valid for 60 days',
      'Bulk Upload Support'
    ]
  },
  {
    id: 3,
    name: 'Enterprise',
    credits: 2000,
    price: '₹6,999',
    features: [
      '2000 Vehicle Lookups',
      '24/7 Premium Support',
      'Valid for 90 days',
      'Bulk Upload Support',
      'API Access'
    ]
  }
];

const transactionHistory = [
  {
    id: 1,
    date: '2024-01-23',
    type: 'Purchase',
    credits: 500,
    amount: '₹1,999',
    status: 'Completed'
  },
  {
    id: 2,
    date: '2024-01-15',
    type: 'Usage',
    credits: -50,
    amount: '-',
    status: 'Completed'
  }
];

export default function CreditsPage() {
  const [currentCredits] = useState(450);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Credits & Pricing</h1>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <PlusIcon className="w-5 h-5 mr-2" />
            Buy Credits
          </button>
        </div>

        {/* Current Credits Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Available Credits</h2>
              <p className="mt-1 text-3xl font-semibold text-blue-600">{currentCredits}</p>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
              <ArrowPathIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Credit Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creditPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{pkg.name}</h3>
                <CreditCardIcon className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-4">{pkg.price}</p>
              <p className="text-sm text-gray-500 mb-6">{pkg.credits} credits</p>
              <ul className="space-y-3 mb-6">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full px-4 py-2 border border-blue-600 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                Purchase
              </button>
            </div>
          ))}
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactionHistory.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={transaction.credits > 0 ? 'text-green-600' : 'text-red-600'}>
                        {transaction.credits > 0 ? '+' : ''}{transaction.credits}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}