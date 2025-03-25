import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}





export function getExpirationColor(date: string): string {
  // Get the current date and calculate one month from now
  const currentDate = new Date();
  const oneMonthFromNow = new Date(currentDate);
  oneMonthFromNow.setMonth(currentDate.getMonth() + 1);

  // Handle special cases
  if (date === "30-11--0001") {
    return "text-red-500";
  }

  if (date === "LTT") {
    return "text-blue-500";
  }

  if (date === "Not Available") {
    return "text-red-500";
  }

  // Validate the date string format (DD-MM-YYYY, e.g., "31-03-2025")
  const dateFormatRegex = /^\d{2}-\d{2}-\d{4}$/;
  if (!dateFormatRegex.test(date)) {
    return "text-red-500"; // Return red if the format is invalid
  }

  // Split the date string into day, month, and year
  const [day, month, year] = date.split("-").map(Number);

  // Validate the ranges of day, month, and year
  if (
    day < 1 || day > 31 ||
    month < 1 || month > 12 ||
    year < 1900 || year > 9999
  ) {
    return "text-red-500"; // Return red if the values are out of range
  }

  // Create a Date object (subtract 1 from month because JavaScript months are 0-based)
  const expiryDate = new Date(year, month - 1, day);

  // Validate the Date object
  // Check if the Date is valid and matches the input values (to catch invalid dates like "31-04-2025")
  if (
    isNaN(expiryDate.getTime()) || // Check if the Date is invalid
    expiryDate.getDate() !== day || // Verify the day matches
    expiryDate.getMonth() + 1 !== month || // Verify the month matches
    expiryDate.getFullYear() !== year // Verify the year matches
  ) {
    return "text-red-500"; // Return red if the date is invalid (e.g., "31-04-2025" rolls over to May 1)
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