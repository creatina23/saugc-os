import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { ShellLayout } from "@/components/layout/shell-layout";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SAUGC OS",
  description: "Plataforma SaaS de gestão UGC e marketing — Sprint 001",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`dark ${inter.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full antialiased">
        <ShellLayout>{children}</ShellLayout>
      </body>
    </html>
  );
}
