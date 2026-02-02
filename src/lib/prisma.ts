import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export type ServerEnv = "dev" | "production";

const clients: Partial<Record<ServerEnv, PrismaClient>> = {};

function createClient(env: ServerEnv): PrismaClient {
  const url =
    env === "production"
      ? process.env.PROD_DATABASE_URL
      : process.env.DEV_DATABASE_URL || process.env.DATABASE_URL;

  if (!url) throw new Error(`Database URL not configured for ${env}`);

  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

export function getPrisma(env: ServerEnv = "dev"): PrismaClient {
  if (!clients[env]) {
    clients[env] = createClient(env);
  }
  return clients[env];
}

// 기본 dev 클라이언트 (하위 호환)
export const prisma = getPrisma("dev");
