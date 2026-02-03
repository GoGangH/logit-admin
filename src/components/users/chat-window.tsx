"use client";

import { ChatMessagePanel } from "./chat-message-panel";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ChatWindowProps {
  userId: string;
  questionId: string;
  title: string;
  subtitle: string;
  onClose: () => void;
}

export function ChatWindow({
  userId,
  questionId,
  title,
  subtitle,
  onClose,
}: ChatWindowProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-primary px-4 py-3">
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/20">
          <Image
            src="/logo_symbol_3d.svg"
            alt="Logit AI"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary-foreground truncate">
            {title}
          </p>
          <p className="text-[11px] text-primary-foreground/70 truncate">
            {subtitle}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 rounded-full text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ChatMessagePanel userId={userId} questionId={questionId} />
    </div>
  );
}
