import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ID8 · Decision Readiness Engine",
  description:
    "A Next.js + FeltDB product showcase for human attention and decision readiness.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
