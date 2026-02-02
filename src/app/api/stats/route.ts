import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getQdrant, getCollectionName } from "@/lib/qdrant";
import { getServerEnv } from "@/lib/env";
import { subDays, startOfDay, startOfWeek, format } from "date-fns";

export async function GET() {
  try {
    const env = await getServerEnv();
    const prisma = getPrisma(env);
    const qdrantClient = getQdrant(env);
    const collection = getCollectionName(env);

    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thirtyDaysAgo = subDays(now, 30);

    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      totalProjects,
      activeProjects,
      deletedProjects,
      totalChats,
      userGrowthRaw,
      chatUsageRaw,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { is_active: true } }),
      prisma.user.count({ where: { created_at: { gte: todayStart } } }),
      prisma.user.count({ where: { created_at: { gte: weekStart } } }),
      prisma.project.count(),
      prisma.project.count({ where: { deleted_at: null } }),
      prisma.project.count({ where: { deleted_at: { not: null } } }),
      prisma.chat.count(),
      prisma.user.findMany({
        where: { created_at: { gte: thirtyDaysAgo } },
        select: { created_at: true },
        orderBy: { created_at: "asc" },
      }),
      prisma.chat.findMany({
        where: { created_at: { gte: thirtyDaysAgo } },
        select: { created_at: true, role: true },
        orderBy: { created_at: "asc" },
      }),
    ]);

    let totalExperiences = 0;
    let experienceTypes: { type: string; count: number }[] = [];
    let experienceCategories: { category: string; count: number }[] = [];
    try {
      const collectionInfo = await qdrantClient.getCollection(collection);
      totalExperiences = collectionInfo.points_count ?? 0;

      const allPoints = await qdrantClient.scroll(collection, {
        limit: 10000,
        with_payload: ["experience_type", "category"],
        with_vector: false,
      });

      const typeCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};
      for (const point of allPoints.points) {
        const payload = point.payload as Record<string, unknown>;
        const t = payload?.experience_type as string;
        const c = payload?.category as string;
        if (t) typeCounts[t] = (typeCounts[t] || 0) + 1;
        if (c) categoryCounts[c] = (categoryCounts[c] || 0) + 1;
      }
      experienceTypes = Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count,
      }));
      experienceCategories = Object.entries(categoryCounts).map(
        ([category, count]) => ({ category, count })
      );
    } catch {
      // Qdrant not available
    }

    const userGrowthMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      userGrowthMap[format(subDays(now, i), "yyyy-MM-dd")] = 0;
    }
    for (const u of userGrowthRaw) {
      const day = format(u.created_at, "yyyy-MM-dd");
      if (userGrowthMap[day] !== undefined) userGrowthMap[day]++;
    }
    const userGrowth = Object.entries(userGrowthMap).map(([date, count]) => ({
      date,
      count,
    }));

    const chatUsageMap: Record<string, { user: number; assistant: number }> = {};
    for (let i = 29; i >= 0; i--) {
      chatUsageMap[format(subDays(now, i), "yyyy-MM-dd")] = {
        user: 0,
        assistant: 0,
      };
    }
    for (const c of chatUsageRaw) {
      const day = format(c.created_at, "yyyy-MM-dd");
      if (chatUsageMap[day]) {
        chatUsageMap[day][c.role]++;
      }
    }
    const chatUsage = Object.entries(chatUsageMap).map(
      ([date, { user, assistant }]) => ({ date, user, assistant })
    );

    const projectStatus = [
      { name: "활성", value: activeProjects },
      { name: "삭제됨", value: deletedProjects },
    ];

    return NextResponse.json({
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      totalProjects,
      totalExperiences,
      totalChats,
      userGrowth,
      projectStatus,
      experienceTypes,
      experienceCategories,
      chatUsage,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
