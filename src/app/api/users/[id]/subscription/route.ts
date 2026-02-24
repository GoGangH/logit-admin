import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getServerEnv } from "@/lib/env";
import { createMcpToken } from "@/lib/mcp-token";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const env = await getServerEnv();
    const prisma = getPrisma(env);
    const { id: userId } = await params;

    const rows = await prisma.$queryRawUnsafe<
      {
        id: string;
        user_id: string;
        type: string;
        is_active: boolean;
        plan: string;
        token: string | null;
        started_at: Date | null;
        expires_at: Date | null;
        created_at: Date;
      }[]
    >(
      `SELECT id, user_id, type, is_active, plan, token, started_at, expires_at, created_at
       FROM subscriptions
       WHERE user_id = $1::uuid
       ORDER BY created_at DESC`,
      userId
    );

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

// MCP 구독 발급 (없으면 생성, 있으면 갱신) - 어드민 전용, production 환경만 허용
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const env = await getServerEnv();

    if (env !== "production") {
      return NextResponse.json(
        { error: "MCP 발급은 production 환경에서만 가능합니다." },
        { status: 403 }
      );
    }

    const prisma = getPrisma(env);
    const { id: userId } = await params;

    const token = await createMcpToken(userId, env);

    await prisma.$queryRawUnsafe(
      `INSERT INTO subscriptions (id, user_id, type, is_active, plan, token, started_at, expires_at, created_at)
       VALUES (gen_random_uuid(), $1::uuid, 'mcp'::subscriptiontype, true, 'free_trial'::subscriptionplan, $2, NOW(), NOW() + INTERVAL '30 days', NOW())
       ON CONFLICT (user_id, type) DO UPDATE SET
         is_active  = true,
         plan       = 'free_trial'::subscriptionplan,
         token      = $2,
         started_at = NOW(),
         expires_at = NOW() + INTERVAL '30 days'`,
      userId,
      token
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error("MCP subscription issue error:", error);
    return NextResponse.json(
      { error: "Failed to issue MCP subscription" },
      { status: 500 }
    );
  }
}
