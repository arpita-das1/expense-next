import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(d);
}

export default async function DashboardPage() {
  const expenses = await prisma.expense.findMany({
    orderBy: { occurredAt: "desc" },
    take: 100,
  });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Recent expenses ({expenses.length} shown) — total {formatMoney(total)}
          </p>
        </div>
        <Link
          href="/add-expense"
          className="inline-flex w-fit rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          Add expense
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center dark:border-neutral-700 dark:bg-neutral-900/40">
          <p className="text-neutral-600 dark:text-neutral-400">No expenses yet.</p>
          <Link href="/add-expense" className="mt-3 inline-block text-sm font-medium text-neutral-900 underline dark:text-neutral-100">
            Create your first expense
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/80">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Date</th>
                <th className="px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Title</th>
                <th className="px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Category</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-700 dark:text-neutral-300">Amount</th>
                <th className="px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50">
                  <td className="whitespace-nowrap px-4 py-3 text-neutral-600 dark:text-neutral-400">
                    {formatDate(e.occurredAt)}
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">{e.title}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{e.category ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-neutral-900 dark:text-neutral-100">
                    {formatMoney(e.amount)}
                  </td>
                  <td className="px-4 py-3">
                    {e.receiptPath ? (
                      <a
                        href={e.receiptPath}
                        className="text-sm font-medium text-neutral-900 underline dark:text-neutral-100"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </a>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
