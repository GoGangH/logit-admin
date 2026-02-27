"use client";

import { use } from "react";
import { useExperience } from "@/hooks/use-experiences";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Briefcase,
  Tag,
  CalendarDays,
  Layers,
  Eye,
  Target,
  Zap,
  Trophy,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  FileText,
} from "lucide-react";

const STAR_CONFIG = [
  {
    key: "situation" as const,
    label: "Situation",
    sub: "상황",
    icon: Eye,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-950",
    borderColor: "border-l-blue-500",
  },
  {
    key: "task" as const,
    label: "Task",
    sub: "과제",
    icon: Target,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950",
    borderColor: "border-l-amber-500",
  },
  {
    key: "action" as const,
    label: "Action",
    sub: "행동",
    icon: Zap,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950",
    borderColor: "border-l-emerald-500",
  },
  {
    key: "result" as const,
    label: "Result",
    sub: "결과",
    icon: Trophy,
    color: "text-purple-500 bg-purple-50 dark:bg-purple-950",
    borderColor: "border-l-purple-500",
  },
];

const PSI_CONFIG = [
  {
    key: "problem" as const,
    label: "Problem",
    sub: "문제",
    icon: AlertCircle,
    color: "text-red-500 bg-red-50 dark:bg-red-950",
    borderColor: "border-l-red-500",
  },
  {
    key: "solution" as const,
    label: "Solution",
    sub: "해결",
    icon: Lightbulb,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950",
    borderColor: "border-l-amber-500",
  },
  {
    key: "impact" as const,
    label: "Impact",
    sub: "결과",
    icon: TrendingUp,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950",
    borderColor: "border-l-emerald-500",
  },
];

export default function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: experience, isLoading } = useExperience(id);

  const experienceFormat = experience?.format ?? "STAR";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!experience) return <div>경험을 찾을 수 없습니다.</div>;

  return (
    <div className="space-y-8">
      <PageHeader title={experience.title} />

      {/* Info Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: User,
            label: "사용자",
            value: experience.user_name || experience.user_email || "-",
            color: "text-blue-500 bg-blue-50 dark:bg-blue-950",
          },
          {
            icon: Briefcase,
            label: "유형",
            value: experience.experience_type,
            color: "text-purple-500 bg-purple-50 dark:bg-purple-950",
          },
          {
            icon: Layers,
            label: "역량",
            value: experience.category,
            color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950",
          },
          {
            icon: CalendarDays,
            label: "기간",
            value: `${experience.start_date} ~ ${experience.end_date}`,
            color: "text-amber-500 bg-amber-50 dark:bg-amber-950",
          },
        ].map((item) => (
          <Card key={item.label} className="rounded-2xl border-0 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="truncate text-sm font-semibold">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Format Badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">작성 형식:</span>
        <Badge
          variant="outline"
          className={`rounded-full text-xs px-3 ${
            experienceFormat === "STAR"
              ? "border-blue-300 text-blue-600 bg-blue-50 dark:bg-blue-950"
              : experienceFormat === "PSI"
              ? "border-red-300 text-red-600 bg-red-50 dark:bg-red-950"
              : "border-gray-300 text-gray-600"
          }`}
        >
          {experienceFormat}
        </Badge>
      </div>

      {/* Tags */}
      {experience.tags && (
        <div className="flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex flex-wrap gap-1.5">
            {experience.tags.split(",").map((tag) => (
              <Badge
                key={tag.trim()}
                variant="secondary"
                className="rounded-full text-xs"
              >
                {tag.trim()}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Format Content */}
      {experienceFormat === "STAR" && (
        <div>
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">STAR 분석</h3>
          <div className="space-y-3">
            {STAR_CONFIG.map((item) => (
              <Card key={item.key} className={`rounded-2xl border-0 border-l-4 shadow-sm ${item.borderColor}`}>
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.color}`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold">{item.label}</span>
                      <span className="ml-1.5 text-xs text-muted-foreground">{item.sub}</span>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {experience[item.key] || "-"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {experienceFormat === "PSI" && (
        <div>
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">PSI 분석</h3>
          <div className="space-y-3">
            {PSI_CONFIG.map((item) => (
              <Card key={item.key} className={`rounded-2xl border-0 border-l-4 shadow-sm ${item.borderColor}`}>
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.color}`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold">{item.label}</span>
                      <span className="ml-1.5 text-xs text-muted-foreground">{item.sub}</span>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {experience[item.key] || "-"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {experienceFormat === "FREE" && (
        <div>
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">자유 양식</h3>
          <Card className="rounded-2xl border-0 border-l-4 border-l-gray-400 shadow-sm">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 bg-gray-50 dark:bg-gray-900">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold">내용</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {experience.content || "-"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
