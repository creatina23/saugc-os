"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  Check,
  ChevronsUpDown,
  LayoutDashboard,
  Megaphone,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import { iconMap } from "@/lib/icon-map";
import { navItems, notifications, workspaces } from "@/lib/mock-data";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "./command-palette";
import { Toaster } from "./toaster";

const quickActions = [
  { label: "Novo Cliente", href: "/clientes", icon: Users },
  { label: "Nova Campanha", href: "/campanhas", icon: Megaphone },
  { label: "Novo Prompt", href: "/prompts", icon: Sparkles },
];

type MenuId = "workspace" | "notifications" | "quick" | null;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuId>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [workspace, setWorkspace] = useState<string>(workspaces[0].id);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
    setOpenMenu(null);
  }

  const currentWorkspace =
    workspaces.find((item) => item.id === workspace) ?? workspaces[0];
  const unreadCount = notifications.filter((item) => item.unread).length;
  const currentItem =
    navItems.find((item) => item.href !== "/" && pathname.startsWith(item.href)) ??
    navItems[0];

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((prev) => !prev);
        return;
      }
      if (event.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  function toggleMenu(menu: Exclude<MenuId, null>) {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  }

  function renderNav(isMobileDrawer: boolean) {
    return (
      <nav aria-label="Navegação principal" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p
          className={cn(
            "mb-2 px-3 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase",
            collapsed && !isMobileDrawer && "sr-only"
          )}
        >
          Menu
        </p>
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] ?? LayoutDashboard;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-primary/12 font-medium text-primary shadow-[inset_0_0_0_1px_rgba(59,130,246,0.25)]"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                collapsed && !isMobileDrawer && "justify-center px-0"
              )}
            >
              <Icon className="size-[18px] shrink-0" />
              {(!collapsed || isMobileDrawer) && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {(!collapsed || isMobileDrawer) && item.label === "IA Studio" && (
                <Badge variant="violet" className="px-1.5">
                  Beta
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    );
  }

  function renderSidebarBody(isMobileDrawer: boolean) {
    const showFull = !collapsed || isMobileDrawer;
    return (
      <>
        <div
          className={cn(
            "flex h-[72px] shrink-0 items-center gap-3 border-b border-border px-4",
            !showFull && "justify-center px-2"
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-ai shadow-lg">
            <Zap className="size-4 text-white" />
          </div>
          {showFull && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight">AnuncIA</p>
              <p className="truncate text-[11px] text-muted-foreground">UGC Ads Studio</p>
            </div>
          )}
        </div>

        <div className={cn("relative shrink-0 p-3", !showFull && "px-2")}>
          <button
            type="button"
            onClick={() => toggleMenu("workspace")}
            aria-label="Trocar workspace"
            aria-expanded={openMenu === "workspace"}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-[rgba(255,255,255,0.03)] p-2.5 text-left transition-colors hover:border-[rgba(255,255,255,0.16)]",
              !showFull && "justify-center"
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Building2 className="size-4" />
            </div>
            {showFull && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{currentWorkspace.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    Plano {currentWorkspace.plan}
                  </p>
                </div>
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
              </>
            )}
          </button>

          {openMenu === "workspace" && (
            <>
              <button
                type="button"
                aria-label="Fechar menu de workspace"
                className="fixed inset-0 z-[45] cursor-default"
                onClick={() => setOpenMenu(null)}
              />
              <div className="absolute inset-x-3 top-full z-50 mt-1 rounded-xl border border-border bg-surface p-1.5 shadow-2xl">
                {workspaces.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setWorkspace(item.id);
                      setOpenMenu(null);
                      toast("Workspace alterado", {
                        description: `Agora operando em ${item.name} · Plano ${item.plan}`,
                        type: "success",
                      });
                    }}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <Building2 className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">Plano {item.plan}</p>
                    </div>
                    {item.id === workspace && <Check className="size-4 shrink-0 text-primary" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {renderNav(isMobileDrawer)}

        <div className={cn("shrink-0 space-y-2 border-t border-border p-3", !showFull && "px-2")}>
          {showFull ? (
            <div className="flex items-center gap-2.5 rounded-xl px-2 py-1.5">
              <Avatar className="size-8">
                <AvatarFallback>MC</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">Mateus Costa</p>
                <p className="truncate text-[11px] text-muted-foreground">Administrador</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <Avatar className="size-8">
                <AvatarFallback>MC</AvatarFallback>
              </Avatar>
            </div>
          )}
          {!isMobileDrawer && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
              className={cn("w-full text-muted-foreground", !collapsed && "justify-start")}
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
              {!collapsed && <span>Recolher menu</span>}
            </Button>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-surface-2/80 backdrop-blur-xl transition-[width] duration-300 md:flex",
          collapsed ? "w-[88px]" : "w-[280px]"
        )}
      >
        {renderSidebarBody(false)}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="animate-fade-in absolute inset-y-0 left-0 flex w-[280px] flex-col border-r border-border bg-surface-2 shadow-2xl">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Fechar menu de navegação"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-3 z-10 text-muted-foreground"
            >
              <X />
            </Button>
            {renderSidebarBody(true)}
          </div>
        </div>
      )}

      <div
        className={cn(
          "flex min-h-screen flex-1 flex-col transition-[margin] duration-300",
          collapsed ? "md:ml-[88px]" : "md:ml-[280px]"
        )}
      >
        <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir menu"
            onClick={() => setMobileOpen(true)}
            className="text-muted-foreground md:hidden"
          >
            <Menu />
          </Button>

          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-sm sm:flex">
            <span className="text-muted-foreground">AnuncIA</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="truncate font-medium">{currentItem.label}</span>
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Buscar no sistema (Ctrl K)"
              className="hidden h-9 w-56 cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-[rgba(255,255,255,0.03)] px-3 text-sm text-muted-foreground transition-colors hover:border-[rgba(255,255,255,0.16)] lg:flex"
            >
              <span className="flex items-center gap-2">
                <Search className="size-4" />
                Buscar...
              </span>
              <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                Ctrl K
              </kbd>
            </button>

            <div className="hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 xl:flex">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              <span className="text-xs text-muted-foreground">Operacional</span>
            </div>

            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                aria-label="Ações rápidas"
                aria-expanded={openMenu === "quick"}
                onClick={() => toggleMenu("quick")}
                className="hidden md:inline-flex"
              >
                <Plus />
                Novo
              </Button>
              {openMenu === "quick" && (
                <>
                  <button
                    type="button"
                    aria-label="Fechar ações rápidas"
                    className="fixed inset-0 z-[45] cursor-default"
                    onClick={() => setOpenMenu(null)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-border bg-surface p-1.5 shadow-2xl">
                    {quickActions.map((action) => (
                      <Link
                        key={action.href + action.label}
                        href={action.href}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-accent"
                      >
                        <action.icon className="size-4 text-primary" />
                        {action.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Notificações, ${unreadCount} não lidas`}
                aria-expanded={openMenu === "notifications"}
                onClick={() => toggleMenu("notifications")}
                className="relative text-muted-foreground"
              >
                <Bell />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
              {openMenu === "notifications" && (
                <>
                  <button
                    type="button"
                    aria-label="Fechar notificações"
                    className="fixed inset-0 z-[45] cursor-default"
                    onClick={() => setOpenMenu(null)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-border bg-surface shadow-2xl">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                      <p className="text-sm font-semibold">Notificações</p>
                      <Badge variant="violet">{unreadCount} novas</Badge>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-1.5">
                      {notifications.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-accent"
                        >
                          <span
                            className={cn(
                              "mt-1.5 size-2 shrink-0 rounded-full",
                              item.unread ? "bg-primary" : "bg-border"
                            )}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{item.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                              {item.description}
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground/70">
                              {item.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button variant="ghost" size="icon" aria-label="Perfil do usuário" className="rounded-full">
              <Avatar className="size-8">
                <AvatarFallback>MC</AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="animate-fade-in mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <Toaster />
    </div>
  );
}