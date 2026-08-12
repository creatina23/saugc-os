"use client";

// CRM — Funil de Vendas
// ------------------------------------------------------------------
// Dados REAIS do Supabase (tabela "deals", isolada por usuário via RLS).
// • Na primeira carga, os negócios antigos do localStorage migram
//   sozinhos para o banco (e a chave local é apagada).
// • Sem banco configurado (.env.local ausente) → modo demonstração,
//   usando o mock da camada de serviços (nada quebra).
// • Criar, mover de etapa e excluir já gravam no banco na hora.
// • 016b (celular): o Kanban deixa de empilhar e vira trilho que
//   desliza pro lado com imã (snap); a partir do tablet volta ao grid.
// • 016d — metade inferior reconstruída após corte da colagem (a tela
//   de carga parava na linha 384; kanban e modal nasceram de novo).

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
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

  // ---------- Tela principal ----------

  return (
    <>
      {/* Cabeçalho da página */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Funil de Vendas</h1>
            {modoDemo && <Badge variant="warning">Modo demonstração</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            No celular, deslize o funil para o lado — cada etapa trava na tela
            com ímã.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus /> Novo Negócio
        </Button>
      </div>

      {/* KPIs do funil — passe o mouse sobre o cartão para ver a conta */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="card-glow" title={kpi.tip}>
            <CardContent className="flex items-start gap-3 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <kpi.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="truncate text-xl font-bold">{kpi.value}</p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {kpi.sub}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Busca */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por negócio ou empresa..."
              aria-label="Buscar negócios"
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Kanban — 016b: trilho com ímã no celular; grade a partir do tablet */}
      {visibleDeals.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <Target className="size-8 text-muted-foreground" />
            {query.trim() !== "" ? (
              <>
                <p className="mt-3 font-medium">Nenhum negócio encontrado</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nada bate com a busca “{query.trim()}”.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setQuery("")}
                >
                  Limpar busca
                </Button>
              </>
            ) : (
              <>
                <p className="mt-3 font-medium">Seu funil está vazio</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Cadastre o primeiro negócio e empurre-o de etapa até o
                  contrato fechado.
                </p>
                <Button
                  size="sm"
                  className="mt-4"
                  onClick={() => setDialogOpen(true)}
                >
                  <Plus /> Cadastrar primeiro negócio
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-4">
          {dealStageOrder.map((etapa) => (
            <section
              key={etapa}
              aria-label={`Etapa ${etapa}`}
              className="flex w-[80vw] max-w-[320px] shrink-0 snap-center flex-col rounded-2xl border border-border bg-[rgba(255,255,255,0.02)] p-3 md:w-auto md:max-w-none md:snap-align-none"
            >
              <header className="flex items-center justify-between px-1 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full ${stageBarClass[etapa]}`}
                  />
                  <h2 className="text-sm font-semibold">{etapa}</h2>
                </div>
                <Badge variant="secondary">{allGroups[etapa].length}</Badge>
              </header>
              <div className="flex flex-1 flex-col gap-3">
                {visibleGroups[etapa].length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                    Nada aqui por enquanto
                  </p>
                ) : (
                  visibleGroups[etapa].map((deal) => (
                    <Card key={deal.id} className="card-glow">
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm leading-snug font-medium">
                            {deal.title}
                          </p>
                          <button
                            type="button"
                            aria-label={`Excluir ${deal.title}`}
                            onClick={() => void excluirDeal(deal)}
                            className="shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-red-400"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        {deal.company && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Building2 className="size-3.5 shrink-0" />
                            <span className="truncate">{deal.company}</span>
                          </p>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold">
                            {formatBRL(deal.value)}
                          </span>
                          <Badge variant={stageBadgeVariant[etapa]}>
                            {deal.probability}% de chance
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary">
                              {initials(deal.owner)}
                            </span>
                            <span className="truncate text-[11px] text-muted-foreground">
                              {deal.owner}
                            </span>
                          </span>
                          <span className="flex shrink-0 gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Voltar ${deal.title} uma etapa`}
                              disabled={
                                dealStageOrder.indexOf(deal.stage) === 0
                              }
                              onClick={() => void moverDeEtapa(deal, -1)}
                              className="size-7 text-muted-foreground"
                            >
                              <ArrowLeft />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Avançar ${deal.title} uma etapa`}
                              disabled={
                                dealStageOrder.indexOf(deal.stage) ===
                                dealStageOrder.length - 1
                              }
                              onClick={() => void moverDeEtapa(deal, 1)}
                              className="size-7 text-muted-foreground"
                            >
                              <ArrowRight />
                            </Button>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Modal Novo Negócio */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo negócio</DialogTitle>
            <DialogDescription>
              Ele entra na primeira etapa do funil, “Qualificação”.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="deal-title"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Nome do negócio
              </label>
              <Input
                id="deal-title"
                value={form.title}
                onChange={(event) =>
                  setForm((atual) => ({ ...atual, title: event.target.value }))
                }
                placeholder="Ex.: Gestão de tráfego — Clínica Vitta"
              />
            </div>
            <div>
              <label
                htmlFor="deal-company"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Empresa / cliente
              </label>
              <Input
                id="deal-company"
                value={form.company}
                onChange={(event) =>
                  setForm((atual) => ({
                    ...atual,
                    company: event.target.value,
                  }))
                }
                placeholder="Ex.: Clínica Vitta"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="deal-value"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Valor (R$)
                </label>
                <Input
                  id="deal-value"
                  inputMode="decimal"
                  value={form.value}
                  onChange={(event) =>
                    setForm((atual) => ({
                      ...atual,
                      value: event.target.value,
                    }))
                  }
                  placeholder="2500"
                />
              </div>
              <div>
                <label
                  htmlFor="deal-probability"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Chance (%)
                </label>
                <Input
                  id="deal-probability"
                  inputMode="numeric"
                  value={form.probability}
                  onChange={(event) =>
                    setForm((atual) => ({
                      ...atual,
                      probability: event.target.value,
                    }))
                  }
                  placeholder="50"
                />
              </div>
              <div>
                <label
                  htmlFor="deal-owner"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Responsável
                </label>
                <Input
                  id="deal-owner"
                  value={form.owner}
                  onChange={(event) =>
                    setForm((atual) => ({
                      ...atual,
                      owner: event.target.value,
                    }))
                  }
                  placeholder="Você"
                />
              </div>
            </div>
            {erroForm && (
              <p role="alert" className="text-sm text-red-400">
                {erroForm}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando || !form.title.trim()}>
                {salvando ? "Salvando…" : "Adicionar ao funil"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}