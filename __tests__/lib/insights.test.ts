import { buildTopCategories, formatMoney } from "@/lib/insights";

describe("insights helpers", () => {
  describe("formatMoney", () => {
    it("formats a number as USD currency", () => {
      const result = formatMoney(1234.5);
      expect(typeof result).toBe("string");
      expect(result).toContain("1");
      expect(result).toContain("234");
    });
  });

  describe("buildTopCategories", () => {
    it("normalizes categories and filters out zero totals", () => {
      const rows = [
        { category: "Food", _sum: { amount: 45.5 } },
        { category: " ", _sum: { amount: 12 } },
        { category: "Travel", _sum: { amount: null } },
        { category: "Office", _sum: { amount: 0 } },
      ];

      const result = buildTopCategories(rows);

      expect(result).toEqual([
        { label: "Food", total: 45.5 },
        { label: "Uncategorized", total: 12 },
      ]);
    });
  });
});
