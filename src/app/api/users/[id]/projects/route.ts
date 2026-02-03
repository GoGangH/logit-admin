import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getServerEnv } from "@/lib/env";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma(await getServerEnv());
    const { id: userId } = await params;
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get("pageSize") || "10")));

    const where = { user_id: userId, deleted_at: null } as const;

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { created_at: "desc" },
        include: { _count: { select: { questions: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Fetch user projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma(await getServerEnv());
    const { id: userId } = await params;
    const { ids } = await req.json();

    // ids가 없으면 전체 삭제, 있으면 선택 삭제
    const where = ids?.length
      ? { id: { in: ids as string[] }, user_id: userId }
      : { user_id: userId };

    // 관련 채팅 → 질문 → 프로젝트 순서로 삭제
    const projects = await prisma.project.findMany({
      where,
      select: { id: true },
    });
    const projectIds = projects.map((p) => p.id);

    if (projectIds.length > 0) {
      await prisma.chat.deleteMany({
        where: { project_id: { in: projectIds } },
      });
      await prisma.question.deleteMany({
        where: { project_id: { in: projectIds } },
      });
      await prisma.project.deleteMany({ where: { id: { in: projectIds } } });
    }

    return NextResponse.json({ deleted: projectIds.length });
  } catch (error) {
    console.error("Bulk delete projects error:", error);
    return NextResponse.json(
      { error: "Failed to delete projects" },
      { status: 500 }
    );
  }
}
