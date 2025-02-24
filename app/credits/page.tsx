'use client';

import { useState } from 'react';
import { 
  CreditCardIcon, 
  ArrowPathIcon, 
  PlusIcon,
  CheckIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BuildingLibraryIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const creditPackages = [
  {
    id: 1,
    name: 'Basic',
    credits: 100,
    price: '₹499',
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'hover:from-blue-600 hover:to-blue-700',
    shadowColor: 'shadow-blue-500/20',
    textGradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
    iconGradient: 'bg-gradient-to-br from-blue-500/10 to-blue-600/10',
    borderColor: 'border-blue-100',
    icon: BuildingLibraryIcon,
    features: [
      '100 Vehicle Lookups',
      'Basic Support',
      'Valid for 30 days',
      'Email Support'
    ]
  },
  {
    id: 2,
    name: 'Professional',
    credits: 500,
    price: '₹1,999',
    color: 'from-purple-500 to-purple-600',
    hoverColor: 'hover:from-purple-600 hover:to-purple-700',
    shadowColor: 'shadow-purple-500/20',
    textGradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
    iconGradient: 'bg-gradient-to-br from-purple-500/10 to-purple-600/10',
    borderColor: 'border-purple-100',
    icon: SparklesIcon,
    features: [
      '500 Vehicle Lookups',
      'Priority Support',
      'Valid for 60 days',
      'Bulk Upload Support',
      'Phone Support'
    ]
  },
  {
    id: 3,
    name: 'Enterprise',
    credits: 2000,
    price: '₹6,999',
    color: 'from-emerald-500 to-emerald-600',
    hoverColor: 'hover:from-emerald-600 hover:to-emerald-700',
    shadowColor: 'shadow-emerald-500/20',
    textGradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    iconGradient: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10',
    borderColor: 'border-emerald-100',
    icon: RocketLaunchIcon,
    features: [
      '2000 Vehicle Lookups',
      '24/7 Premium Support',
      'Valid for 90 days',
      'Bulk Upload Support',
      'API Access',
      'Dedicated Account Manager'
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
    status: 'Completed',
    isPositive: true
  },
  {
    id: 2,
    date: '2024-01-15',
    type: 'Usage',
    credits: -50,
    amount: '-',
    status: 'Completed',
    isPositive: false
  }
];

export default function CreditsPage() {
  const [currentCredits] = useState(450);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Credits & Pricing</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your credits and view pricing plans</p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PlusIcon className="w-5 h-5 mr-2" />
            Buy Credits
          </button>
        </div>

        {/* Current Credits Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-white/90">Available Credits</h2>
                <p className="mt-1 text-3xl font-semibold text-white">{currentCredits}</p>
              </div>
              <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <ArrowPathIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-b from-blue-50/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-600">Usage this month</span>
              <span className="font-medium">50 credits</span>
            </div>
          </div>
        </div>

        {/* Credit Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPackages.map((pkg, index) => (
            <div
              key={pkg.id}
              className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer
                transform hover:scale-[1.02] hover:-translate-y-1`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {/* Animated Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${pkg.color} opacity-0 
                transition-opacity duration-300 blur-xl
                ${hoveredCard === index ? 'opacity-20' : ''}`}
              />
              
              {/* Card Content */}
              <div className={`relative bg-white border ${pkg.borderColor} p-6 h-full
                transition-all duration-300
                ${hoveredCard === index ? pkg.shadowColor : 'shadow-sm'}
                ${selectedPackage === pkg.id ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${pkg.iconGradient}`}>
                        <pkg.icon className={`w-5 h-5 ${pkg.textGradient} bg-clip-text`} />
                      </div>
                      <p className="text-gray-500 text-sm font-medium">{pkg.name}</p>
                    </div>
                    <p className={`text-3xl font-bold mt-2 ${pkg.textGradient} bg-clip-text text-transparent`}>
                      {pkg.price}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{pkg.credits} credits</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>

                <button className={`mt-6 w-full px-4 py-2 bg-gradient-to-r ${pkg.color} ${pkg.hoverColor}
                  text-white rounded-lg shadow-sm transition-all duration-300
                  transform hover:translate-y-[-2px]`}>
                  Purchase Plan
                </button>

                {/* Hover Effect Indicator */}
                <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full transition-all duration-300
                  bg-gradient-to-r ${pkg.color}
                  ${hoveredCard === index ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                />
              </div>
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
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {transaction.isPositive ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          transaction.isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.isPositive ? '+' : ''}{transaction.credits}
                        </span>
                      </div>
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