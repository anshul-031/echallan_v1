import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


type Vehicle = {
  roadTax: string;
  fitness: string;
  insurance: string;
  pollution: string;
  statePermit: string;
  nationalPermit: string;
  [key: string]: any;
};

type VehicleStats = {
  total_vehicles: number;
  expiring_count: number;
  expired_count: number;
  expiring_roadTax: number;
  expiring_fitness: number;
  expiring_insurance: number;
  expiring_pollution: number;
  expiring_statePermit: number;
  expiring_nationalPermit: number;
  expired_roadTax: number;
  expired_fitness: number;
  expired_insurance: number;
  expired_pollution: number;
  expired_statePermit: number;
  expired_nationalPermit: number;
};


export function getExpirationColor(dateString: string): string {
  // Handle empty/undefined values
  if (!dateString || dateString.trim() === '') return 'text-gray-500';
  
  try {
    // Handle special cases first
    if (dateString === "30-11--0001") {
      return "text-red-500";
    }

    if (dateString === "LTT") {
      return "text-blue-500";
    }

    if (dateString === "Not Available") {
      return "text-red-500";
    }
    
    // Parse the date string (expected format: DD-MM-YYYY)
    const parts = dateString.split('-');
    if (parts.length !== 3) return 'text-gray-500';
    
    // Create date object (day-month-year)
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    const year = parseInt(parts[2], 10);
    
    const date = new Date(year, month, day);
    
    if (isNaN(date.getTime())) {
      return 'text-gray-500'; // Invalid date
    }
    
    // Get the current date and calculate one month from now
    const currentDate = new Date();
    const oneMonthFromNow = new Date(currentDate);
    oneMonthFromNow.setMonth(currentDate.getMonth() + 1);
    
    // Compare the parsed date with the current date
    if (date < currentDate) {
      return "text-red-500"; // Date is in the past (expired)
    } else if (date <= oneMonthFromNow) {
      return "text-yellow-500"; // Date is within the next month (expiring soon)
    } else {
      return "text-green-500"; // Date is more than one month in the future (valid)
    }
  } catch (error) {
    console.error('Error parsing date:', error);
    return 'text-gray-500'; // Default fallback
  }
}



// Helper function to compute vehicle stats
export function computeVehicleStats(vehicles: Vehicle[]): VehicleStats {
  const docFields = [
    "roadTax",
    "fitness",
    "insurance",
    "pollution",
    "statePermit",
    "nationalPermit",
  ];

  const stats: VehicleStats = {
    total_vehicles: vehicles.length,
    expiring_count: 0,
    expired_count: 0,
    expiring_roadTax: 0,
    expiring_fitness: 0,
    expiring_insurance: 0,
    expiring_pollution: 0,
    expiring_statePermit: 0,
    expiring_nationalPermit: 0,
    expired_roadTax: 0,
    expired_fitness: 0,
    expired_insurance: 0,
    expired_pollution: 0,
    expired_statePermit: 0,
    expired_nationalPermit: 0,
  };

  // Count expiring and expired vehicles
  vehicles.forEach((vehicle) => {
    let hasExpiring = false;
    let hasExpired = false;

    docFields.forEach((field) => {
      const color = getExpirationColor(vehicle[field]);
      if (color === "text-yellow-500") {
        stats[`expiring_${field}` as keyof VehicleStats]++;
        hasExpiring = true;
      } else if (color === "text-red-500") {
        stats[`expired_${field}` as keyof VehicleStats]++;
        hasExpired = true;
      }
    });

    if (hasExpiring) stats.expiring_count++;
    if (hasExpired) stats.expired_count++;
  });

  return stats;
}




