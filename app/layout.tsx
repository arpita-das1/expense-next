import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppNav } from "@/components/AppNav";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
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
      <body className={`${geistSans.variable} min-h-screen antialiased`}>
        <AppNav />
        <main>{children}</main>
      </body>
    </html>
  );
}
