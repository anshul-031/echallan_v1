'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  CreditCardIcon, 
  ArrowPathIcon, 
  PlusIcon, 
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ServerIcon,
  CheckIcon,
  ArrowTrendingUpIcon,
  CurrencyRupeeIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const creditPackages = [
  {
    id: 1,
    name: 'Basic',
    credits: 100,
    price: '₹499',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    icon: CreditCardIcon,
    features: [
      '100 Vehicle Lookups',
      'Basic Support',
      'Valid for 30 days'
    ],
    popular: false
  },
  {
    id: 2,
    name: 'Professional',
    credits: 500,
    price: '₹1,999',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    icon: ShieldCheckIcon,
    features: [
      '500 Vehicle Lookups',
      'Priority Support',
      'Valid for 60 days',
      'Bulk Upload Support'
    ],
    popular: true
  },
  {
    id: 3,
    name: 'Enterprise',
    credits: 2000,
    price: '₹6,999',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    icon: ServerIcon,
    features: [
      '2000 Vehicle Lookups',
      '24/7 Premium Support',
      'Valid for 90 days',
      'Bulk Upload Support',
      'API Access'
    ],
    popular: false
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
    icon: BanknotesIcon,
    color: 'green'
  },
  {
    id: 2,
    date: '2024-01-15',
    type: 'Usage',
    credits: -50,
    amount: '-',
    status: 'Completed',
    icon: ArrowTrendingUpIcon,
    color: 'blue'
  },
  {
    id: 3,
    date: '2024-01-10',
    type: 'Purchase',
    credits: 100,
    amount: '₹499',
    status: 'Completed',
    icon: BanknotesIcon,
    color: 'green'
  },
  {
    id: 4,
    date: '2024-01-05',
    type: 'Usage',
    credits: -75,
    amount: '-',
    status: 'Completed',
    icon: ArrowTrendingUpIcon,
    color: 'blue'
  }
];

export default function CreditsPage() {
  const [currentCredits, setCurrentCredits] = useState(0);
  const [targetCredits] = useState(450);
  const [hoveredPackage, setHoveredPackage] = useState<number | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [animatedPrices, setAnimatedPrices] = useState<number[]>([0, 0, 0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animate credits counter on load
  useEffect(() => {
    const duration = 1500; // ms
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const currentValue = Math.round(progress * targetCredits);
      
      setCurrentCredits(currentValue);

      if (frame === totalFrames) {
        clearInterval(timer);
      }
    }, frameDuration);

    return () => clearInterval(timer);
  }, [targetCredits]);

  // Animate package prices
  useEffect(() => {
    creditPackages.forEach((pkg, index) => {
      const targetValue = parseInt(pkg.price.replace(/[^\d]/g, ''));
      let startValue = 0;
      const duration = 1500; // ms
      const frameDuration = 1000 / 60; // 60fps
      const totalFrames = Math.round(duration / frameDuration);
      let frame = 0;

      const timer = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const currentValue = Math.round(startValue + progress * (targetValue - startValue));
        
        setAnimatedPrices(prev => {
          const newValues = [...prev];
          newValues[index] = currentValue;
          return newValues;
        });

        if (frame === totalFrames) {
          clearInterval(timer);
        }
      }, frameDuration);

      return () => clearInterval(timer);
    });
  }, []);

  // Abstract background effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particles
    const particles: {
      x: number;
      y: number;
      radius: number;
      color: string;
      speedX: number;
      speedY: number;
    }[] = [];

    // Create particles
    const createParticles = () => {
      const particleCount = 50;
      const colors = ['rgba(59, 130, 246, 0.2)', 'rgba(139, 92, 246, 0.2)', 'rgba(16, 185, 129, 0.2)'];

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 5 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5
        });
      }
    };

    createParticles();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY *= -1;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      // Connect particles with lines
      particles.forEach((particle, i) => {
        particles.forEach((particle2, j) => {
          if (i !== j) {
            const dx = particle.x - particle2.x;
            const dy = particle.y - particle2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 100)})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(particle2.x, particle2.y);
              ctx.stroke();
            }
          }
        });
      });
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handlePurchase = (id: number) => {
    setSelectedPackage(id);
    setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6 relative overflow-hidden">
      {/* Abstract Background Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      
      <div className="relative z-10 space-y-6">
        {/* Header with animated gradient */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white shadow-lg animate-gradient">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mt-20 -mr-20 transform rotate-45"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-semibold text-white mb-2">Credits & Pricing</h1>
            <p className="text-blue-100 max-w-2xl">Manage your credits and purchase packages to access our services.</p>
          </div>
        </div>

        {/* Current Credits Card with Animation */}
        <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Available Credits</h2>
              <div className="flex items-baseline mt-2">
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {currentCredits}
                </p>
                <span className="ml-2 text-sm text-gray-500">credits</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Last updated: Today at 10:30 AM</p>
            </div>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-75 blur-sm animate-pulse"></div>
              <button className="relative p-3 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
                <ArrowPathIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Credit Usage Visualization */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Usage this month</span>
              <span className="text-sm font-medium text-gray-900">50 credits</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: '10%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Credit Packages with Animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPackages.map((pkg, index) => (
            <div
              key={pkg.id}
              className={`relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
                pkg.popular ? 'md:scale-105 md:-translate-y-1 z-10' : ''
              }`}
              onMouseEnter={() => setHoveredPackage(index)}
              onMouseLeave={() => setHoveredPackage(null)}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg z-20 shadow-md animate-pulse">
                  MOST POPULAR
                </div>
              )}
              
              {/* Animated Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${pkg.gradient} opacity-0 
                transition-opacity duration-300 blur-xl
                ${hoveredPackage === index ? 'opacity-20' : ''}`}
              />
              
              {/* Card Content */}
              <div className={`relative bg-white rounded-xl p-6 h-full border ${
                pkg.popular ? 'border-purple-200' : 'border-gray-200'
              } transition-all duration-300 ${
                hoveredPackage === index ? `shadow-lg shadow-${pkg.color}-500/20` : 'shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-bold bg-gradient-to-r ${pkg.gradient} bg-clip-text text-transparent`}>
                    {pkg.name}
                  </h3>
                  <div className={`p-3 rounded-full bg-${pkg.color}-50 transition-all duration-300 ${
                    hoveredPackage === index ? `bg-${pkg.color}-100` : ''
                  }`}>
                    <pkg.icon className={`w-6 h-6 text-${pkg.color}-500`} />
                  </div>
                </div>
                
                <p className="text-3xl font-bold mb-1">
                  ₹{animatedPrices[index].toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mb-6">{pkg.credits} credits</p>
                
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600 animate-fadeIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <CheckIcon className={`w-5 h-5 text-${pkg.color}-500 mr-2 flex-shrink-0`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => handlePurchase(pkg.id)}
                  className={`w-full px-4 py-3 bg-gradient-to-r ${pkg.gradient} text-white rounded-lg hover:opacity-90 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-md flex items-center justify-center`}
                >
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Purchase
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Transaction History with Animation */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                {transactionHistory.map((transaction, index) => (
                  <tr 
                    key={transaction.id} 
                    className="hover:bg-gray-50 transition-colors animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full bg-${transaction.color}-50 flex items-center justify-center`}>
                          <transaction.icon className={`h-4 w-4 text-${transaction.color}-500`} />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{transaction.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={transaction.credits > 0 ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}>
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
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Showing {transactionHistory.length} transactions</span>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View All Transactions
              </button>
            </div>
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">How Credits Work</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                  <CreditCardIcon className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Credits are used to access our vehicle lookup services and API endpoints. Each lookup consumes one credit.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center mr-3">
                  <ClockIcon className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Credits expire based on the package you purchase. Check the package details for validity period.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center mr-3">
                  <UserGroupIcon className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Enterprise customers can request custom credit packages with extended validity and additional features.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center mr-3">
                  <DocumentTextIcon className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check our <a href="#" className="text-blue-600 hover:underline">documentation</a> for detailed information about our credit system and API usage.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-50 flex items-center justify-center mr-3">
                  <EnvelopeIcon className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact our support team at <a href="mailto:support@fleetmanager.com" className="text-blue-600 hover:underline">support@fleetmanager.com</a> for assistance.</p>
                </div>
              </div>
              <button className="mt-2 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      {showPaymentModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <h3 className="text-lg font-medium">
                Purchase Credits
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-2">You are purchasing:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        {creditPackages[selectedPackage - 1].name} Package
                      </p>
                      <p className="text-sm text-gray-500">
                        {creditPackages[selectedPackage - 1].credits} credits
                      </p>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {creditPackages[selectedPackage - 1].price}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      id="expiry"
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      placeholder="123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle payment logic
                    setShowPaymentModal(false);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:opacity-90"
                >
                  Complete Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Import the EnvelopeIcon
import { EnvelopeIcon, XMarkIcon } from '@heroicons/react/24/outline';