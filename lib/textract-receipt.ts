import {
  AnalyzeExpenseCommand,
  type ExpenseDocument,
  TextractClient,
} from "@aws-sdk/client-textract";
import type { ExtractedReceipt } from "@/lib/receipt-types";

const AMOUNT_FIELD_TYPES = ["TOTAL", "AMOUNT_PAID", "GRAND_TOTAL", "AMOUNT_DUE", "SUBTOTAL"] as const;
const DATE_FIELD_TYPES = ["INVOICE_RECEIPT_DATE", "ORDER_DATE", "DUE_DATE"] as const;
const MERCHANT_FIELD_TYPES = ["VENDOR_NAME", "NAME", "RECEIVER_NAME"] as const;

function getSummaryField(
  fields: ExpenseDocument["SummaryFields"],
  type: string
): string | null {
  const field = fields?.find((f) => f.Type?.Text === type);
  const text = field?.ValueDetection?.Text?.trim();
  return text || null;
}

function firstMatchingField(
  fields: ExpenseDocument["SummaryFields"],
  types: readonly string[]
): string | null {
  for (const type of types) {
    const value = getSummaryField(fields, type);
    if (value) return value;
  }
  return null;
}

function parseAmount(text: string | null): number | null {
  if (!text) return null;
  const normalized = text.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  if (!normalized) return null;
  const amount = Number.parseFloat(normalized[0]);
  return Number.isNaN(amount) ? null : amount;
}

function parseDate(text: string | null): string | null {
  if (!text) return null;
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];
  const usMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (usMatch) {
    const [, month, day, yearRaw] = usMatch;
    const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return text.trim() || null;
}

export function mapTextractDocument(doc: ExpenseDocument | undefined): ExtractedReceipt {
  const fields = doc?.SummaryFields;
  return {
    amount: parseAmount(firstMatchingField(fields, AMOUNT_FIELD_TYPES)),
    date: parseDate(firstMatchingField(fields, DATE_FIELD_TYPES)),
    category: null,
    merchant: firstMatchingField(fields, MERCHANT_FIELD_TYPES),
  };
}

function getTextractClient(): TextractClient {
  const region = process.env.AWS_REGION;
  if (!region) {
    throw new Error("AWS_REGION is not set.");
  }

  return new TextractClient({
    region,
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN,
          }
        : undefined,
  });
}

export async function extractWithTextract(imageBytes: Uint8Array): Promise<ExtractedReceipt> {
  const client = getTextractClient();
  const response = await client.send(
    new AnalyzeExpenseCommand({
      Document: { Bytes: imageBytes },
    })
  );

  const document = response.ExpenseDocuments?.[0];
  if (!document) {
    throw new Error("Textract did not detect a receipt in the image.");
  }

  return mapTextractDocument(document);
}
