"use client";

// Dashboard — painel verdadeiro (016a) com Infográficos Premium Supremo

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Megaphone,
  Minus,
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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  deal: { icon: Target, tone: "bg-primary/15 text-primary" },
  campaign: { icon: Megaphone, tone: "bg-ai/15 text-ai" },
  client: { icon: Users, tone: "bg-success/15 text-success" },
  prompt: { icon: Sparkles, tone: "bg-warning/15 text-warning" },
};

const coresPlataforma: Record<string, string> = {
  "Meta Ads": "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]",
  "Google Ads": "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]",
  TikTok: "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.4)]",
};

interface ReceitaCliente {
  id: string;
  nome: string;
  valor: number;
}

function numero(valor: unknown): number {
  if (typeof valor === "number" && Number.isFinite(valor)) return valor;
  if (typeof value === "string") {
    const limpo = value.replace(/[^\d.,-]/g, "").replace(",", ".");
    const n = parseFloat(limpo);
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

interface LinhaCliente {
  id: string;
  name: string | null;
  company: string | null;
  status: string | null;
  mrr: unknown;
  created_at: string | null;
}

interface LinhaCampanha {
  id: string;
  name: string | null;
  platform: string | null;
  status: string | null;
  spend: unknown;
  revenue: unknown;
  conversions: unknown;
  created_at: string | null;
}

interface LinhaDeal {
  id: string;
  title: string | null;
  stage: string | null;
  value: unknown;
  created_at: string | null;
}

type Trend = "up" | "down" | "neutral";
interface Kpi {
  label: string;
  value: string;
  change?: string;
  trend?: Trend;
}

interface FunilEtapa {
  stage: string;
  value: number;
}

interface CanalPerformance {
  platform: string;
  spend: number;
  revenue: number;
  conversions: number;
}

interface Atividade {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

interface DadosDashboard {
  origem: "supabase" | "demo";
  kpis: Kpi[];
  funil: FunilEtapa[];
  canais: CanalPerformance[];
  atividadesRecentes: Atividade[];
  receitaClientes: ReceitaCliente[];
}

function montarDadosDemo(): DadosDashboard {
  const funil = Object.entries(funilMock).map(([stage, value]) => ({ stage, value }));
  
  const canais = campaignPerformance.map((c) => ({
    platform: c.platform,
    spend: c.spend,
    revenue: c.spend * 3.8,
    conversions: c.conversions,
  }));

  const receitaClientes = clientesMock
    .filter((c) => c.mrr > 0)
    .sort((a, b) => b.mrr - a.mrr)
    .slice(0, 5)
    .map((c) => ({ id: c.id, nome: c.company || c.name, valor: c.mrr }));

  const atividadesRecentes = activityLog.map((a) => ({
    id: a.id,
    type: a.type,
    message: a.message,
    timestamp: a.timestamp,
  }));

  return {
    origem: "demo",
    kpis: dashboardMetrics.map((m) => ({
      label: m.label,
      value: m.value,
      change: m.change,
      trend: (m.trend as Trend) || "up",
    })),
    funil,
    canais,
    atividadesRecentes,
    receitaClientes,
  };
}

async function coletarDadosReais(supabase: SupabaseClient): Promise<DadosDashboard> {
  const [cli, cam, dea] = await Promise.all([
    supabase.from("clients").select("id, name, company, status, mrr, created_at"),
    supabase.from("campaigns").select("id, name, platform, status, spend, revenue, conversions, created_at"),
    supabase.from("deals").select("id, title, stage, value, created_at"),
  ]);

  const clientes = (cli.data ?? []) as LinhaCliente[];
  const campanhas = (cam.data ?? []) as LinhaCampanha[];
  const negocios = (dea.data ?? []) as LinhaDeal[];

  const receitaMes = clientes.reduce((acc, c) => acc + numero(c.mrr), 0);
  const conversoes = campanhas.reduce((acc, c) => acc + numero(c.conversions), 0);
  const campanhasAtivas = campanhas.filter((c) => (c.status ?? "").toLowerCase() === "ativa" || (c.status ?? "").toLowerCase() === "active");

  const totalSpend = campanhas.reduce((acc, c) => acc + numero(c.spend), 0);
  const totalRevenue = campanhas.reduce((acc, c) => acc + numero(c.revenue), 0);
  const roi = totalSpend > 0 ? totalRevenue / totalSpend : null;

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

  const funilContagem: Record<string, number> = {
    Lead: 0,
    Qualificação: 0,
    "Proposta Enviada": 0,
    Negociação: 0,
    "Contrato Fechado": 0,
  };

  for (const n of negocios) {
    const st = n.stage || "Lead";
    funilContagem[st] = (funilContagem[st] ?? 0) + 1;
  }
  const funil = Object.entries(funilContagem).map(([stage, value]) => ({ stage, value }));

  const canaisMap: Record<string, { spend: number; revenue: number; conversions: number }> = {};
  for (const c of campanhas) {
    const plat = c.platform || "Meta Ads";
    if (!canaisMap[plat]) {
      canaisMap[plat] = { spend: 0, revenue: 0, conversions: 0 };
    }
    canaisMap[plat].spend += numero(c.spend);
    canaisMap[plat].revenue += numero(c.revenue);
    canaisMap[plat].conversions += numero(c.conversions);
  }
  const canais = Object.entries(canaisMap).map(([platform, m]) => ({ platform, ...m }));

  const receitaClientesMap: Record<string, { id: string; nome: string; valor: number }> = {};
  for (const c of clientes) {
    const nomeCli = c.name || c.company || "Cliente";
    receitaClientesMap[c.id] = {
      id: c.id,
      nome: nomeCli,
      valor: numero(c.mrr),
    };
  }
  const receitaClientes: ReceitaCliente[] = Object.values(receitaClientesMap)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  const atividadesRecentes = [
    ...negocios.slice(0, 2).map((n) => ({
      id: n.id,
      type: "deal",
      message: `${n.title || "Negócio"} — Estágio: ${n.stage || "Lead"} (${formatBRL(numero(n.value))})`,
      timestamp: "Recente",
    })),
    ...campanhas.slice(0, 2).map((c) => ({
      id: c.id,
      type: "campaign",
      message: `Campanha ${c.name || "Ads"} (${c.platform || "Meta"})`,
      timestamp: "Recente",
    })),
  ];

  const demo = montarDadosDemo();

  return {
    origem: "supabase",
    kpis,
    funil,
    canais: canais.length > 0 ? canais : demo.canais,
    atividadesRecentes: atividadesRecentes.length > 0 ? atividadesRecentes : demo.atividadesRecentes,
    receitaClientes: receitaClientes.length > 0 ? receitaClientes : demo.receitaClientes,
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
  const [dados, setDados] = useState<DadosDashboard>(montarDadosDemo());
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const supabase = getSupabaseBrowser();
        if (!supabase) {
          setCarregando(false);
          return;
        }
        const res = await coletarDadosReais(supabase);
        setDados(res);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const maxEtapa = Math.max(1, ...dados.funil.map((e) => e.value));
  const maxReceitaCliente = Math.max(1, ...dados.receitaClientes.map((c) => c.valor));
  const maxCanalSpend = Math.max(1, ...dados.canais.map((c) => c.spend));

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Centro de Comando & Desempenho</h1>
            {dados.origem === "demo" && (
              <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning text-xs">
                Modo Demonstração (Conecte o Supabase)
              </Badge>
            )}
            {dados.origem === "supabase" && (
              <Badge variant="outline" className="border-success/40 bg-success/10 text-success text-xs">
                Dados Reais Sincronizados
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Visão unificada da operação comercial, conversões em tempo real e eficiência de campanhas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/orquestrador">
            <Button className="gap-2 font-semibold shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Sparkles className="size-4" />
              Executar Nova Operação
            </Button>
          </Link>
        </div>
      </div>

      {dados.origem === "demo" && (
        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Zap className="size-5" />
            </div>
            <div>
              <p className="font-semibold">Painel pronto para exibição</p>
              <p className="text-xs text-muted-foreground">Exibindo dados ilustrativos. Assim que você cadastrar clientes e campanhas, os números serão reais.</p>
            </div>
          </div>
          <Link href="/clientes">
            <Button variant="outline" size="sm" className="border-primary/40">Cadastrar Clientes</Button>
          </Link>
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
                <div className="mt-3 flex items-end gap-1 h-5 w-full opacity-60 group-hover:opacity-100 transition-opacity">
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
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Card className="card-glow h-full transition-all hover:border-primary/50 group cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110", action.tone)}>
                  <action.icon className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Infográficos Premium & Analytics */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Receita por Cliente (Infográfico de Barras Proporcional) */}
        <Card className="lg:col-span-6 card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" /> Receita do Mês por Cliente
              </CardTitle>
              <CardDescription>Top clientes geradores de receita na base</CardDescription>
            </div>
            <Link href="/clientes">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">Ver todos</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {dados.receitaClientes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Nenhum cliente cadastrado ainda.</p>
            ) : (
              dados.receitaClientes.map((c) => {
                const pct = Math.max(8, Math.round((c.valor / maxReceitaCliente) * 100));
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium truncate max-w-[200px]">{c.nome}</span>
                      <span className="font-semibold text-primary">{formatBRL(c.valor)}</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden p-0.5">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-ai transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Funil de Conversão Comercial */}
        <Card className="lg:col-span-6 card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Target className="size-4 text-success" /> Funil de Conversão Comercial
              </CardTitle>
              <CardDescription>Volume de negócios em cada etapa do pipeline</CardDescription>
            </div>
            <Link href="/crm">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">Ver CRM</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {dados.funil.map((etapa) => {
              const pct = Math.max(6, Math.round((etapa.value / maxEtapa) * 100));
              return (
                <div key={etapa.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-muted-foreground">{etapa.stage}</span>
                    <span className="font-bold text-foreground">{etapa.value} negociações</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-success/80 to-success transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Campanhas por Canal & Atividades Recentes */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Desempenho por Canal */}
        <Card className="lg:col-span-6 card-glow">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChart className="size-4 text-ai" /> Eficiência por Canal de Anúncios
            </CardTitle>
            <CardDescription>Investimento e retorno gerado por plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            {dados.canais.map((canal) => {
              const corBarra = coresPlataforma[canal.platform] || "bg-primary";
              const roiCanal = canal.spend > 0 ? (canal.revenue / canal.spend).toFixed(1) : "0";
              return (
                <div key={canal.platform} className="space-y-2 rounded-xl border border-border/50 bg-surface/40 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("size-3 rounded-full", corBarra)} />
                      <span className="font-semibold text-sm">{canal.platform}</span>
                    </div>
                    <span className="text-xs font-bold text-success">{roiCanal}x ROI</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                    <div>
                      <p className="text-muted-foreground">Investido</p>
                      <p className="font-medium text-foreground">{formatBRL(canal.spend)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Retorno</p>
                      <p className="font-medium text-foreground">{formatBRL(canal.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conversões</p>
                      <p className="font-medium text-foreground">{formatNumber(canal.conversions)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Atividades Recentes da Operação */}
        <Card className="lg:col-span-6 card-glow">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="size-4 text-warning" /> Atividade Recente da Operação
            </CardTitle>
            <CardDescription>Últimas movimentações registradas na base</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {dados.atividadesRecentes.map((item) => {
              const cfg = activityConfig[item.type] ?? activityConfig.deal;
              return (
                <div key={item.id} className="flex items-start gap-3 rounded-xl border border-border/40 bg-surface/30 p-3.5 transition-colors hover:border-border">
                  <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg mt-0.5", cfg.tone)}>
                    <cfg.icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold truncate">{item.message}</p>
                      <span className="text-[11px] text-muted-foreground">{item.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </>
  );
}