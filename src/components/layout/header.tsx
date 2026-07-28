"use client";

import { Bell, ChevronRight, Command, Plus, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface HeaderProps {
  breadcrumbs?: string[];
  className?: string;
}

export function Header({ breadcrumbs = ["SAUGC OS"], className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-white/10 bg-[#09090b]/80 px-4 backdrop-blur-md lg:px-6",
        className
      )}
    >
      <div className="hidden min-w-0 items-center gap-1 text-sm text-muted-foreground md:flex">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            <span className={cn(i === breadcrumbs.length - 1 && "text-foreground")}>
              {crumb}
            </span>
          </span>
        ))}
      </div>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          readOnly
          placeholder="Buscar... (⌘K)"
          className="pl-9 pr-16 cursor-pointer"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] text-muted-foreground sm:flex">
          <Command className="h-3 w-3" />K
        </kbd>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400 lg:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Online
        </span>

        <Button variant="outline" size="sm" className="hidden sm:flex gap-1">
          <Plus className="h-3.5 w-3.5" />
          Ação rápida
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <Badge
            variant="destructive"
            className="absolute -right-0.5 -top-0.5 h-4 min-w-4 px-1 text-[10px]"
          >
            3
          </Badge>
        </Button>

        <Avatar className="h-8 w-8">
          <AvatarFallback>PL</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
