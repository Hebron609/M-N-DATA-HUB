import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
// Prisma 7 exposes the client through its CommonJS runtime entry in this build path.
// Using require avoids the named-export mismatch that Vercel's type-checker hits here.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require("@prisma/client") as typeof import(".prisma/client/index");

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

type PrismaClientInstance = InstanceType<typeof PrismaClient>;

const globalForPrisma = global as unknown as { prisma: PrismaClientInstance };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
