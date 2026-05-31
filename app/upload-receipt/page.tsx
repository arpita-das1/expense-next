import { UploadReceiptForm } from "@/components/UploadReceiptForm";

export default function UploadReceiptPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        Upload receipt
      </h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Choose an image to scan with AWS Textract and auto-fill the form, then save. Uploaded receipts are stored in your configured S3 bucket.
      </p>
      <div className="mt-8">
        <UploadReceiptForm />
      </div>
    </div>
  );
}
