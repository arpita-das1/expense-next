import { UploadReceiptForm } from "@/components/UploadReceiptForm";

export default function UploadReceiptPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        Upload receipt
      </h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Files are stored under <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-900">public/receipts</code> and
        the path is saved on the expense row.
      </p>
      <div className="mt-8">
        <UploadReceiptForm />
      </div>
    </div>
  );
}
