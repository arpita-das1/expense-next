import { extractWithTextract } from "@/lib/textract-receipt";
import type { ExtractedReceipt } from "@/lib/receipt-types";

export type { ExtractedReceipt } from "@/lib/receipt-types";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function validateReceiptImage(file: File): string | null {
  if (file.size === 0) return "Image file is empty.";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be 10 MB or smaller.";
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Image must be JPEG, PNG, GIF, or WebP.";
  }
  return null;
}

export async function fileToImageBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

export function assertTextractConfigured(): void {
  if (!process.env.AWS_REGION) {
    throw new Error(
      "AWS Textract is not configured. Set AWS_REGION and AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)."
    );
  }
}

export async function extractReceiptFromImage(imageBytes: Uint8Array): Promise<ExtractedReceipt> {
  assertTextractConfigured();
  return extractWithTextract(imageBytes);
}
