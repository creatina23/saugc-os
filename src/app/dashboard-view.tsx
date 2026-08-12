"use client";

// Dashboard — painel verdadeiro (016a)
// ------------------------------------------------------------------
// Cada número é CALCULADO do banco do dono (clients, campaigns, deals,
// briefings). Sem Supabase configurado → modo demonstração com selo
// visível. "Trajetória de Receita" (6 meses cenográficos) foi aposentada
// pela lei da Verdade na Tela: entrou "Receita do mês por cliente".
// ------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Cog,
  FileText,
  Handshake,
  Megaphone,
  Minus,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBRL, formatNumber } from "@/lib/format";
import {
  activityLog,
  campaignPerformance,
  clients as clientesMock,
  dashboardMetrics,
  deals as dealsMock,
  pipelineValueByStage as funilMock,
} from "@/lib/mock-data";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

// Rótulos dos cartões — SEMPRE entre aspas (têm espaço/acento; sem aspas
// o código quebra, aprendizado do Passo 015d).
const kpiConfig: Record<string, { icon: LucideIcon; tone: string }> = {
  "Receita do mês": { icon: Wallet, tone: "bg-primary/15 text-primary" },
  Conversões: { icon: Target, tone: "bg-success/15 text-success" },
  "Campanhas ativas": { icon: Megaphone, tone: "bg-ai/15 text-ai" },
  "ROI Médio": { icon: TrendingUp, tone: "bg-warning/15 text-warning" },
};

const activityConfig: Record<string, { icon: LucideIcon; tone: string }> = {
  campaign: { icon: Megaphone, tone: "bg-primary/15 text-primary" },
  deal: { icon: Handshake, tone: "bg-warning/15 text-warning" },
  client: { icon: Users, tone: "bg-success/15 text-success" },
  asset: { icon: FileText, tone: "bg-ai/15 text-ai" },
  briefing: { icon: FileText, tone: "bg-warning/15 text-warning" },
  system: { icon: Cog, tone: "bg-secondary text-muted-foreground" },
};

const coresPlataforma: Record<string, string> = {
  "Meta Ads": "bg-blue-500",
  "Google Ads": "bg-red-500",
  TikTok: "bg-violet-500",
};

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function dataCurta(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

function numero(valor: unknown): number {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

// ---- Linhas crus do banco ----
interface LinhaCliente {
  id: string;
  name: string | null;
  company: string | null;
  status: string | null;
  mrr: number | string | null;
  created_at: string | null;
}
interface LinhaCampanha {
  id: string;
  name: string | null;
  platform: string | null;
  status: string | null;
  spend: number | string | null;
  conversions: number | string | null;
  revenue: number | string | null;
  created_at: string | null;
}
interface LinhaDeal {
  id: string;
  title: string | null;
  stage: string | null;
  value: number | string | null;
  created_at: string | null;
}

// ---- Forma normalizada que a tela consome ----
type Trend = "up" | "down" | "neutral";
interface Kpi {
  label: string;
  value: string;
  change?: string;
  trend?: Trend;
}
interface Canal {
  platform: string;
  spend: number;
  conversions: number;
  color: string;
}
interface FunilEtapa {
  stage: string;
  value: number;
}
interface Atividade {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}
interface ReceitaCliente {
  id: string;
  nome: string;
  valor: number;
}
interface DadosDashboard {
  kpis: Kpi[];
  canais: Canal[];
  funil: FunilEtapa[];
  funilTotal: number;
  negociosAbertos: number;
  ticketMedio: number | null;
  atividades: Atividade[];
  receitaClientes: ReceitaCliente[];
}

// ---- MODO DEMO: espelha os mocks ----
function montarDadosDemo(): DadosDashboard {
  const funil = Object.entries(funilMock).map(([stage, value]) => ({ stage, value }));
  const funilTotal = funil.reduce((acc, etapa) => acc + etapa.value, 0);
  const negociosAbertos = dealsMock.filter((d) => d.stage !== "Contrato Fechado").length;
  const receitaClientes = clientesMock
    .filter((c) => c.mrr > 0)
    .sort((a, b) => b.mrr - a.mrr)
    .slice(0, 6)
    .map((c) => ({ id: c.id, nome: c.company || c.name, valor: c.mrr }));
  return {
    kpis: dashboardMetrics.map((m) => ({ label: m.label, value: m.value, change: m.change, trend: m.trend })),
    canais: campaignPerformance.map((c) => ({
      platform: c.platform,
      spend: c.spend,
      conversions: c.conversions,
      color: c.color,
    })),
    funil,
    funilTotal,
    negociosAbertos,
    ticketMedio: dealsMock.length > 0 ? Math.round(funilTotal / dealsMock.length) : null,
    atividades: activityLog.map((a) => ({
      id: a.id,
      type: a.type,
      message: a.message,
      timestamp: a.timestamp,
    })),
    receitaClientes,
  };
}

// ---- MODO REAL: calcula tudo do banco ----
async function coletarDadosReais(supabase: SupabaseClient): Promise<DadosDashboard> {
  const [cli, cam, dea] = await Promise.all([
    supabase.from("clients").select("id, name, company, status, mrr, created_at"),
    supabase.from("campaigns").select("id, name, platform, status, spend, conversions, revenue, created_at"),
    supabase.from("deals").select("id, title, stage, value, created_at"),
  ]);

  for (const [nome, res] of [
    ["clientes", cli],
    ["campanhas", cam],
    ["negociações", dea],
  ] as const) {
    if (res.error) {
      toast(`Não consegui ler ${nome} para o painel`, {
        description: `Detalhe técnico: ${res.error.message}`,
        type: "error",
      });
    }
  }

  const clientes = (cli.data ?? []) as LinhaCliente[];
  const campanhas = (cam.data ?? []) as LinhaCampanha[];
  const negocios = (dea.data ?? []) as LinhaDeal[];

  const receitaMes = clientes.reduce((acc, c) => acc + numero(c.mrr), 0);
  const campanhasAtivas = campanhas.filter((c) => c.status === "Ativa");
  const conversoes = campanhas.reduce((acc, c) => acc + numero(c.conversions), 0);
  const investido = campanhas.reduce((acc, c) => acc + numero(c.spend), 0);
  const receitaCampanhas = campanhas.reduce((acc, c) => acc + numero(c.revenue), 0);
  const roi = investido > 0 ? receitaCampanhas / investido : null;

  const kpis: Kpi[] = [
    {
      label: "Receita do mês",
      value: formatBRL(receitaMes),
      change: `soma dos ${clientes.length} clientes da base`,
    },
    {
      label: "Conversões",
      value: formatNumber(conversoes),
      change: "somando todas as campanhas",
    },
    {
      label: "Campanhas ativas",
      value: String(campanhasAtivas.length),
      change: `${campanhas.length} cadastradas no total`,
    },
    {
      label: "ROI Médio",
      value: roi === null ? "—" : `${roi.toFixed(1).replace(".", ",")}x`,
      change: "receita ÷ investido nas campanhas",
    },
  ];

  const mapaCanais = new Map<string, Canal>();
  for (const c of campanhas) {
    const plataforma = c.platform || "Sem plataforma";
    const atual = mapaCanais.get(plataforma) ?? {
      platform: plataforma,
      spend: 0,
      conversions: 0,
      color: coresPlataforma[plataforma] ?? "bg-slate-500",
    };
    atual.spend += numero(c.spend);
    atual.conversions += numero(c.conversions);
    mapaCanais.set(plataforma, atual);
  }
  const canais = [...mapaCanais.values()].sort((a, b) => b.spend - a.spend).slice(0, 4);

  const abertos = negocios.filter((d) => d.stage && d.stage !== "Contrato Fechado");
  const mapaFunil = new Map<string, number>();
  for (const d of abertos) {
    mapaFunil.set(d.stage as string, (mapaFunil.get(d.stage as string) ?? 0) + numero(d.value));
  }
  const funil = [...mapaFunil.entries()]
    .map(([stage, value]) => ({ stage, value }))
    .sort((a, b) => b.value - a.value);
  const funilTotal = funil.reduce((acc, e) => acc + e.value, 0);

  const atividades: Atividade[] = [
    ...clientes.map((c) => ({
      id: `cli-${c.id}`,
      type: "client",
      message: `Cliente cadastrado: ${c.company || c.name || "Sem nome"}`,
      timestamp: dataCurta(c.created_at),
      quando: c.created_at ?? "",
    })),
    ...campanhas.map((c) => ({
      id: `cam-${c.id}`,
      type: "campaign",
      message: `Campanha criada: ${c.name || "Sem nome"}`,
      timestamp: dataCurta(c.created_at),
      quando: c.created_at ?? "",
    })),
  ]
    .sort((a, b) => (a.quando < b.quando ? 1 : -1))
    .slice(0, 6)
    .map(({ id, type, message, timestamp }) => ({ id, type, message, timestamp }));

  const receitaClientes = clientes
    .map((c) => ({ id: c.id, nome: c.company || c.name || "Sem nome", valor: numero(c.mrr) }))
    .filter((c) => c.valor > 0)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 6);

  return {
    kpis,
    canais,
    funil,
    funilTotal,
    negociosAbertos: abertos.length,
    ticketMedio: abertos.length > 0 ? Math.round(funilTotal / abertos.length) : null,
    atividades,
    receitaClientes,
  };
}

const quickActions = [
  { label: "Novo Cliente", description: "Cadastrar empresa na base", href: "/clientes", icon: Users, tone: "bg-success/15 text-success" },
  { label: "Nova Campanha", description: "Criar campanha multicanal", href: "/campanhas", icon: Megaphone, tone: "bg-primary/15 text-primary" },
  { label: "Novo Prompt", description: "Salvar prompt reutilizável", href: "/prompts", icon: Sparkles, tone: "bg-ai/15 text-ai" },
  { label: "IA Studio", description: "Gerar copy e roteiros", href: "/ia-studio", icon: Bot, tone: "bg-warning/15 text-warning" },
];

const trendIcon = { up: ArrowUpRight, down: ArrowDownRight, neutral: Minus } as const;

export function DashboardView() {
  const supabase = useMemo(() => getSupabaseBrowser(), []);
  const [dadosReais, setDadosReais] = useState<DadosDashboard | null>(null);
  const [carregando, setCarregando] = useState(() => Boolean(supabase));

  const modoDemo = !supabase;

  useEffect(() => {
    if (!supabase) return;
    let ativo = true;
    coletarDadosReais(supabase).then((dados) => {
      if (!ativo) return;
      setDadosReais(dados);
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, [supabase]);

  if (supabase && (carregando || !dadosReais)) {
    return (
      <>
        <PageHeader title="Dashboard" description="Visão geral da sua operação, num relance." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Carregando painel">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          <Skeleton className="h-64 w-full rounded-2xl xl:col-span-2" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </>
    );
  }

  const dados = supabase ? dadosReais! : montarDadosDemo();
  const totalConversoes = dados.canais.reduce((acc, c) => acc + c.conversions, 0);
  const maxEtapa = Math.max(1, ...dados.funil.map((e) => e.value));
  const totalReceitaClientes = dados.receitaClientes.reduce((acc, c) => acc + c.valor, 0);
  const maxReceitaCliente = Math.max(1, ...dados.receitaClientes.map((c) => c.valor));

  return (
    <>
      <PageHeader title="Dashboard" description="Visão geral da sua operação, num relance.">
        <Button variant="secondary" asChild>
          <Link href="/campanhas">
            <Plus /> Nova Campanha
          </Link>
        </Button>
        <Button variant="ai" asChild>
          <Link href="/ia-studio">
            <Sparkles /> Gerar com IA
          </Link>
        </Button>
      </PageHeader>

      {modoDemo && (
        <div className="mb-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
          Modo demonstração — os números abaixo são de exemplo. Entre com sua conta real para ver os seus.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dados.kpis.map((metric) => {
          const config = kpiConfig[metric.label] ?? kpiConfig["Receita do mês"];
          const TrendIcon = trendIcon[metric.trend ?? "neutral"];
          return (
            <Card key={metric.label} className="card-glow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <div className={cn("flex size-9 items-center justify-center rounded-lg", config.tone)}>
                    <config.icon className="size-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">{metric.value}</p>
                {metric.change && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    {metric.trend && (
                      <TrendIcon
                        className={cn(
                          "size-3.5",
                          metric.trend === "up" && "text-success",
                          metric.trend === "down" && "text-destructive",
                          metric.trend === "neutral" && "text-muted-foreground",
                        )}
                      />
                    )}
                    <span className="text-muted-foreground">{metric.change}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.href + action.label} href={action.href} className="group">
            <Card className="card-glow h-full">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", action.tone)}>
                  <action.icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{action.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Receita do mês por cliente</CardTitle>
              <CardDescription>Quanto cada cliente representa na sua receita</CardDescription>
            </div>
            <p className="text-lg font-bold">{formatBRL(totalReceitaClientes)}</p>
          </CardHeader>
          <CardContent>
            {dados.receitaClientes.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum cliente com receita ainda. Cadastre o valor mensal de cada cliente e este gráfico ganha vida.
              </p>
            ) : (
              <div className="flex h-44 items-end gap-3">
                {dados.receitaClientes.map((cliente, index) => (
                  <div key={cliente.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {formatBRL(cliente.valor)}
                    </span>
                    <div className="flex h-28 w-full items-end">
                      <div
                        title={`${cliente.nome}: ${formatBRL(cliente.valor)}`}
                        style={{ height: `${Math.round((cliente.valor / maxReceitaCliente) * 100)}%` }}
                        className={cn(
                          "w-full rounded-t-lg bg-gradient-to-t transition-all duration-300 hover:brightness-125",
                          index === 0 ? "from-primary to-ai" : "from-primary/40 to-ai/40",
                        )}
                      />
                    </div>
                    <span className="w-full truncate text-center text-xs text-muted-foreground">
                      {cliente.nome}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance por Canal</CardTitle>
            <CardDescription>Investimento e conversões das suas campanhas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {dados.canais.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma campanha cadastrada ainda. Crie a primeira em Campanhas.
              </p>
            ) : (
              dados.canais.map((item) => (
                <div key={item.platform}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={cn("size-2.5 rounded-full", item.color)} />
                      <span className="font-medium">{item.platform}</span>
                    </div>
                    <span className="text-muted-foreground">{formatBRL(item.spend)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      style={{
                        width: totalConversoes > 0 ? `${Math.round((item.conversions / totalConversoes) * 100)}%` : "0%",
                      }}
                      className={cn("h-full rounded-full", item.color)}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {formatNumber(item.conversions)} conversões
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimos registros da operação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {dados.atividades.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nada por aqui ainda. Seus próximos cadastros aparecem nesta linha do tempo.
              </p>
            ) : (
              dados.atividades.map((item) => {
                const config = activityConfig[item.type] ?? activityConfig.system;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-accent"
                  >
                    <div className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg", config.tone)}>
                      <config.icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug">{item.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.timestamp}</p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Negociações em andamento</CardTitle>
            <CardDescription>
              {dados.negociosAbertos} negociações ativas · {formatBRL(dados.funilTotal)} em funil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {dados.funil.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma negociação aberta. O funil enche lá no CRM.
              </p>
            ) : (
              dados.funil.map((etapa) => (
                <div key={etapa.stage}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">{etapa.stage}</span>
                    <span className="text-muted-foreground">{formatBRL(etapa.value)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      style={{ width: `${Math.round((etapa.value / maxEtapa) * 100)}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-ai"
                    />
                  </div>
                </div>
              ))
            )}
            <div className="rounded-xl border border-dashed border-border p-3 text-center">
              <p className="text-xs text-muted-foreground">Ticket médio em aberto</p>
              <p className="mt-1 text-lg font-bold">
                {dados.ticketMedio === null ? "—" : formatBRL(dados.ticketMedio)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}