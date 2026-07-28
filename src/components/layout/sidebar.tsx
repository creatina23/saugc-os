"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  FileText,
  Film,
  Kanban,
  LayoutDashboard,
  Library,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navItems, workspaces } from "@/lib/mock-data";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Megaphone,
  FileText,
  Kanban,
  Film,
  Library,
  Sparkles,
  Bot,
  Settings,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const activeWorkspace = workspaces[0];

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex h-full shrink-0 flex-col border-r border-white/10 bg-[#0d0e12]/95 glass-panel"
    >
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-3">
        {!collapsed && (
          <div className="flex items-center gap-2 px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-violet-600 text-xs font-bold text-white">
              SG
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">SAUGC OS</p>
              <p className="text-[10px] text-muted-foreground">Studio Pro</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("shrink-0", collapsed && "mx-auto")}
          onClick={onToggle}
          aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!collapsed && (
        <div className="border-b border-white/10 p-3">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm transition-colors hover:bg-white/10"
          >
            <div>
              <p className="font-medium">{activeWorkspace.name}</p>
              <p className="text-xs text-muted-foreground">Plano {activeWorkspace.plan}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-foreground"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.href === "/campanhas" && (
                <Badge variant="success" className="ml-auto text-[10px]">
                  12
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="border-t border-white/10 p-3">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="text-xs font-medium text-emerald-400">Status do sistema</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Todos os módulos operacionais (mock).
            </p>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="border-t border-white/10 p-2 text-center">
          <ChevronRight className="mx-auto h-4 w-4 text-muted-foreground opacity-0" />
        </div>
      )}
    </motion.aside>
  );
}
