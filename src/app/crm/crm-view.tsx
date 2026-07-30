"use client";

// CRM & Pipeline — tela 100% servida pela camada de serviços.
// Deals criados pelo usuário ficam no NAVEGADOR (localStorage):
// sobrevivem ao F5 e são trocados pelo banco na fase Supabase —
// sem mudar uma linha desta tela.

import {
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import {
  Building2,
  DollarSign,
  Handshake,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { crmService, dealStageOrder } from "@/lib/services";
import { formatBRL } from "@/lib/format";
import type { Deal, DealStage } from "@/types";

// ---------- Mini-store persistente (localStorage) ----------

const STORAGE_KEY = "anuncia:crm-deals";

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedDeals: Deal[] = [];

function parseDeals(raw: string | null | undefined): Deal[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is Deal =>
        typeof item === "object" && item !== null && "id" in item && "title" in item
    );
  } catch {
    return [];
  }
}

function readDealsSnapshot(): Deal[] {
  if (typeof window === "undefined") return cachedDeals;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedDeals = parseDeals(raw);
  }
  return cachedDeals;
}

function serverDealsSnapshot(): Deal[] {
  return [];
}

function subscribeDeals(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function writeDeals(deals: Deal[]): void {
  cachedRaw = JSON.stringify(deals);
  cachedDeals = deals;
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  listeners.forEach((listener) => listener());
}

// ---------- Regras visuais do funil ----------

const stageBadgeVariant: Record<DealStage, "info" | "violet" | "warning" | "success"> = {
  "Qualificação": "info",
  "Proposta Enviada": "violet",
  "Negociação": "warning",
  "Contrato Fechado": "success",
};

const stageBarClass: Record<DealStage, string> = {
  "Qualificação": "bg-blue-500",
  "Proposta Enviada": "bg-violet-500",
  "Negociação": "bg-amber-500",
  "Contrato Fechado": "bg-emerald-500",
};

function groupByStage(list: Deal[]): Record<DealStage, Deal[]> {
  const groups: Record<DealStage, Deal[]> = {
    "Qualificação": [],
    "Proposta Enviada": [],
    "Negociação": [],
    "Contrato Fechado": [],
  };
  for (const deal of list) {
    groups[deal.stage].push(deal);
  }
  return groups;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const emptyForm = { title: "", company: "", value: "", owner: "", probability: "" };

export function CrmView() {
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Deals do usuário (persistem no navegador; vazios no SSR)
  const extraDeals = useSyncExternalStore(
    subscribeDeals,
    readDealsSnapshot,
    serverDealsSnapshot
  );

  const allDeals = useMemo(
    () => [...crmService.listDeals(), ...extraDeals],
    [extraDeals]
  );

  const visibleDeals = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allDeals;
    return allDeals.filter(
      (deal) =>
        deal.title.toLowerCase().includes(q) ||
        deal.company.toLowerCase().includes(q)
    );
  }, [allDeals, query]);

  const allGroups = useMemo(() => groupByStage(allDeals), [allDeals]);
  const visibleGroups = useMemo(() => groupByStage(visibleDeals), [visibleDeals]);

  const totalPipeline = useMemo(
    () => allDeals.reduce((total, deal) => total + deal.value, 0),
    [allDeals]
  );
  const weightedPipeline = useMemo(
    () =>
      allDeals.reduce(
        (total, deal) => total + (deal.value * deal.probability) / 100,
        0
      ),
    [allDeals]
  );
  const openDealsCount = useMemo(
    () => allDeals.filter((deal) => deal.stage !== "Contrato Fechado").length,
    [allDeals]
  );
  const averageTicket =
    allDeals.length > 0 ? Math.round(totalPipeline / allDeals.length) : 0;

  const kpis = [
    {
      label: "Total do pipeline",
      tip: "Soma do valor de todos os deals no funil",
      value: formatBRL(totalPipeline),
      sub: `${allDeals.length} deals no funil`,
      icon: DollarSign,
    },
    {
      label: "Pipeline ponderado",
      tip: "Cada valor multiplicado pela chance de fechamento",
      value: formatBRL(Math.round(weightedPipeline)),
      sub: "valor × probabilidade",
      icon: Target,
    },
    {
      label: "Deals em aberto",
      tip: "Deals que ainda não viraram contrato",
      value: String(openDealsCount),
      sub: `${allDeals.length - openDealsCount} contratos fechados`,
      icon: TrendingUp,
    },
    {
      label: "Ticket médio",
      tip: "Valor médio por deal no funil",
      value: formatBRL(averageTicket),
      sub: "média por deal",
      icon: Handshake,
    },
  ];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const probability = Math.min(
      100,
      Math.max(0, Number.parseInt(form.probability, 10) || 50)
    );
    const newDeal: Deal = {
      id: `local-${Date.now()}`,
      title: form.title.trim(),
      company: form.company.trim(),
      value: Number.parseFloat(form.value) || 0,
      stage: "Qualificação",
      owner: form.owner.trim() || "Você",
      probability,
    };
    writeDeals([...extraDeals, newDeal]);
    setForm(emptyForm);
    setDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            CRM & Pipeline
          </h1>
          <p className="text-sm text-white/60">
            Acompanhe cada negociação do funil, da qualificação ao contrato.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {extraDeals.length > 0 && (
            <button
              type="button"
              onClick={() => writeDeals([])}
              className="inline-flex items-center gap-1.5 text-xs text-white/40 underline-offset-2 transition-colors hover:text-white/75 hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Limpar meus deals ({extraDeals.length})
            </button>
          )}
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Deal
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="flex items-start justify-between gap-3 p-5">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-white/50">
                  {kpi.label}
                </p>
                <p className="text-2xl font-bold text-white">{kpi.value}</p>
                <p className="text-xs text-white/40">{kpi.sub}</p>
              </div>
              <Tooltip label={kpi.tip}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <kpi.icon className="h-5 w-5 text-white/70" aria-hidden="true" />
                </span>
              </Tooltip>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Distribuição do pipeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Distribuição do pipeline por etapa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="flex h-3 w-full overflow-hidden rounded-full bg-white/10"
            role="img"
            aria-label="Distribuição do valor do pipeline por etapa"
          >
            {dealStageOrder.map((stage) => {
              const stageTotal = allGroups[stage].reduce(
                (total, deal) => total + deal.value,
                0
              );
              if (stageTotal === 0 || totalPipeline === 0) return null;
              return (
                <div
                  key={stage}
                  className={`${stageBarClass[stage]} h-full transition-all duration-500`}
                  style={{ width: `${(stageTotal / totalPipeline) * 100}%` }}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {dealStageOrder.map((stage) => {
              const stageTotal = allGroups[stage].reduce(
                (total, deal) => total + deal.value,
                0
              );
              const percent =
                totalPipeline > 0
                  ? ((stageTotal / totalPipeline) * 100)
                      .toFixed(1)
                      .replace(".", ",")
                  : "0,0";
              return (
                <div key={stage} className="flex items-center gap-2 text-xs">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${stageBarClass[stage]}`}
                    aria-hidden="true"
                  />
                  <span className="text-white/70">{stage}</span>
                  <span className="font-semibold text-white">
                    {formatBRL(stageTotal)}
                  </span>
                  <span className="text-white/40">({percent}%)</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por título ou empresa…"
          aria-label="Buscar deals"
          className="pl-9"
        />
      </div>

      {/* Kanban do funil */}
      {visibleDeals.length === 0 ? (
        <EmptyState
          icon={Search}
          title={`Nada encontrado para “${query}”`}
          description="Tente outro termo, confira a grafia ou limpe a busca para ver todo o funil."
          action={
            <Button variant="outline" onClick={() => setQuery("")}>
              Limpar busca
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dealStageOrder.map((stage) => {
            const deals = visibleGroups[stage];
            const stageTotal = deals.reduce(
              (total, deal) => total + deal.value,
              0
            );
            return (
              <section
                key={stage}
                aria-label={`Etapa ${stage}`}
                className="flex min-h-[16rem] flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
              >
                <header className="flex items-center justify-between gap-2 px-1 pt-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={stageBadgeVariant[stage]}>{stage}</Badge>
                    <span className="text-xs text-white/40">
                      {deals.length} {deals.length === 1 ? "deal" : "deals"}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-white/60">
                    {formatBRL(stageTotal)}
                  </span>
                </header>

                {deals.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-white/35">
                    Nenhum deal nesta etapa
                  </div>
                ) : (
                  deals.map((deal) => (
                    <Card
                      key={deal.id}
                      className="card-glow transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <CardContent className="space-y-3 p-4">
                        <div>
                          <p className="text-sm font-semibold leading-tight text-white">
                            {deal.title}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-white/50">
                            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                            {deal.company}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-white">
                          {formatBRL(deal.value)}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white/80">
                            {initials(deal.owner)}
                          </span>
                          <span className="text-xs text-white/60">
                            {deal.owner}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-white/45">
                            <Tooltip label="Chance estimada de fechar este deal">
                              <span className="cursor-help underline decoration-dotted decoration-white/30 underline-offset-2">
                                Probabilidade
                              </span>
                            </Tooltip>
                            <span className="font-semibold text-white/70">
                              {deal.probability}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-white/10">
                            <div
                              className={`${stageBarClass[stage]} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Modal Novo Deal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Deal</DialogTitle>
            <DialogDescription>
              O deal entra na coluna Qualificação e fica salvo neste navegador.
              Na fase com login, ele passa a valer para toda a equipe.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="deal-title" className="text-xs font-medium text-white/70">
                Título do deal
              </label>
              <Input
                id="deal-title"
                required
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Ex.: Pacote UGC 10 vídeos"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="deal-company" className="text-xs font-medium text-white/70">
                Empresa
              </label>
              <Input
                id="deal-company"
                required
                value={form.company}
                onChange={(event) =>
                  setForm((current) => ({ ...current, company: event.target.value }))
                }
                placeholder="Ex.: Loja Solar BR"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="deal-value" className="text-xs font-medium text-white/70">
                  Valor (R$)
                </label>
                <Input
                  id="deal-value"
                  type="number"
                  min="0"
                  value={form.value}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, value: event.target.value }))
                  }
                  placeholder="15000"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="deal-probability" className="text-xs font-medium text-white/70">
                  Probabilidade (%)
                </label>
                <Input
                  id="deal-probability"
                  type="number"
                  min="0"
                  max="100"
                  value={form.probability}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      probability: event.target.value,
                    }))
                  }
                  placeholder="50"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="deal-owner" className="text-xs font-medium text-white/70">
                Responsável
              </label>
              <Input
                id="deal-owner"
                value={form.owner}
                onChange={(event) =>
                  setForm((current) => ({ ...current, owner: event.target.value }))
                }
                placeholder="Seu nome"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Adicionar ao funil</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}