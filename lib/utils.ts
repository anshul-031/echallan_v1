import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getExpirationColor(date: string): string {
  const currentDate = new Date('2025-03-21');
  const threeMonthsFromNow = new Date(currentDate);
  threeMonthsFromNow.setMonth(currentDate.getMonth() + 4);

  if (date === "LTT") {
    return "text-blue-500";
  }

  if (date === "Not Available") {
    return "text-red-500";
  }

  const expiryDate = new Date(date);

  if (expiryDate < currentDate) {
    return "text-red-500";
  } else if (expiryDate <= threeMonthsFromNow) {
    return "text-yellow-500";
  } else {
    return "text-green-500";
  }
}
