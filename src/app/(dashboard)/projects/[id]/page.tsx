"use client";

import { use, useState } from "react";
import { useProject, useUpdateProject } from "@/hooks/use-projects";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  Pencil,
  Building2,
  Briefcase,
  User,
  CalendarDays,
  FileText,
  Star,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: project, isLoading } = useProject(id);
  const updateProject = useUpdateProject();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    company: "",
    job_position: "",
    recruit_notice: "",
    company_talent: "",
    due_date: "",
  });

  const openEdit = () => {
    if (!project) return;
    setForm({
      company: project.company,
      job_position: project.job_position,
      recruit_notice: project.recruit_notice,
      company_talent: project.company_talent || "",
      due_date: project.due_date
        ? format(new Date(project.due_date), "yyyy-MM-dd")
        : "",
    });
    setEditing(true);
  };

  const handleSave = () => {
    updateProject.mutate(
      { id, ...form, due_date: form.due_date || null },
      {
        onSuccess: () => {
          toast.success("프로젝트를 수정했습니다.");
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
        <Skeleton className="h-[300px] rounded-2xl" />
      </div>
    );
  }

  if (!project) return <div>프로젝트를 찾을 수 없습니다.</div>;

  return (
    <div className="space-y-8">
      <PageHeader title={`${project.company} - ${project.job_position}`}>
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
            icon: Building2,
            label: "회사",
            value: project.company,
            color: "text-blue-500 bg-blue-50 dark:bg-blue-950",
          },
          {
            icon: Briefcase,
            label: "직무",
            value: project.job_position,
            color: "text-purple-500 bg-purple-50 dark:bg-purple-950",
          },
          {
            icon: User,
            label: "사용자",
            value: project.user.full_name || project.user.email,
            color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950",
          },
          {
            icon: CalendarDays,
            label: "마감일",
            value: project.due_date
              ? format(new Date(project.due_date), "yyyy-MM-dd")
              : "없음",
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

      {/* Recruit Notice */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">채용공고</h3>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {project.recruit_notice}
          </p>
        </CardContent>
      </Card>

      {project.company_talent && (
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">인재상</h3>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {project.company_talent}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">
            질문 목록
          </h3>
          <Badge variant="secondary" className="rounded-full text-xs">
            {project.questions.length}
          </Badge>
        </div>

        {project.questions.length === 0 ? (
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="py-12 text-center text-muted-foreground">
              질문이 없습니다.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {project.questions.map(
              (q: {
                id: string;
                order: number;
                question: string;
                max_length: number | null;
                answer: string | null;
              }) => (
                <Card key={q.id} className="rounded-2xl border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {q.order}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold leading-snug">
                          {q.question}
                        </p>
                        {q.max_length && (
                          <span className="text-xs text-muted-foreground">
                            최대 {q.max_length}자
                          </span>
                        )}
                      </div>
                    </div>
                    {q.answer ? (
                      <div className="ml-10 rounded-xl bg-muted/50 p-4">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                          {q.answer}
                        </p>
                      </div>
                    ) : (
                      <p className="ml-10 text-sm text-muted-foreground/60">
                        답변 없음
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>프로젝트 수정</DialogTitle>
            <DialogDescription>프로젝트 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  회사
                </Label>
                <Input
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  직무
                </Label>
                <Input
                  value={form.job_position}
                  onChange={(e) =>
                    setForm({ ...form, job_position: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                마감일
              </Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) =>
                  setForm({ ...form, due_date: e.target.value })
                }
                className="w-full rounded-xl sm:w-auto"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                채용공고
              </Label>
              <Textarea
                value={form.recruit_notice}
                onChange={(e) =>
                  setForm({ ...form, recruit_notice: e.target.value })
                }
                rows={5}
                className="rounded-xl resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                인재상
              </Label>
              <Textarea
                value={form.company_talent}
                onChange={(e) =>
                  setForm({ ...form, company_talent: e.target.value })
                }
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>
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
              disabled={updateProject.isPending}
              className="rounded-xl"
            >
              {updateProject.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
