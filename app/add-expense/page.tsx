import { AddExpenseForm } from "@/components/AddExpenseForm";

export default function AddExpensePage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Add expense</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Record a new expense in your SQLite database via Prisma.
      </p>
      <div className="mt-8">
        <AddExpenseForm />
      </div>
    </div>
  );
}
