"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type FormMessage = { ok: boolean; error?: string; receiptPath?: string };

export async function createExpense(
  _prev: FormMessage | undefined,
  formData: FormData
): Promise<FormMessage> {
  const title = String(formData.get("title") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const occurredAtRaw = String(formData.get("occurredAt") ?? "").trim();

  const amount = Number.parseFloat(amountRaw);
  if (!title || Number.isNaN(amount)) {
    return { ok: false, error: "Title and a valid amount are required." };
  }

  const occurredAt = occurredAtRaw ? new Date(occurredAtRaw) : new Date();
  if (Number.isNaN(occurredAt.getTime())) {
    return { ok: false, error: "Invalid date." };
  }

  await prisma.expense.create({
    data: { title, amount, category, notes, occurredAt },
  });

  revalidatePath("/dashboard");
  revalidatePath("/insights");
  return { ok: true };
}

export async function uploadReceiptWithExpense(
  _prev: FormMessage | undefined,
  formData: FormData
): Promise<FormMessage> {
  const file = formData.get("receipt");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a receipt file to upload." };
  }

  const title = String(formData.get("title") ?? "").trim() || "Receipt";
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const amount = amountRaw ? Number.parseFloat(amountRaw) : 0;
  if (Number.isNaN(amount)) {
    return { ok: false, error: "Amount must be a number." };
  }

  const ext = path.extname(file.name) || ".bin";
  const safeExt = ext.length <= 8 ? ext : ".bin";
  const filename = `${randomUUID()}${safeExt}`;
  const receiptsDir = path.join(process.cwd(), "public", "receipts");
  await mkdir(receiptsDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(receiptsDir, filename), buffer);

  const receiptPath = `/receipts/${filename}`;
  await prisma.expense.create({
    data: {
      title,
      amount,
      receiptPath,
      category: String(formData.get("category") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/insights");
  return { ok: true, receiptPath };
}
