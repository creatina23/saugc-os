"use client";

// Tour de boas-vindas — aparece UMA vez por navegador (localStorage).
// Na fase Supabase, o "já vi" passa a ser registrado por usuário.

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Check, Handshake, Kanban, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "anuncia:onboarding-visto";

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedSeen = false;

function readSnapshot(): boolean {
  if (typeof window === "undefined") return cachedSeen;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSeen = raw === "1";
  }
  return cachedSeen;
}

function serverSnapshot(): boolean {
  // No SSR nunca mostramos o tour (evita flash/hidratação)
  return true;
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function markSeen(): void {
  cachedRaw = "1";
  cachedSeen = true;
  window.localStorage.setItem(STORAGE_KEY, "1");
  listeners.forEach((listener) => listener());
}

interface Slide {
  icon: typeof Zap;
  title: string;
  description: string;
  bullets: ReactNode[];
}

const slides: Slide[] = [
  {
    icon: Zap,
    title: "Bem-vindo à AnuncIA",
    description:
      "O sistema operacional da sua produção de anúncios UGC: clientes, campanhas, comerciais e vendas — tudo num lugar só.",
    bullets: [
      "Organize toda a operação num painel único",
      "Produza anúncios com agentes de IA",
      "Acompanhe o dinheiro no funil, em tempo real",
    ],
  },
  {
    icon: Kanban,
    title: "Para onde olhar primeiro",
    description:
      "Quatro módulos resolvem 90% do seu dia. O resto você descobre clicando.",
    bullets: [
      "Dashboard — a visão do dono em 5 segundos",
      "Comerciais — o Kanban da produção de UGC",
      "CRM — do primeiro contato ao contrato fechado",
      "IA Studio — copy e roteiros prontos em segundos",
    ],
  },
  {
    icon: Search,
    title: "Os atalhos que economizam tempo",
    description:
      "Quanto menos cliques, mais rápido você opera. Domine estes três:",
    bullets: [
      <span key="b1">
        <kbd className="rounded-md border border-white/15 bg-white/10 px-1.5 py-0.5 font-mono text-[11px]">
          Ctrl K
        </kbd>{" "}
        — busca qualquer coisa no sistema
      </span>,
      <span key="b2">
        <span className="font-semibold text-white/90">+ Novo</span> — ações
        rápidas no topo da tela
      </span>,
      "Seus deals do CRM ficam salvos neste navegador",
    ],
  },
];

export function Onboarding() {
  const seen = useSyncExternalStore(subscribe, readSnapshot, serverSnapshot);
  const [step, setStep] = useState(0);
  const isOpen = !seen;
  const isLast = step === slides.length - 1;
  const slide = slides[step];
  const SlideIcon = slide.icon;

  // Trava o scroll de fundo + fecha com ESC enquanto o tour está aberto
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") markSeen();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      {/* Fundo: clicar fora = pular tour */}
      <button
        type="button"
        aria-label="Pular tour de boas-vindas"
        onClick={markSeen}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="glass-panel animate-fade-in relative w-full max-w-md space-y-5 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-ai shadow-lg">
            <SlideIcon className="h-6 w-6 text-white" aria-hidden="true" />
          </span>
          <div className="flex items-center gap-2">
            {slides.map((item, index) => (
              <span
                key={item.title}
                aria-hidden="true"
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === step ? "w-6 bg-primary" : "w-1.5 bg-white/15"
                )}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h2
            id="onboarding-title"
            className="text-xl font-bold tracking-tight text-white"
          >
            {slide.title}
          </h2>
          <p className="text-sm leading-relaxed text-white/60">
            {slide.description}
          </p>
        </div>

        <ul className="space-y-2.5">
          {slide.bullets.map((bullet, index) => (
            <li
              key={index}
              className="flex items-start gap-2.5 text-sm text-white/80"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              {bullet}
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={markSeen}
            className="text-xs text-white/40 underline-offset-2 transition-colors hover:text-white/70 hover:underline"
          >
            Pular tour
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep((v) => v - 1)}>
                Voltar
              </Button>
            )}
            {isLast ? (
              <Button onClick={markSeen}>
                <Handshake className="h-4 w-4" />
                Começar a usar
              </Button>
            ) : (
              <Button onClick={() => setStep((v) => v + 1)}>Próximo</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}