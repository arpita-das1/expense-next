# Expense Tracker (expense-next)

A lightweight Next.js expense tracker application with receipt upload, AWS Textract receipt scanning, and Prisma-backed storage.

## What this project does

- Adds and stores expense records with title, amount, category, notes, and date.
- Uploads receipt images and stores them in `public/receipts`.
- Uses an API route to send receipt image data to AWS Textract for automatic merchant, amount, and date extraction.
- Displays expense data on dashboard and insights pages.

## Key features

- Next.js App Router project structure
- Server Actions for form submission
- Prisma ORM with SQLite database
- AWS Textract integration for receipt scanning
- File upload validation and receipt storage
- Static public file hosting for uploaded receipts

## Technologies used

- `next` 14
- `react` 18
- `prisma` 6
- `@prisma/client`
- `@aws-sdk/client-textract`
- `typescript`
- `tailwindcss`
- `jest` for unit testing

## Project structure

- `app/`
  - `page.tsx` — landing or summary page
  - `dashboard/page.tsx` — expense dashboard view
  - `insights/page.tsx` — aggregated expense insights
  - `upload-receipt/page.tsx` — receipt upload and auto-fill form
  - `api/expenses/route.ts` — expense list and creation API route
  - `api/expenses/[id]/route.ts` — expense deletion API route
  - `api/upload-receipt/route.ts` — receipt scan API route
  - `actions/expenses.ts` — server actions for expense creation and receipt upload
- `components/`
  - `AddExpenseForm.tsx` — add expense form component
  - `UploadReceiptForm.tsx` — receipt upload and scan component
  - `AppNav.tsx` — navigation menu
- `lib/`
  - `prisma.ts` — Prisma client initialization
  - `receipt-extraction.ts` — local receipt image validation and AWS Textract helper
  - `textract-receipt.ts` — AWS Textract response mapping
  - `receipt-types.ts` — receipt extraction result types
- `prisma/schema.prisma` — database schema configuration
- `public/receipts/` — uploaded receipt storage directory

## Environment variables

Create a `.env` file with the following values for local development:

```env
DATABASE_URL="file:./dev.db"
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
# AWS_SESSION_TOKEN=optional
```

> Do not commit `.env` to git. This repository already ignores `.env`.

## Running locally

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

This app uses SQLite for local development. Prisma generates the client automatically during install.

- Run `npx prisma migrate dev --name init` to create or update the database schema.
- Run `npx prisma studio` to inspect stored expense records.

## Notes

- Uploaded receipts are stored in `public/receipts` and served as static files.
- The receipt scan route uses AWS Textract and requires valid AWS credentials.
- There is no authentication built into this sample project.

## Testing

This project includes Jest tests for API routes, receipt extraction helpers, and insights calculations.

Run the suite with:

```bash
npm test
```

## Deployment

This app can be deployed to Vercel or any Node.js-compatible hosting provider.

For Vercel, simply connect the repository and configure environment variables in the project settings.
