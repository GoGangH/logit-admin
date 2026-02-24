import { SignJWT } from "jose";
import type { ServerEnv } from "./prisma";

function getMcpSecret(env: ServerEnv): string {
  const secret =
    env === "production"
      ? process.env.PROD_MCP_JWT_SECRET
      : process.env.DEV_MCP_JWT_SECRET;

  if (!secret) throw new Error(`MCP_JWT_SECRET not configured for ${env}`);
  return secret;
}

export async function createMcpToken(userId: string, env: ServerEnv): Promise<string> {
  const secret = new TextEncoder().encode(getMcpSecret(env));
  return new SignJWT({ sub: userId, type: "mcp" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);
}
