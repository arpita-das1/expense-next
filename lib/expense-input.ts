export type CreateExpenseInput = {
  title: string;
  amount: number;
  category?: string | null;
  notes?: string | null;
  occurredAt?: Date;
  receiptPath?: string | null;
};

export function parseCreateExpenseBody(
  body: unknown
): { ok: true; data: CreateExpenseInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const record = body as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const amount =
    typeof record.amount === "number"
      ? record.amount
      : typeof record.amount === "string"
        ? Number.parseFloat(record.amount)
        : Number.NaN;

  if (!title) {
    return { ok: false, error: "title is required." };
  }
  if (Number.isNaN(amount)) {
    return { ok: false, error: "amount must be a valid number." };
  }

  const category =
    record.category === undefined || record.category === null
      ? null
      : String(record.category).trim() || null;
  const notes =
    record.notes === undefined || record.notes === null
      ? null
      : String(record.notes).trim() || null;
  const receiptPath =
    record.receiptPath === undefined || record.receiptPath === null
      ? null
      : String(record.receiptPath).trim() || null;

  let occurredAt: Date | undefined;
  if (record.occurredAt !== undefined && record.occurredAt !== null) {
    occurredAt = new Date(String(record.occurredAt));
    if (Number.isNaN(occurredAt.getTime())) {
      return { ok: false, error: "occurredAt must be a valid date." };
    }
  }

  return {
    ok: true,
    data: { title, amount, category, notes, receiptPath, occurredAt },
  };
}
