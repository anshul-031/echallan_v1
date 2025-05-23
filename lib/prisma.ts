
import { PrismaClient } from '@prisma/client';
import { getExpirationColor, getExpirationTimeframe } from '@/lib/utils';

// Define VehicleStat type
type VehicleStat = {
  count: number;
  roadTax: number;
  fitness: number;
  insurance: number;
  pollution: number;
  statePermit: number;
  nationalPermit: number;
};

// Define the expected shape of a Vehicle (for type safety)
type Vehicle = {
  roadTax: string;
  fitness: string;
  insurance: string;
  pollution: string;
  statePermit: string;
  nationalPermit: string;
  ownerId: string;
  [key: string]: any; // Allow additional fields
};

// Singleton function to create and extend PrismaClient
function getPrismaClient() {
  const basePrisma = new PrismaClient();

  const extendedPrisma = basePrisma.$extends({
    query: {
      vehicle: {
        async create({ args, query }) {
          console.log('VEHICLE CREATE HOOK TRIGGERED:', JSON.stringify(args, null, 2));
          const result = await query(args);
          const ownerId = args.data.ownerId as string;
          if (ownerId) await updateVehicleStats(ownerId, extendedPrisma);
          else console.warn('No ownerId provided for vehicle creation, skipping vehicle stats update');
          return result;
        },
        async update({ args, query }) {
          console.log('VEHICLE UPDATE HOOK TRIGGERED:', JSON.stringify(args, null, 2));
          const vehicle = await basePrisma.vehicle.findUnique({ where: args.where });
          const result = await query(args);
          const ownerId = vehicle?.ownerId;
          if (ownerId) await updateVehicleStats(ownerId, extendedPrisma);
          else console.warn('No ownerId found for vehicle update, skipping vehicle stats update');
          return result;
        },
        async delete({ args, query }) {
          console.log('VEHICLE DELETE HOOK TRIGGERED:', JSON.stringify(args, null, 2));
          const vehicle = await basePrisma.vehicle.findUnique({ where: args.where });
          const result = await query(args);
          const ownerId = vehicle?.ownerId;
          if (ownerId) await updateVehicleStats(ownerId, extendedPrisma);
          else console.warn('No ownerId found for vehicle deletion, skipping vehicle stats update');
          return result;
        },
      },
      renewalService: {
        async create({ args, query }) {
          console.log('RENEWAL SERVICE CREATE HOOK TRIGGERED:', JSON.stringify(args, null, 2));
          const result = await query(args);
          const userId = args.data.userId as string;
          if (userId) {
            console.log('Creating RenewalStats for userId:', userId);
            await updateRenewalStats(userId, extendedPrisma);
          } else {
            console.warn('No userId provided for RenewalService creation, skipping RenewalStats update');
          }
          return result;
        },
        async update({ args, query }) {
          console.log('RENEWAL SERVICE UPDATE HOOK TRIGGERED:', JSON.stringify(args, null, 2));
          const renewalService = await basePrisma.renewalService.findUnique({ where: args.where });
          const result = await query(args);
          const userId = renewalService?.userId;
          if (userId) {
            console.log('Updating RenewalStats for userId:', userId);
            await updateRenewalStats(userId, extendedPrisma);
          } else {
            console.warn('No userId found for RenewalService update, skipping RenewalStats update');
          }
          return result;
        },
        async delete({ args, query }) {
          console.log('RENEWAL SERVICE DELETE HOOK TRIGGERED:', JSON.stringify(args, null, 2));
          const renewalService = await basePrisma.renewalService.findUnique({ where: args.where });
          const result = await query(args);
          const userId = renewalService?.userId;
          if (userId) {
            console.log('Deleting RenewalStats for userId:', userId);
            await updateRenewalStats(userId, extendedPrisma);
          } else {
            console.warn('No userId found for RenewalService deletion, skipping RenewalStats update');
          }
          return result;
        },
      },
    },
  });

  return extendedPrisma;
}

// Use globalThis to store the singleton instance
declare global {
  var prisma: ReturnType<typeof getPrismaClient> | undefined;
}

const prisma = globalThis.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

async function updateVehicleStats(ownerId: string, prismaClient: ReturnType<typeof getPrismaClient>) {
  try {
    console.log('Updating stats for ownerId:', ownerId);
    const vehicles = await prismaClient.vehicle.findMany({ where: { ownerId } }) as Vehicle[];
    console.log('Vehicles found:', vehicles.length);

    const fields: (keyof VehicleStat)[] = [
      'roadTax',
      'fitness',
      'insurance',
      'pollution',
      'statePermit',
      'nationalPermit',
    ];

    // Initialize stats for all timeframes
    const stats = {
      expiring: { count: 0, roadTax: 0, fitness: 0, insurance: 0, pollution: 0, statePermit: 0, nationalPermit: 0 },
      expired: { count: 0, roadTax: 0, fitness: 0, insurance: 0, pollution: 0, statePermit: 0, nationalPermit: 0 },
      expiring_3m: { count: 0, roadTax: 0, fitness: 0, insurance: 0, pollution: 0, statePermit: 0, nationalPermit: 0 },
      expiring_6m: { count: 0, roadTax: 0, fitness: 0, insurance: 0, pollution: 0, statePermit: 0, nationalPermit: 0 },
      expiring_1y: { count: 0, roadTax: 0, fitness: 0, insurance: 0, pollution: 0, statePermit: 0, nationalPermit: 0 },
    };

    vehicles.forEach((vehicle) => {
      fields.forEach((field) => {
        const date = vehicle[field] as string;
        const color = getExpirationColor(date);
        if (color === 'text-yellow-500') {
          stats.expiring[field]++;
          stats.expiring.count++;
        } else if (color === 'text-red-500') {
          stats.expired[field]++;
          stats.expired.count++;
        }

        const { timeframe } = getExpirationTimeframe(date);
        if (timeframe === 'expiring_3m') {
          stats.expiring_3m[field]++;
          stats.expiring_3m.count++;
        } else if (timeframe === 'expiring_6m') {
          stats.expiring_6m[field]++;
          stats.expiring_6m.count++;
        } else if (timeframe === 'expiring_1y') {
          stats.expiring_1y[field]++;
          stats.expiring_1y.count++;
        }
      });
    });

    console.log('Calculated vehicle stats:', stats);

    await prismaClient.userVehicleStats.upsert({
      where: { userId: ownerId },
      update: {
        total_vehicles: vehicles.length,
        expiring_count: stats.expiring.count,
        expired_count: stats.expired.count,
        expiring_roadTax: stats.expiring.roadTax,
        expiring_fitness: stats.expiring.fitness,
        expiring_insurance: stats.expiring.insurance,
        expiring_pollution: stats.expiring.pollution,
        expiring_statePermit: stats.expiring.statePermit,
        expiring_nationalPermit: stats.expiring.nationalPermit,
        expired_roadTax: stats.expired.roadTax,
        expired_fitness: stats.expired.fitness,
        expired_insurance: stats.expired.insurance,
        expired_pollution: stats.expired.pollution,
        expired_statePermit: stats.expired.statePermit,
        expired_nationalPermit: stats.expired.nationalPermit,
        expiring_3m_count: stats.expiring_3m.count,
        expiring_3m_roadTax: stats.expiring_3m.roadTax,
        expiring_3m_fitness: stats.expiring_3m.fitness,
        expiring_3m_insurance: stats.expiring_3m.insurance,
        expiring_3m_pollution: stats.expiring_3m.pollution,
        expiring_3m_statePermit: stats.expiring_3m.statePermit,
        expiring_3m_nationalPermit: stats.expiring_3m.nationalPermit,
        expiring_6m_count: stats.expiring_6m.count,
        expiring_6m_roadTax: stats.expiring_6m.roadTax,
        expiring_6m_fitness: stats.expiring_6m.fitness,
        expiring_6m_insurance: stats.expiring_6m.insurance,
        expiring_6m_pollution: stats.expiring_6m.pollution,
        expiring_6m_statePermit: stats.expiring_6m.statePermit,
        expiring_6m_nationalPermit: stats.expiring_6m.nationalPermit,
        expiring_1y_count: stats.expiring_1y.count,
        expiring_1y_roadTax: stats.expiring_1y.roadTax,
        expiring_1y_fitness: stats.expiring_1y.fitness,
        expiring_1y_insurance: stats.expiring_1y.insurance,
        expiring_1y_pollution: stats.expiring_1y.pollution,
        expiring_1y_statePermit: stats.expiring_1y.statePermit,
        expiring_1y_nationalPermit: stats.expiring_1y.nationalPermit,
      },
      create: {
        userId: ownerId,
        total_vehicles: vehicles.length,
        expiring_count: stats.expiring.count,
        expired_count: stats.expired.count,
        expiring_roadTax: stats.expiring.roadTax,
        expiring_fitness: stats.expiring.fitness,
        expiring_insurance: stats.expiring.insurance,
        expiring_pollution: stats.expiring.pollution,
        expiring_statePermit: stats.expiring.statePermit,
        expiring_nationalPermit: stats.expiring.nationalPermit,
        expired_roadTax: stats.expired.roadTax,
        expired_fitness: stats.expired.fitness,
        expired_insurance: stats.expired.insurance,
        expired_pollution: stats.expired.pollution,
        expired_statePermit: stats.expired.statePermit,
        expired_nationalPermit: stats.expired.nationalPermit,
        expiring_3m_count: stats.expiring_3m.count,
        expiring_3m_roadTax: stats.expiring_3m.roadTax,
        expiring_3m_fitness: stats.expiring_3m.fitness,
        expiring_3m_insurance: stats.expiring_3m.insurance,
        expiring_3m_pollution: stats.expiring_3m.pollution,
        expiring_3m_statePermit: stats.expiring_3m.statePermit,
        expiring_3m_nationalPermit: stats.expiring_3m.nationalPermit,
        expiring_6m_count: stats.expiring_6m.count,
        expiring_6m_roadTax: stats.expiring_6m.roadTax,
        expiring_6m_fitness: stats.expiring_6m.fitness,
        expiring_6m_insurance: stats.expiring_6m.insurance,
        expiring_6m_pollution: stats.expiring_6m.pollution,
        expiring_6m_statePermit: stats.expiring_6m.statePermit,
        expiring_6m_nationalPermit: stats.expiring_6m.nationalPermit,
        expiring_1y_count: stats.expiring_1y.count,
        expiring_1y_roadTax: stats.expiring_1y.roadTax,
        expiring_1y_fitness: stats.expiring_1y.fitness,
        expiring_1y_insurance: stats.expiring_1y.insurance,
        expiring_1y_pollution: stats.expiring_1y.pollution,
        expiring_1y_statePermit: stats.expiring_1y.statePermit,
        expiring_1y_nationalPermit: stats.expiring_1y.nationalPermit,
      },
    });

    console.log('UserVehicleStats updated for ownerId:', ownerId);
  } catch (error) {
    console.error('Error updating vehicle stats:', error);
  }
}


async function updateRenewalStats(userId: string, prismaClient: ReturnType<typeof getPrismaClient>) {
  try {
    console.log('Updating renewal stats for userId:', userId);

    // Verify the user exists
    const user = await prismaClient.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.error(`User with userId ${userId} not found, cannot update RenewalStats`);
      return;
    }
    console.log('User found:', JSON.stringify(user, null, 2));

    const renewalServices = await prismaClient.renewalService.findMany({ where: { userId } });
    console.log('Renewal services found:', renewalServices.length);
    console.log('Renewal services data:', JSON.stringify(renewalServices, null, 2));

    // Calculate counts for each status
    const totalServices = renewalServices.filter((service) => service.status !== 'not_assigned').length;
    const pendingCount = renewalServices.filter((service) => service.status === 'pending').length;
    const processingCount = renewalServices.filter((service) => service.status === 'processing').length;
    const completedCount = renewalServices.filter((service) => service.status === 'completed').length;
    const cancelledCount = renewalServices.filter((service) => service.status === 'cancelled').length;

    console.log('Calculated renewal stats:', {
      totalServices,
      pendingCount,
      processingCount,
      completedCount,
      cancelledCount,
    });

    // Update or create RenewalStats
    const renewalStats = await prismaClient.renewalStats.upsert({
      where: { userId },
      update: {
        totalServices,
        pendingCount,
        processingCount,
        completedCount,
        cancelledCount,
      },
      create: {
        userId,
        totalServices,
        pendingCount,
        processingCount,
        completedCount,
        cancelledCount,
      },
    });

    console.log('RenewalStats updated for userId:', userId, 'Result:', JSON.stringify(renewalStats, null, 2));
  } catch (error) {
    console.error('Error updating renewal stats:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error; // Re-throw the error to make it visible in the API response
  }
}

export default prisma;