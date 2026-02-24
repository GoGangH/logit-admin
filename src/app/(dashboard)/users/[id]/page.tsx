import { getServerEnv } from "@/lib/env";
import { UserDetailContent } from "@/components/users/user-detail-content";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const env = await getServerEnv();

  return <UserDetailContent id={id} isProduction={env === "production"} />;
}
