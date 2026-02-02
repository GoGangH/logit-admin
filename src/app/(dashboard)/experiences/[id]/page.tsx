"use client";

import { use, useState } from "react";
import { useExperience, useUpdateExperience } from "@/hooks/use-experiences";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
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
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!experience) return <div>경험을 찾을 수 없습니다.</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={experience.title}>
        <Button variant="outline" size="sm" onClick={openEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          수정
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">경험 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">사용자</dt>
              <dd className="font-medium">
                {experience.user_name || experience.user_email || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">유형</dt>
              <dd>
                <Badge variant="outline">{experience.experience_type}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">역량</dt>
              <dd>
                <Badge variant="secondary">{experience.category}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">기간</dt>
              <dd className="font-medium">
                {experience.start_date} ~ {experience.end_date}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">태그</dt>
              <dd className="font-medium">{experience.tags}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">STAR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Situation (상황)", value: experience.situation },
            { label: "Task (과제)", value: experience.task },
            { label: "Action (행동)", value: experience.action },
            { label: "Result (결과)", value: experience.result },
          ].map((item) => (
            <div key={item.label}>
              <h4 className="mb-1 text-sm font-semibold text-muted-foreground">
                {item.label}
              </h4>
              <p className="whitespace-pre-wrap text-sm">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>경험 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>제목</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>유형</Label>
                <Select
                  value={form.experience_type}
                  onValueChange={(v) =>
                    setForm({ ...form, experience_type: v as ExperienceType })
                  }
                >
                  <SelectTrigger>
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
              <div>
                <Label>역량</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm({ ...form, category: v as ExperienceCategory })
                  }
                >
                  <SelectTrigger>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>시작일</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm({ ...form, start_date: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>종료일</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>태그</Label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>
            {(["situation", "task", "action", "result"] as const).map((key) => (
              <div key={key}>
                <Label>
                  {key === "situation"
                    ? "상황 (S)"
                    : key === "task"
                      ? "과제 (T)"
                      : key === "action"
                        ? "행동 (A)"
                        : "결과 (R)"}
                </Label>
                <Textarea
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  rows={3}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(false)}>
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateExperience.isPending}
            >
              {updateExperience.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
