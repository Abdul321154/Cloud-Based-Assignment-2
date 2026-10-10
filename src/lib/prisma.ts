import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

// Initialize Prisma Client with proper error handling
let prismaInstance: PrismaClient;

try {
  prismaInstance = globalThis.__prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
  
  if (process.env.NODE_ENV !== "production") {
    globalThis.__prisma = prismaInstance;
  }
} catch (error) {
  console.warn("Failed to initialize Prisma Client:", error);
  // Create a minimal fallback client for build process
  prismaInstance = {} as PrismaClient;
}

export const prisma = prismaInstance;
