"use client";

import { useState } from "react";
import { useUsers, useToggleUserActive, useDeleteUser } from "@/hooks/use-users";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  oauth_provider: string | null;
  is_active: boolean;
  created_at: string;
  _count: { projects: number; chats: number };
};

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isActive, setIsActive] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useUsers({ page, search, isActive });
  const toggleActive = useToggleUserActive();
  const deleteUser = useDeleteUser();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: "email",
      header: "이메일",
      size: 240,
      cell: ({ row }) => (
        <Link
          href={`/users/${row.original.id}`}
          className="font-medium text-primary hover:underline truncate block"
        >
          {row.original.email}
        </Link>
      ),
    },
    {
      accessorKey: "full_name",
      header: "이름",
      size: 120,
      cell: ({ row }) => (
        <span className="truncate block">{row.original.full_name || "-"}</span>
      ),
    },
    {
      accessorKey: "oauth_provider",
      header: "가입 경로",
      size: 100,
      cell: ({ row }) => row.original.oauth_provider || "-",
    },
    {
      accessorKey: "is_active",
      header: "상태",
      size: 80,
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? "활성" : "정지"}
        </Badge>
      ),
    },
    {
      accessorKey: "_count.projects",
      header: "프로젝트",
      size: 80,
      cell: ({ row }) => row.original._count.projects,
    },
    {
      accessorKey: "created_at",
      header: "가입일",
      size: 110,
      cell: ({ row }) => format(new Date(row.original.created_at), "yyyy-MM-dd"),
    },
    {
      id: "actions",
      size: 50,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/users/${row.original.id}`}>상세 보기</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                toggleActive.mutate(
                  {
                    id: row.original.id,
                    is_active: !row.original.is_active,
                  },
                  {
                    onSuccess: () =>
                      toast.success(
                        row.original.is_active
                          ? "사용자를 정지했습니다."
                          : "사용자를 활성화했습니다."
                      ),
                  }
                );
              }}
            >
              {row.original.is_active ? "정지" : "활성화"}
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
      <PageHeader title="사용자 관리" description="전체 사용자 목록" />

      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="이메일 또는 이름으로 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </form>
        <Select
          value={isActive}
          onValueChange={(v) => {
            setIsActive(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="true">활성</SelectItem>
            <SelectItem value="false">정지</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-[400px]" />
      ) : (
        <DataTable
          columns={columns}
          data={(data?.data as unknown as UserRow[]) ?? []}
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
        title="사용자 삭제"
        description="이 사용자의 모든 프로젝트, 질문, 채팅, 경험이 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        variant="destructive"
        loading={deleteUser.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteUser.mutate(deleteTarget, {
              onSuccess: () => {
                toast.success("사용자를 삭제했습니다.");
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
