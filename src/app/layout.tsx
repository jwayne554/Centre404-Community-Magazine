import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Centre404 Community Magazine",
  description: "Share your stories, news, and connect with the Centre404 community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
