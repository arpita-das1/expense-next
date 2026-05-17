import { NextResponse } from "next/server";
import {
  extractReceiptFromImage,
  fileToImageBytes,
  validateReceiptImage,
} from "@/lib/receipt-extraction";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/upload-receipt
 * Body: multipart/form-data with field "image" or "receipt" (JPEG/PNG/GIF/WebP)
 * Uses AWS Textract AnalyzeExpense. Returns: { amount, date, category, merchant }
 */
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const file = formData.get("image") ?? formData.get("receipt");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'Missing image file. Use form field "image" or "receipt".' },
      { status: 400 }
    );
  }

  const validationError = validateReceiptImage(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const imageBytes = await fileToImageBytes(file);
    const extracted = await extractReceiptFromImage(imageBytes);
    return NextResponse.json(extracted);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Receipt extraction failed.";
    const isConfig =
      message.includes("not configured") ||
      message.includes("is not set") ||
      message.includes("credentials");
    const status = isConfig ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
