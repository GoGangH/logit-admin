"use client";

import { use } from "react";
import { useUser, useUserSubscriptions } from "@/hooks/use-users";
import { UserProjectsTab } from "@/components/users/user-projects-tab";
import { UserExperiencesTab } from "@/components/users/user-experiences-tab";
import { UserChatHistory } from "@/components/users/user-chat-history";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { MessageSquare, FolderKanban, BookOpen, Copy, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: user, isLoading } = useUser(id);
  const { data: subscriptionData } = useUserSubscriptions(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    );
  }

  if (!user) return <div>사용자를 찾을 수 없습니다.</div>;

  const initial = (user.full_name || user.email)[0].toUpperCase();
  const projectCount = user._count?.projects ?? 0;
  const experienceCount = user.experienceCount ?? 0;
  const subscriptions = subscriptionData?.data ?? [];
  const mcpSub = subscriptions.find((s) => s.type === "mcp");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("클립보드에 복사되었습니다.");
  };

  return (
    <div className="space-y-8">
      {/* Profile */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-xl font-bold text-primary-foreground">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight truncate">
                  {user.full_name || user.email}
                </h1>
                <Badge
                  variant={user.is_active ? "default" : "secondary"}
                  className="rounded-full shrink-0"
                >
                  {user.is_active ? "활성" : "정지"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <button
                onClick={() => copyToClipboard(user.id)}
                className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground/60 hover:text-muted-foreground transition-colors group"
              >
                <span className="truncate">{user.id}</span>
                <Copy className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4 border-t pt-5">
            {[
              { label: "가입 경로", value: user.oauth_provider || "-" },
              { label: "가입일", value: format(new Date(user.created_at), "yyyy-MM-dd") },
              { label: "프로젝트", value: `${projectCount}개` },
              { label: "채팅", value: `${user._count?.chats ?? 0}건` },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-0.5 text-sm font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MCP Subscription */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader className="pb-3 pt-5 px-6">
          <CardTitle className="text-sm font-semibold">MCP 구독 정보</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          {!mcpSub ? (
            <p className="text-sm text-muted-foreground">구독 정보가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
              {[
                {
                  label: "상태",
                  value: (
                    <span className="flex items-center gap-1">
                      {mcpSub.is_active ? (
                        <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /><span className="text-emerald-600 font-semibold">활성</span></>
                      ) : (
                        <><XCircle className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">비활성</span></>
                      )}
                    </span>
                  ),
                },
                {
                  label: "플랜",
                  value: (
                    <Badge variant="outline" className="rounded-full text-[10px] px-2 py-0">
                      {mcpSub.plan === "free_trial" ? "무료 체험" : mcpSub.plan === "basic" ? "베이직" : "프로"}
                    </Badge>
                  ),
                },
                {
                  label: "시작일",
                  value: mcpSub.started_at
                    ? format(new Date(mcpSub.started_at), "yyyy-MM-dd")
                    : "-",
                },
                {
                  label: "만료일",
                  value: mcpSub.expires_at ? (
                    <span className={`flex items-center gap-1 ${new Date(mcpSub.expires_at) < new Date() ? "text-destructive" : ""}`}>
                      <Clock className="h-3 w-3" />
                      {format(new Date(mcpSub.expires_at), "yyyy-MM-dd")}
                    </span>
                  ) : "-",
                },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <div className="mt-0.5 text-sm font-semibold">{item.value}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="projects">
        <TabsList className="rounded-full bg-muted/60 p-1">
          <TabsTrigger value="projects" className="rounded-full gap-1.5">
            <FolderKanban className="h-3.5 w-3.5" />
            프로젝트
            <Badge variant="secondary" className="ml-1 rounded-full h-5 px-1.5 text-[10px]">
              {projectCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="experiences" className="rounded-full gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            경험
            <Badge variant="secondary" className="ml-1 rounded-full h-5 px-1.5 text-[10px]">
              {experienceCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="chats" className="rounded-full gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            채팅 기록
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-4">
          <UserProjectsTab userId={id} />
        </TabsContent>

        <TabsContent value="experiences" className="mt-4">
          <UserExperiencesTab userId={id} />
        </TabsContent>

        <TabsContent value="chats" className="mt-4">
          <UserChatHistory userId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
