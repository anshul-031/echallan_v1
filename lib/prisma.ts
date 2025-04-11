import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: ['error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Add error handling wrapper
prisma.$use(async (params, next) => {
  try {
    const result = await next(params);
    return result;
  } catch (error: any) {
    console.error('Prisma Error:', {
      error: error.message,
      model: params.model,
      action: params.action,
      args: params.args,
    });
    throw error;
  }
});

export default prisma;