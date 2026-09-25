"use client";

// Dashboard — painel verdadeiro (016a) com Infográficos Premium Supremo

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bot,
  Briefcase,
  CircleDollarSign,
  Megaphone,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Activity,
  Zap,
  BarChart3,
  PieChart,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBRL, formatNumber, formatPercent } from "@/lib/format";
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
  MRR: { icon: Wallet, tone: "bg-primary/15 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]" },
  Conversões: { icon: Target, tone: "bg-success/15 text-success shadow-[0_0_15px_rgba(16,185,129,0.2)]" },
  "Campanhas ativas": { icon: Megaphone, tone: "bg-ai/15 text-ai shadow-[0_0_15px_rgba(139,92,246,0.2)]" },
  "ROI Médio": { icon: TrendingUp, tone: "bg-warning/15 text-warning shadow-[0_0_15px_rgba(245,158,11,0.2)]" },
  "ROI Global": { icon: TrendingUp, tone: "bg-warning/15 text-warning shadow-[0_0_15px_rgba(245,158,11,0.2)]" },
  "Oportunidades abertas": { icon: Briefcase, tone: "bg-success/15 text-success shadow-[0_0_15px_rgba(16,185,129,0.2)]" },
  "Pipeline aberto": { icon: CircleDollarSign, tone: "bg-ai/15 text-ai shadow-[0_0_15px_rgba(139,92,246,0.2)]" },
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
  if (typeof valor === "string") {
    const limpo = valor.replace(/[^\d.,-]/g, "").replace(",", ".");
    const n = parseFloat(limpo);
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

// TR-04.8D.1: data curta real para as atualizações derivadas ("12 ago 2026")
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function dataCurta(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

// TR-04.8D.2a: BRL com centavos p/ CPC (formatBRL arredonda para inteiro).
function brl2(valor: number): string {
  return `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  impressions: unknown;
  clicks: unknown;
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

// TR-04.8D.2a: KPI sem "trend" — subtexto apenas factual (fonte/cálculo).
interface Kpi {
  label: string;
  value: string;
  sub?: string;
}

// TR-04.8D.2a: funil por VALOR (R$) — dados reais de deals.value/stage.
interface FunilValorEtapa {
  stage: string;
  valor: number;
  quantidade: number;
}

interface CanalPerformance {
  platform: string;
  spend: number;
  impressions: number;
  clicks: number;
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
  kpis: Kpi[];
  // TR-04.8D.2a: pulso comercial (deals reais) + funil por valor
  oportunidadesAbertas: number;
  pipelineAberto: number;
  ticketMedioAberto: number | null;
  funilValor: FunilValorEtapa[];
  canais: CanalPerformance[];
  atividadesRecentes: Atividade[];
  receitaClientes: ReceitaCliente[];
}

function montarDadosDemo(): DadosDashboard {
  // TR-04.8D.2a: demo selada — funil por valor deriva do mock (ilustrativo).
  const abertosMock = dealsMock.filter((d) => d.stage !== "Contrato Fechado");
  const pipelineAberto = abertosMock.reduce((acc, d) => acc + numero(d.value), 0);
  const funilValor: FunilValorEtapa[] = Object.entries(funilMock)
    .filter(([stage]) => stage !== "Contrato Fechado")
    .map(([stage, valor]) => ({
      stage,
      valor,
      quantidade: abertosMock.filter((d) => d.stage === stage).length,
    }));

  const canais = campaignPerformance.map((c) => ({
    platform: c.platform,
    spend: c.spend,
    // mock não tem impressões/cliques — CTR/CPC exibem "—" (nada inventado)
    impressions: 0,
    clicks: 0,
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
    kpis: dashboardMetrics.map((m) => ({
      label: m.label,
      value: m.value,
      sub: m.change,
    })),
    oportunidadesAbertas: abertosMock.length,
    pipelineAberto,
    ticketMedioAberto: abertosMock.length > 0 ? pipelineAberto / abertosMock.length : null,
    funilValor,
    canais,
    atividadesRecentes,
    receitaClientes,
  };
}

// TR-04.8D.1: erro por fonte — res.error nunca vira "zero dados" silencioso.
type FonteErro = {
  clientes: string | null;
  campanhas: string | null;
  negocios: string | null;
};

async function coletarDadosReais(
  supabase: SupabaseClient
): Promise<{ dados: DadosDashboard; erros: FonteErro }> {
  const [cli, cam, dea] = await Promise.all([
    supabase.from("clients").select("id, name, company, status, mrr, created_at"),
    supabase.from("campaigns").select("id, name, platform, status, spend, impressions, clicks, revenue, conversions, created_at"),
    supabase.from("deals").select("id, title, stage, value, created_at"),
  ]);

  const erros: FonteErro = {
    clientes: cli.error ? cli.error.message : null,
    campanhas: cam.error ? cam.error.message : null,
    negocios: dea.error ? dea.error.message : null,
  };

  const clientes = (cli.data ?? []) as LinhaCliente[];
  const campanhas = (cam.data ?? []) as LinhaCampanha[];
  const negocios = (dea.data ?? []) as LinhaDeal[];

  const receitaMes = clientes.reduce((acc, c) => acc + numero(c.mrr), 0);
  const conversoes = campanhas.reduce((acc, c) => acc + numero(c.conversions), 0);
  const campanhasAtivas = campanhas.filter((c) => (c.status ?? "").toLowerCase() === "ativa" || (c.status ?? "").toLowerCase() === "active");

  const totalSpend = campanhas.reduce((acc, c) => acc + numero(c.spend), 0);
  const totalRevenue = campanhas.reduce((acc, c) => acc + numero(c.revenue), 0);
  const roi = totalSpend > 0 ? totalRevenue / totalSpend : null;

  // TR-04.8D.2a: pulso comercial real (deals) — aberto = stage ≠ "Contrato
  // Fechado". Sem ponderação por probabilidade e sem forecast nesta fase.
  const abertos = negocios.filter((n) => (n.stage || "") !== "Contrato Fechado");
  const pipelineAberto = abertos.reduce((acc, n) => acc + numero(n.value), 0);
  const ticketMedioAberto = abertos.length > 0 ? pipelineAberto / abertos.length : null;

  // TR-04.8D.1/2a: sem "trend" inventado — subtextos descrevem o cálculo real.
  const kpis: Kpi[] = [
    {
      label: "MRR",
      value: formatBRL(receitaMes),
      sub: `soma dos ${clientes.length} clientes da base`,
    },
    {
      label: "Conversões",
      value: formatNumber(conversoes),
      sub: `somando ${campanhas.length} campanhas`,
    },
    {
      label: "Campanhas ativas",
      value: String(campanhasAtivas.length),
      sub: `${campanhas.length} cadastradas no total`,
    },
    {
      label: "ROI Global",
      value: roi === null ? "—" : `${roi.toFixed(1).replace(".", ",")}x`,
      sub: "receita ÷ investido nas campanhas",
    },
    {
      label: "Oportunidades abertas",
      value: String(abertos.length),
      sub:
        ticketMedioAberto === null
          ? "nenhum negócio aberto no CRM"
          : `ticket médio ${formatBRL(ticketMedioAberto)}`,
    },
    {
      label: "Pipeline aberto",
      value: formatBRL(pipelineAberto),
      sub: `${abertos.length} oportunidade${abertos.length === 1 ? "" : "s"} em andamento`,
    },
  ];

  // TR-04.8D.2a: funil por VALOR — agrupa os estágios reais presentes nos
  // dados (stage é texto livre no CRM), na ordem do processo comercial.
  const ORDEM_ETAPAS = ["Lead", "Qualificação", "Proposta Enviada", "Negociação"];
  const porEtapa: Record<string, { valor: number; quantidade: number }> = {};
  for (const n of abertos) {
    const st = n.stage || "Lead";
    if (!porEtapa[st]) porEtapa[st] = { valor: 0, quantidade: 0 };
    porEtapa[st].valor += numero(n.value);
    porEtapa[st].quantidade += 1;
  }
  const funilValor: FunilValorEtapa[] = Object.entries(porEtapa)
    .sort(([a], [b]) => {
      const ia = ORDEM_ETAPAS.indexOf(a);
      const ib = ORDEM_ETAPAS.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    })
    .map(([stage, m]) => ({ stage, valor: m.valor, quantidade: m.quantidade }));

  const canaisMap: Record<string, { spend: number; impressions: number; clicks: number; revenue: number; conversions: number }> = {};
  for (const c of campanhas) {
    const plat = c.platform || "Meta Ads";
    if (!canaisMap[plat]) {
      canaisMap[plat] = { spend: 0, impressions: 0, clicks: 0, revenue: 0, conversions: 0 };
    }
    canaisMap[plat].spend += numero(c.spend);
    canaisMap[plat].impressions += numero(c.impressions);
    canaisMap[plat].clicks += numero(c.clicks);
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

  // TR-04.8D.1: "Atualizações recentes" DERIVADAS de registros reais com
  // created_at — não é um log de eventos e não usa timestamp fake.
  const derivadas = [
    ...clientes.map((c) => ({
      id: `cli-${c.id}`,
      type: "client",
      message: `Cliente cadastrado: ${c.name || c.company || "Sem nome"}`,
      timestamp: dataCurta(c.created_at) || "sem data",
      quando: c.created_at ?? "",
    })),
    ...campanhas.map((c) => ({
      id: `cam-${c.id}`,
      type: "campaign",
      message: `Campanha criada: ${c.name || "Sem nome"}`,
      timestamp: dataCurta(c.created_at) || "sem data",
      quando: c.created_at ?? "",
    })),
  ];
  const atividadesRecentes: Atividade[] = derivadas
    .sort((a, b) => (a.quando < b.quando ? 1 : -1))
    .slice(0, 5)
    .map(({ id, type, message, timestamp }) => ({ id, type, message, timestamp }));

  // ZERO fallback demo: fonte vazia é vazio honesto; fonte com erro é
  // comunicada pelo widget correspondente (nunca mock, nunca zero falso).
  return {
    dados: { kpis, oportunidadesAbertas: abertos.length, pipelineAberto, ticketMedioAberto, funilValor, canais, atividadesRecentes, receitaClientes },
    erros,
  };
}

const quickActions = [
  { label: "Novo Cliente", description: "Cadastrar empresa na base", href: "/clientes", icon: Users, tone: "bg-success/15 text-success shadow-[0_0_15px_rgba(16,185,129,0.2)]" },
  { label: "Nova Campanha", description: "Criar campanha multicanal", href: "/campanhas", icon: Megaphone, tone: "bg-primary/15 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]" },
  { label: "Novo Prompt", description: "Salvar prompt reutilizável", href: "/prompts", icon: Sparkles, tone: "bg-ai/15 text-ai shadow-[0_0_15px_rgba(139,92,246,0.2)]" },
  { label: "IA Studio", description: "Gerar copy e roteiros", href: "/ia-studio", icon: Bot, tone: "bg-warning/15 text-warning shadow-[0_0_15px_rgba(245,158,11,0.2)]" },
];



// TR-04.8D.1: máquina de estados explícita — LOADING / READY / PARTIAL /
// ERROR / DEMO. Mock só é alcançável dentro de DEMO (sem Supabase).
type Painel =
  | { estado: "loading" }
  | { estado: "demo"; dados: DadosDashboard }
  | { estado: "erro" }
  | { estado: "pronto"; dados: DadosDashboard; erros: FonteErro };

const SEM_ERROS: FonteErro = { clientes: null, campanhas: null, negocios: null };

export function DashboardView() {
  const supabase = useMemo(() => getSupabaseBrowser(), []);
  // TR-04.8D.1: nasce em LOADING — nenhum mock aparece antes do dado real.
  const [painel, setPainel] = useState<Painel>({ estado: "loading" });
  // TR-04.8D.2a: hora REAL do término do carregamento (nunca simulação).
  const [atualizadoEm, setAtualizadoEm] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!supabase) {
      setPainel({ estado: "demo", dados: montarDadosDemo() });
      setAtualizadoEm(
        new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      );
      return;
    }
    setPainel({ estado: "loading" });
    try {
      const { dados, erros } = await coletarDadosReais(supabase);
      if (erros.clientes && erros.campanhas && erros.negocios) {
        setPainel({ estado: "erro" }); // ERROR: nenhuma fonte respondeu
      } else {
        setPainel({ estado: "pronto", dados, erros }); // READY ou PARTIAL
        setAtualizadoEm(
          new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        );
      }
    } catch (err) {
      // Rejeição explícita: nunca skeleton eterno, nunca demo disfarçada.
      console.error("Erro ao carregar dados do dashboard:", err);
      setPainel({ estado: "erro" });
    }
  }, [supabase]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  // ---------- LOADING: skeleton real, zero mock ----------
  if (painel.estado === "loading") {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Carregando painel">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-white/10" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {["k1", "k2", "k3", "k4", "k5", "k6"].map((chave) => (
            <Skeleton key={chave} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-12">
          <Skeleton className="h-72 w-full rounded-2xl lg:col-span-6" />
          <Skeleton className="h-72 w-full rounded-2xl lg:col-span-6" />
        </div>
      </div>
    );
  }

  // ---------- ERROR: estado explícito + Retry, nunca demo ----------
  if (painel.estado === "erro") {
    return (
      <Card className="mx-auto mt-10 max-w-lg">
        <CardContent className="flex flex-col items-center px-6 py-12 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
            <Activity className="size-5" />
          </div>
          <h2 className="mt-4 text-base font-semibold">Não consegui carregar o painel</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            As fontes de dados não responderam. Nada aqui é ilustração — tente novamente.
          </p>
          <Button size="sm" className="mt-4" onClick={() => void carregar()}>
            <RefreshCw /> Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const dados = painel.dados;
  const erros = painel.estado === "pronto" ? painel.erros : SEM_ERROS;
  const modoDemo = painel.estado === "demo";
  const fontesFalhas = [
    erros.clientes ? "clientes" : null,
    erros.campanhas ? "campanhas" : null,
    erros.negocios ? "negociações" : null,
  ].filter((fonte): fonte is string => fonte !== null);
  const temErroParcial = fontesFalhas.length > 0;

  const maxFunilValor = Math.max(1, ...dados.funilValor.map((e) => e.valor));
  const maxReceitaCliente = Math.max(1, ...dados.receitaClientes.map((c) => c.valor));
  // TR-04.8D.2a: escala única p/ comparar investido × retorno no mesmo eixo.
  const maxCanal = Math.max(1, ...dados.canais.flatMap((c) => [c.spend, c.revenue]));

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Centro de Comando & Desempenho</h1>
            {modoDemo && (
              <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning text-xs">
                Modo Demonstração (Conecte o Supabase)
              </Badge>
            )}
            {!modoDemo && !temErroParcial && (
              <Badge variant="outline" className="border-success/40 bg-success/10 text-success text-xs">
                Dados Reais
              </Badge>
            )}
            {temErroParcial && (
              <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs">
                Dados Parciais ({fontesFalhas.length} fonte{fontesFalhas.length > 1 ? "s" : ""} com falha)
              </Badge>
            )}
          </div>
          {/* TR-04.8D.2a: sem afirmar sincronização contínua — só a hora real
              em que este carregamento terminou. */}
          <p className="text-sm text-muted-foreground">
            Visão unificada da operação comercial, conversões e eficiência de campanhas.
            {atualizadoEm && <> Atualizado às {atualizadoEm}.</>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void carregar()}
            aria-label="Recarregar dados do painel"
            className="gap-1.5"
          >
            <RefreshCw className="size-3.5" /> Recarregar
          </Button>
          <Link href="/orquestrador">
            <Button className="gap-2 font-semibold shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Sparkles className="size-4" />
              Executar Nova Operação
            </Button>
          </Link>
        </div>
      </div>

      {modoDemo && (
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

      {/* TR-04.8D.1: PARTIAL — persistente, nomeia as fontes e oferece Retry */}
      {temErroParcial && (
        <div
          role="alert"
          className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3"
        >
          <p className="text-sm text-amber-300">
            Dados parciais: falha ao carregar {fontesFalhas.join(", ")}. Os demais
            números seguem reais — os blocos afetados avisam o que aconteceu.
          </p>
          <Button variant="outline" size="sm" onClick={() => void carregar()}>
            <RefreshCw /> Recarregar
          </Button>
        </div>
      )}

      {/* TR-04.8D.2a: Pulso do Negócio — 6 KPIs, número forte, sem trend. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {dados.kpis.map((metric) => {
          const config = kpiConfig[metric.label] ?? kpiConfig["Receita do mês"];
          // TR-04.8D.1: KPI de fonte falha não vira zero — vira indisponível.
          // Mapeamento por fonte real de cada KPI (2a): deals alimentam os 2
          // KPIs comerciais; clients alimenta MRR; campaigns, os demais.
          const erroFonte =
            metric.label === "Oportunidades abertas" || metric.label === "Pipeline aberto"
              ? erros.negocios
              : metric.label === "MRR" || metric.label === "Receita do mês"
                ? erros.clientes
                : erros.campanhas;
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
                {erroFonte ? (
                  <>
                    <p className="mt-3 text-2xl font-bold tracking-tight text-muted-foreground tabular-nums md:text-3xl">—</p>
                    <p className="mt-2 text-xs text-destructive">
                      Indisponível — falha na consulta. Detalhe técnico: {erroFonte}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums md:text-3xl">{metric.value}</p>
                    {metric.sub && (
                      <p className="mt-2 text-xs text-muted-foreground">{metric.sub}</p>
                    )}
                  </>
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
                <BarChart3 className="size-4 text-primary" /> MRR por Cliente
              </CardTitle>
              <CardDescription>Maiores receitas mensais recorrentes da base (clients.mrr)</CardDescription>
            </div>
            <Link href="/clientes">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">Ver todos</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {erros.clientes ? (
              <p role="alert" className="text-sm text-destructive py-8 text-center">
                Não consegui carregar os clientes — indisponível agora (isso não é
                zero). Detalhe técnico: {erros.clientes}
              </p>
            ) : dados.receitaClientes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhum cliente cadastrado ainda. Cadastre clientes com receita
                mensal e este gráfico ganha vida.
              </p>
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

        {/* TR-04.8D.2a: Funil Comercial por VALOR (R$) — deals reais. */}
        <Card className="lg:col-span-6 card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Target className="size-4 text-success" /> Funil Comercial
              </CardTitle>
              <CardDescription>Valor em aberto por etapa (negócios não fechados)</CardDescription>
            </div>
            <Link href="/crm">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">Ver CRM</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {erros.negocios ? (
              <p role="alert" className="text-sm text-destructive py-8 text-center">
                Negociações indisponíveis — o funil não pode ser exibido (isso não
                é zero). Detalhe técnico: {erros.negocios}
              </p>
            ) : dados.oportunidadesAbertas === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhuma oportunidade aberta. Crie negócios no CRM e o funil
                aparece aqui com o valor real de cada etapa.
              </p>
            ) : (
            <>
              <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/50 bg-surface/40 p-3 text-center">
                <div>
                  <p className="text-[11px] text-muted-foreground">Abertas</p>
                  <p className="text-sm font-bold tabular-nums">{dados.oportunidadesAbertas}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Pipeline aberto</p>
                  <p className="text-sm font-bold tabular-nums text-success">{formatBRL(dados.pipelineAberto)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Ticket médio</p>
                  <p className="text-sm font-bold tabular-nums">
                    {dados.ticketMedioAberto === null ? "—" : formatBRL(dados.ticketMedioAberto)}
                  </p>
                </div>
              </div>
              {dados.funilValor.map((etapa) => {
                const pct = Math.max(4, Math.round((etapa.valor / maxFunilValor) * 100));
                return (
                  <div key={etapa.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground">{etapa.stage}</span>
                      <span className="font-bold text-foreground tabular-nums">
                        {formatBRL(etapa.valor)}
                        <span className="ml-1.5 font-normal text-muted-foreground">
                          ({etapa.quantidade} {etapa.quantidade === 1 ? "negócio" : "negócios"})
                        </span>
                      </span>
                    </div>
                    <div
                      className="h-2 w-full rounded-full bg-muted/60 overflow-hidden"
                      title={`${etapa.stage}: ${formatBRL(etapa.valor)} em ${etapa.quantidade} negócio(s)`}
                    >
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-success/80 to-success transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      />
                    </div>
                  </div>
                );
              })}
            </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campanhas por Canal & Atividades Recentes */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* TR-04.8D.2a: Performance por Canal — descritivo, sem recomendação. */}
        <Card className="lg:col-span-6 card-glow">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChart className="size-4 text-ai" /> Performance por Canal
            </CardTitle>
            <CardDescription>Como os canais estão performando — investido, retorno e eficiência (dados reais das campanhas)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            {erros.campanhas ? (
              <p role="alert" className="text-sm text-destructive py-8 text-center">
                Campanhas indisponíveis — o desempenho por canal não pode ser
                exibido (isso não é zero). Detalhe técnico: {erros.campanhas}
              </p>
            ) : dados.canais.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhuma campanha cadastrada ainda. Crie a primeira em Campanhas.
              </p>
            ) : (
            dados.canais.map((canal) => {
              const corBarra = coresPlataforma[canal.platform] || "bg-primary";
              const roi = canal.spend > 0 ? canal.revenue / canal.spend : null;
              const roiTexto = roi === null ? "—" : `${roi.toFixed(1).replace(".", ",")}x`;
              // Correção 8D.2a: ROI do canal é DESCRITIVO e visualmente neutro —
              // não há meta de ROI por canal que justifique semáforo aqui. O
              // semáforo real (roas vs roas_meta) entra na 8D.2b.
              // Denominador zero ⇒ "—", nunca zero falso.
              const ctr = canal.impressions > 0 ? formatPercent((canal.clicks / canal.impressions) * 100) : "—";
              const cpc = canal.clicks > 0 ? brl2(canal.spend / canal.clicks) : "—";
              const cpa = canal.conversions > 0 ? formatBRL(canal.spend / canal.conversions) : "—";
              const pctSpend = canal.spend > 0 ? Math.max(2, Math.round((canal.spend / maxCanal) * 100)) : 0;
              const pctRetorno = canal.revenue > 0 ? Math.max(2, Math.round((canal.revenue / maxCanal) * 100)) : 0;
              return (
                <div key={canal.platform} className="space-y-2.5 rounded-xl border border-border/50 bg-surface/40 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={cn("size-3 shrink-0 rounded-full", corBarra)} />
                      <span className="truncate text-sm font-semibold">{canal.platform}</span>
                    </div>
                    <span
                      className="shrink-0 text-xs font-bold tabular-nums text-foreground"
                      title="ROI = retorno ÷ investido"
                    >
                      {roiTexto} ROI
                    </span>
                  </div>
                  <div
                    className="space-y-1.5"
                    role="img"
                    aria-label={`${canal.platform}: investido ${formatBRL(canal.spend)}, retorno ${formatBRL(canal.revenue)}, ${formatNumber(canal.conversions)} conversões, ROI ${roiTexto}`}
                  >
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="w-16 shrink-0 text-muted-foreground">Investido</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/60">
                        <div
                          style={{ width: `${pctSpend}%` }}
                          className="h-full rounded-full bg-primary/60 transition-all duration-500"
                        />
                      </div>
                      <span className="w-20 shrink-0 text-right font-medium tabular-nums">{formatBRL(canal.spend)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="w-16 shrink-0 text-muted-foreground">Retorno</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/60">
                        <div
                          style={{ width: `${pctRetorno}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-ai shadow-[0_0_8px_rgba(59,130,246,0.35)] transition-all duration-500"
                        />
                      </div>
                      <span className="w-20 shrink-0 text-right font-medium tabular-nums">{formatBRL(canal.revenue)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 pt-0.5 text-xs">
                    <div>
                      <p className="text-muted-foreground">Conversões</p>
                      <p className="font-medium tabular-nums text-foreground">{formatNumber(canal.conversions)}</p>
                    </div>
                    <div
                      title={
                        canal.impressions > 0
                          ? `CTR = cliques ÷ impressões (${formatNumber(canal.clicks)} ÷ ${formatNumber(canal.impressions)})`
                          : "Sem impressões registradas neste canal"
                      }
                    >
                      <p className="text-muted-foreground">CTR</p>
                      <p className="font-medium tabular-nums text-foreground">{ctr}</p>
                    </div>
                    <div
                      title={
                        canal.clicks > 0
                          ? `CPC = investido ÷ cliques (${formatBRL(canal.spend)} ÷ ${formatNumber(canal.clicks)})`
                          : "Sem cliques registrados neste canal"
                      }
                    >
                      <p className="text-muted-foreground">CPC</p>
                      <p className="font-medium tabular-nums text-foreground">{cpc}</p>
                    </div>
                    <div
                      title={
                        canal.conversions > 0
                          ? `CPA = investido ÷ conversões (${formatBRL(canal.spend)} ÷ ${formatNumber(canal.conversions)})`
                          : "Sem conversões registradas neste canal"
                      }
                    >
                      <p className="text-muted-foreground">CPA</p>
                      <p className="font-medium tabular-nums text-foreground">{cpa}</p>
                    </div>
                  </div>
                </div>
              );
            })
            )}
          </CardContent>
        </Card>

        {/* Atualizações Recentes da Operação */}
        <Card className="lg:col-span-6 card-glow">
          <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="size-4 text-warning" /> Atualizações Recentes
              </CardTitle>
              <CardDescription>Derivadas das datas de criação de clientes e campanhas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {erros.clientes && erros.campanhas ? (
              <p role="alert" className="text-sm text-destructive py-8 text-center">
                Registros indisponíveis — as fontes que alimentam estas
                atualizações falharam (isso não é vazio).
              </p>
            ) : dados.atividadesRecentes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhum registro ainda. Clientes e campanhas que você criar
                aparecem aqui com a data real de cadastro.
              </p>
            ) : (
            dados.atividadesRecentes.map((item) => {
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
            })
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}