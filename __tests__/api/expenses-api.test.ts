import { GET, POST } from "@/app/api/expenses/route";
import { DELETE } from "@/app/api/expenses/[id]/route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    expense: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as {
  expense: {
    findMany: jest.Mock;
    create: jest.Mock;
    count: jest.Mock;
    findUnique: jest.Mock;
    delete: jest.Mock;
  };
};

describe("Expense API routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/expenses", () => {
    it("returns a list of expenses limited by query", async () => {
      const expenses = [
        {
          id: "1",
          title: "Coffee",
          amount: 4.5,
          category: "Food",
          notes: null,
          occurredAt: new Date().toISOString(),
          receiptPath: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockedPrisma.expense.findMany.mockResolvedValue(expenses);

      const request = new Request("http://localhost/api/expenses?limit=1");
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(expenses);
      expect(mockedPrisma.expense.findMany).toHaveBeenCalledWith({
        orderBy: { occurredAt: "desc" },
        take: 1,
      });
    });
  });

  describe("POST /api/expenses", () => {
    it("creates a new expense when the request body is valid", async () => {
      const payload = { title: "Groceries", amount: 12.75 };
      const createdExpense = {
        id: "abc",
        title: "Groceries",
        amount: 12.75,
        category: null,
        notes: null,
        occurredAt: new Date().toISOString(),
        receiptPath: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockedPrisma.expense.create.mockResolvedValue(createdExpense);
      const request = new Request("http://localhost/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result).toEqual(createdExpense);
      expect(mockedPrisma.expense.create).toHaveBeenCalledWith({
        data: {
          title: "Groceries",
          amount: 12.75,
          category: null,
          notes: null,
          receiptPath: null,
        },
      });
    });

    it("returns 400 for invalid JSON bodies", async () => {
      const request = new Request("http://localhost/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json",
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Invalid JSON body." });
    });

    it("returns 400 for malformed expense payloads", async () => {
      const request = new Request("http://localhost/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "", amount: "bad" }),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toHaveProperty("error");
    });
  });

  describe("DELETE /api/expenses/:id", () => {
    it("returns 400 when the id is missing", async () => {
      const response = await DELETE(new Request("http://localhost/api/expenses/"), { params: { id: "" } });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({ error: "Expense id is required." });
    });

    it("returns 404 when the expense does not exist", async () => {
      mockedPrisma.expense.findUnique.mockResolvedValue(null);

      const response = await DELETE(new Request("http://localhost/api/expenses/unknown"), {
        params: { id: "unknown" },
      });
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result).toEqual({ error: "Expense not found." });
      expect(mockedPrisma.expense.findUnique).toHaveBeenCalledWith({ where: { id: "unknown" } });
    });

    it("deletes an expense when it exists", async () => {
      mockedPrisma.expense.findUnique.mockResolvedValue({ id: "abc" });
      mockedPrisma.expense.delete.mockResolvedValue({ id: "abc" });

      const response = await DELETE(new Request("http://localhost/api/expenses/abc"), {
        params: { id: "abc" },
      });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ ok: true, id: "abc" });
      expect(mockedPrisma.expense.delete).toHaveBeenCalledWith({ where: { id: "abc" } });
    });
  });
});
