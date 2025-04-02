export interface Vehicle {
  id: number;
  vrn: string;
  roadTax: string;
  fitness: string;
  insurance: string;
  pollution: string;
  statePermit: string;
  nationalPermit: string;
  lastUpdated: string;
  status: string;
  ownerId: string;
  registeredAt: string;
  documents: number;
}

export interface SummaryCard {
  title: string;
  count: number;
  icon: React.ComponentType<any>;
  color: string;
}
