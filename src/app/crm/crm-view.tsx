"use client";

// CRM — Funil de Vendas
// ------------------------------------------------------------------
// Dados REAIS do Supabase (tabela "deals", isolada por usuário via RLS).
// • Na primeira carga, os negócios antigos do localStorage migram
//   sozinhos para o banco (e a chave local é apagada).
// • Sem banco configurado (.env.local ausente) → modo demonstração,
//   usando o mock da camada de serviços (nada quebra).
// • Criar, mover de etapa e excluir já gravam no banco na hora.

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  ArrowRight,
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
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { formatBRL } from "@/lib/format";
import type { Deal, DealStage } from "@/types";

// ---------- Ponte com o banco (Supabase) ----------

// Chave antiga do navegador (fase sem login). Hoje só serve para migração.
const STORAGE_KEY = "anuncia:crm-deals";

// Formato de uma linha da tabela "deals" no Supabase.
// (A tela fala o tipo Deal; aqui traduzimos um formato no outro.)
type LinhaDeal = {
  id: string;
  title: string;
  client_name: string | null;
  value: number | null;
  stage: string;
  probability: number | null;
  owner: string | null;
};

function dealDaLinha(linha: LinhaDeal): Deal {
  return {
    id: linha.id,
    title: linha.title,
    company: linha.client_name ?? "",
    value: Number(linha.value ?? 0),
    stage: linha.stage as Deal["stage"],
    owner: linha.owner ?? "Você",
    probability: Number(linha.probability ?? 50),
  };
}

function parseDealsLocais(raw: string | null): Deal[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is Deal =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        "title" in item
    );
  } catch {
    return [];
  }
}

// Migra os negócios guardados no navegador para o banco.
// Roda uma única vez: se a migração der certo, a chave local é apagada.
async function migrarDealsLocais(supabase: SupabaseClient): Promise<void> {
  const locais = parseDealsLocais(window.localStorage.getItem(STORAGE_KEY));
  if (locais.length === 0) return;

  const { error } = await supabase.from("deals").insert(
    locais.map((deal) => ({
      title: deal.title,
      client_name: deal.company,
      value: deal.value,
      stage: deal.stage,
      probability: deal.probability,
      owner: deal.owner,
    }))
  );

  if (!error) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

// Busca os negócios do dono logado (a RLS filtra pelo user_id sozinha).
// Retorna null quando não há banco configurado → a tela cai no modo demo.
async function coletarDeals(): Promise<Deal[] | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;

  await migrarDealsLocais(supabase);

  const { data, error } = await supabase
    .from("deals")
    .select("id, title, client_name, value, stage, probability, owner")
    .order("created_at", { ascending: false });

  if (error) return null;

  return ((data ?? []) as LinhaDeal[]).map(dealDaLinha);
}

// ---------- Regras visuais do funil ----------

const stageBadgeVariant: Record<
  DealStage,
  "info" | "violet" | "warning" | "success"
> = {
  Qualificação: "info",
  "Proposta Enviada": "violet",
  Negociação: "warning",
  "Contrato Fechado": "success",
};

const stageBarClass: Record<DealStage, string> = {
  Qualificação: "bg-blue-500",
  "Proposta Enviada": "bg-violet-500",
  Negociação: "bg-amber-500",
  "Contrato Fechado": "bg-emerald-500",
};

function groupByStage(list: Deal[]): Record<DealStage, Deal[]> {
  const groups: Record<DealStage, Deal[]> = {
    Qualificação: [],
    "Proposta Enviada": [],
    Negociação: [],
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

const emptyForm = {
  title: "",
  company: "",
  value: "",
  owner: "",
  probability: "",
};

export function CrmView() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modoDemo, setModoDemo] = useState(false);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  // Carga inicial: migra o localStorage e busca os negócios do banco.
  // Todo setState acontece dentro do .then() — regra do nosso ESLint.
  useEffect(() => {
    let ativo = true;
    coletarDeals().then((resultado) => {
      if (!ativo) return;
      if (resultado === null) {
        setModoDemo(true);
        setDeals(crmService.listDeals());
      } else {
        setDeals(resultado);
      }
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, []);

  const visibleDeals = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter(
      (deal) =>
        deal.title.toLowerCase().includes(q) ||
        deal.company.toLowerCase().includes(q)
    );
  }, [deals, query]);

  const allGroups = useMemo(() => groupByStage(deals), [deals]);
  const visibleGroups = useMemo(
    () => groupByStage(visibleDeals),
    [visibleDeals]
  );

  const totalPipeline = useMemo(
    () => deals.reduce((total, deal) => total + deal.value, 0),
    [deals]
  );
  const weightedPipeline = useMemo(
    () =>
      deals.reduce(
        (total, deal) => total + (deal.value * deal.probability) / 100,
        0
      ),
    [deals]
  );
  const openDealsCount = useMemo(
    () => deals.filter((deal) => deal.stage !== "Contrato Fechado").length,
    [deals]
  );
  const closedDealsCount = deals.length - openDealsCount;
  const averageTicket =
    deals.length > 0 ? Math.round(totalPipeline / deals.length) : 0;

  const kpis = [
    {
      label: "Total no funil",
      tip: "Soma do valor de todos os negócios do funil",
      value: formatBRL(totalPipeline),
      sub: `${deals.length} ${deals.length === 1 ? "negócio" : "negócios"} no funil`,
      icon: DollarSign,
    },
    {
      label: "Previsão de Ganhos",
      tip: "Cada valor multiplicado pela chance de fechamento",
      value: formatBRL(Math.round(weightedPipeline)),
      sub: "valor × probabilidade",
      icon: Target,
    },
    {
      label: "Negócios em aberto",
      tip: "Negócios que ainda não viraram contrato",
      value: String(openDealsCount),
      sub: `${closedDealsCount} ${
        closedDealsCount === 1 ? "contrato fechado" : "contratos fechados"
      }`,
      icon: TrendingUp,
    },
    {
      label: "Ticket médio",
      tip: "Valor médio por negócio no funil",
      value: formatBRL(averageTicket),
      sub: "média por negócio",
      icon: Handshake,
    },
  ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroForm(null);

    const probability = Math.min(
      100,
      Math.max(0, Number.parseInt(form.probability, 10) || 50)
    );
    const rascunho = {
      title: form.title.trim(),
      company: form.company.trim(),
      value: Number.parseFloat(form.value) || 0,
      stage: "Qualificação" as Deal["stage"],
      owner: form.owner.trim() || "Você",
      probability,
    };

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      // Modo demonstração: guarda só em memória (some no F5, como antes do login).
      setDeals((atual) => [{ id: `local-${Date.now()}`, ...rascunho }, ...atual]);
    } else {
      setSalvando(true);
      const { data, error } = await supabase
        .from("deals")
        .insert({
          title: rascunho.title,
          client_name: rascunho.company,
          value: rascunho.value,
          stage: rascunho.stage,
          probability: rascunho.probability,
          owner: rascunho.owner,
        })
        .select("id, title, client_name, value, stage, probability, owner")
        .single();
      setSalvando(false);

      if (error || !data) {
        setErroForm(
          "Não consegui salvar no banco. Confira sua conexão e tente de novo."
        );
        return;
      }
      setDeals((atual) => [dealDaLinha(data as LinhaDeal), ...atual]);
    }

    setForm(emptyForm);
    setDialogOpen(false);
  }

  // Move o negócio uma etapa pra frente (+1) ou pra trás (-1).
  // A tela atualiza na hora; o banco recebe o update em seguida.
  async function moverDeEtapa(deal: Deal, direcao: 1 | -1) {
    const indice = dealStageOrder.indexOf(deal.stage);
    const novaEtapa = dealStageOrder[indice + direcao];
    if (!novaEtapa) return;

    setDeals((atual) =>
      atual.map((item) =>
        item.id === deal.id ? { ...item, stage: novaEtapa } : item
      )
    );

    const supabase = getSupabaseBrowser();
    if (supabase && !deal.id.startsWith("local-")) {
      await supabase.from("deals").update({ stage: novaEtapa }).eq("id", deal.id);
    }
  }

  async function excluirDeal(deal: Deal) {
    setDeals((atual) => atual.filter((item) => item.id !== deal.id));

    const supabase = getSupabaseBrowser();
    if (supabase && !deal.id.startsWith("local-")) {
      await supabase.from("deals").delete().eq("id", deal.id);
    }
  }

  // ---------- Tela em carregamento (esqueleto) ----------

  if (carregando) {
    return (
      <div
        className="space-y-6"
        aria-busy="true"
        aria-label="Carregando funil de vendas"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-56 animate-pulse rounded-lg bg-white/10" />
            <div className="h-4 w-80 animate-pulse rounded-lg bg-white/5" />
          </div>
          <div className="h-10 w-36 animate-pulse rounded-xl bg-white/10" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {["kpi-1", "kpi-2", "kpi-3", "kpi-4"].map((chave) => (
            <div
              key={chave}
              className="h-28 animate-pulse rounded-2xl bg-white/5"
            />
          ))}
        </div>
        <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {["col-1", "col-2", "col-3", "col-4"].map((chave) => (
            <div
              key={chave}
              className="h-72 animate-pulse rounded-2xl bg-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Funil de Vendas
            </h1>
            {modoDemo && <Badge variant="outline">Modo demonstração</Badge>}
          </div>
          <p className="text-sm text-white/60">
            Acompanhe cada etapa do funil, da qualificação ao contrato.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Negócio
        </Button>
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

      {/* Distribuição do funil */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Distribuição do funil por etapa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="flex h-3 w-full overflow-hidden rounded-full bg-white/10"
            role="img"
            aria-label="Distribuição do valor do funil por etapa"
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
          aria-label="Buscar negócios"
          className="pl-9"
        />
      </div>

      {/* Kanban do funil */}
      {visibleDeals.length === 0 ? (
        query.trim() ? (
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
          <EmptyState
            icon={Handshake}
            title="Seu funil está vazio"
            description="Cadastre o primeiro negócio e acompanhe ele caminhando da qualificação até o contrato fechado."
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Cadastrar primeiro negócio
              </Button>
            }
          />
        )
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dealStageOrder.map((stage) => {
            const stageDeals = visibleGroups[stage];
            const stageTotal = stageDeals.reduce(
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
                      {stageDeals.length}{" "}
                      {stageDeals.length === 1 ? "negócio" : "negócios"}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-white/60">
                    {formatBRL(stageTotal)}
                  </span>
                </header>

                {stageDeals.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-white/35">
                    Nenhum negócio nesta etapa
                  </div>
                ) : (
                  stageDeals.map((deal) => (
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
                            <Tooltip label="Chance estimada de fechar este negócio">
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

                        {/* Ações do card: mover de etapa e excluir */}
                        <div className="flex items-center justify-between border-t border-white/5 pt-2">
                          <Tooltip label="Voltar uma etapa">
                            <button
                              type="button"
                              onClick={() => void moverDeEtapa(deal, -1)}
                              disabled={
                                dealStageOrder.indexOf(deal.stage) === 0
                              }
                              aria-label={`Voltar ${deal.title} uma etapa`}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                            >
                              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </Tooltip>
                          <div className="flex items-center gap-1">
                            <Tooltip label="Excluir negócio">
                              <button
                                type="button"
                                onClick={() => void excluirDeal(deal)}
                                aria-label={`Excluir ${deal.title}`}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </Tooltip>
                            <Tooltip label="Avançar uma etapa">
                              <button
                                type="button"
                                onClick={() => void moverDeEtapa(deal, 1)}
                                disabled={
                                  dealStageOrder.indexOf(deal.stage) ===
                                  dealStageOrder.length - 1
                                }
                                aria-label={`Avançar ${deal.title} uma etapa`}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                              >
                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </Tooltip>
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

      {/* Modal Novo Negócio */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Negócio</DialogTitle>
            <DialogDescription>
              O negócio entra na coluna Qualificação e fica salvo na sua
              conta — aparece em qualquer dispositivo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="deal-title"
                className="text-xs font-medium text-white/70"
              >
                Título do negócio
              </label>
              <Input
                id="deal-title"
                required
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Ex.: Pacote UGC 10 vídeos"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="deal-company"
                className="text-xs font-medium text-white/70"
              >
                Empresa
              </label>
              <Input
                id="deal-company"
                required
                value={form.company}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    company: event.target.value,
                  }))
                }
                placeholder="Ex.: Loja Solar BR"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="deal-value"
                  className="text-xs font-medium text-white/70"
                >
                  Valor (R$)
                </label>
                <Input
                  id="deal-value"
                  type="number"
                  min="0"
                  value={form.value}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      value: event.target.value,
                    }))
                  }
                  placeholder="15000"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="deal-probability"
                  className="text-xs font-medium text-white/70"
                >
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
              <label
                htmlFor="deal-owner"
                className="text-xs font-medium text-white/70"
              >
                Responsável
              </label>
              <Input
                id="deal-owner"
                value={form.owner}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    owner: event.target.value,
                  }))
                }
                placeholder="Seu nome"
              />
            </div>
            {erroForm && <p className="text-sm text-red-400">{erroForm}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando}>
                {salvando ? "Salvando…" : "Adicionar ao funil"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}