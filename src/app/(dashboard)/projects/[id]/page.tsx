"use client";

import { use, useState } from "react";
import { useProject, useUpdateProject } from "@/hooks/use-projects";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
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
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!project) return <div>프로젝트를 찾을 수 없습니다.</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={`${project.company} - ${project.job_position}`}>
        <Button variant="outline" size="sm" onClick={openEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          수정
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">프로젝트 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">회사</dt>
              <dd className="font-medium">{project.company}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">직무</dt>
              <dd className="font-medium">{project.job_position}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">사용자</dt>
              <dd className="font-medium">
                {project.user.full_name || project.user.email}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">마감일</dt>
              <dd className="font-medium">
                {project.due_date
                  ? format(new Date(project.due_date), "yyyy-MM-dd")
                  : "-"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">채용공고</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm">
                {project.recruit_notice}
              </dd>
            </div>
            {project.company_talent && (
              <div className="sm:col-span-2">
                <dt className="text-sm text-muted-foreground">인재상</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm">
                  {project.company_talent}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            질문 목록 ({project.questions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.questions.length === 0 && (
            <p className="py-4 text-center text-muted-foreground">
              질문이 없습니다.
            </p>
          )}
          {project.questions.map(
            (q: {
              id: string;
              order: number;
              question: string;
              max_length: number | null;
              answer: string | null;
            }) => (
              <div key={q.id} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">Q{q.order}</Badge>
                  <span className="font-medium">{q.question}</span>
                  {q.max_length && (
                    <span className="text-xs text-muted-foreground">
                      (최대 {q.max_length}자)
                    </span>
                  )}
                </div>
                {q.answer ? (
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {q.answer}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">답변 없음</p>
                )}
              </div>
            )
          )}
        </CardContent>
      </Card>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>프로젝트 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>회사</Label>
              <Input
                value={form.company}
                onChange={(e) =>
                  setForm({ ...form, company: e.target.value })
                }
              />
            </div>
            <div>
              <Label>직무</Label>
              <Input
                value={form.job_position}
                onChange={(e) =>
                  setForm({ ...form, job_position: e.target.value })
                }
              />
            </div>
            <div>
              <Label>마감일</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) =>
                  setForm({ ...form, due_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label>채용공고</Label>
              <Textarea
                value={form.recruit_notice}
                onChange={(e) =>
                  setForm({ ...form, recruit_notice: e.target.value })
                }
                rows={4}
              />
            </div>
            <div>
              <Label>인재상</Label>
              <Textarea
                value={form.company_talent}
                onChange={(e) =>
                  setForm({ ...form, company_talent: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(false)}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={updateProject.isPending}>
              {updateProject.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
