import { NextRequest, NextResponse } from "next/server";
import { getQdrant, getCollectionName } from "@/lib/qdrant";
import { getServerEnv } from "@/lib/env";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const env = await getServerEnv();
    const qdrantClient = getQdrant(env);
    const collection = getCollectionName(env);
    const { id: userId } = await params;
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get("pageSize") || "10")));

    const filter = {
      must: [{ key: "user_id", match: { value: userId } }],
    };

    // Get total count
    const countResult = await qdrantClient.count(collection, { filter, exact: true });
    const total = countResult.count;

    // Scroll with offset simulation: fetch enough points then slice
    // Qdrant scroll doesn't support skip, so we fetch page*pageSize and take the last pageSize
    const fetchLimit = page * pageSize;
    const result = await qdrantClient.scroll(collection, {
      filter,
      limit: fetchLimit,
      with_payload: true,
      with_vector: false,
    });

    const allPoints = result.points.map((p) => ({
      id: p.id,
      ...p.payload,
    }));

    const data = allPoints.slice((page - 1) * pageSize, page * pageSize);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Fetch user experiences error:", error);
    return NextResponse.json(
      { error: "Failed to fetch experiences" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const env = await getServerEnv();
    const qdrantClient = getQdrant(env);
    const collection = getCollectionName(env);
    const { id: userId } = await params;
    const { ids } = await req.json();

    if (ids?.length) {
      // 선택 삭제
      await qdrantClient.delete(collection, { points: ids });
    } else {
      // 전체 삭제
      await qdrantClient.delete(collection, {
        filter: {
          must: [{ key: "user_id", match: { value: userId } }],
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bulk delete experiences error:", error);
    return NextResponse.json(
      { error: "Failed to delete experiences" },
      { status: 500 }
    );
  }
}
