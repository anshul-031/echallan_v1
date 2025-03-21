// // prisma/seed.ts
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function seed() {
//   try {
//     // Step 1: Ensure the user exists
//     const userId = '22dbec05-bb9d-40c0-b898-2a5759d16dcb';
//     await prisma.user.upsert({
//       where: { id: userId },
//       update: {},
//       create: {
//         id: userId,
//         email: 'vaghelakaranraj54@gmail.com',
//         password: 'hashed_password_placeholder', // Replace with a real hashed password in production
//         name: 'Karan Raj Vaghela',
//         role: 'user',
//       },
//     });
//     console.log(`User ${userId} ensured in the database.`);

//     // Step 2: Sample vehicle data
//     const vehicles = [
//       {
//         vrn: 'GJ01AB1234',
//         roadTax: '31-03-2025',
//         fitness: '31-03-2025',
//         insurance: '31-03-2025',
//         pollution: '31-03-2025',
//         statePermit: '31-03-2025',
//         nationalPermit: '31-03-2025',
//         lastUpdated: '20-03-2025',
//         status: 'Active',
//         ownerId: userId,
//         registeredAt: '01-01-2023',
//         documents: 5,
//       },
//       {
//         vrn: 'GJ02CD5678',
//         roadTax: '30-06-2025',
//         fitness: '30-06-2025',
//         insurance: '30-06-2025',
//         pollution: '30-06-2025',
//         statePermit: '30-06-2025',
//         nationalPermit: '30-06-2025',
//         lastUpdated: '20-03-2025',
//         status: 'Maintenance',
//         ownerId: userId,
//         registeredAt: '15-02-2023',
//         documents: 3,
//       },
//       {
//         vrn: 'GJ03EF9012',
//         roadTax: '31-12-2024',
//         fitness: '31-12-2024',
//         insurance: '31-12-2024',
//         pollution: '31-12-2024',
//         statePermit: '31-12-2024',
//         nationalPermit: '31-12-2024',
//         lastUpdated: '20-03-2025',
//         status: 'Inactive',
//         ownerId: userId,
//         registeredAt: '10-03-2023',
//         documents: 4,
//       },
//     ];

//     // Step 3: Insert vehicles
//     for (const vehicle of vehicles) {
//       await prisma.vehicle.upsert({
//         where: { vrn: vehicle.vrn }, // Unique constraint on vrn
//         update: vehicle,
//         create: vehicle,
//       });
//       console.log(`Vehicle ${vehicle.vrn} added or updated.`);
//     }

//     console.log('Seeding completed successfully!');
//   } catch (error) {
//     console.error('Error during seeding:', error);
//     process.exit(1);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// seed();


// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate a random date between two years
function getRandomDate(startYear: number, endYear: number): string {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

// Helper function to generate a random VRN
function generateVRN(index: number): string {
  const states = ['GJ', 'MH', 'DL', 'KA', 'TN', 'UP', 'RJ', 'MP', 'WB', 'AP'];
  const randomState = states[Math.floor(Math.random() * states.length)];
  const randomLetters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const randomNumber = (index % 10000).toString().padStart(4, '0');
  return `${randomState}${Math.floor(Math.random() * 10)}${randomLetters}${randomNumber}`;
}

// Helper function to pick a random status
function getRandomStatus(): string {
  const statuses = ['Active', 'Maintenance', 'Inactive', 'Sold', 'Under Repair'];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

// Helper function to get a random number of documents
function getRandomDocuments(): number {
  return Math.floor(Math.random() * 9); // 0 to 8 documents
}

async function seed() {
  try {
    // Step 1: Fetch all existing users
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      console.error('No users found in the database. Please create users first.');
      process.exit(1);
    }
    console.log(`Found ${users.length} users in the database.`);

    // Step 2: Generate a variety of vehicle data
    const vehicles = Array.from({ length: 50 }, (_, index) => {
      // Generate random dates
      const roadTax = getRandomDate(2024, 2026); // Expiry dates between 2024 and 2026
      const fitness = getRandomDate(2024, 2026);
      const insurance = getRandomDate(2024, 2026);
      const pollution = getRandomDate(2024, 2026);
      const statePermit = getRandomDate(2024, 2026);
      const nationalPermit = getRandomDate(2024, 2026);
      const lastUpdated = getRandomDate(2024, 2025); // Last updated between 2024 and 2025
      const registeredAt = getRandomDate(2018, 2023); // Registered between 2018 and 2023

      // Assign the vehicle to a random user
      const ownerId = users[Math.floor(Math.random() * users.length)].id;

      return {
        vrn: generateVRN(index),
        roadTax,
        fitness,
        insurance,
        pollution,
        statePermit,
        nationalPermit,
        lastUpdated,
        status: getRandomStatus(),
        ownerId,
        registeredAt,
        documents: getRandomDocuments(),
      };
    });

    // Step 3: Insert vehicles
    for (const vehicle of vehicles) {
      await prisma.vehicle.upsert({
        where: { vrn: vehicle.vrn }, // Unique constraint on vrn
        update: vehicle,
        create: vehicle,
      });
      console.log(`Vehicle ${vehicle.vrn} added or updated for user ${vehicle.ownerId}.`);
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