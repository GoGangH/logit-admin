import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type {
  PaginatedResponse,
  CursorPaginatedResponse,
  ChatQuestion,
  ChatMessage,
} from "@/types";

export function useUserChatQuestions({
  userId,
  page = 1,
  pageSize = 20,
}: {
  userId: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery<PaginatedResponse<ChatQuestion>>({
    queryKey: ["users", userId, "chats", { page, pageSize }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      const res = await fetch(`/api/users/${userId}/chats?${params}`);
      if (!res.ok) throw new Error("Failed to fetch chat questions");
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useQuestionChats({
  userId,
  questionId,
  limit = 30,
}: {
  userId: string;
  questionId: string;
  limit?: number;
}) {
  return useInfiniteQuery<CursorPaginatedResponse<ChatMessage>>({
    queryKey: ["users", userId, "chats", questionId, { limit }],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        questionId,
        limit: String(limit),
      });
      if (pageParam) params.set("cursor", pageParam as string);
      const res = await fetch(`/api/users/${userId}/chats?${params}`);
      if (!res.ok) throw new Error("Failed to fetch chat messages");
      return res.json();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!userId && !!questionId,
  });
}
