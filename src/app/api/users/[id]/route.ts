import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getQdrant, getCollectionName } from "@/lib/qdrant";
import { getServerEnv } from "@/lib/env";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const env = await getServerEnv();
    const prisma = getPrisma(env);
    const qdrantClient = getQdrant(env);
    const collection = getCollectionName(env);
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        projects: {
          where: { deleted_at: null },
          orderBy: { created_at: "desc" },
          include: { _count: { select: { questions: true } } },
        },
        _count: { select: { chats: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let experiences: unknown[] = [];
    try {
      const result = await qdrantClient.scroll(collection, {
        filter: {
          must: [{ key: "user_id", match: { value: id } }],
        },
        limit: 100,
        with_payload: true,
        with_vector: false,
      });
      experiences = result.points.map((p) => ({
        id: p.id,
        ...p.payload,
      }));
    } catch {
      // Qdrant not available
    }

    return NextResponse.json({ ...user, experiences });
  } catch (error) {
    console.error("User detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma(await getServerEnv());
    const { id } = await params;
    const body = await req.json();
    const user = await prisma.user.update({
      where: { id },
      data: { is_active: body.is_active },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
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
    const prisma = getPrisma(env);
    const qdrantClient = getQdrant(env);
    const collection = getCollectionName(env);
    const { id } = await params;

    await prisma.chat.deleteMany({ where: { user_id: id } });
    await prisma.question.deleteMany({ where: { user_id: id } });
    await prisma.project.deleteMany({ where: { user_id: id } });
    await prisma.user.delete({ where: { id } });

    try {
      await qdrantClient.delete(collection, {
        filter: {
          must: [{ key: "user_id", match: { value: id } }],
        },
      });
    } catch {
      // Qdrant cleanup failed
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
