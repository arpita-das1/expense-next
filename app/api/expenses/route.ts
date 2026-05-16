import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCreateExpenseBody } from "@/lib/expense-input";

export const dynamic = "force-dynamic";

/** GET /api/expenses — list expenses (newest first) */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitRaw = Number.parseInt(searchParams.get("limit") ?? "100", 10);
  const limit = Number.isNaN(limitRaw) ? 100 : Math.min(Math.max(limitRaw, 1), 500);

  const expenses = await prisma.expense.findMany({
    orderBy: { occurredAt: "desc" },
    take: limit,
  });

  return NextResponse.json(expenses);
}

/** POST /api/expenses — create an expense */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseCreateExpenseBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { title, amount, category, notes, receiptPath, occurredAt } = parsed.data;

  const expense = await prisma.expense.create({
    data: {
      title,
      amount,
      category,
      notes,
      receiptPath,
      ...(occurredAt ? { occurredAt } : {}),
    },
  });

  return NextResponse.json(expense, { status: 201 });
}
