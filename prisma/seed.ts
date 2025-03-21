// prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  try {
    // Step 1: Delete all existing vehicles
    await prisma.vehicle.deleteMany({});
    console.log('All vehicles deleted.');

    // // Step 2: Create users (if they don't exist)
    // const users = await prisma.user.findMany();
    // if (users.length === 0) {
    //   console.error('No users found in the database. Please create users first.');
    //   process.exit(1);
    // }
    // console.log(`Found ${users.length} users in the database.`);

    // // Step 3: Create vehicles
    // // Step 2: Sample vehicle data
    // const vehicles = [
    //   {
    //     vrn: 'GJ01AB1234',
    //     roadTax: '31-03-2025',
    //     fitness: '31-03-2025',
    //     insurance: '31-03-2025',
    //     pollution: '31-03-2025',
    //     statePermit: '31-03-2025',
    //     nationalPermit: '31-03-2025',
    //     lastUpdated: '20-03-2025',
    //     status: 'Active',
    //     ownerId: users[0].id,
    //     registeredAt: '01-01-2023',
    //     documents: Prisma.JsonNull,
    //   },
    //   {
    //     vrn: 'GJ02CD5678',
    //     roadTax: '30-06-2025',
    //     fitness: '30-06-2025',
    //     insurance: '30-06-2025',
    //     pollution: '30-06-2025',
    //     statePermit: '30-06-2025',
    //     nationalPermit: '30-06-2025',
    //     lastUpdated: '20-03-2025',
    //     status: 'Maintenance',
    //     ownerId: users[0].id,
    //     registeredAt: '15-02-2023',
    //     documents: Prisma.JsonNull,
    //   },
    //   {
    //     vrn: 'GJ03EF9012',
    //     roadTax: '31-12-2024',
    //     fitness: '31-12-2024',
    //     insurance: '31-12-2024',
    //     pollution: '31-12-2024',
    //     statePermit: '31-12-2024',
    //     nationalPermit: '31-12-2024',
    //     lastUpdated: '20-03-2025',
    //     status: 'Inactive',
    //     ownerId: users[0].id,
    //     registeredAt: '10-03-2023',
    //     documents: Prisma.JsonNull,
    //   },
    // ];

    // // Step 3: Insert vehicles
    // for (const vehicle of vehicles) {
    //   await prisma.vehicle.upsert({
    //     where: { vrn: vehicle.vrn }, // Unique constraint on vrn
    //     update: vehicle,
    //     create: vehicle,
    //   });
    //   console.log(`Vehicle ${vehicle.vrn} added or updated.`);
    // }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
