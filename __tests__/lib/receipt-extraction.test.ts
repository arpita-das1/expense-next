import { extractReceiptFromImage, fileToImageBytes, validateReceiptImage } from "@/lib/receipt-extraction";

describe("receipt extraction helpers", () => {
  describe("validateReceiptImage", () => {
    it("returns an error for empty files", () => {
      const file = new File([""], "empty.png", { type: "image/png" });
      expect(validateReceiptImage(file)).toBe("Image file is empty.");
    });

    it("returns an error for unsupported image types", () => {
      const file = new File(["abc"], "receipt.txt", { type: "text/plain" });
      expect(validateReceiptImage(file)).toBe("Image must be JPEG, PNG, GIF, or WebP.");
    });

    it("returns an error for files larger than 10 MB", () => {
      const bytes = new Uint8Array(10 * 1024 * 1024 + 1);
      const file = new File([bytes], "large.png", { type: "image/png" });
      expect(validateReceiptImage(file)).toBe("Image must be 10 MB or smaller.");
    });
  });

  describe("fileToImageBytes", () => {
    it("converts a File into a Uint8Array", async () => {
      const file = new File(["abc"], "receipt.png", { type: "image/png" });
      const result = await fileToImageBytes(file);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result)).toEqual([97, 98, 99]);
    });
  });

  describe("extractReceiptFromImage", () => {
    it("throws when AWS region is not configured", async () => {
      const originalRegion = process.env.AWS_REGION;
      delete process.env.AWS_REGION;

      await expect(extractReceiptFromImage(new Uint8Array([1, 2, 3]))).rejects.toThrow(
        "AWS Textract is not configured"
      );

      if (originalRegion !== undefined) {
        process.env.AWS_REGION = originalRegion;
      }
    });
  });
});
