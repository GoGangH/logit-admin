"use client";

import { useState } from "react";
import { useExperiences, useDeleteExperience } from "@/hooks/use-experiences";
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
import Link from "next/link";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExperienceWithUser } from "@/types";

const EXPERIENCE_TYPES = [
  "아르바이트", "인턴", "정규직", "계약직", "봉사 활동",
  "수상경력", "동아리 활동", "연구 활동", "군복무", "개인 활동",
];

const EXPERIENCE_CATEGORIES = [
  "고객 가치 지향", "기술적 전문성", "협력적 소통", "주도적 실행력",
  "논리적 분석력", "창의적 문제해결", "유연한 적응력", "끈기있는 책임감",
];

export default function ExperiencesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useExperiences({ page, search, type, category });
  const deleteExperience = useDeleteExperience();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const columns: ColumnDef<ExperienceWithUser>[] = [
    {
      accessorKey: "title",
      header: "제목",
      size: 200,
      cell: ({ row }) => (
        <Link
          href={`/experiences/${row.original.id}`}
          className="font-medium text-primary hover:underline truncate block"
        >
          {row.original.title}
        </Link>
      ),
    },
    {
      accessorKey: "user_email",
      header: "사용자",
      size: 200,
      cell: ({ row }) => (
        <span className="text-sm truncate block">{row.original.user_email || "-"}</span>
      ),
    },
    {
      accessorKey: "experience_type",
      header: "유형",
      size: 110,
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.experience_type}</Badge>
      ),
    },
    {
      accessorKey: "category",
      header: "역량",
      size: 130,
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.category}</Badge>
      ),
    },
    {
      accessorKey: "tags",
      header: "태그",
      size: 150,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground truncate block">
          {row.original.tags}
        </span>
      ),
    },
    {
      accessorKey: "start_date",
      header: "기간",
      size: 170,
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.start_date} ~ {row.original.end_date}
        </span>
      ),
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
              <Link href={`/experiences/${row.original.id}`}>상세 보기</Link>
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
      <PageHeader title="경험 관리" description="전체 경험 목록 (Qdrant)" />

      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="제목 또는 사용자 이메일로 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </form>
        <Select
          value={type}
          onValueChange={(v) => {
            setType(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="유형 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {EXPERIENCE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="역량 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {EXPERIENCE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-[400px]" />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
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
        title="경험 삭제"
        description="이 경험을 영구 삭제하시겠습니까? 벡터 데이터도 함께 삭제됩니다."
        confirmLabel="삭제"
        variant="destructive"
        loading={deleteExperience.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteExperience.mutate(deleteTarget, {
              onSuccess: () => {
                toast.success("경험을 삭제했습니다.");
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
