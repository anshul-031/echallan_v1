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


export function getExpirationColor(date: string): string {
  if (!date) return "";

  // Get the current date and calculate one month from now
  const currentDate = new Date();
  const oneMonthFromNow = new Date(currentDate);
  oneMonthFromNow.setMonth(currentDate.getMonth() + 1);

  // Handle special cases
  if (date === "30-11--0001" || date === "Not Available") {
    return "text-red-500";
  }

  if (date === "LTT") {
    return "text-blue-500";
  }

  // Map month abbreviations to numbers (0-based for Date)
  const monthMap: { [key: string]: number } = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  // Split the date string
  const parts = date.split("-");
  if (parts.length !== 3) return "text-red-500"; // Invalid format

  let day: number, month: number, year: number;

  // Check if the month is numeric or an abbreviation
  if (isNaN(Number(parts[1]))) {
    // Format: "DD-MMM-YYYY" (e.g., "01-Jan-2025")
    day = Number(parts[0]);
    month = monthMap[parts[1].toLowerCase()];
    year = Number(parts[2]);
  } else {
    // Format: "DD-MM-YYYY" (e.g., "01-01-2025")
    [day, month, year] = parts.map(Number);
    month -= 1; // Adjust for 0-based month in Date
  }

  // Validate parsed values
  if (isNaN(day) || month === undefined || isNaN(year)) {
    return "text-red-500"; // Invalid date components
  }

  const expiryDate = new Date(year, month, day);

  // Debugging for specific case
  if (date === "15-Jan-2025") {
    console.log("expiryDate", expiryDate); // Should log valid Date object
    console.log("currentDate", currentDate);
  }

  // Check if expiryDate is invalid
  if (isNaN(expiryDate.getTime())) {
    return "text-red-500"; // Invalid Date
  }

  // Compare the parsed date with the current date
  if (expiryDate < currentDate) {
    return "text-red-500"; // Date is in the past (expired)
  } else if (expiryDate <= oneMonthFromNow) {
    return "text-yellow-500"; // Date is within the next month (expiring soon)
  } else {
    return "text-green-500"; // Date is more than one month in the future (valid)
  }
}









