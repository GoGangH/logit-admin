"use client";

import { use } from "react";
import { useUser } from "@/hooks/use-users";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Link from "next/link";
import type { Experience } from "@/types";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: user, isLoading } = useUser(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!user) return <div>사용자를 찾을 수 없습니다.</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={user.full_name || user.email} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">사용자 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">이메일</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">이름</dt>
              <dd className="font-medium">{user.full_name || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">상태</dt>
              <dd>
                <Badge variant={user.is_active ? "default" : "secondary"}>
                  {user.is_active ? "활성" : "정지"}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">가입 경로</dt>
              <dd className="font-medium">{user.oauth_provider || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">가입일</dt>
              <dd className="font-medium">
                {format(new Date(user.created_at), "yyyy-MM-dd HH:mm")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">채팅 수</dt>
              <dd className="font-medium">{user._count?.chats ?? 0}건</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">
            프로젝트 ({user.projects?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="experiences">
            경험 ({user.experiences?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-3">
          {user.projects?.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              프로젝트가 없습니다.
            </p>
          )}
          {user.projects?.map(
            (project: {
              id: string;
              company: string;
              job_position: string;
              due_date: string | null;
              created_at: string;
              _count: { questions: number };
            }) => (
              <Card key={project.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {project.company} - {project.job_position}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      질문 {project._count.questions}개 |{" "}
                      {project.due_date
                        ? `마감 ${format(new Date(project.due_date), "yyyy-MM-dd")}`
                        : "마감일 없음"}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(project.created_at), "yyyy-MM-dd")}
                  </span>
                </CardContent>
              </Card>
            )
          )}
        </TabsContent>

        <TabsContent value="experiences" className="space-y-3">
          {user.experiences?.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              경험이 없습니다.
            </p>
          )}
          {user.experiences?.map((exp: Experience) => (
            <Card key={exp.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/experiences/${exp.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {exp.title}
                    </Link>
                    <div className="mt-1 flex gap-2">
                      <Badge variant="outline">{exp.experience_type}</Badge>
                      <Badge variant="secondary">{exp.category}</Badge>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {exp.start_date} ~ {exp.end_date}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
