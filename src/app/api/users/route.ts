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
    const isActive = searchParams.get("isActive");

    // UUID 형식 체크
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search);

    const where = {
      ...(search && {
        OR: isUuid
          ? [{ id: search }]
          : [
              { email: { contains: search, mode: "insensitive" as const } },
              { full_name: { contains: search, mode: "insensitive" as const } },
            ],
      }),
      ...(isActive !== null &&
        isActive !== undefined &&
        isActive !== "" && {
          is_active: isActive === "true",
        }),
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          _count: { select: { projects: true, chats: true } },
        },
        orderBy: { created_at: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Users list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
