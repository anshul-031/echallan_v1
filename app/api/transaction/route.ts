import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface MockTransaction {
  id: number;
  transactionId: string;
  type: 'PURCHASE' | 'USAGE';
  credits: number;
  amount: number | null;
  status: string;
  createdAt: string;
  userId: string;
  package?: string;
  apiName?: string;
}

// Mock transaction data
const mockTransactions: MockTransaction[] = [
  {
    id: 1001,
    transactionId: 'TXN3674291',
    type: 'PURCHASE',
    credits: 500,
    amount: 500,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'user1',
    package: 'Professional'
  },
  {
    id: 1003,
    transactionId: 'TXN3674311',
    type: 'USAGE',
    credits: 3,
    amount: null,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'user1',
    apiName: 'Vehicle Lookup'
  },
  {
    id: 1004,
    transactionId: 'TXN3674321',
    type: 'USAGE',
    credits: 5,
    amount: null,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'user1',
    apiName: 'Registration Details'
  },
  {
    id: 1005,
    transactionId: 'TXN3674331',
    type: 'USAGE',
    credits: 2,
    amount: null,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'user1',
    apiName: 'Driving License Verification'
  },
  {
    id: 1006,
    transactionId: 'TXN3674341',
    type: 'PURCHASE',
    credits: 100,
    amount: 100,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'user1',
    package: 'Basic'
  },
  {
    id: 1007,
    transactionId: 'TXN3674351',
    type: 'USAGE',
    credits: 1,
    amount: null,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'user1',
    apiName: 'Chassis Number Lookup'
  }
];

// GET /api/transaction - Get transaction history
export async function GET(req: Request) {
  try {
    // Get session to verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse query parameters
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get('limit') || '10');
    const page = Number(url.searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Filter mock transactions for the current user
    // In a real implementation, this would be a database query
    const userTransactions = mockTransactions
      .filter(tx => tx.userId === session.user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(skip, skip + limit);
    
    // Count total transactions
    const totalCount = mockTransactions.filter(tx => tx.userId === session.user.id).length;
    
    return NextResponse.json({
      transactions: userTransactions,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
} 