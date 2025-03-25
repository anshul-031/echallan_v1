'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CodeBracketIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  BellAlertIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CloudArrowUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { utils as xlsxUtils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

const insightCards = [
  {
    title: 'Total Distance',
    value: '24,589 km',
    change: '+12%',
    isIncrease: true,
    icon: ChartBarIcon,
    color: 'blue',
    trend: [35, 45, 55, 65, 75, 85, 95]
  },
  {
    title: 'Average Speed',
    value: '45 km/h',
    change: '-3%',
    isIncrease: false,
    icon: ArrowTrendingUpIcon,
    color: 'green',
    trend: [65, 55, 65, 45, 55, 45, 40]
  },
  {
    title: 'Active Hours',
    value: '186 hrs',
    change: '+8%',
    isIncrease: true,
    icon: ClockIcon,
    color: 'purple',
    trend: [25, 35, 45, 55, 45, 65, 55]
  },
  {
    title: 'Fuel Efficiency',
    value: '8.2 km/l',
    change: '+5%',
    isIncrease: true,
    icon: ArrowTrendingDownIcon,
    color: 'orange',
    trend: [45, 55, 45, 65, 55, 75, 65]
  }
];

const apiUsageData = [
  {
    id: 1,
    api: 'Vehicle Registration Lookup',
    rate: '₹10/request',
    tasksCompleted: 145,
    creditsConsumed: 1450,
    trend: '+12%',
    isPositive: true
  },
  {
    id: 2,
    api: 'Challan Status Check',
    rate: '₹5/request',
    tasksCompleted: 278,
    creditsConsumed: 1390,
    trend: '+8%',
    isPositive: true
  },
  {
    id: 3,
    api: 'Document Verification',
    rate: '₹15/request',
    tasksCompleted: 92,
    creditsConsumed: 1380,
    trend: '-3%',
    isPositive: false
  },
  {
    id: 4,
    api: 'Insurance Validation',
    rate: '₹8/request',
    tasksCompleted: 156,
    creditsConsumed: 1248,
    trend: '+5%',
    isPositive: true
  },
  {
    id: 5,
    api: 'Bulk Vehicle Lookup',
    rate: '₹8/request',
    tasksCompleted: 210,
    creditsConsumed: 1680,
    trend: '+15%',
    isPositive: true
  }
];

export default function InsightsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [animatedValues, setAnimatedValues] = useState<number[]>([0, 0, 0, 0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Calculate pagination
  const filteredData = apiUsageData.filter(item => 
    item.api.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort data if sortField is set
  const sortedData = sortField 
    ? [...filteredData].sort((a, b) => {
        // @ts-ignore - dynamic access
        const aValue = a[sortField] || '';
        // @ts-ignore - dynamic access
        const bValue = b[sortField] || '';
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      })
    : filteredData;
  
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Animate numbers on load
  useEffect(() => {
    insightCards.forEach((card, index) => {
      const targetValue = parseInt(card.value.replace(/[^0-9]/g, ''));
      let startValue = 0;
      const duration = 1500; // ms
      const frameDuration = 1000 / 60; // 60fps
      const totalFrames = Math.round(duration / frameDuration);
      let frame = 0;

      const timer = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const currentValue = Math.round(startValue + progress * (targetValue - startValue));
        
        setAnimatedValues(prev => {
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
      const colors = ['rgba(59, 130, 246, 0.2)', 'rgba(99, 102, 241, 0.2)', 'rgba(168, 85, 247, 0.2)'];

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

  // Render mini chart for cards
  const renderMiniChart = (data: number[], color: string) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    return (
      <div className="flex items-end h-12 gap-1">
        {data.map((value, i) => {
          const height = ((value - min) / range) * 100;
          return (
            <div
              key={i}
              style={{ height: `${height}%` }}
              className={`w-1 rounded-t-sm bg-${color}-500 opacity-50 transition-all duration-300
                ${hoveredCard !== null ? 'hover:opacity-100' : ''}`}
            />
          );
        })}
      </div>
    );
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv' | 'json') => {
    try {
      setIsExporting(true);
      
      // Prepare the data for export - example usage data based on insights
      const exportData = [
        {
          title: 'Total Distance',
          value: '185,253 km',
          change: '+12.5%',
          period: selectedPeriod
        },
        {
          title: 'Average Speed',
          value: '42 km/h',
          change: '-2.3%',
          period: selectedPeriod
        },
        {
          title: 'Active Hours',
          value: '1,253 hrs',
          change: '+8.7%',
          period: selectedPeriod
        },
        {
          title: 'Fuel Efficiency',
          value: '7.8 km/l',
          change: '+3.1%',
          period: selectedPeriod
        }
      ];

      if (format === 'excel') {
        const worksheet = xlsxUtils.json_to_sheet(exportData);
        const workbook = xlsxUtils.book_new();
        xlsxUtils.book_append_sheet(workbook, worksheet, 'Insights Data');
        writeFile(workbook, 'insights-data.xlsx');
        toast.success('Data exported to Excel');
      } else if (format === 'csv') {
        const worksheet = xlsxUtils.json_to_sheet(exportData);
        const csv = xlsxUtils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'insights-data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Data exported to CSV');
      } else if (format === 'json') {
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'insights-data.json');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Data exported to JSON');
      } else if (format === 'pdf') {
        const doc = new jsPDF();
        autoTable(doc, {
          head: [Object.keys(exportData[0])],
          body: exportData.map((row) => Object.values(row)),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [249, 250, 251], textColor: [0, 0, 0], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          margin: { top: 20 },
        });
        doc.save('insights-data.pdf');
        toast.success('Data exported to PDF');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
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
            <h1 className="text-2xl font-semibold text-white mb-2">Usage Insights Dashboard</h1>
            <p className="text-blue-100 max-w-2xl">Analyze your fleet performance metrics and API usage with detailed analytics and visualizations.</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search API..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center space-x-2 hover:bg-gray-50">
              <FunnelIcon className="w-5 h-5 text-gray-500" />
              <span>Filter</span>
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  disabled={isExporting}
                >
                  <CloudArrowUpIcon className="w-5 h-5" />
                  <span>Export</span>
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insightCards.map((card, index) => (
            <div
              key={card.title}
              className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer
                transform hover:scale-[1.02] hover:-translate-y-1`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setExpandedCard(expandedCard === index ? null : index)}
            >
              {/* Animated Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r from-${card.color}-500/10 to-${card.color}-600/10 opacity-50 
                transition-opacity duration-300 animate-gradient
                ${hoveredCard === index ? 'opacity-80' : ''}`}
              />
              
              {/* Card Content */}
              <div className={`relative bg-white border border-${card.color}-100 p-6 h-full
                transition-all duration-300
                ${hoveredCard === index ? `shadow-lg shadow-${card.color}-500/20` : 'shadow-sm'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className={`p-3 rounded-lg bg-${card.color}-50 flex items-center justify-center
                        transition-all duration-300 ${hoveredCard === index ? `bg-${card.color}-100` : ''}`}>
                        <card.icon className={`w-6 h-6 text-${card.color}-500`} />
                      </div>
                      <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                    </div>
                    <div className="flex items-baseline mt-2">
                      <p className="text-2xl font-semibold">
                        {card.title === 'Total Distance' ? `${animatedValues[index].toLocaleString()} km` : 
                         card.title === 'Average Speed' ? `${animatedValues[index]} km/h` :
                         card.title === 'Active Hours' ? `${animatedValues[index]} hrs` :
                         `${animatedValues[index] / 10} km/l`}
                      </p>
                      <span className={`ml-2 text-xs font-medium ${card.isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                        {card.change}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Mini Chart */}
                <div className={`mt-4 transition-all duration-300
                  ${expandedCard === index ? 'opacity-0 h-0' : 'opacity-100'}`}>
                  {renderMiniChart(card.trend, card.color)}
                </div>
                
                {/* Expandable Content */}
                <div className={`space-y-3 transition-all duration-300 ease-in-out
                  ${expandedCard === index ? 'opacity-100 max-h-48 mt-4' : 'opacity-0 max-h-0'}`}
                >
                  <div className="pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-xs text-gray-500">Daily Avg</span>
                        <p className="text-sm font-medium mt-1">
                          {card.title === 'Total Distance' ? '823 km' : 
                           card.title === 'Average Speed' ? '42 km/h' :
                           card.title === 'Active Hours' ? '6.2 hrs' :
                           '7.9 km/l'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-xs text-gray-500">Weekly Avg</span>
                        <p className="text-sm font-medium mt-1">
                          {card.title === 'Total Distance' ? '5,761 km' : 
                           card.title === 'Average Speed' ? '44 km/h' :
                           card.title === 'Active Hours' ? '43.4 hrs' :
                           '8.1 km/l'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-xs text-gray-500">Monthly High</span>
                        <p className="text-sm font-medium mt-1">
                          {card.title === 'Total Distance' ? '1,245 km' : 
                           card.title === 'Average Speed' ? '68 km/h' :
                           card.title === 'Active Hours' ? '12.5 hrs' :
                           '9.3 km/l'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-xs text-gray-500">Monthly Low</span>
                        <p className="text-sm font-medium mt-1">
                          {card.title === 'Total Distance' ? '456 km' : 
                           card.title === 'Average Speed' ? '32 km/h' :
                           card.title === 'Active Hours' ? '3.2 hrs' :
                           '6.8 km/l'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Indicator */}
                <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full transition-all duration-300
                  bg-${card.color}-500
                  ${hoveredCard === index ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* API Usage Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">API Usage Tracking</h2>
            <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('id')}>
                      S. No.
                      <svg className={`ml-1 w-4 h-4 ${sortField === 'id' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortField === 'id' && sortDirection === 'desc' ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('api')}>
                      API
                      <svg className={`ml-1 w-4 h-4 ${sortField === 'api' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortField === 'api' && sortDirection === 'desc' ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('rate')}>
                      Rate
                      <svg className={`ml-1 w-4 h-4 ${sortField === 'rate' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortField === 'rate' && sortDirection === 'desc' ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('tasksCompleted')}>
                      Tasks Completed
                      <svg className={`ml-1 w-4 h-4 ${sortField === 'tasksCompleted' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortField === 'tasksCompleted' && sortDirection === 'desc' ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('creditsConsumed')}>
                      Credits Consumed
                      <svg className={`ml-1 w-4 h-4 ${sortField === 'creditsConsumed' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortField === 'creditsConsumed' && sortDirection === 'desc' ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('trend')}>
                      Trend
                      <svg className={`ml-1 w-4 h-4 ${sortField === 'trend' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortField === 'trend' && sortDirection === 'desc' ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
                      </svg>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-gray-50 transition-colors duration-150 animate-fadeIn"
                    style={{ animationDelay: `${item.id * 0.1}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-indigo-50">
                          <CodeBracketIcon className="h-6 w-6 text-indigo-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.api}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <CurrencyRupeeIcon className="h-4 w-4 text-gray-500 mr-1" />
                        {item.rate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.tasksCompleted.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{item.creditsConsumed.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.isPositive ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          item.isPositive ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {item.trend}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No API usage data found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="p-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-white bg-blue-600 rounded">
                {currentPage}
              </span>
              <button 
                className="p-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Placeholder for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-4 min-h-[400px]">
            <h3 className="text-lg font-medium mb-4">Vehicle Usage Trends</h3>
            <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg">
              <div className="text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Chart visualization will be displayed here</p>
                <p className="text-sm text-gray-400 mt-1">Data is being processed for the selected period</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 min-h-[400px]">
            <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
            <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg">
              <div className="text-center">
                <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Chart visualization will be displayed here</p>
                <p className="text-sm text-gray-400 mt-1">Data is being processed for the selected period</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}