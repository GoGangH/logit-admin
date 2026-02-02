import { NextRequest, NextResponse } from "next/server";
import { getQdrant, getCollectionName } from "@/lib/qdrant";
import { getPrisma } from "@/lib/prisma";
import { getServerEnv } from "@/lib/env";

export async function GET(req: NextRequest) {
  try {
    const env = await getServerEnv();
    const qdrant = getQdrant(env);
    const QDRANT_COLLECTION = getCollectionName(env);
    const prisma = getPrisma(env);
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const category = searchParams.get("category") || "";

    const must: unknown[] = [];
    if (type) {
      must.push({ key: "experience_type", match: { value: type } });
    }
    if (category) {
      must.push({ key: "category", match: { value: category } });
    }

    const filter = must.length > 0 ? { must } : undefined;

    // Get total count
    const countResult = await qdrant.count(QDRANT_COLLECTION, { filter, exact: true });
    const total = countResult.count;

    // Scroll with offset
    const offset = (page - 1) * pageSize;
    let points: { id: string | number; payload?: Record<string, unknown> | null }[] = [];

    if (offset === 0) {
      const result = await qdrant.scroll(QDRANT_COLLECTION, {
        filter,
        limit: pageSize,
        with_payload: true,
        with_vector: false,
      });
      points = result.points;
    } else {
      // Qdrant scroll doesn't support offset directly, so we need to scroll through
      let nextOffset: string | number | Record<string, unknown> | null | undefined = undefined;
      let remaining = offset + pageSize;
      let collected: typeof points = [];

      while (remaining > 0) {
        const batchSize = Math.min(remaining, 100);
        const result = await qdrant.scroll(QDRANT_COLLECTION, {
          filter,
          limit: batchSize,
          offset: nextOffset,
          with_payload: true,
          with_vector: false,
        });
        collected = collected.concat(result.points);
        nextOffset = result.next_page_offset;
        remaining -= result.points.length;
        if (!nextOffset || result.points.length === 0) break;
      }

      points = collected.slice(offset, offset + pageSize);
    }

    // Enrich with user email
    const userIds = [
      ...new Set(
        points
          .map((p) => (p.payload as Record<string, unknown>)?.user_id as string)
          .filter(Boolean)
      ),
    ];
    const users = userIds.length
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true, full_name: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const data = points.map((p) => {
      const payload = (p.payload ?? {}) as Record<string, unknown>;
      const userId = payload?.user_id as string;
      const user = userMap.get(userId);
      return {
        ...payload,
        id: p.id,
        user_email: user?.email,
        user_name: user?.full_name,
      } as Record<string, unknown> & { id: string | number; user_email?: string; user_name?: string | null };
    });

    // Client-side search filter (Qdrant doesn't support text search well)
    const filtered = search
      ? data.filter(
          (d) =>
            (d.title as string | undefined)?.toLowerCase().includes(search.toLowerCase()) ||
            d.user_email?.toLowerCase().includes(search.toLowerCase())
        )
      : data;

    return NextResponse.json({
      data: filtered,
      total: search ? filtered.length : total,
      page,
      pageSize,
      totalPages: Math.ceil((search ? filtered.length : total) / pageSize),
    });
  } catch (error) {
    console.error("Experiences list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch experiences" },
      { status: 500 }
    );
  }
}
