import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claude Studio",
  description: "Claude AI-тай шууд ярилцах орчин.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  );
}
