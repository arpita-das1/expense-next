"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createExpense, type FormMessage } from "@/app/actions/expenses";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export function AddExpenseForm() {
  const [state, formAction] = useFormState<FormMessage | undefined, FormData>(
    createExpense,
    undefined
  );

  if (state?.ok) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
        <p className="font-medium">Expense saved.</p>
        <p className="mt-1 text-sm opacity-90">Add another below, or open the dashboard to review.</p>
        <form action={formAction} className="mt-6 space-y-4">
          <FormFields />
          <SubmitButton label="Add expense" />
        </form>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {state.error}
        </p>
      ) : null}
      <FormFields />
      <SubmitButton label="Add expense" />
    </form>
  );
}

function FormFields() {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
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
          required
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
          placeholder="e.g. Travel, Meals"
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm outline-none ring-neutral-900 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        />
      </div>
      <div>
        <label htmlFor="occurredAt" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Date
        </label>
        <input
          id="occurredAt"
          name="occurredAt"
          type="date"
          defaultValue={today}
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
          rows={3}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm outline-none ring-neutral-900 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        />
      </div>
    </>
  );
}
