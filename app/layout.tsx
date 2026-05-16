import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppNav } from "@/components/AppNav";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Expense tracker",
  description: "Next.js 14, Tailwind, Prisma, and SQLite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased font-[family-name:var(--font-geist-sans)]`}
      >
        <AppNav />
        <main>{children}</main>
      </body>
    </html>
  );
}
