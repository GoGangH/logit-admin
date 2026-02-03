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
import {
  Mail,
  User,
  Globe,
  CalendarDays,
  MessageSquare,
  FolderKanban,
  BookOpen,
} from "lucide-react";

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
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
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
      {/* Profile Header */}
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

      {/* Info Cards */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          {
            icon: Mail,
            label: "이메일",
            value: user.email,
            color: "text-blue-500 bg-blue-50 dark:bg-blue-950",
          },
          {
            icon: User,
            label: "이름",
            value: user.full_name || "-",
            color: "text-purple-500 bg-purple-50 dark:bg-purple-950",
          },
          {
            icon: Globe,
            label: "가입 경로",
            value: user.oauth_provider || "-",
            color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950",
          },
          {
            icon: CalendarDays,
            label: "가입일",
            value: format(new Date(user.created_at), "yyyy-MM-dd"),
            color: "text-amber-500 bg-amber-50 dark:bg-amber-950",
          },
          {
            icon: FolderKanban,
            label: "프로젝트",
            value: `${projectCount}개`,
            color: "text-rose-500 bg-rose-50 dark:bg-rose-950",
          },
          {
            icon: MessageSquare,
            label: "채팅",
            value: `${user._count?.chats ?? 0}건`,
            color: "text-sky-500 bg-sky-50 dark:bg-sky-950",
          },
        ].map((item) => (
          <Card key={item.label} className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.color}`}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="truncate text-sm font-semibold">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
