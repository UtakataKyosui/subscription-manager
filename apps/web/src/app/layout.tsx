import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import Header from "@/components/header";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "〜サブスク管理アプリ〜",
  description: "サブスク管理しようね〜",
  openGraph: {
    title: "〜サブスク管理アプリ〜",
    description: "サブスク管理しようね〜",
    siteName: "〜サブスク管理アプリ〜",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "〜サブスク管理アプリ〜",
    description: "サブスク管理しようね〜",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="grid grid-rows-[auto_1fr] h-svh">
            <div className="px-4 sm:px-6 lg:px-8">
              <Header />
            </div>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-y-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
