export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createReviewSchema = z.object({
  weekStart: z.string(),
  weekEnd: z.string(),
  totalIncome: z.number().min(0).default(0),
  totalExpenses: z.number().min(0).default(0),
  totalSaved: z.number().default(0),
  wasteSpending: z.number().min(0).default(0),
  notes: z.string().optional().nullable(),
  improvementPlan: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const reviews = await prisma.weeklyReview.findMany({
      orderBy: { weekStart: "desc" },
    });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("GET /api/weekly-reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const data = createReviewSchema.parse(body);

    const review = await prisma.weeklyReview.create({
      data: {
        ...data,
        userId: userId ?? "anonymous",
        weekStart: new Date(data.weekStart),
        weekEnd: new Date(data.weekEnd),
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("POST /api/weekly-reviews error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
