"use client";

import { useState } from "react";
import { useUserChatQuestions } from "@/hooks/use-chats";
import { ChatMessagePanel } from "./chat-message-panel";
import { CardPagination } from "@/components/shared/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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

      <Sheet
        open={!!activeQuestion}
        onOpenChange={(open) => {
          if (!open) setActiveQuestion(null);
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
          <SheetHeader className="px-4 pt-4 pb-2 border-b shrink-0">
            <SheetTitle className="text-sm truncate pr-8">
              {activeQuestion?.question}
            </SheetTitle>
            <SheetDescription className="text-xs truncate">
              {activeQuestion?.project_company} — {activeQuestion?.project_job_position}
            </SheetDescription>
          </SheetHeader>
          {activeQuestion && (
            <ChatMessagePanel
              userId={userId}
              questionId={activeQuestion.question_id}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
