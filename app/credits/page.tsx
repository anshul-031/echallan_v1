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
  BanknotesIcon,
  EnvelopeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const creditPackages = [
  {
    id: 1,
    name: 'Basic',
    credits: 100,
    price: '₹100',
    priceAmount: 100,
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
    price: '₹500',
    priceAmount: 500,
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
    price: '₹2,000',
    priceAmount: 2000,
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

export default function CreditsPage() {
  const searchParams = useSearchParams();
  const [currentCredits, setCurrentCredits] = useState(0);
  const [targetCredits] = useState(450);
  const [hoveredPackage, setHoveredPackage] = useState<number | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [animatedPrices, setAnimatedPrices] = useState([0, 0, 0]);
  const canvasRef = useRef(null);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    state: '',
    hasGst: '',
    gstNumber: '',
    desiredAmount: 0
  });

  // Add ref for the form section
  const formRef = useRef<HTMLDivElement>(null);

  // Handle URL parameters on component mount
  useEffect(() => {
    const amount = searchParams.get('amount');
    if (amount) {
      const numericAmount = parseInt(amount);
      if (!isNaN(numericAmount) && numericAmount > 0) {
        setFormData(prev => ({
          ...prev,
          desiredAmount: numericAmount
        }));
        // Scroll to the form section
        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [searchParams]);

  // Calculate GST and final amount
  const calculateAmounts = () => {
    const baseAmount = formData.desiredAmount;
    const sgst = baseAmount * 0.09;
    const cgst = baseAmount * 0.09;
    const finalAmount = baseAmount + sgst + cgst;

    return {
      baseAmount,
      sgst,
      cgst,
      finalAmount
    };
  };

  const amounts = calculateAmounts();

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle desired amount change
  const handleDesiredAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setFormData(prev => ({
      ...prev,
      desiredAmount: value
    }));
  };

  // Handle GST radio change
  const handleGstChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      hasGst: value
    }));
  };

  // Handle form submission
  const handleCustomPurchase = async () => {
    if (!formData.companyName || !formData.address || !formData.state || !formData.hasGst) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.hasGst === 'yes' && !formData.gstNumber) {
      alert('Please enter your GST number');
      return;
    }

    try {
      setPaymentProcessing(true);

      // Create a Razorpay order (in production, this would be done via API)
      const options = {
        key: "rzp_test_LetnicYdIN9c1h", // Test mode key
        amount: amounts.finalAmount * 100, // Amount in smallest currency unit (paise)
        currency: "INR",
        name: "Fleet Manager",
        description: `Purchase ${formData.desiredAmount} credits`,
        image: "https://yourdomain.com/logo.png", // Your company logo
        handler: function (response: any) {
          // Handle successful payment
          console.log("Payment successful", response);
          handlePaymentSuccess({
            id: Date.now(),
            name: "Custom Package",
            credits: formData.desiredAmount,
            price: `₹${formData.desiredAmount}`,
            priceAmount: formData.desiredAmount,
            color: "blue",
            gradient: "from-blue-500 to-blue-600",
            icon: CreditCardIcon,
            features: [`${formData.desiredAmount} Vehicle Lookups`, "Basic Support", "Valid for 30 days"],
            popular: false
          });
        },
        prefill: {
          name: formData.companyName,
          email: "test@example.com",
          contact: "9999999999"
        },
        notes: {
          companyName: formData.companyName,
          address: formData.address,
          state: formData.state,
          hasGst: formData.hasGst,
          gstNumber: formData.gstNumber
        },
        theme: {
          color: "#3399cc"
        },
        modal: {
          ondismiss: function () {
            setPaymentProcessing(false);
            console.log("Payment modal closed");
          }
        }
      };

      if (!isRazorpayLoaded) {
        throw new Error("Razorpay not loaded");
      }

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      setPaymentProcessing(false);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  // Fetch transaction history
  const fetchTransactionHistory = async () => {
    try {
      setIsLoadingTransactions(true);
      setTransactionError('');
      
      const response = await fetch('/api/credits/purchase?limit=10&page=1');
      
      if (!response.ok) {
        throw new Error('Failed to fetch transaction history');
      }
      
      const data = await response.json();
      // Transform the data to match the new table structure
      const transformedTransactions = data.transactions.map((transaction: any, index: number) => ({
        srNo: index + 1,
        orderId: transaction.transactionId || `ORD-${Date.now()}-${index + 1}`,
        date: new Date(transaction.createdAt).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        totalAmount: transaction.amount || 0,
        status: transaction.status || 'COMPLETED'
      }));
      setTransactionData(transformedTransactions);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      setTransactionError('Failed to load transaction history');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Fetch user data and transaction history on component mount
  useEffect(() => {
    fetchTransactionHistory();
  }, []);

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
    const canvas = canvasRef.current as HTMLCanvasElement | null;
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
    interface Particle {
      x: number;
      y: number;
      radius: number;
      color: string;
      speedX: number;
      speedY: number;
    }

    const particles: Particle[] = [];

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

  // Update handlePurchase to include auto-fill and scroll
  const handlePurchase = (id: number) => {
    setSelectedPackage(id);
    const packageDetails = creditPackages.find(pkg => pkg.id === id);
    if (packageDetails) {
      // Auto-fill the form with package details
      setFormData(prev => ({
        ...prev,
        desiredAmount: packageDetails.priceAmount
      }));
      
      // Scroll to the form section
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Handle Razorpay Script load
  const handleRazorpayLoad = () => {
    setIsRazorpayLoaded(true);
  };

  // Handle successful payment
  interface PackageDetails {
    id: number;
    name: string;
    credits: number;
    price: string;
    priceAmount: number;
    color: string;
    gradient: string;
    icon: React.ComponentType;
    features: string[];
    popular: boolean;
  }

  const handlePaymentSuccess = async (packageDetails: PackageDetails) => {
    try {
      // Create a transaction record in the database
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: packageDetails.id,
          credits: packageDetails.credits,
          amount: packageDetails.priceAmount,
          transactionId: `rzp_${Date.now()}`, // In real app, this would come from Razorpay
          status: 'COMPLETED'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process payment');
      }

      const data = await response.json();
      
      // Update local state with new credits
      setCurrentCredits(data.user.credits);
      
      // Refresh transaction history
      fetchTransactionHistory();

      // Close the modal
      setShowPaymentModal(false);
      setPaymentProcessing(false);

      // Show success message or notification
      alert(`Successfully purchased ${packageDetails.credits} credits!`);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment was successful, but there was an error updating your account. Please contact support.');
      setPaymentProcessing(false);
      setShowPaymentModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6 relative overflow-hidden">
      {/* Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={handleRazorpayLoad}
      />

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
              className={`relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${pkg.popular ? 'md:scale-105 md:-translate-y-1 z-10' : ''
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
              <div className={`relative bg-white rounded-xl p-6 h-full border ${pkg.popular ? 'border-purple-200' : 'border-gray-200'
                } transition-all duration-300 ${hoveredPackage === index ? `shadow-lg shadow-${pkg.color}-500/20` : 'shadow-sm'
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-bold bg-gradient-to-r ${pkg.gradient} bg-clip-text text-transparent`}>
                    {pkg.name}
                  </h3>
                  <div className={`p-3 rounded-full bg-${pkg.color}-50 transition-all duration-300 ${hoveredPackage === index ? `bg-${pkg.color}-100` : ''
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

        {/* Custom Credit Purchase Form */}
        <div ref={formRef} className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600">
            <h3 className="text-lg font-medium text-white">Add Credits</h3>
            <p className="text-sm text-blue-100 mt-1">Purchase credits to access our services</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Credit Rate Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CurrencyRupeeIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-900">Credit Rate</h4>
                  <p className="text-sm text-blue-700">1 Credit = 1 Rupee</p>
                </div>
              </div>
            </div>
            
            {/* Company Details Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Company Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name*
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address*
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter company address"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State*
                  </label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  >
                    <option value="">Select state</option>
                    <optgroup label="States">
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Ladakh">Ladakh</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                    </optgroup>
                    <optgroup label="Union Territories">
                      <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                      <option value="Chandigarh">Chandigarh</option>
                      <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                      <option value="Lakshadweep">Lakshadweep</option>
                      <option value="Puducherry">Puducherry</option>
                    </optgroup>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Do you have a GST number?*
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="hasGst"
                        value="yes"
                        checked={formData.hasGst === 'yes'}
                        onChange={(e) => handleGstChange(e.target.value)}
                        className="form-radio text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="hasGst"
                        value="no"
                        checked={formData.hasGst === 'no'}
                        onChange={(e) => handleGstChange(e.target.value)}
                        className="form-radio text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>
                
                {formData.hasGst === 'yes' && (
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700">
                      GST Number*
                    </label>
                    <input
                      type="text"
                      id="gstNumber"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter GST number"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Credit Amount Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Credit Amount</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="desiredAmount" className="block text-sm font-medium text-gray-700">
                    Desired Amount (₹)*
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      id="desiredAmount"
                      name="desiredAmount"
                      value={formData.desiredAmount}
                      onChange={handleDesiredAmountChange}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter amount"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Amount Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Amount Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Base Amount</span>
                  <span className="font-medium text-gray-900">₹{amounts.baseAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">SGST @ 9%</span>
                  <span className="font-medium text-gray-900">₹{amounts.sgst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">CGST @ 9%</span>
                  <span className="font-medium text-gray-900">₹{amounts.cgst.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-gray-900">Total Amount Payable</span>
                    <span className="text-lg font-bold text-blue-600">₹{amounts.finalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={handleCustomPurchase}
                disabled={paymentProcessing}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentProcessing ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="w-5 h-5 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </button>
            </div>
          </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoadingTransactions ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <ArrowPathIcon className="w-5 h-5 text-gray-400 animate-spin" />
                        <span className="ml-2 text-sm text-gray-500">Loading transactions...</span>
                      </div>
                    </td>
                  </tr>
                ) : transactionError ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-red-500">
                      {transactionError}
                    </td>
                  </tr>
                ) : transactionData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No transaction history found
                    </td>
                  </tr>
                ) : (
                  transactionData.map((transaction, index) => (
                    <tr
                      key={transaction.orderId}
                      className="hover:bg-gray-50 transition-colors animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.srNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{transaction.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {transactionData.length > 0 ? `Showing ${transactionData.length} transactions` : ''}
              </span>
              <button 
                onClick={fetchTransactionHistory}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <ArrowPathIcon className="w-4 h-4 mr-1" />
                Refresh
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

      {/* Payment Modal - Updated for Razorpay */}
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
                disabled={paymentProcessing}
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
                        {selectedPackage && creditPackages[selectedPackage - 1].name} Package
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedPackage && creditPackages[selectedPackage - 1].credits} credits
                      </p>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedPackage && creditPackages[selectedPackage - 1].price}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <SparklesIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        You&apos;ll be redirected to Razorpay&apos;s secure payment gateway to complete your purchase.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={paymentProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomPurchase}
                  disabled={!isRazorpayLoaded || paymentProcessing}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:opacity-90 flex items-center"
                >
                  {paymentProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>Proceed to Payment</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}