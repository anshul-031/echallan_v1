import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getExpirationColor(date: string): string {
  const currentDate = new Date();
  const oneMonthFromNow = new Date(currentDate);
  oneMonthFromNow.setMonth(currentDate.getMonth() + 1);

  if (date === "LTT") {
    return "text-blue-500";
  }

  if (date === "Not Available") {
    return "text-red-500";
  }

  const expiryDate = new Date(date);

  if (expiryDate < currentDate) {
    return "text-red-500";
  } else if (expiryDate <= oneMonthFromNow) {
    return "text-yellow-500";
  } else {
    return "text-green-500";
  }
}
