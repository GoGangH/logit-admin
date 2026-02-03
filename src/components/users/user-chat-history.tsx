"use client";

import { useState } from "react";
import { useUserChatQuestions } from "@/hooks/use-chats";
import { ChatWindow } from "./chat-window";
import { CardPagination } from "@/components/shared/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";
import type { ChatQuestion } from "@/types";

export function UserChatHistory({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserChatQuestions({ userId, page });
  const [activeQuestion, setActiveQuestion] = useState<ChatQuestion | null>(null);

  const questions = data?.data ?? [];

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
      {questions.length === 0 && (
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">
            채팅 기록이 없습니다.
          </CardContent>
        </Card>
      )}

      {questions.map((q) => (
        <Card
          key={q.question_id}
          className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
          onClick={() => setActiveQuestion(q)}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-500 dark:bg-sky-950">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{q.question}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">
                  {q.project_company} — {q.project_job_position}
                </span>
                <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground/30" />
                <span className="shrink-0">Q{q.question_order}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Badge variant="secondary" className="rounded-full text-[10px] px-2">
                {q.chat_count}건
              </Badge>
              {q.last_chat_at && (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(q.last_chat_at), "yyyy-MM-dd HH:mm")}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {data && (
        <CardPagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          onPageChange={setPage}
        />
      )}

      {activeQuestion && (
        <ChatWindow
          userId={userId}
          questionId={activeQuestion.question_id}
          title={activeQuestion.question}
          subtitle={`${activeQuestion.project_company} — ${activeQuestion.project_job_position}`}
          onClose={() => setActiveQuestion(null)}
        />
      )}
    </div>
  );
}
