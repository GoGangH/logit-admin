import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getServerEnv } from "@/lib/env";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma(await getServerEnv());
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, full_name: true } },
        questions: {
          where: { deleted_at: null },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Project detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma(await getServerEnv());
    const { id } = await params;
    const body = await req.json();
    const { company, job_position, recruit_notice, company_talent, due_date } =
      body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(company !== undefined && { company }),
        ...(job_position !== undefined && { job_position }),
        ...(recruit_notice !== undefined && { recruit_notice }),
        ...(company_talent !== undefined && { company_talent }),
        ...(due_date !== undefined && {
          due_date: due_date ? new Date(due_date) : null,
        }),
        updated_at: new Date(),
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Project update error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma(await getServerEnv());
    const { id } = await params;
    // Soft delete
    await prisma.project.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Project delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
