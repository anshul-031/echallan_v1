'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  ArrowRightIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentTextIcon,
  TruckIcon,
  CogIcon,
  UserGroupIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Real-time Tracking',
    description: 'Monitor your fleet vehicles in real-time with advanced GPS tracking and status updates.',
    icon: ChartBarIcon,
    color: 'blue'
  },
  {
    name: 'Document Management',
    description: 'Efficiently manage vehicle documents, renewals, and compliance requirements.',
    icon: DocumentTextIcon,
    color: 'green'
  },
  {
    name: 'Instant Notifications',
    description: 'Get instant alerts for violations, document expiry, and important updates.',
    icon: ClockIcon,
    color: 'purple'
  },
  {
    name: 'Secure Platform',
    description: 'Enterprise-grade security ensuring your data is protected at all times.',
    icon: ShieldCheckIcon,
    color: 'orange'
  }
];

const stats = [
  { id: 1, name: 'Active Fleets', value: '500+' },
  { id: 2, name: 'Vehicles Tracked', value: '10,000+' },
  { id: 3, name: 'Cities Covered', value: '50+' },
  { id: 4, name: 'Customer Satisfaction', value: '99%' }
];

const testimonials = [
  {
    content: "This platform has revolutionized how we manage our fleet. The real-time tracking and document management features are invaluable.",
    author: "Sarah Johnson",
    role: "Fleet Manager",
    company: "Logistics Pro"
  },
  {
    content: "The automated alerts and compliance tracking have saved us countless hours and helped us avoid penalties.",
    author: "Michael Chen",
    role: "Operations Director",
    company: "TransCargo Ltd"
  }
];

export default function LandingPage() {
  const controls = useAnimation();
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TruckIcon className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                FleetManager
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/login"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 transform -translate-x-1/2">
            <svg width="800" height="800" viewBox="0 0 800 800" className="opacity-10">
              <defs>
                <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-7xl mx-auto"
        >
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
              Transform Your Fleet Management with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2">
                Intelligence and Precision
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
              Streamline your fleet operations with our comprehensive management platform. 
              Track vehicles, manage documents, and ensure compliance all in one place.
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/auth/signup"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center group"
                >
                  Start Free Trial
                  <ArrowRightIcon className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="#features"
                  className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Learn More
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-blue-100">{stat.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need to manage your fleet
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Powerful features to help you take control of your fleet operations
            </p>
          </motion.div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-${feature.color}-100 rounded-lg transform rotate-6 transition-transform group-hover:rotate-4`} />
                  <div className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-100 transform transition-transform group-hover:-translate-y-1">
                    <div className={`w-12 h-12 rounded-lg bg-${feature.color}-100 flex items-center justify-center mb-4`}>
                      <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.name}
                    </h3>
                    <p className="text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-gray-50 p-6 rounded-xl shadow-sm"
              >
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
                <div className="mt-4">
                  <p className="font-medium text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  Ready to get started?
                  <span className="block text-blue-200 mt-1">
                    Start your free trial today.
                  </span>
                </h2>
              </div>
              <div className="mt-8 lg:mt-0 lg:ml-8">
                <div className="flex space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/auth/signup"
                      className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center group"
                    >
                      Get Started
                      <ArrowRightIcon className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/auth/login"
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                      Contact Sales
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Features</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Pricing</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-gray-500 hover:text-gray-900">About</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Support</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Contact</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Privacy</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Terms</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 text-center">
            <p className="text-gray-500">© 2024 FleetManager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}