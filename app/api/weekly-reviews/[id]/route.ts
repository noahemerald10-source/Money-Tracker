import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateReviewSchema = z.object({
  weekStart: z.string().optional(),
  weekEnd: z.string().optional(),
  totalIncome: z.number().min(0).optional(),
  totalExpenses: z.number().min(0).optional(),
  totalSaved: z.number().optional(),
  wasteSpending: z.number().min(0).optional(),
  notes: z.string().optional().nullable(),
  improvementPlan: z.string().optional().nullable(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.weeklyReview.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Review not found" }, { status: 404 });
    if (existing.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const data = updateReviewSchema.parse(body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.weekStart) updateData.weekStart = new Date(data.weekStart);
    if (data.weekEnd) updateData.weekEnd = new Date(data.weekEnd);

    const review = await prisma.weeklyReview.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(review);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("PUT /api/weekly-reviews/[id] error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.weeklyReview.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Review not found" }, { status: 404 });
    if (existing.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.weeklyReview.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/weekly-reviews/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
