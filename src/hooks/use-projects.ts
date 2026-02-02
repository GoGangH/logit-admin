import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginatedResponse } from "@/types";
import type { Project, Question } from "@/generated/prisma/client";

interface UseProjectsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

type ProjectWithUser = Project & {
  user: { email: string; full_name: string | null };
  _count: { questions: number };
};

export function useProjects({ page = 1, pageSize = 20, search }: UseProjectsParams = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) params.set("search", search);

  return useQuery<PaginatedResponse<ProjectWithUser>>({
    queryKey: ["projects", { page, pageSize, search }],
    queryFn: async () => {
      const res = await fetch(`/api/projects?${params}`);
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });
}

export function useProject(id: string) {
  return useQuery<
    Project & {
      user: { email: string; full_name: string | null };
      questions: Question[];
    }
  >({
    queryKey: ["projects", id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: unknown }) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update project");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
