"use client";

import { use } from "react";
import { useUser } from "@/hooks/use-users";
import { UserProjectsTab } from "@/components/users/user-projects-tab";
import { UserExperiencesTab } from "@/components/users/user-experiences-tab";
import { UserChatHistory } from "@/components/users/user-chat-history";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { MessageSquare, FolderKanban, BookOpen } from "lucide-react";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: user, isLoading } = useUser(id);

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
