import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExperienceWithUser, PaginatedResponse } from "@/types";

interface UseExperiencesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  category?: string;
}

export function useExperiences({
  page = 1,
  pageSize = 20,
  search,
  type,
  category,
}: UseExperiencesParams = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) params.set("search", search);
  if (type) params.set("type", type);
  if (category) params.set("category", category);

  return useQuery<PaginatedResponse<ExperienceWithUser>>({
    queryKey: ["experiences", { page, pageSize, search, type, category }],
    queryFn: async () => {
      const res = await fetch(`/api/experiences?${params}`);
      if (!res.ok) throw new Error("Failed to fetch experiences");
      return res.json();
    },
  });
}

export function useExperience(id: string) {
  return useQuery<ExperienceWithUser>({
    queryKey: ["experiences", id],
    queryFn: async () => {
      const res = await fetch(`/api/experiences/${id}`);
      if (!res.ok) throw new Error("Failed to fetch experience");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useDeleteExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/experiences/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete experience");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["experiences"] });
    },
  });
}
