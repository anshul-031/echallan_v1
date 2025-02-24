export interface Violation {
  id: number;
  vehicleNo: string;
  violation: string;
  location: string;
  date: string;
  fine: number;
  status: 'Pending' | 'Paid';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SummaryItem {
  title: string;
  count: number | string;
  change: string;
  isIncrease: boolean;
  color: string;
}