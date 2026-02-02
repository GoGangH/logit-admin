import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const env = req.cookies.get("admin-server-env")?.value || "dev";
  const prodConfigured = !!process.env.PROD_DATABASE_URL;
  return NextResponse.json({ env, prodConfigured });
}

export async function POST(req: NextRequest) {
  const { env } = await req.json();
  if (env !== "dev" && env !== "production") {
    return NextResponse.json({ error: "Invalid env" }, { status: 400 });
  }

  if (env === "production" && !process.env.PROD_DATABASE_URL) {
    return NextResponse.json(
      { error: "Production 환경이 설정되지 않았습니다." },
      { status: 400 }
    );
  }

  const res = NextResponse.json({ env });
  res.cookies.set("admin-server-env", env, {
    path: "/",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
