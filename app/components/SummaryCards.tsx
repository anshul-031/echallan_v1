'use client';

import { UserGroupIcon, DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { SummaryCard } from '../types/vehicle';

const summaryCards: SummaryCard[] = [
  {
    title: 'TOTAL VEHICLES',
    count: 213,
    color: 'bg-[#2D5DE9]',
    icon: UserGroupIcon
  },
  {
    title: 'EXPIRING DOCUMENTS',
    count: 36,
    color: 'bg-[#FFB946]',
    icon: DocumentTextIcon
  },
  {
    title: 'EXPIRED DOCUMENTS',
    count: 9,
    color: 'bg-[#F7685B]',
    icon: ExclamationTriangleIcon
  },
];

export default function SummaryCards() {
  return (
    <>
      {summaryCards.map((card) => (
        <div
          key={card.title}
          className="zoho-card group"
        >
          <div className="flex flex-col">
            <span className="zoho-text-secondary uppercase tracking-wider">{card.title}</span>
            <span className="zoho-heading-xl mt-3">{card.count}</span>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <a 
              href="#" 
              className="text-sm text-[#2D5DE9] hover:text-[#1E40AF] font-medium transition-colors"
            >
              View Details
            </a>
            <div className={`w-2 h-2 rounded-full ${card.color}`}></div>
          </div>
        </div>
      ))}
    </>
  );
}