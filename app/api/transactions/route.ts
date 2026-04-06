import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive(),
  category: z.string().min(1),
  subcategory: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  date: z.string(),
  financeMode: z.enum(["personal", "business"]).optional().default("personal"),
  necessityLabel: z.enum(["need", "want", "waste"]).optional().default("need"),
  isRecurring: z.boolean().optional().default(false),
  recurringFrequency: z.preprocess((v) => v === "" ? null : v, z
    .enum(["weekly", "fortnightly", "monthly", "quarterly", "yearly"])
    .optional()
    .nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const financeMode = searchParams.get("financeMode");
    const necessityLabel = searchParams.get("necessityLabel");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const limit = searchParams.get("limit");
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: Record<string, unknown> = { userId };
    if (type) where.type = type;
    if (category) where.category = category;
    if (financeMode) where.financeMode = financeMode;
    if (necessityLabel) where.necessityLabel = necessityLabel;
    if (search) {
      where.OR = [
        { description: { contains: search } },
        { category: { contains: search } },
        { subcategory: { contains: search } },
      ];
    }
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo);
    }

    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy,
      ...(limit ? { take: parseInt(limit) } : {}),
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const data = createTransactionSchema.parse(body);

    const transaction = await prisma.transaction.create({
      data: {
        userId: userId ?? "anonymous",
        type: data.type,
        amount: data.amount,
        category: data.category,
        subcategory: data.subcategory ?? null,
        description: data.description ?? null,
        date: new Date(data.date),
        financeMode: data.financeMode ?? "personal",
        necessityLabel: data.necessityLabel ?? "need",
        isRecurring: data.isRecurring ?? false,
        recurringFrequency: data.isRecurring ? (data.recurringFrequency ?? null) : null,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
