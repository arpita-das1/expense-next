import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

/** DELETE /api/expenses/:id — delete an expense by id */
export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = context.params;

  if (!id?.trim()) {
    return NextResponse.json({ error: "Expense id is required." }, { status: 400 });
  }

  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Expense not found." }, { status: 404 });
  }

  await prisma.expense.delete({ where: { id } });

  return NextResponse.json({ ok: true, id });
}
