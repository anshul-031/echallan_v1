interface RenewalService {
  services: string;
}

export interface Vehicle {
  id: number;
  vrn: string;
  roadTax: string;
  roadTaxDoc: string | null;
  fitness: string;
  fitnessDoc: string | null;
  insurance: string;
  insuranceDoc: string | null;
  pollution: string;
  pollutionDoc: string | null;
  statePermit: string;
  statePermitDoc: string | null;
  nationalPermit: string;
  nationalPermitDoc: string | null;
  lastUpdated: string;
  status: string;
  ownerId: string;
  registeredAt: string;
  documents: number;
  renewalServices?: RenewalService[];
  renewalService?: RenewalService[];
}

export interface SummaryCard {
  title: string;
  count: number;
  icon: React.ComponentType<any>;
  color: string;
}
