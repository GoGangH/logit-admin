"use client";

import { use, useState, useMemo } from "react";
import { useUser } from "@/hooks/use-users";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Link from "next/link";
import { Trash2, CheckSquare, Square, MinusSquare } from "lucide-react";
import { toast } from "sonner";
import type { Experience } from "@/types";

type ProjectItem = {
  id: string;
  company: string;
  job_position: string;
  due_date: string | null;
  created_at: string;
  _count: { questions: number };
};

type DeleteAction = {
  type: "projects" | "experiences";
  ids: string[] | null; // null = 전체 삭제
  label: string;
};

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: user, isLoading } = useUser(id);
  const queryClient = useQueryClient();

  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(
    new Set()
  );
  const [selectedExperiences, setSelectedExperiences] = useState<Set<string>>(
    new Set()
  );
  const [deleteAction, setDeleteAction] = useState<DeleteAction | null>(null);
  const [deleting, setDeleting] = useState(false);

  const projects: ProjectItem[] = user?.projects ?? [];
  const experiences: Experience[] = user?.experiences ?? [];

  const projectSelectState = useMemo(() => {
    if (selectedProjects.size === 0) return "none";
    if (selectedProjects.size === projects.length) return "all";
    return "partial";
  }, [selectedProjects.size, projects.length]);

  const experienceSelectState = useMemo(() => {
    if (selectedExperiences.size === 0) return "none";
    if (selectedExperiences.size === experiences.length) return "all";
    return "partial";
  }, [selectedExperiences.size, experiences.length]);

  const toggleProject = (id: string) => {
    setSelectedProjects((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllProjects = () => {
    if (projectSelectState === "all") {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(projects.map((p) => p.id)));
    }
  };

  const toggleExperience = (id: string) => {
    setSelectedExperiences((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllExperiences = () => {
    if (experienceSelectState === "all") {
      setSelectedExperiences(new Set());
    } else {
      setSelectedExperiences(new Set(experiences.map((e) => e.id)));
    }
  };

  const handleDelete = async () => {
    if (!deleteAction) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/users/${id}/${deleteAction.type}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ids: deleteAction.ids,
          }),
        }
      );
      if (!res.ok) throw new Error();

      toast.success(`${deleteAction.label} 완료`);
      if (deleteAction.type === "projects") setSelectedProjects(new Set());
      else setSelectedExperiences(new Set());
      queryClient.invalidateQueries({ queryKey: ["users", id] });
    } catch {
      toast.error("삭제에 실패했습니다.");
    } finally {
      setDeleting(false);
      setDeleteAction(null);
    }
  };

  const SelectIcon = ({ state }: { state: "none" | "partial" | "all" }) => {
    if (state === "all") return <CheckSquare className="h-4 w-4" />;
    if (state === "partial") return <MinusSquare className="h-4 w-4" />;
    return <Square className="h-4 w-4" />;
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

  if (!user) return <div>사용자를 찾을 수 없습니다.</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={user.full_name || user.email} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">사용자 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">이메일</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">이름</dt>
              <dd className="font-medium">{user.full_name || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">상태</dt>
              <dd>
                <Badge variant={user.is_active ? "default" : "secondary"}>
                  {user.is_active ? "활성" : "정지"}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">가입 경로</dt>
              <dd className="font-medium">{user.oauth_provider || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">가입일</dt>
              <dd className="font-medium">
                {format(new Date(user.created_at), "yyyy-MM-dd HH:mm")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">채팅 수</dt>
              <dd className="font-medium">{user._count?.chats ?? 0}건</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">
            프로젝트 ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="experiences">
            경험 ({experiences.length})
          </TabsTrigger>
        </TabsList>

        {/* === 프로젝트 탭 === */}
        <TabsContent value="projects" className="space-y-3">
          {projects.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAllProjects}
                  className="gap-2"
                >
                  <SelectIcon state={projectSelectState} />
                  전체 선택
                </Button>
                {selectedProjects.size > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {selectedProjects.size}개 선택됨
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedProjects.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setDeleteAction({
                        type: "projects",
                        ids: [...selectedProjects],
                        label: `프로젝트 ${selectedProjects.size}개 삭제`,
                      })
                    }
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    선택 삭제 ({selectedProjects.size})
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() =>
                    setDeleteAction({
                      type: "projects",
                      ids: null,
                      label: "전체 프로젝트 삭제",
                    })
                  }
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  전체 삭제
                </Button>
              </div>
            </div>
          )}

          {projects.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              프로젝트가 없습니다.
            </p>
          )}

          {projects.map((project) => (
            <Card
              key={project.id}
              className={
                selectedProjects.has(project.id)
                  ? "ring-2 ring-primary"
                  : ""
              }
            >
              <CardContent className="flex items-center gap-3 py-4">
                <button
                  onClick={() => toggleProject(project.id)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  {selectedProjects.has(project.id) ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/projects/${project.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {project.company} - {project.job_position}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    질문 {project._count.questions}개 |{" "}
                    {project.due_date
                      ? `마감 ${format(new Date(project.due_date), "yyyy-MM-dd")}`
                      : "마감일 없음"}
                  </p>
                </div>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {format(new Date(project.created_at), "yyyy-MM-dd")}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    setDeleteAction({
                      type: "projects",
                      ids: [project.id],
                      label: `"${project.company}" 프로젝트 삭제`,
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* === 경험 탭 === */}
        <TabsContent value="experiences" className="space-y-3">
          {experiences.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAllExperiences}
                  className="gap-2"
                >
                  <SelectIcon state={experienceSelectState} />
                  전체 선택
                </Button>
                {selectedExperiences.size > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {selectedExperiences.size}개 선택됨
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedExperiences.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setDeleteAction({
                        type: "experiences",
                        ids: [...selectedExperiences],
                        label: `경험 ${selectedExperiences.size}개 삭제`,
                      })
                    }
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    선택 삭제 ({selectedExperiences.size})
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() =>
                    setDeleteAction({
                      type: "experiences",
                      ids: null,
                      label: "전체 경험 삭제",
                    })
                  }
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  전체 삭제
                </Button>
              </div>
            </div>
          )}

          {experiences.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              경험이 없습니다.
            </p>
          )}

          {experiences.map((exp) => (
            <Card
              key={exp.id}
              className={
                selectedExperiences.has(exp.id)
                  ? "ring-2 ring-primary"
                  : ""
              }
            >
              <CardContent className="flex items-center gap-3 py-4">
                <button
                  onClick={() => toggleExperience(exp.id)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  {selectedExperiences.has(exp.id) ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/experiences/${exp.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {exp.title}
                  </Link>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="outline">{exp.experience_type}</Badge>
                    <Badge variant="secondary">{exp.category}</Badge>
                  </div>
                </div>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {exp.start_date} ~ {exp.end_date}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    setDeleteAction({
                      type: "experiences",
                      ids: [exp.id],
                      label: `"${exp.title}" 경험 삭제`,
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!deleteAction}
        onOpenChange={() => setDeleteAction(null)}
        title={deleteAction?.label ?? "삭제"}
        description={
          deleteAction?.ids === null
            ? `이 사용자의 ${deleteAction?.type === "projects" ? "모든 프로젝트와 관련 질문, 채팅이" : "모든 경험이"} 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`
            : `선택한 항목이 삭제됩니다. ${deleteAction?.type === "projects" ? "관련 질문과 채팅도 함께 삭제됩니다. " : ""}이 작업은 되돌릴 수 없습니다.`
        }
        confirmLabel="삭제"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
