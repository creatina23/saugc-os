import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AnuncIA",
    template: "%s · AnuncIA",
  },
  description: "Sistema operacional de anúncios com inteligência artificial.",
};

// 📱 A "régua da tela" oficial (016b): diz ao celular para medir a página
// pela largura real do aparelho — é o que impede o "zoom-out miúdo".
// viewportFit cover = respeita a nota/recorte do iPhone; themeColor =
// barra do navegador do celular na cor da marca (preto AnuncIA).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0D12",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${geistMono.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}