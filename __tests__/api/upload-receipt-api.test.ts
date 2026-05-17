import { POST } from "@/app/api/upload-receipt/route";
import { extractReceiptFromImage, fileToImageBytes, validateReceiptImage } from "@/lib/receipt-extraction";

jest.mock("@/lib/receipt-extraction", () => ({
  validateReceiptImage: jest.fn(),
  fileToImageBytes: jest.fn(),
  extractReceiptFromImage: jest.fn(),
}));

const mockedValidateReceiptImage = validateReceiptImage as jest.MockedFunction<typeof validateReceiptImage>;
const mockedFileToImageBytes = fileToImageBytes as jest.MockedFunction<typeof fileToImageBytes>;
const mockedExtractReceiptFromImage = extractReceiptFromImage as jest.MockedFunction<typeof extractReceiptFromImage>;

describe("Upload receipt route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when the request body is not valid multipart form data", async () => {
    const request = { formData: async () => { throw new Error("not multipart"); } } as unknown as Request;
    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result).toEqual({ error: "Expected multipart form data." });
  });

  it("returns 400 when no file is provided", async () => {
    const request = { formData: async () => new FormData() } as unknown as Request;
    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result).toEqual({ error: 'Missing image file. Use form field "image" or "receipt".' });
  });

  it("returns 400 when the image validation fails", async () => {
    const file = new File(["abc"], "receipt.txt", { type: "text/plain" });
    const formData = new FormData();
    formData.append("image", file);
    mockedValidateReceiptImage.mockReturnValue("Image must be JPEG, PNG, GIF, or WebP.");

    const request = { formData: async () => formData } as unknown as Request;
    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result).toEqual({ error: "Image must be JPEG, PNG, GIF, or WebP." });
  });

  it("returns extracted receipt data when upload succeeds", async () => {
    const file = new File(["abc"], "receipt.png", { type: "image/png" });
    const formData = new FormData();
    formData.append("image", file);
    mockedValidateReceiptImage.mockReturnValue(null);
    mockedFileToImageBytes.mockResolvedValue(new Uint8Array([1, 2, 3]));
    mockedExtractReceiptFromImage.mockResolvedValue({
      amount: 24.5,
      date: "2026-05-17",
      category: "Travel",
      merchant: "Example Merchant",
    });

    const request = { formData: async () => formData } as unknown as Request;
    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toEqual({
      amount: 24.5,
      date: "2026-05-17",
      category: "Travel",
      merchant: "Example Merchant",
    });
    expect(mockedFileToImageBytes).toHaveBeenCalledWith(file);
    expect(mockedExtractReceiptFromImage).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]));
  });
});
