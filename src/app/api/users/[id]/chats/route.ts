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
    const questionId = searchParams.get("questionId");

    if (questionId) {
      // Message mode: cursor-based reverse pagination
      const cursor = searchParams.get("cursor");
      const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "30")));

      const where = {
        question_id: questionId,
        user_id: userId,
        ...(cursor ? { id: { lt: cursor } } : {}),
      } as Record<string, unknown>;

      const chats = await prisma.chat.findMany({
        where,
        orderBy: { created_at: "desc" },
        take: limit + 1,
      });

      const hasMore = chats.length > limit;
      const data = hasMore ? chats.slice(0, limit) : chats;

      return NextResponse.json({
        data: data.map((c) => ({
          id: c.id,
          role: c.role,
          content: c.content,
          experience_ids: c.experience_ids,
          is_draft: c.is_draft,
          is_selected: c.is_selected,
          created_at: c.created_at,
        })),
        nextCursor: hasMore ? data[data.length - 1].id : null,
        hasMore,
      });
    }

    // Question list mode: paginated
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get("pageSize") || "20")));

    // Get questions that have chats for this user
    const questions = await prisma.question.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
        chats: { some: { user_id: userId } },
      },
      include: {
        project: { select: { id: true, company: true, job_position: true } },
        _count: { select: { chats: true } },
        chats: {
          orderBy: { created_at: "desc" },
          take: 1,
          select: { created_at: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const total = questions.length;
    const paged = questions.slice((page - 1) * pageSize, page * pageSize);

    const data = paged.map((q) => ({
      question_id: q.id,
      question: q.question,
      question_order: q.order,
      project_id: q.project?.id ?? "",
      project_company: q.project?.company ?? "",
      project_job_position: q.project?.job_position ?? "",
      chat_count: q._count.chats,
      last_chat_at: q.chats[0]?.created_at?.toISOString() ?? "",
    }));

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Fetch user chats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}
