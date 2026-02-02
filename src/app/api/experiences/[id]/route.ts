import { NextRequest, NextResponse } from "next/server";
import { getQdrant, getCollectionName } from "@/lib/qdrant";
import { getPrisma } from "@/lib/prisma";
import { getServerEnv } from "@/lib/env";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const env = await getServerEnv();
    const qdrantClient = getQdrant(env);
    const collection = getCollectionName(env);
    const prisma = getPrisma(env);
    const { id } = await params;

    const points = await qdrantClient.retrieve(collection, {
      ids: [id],
      with_payload: true,
      with_vector: false,
    });

    if (points.length === 0) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    const point = points[0];
    const payload = point.payload as Record<string, unknown>;
    const userId = payload?.user_id as string;

    let userInfo = null;
    if (userId) {
      userInfo = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, full_name: true },
      });
    }

    return NextResponse.json({
      id: point.id,
      ...payload,
      user_email: userInfo?.email,
      user_name: userInfo?.full_name,
    });
  } catch (error) {
    console.error("Experience detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch experience" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const env = await getServerEnv();
    const qdrantClient = getQdrant(env);
    const collection = getCollectionName(env);
    const { id } = await params;
    const body = await req.json();

    await qdrantClient.setPayload(collection, {
      points: [id],
      payload: {
        ...body,
        updated_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Experience update error:", error);
    return NextResponse.json(
      { error: "Failed to update experience" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const env = await getServerEnv();
    const qdrantClient = getQdrant(env);
    const collection = getCollectionName(env);
    const { id } = await params;

    await qdrantClient.delete(collection, {
      points: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Experience delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete experience" },
      { status: 500 }
    );
  }
}
