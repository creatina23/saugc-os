"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Film,
  Kanban,
  LayoutDashboard,
  Library,
  Megaphone,
  Search,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { iconMap } from "@/lib/icon-map";
import {
  assets,
  briefings,
  campaigns,
  clients,
  commercials,
  libraryItems,
  navItems,
  prompts,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface PaletteItem {
  id: string;
  group: string;
  label: string;
  detail: string;
  href: string;
  icon: LucideIcon;
}

const allItems: PaletteItem[] = [
  ...navItems.map((item) => ({
    id: `page-${item.href}`,
    group: "Páginas",
    label: item.label,
    detail: "Ir para o módulo",
    href: item.href,
    icon: iconMap[item.icon] ?? LayoutDashboard,
  })),
  ...clients.map((item) => ({
    id: `client-${item.id}`,
    group: "Clientes",
    label: item.company,
    detail: item.name,
    href: "/clientes",
    icon: Users,
  })),
  ...campaigns.map((item) => ({
    id: `camp-${item.id}`,
    group: "Campanhas",
    label: item.name,
    detail: `${item.client} · ${item.platform}`,
    href: "/campanhas",
    icon: Megaphone,
  })),
  ...briefings.map((item) => ({
    id: `brief-${item.id}`,
    group: "Briefings",
    label: item.title,
    detail: item.client,
    href: "/briefings",
    icon: FileText,
  })),
  ...commercials.map((item) => ({
    id: `com-${item.id}`,
    group: "Comerciais",
    label: item.title,
    detail: `${item.client} · ${item.format}`,
    href: "/comerciais",
    icon: Kanban,
  })),
  ...assets.map((item) => ({
    id: `asset-${item.id}`,
    group: "Assets",
    label: item.name,
    detail: `${item.client} · ${item.category}`,
    href: "/assets",
    icon: Film,
  })),
  ...libraryItems.map((item) => ({
    id: `lib-${item.id}`,
    group: "Biblioteca",
    label: item.title,
    detail: item.category,
    href: "/biblioteca",
    icon: Library,
  })),
  ...prompts.map((item) => ({
    id: `prompt-${item.id}`,
    group: "Prompts",
    label: item.title,
    detail: item.description,
    href: "/prompts",
    icon: Sparkles,
  })),
];

const MAX_RESULTS = 14;

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return allItems.filter((item) => item.group === "Páginas");
    return allItems
      .filter(
        (item) =>
          item.label.toLowerCase().includes(term) ||
          item.detail.toLowerCase().includes(term) ||
          item.group.toLowerCase().includes(term)
      )
      .slice(0, MAX_RESULTS);
  }, [query]);

  if (!open) return null;

  function navigate(item: PaletteItem) {
    onOpenChange(false);
    setQuery("");
    setActiveIndex(0);
    router.push(item.href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      onOpenChange(false);
      return;
    }
    if (results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    }
    if (event.key === "Enter") {
      event.preventDefault();
      navigate(results[Math.min(activeIndex, results.length - 1)]);
    }
  }

  let lastGroup = "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Busca global"
      className="fixed inset-0 z-[70]"
    >
      <button
        type="button"
        aria-label="Fechar busca"
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="animate-fade-in absolute inset-x-4 top-[14vh] mx-auto max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Buscar páginas, clientes, campanhas, prompts..."
            aria-label="Buscar no AnuncIA"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
          <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium">Nenhum resultado</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tente buscar por cliente, campanha ou módulo.
              </p>
            </div>
          ) : (
            results.map((item, index) => {
              const showGroup = item.group !== lastGroup;
              lastGroup = item.group;
              return (
                <div key={item.id}>
                  {showGroup && (
                    <p className="px-3 pt-3 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      {item.group}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      index === activeIndex ? "bg-accent" : ""
                    )}
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                      <item.icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.label}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
          <span>
            <kbd className="font-mono">↑↓</kbd> navegar
          </span>
          <span>
            <kbd className="font-mono">Enter</kbd> abrir
          </span>
          <span>
            <kbd className="font-mono">ESC</kbd> fechar
          </span>
        </div>
      </div>
    </div>
  );
}