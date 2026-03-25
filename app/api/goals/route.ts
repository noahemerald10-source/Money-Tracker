import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createGoalSchema = z.object({
  title: z.string().min(1),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).default(0),
  deadline: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const goals = await prisma.savingsGoal.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(goals);
  } catch (error) {
    console.error("GET /api/goals error:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createGoalSchema.parse(body);

    const goal = await prisma.savingsGoal.create({
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("POST /api/goals error:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
