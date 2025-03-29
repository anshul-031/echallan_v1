


// import { PrismaClient } from '@prisma/client';
// import { getExpirationColor } from '@/lib/utils';

// // Define VehicleStat type
// type VehicleStat = {
//   count: number;
//   roadTax: number;
//   fitness: number;
//   insurance: number;
//   pollution: number;
//   statePermit: number;
//   nationalPermit: number;
// };

// // Singleton function to create and extend PrismaClient
// function getPrismaClient() {
//   // Base PrismaClient instance
//   const basePrisma = new PrismaClient();

//   // Extend the client with hooks
//   const extendedPrisma = basePrisma.$extends({
//     query: {
//       vehicle: {
//         async create({ args, query }) {
//           console.log('CREATE HOOK TRIGGERED:', JSON.stringify(args, null, 2));
//           const result = await query(args);
//           const ownerId = args.data.ownerId as string;
//           if (ownerId) await updateVehicleStats(ownerId, extendedPrisma);
//           return result;
//         },
//         async update({ args, query }) {
//           console.log('UPDATE HOOK TRIGGERED:', JSON.stringify(args, null, 2));
//           const vehicle = await basePrisma.vehicle.findUnique({ where: args.where });
//           const result = await query(args);
//           const ownerId = vehicle?.ownerId;
//           if (ownerId) await updateVehicleStats(ownerId, extendedPrisma);
//           return result;
//         },
//         async delete({ args, query }) {
//           console.log('DELETE HOOK TRIGGERED:', JSON.stringify(args, null, 2));
//           const vehicle = await basePrisma.vehicle.findUnique({ where: args.where });
//           const result = await query(args);
//           const ownerId = vehicle?.ownerId;
//           if (ownerId) await updateVehicleStats(ownerId, extendedPrisma);
//           return result;
//         },
//       },
//     },
//   });

//   return extendedPrisma;
// }

// // Use globalThis to store the singleton instance
// declare global {
//   var prisma: ReturnType<typeof getPrismaClient> | undefined;
// }

// // Create or reuse the singleton instance
// const prisma = globalThis.prisma ?? getPrismaClient();

// // Set the global instance in development to avoid reinstantiation on hot reload
// if (process.env.NODE_ENV !== 'production') {
//   globalThis.prisma = prisma;
// }

// // Update vehicle stats function, accepting Prisma client as a parameter
// async function updateVehicleStats(ownerId: string, prismaClient: typeof prisma) {
//   try {
//     console.log('Updating stats for ownerId:', ownerId);
//     const vehicles = await prismaClient.vehicle.findMany({ where: { ownerId } });
//     console.log('Vehicles found:', vehicles.length);

//     const fields: (keyof VehicleStat)[] = [
//       'roadTax',
//       'fitness',
//       'insurance',
//       'pollution',
//       'statePermit',
//       'nationalPermit',
//     ];

//     const stats: { expiring: VehicleStat; expired: VehicleStat } = {
//       expiring: { count: 0, roadTax: 0, fitness: 0, insurance: 0, pollution: 0, statePermit: 0, nationalPermit: 0 },
//       expired: { count: 0, roadTax: 0, fitness: 0, insurance: 0, pollution: 0, statePermit: 0, nationalPermit: 0 },
//     };

//     vehicles.forEach((vehicle) => {
//       fields.forEach((field) => {
//         const date = vehicle[field as keyof typeof vehicle] as string;
//         const color = getExpirationColor(date);
//         if (color === 'text-yellow-500') {
//           stats.expiring[field]++;
//           stats.expiring.count++;
//         } else if (color === 'text-red-500') {
//           stats.expired[field]++;
//           stats.expired.count++;
//         }
//       });
//     });

   


//     console.log('Calculated stats:', stats);

//     await prismaClient.userVehicleStats.upsert({
//       where: { userId: ownerId },
//       update: {
//         total_vehicles: vehicles.length,
//         expiring_count: stats.expiring.count,
//         expired_count: stats.expired.count,
//         expiring_roadTax: stats.expiring.roadTax,
//         expiring_fitness: stats.expiring.fitness,
//         expiring_insurance: stats.expiring.insurance,
//         expiring_pollution: stats.expiring.pollution,
//         expiring_statePermit: stats.expiring.statePermit,
//         expiring_nationalPermit: stats.expiring.nationalPermit,
//         expired_roadTax: stats.expired.roadTax,
//         expired_fitness: stats.expired.fitness,
//         expired_insurance: stats.expired.insurance,
//         expired_pollution: stats.expired.pollution,
//         expired_statePermit: stats.expired.statePermit,
//         expired_nationalPermit: stats.expired.nationalPermit,
//       },
//       create: {
//         userId: ownerId,
//         total_vehicles: vehicles.length,
//         expiring_count: stats.expiring.count,
//         expired_count: stats.expired.count,
//         expiring_roadTax: stats.expiring.roadTax,
//         expiring_fitness: stats.expiring.fitness,
//         expiring_insurance: stats.expiring.insurance,
//         expiring_pollution: stats.expiring.pollution,
//         expiring_statePermit: stats.expiring.statePermit,
//         expiring_nationalPermit: stats.expiring.nationalPermit,
//         expired_roadTax: stats.expired.roadTax,
//         expired_fitness: stats.expired.fitness,
//         expired_insurance: stats.expired.insurance,
//         expired_pollution: stats.expired.pollution,
//         expired_statePermit: stats.expired.statePermit,
//         expired_nationalPermit: stats.expired.nationalPermit,
//       },
//     });

//     console.log('UserVehicleStats updated for ownerId:', ownerId);
//   } catch (error) {
//     console.error('Error updating vehicle stats:', error);
//   }
// }

// export default prisma;




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
      expiring_1y: { count: 0, roadTax: 0, fitness: 0, insurance: 0, pollution: 0, statePermit: 0, nationalPermit: 0 }
    };

    vehicles.forEach((vehicle) => {
      fields.forEach((field) => {
        const date = vehicle[field] as string; // Type assertion based on Vehicle type
        const color = getExpirationColor(date);
        if (color === 'text-yellow-500') {
          stats.expiring[field]++;
          stats.expiring.count++; // Increment for each expiring field
        } else if (color === 'text-red-500') {
          stats.expired[field]++;
          stats.expired.count++; // Increment for each expired field
        }
        
        // Use the new timeframe approach for additional stats
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

    console.log('Calculated stats:', stats);

    await prismaClient.userVehicleStats.upsert({
      where: { userId: ownerId },
      update: {
        total_vehicles: vehicles.length,
        // Original stats
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
        
        // New stats for 3 months (1-3 months)
        expiring_3m_count: stats.expiring_3m.count,
        expiring_3m_roadTax: stats.expiring_3m.roadTax,
        expiring_3m_fitness: stats.expiring_3m.fitness,
        expiring_3m_insurance: stats.expiring_3m.insurance,
        expiring_3m_pollution: stats.expiring_3m.pollution,
        expiring_3m_statePermit: stats.expiring_3m.statePermit,
        expiring_3m_nationalPermit: stats.expiring_3m.nationalPermit,
        
        // New stats for 6 months (3-6 months)
        expiring_6m_count: stats.expiring_6m.count,
        expiring_6m_roadTax: stats.expiring_6m.roadTax,
        expiring_6m_fitness: stats.expiring_6m.fitness,
        expiring_6m_insurance: stats.expiring_6m.insurance,
        expiring_6m_pollution: stats.expiring_6m.pollution,
        expiring_6m_statePermit: stats.expiring_6m.statePermit,
        expiring_6m_nationalPermit: stats.expiring_6m.nationalPermit,
        
        // New stats for 1 year (6-12 months)
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
        // Original stats
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
        
        // New stats for 3 months (1-3 months)
        expiring_3m_count: stats.expiring_3m.count,
        expiring_3m_roadTax: stats.expiring_3m.roadTax,
        expiring_3m_fitness: stats.expiring_3m.fitness,
        expiring_3m_insurance: stats.expiring_3m.insurance,
        expiring_3m_pollution: stats.expiring_3m.pollution,
        expiring_3m_statePermit: stats.expiring_3m.statePermit,
        expiring_3m_nationalPermit: stats.expiring_3m.nationalPermit,
        
        // New stats for 6 months (3-6 months)
        expiring_6m_count: stats.expiring_6m.count,
        expiring_6m_roadTax: stats.expiring_6m.roadTax,
        expiring_6m_fitness: stats.expiring_6m.fitness,
        expiring_6m_insurance: stats.expiring_6m.insurance,
        expiring_6m_pollution: stats.expiring_6m.pollution,
        expiring_6m_statePermit: stats.expiring_6m.statePermit,
        expiring_6m_nationalPermit: stats.expiring_6m.nationalPermit,
        
        // New stats for 1 year (6-12 months)
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

export default prisma;