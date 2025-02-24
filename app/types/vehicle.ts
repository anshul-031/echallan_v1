export interface Vehicle {
  id: number;
  vrn: string;
  roadTaxExpiry: string;
  fitnessExpiry: string;
  insuranceValidity: string;
  pollutionExpiry: string;
  permitExpiry: string;
  nationalPermitExpiry: string;
  lastUpdated: string;
  chassisNumber?: string;
  engineNumber?: string;
  financerName?: string;
  insuranceCompany?: string;
  blacklistStatus?: boolean;
  rtoLocation?: string;
}

export interface SummaryCard {
  title: string;
  count: number;
  icon: React.ComponentType<any>;
  color: string;
}