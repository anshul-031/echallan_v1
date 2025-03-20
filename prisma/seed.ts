// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  try {
    // Step 1: Ensure the user exists
    const userId = '22dbec05-bb9d-40c0-b898-2a5759d16dcb';
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: 'vaghelakaranraj54@gmail.com',
        password: 'hashed_password_placeholder', // Replace with a real hashed password in production
        name: 'Karan Raj Vaghela',
        role: 'user',
      },
    });
    console.log(`User ${userId} ensured in the database.`);

    // Step 2: Sample vehicle data
    const vehicles = [
      {
        vrn: 'GJ01AB1234',
        roadTax: '31-03-2025',
        fitness: '31-03-2025',
        insurance: '31-03-2025',
        pollution: '31-03-2025',
        statePermit: '31-03-2025',
        nationalPermit: '31-03-2025',
        lastUpdated: '20-03-2025',
        status: 'Active',
        ownerId: userId,
        registeredAt: '01-01-2023',
        documents: 5,
      },
      {
        vrn: 'GJ02CD5678',
        roadTax: '30-06-2025',
        fitness: '30-06-2025',
        insurance: '30-06-2025',
        pollution: '30-06-2025',
        statePermit: '30-06-2025',
        nationalPermit: '30-06-2025',
        lastUpdated: '20-03-2025',
        status: 'Maintenance',
        ownerId: userId,
        registeredAt: '15-02-2023',
        documents: 3,
      },
      {
        vrn: 'GJ03EF9012',
        roadTax: '31-12-2024',
        fitness: '31-12-2024',
        insurance: '31-12-2024',
        pollution: '31-12-2024',
        statePermit: '31-12-2024',
        nationalPermit: '31-12-2024',
        lastUpdated: '20-03-2025',
        status: 'Inactive',
        ownerId: userId,
        registeredAt: '10-03-2023',
        documents: 4,
      },
    ];

    // Step 3: Insert vehicles
    for (const vehicle of vehicles) {
      await prisma.vehicle.upsert({
        where: { vrn: vehicle.vrn }, // Unique constraint on vrn
        update: vehicle,
        create: vehicle,
      });
      console.log(`Vehicle ${vehicle.vrn} added or updated.`);
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();