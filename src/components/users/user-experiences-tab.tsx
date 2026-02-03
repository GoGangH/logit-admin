"use client";

import { useState, useMemo } from "react";
import { useUserExperiences } from "@/hooks/use-users";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CardPagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Trash2, CheckSquare, Square, MinusSquare } from "lucide-react";
import { toast } from "sonner";

type DeleteAction = {
  ids: string[] | null;
  label: string;
};

export function UserExperiencesTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserExperiences({ userId, page });
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteAction, setDeleteAction] = useState<DeleteAction | null>(null);
  const [deleting, setDeleting] = useState(false);

  const experiences = data?.data ?? [];

  const selectState = useMemo(() => {
    if (selected.size === 0) return "none" as const;
    if (selected.size === experiences.length) return "all" as const;
    return "partial" as const;
  }, [selected.size, experiences.length]);

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
      setSelected(new Set(experiences.map((e) => e.id)));
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
      const res = await fetch(`/api/users/${userId}/experiences`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: deleteAction.ids }),
      });
      if (!res.ok) throw new Error();

      toast.success(`${deleteAction.label} 완료`);
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ["users", userId, "experiences"] });
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
      {experiences.length > 0 && (
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
                    label: `경험 ${selected.size}개 삭제`,
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
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">
            경험이 없습니다.
          </CardContent>
        </Card>
      )}

      {experiences.map((exp) => (
        <Card
          key={exp.id}
          className={`rounded-2xl border-0 shadow-sm transition-all ${
            selected.has(exp.id)
              ? "ring-2 ring-primary shadow-md"
              : "hover:shadow-md"
          }`}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <button
              onClick={() => toggleItem(exp.id)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              {selected.has(exp.id) ? (
                <CheckSquare className="h-5 w-5 text-primary" />
              ) : (
                <Square className="h-5 w-5" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <Link
                href={`/experiences/${exp.id}`}
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
              >
                {exp.title}
              </Link>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Badge
                  variant="outline"
                  className="rounded-full text-[10px] px-2 py-0"
                >
                  {exp.experience_type}
                </Badge>
                <Badge
                  variant="secondary"
                  className="rounded-full text-[10px] px-2 py-0"
                >
                  {exp.category}
                </Badge>
              </div>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {exp.start_date} ~ {exp.end_date}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
              onClick={() =>
                setDeleteAction({
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
            ? "이 사용자의 모든 경험이 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
            : "선택한 항목이 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
        }
        confirmLabel="삭제"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
