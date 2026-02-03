"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQuestionChats } from "@/hooks/use-chats";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

interface ChatMessagePanelProps {
  userId: string;
  questionId: string;
}

export function ChatMessagePanel({ userId, questionId }: ChatMessagePanelProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useQuestionChats({ userId, questionId });

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const initialLoadRef = useRef(true);

  // Flatten pages: each page is DESC, so reverse each page then concat
  const messages: ChatMessage[] = data
    ? data.pages
        .slice()
        .reverse()
        .flatMap((page) => page.data.slice().reverse())
    : [];

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!isLoading && initialLoadRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      initialLoadRef.current = false;
    }
  }, [isLoading, messages.length]);

  // Preserve scroll position when loading older messages
  useEffect(() => {
    if (!isFetchingNextPage && scrollRef.current && prevScrollHeightRef.current > 0) {
      const newScrollHeight = scrollRef.current.scrollHeight;
      const diff = newScrollHeight - prevScrollHeightRef.current;
      scrollRef.current.scrollTop += diff;
      prevScrollHeightRef.current = 0;
    }
  }, [isFetchingNextPage]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && scrollRef.current) {
      prevScrollHeightRef.current = scrollRef.current.scrollHeight;
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // IntersectionObserver on top sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = scrollRef.current;
    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { root: container, threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-12 rounded-2xl", i % 2 === 0 ? "w-3/4 self-start" : "w-2/3 self-end")}
          />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        채팅 메시지가 없습니다.
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
      {/* Top sentinel for loading older messages */}
      <div ref={sentinelRef} className="h-1" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-3">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      <div className="flex flex-col gap-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-2.5",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
              )}
            >
              {msg.role === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            <div className={cn("flex flex-col max-w-[75%]", msg.role === "user" ? "items-end" : "items-start")}>
              <span className="mb-1 text-[11px] font-medium text-muted-foreground">
                {msg.role === "user" ? "사용자" : "AI 어시스턴트"}
              </span>
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                )}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
