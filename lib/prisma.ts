import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function makePrisma() {
  return new PrismaClient({ log: ["error"] });
}

// Always create fresh in production (serverless). In dev, reuse to limit connections
// but clear on connection errors (handled by callers with try/catch)
export const prisma = globalForPrisma.prisma ?? makePrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Reset on closed connection so next request gets a fresh client
export function resetPrismaConnection() {
  globalForPrisma.prisma = undefined;
}
