export function isDocumentExpiring(date: string): boolean {
  const currentDate = new Date('2025-03-21');
  const threeMonthsFromNow = new Date(currentDate);
  threeMonthsFromNow.setMonth(currentDate.getMonth() + 4);
  if (date === "LTT" || date === "Not Available") {
    return false;
  }
  const expiryDate = new Date(date);
  return expiryDate >= currentDate && expiryDate <= threeMonthsFromNow;
}

export function isDocumentExpired(date: string): boolean {
   const currentDate = new Date('2025-03-21');
    if (date === "LTT" || date === "Not Available") {
      return false;
    }
    const expiryDate = new Date(date);
    return expiryDate < currentDate;
}
