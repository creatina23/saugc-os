"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { iconMap } from "@/lib/icon-map";
import { navItems } from "@/lib/mock-data";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "./command-palette";
import { GuiaAjuda } from "./guia"; // Guia Vivo — "Como usar esta tela"
import { Onboarding } from "./onboarding"; // tour de boas-vindas
import { Toaster } from "./toaster";

const quickActions = [
  { label: "Novo Cliente", href: "/clientes", icon: Users },
  { label: "Nova Campanha", href: "/campanhas", icon: Megaphone },
  { label: "Novo Prompt", href: "/prompts", icon: Sparkles },
];

type MenuId = "quick" | "user" | null;

// Rotas "de fora": nada de painel, sidebar ou tour — só a página pura
const ROTAS_SEM_SHELL = ["/login"];

// Deriva nome e iniciais a partir do e-mail (ex.: mateus.costa@x.com → "Mateus Costa" / "MC")
function nomeDoUsuario(email: string | null): string {
  if (!email) return "Modo Demo";
  const partes = email.split("@")[0].split(/[._-]+/).filter(Boolean);
  const nome = partes
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  return nome || "Usuário";
}

function iniciaisDoUsuario(email: string | null): string {
  if (!email) return "MD";
  const partes = email.split("@")[0].split(/[._-]+/).filter(Boolean);
  const primeira = partes[0]?.charAt(0) ?? "U";
  const segunda = partes[1]?.charAt(0) ?? partes[0]?.charAt(1) ?? "";
  return (primeira + segunda).toUpperCase();
}

// 016c — lê o endereço da foto de perfil do crachá do usuário
function avatarDoUsuario(metadata: unknown): string | null {
  const meta = metadata as { avatar_url?: string } | undefined;
  return meta?.avatar_url ?? null;
}

// Avatar com foto (ou iniciais como reserva).
// 016d — mora FORA do AppShell por lei do ESLint (react-hooks/static-components):
// componente declarado dentro de outro renasce a cada render e perde estado.
function AvatarUsuario({
  className,
  avatarUrl,
  nome,
  iniciais,
}: {
  className?: string;
  avatarUrl: string | null;
  nome: string;
  iniciais: string;
}) {
  return (
    <Avatar className={className}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={nome} /> : null}
      <AvatarFallback>{iniciais}</AvatarFallback>
    </Avatar>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuId>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [supabaseAtivo, setSupabaseAtivo] = useState(false);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
    setOpenMenu(null);
  }

  const currentItem =
    navItems.find((item) => item.href !== "/" && pathname.startsWith(item.href)) ?? navItems[0];

  // Usuário real da sessão (quando Supabase está configurado) — a foto
  // atualiza sozinha: trocar no Perfil dispara USER_UPDATED aqui.
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      setSupabaseAtivo(Boolean(data.user));
      setUserEmail(data.user?.email ?? null);
      setAvatarUrl(avatarDoUsuario(data.user?.user_metadata));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseAtivo(Boolean(session?.user));
      setUserEmail(session?.user?.email ?? null);
      setAvatarUrl(avatarDoUsuario(session?.user?.user_metadata));
    });

    return () => subscription.unsubscribe();
  }, []);

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

  // Bypass: páginas "de fora" (login) renderizam sozinhas, sem o painel
  if (ROTAS_SEM_SHELL.some((rota) => pathname.startsWith(rota))) {
    return <>{children}</>;
  }

  const nomeUsuario = nomeDoUsuario(userEmail);
  const iniciaisUsuario = iniciaisDoUsuario(userEmail);

  async function handleSair() {
    const supabase = getSupabaseBrowser();
    setOpenMenu(null);
    if (supabase) {
      await supabase.auth.signOut();
      toast("Sessão encerrada", { description: "Até logo! 👋", type: "success" });
    }
    router.push("/login");
    router.refresh();
  }

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
            collapsed && !isMobileDrawer && "sr-only",
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
                collapsed && !isMobileDrawer && "justify-center px-0",
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
            !showFull && "justify-center px-2",
          )}
        >
          {/* Marca AnuncIA — logo oficial "vidro gelo" (arquivo em
              public/logo-anuncia.png; o desenho já traz o próprio vidro,
              então não vai caixa atrás). Tamanho: 47px (36px + 30%). */}
          <Image
            src="/logo-anuncia.png"
            alt="AnuncIA"
            width={47}
            height={47}
            priority
            className="size-[47px] shrink-0 rounded-xl shadow-lg"
          />
          {showFull && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight">AnuncIA</p>
              <p className="truncate text-[11px] text-muted-foreground">central de comando</p>
            </div>
          )}
        </div>

        {/* 016d — varredura de cenográficos: o seletor de workspace saiu de
            cena (não existe plano nem multi-workspace por trás dele — era
            promessa falsa no topo do app). Volta REAL com o lançamento. */}

        {renderNav(isMobileDrawer)}

        <div className={cn("shrink-0 space-y-2 border-t border-border p-3", !showFull && "px-2")}>
          {showFull ? (
            <div className="flex items-center gap-2.5 rounded-xl px-2 py-1.5">
              <AvatarUsuario
                className="size-8"
                avatarUrl={avatarUrl}
                nome={nomeUsuario}
                iniciais={iniciaisUsuario}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{nomeUsuario}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {userEmail ?? "Usuário local"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <AvatarUsuario
                className="size-8"
                avatarUrl={avatarUrl}
                nome={nomeUsuario}
                iniciais={iniciaisUsuario}
              />
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
          collapsed ? "w-[88px]" : "w-[280px]",
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
          collapsed ? "md:ml-[88px]" : "md:ml-[280px]",
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

            {/* 016d — selo de status honesto: o pulso verde só acende com a
                sessão real ativa; sem Supabase, a tela admite "Modo
                demonstração" (ponto âmbar, sem fingir que há banco vivo). */}
            <div className="hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 xl:flex">
              {supabaseAtivo ? (
                <>
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-success" />
                  </span>
                  <span className="text-xs text-muted-foreground">Operacional</span>
                </>
              ) : (
                <>
                  <span className="inline-flex size-2 rounded-full bg-amber-400" />
                  <span className="text-xs text-muted-foreground">Modo demonstração</span>
                </>
              )}
            </div>

            {/* Guia Vivo — "Como usar esta tela": painel de passo a passo da
                página atual (textos em lib/guia-data.ts). Sempre visível,
                inclusive no celular. */}
            <GuiaAjuda />

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

            {/* 016d — sininho cenográfico aposentado: ele mostrava avisos
                inventados. Notificações voltam REAIS numa sprint futura;
                hoje o Dashboard já mostra "Atividades recentes" do banco. */}

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menu do usuário"
                aria-expanded={openMenu === "user"}
                onClick={() => toggleMenu("user")}
                className="rounded-full"
              >
                <AvatarUsuario
                  className="size-8"
                  avatarUrl={avatarUrl}
                  nome={nomeUsuario}
                  iniciais={iniciaisUsuario}
                />
              </Button>
              {openMenu === "user" && (
                <>
                  <button
                    type="button"
                    aria-label="Fechar menu do usuário"
                    className="fixed inset-0 z-[45] cursor-default"
                    onClick={() => setOpenMenu(null)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-border bg-surface shadow-2xl">
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-semibold">{nomeUsuario}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {userEmail ?? "Sessão local (Supabase ausente)"}
                      </p>
                    </div>
                    <div className="p-1.5">
                      <button
                        type="button"
                        onClick={handleSair}
                        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-red-400 transition-colors hover:bg-[rgba(239,68,68,0.08)] hover:text-red-300"
                      >
                        <LogOut className="size-4" />
                        Sair da conta
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="animate-fade-in mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <Toaster />
      <Onboarding /> {/* tour de boas-vindas (1x por navegador) */}
    </div>
  );
}