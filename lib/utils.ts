import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getExpirationColor(date: string | null | undefined): string {
  // Get the current date and calculate one month from now
  const currentDate = new Date();
  const oneMonthFromNow = new Date(currentDate);
  oneMonthFromNow.setMonth(currentDate.getMonth() + 1);

  // Handle special cases
  if (!date || date === "30-11--0001") {
    return "text-red-500";
  }

  if (date === "LTT") {
    return "text-blue-500";
  }

  if (date === "Not Available") {
    return "text-red-500";
  }

  // Ensure date is a valid string and split produces 3 parts
  const parts = date.split("-");
  
  const [day, month, year] = parts.map(Number);

  
  

  const expiryDate = new Date(year, month - 1, day);
// Compare the parsed date with the current date
  if (expiryDate < currentDate) {
    return "text-red-500"; // Date is in the past (expired)
  } else if (expiryDate <= oneMonthFromNow) {
    return "text-yellow-500"; // Date is within the next month (expiring soon)
  } else {
    return "text-green-500"; // Date is more than one month in the future (valid)
  }
}