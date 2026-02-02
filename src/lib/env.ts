import { cookies } from "next/headers";
import type { ServerEnv } from "./prisma";

const COOKIE_NAME = "admin-server-env";

export async function getServerEnv(): Promise<ServerEnv> {
  const cookieStore = await cookies();
  const env = cookieStore.get(COOKIE_NAME)?.value;
  return env === "production" ? "production" : "dev";
}
