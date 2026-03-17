import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { getDatabaseUrl, getLibSqlAuthToken } from "./database-config";

function createPrismaClient() {
  const authToken = getLibSqlAuthToken();
  const adapter = new PrismaLibSql(
    authToken
      ? {
          url: getDatabaseUrl(),
          authToken,
        }
      : {
          url: getDatabaseUrl(),
        }
  );
  return new PrismaClient({ adapter });
}

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
