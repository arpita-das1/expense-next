export type CategoryAggRow = {
  category: string | null;
  _sum: {
    amount: number | null;
  };
};

export function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
}

export function buildTopCategories(rows: CategoryAggRow[]) {
  return rows
    .map((row) => ({
      label: row.category?.trim() || "Uncategorized",
      total: row._sum.amount ?? 0,
    }))
    .filter((row) => row.total > 0);
}
