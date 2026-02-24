import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getServerEnv } from "@/lib/env";

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
        started_at: Date | null;
        expires_at: Date | null;
        created_at: Date;
        updated_at: Date | null;
      }[]
    >(
      `SELECT id, user_id, type, is_active, plan, started_at, expires_at, created_at, updated_at
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
