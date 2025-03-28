// import { PrismaClient } from '@prisma/client';

// const prismaClientSingleton = () => {
//   return new PrismaClient();
// };

// declare global {
//   var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
// }

// const prisma = globalThis.prisma ?? prismaClientSingleton();

// if (process.env.NODE_ENV !== 'production') {
//   globalThis.prisma = prisma;
// }

// export default prisma;


import { PrismaClient } from '@prisma/client';
import { getExpirationColor } from '@/lib/utils';

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

// Singleton function to create and extend PrismaClient
function getPrismaClient() {
  // Base PrismaClient instance
  const basePrisma = new PrismaClient();

  // Extend the client with hooks
  const extendedPrisma = basePrisma.$extends({
    query: {
      vehicle: {
        async create({ args, query }) {
          console.log('CREATE HOOK TRIGGERED:', JSON.stringify(args, null, 2));
          const result = await query(args);
          const ownerId = args.data.ownerId as string;
          if (ownerId) await updateVehicleStats(ownerId, extendedPrisma);
          return result;
        },
        async update({ args, query }) {
          console.log('UPDATE HOOK TRIGGERED:', JSON.stringify(args, null, 2));
          const vehicle = await basePrisma.vehicle.findUnique({ where: args.where });
          const result = await query(args);
          const ownerId = vehicle?.ownerId;
          if (ownerId) await updateVehicleStats(ownerId, extendedPrisma);
          return result;
        },
        async delete({ args, query }) {
          console.log('DELETE HOOK TRIGGERED:', JSON.stringify(args, null, 2));
          const vehicle = await basePrisma.vehicle.findUnique({ where: args.where });
          const result = await query(args);
          const ownerId = vehicle?.ownerId;
          if (ownerId) await updateVehicleStats(ownerId, extendedPrisma);
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

// Create or reuse the singleton instance
const prisma = globalThis.prisma ?? getPrismaClient();

// Set the global instance in development to avoid reinstantiation on hot reload
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Update vehicle stats function, accepting Prisma client as a parameter
async function updateVehicleStats(ownerId: string, prismaClient: typeof prisma) {
  try {
    console.log('Updating stats for ownerId:', ownerId);
    const vehicles = await prismaClient.vehicle.findMany({ where: { ownerId } });
    console.log('Vehicles found:', vehicles.length);

    const fields: (keyof VehicleStat)[] = [
      'roadTax',
      'fitness',
      'insurance',
      'pollution',
      'statePermit',
      'nationalPermit',
    ];

    const stats: { expiring: VehicleStat; expired: VehicleStat } = {
      expiring: { count: 0, roadTax: 0, fitness: 0, insurance: 0, pollution: 0, statePermit: 0, nationalPermit: 0 },
      expired: { count: 0, roadTax: 0, fitness: 0, insurance: 0, pollution: 0, statePermit: 0, nationalPermit: 0 },
    };

    vehicles.forEach((vehicle) => {
      fields.forEach((field) => {
        const date = vehicle[field as keyof typeof vehicle] as string;
        const color = getExpirationColor(date);
        if (color === 'text-yellow-500') {
          stats.expiring[field]++;
          stats.expiring.count++;
        } else if (color === 'text-red-500') {
          stats.expired[field]++;
          stats.expired.count++;
        }
      });
    });

    console.log('Calculated stats:', stats);

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
      },
    });

    console.log('UserVehicleStats updated for ownerId:', ownerId);
  } catch (error) {
    console.error('Error updating vehicle stats:', error);
  }
}

export default prisma;