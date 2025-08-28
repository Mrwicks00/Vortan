import { PrismaClient } from "@prisma/client";

// Database configuration
export const DATABASE_CONFIG = {
  // Primary database (PostgreSQL recommended for production)
  primary: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://user:password@localhost:5432/vortan",
    type: "postgresql" as const,
  },

  // Alternative: SQLite for development/testing
  sqlite: {
    url: process.env.DATABASE_URL || "file:./dev.db",
    type: "sqlite" as const,
  },

  // Alternative: MongoDB for document-based storage
  mongodb: {
    url: process.env.MONGODB_URL || "mongodb://localhost:27017/vortan",
    type: "mongodb" as const,
  },
};

// Prisma client instance
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_CONFIG.primary.url,
      },
    },
  });
} else {
  // Development: Use SQLite for simplicity
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_CONFIG.sqlite.url,
      },
    },
  });
}

export { prisma };

// Database connection utilities
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
};

export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log("✅ Database disconnected successfully");
  } catch (error) {
    console.error("❌ Database disconnection failed:", error);
  }
};

// Health check
export const checkDatabaseHealth = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "healthy", timestamp: new Date() };
  } catch (error) {
    return { status: "unhealthy", error: error.message, timestamp: new Date() };
  }
};
