import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginatedResponse, Experience } from "@/types";
import type { User } from "@/generated/prisma/client";

type ProjectItem = {
  id: string;
  company: string;
  job_position: string;
  due_date: string | null;
  created_at: string;
  _count: { questions: number };
};

interface UseUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: string;
}

export function useUsers({ page = 1, pageSize = 20, search, isActive }: UseUsersParams = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) params.set("search", search);
  if (isActive) params.set("isActive", isActive);

  return useQuery<PaginatedResponse<User & { _count: { projects: number; chats: number } }>>({
    queryKey: ["users", { page, pageSize, search, isActive }],
    queryFn: async () => {
      const res = await fetch(`/api/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUserProjects({
  userId,
  page = 1,
  pageSize = 10,
}: {
  userId: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery<PaginatedResponse<ProjectItem>>({
    queryKey: ["users", userId, "projects", { page, pageSize }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      const res = await fetch(`/api/users/${userId}/projects?${params}`);
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useUserExperiences({
  userId,
  page = 1,
  pageSize = 10,
}: {
  userId: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery<PaginatedResponse<Experience>>({
    queryKey: ["users", userId, "experiences", { page, pageSize }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      const res = await fetch(`/api/users/${userId}/experiences?${params}`);
      if (!res.ok) throw new Error("Failed to fetch experiences");
      return res.json();
    },
    enabled: !!userId,
  });
}
