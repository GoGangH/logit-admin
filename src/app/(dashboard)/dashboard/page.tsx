"use client";

import { useStats } from "@/hooks/use-stats";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  UserGrowthChart,
  ProjectStatusChart,
  ExperienceTypeChart,
  ExperienceCategoryChart,
  ChatUsageChart,
} from "@/components/dashboard/charts";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserCheck,
  UserPlus,
  FolderKanban,
  BookOpen,
  MessageSquare,
} from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading } = useStats();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="대시보드" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[110px]" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[320px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="대시보드" description="서비스 현황을 한눈에 확인하세요" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="전체 사용자" value={data.totalUsers} icon={Users} />
        <StatCard title="활성 사용자" value={data.activeUsers} icon={UserCheck} />
        <StatCard
          title="오늘 가입"
          value={data.newUsersToday}
          icon={UserPlus}
        />
        <StatCard
          title="이번 주 가입"
          value={data.newUsersThisWeek}
          icon={UserPlus}
        />
        <StatCard
          title="전체 프로젝트"
          value={data.totalProjects}
          icon={FolderKanban}
        />
        <StatCard
          title="전체 경험"
          value={data.totalExperiences}
          icon={BookOpen}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <UserGrowthChart data={data.userGrowth} />
        <ChatUsageChart data={data.chatUsage} />
        <ProjectStatusChart data={data.projectStatus} />
        <ExperienceTypeChart data={data.experienceTypes} />
        <ExperienceCategoryChart data={data.experienceCategories} />
        <StatCard
          title="전체 채팅 메시지"
          value={data.totalChats}
          icon={MessageSquare}
          description="사용자 + 어시스턴트 메시지 합계"
        />
      </div>
    </div>
  );
}
