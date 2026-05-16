"use client";

import { useFormState, useFormStatus } from "react-dom";
import { uploadReceiptWithExpense, type FormMessage } from "@/app/actions/expenses";

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

export function UploadReceiptForm() {
  const [state, formAction] = useFormState<FormMessage | undefined, FormData>(
    uploadReceiptWithExpense,
    undefined
  );

  if (state?.ok && state.receiptPath) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
        <p className="font-medium">Receipt uploaded and linked to a new expense.</p>
        <p className="mt-2 text-sm">
          <a href={state.receiptPath} className="underline underline-offset-2" target="_blank" rel="noreferrer">
            View file
          </a>
        </p>
        <form action={formAction} encType="multipart/form-data" className="mt-6 space-y-4">
          <FormFields />
          <SubmitButton />
        </form>
      </div>
    );
  }

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-4">
      {state?.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {state.error}
        </p>
      ) : null}
      <FormFields />
      <SubmitButton />
    </form>
  );
}

function FormFields() {
  return (
    <>
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
          className="w-full text-sm text-neutral-700 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium dark:text-neutral-300 dark:file:bg-neutral-800"
        />
      </div>
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Title
        </label>
        <input
          id="title"
          name="title"
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
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm outline-none ring-neutral-900 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        />
      </div>
      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm outline-none ring-neutral-900 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        />
      </div>
    </>
  );
}
