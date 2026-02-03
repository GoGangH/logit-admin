"use client";

import { use, useState } from "react";
import { useExperience, useUpdateExperience } from "@/hooks/use-experiences";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pencil,
  User,
  Briefcase,
  Tag,
  CalendarDays,
  Layers,
  Eye,
  Target,
  Zap,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import type { ExperienceType, ExperienceCategory } from "@/types";

const EXPERIENCE_TYPES: ExperienceType[] = [
  "아르바이트", "인턴", "정규직", "계약직", "봉사 활동",
  "수상경력", "동아리 활동", "연구 활동", "군복무", "개인 활동",
];

const EXPERIENCE_CATEGORIES: ExperienceCategory[] = [
  "고객 가치 지향", "기술적 전문성", "협력적 소통", "주도적 실행력",
  "논리적 분석력", "창의적 문제해결", "유연한 적응력", "끈기있는 책임감",
];

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

export default function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: experience, isLoading } = useExperience(id);
  const updateExperience = useUpdateExperience();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    experience_type: "" as ExperienceType,
    category: "" as ExperienceCategory,
    start_date: "",
    end_date: "",
    situation: "",
    task: "",
    action: "",
    result: "",
    tags: "",
  });

  const openEdit = () => {
    if (!experience) return;
    setForm({
      title: experience.title,
      experience_type: experience.experience_type,
      category: experience.category,
      start_date: experience.start_date,
      end_date: experience.end_date,
      situation: experience.situation,
      task: experience.task,
      action: experience.action,
      result: experience.result,
      tags: experience.tags,
    });
    setEditing(true);
  };

  const handleSave = () => {
    updateExperience.mutate(
      { id, ...form },
      {
        onSuccess: () => {
          toast.success("경험을 수정했습니다.");
          setEditing(false);
        },
        onError: () => toast.error("수정에 실패했습니다."),
      }
    );
  };

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
      <PageHeader title={experience.title}>
        <Button
          variant="outline"
          size="sm"
          onClick={openEdit}
          className="rounded-full px-4"
        >
          <Pencil className="mr-2 h-3.5 w-3.5" />
          수정
        </Button>
      </PageHeader>

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

      {/* STAR */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
          STAR 분석
        </h3>
        <div className="space-y-3">
          {STAR_CONFIG.map((item) => (
            <Card
              key={item.key}
              className={`rounded-2xl border-0 border-l-4 shadow-sm ${item.borderColor}`}
            >
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.color}`}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold">{item.label}</span>
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {item.sub}
                    </span>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {experience[item.key]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>경험 수정</DialogTitle>
            <DialogDescription>경험 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                제목
              </Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  유형
                </Label>
                <Select
                  value={form.experience_type}
                  onValueChange={(v) =>
                    setForm({ ...form, experience_type: v as ExperienceType })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  역량
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm({ ...form, category: v as ExperienceCategory })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  시작일
                </Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm({ ...form, start_date: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  종료일
                </Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                태그
              </Label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="쉼표로 구분"
                className="rounded-xl"
              />
            </div>
            {STAR_CONFIG.map((item) => (
              <div key={item.key} className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded ${item.color}`}
                  >
                    <item.icon className="h-3 w-3" />
                  </span>
                  {item.label} ({item.sub})
                </Label>
                <Textarea
                  value={form[item.key]}
                  onChange={(e) =>
                    setForm({ ...form, [item.key]: e.target.value })
                  }
                  rows={3}
                  className="rounded-xl resize-none"
                />
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setEditing(false)}
              className="rounded-xl"
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateExperience.isPending}
              className="rounded-xl"
            >
              {updateExperience.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
