import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateTransactionSchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  amount: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  subcategory: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  date: z.string().optional(),
  financeMode: z.enum(["personal", "business"]).optional(),
  necessityLabel: z.enum(["need", "want", "waste"]).optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(["weekly", "fortnightly", "monthly", "quarterly", "yearly"]).optional().nullable(),
  recurringStartDate: z.string().optional().nullable(),
  recurringEndDate: z.string().optional().nullable(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    });

    if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    if (transaction.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("GET /api/transactions/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.transaction.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    if (existing.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const data = updateTransactionSchema.parse(body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.date) updateData.date = new Date(data.date);
    if (data.recurringStartDate !== undefined)
      updateData.recurringStartDate = data.recurringStartDate ? new Date(data.recurringStartDate) : null;
    if (data.recurringEndDate !== undefined)
      updateData.recurringEndDate = data.recurringEndDate ? new Date(data.recurringEndDate) : null;

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(transaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("PUT /api/transactions/[id] error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.transaction.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    if (existing.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.transaction.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/transactions/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
