"use client";

import { useState, type ChangeEvent } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { uploadReceiptWithExpense, type FormMessage } from "@/app/actions/expenses";
import type { ExtractedReceipt } from "@/lib/receipt-types";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900"
    >
      {pending ? "Uploading…" : "Save receipt & expense"}
    </button>
  );
}

function SuccessPanel({
  receiptPath,
  children,
}: {
  receiptPath: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
      <p className="font-medium">Receipt uploaded and linked to a new expense.</p>
      <p className="mt-2 text-sm">
        <a href={receiptPath} className="underline underline-offset-2" target="_blank" rel="noreferrer">
          View file
        </a>
      </p>
      {children}
    </div>
  );
}

export function UploadReceiptForm() {
  const [state, formAction] = useFormState<FormMessage | undefined, FormData>(
    uploadReceiptWithExpense,
    undefined
  );
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [occurredAt, setOccurredAt] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setScanError(null);
    setScanMessage(null);

    if (!file) return;

    if (!IMAGE_TYPES.has(file.type)) {
      setScanMessage("PDF selected — auto-fill works for images only. Enter details manually.");
      return;
    }

    setScanning(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload-receipt", { method: "POST", body: formData });
      const data = (await response.json()) as ExtractedReceipt & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not read receipt.");
      }

      setTitle(data.merchant ?? "");
      setAmount(data.amount != null ? String(data.amount) : "");
      setCategory(data.category ?? "");
      setOccurredAt(data.date ?? "");
      setScanMessage("Receipt scanned — review the fields below, then save.");
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Receipt scan failed.");
    } finally {
      setScanning(false);
    }
  }

  const formBody = (
    <>
      {state?.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {state.error}
        </p>
      ) : null}
      {scanError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
          {scanError}
        </p>
      ) : null}
      {scanMessage ? (
        <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-100">
          {scanMessage}
        </p>
      ) : null}

      <div>
        <label htmlFor="receipt" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Receipt file
        </label>
        <input
          id="receipt"
          name="receipt"
          type="file"
          accept="image/*,.pdf,application/pdf"
          required
          onChange={handleFileChange}
          className="w-full text-sm text-neutral-700 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium dark:text-neutral-300 dark:file:bg-neutral-800"
        />
        {scanning ? (
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Scanning receipt…</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Title
        </label>
        <input
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Defaults to “Receipt”"
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm outline-none ring-neutral-900 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        />
      </div>

      <div>
        <label htmlFor="amount" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Amount
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0 if unknown"
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm outline-none ring-neutral-900 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        />
      </div>

      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Category
        </label>
        <input
          id="category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm outline-none ring-neutral-900 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        />
      </div>

      {occurredAt ? <input type="hidden" name="occurredAt" value={occurredAt} /> : null}

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm outline-none ring-neutral-900 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        />
      </div>

      <SubmitButton />
    </>
  );

  if (state?.ok && state.receiptPath) {
    return (
      <SuccessPanel receiptPath={state.receiptPath}>
        <form action={formAction} encType="multipart/form-data" className="mt-6 space-y-4">
          {formBody}
        </form>
      </SuccessPanel>
    );
  }

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-4">
      {formBody}
    </form>
  );
}
