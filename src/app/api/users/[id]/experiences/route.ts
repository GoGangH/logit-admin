import { NextRequest, NextResponse } from "next/server";
import { getQdrant, getCollectionName } from "@/lib/qdrant";
import { getServerEnv } from "@/lib/env";

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
