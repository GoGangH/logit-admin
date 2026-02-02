"use client";

import { useState } from "react";
import { useProjects, useDeleteProject } from "@/hooks/use-projects";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Search } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type ProjectRow = {
  id: string;
  company: string;
  job_position: string;
  due_date: string | null;
  created_at: string;
  user: { email: string; full_name: string | null };
  _count: { questions: number };
};

export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useProjects({ page, search });
  const deleteProject = useDeleteProject();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const columns: ColumnDef<ProjectRow>[] = [
    {
      accessorKey: "company",
      header: "회사",
      cell: ({ row }) => (
        <Link
          href={`/projects/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.original.company}
        </Link>
      ),
    },
    { accessorKey: "job_position", header: "직무" },
    {
      accessorKey: "user.email",
      header: "사용자",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.user.email}</span>
      ),
    },
    {
      accessorKey: "_count.questions",
      header: "질문 수",
      cell: ({ row }) => row.original._count.questions,
    },
    {
      accessorKey: "due_date",
      header: "마감일",
      cell: ({ row }) =>
        row.original.due_date
          ? format(new Date(row.original.due_date), "yyyy-MM-dd")
          : "-",
    },
    {
      accessorKey: "created_at",
      header: "생성일",
      cell: ({ row }) =>
        format(new Date(row.original.created_at), "yyyy-MM-dd"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/projects/${row.original.id}`}>상세 보기</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteTarget(row.original.id)}
            >
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="프로젝트 관리" description="전체 프로젝트 목록" />

      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="회사, 직무, 사용자 이메일로 검색..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-8"
        />
      </form>

      {isLoading ? (
        <Skeleton className="h-[400px]" />
      ) : (
        <DataTable
          columns={columns}
          data={(data?.data as unknown as ProjectRow[]) ?? []}
          manualPagination
          page={page}
          pageSize={20}
          pageCount={data?.totalPages ?? 1}
          totalCount={data?.total}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="프로젝트 삭제"
        description="이 프로젝트를 삭제하시겠습니까? (소프트 삭제)"
        confirmLabel="삭제"
        variant="destructive"
        loading={deleteProject.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteProject.mutate(deleteTarget, {
              onSuccess: () => {
                toast.success("프로젝트를 삭제했습니다.");
                setDeleteTarget(null);
              },
              onError: () => toast.error("삭제에 실패했습니다."),
            });
          }
        }}
      />
    </div>
  );
}
