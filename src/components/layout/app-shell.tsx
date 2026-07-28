"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

const routeTitles: Record<string, string[]> = {
  "/": ["SAUGC OS", "Dashboard"],
  "/clientes": ["SAUGC OS", "Clientes"],
  "/campanhas": ["SAUGC OS", "Campanhas"],
  "/briefings": ["SAUGC OS", "Briefings"],
  "/comerciais": ["SAUGC OS", "Comerciais"],
  "/assets": ["SAUGC OS", "Assets"],
  "/biblioteca": ["SAUGC OS", "Biblioteca"],
  "/prompts": ["SAUGC OS", "Prompts"],
  "/ia-studio": ["SAUGC OS", "IA Studio"],
  "/configuracoes": ["SAUGC OS", "Configurações"],
};

function getBreadcrumbs(pathname: string): string[] {
  if (routeTitles[pathname]) return routeTitles[pathname];
  const match = Object.keys(routeTitles).find(
    (key) => key !== "/" && pathname.startsWith(key)
  );
  return match ? routeTitles[match] : ["SAUGC OS"];
}

interface AppShellProps {
  children: React.ReactNode;
  pathname: string;
}

export function AppShell({ children, pathname }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-[#09090b] bg-ambient-gradient">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header breadcrumbs={breadcrumbs} />
        <main
          className={cn(
            "flex-1 overflow-y-auto bg-grid p-4 lg:p-6 animate-fade-in"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
