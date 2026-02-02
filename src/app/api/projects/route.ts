import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getServerEnv } from "@/lib/env";

export async function GET(req: NextRequest) {
  try {
    const prisma = getPrisma(await getServerEnv());
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || "";

    const where = {
      deleted_at: null,
      ...(search && {
        OR: [
          { company: { contains: search, mode: "insensitive" as const } },
          { job_position: { contains: search, mode: "insensitive" as const } },
          {
            user: {
              email: { contains: search, mode: "insensitive" as const },
            },
          },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          user: { select: { email: true, full_name: true } },
          _count: { select: { questions: true } },
        },
        orderBy: { created_at: "desc" },
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
    console.error("Projects list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
