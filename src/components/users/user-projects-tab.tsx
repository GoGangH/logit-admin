"use client";

import { useState, useMemo } from "react";
import { useUserProjects } from "@/hooks/use-users";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CardPagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Link from "next/link";
import { Trash2, CheckSquare, Square, MinusSquare } from "lucide-react";
import { toast } from "sonner";

type DeleteAction = {
  ids: string[] | null;
  label: string;
};

export function UserProjectsTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserProjects({ userId, page });
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteAction, setDeleteAction] = useState<DeleteAction | null>(null);
  const [deleting, setDeleting] = useState(false);

  const projects = data?.data ?? [];

  const selectState = useMemo(() => {
    if (selected.size === 0) return "none" as const;
    if (selected.size === projects.length) return "all" as const;
    return "partial" as const;
  }, [selected.size, projects.length]);

  const toggleItem = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectState === "all") {
      setSelected(new Set());
    } else {
      setSelected(new Set(projects.map((p) => p.id)));
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSelected(new Set());
  };

  const handleDelete = async () => {
    if (!deleteAction) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${userId}/projects`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: deleteAction.ids }),
      });
      if (!res.ok) throw new Error();

      toast.success(`${deleteAction.label} 완료`);
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ["users", userId, "projects"] });
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
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
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAll}
              className="gap-2 rounded-full"
            >
              <SelectIcon state={selectState} />
              전체 선택
            </Button>
            {selected.size > 0 && (
              <span className="text-xs text-muted-foreground">
                {selected.size}개 선택됨
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="rounded-full"
                onClick={() =>
                  setDeleteAction({
                    ids: [...selected],
                    label: `프로젝트 ${selected.size}개 삭제`,
                  })
                }
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                선택 삭제
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() =>
                setDeleteAction({
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
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">
            프로젝트가 없습니다.
          </CardContent>
        </Card>
      )}

      {projects.map((project) => (
        <Card
          key={project.id}
          className={`rounded-2xl border-0 shadow-sm transition-all ${
            selected.has(project.id)
              ? "ring-2 ring-primary shadow-md"
              : "hover:shadow-md"
          }`}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <button
              onClick={() => toggleItem(project.id)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              {selected.has(project.id) ? (
                <CheckSquare className="h-5 w-5 text-primary" />
              ) : (
                <Square className="h-5 w-5" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <Link
                href={`/projects/${project.id}`}
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
              >
                {project.company} — {project.job_position}
              </Link>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>질문 {project._count.questions}개</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                <span>
                  {project.due_date
                    ? `마감 ${format(new Date(project.due_date), "yyyy-MM-dd")}`
                    : "마감일 없음"}
                </span>
              </div>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {format(new Date(project.created_at), "yyyy-MM-dd")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
              onClick={() =>
                setDeleteAction({
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

      {data && (
        <CardPagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          onPageChange={handlePageChange}
        />
      )}

      <ConfirmDialog
        open={!!deleteAction}
        onOpenChange={() => setDeleteAction(null)}
        title={deleteAction?.label ?? "삭제"}
        description={
          deleteAction?.ids === null
            ? "이 사용자의 모든 프로젝트와 관련 질문, 채팅이 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
            : "선택한 항목이 삭제됩니다. 관련 질문과 채팅도 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
        }
        confirmLabel="삭제"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
