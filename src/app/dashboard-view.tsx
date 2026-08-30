"use client";

// Dashboard — painel verdadeiro (016a) com Infográficos Premium Supremo

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
  Activity,
  Zap,
  BarChart3,
  PieChart,
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

const kpiConfig: Record<string, { icon: LucideIcon; tone: string }> = {
  "Receita do mês": { icon: Wallet, tone: "bg-primary/15 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]" },
  Conversões: { icon: Target, tone: "bg-success/15 text-success shadow-[0_0_15px_rgba(16,185,129,0.2)]" },
  "Campanhas ativas": { icon: Megaphone, tone: "bg-ai/15 text-ai shadow-[0_0_15px_rgba(139,92,246,0.2)]" },
  "ROI Médio": { icon: TrendingUp, tone: "bg-warning/15 text-warning shadow-[0_0_15px_rgba(245,158,11,0.2)]" },
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
  "Meta Ads": "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]",
  "Google Ads": "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]",
  TikTok: "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.4)]",
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

async function coletarDadosReais(supabase: SupabaseClient): Promise<DadosDashboard> {
  const [cli, cam, dea] = await Promise.all([
    supabase.from("clients").select("id, name, company, status, mrr, created_at"),
    supabase.from("campaigns").select("id, name, platform, status, spend, conversions, revenue, created_at"),
    supabase.from("deals").select("id, title, stage, value, created_at"),
  ]);

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
      trend: "up",
    },
    {
      label: "Conversões",
      value: formatNumber(conversoes),
      change: "somando todas as campanhas",
      trend: "up",
    },
    {
      label: "Campanhas ativas",
      value: String(campanhasAtivas.length),
      change: `${campanhas.length} cadastradas no total`,
      trend: "up",
    },
    {
      label: "ROI Médio",
      value: roi === null ? "—" : `${roi.toFixed(1).replace(".", ",")}x`,
      change: "receita ÷ investido nas campanhas",
      trend: "up",
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
  { label: "Novo Cliente", description: "Cadastrar empresa na base", href: "/clientes", icon: Users, tone: "bg-success/15 text-success shadow-[0_0_15px_rgba(16,185,129,0.2)]" },
  { label: "Nova Campanha", description: "Criar campanha multicanal", href: "/campanhas", icon: Megaphone, tone: "bg-primary/15 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]" },
  { label: "Novo Prompt", description: "Salvar prompt reutilizável", href: "/prompts", icon: Sparkles, tone: "bg-ai/15 text-ai shadow-[0_0_15px_rgba(139,92,246,0.2)]" },
  { label: "IA Studio", description: "Gerar copy e roteiros", href: "/ia-studio", icon: Bot, tone: "bg-warning/15 text-warning shadow-[0_0_15px_rgba(245,158,11,0.2)]" },
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
  const maxCanalSpend = Math.max(1, ...dados.canais.map((c) => c.spend));

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

      {/* KPI Cards com Glow e Infográficos em miniatura */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dados.kpis.map((metric) => {
          const config = kpiConfig[metric.label] ?? kpiConfig["Receita do mês"];
          const TrendIcon = trendIcon[metric.trend ?? "neutral"];
          return (
            <Card key={metric.label} className="card-glow relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 size-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/15" />
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <div className={cn("flex size-9 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110", config.tone)}>
                    <config.icon className="size-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">{metric.value}</p>
                
                {/* Mini Gráfico de Pulso Estético */}
                <div className="mt-3 flex items-end gap-1 h-5 w-full opacity-60 group-hover:opacity-150 transition-opacity">
                  {[40, 65, 30, 85, 50, 95, 75, 100].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="flex-1 rounded-t bg-gradient-to-t from-primary/30 to-ai"
                    />
                  ))}
                </div>

                {metric.change && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    <TrendIcon className="size-3.5 text-success" />
                    <span className="text-muted-foreground">{metric.change}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ações Rápidas */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.href + action.label} href={action.href} className="group">
            <Card className="card-glow h-full transition-transform duration-200 hover:-translate-y-1">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110", action.tone)}>
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

      {/* Seção Principal com Infográficos Premium */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Gráfico de Barras Cilíndricas / Infográfico de Clientes */}
        <Card className="xl:col-span-2 card-glow border-border bg-surface/40 backdrop-blur-md">
          <CardHeader className="flex-row items-start justify-between space-y-0 pb-6 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="size-5 text-primary" />
                <CardTitle className="text-lg">Receita do Mês por Cliente</CardTitle>
              </div>
              <CardDescription className="mt-1">Distribuição de MRR e peso de cada operação na base</CardDescription>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block">Total Ativo</span>
              <p className="text-xl font-bold text-gradient">{formatBRL(totalReceitaClientes)}</p>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {dados.receitaClientes.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Nenhum cliente com receita ainda. Cadastre o valor mensal em Clientes para ativar o infográfico.
              </p>
            ) : (
              <div className="flex h-56 items-end gap-4 px-2">
                {dados.receitaClientes.map((cliente, index) => {
                  const percentual = Math.round((cliente.valor / maxReceitaCliente) * 100);
                  return (
                    <div key={cliente.id} className="flex min-w-0 flex-1 flex-col items-center gap-2 group/bar">
                      <span className="text-[11px] font-bold text-primary opacity-0 group-hover/bar:opacity-100 transition-opacity">
                        {formatBRL(cliente.valor)}
                      </span>
                      <div className="flex h-36 w-full items-end rounded-xl bg-background/50 p-1.5 border border-border/40 shadow-inner">
                        <div
                          title={`${cliente.nome}: ${formatBRL(cliente.valor)}`}
                          style={{ height: `${Math.max(15, percentual)}%` }}
                          className={cn(
                            "w-full rounded-lg bg-gradient-to-t transition-all duration-500 group-hover/bar:brightness-125 shadow-lg",
                            index === 0
                              ? "from-blue-600 to-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                              : "from-blue-900/40 to-primary/60",
                          )}
                        />
                      </div>
                      <span className="w-full truncate text-center text-xs font-medium text-muted-foreground group-hover/bar:text-foreground transition-colors">
                        {cliente.nome}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Infográfico de Canais com Indicador Circular Radial / Barras Proporcionais */}
        <Card className="card-glow border-border bg-surface/40 backdrop-blur-md">
          <CardHeader className="pb-4 border-b border-border/60">
            <div className="flex items-center gap-2">
              <PieChart className="size-5 text-ai" />
              <CardTitle className="text-lg">Performance por Canal</CardTitle>
            </div>
            <CardDescription className="mt-1">Investimento vs Retorno por plataforma</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {dados.canais.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Nenhuma campanha cadastrada ainda.
              </p>
            ) : (
              dados.canais.map((item) => {
                const proporcaoInvestimento = Math.round((item.spend / maxCanalSpend) * 100);
                return (
                  <div key={item.platform} className="space-y-2 group/channel">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5">
                        <span className={cn("size-3 rounded-full", item.color)} />
                        <span className="font-semibold text-foreground">{item.platform}</span>
                      </div>
                      <span className="font-mono text-xs font-medium text-emerald-400">{formatBRL(item.spend)}</span>
                    </div>
                    {/* Barra Infográfica Dupla */}
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-background/80 p-0.5 border border-border/60">
                      <div
                        style={{ width: `${Math.max(10, proporcaoInvestimento)}%` }}
                        className={cn("h-full rounded-full transition-all duration-500", item.color)}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
                      <span>{formatNumber(item.conversions)} conversões</span>
                      <span className="text-primary font-medium">Eficiência alta</span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Atividades Recentes & Funil de Vendas */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 card-glow border-border bg-surface/40 backdrop-blur-md">
          <CardHeader className="pb-4 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-success" />
              <CardTitle className="text-lg">Atividades Recentes na Operação</CardTitle>
            </div>
            <CardDescription className="mt-1">Linha do tempo em tempo real dos cadastros e campanhas</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 divide-y divide-border/40">
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
                    className="flex items-center gap-4 py-3.5 first:pt-2 last:pb-2 transition-colors hover:bg-white/[0.02] px-3 rounded-xl"
                  >
                    <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl shadow-md", config.tone)}>
                      <config.icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">{item.message}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.timestamp}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {item.type}
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Funil de Vendas com Infográfico de Proporção */}
        <Card className="card-glow border-border bg-surface/40 backdrop-blur-md">
          <CardHeader className="pb-4 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Zap className="size-5 text-warning" />
              <CardTitle className="text-lg">Funil de Negócios</CardTitle>
            </div>
            <CardDescription className="mt-1">
              {dados.negociosAbertos} abertos · {formatBRL(dados.funilTotal)}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            {dados.funil.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma negociação aberta. O funil enche lá no CRM.
              </p>
            ) : (
              dados.funil.map((etapa) => {
                const larguraPercentual = Math.max(15, Math.round((etapa.value / maxEtapa) * 100));
                return (
                  <div key={etapa.stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-foreground">{etapa.stage}</span>
                      <span className="font-mono text-primary">{formatBRL(etapa.value)}</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-lg bg-background/80 p-0.5 border border-border/60">
                      <div
                        style={{ width: `${larguraPercentual}%` }}
                        className="h-full rounded-md bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
            <div className="rounded-xl border border-border/60 bg-background/40 p-3.5 text-center mt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Ticket Médio em Aberto</p>
              <p className="mt-1 text-xl font-bold text-gradient">
                {dados.ticketMedio === null ? "—" : formatBRL(dados.ticketMedio)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
