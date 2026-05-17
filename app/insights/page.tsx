import { prisma } from "@/lib/prisma";
import { buildTopCategories, formatMoney } from "../../lib/insights";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const [count, agg, byCategory] = await Promise.all([
    prisma.expense.count(),
    prisma.expense.aggregate({ _sum: { amount: true }, _avg: { amount: true } }),
    prisma.expense.groupBy({
      by: ["category"],
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
  ]);

  const sum = agg._sum.amount ?? 0;
  const avg = agg._avg.amount ?? 0;

  const topCategories = buildTopCategories(byCategory);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Insights</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Rollups over all stored expenses.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total expenses</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">{count}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Lifetime total</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
            {formatMoney(sum)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Average amount</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
            {count ? formatMoney(avg) : formatMoney(0)}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">By category</h2>
        {topCategories.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">No categorized spend yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-950">
            {topCategories.map((row) => (
              <li key={row.label} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{row.label}</span>
                <span className="tabular-nums text-neutral-600 dark:text-neutral-400">{formatMoney(row.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
