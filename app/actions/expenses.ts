"use server";

import path from "node:path";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { uploadReceiptToS3, getReceiptKey, getReceiptSignedUrl } from "@/lib/s3";
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
  const objectKey = getReceiptKey(filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await uploadReceiptToS3(objectKey, buffer, file.type || "application/octet-stream");

  const occurredAtRaw = String(formData.get("occurredAt") ?? "").trim();
  const occurredAt = occurredAtRaw ? new Date(occurredAtRaw) : undefined;

  const signedUrl = await getReceiptSignedUrl(objectKey);
  await prisma.expense.create({
    data: {
      title,
      amount,
      receiptPath: objectKey,
      category: String(formData.get("category") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
      ...(occurredAt && !Number.isNaN(occurredAt.getTime()) ? { occurredAt } : {}),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/insights");
  return { ok: true, receiptPath: signedUrl };
}
