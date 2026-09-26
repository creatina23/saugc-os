"use client";

// Dashboard — painel verdadeiro (016a) com Infográficos Premium Supremo

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bot,
  Briefcase,
  CircleDollarSign,
  FileText,
  Image,
  Megaphone,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Video,
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
  assets as assetsMock,
  briefings as briefingsMock,
  campaignPerformance,
  clients as clientesMock,
  commercials as commercialsMock,
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

// TR-04.8D.2b: cor por status conhecido (mesma semântica dos módulos);
// status desconhecido recebe cor neutra — a informação nunca depende só da
// cor (legenda com nome + contagem sempre visível).
const CORES_STATUS: Record<string, string> = {
  Ativa: "bg-success",
  Aprovado: "bg-success",
  Pausada: "bg-warning",
  "Em Aprovação": "bg-warning",
  Revisão: "bg-warning",
  Produção: "bg-primary",
  Rascunho: "bg-muted-foreground",
  "Sem status": "bg-border",
  "Sem categoria": "bg-border",
};
const COR_STATUS_NEUTRA = "bg-muted-foreground/60";

// TR-04.8D.2b: REGRA DO SISTEMA (documentada na própria UI, não é verdade
// universal): ROAS real ÷ meta ≥ 100% = "Na meta"; 70–99% = "Abaixo da meta";
// < 70% = "Muito abaixo". Sem meta válida ou sem investido: sem classificação.
function classificarRoas(roas: number, meta: number): { rotulo: string; classe: string } {
  const pct = roas / meta;
  if (pct >= 1) return { rotulo: "Na meta", classe: "text-success" };
  if (pct >= 0.7) return { rotulo: "Abaixo da meta", classe: "text-warning" };
  return { rotulo: "Muito abaixo", classe: "text-destructive" };
}

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
  roas_meta: unknown;
  created_at: string | null;
}

// TR-04.8D.2b: linhas mínimas das novas fontes (read-only)
interface LinhaStatus {
  id: string;
  status: string | null;
  created_at: string | null;
}

interface LinhaAsset {
  id: string;
  category: string | null;
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

// TR-04.8D.2b: contagem real por status/categoria (sem categoria inventada)
interface ContagemRotulo {
  rotulo: string;
  quantidade: number;
}

// TR-04.8D.2b: ROAS real vs meta — somente campanhas com meta válida.
// roasReal = null quando spend = 0 (ROAS "—", sem classificação).
interface RoasMeta {
  id: string;
  nome: string;
  roasReal: number | null;
  meta: number;
}

interface TopCampanha {
  id: string;
  nome: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

interface MesCadencia {
  chave: string;
  rotulo: string;
  total: number;
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
  // TR-04.8D.2b: operação + eficiência. null = widget sem suporte honesto no
  // dataset demo ("Não disponível na demonstração"); [] = vazio real honesto.
  statusCampanhas: ContagemRotulo[] | null;
  statusBriefings: ContagemRotulo[];
  statusComerciais: ContagemRotulo[];
  roasMeta: RoasMeta[] | null;
  topCampanhas: TopCampanha[] | null;
  cadencia: MesCadencia[] | null;
  assetsPorCategoria: ContagemRotulo[];
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

  // TR-04.8D.2b (demo selada) — ORIGEM AUDITÁVEL: só entra no demo o que
  // deriva dos mocks existentes. Briefings/comerciais/assets têm status e
  // categoria nos mocks → derivados honestamente. O mock NÃO tem: status de
  // campanha, roas_meta, campanhas individuais nem created_at → esses widgets
  // ficam null = "Não disponível na demonstração" (nunca números inventados).
  const statusBriefings = contarPorRotulo(
    briefingsMock.map((b) => b.status),
    "Sem status",
    ["Em Aprovação", "Aprovado", "Rascunho"]
  );
  const statusComerciais = contarPorRotulo(
    commercialsMock.map((c) => c.status),
    "Sem status",
    ["Rascunho", "Produção", "Revisão", "Aprovado"]
  );
  const assetsPorCategoria = contarPorRotulo(
    assetsMock.map((a) => a.category),
    "Sem categoria",
    ["Video Ads", "Hook Clips", "B-Roll", "Product Photos"]
  );

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
    statusCampanhas: null, // mock não tem status de campanha
    statusBriefings,
    statusComerciais,
    roasMeta: null, // mock não tem roas_meta por campanha
    topCampanhas: null, // mock é agregado por plataforma, não campanhas
    cadencia: null, // mock não tem created_at
    assetsPorCategoria,
  };
}

// TR-04.8D.1: erro por fonte — res.error nunca vira "zero dados" silencioso.
// TR-04.8D.2b: 3 novas fontes (briefings, commercials, assets). Uma falhar
// não derruba as demais — cada widget trata o próprio erro.
type FonteErro = {
  clientes: string | null;
  campanhas: string | null;
  negocios: string | null;
  briefings: string | null;
  commercials: string | null;
  assets: string | null;
};

// TR-04.8D.2b: agrupa contagens por rótulo real (status/categoria). Rótulo
// vazio/null vira "Sem categoria"/"Sem status" factual — nunca inventa.
function contarPorRotulo(
  linhas: (string | null)[],
  rotuloVazio: string,
  ordemPreferida?: string[]
): ContagemRotulo[] {
  const mapa = new Map<string, number>();
  for (const raw of linhas) {
    const rotulo = (raw ?? "").trim() || rotuloVazio;
    mapa.set(rotulo, (mapa.get(rotulo) ?? 0) + 1);
  }
  const ordem = ordemPreferida ?? [];
  return [...mapa.entries()]
    .map(([rotulo, quantidade]) => ({ rotulo, quantidade }))
    .sort((a, b) => {
      const ia = ordem.indexOf(a.rotulo);
      const ib = ordem.indexOf(b.rotulo);
      if (ia !== -1 || ib !== -1) {
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      }
      return b.quantidade - a.quantidade || a.rotulo.localeCompare(b.rotulo);
    });
}

async function coletarDadosReais(
  supabase: SupabaseClient
): Promise<{ dados: DadosDashboard; erros: FonteErro }> {
  const [cli, cam, dea, bri, com, ass] = await Promise.all([
    supabase.from("clients").select("id, name, company, status, mrr, created_at"),
    supabase.from("campaigns").select("id, name, platform, status, spend, impressions, clicks, revenue, conversions, roas_meta, created_at"),
    supabase.from("deals").select("id, title, stage, value, created_at"),
    supabase.from("briefings").select("id, status, created_at"),
    supabase.from("commercials").select("id, status, created_at"),
    supabase.from("assets").select("id, category, created_at"),
  ]);

  const erros: FonteErro = {
    clientes: cli.error ? cli.error.message : null,
    campanhas: cam.error ? cam.error.message : null,
    negocios: dea.error ? dea.error.message : null,
    briefings: bri.error ? bri.error.message : null,
    commercials: com.error ? com.error.message : null,
    assets: ass.error ? ass.error.message : null,
  };

  const clientes = (cli.data ?? []) as LinhaCliente[];
  const campanhas = (cam.data ?? []) as LinhaCampanha[];
  const negocios = (dea.data ?? []) as LinhaDeal[];
  const briefings = (bri.data ?? []) as LinhaStatus[];
  const commercials = (com.data ?? []) as LinhaStatus[];
  const assetsLista = (ass.data ?? []) as LinhaAsset[];

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

  // TR-04.8D.2b: STATUS OPERACIONAL — agrupa os status REAIS presentes nos
  // dados (nenhuma categoria inventada; ordem conhecida primeiro).
  const statusCampanhas = contarPorRotulo(
    campanhas.map((c) => c.status),
    "Sem status",
    ["Ativa", "Pausada", "Rascunho"]
  );
  const statusBriefings = contarPorRotulo(
    briefings.map((b) => b.status),
    "Sem status",
    ["Em Aprovação", "Aprovado", "Rascunho"]
  );
  const statusComerciais = contarPorRotulo(
    commercials.map((c) => c.status),
    "Sem status",
    ["Rascunho", "Produção", "Revisão", "Aprovado"]
  );

  // TR-04.8D.2b: ROAS REAL vs META — só campanhas com meta válida (> 0).
  // Meta NUNCA é inventada; sem meta a campanha não entra na classificação.
  const roasMeta: RoasMeta[] = campanhas
    .filter((c) => numero(c.roas_meta) > 0)
    .map((c) => ({
      id: c.id,
      nome: c.name || "Sem nome",
      // spend = 0 ⇒ ROAS "—" (null) — exibido, porém nunca classificado.
      roasReal: numero(c.spend) > 0 ? numero(c.revenue) / numero(c.spend) : null,
      meta: numero(c.roas_meta),
    }))
    .sort((a, b) => (b.roasReal ?? -1) - (a.roasReal ?? -1));

  // TR-04.8D.2b: TOP 5 POR INVESTIMENTO (spend DESC) — "top" = maior gasto,
  // não "melhor desempenho".
  const topCampanhas: TopCampanha[] = [...campanhas]
    .sort((a, b) => numero(b.spend) - numero(a.spend))
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      nome: c.name || "Sem nome",
      spend: numero(c.spend),
      impressions: numero(c.impressions),
      clicks: numero(c.clicks),
      conversions: numero(c.conversions),
      revenue: numero(c.revenue),
    }));

  // TR-04.8D.2b: CADÊNCIA — "Registros criados" por mês (últimos 6, incl. o
  // atual) a partir de created_at REAL. Mês sem registro = 0 legítimo.
  const meses: MesCadencia[] = [];
  const agora = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    meses.push({
      chave: `${d.getFullYear()}-${d.getMonth()}`,
      rotulo: `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
      total: 0,
    });
  }
  const indiceMes = new Map(meses.map((m, i) => [m.chave, i]));
  const fontesCadencia: { linhas: { created_at: string | null }[]; falhou: boolean }[] = [
    { linhas: clientes, falhou: erros.clientes !== null },
    { linhas: campanhas, falhou: erros.campanhas !== null },
    { linhas: briefings, falhou: erros.briefings !== null },
    { linhas: commercials, falhou: erros.commercials !== null },
  ];
  for (const fonte of fontesCadencia) {
    if (fonte.falhou) continue; // fonte falha não contribui — widget avisa
    for (const linha of fonte.linhas) {
      if (!linha.created_at) continue;
      const d = new Date(linha.created_at);
      if (Number.isNaN(d.getTime())) continue;
      const idx = indiceMes.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (idx !== undefined) meses[idx].total += 1;
    }
  }

  // TR-04.8D.2b: ASSETS por categoria real; null/vazio = "Sem categoria".
  const assetsPorCategoria = contarPorRotulo(
    assetsLista.map((a) => a.category),
    "Sem categoria",
    ["Video Ads", "Hook Clips", "B-Roll", "Product Photos"]
  );

  // ZERO fallback demo: fonte vazia é vazio honesto; fonte com erro é
  // comunicada pelo widget correspondente (nunca mock, nunca zero falso).
  return {
    dados: {
      kpis,
      oportunidadesAbertas: abertos.length,
      pipelineAberto,
      ticketMedioAberto,
      funilValor,
      canais,
      atividadesRecentes,
      receitaClientes,
      statusCampanhas,
      statusBriefings,
      statusComerciais,
      roasMeta,
      topCampanhas,
      cadencia: meses,
      assetsPorCategoria,
    },
    erros,
  };
}

const quickActions = [
  { label: "Novo Cliente", description: "Cadastrar empresa na base", href: "/clientes", icon: Users, tone: "bg-success/15 text-success shadow-[0_0_15px_rgba(16,185,129,0.2)]" },
  { label: "Nova Campanha", description: "Criar campanha multicanal", href: "/campanhas", icon: Megaphone, tone: "bg-primary/15 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]" },
  { label: "Novo Prompt", description: "Salvar prompt reutilizável", href: "/prompts", icon: Sparkles, tone: "bg-ai/15 text-ai shadow-[0_0_15px_rgba(139,92,246,0.2)]" },
  { label: "IA Studio", description: "Gerar copy e roteiros", href: "/ia-studio", icon: Bot, tone: "bg-warning/15 text-warning shadow-[0_0_15px_rgba(245,158,11,0.2)]" },
];



// TR-04.8D.2b: cartão de status operacional (reutilizado por campanhas,
// briefings e comerciais — mesma anatomia, erro/vazio próprios por fonte).
function StatusCard({
  titulo,
  icone: Icone,
  itens,
  erro,
  textoVazio,
}: {
  titulo: string;
  icone: LucideIcon;
  itens: ContagemRotulo[] | null;
  erro: string | null;
  textoVazio: string;
}) {
  const total = itens?.reduce((acc, i) => acc + i.quantidade, 0) ?? 0;
  return (
    <Card className="lg:col-span-4 card-glow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Icone className="size-4 text-primary" /> {titulo}
        </CardTitle>
        <CardDescription>
          {itens === null
            ? "Não disponível na demonstração"
            : erro
              ? "Fonte indisponível neste momento"
              : `${total} registro${total === 1 ? "" : "s"} na base`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {itens === null ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Não disponível na demonstração — o dataset demo não inclui esses
            dados. Conecte o Supabase para ver os números reais.
          </p>
        ) : erro ? (
          <p role="alert" className="py-6 text-center text-sm text-destructive">
            Fonte indisponível — isso não é zero. Detalhe técnico: {erro}
          </p>
        ) : itens.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{textoVazio}</p>
        ) : (
          <>
            <div
              className="flex h-3 w-full overflow-hidden rounded-full bg-muted/60"
              role="img"
              aria-label={`${titulo}: ${itens
                .map((i) => `${i.rotulo} ${i.quantidade}`)
                .join(", ")} — total ${total}`}
            >
              {itens.map((i) => (
                <div
                  key={i.rotulo}
                  style={{ width: `${(i.quantidade / Math.max(1, total)) * 100}%` }}
                  className={cn("h-full", CORES_STATUS[i.rotulo] ?? COR_STATUS_NEUTRA)}
                  title={`${i.rotulo}: ${i.quantidade}`}
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
              {itens.map((i) => (
                <span key={i.rotulo} className="flex items-center gap-1.5">
                  <span
                    className={cn("size-2.5 rounded-full", CORES_STATUS[i.rotulo] ?? COR_STATUS_NEUTRA)}
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground">{i.rotulo}</span>
                  <span className="font-semibold tabular-nums">{i.quantidade}</span>
                </span>
              ))}
              <span className="ml-auto text-muted-foreground">
                Total <span className="font-semibold tabular-nums text-foreground">{total}</span>
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// TR-04.8D.1: máquina de estados explícita — LOADING / READY / PARTIAL /
// ERROR / DEMO. Mock só é alcançável dentro de DEMO (sem Supabase).
type Painel =
  | { estado: "loading" }
  | { estado: "demo"; dados: DadosDashboard }
  | { estado: "erro" }
  | { estado: "pronto"; dados: DadosDashboard; erros: FonteErro };

const SEM_ERROS: FonteErro = {
  clientes: null,
  campanhas: null,
  negocios: null,
  briefings: null,
  commercials: null,
  assets: null,
};

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
      const todasFalharam =
        erros.clientes && erros.campanhas && erros.negocios &&
        erros.briefings && erros.commercials && erros.assets;
      if (todasFalharam) {
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
        <div className="grid gap-8 lg:grid-cols-12">
          <Skeleton className="h-40 w-full rounded-2xl lg:col-span-4" />
          <Skeleton className="h-40 w-full rounded-2xl lg:col-span-4" />
          <Skeleton className="h-40 w-full rounded-2xl lg:col-span-4" />
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
    erros.briefings ? "briefings" : null,
    erros.commercials ? "comerciais" : null,
    erros.assets ? "assets" : null,
  ].filter((fonte): fonte is string => fonte !== null);
  const temErroParcial = fontesFalhas.length > 0;

  const maxFunilValor = Math.max(1, ...dados.funilValor.map((e) => e.valor));
  const maxReceitaCliente = Math.max(1, ...dados.receitaClientes.map((c) => c.valor));
  // TR-04.8D.2a: escala única p/ comparar investido × retorno no mesmo eixo.
  const maxCanal = Math.max(1, ...dados.canais.flatMap((c) => [c.spend, c.revenue]));
  // TR-04.8D.2b
  const maxCadencia = dados.cadencia
    ? Math.max(1, ...dados.cadencia.map((m) => m.total))
    : 1;
  const maxAssets = Math.max(1, ...dados.assetsPorCategoria.map((c) => c.quantidade));
  const fontesCadenciaFalhas = [
    erros.clientes ? "clientes" : null,
    erros.campanhas ? "campanhas" : null,
    erros.briefings ? "briefings" : null,
    erros.commercials ? "comerciais" : null,
  ].filter((f): f is string => f !== null);
  const cadenciaTotalmenteFalha = fontesCadenciaFalhas.length === 4;

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

      {/* TR-04.8D.2b: STATUS OPERACIONAL — contagens reais por status */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <StatusCard
          titulo="Campanhas por Status"
          icone={Megaphone}
          itens={dados.statusCampanhas}
          erro={erros.campanhas}
          textoVazio="Nenhuma campanha cadastrada ainda. Crie a primeira em Campanhas."
        />
        <StatusCard
          titulo="Briefings por Status"
          icone={FileText}
          itens={dados.statusBriefings}
          erro={erros.briefings}
          textoVazio="Nenhum briefing criado ainda. Crie o primeiro em Briefings."
        />
        <StatusCard
          titulo="Comerciais por Status"
          icone={Video}
          itens={dados.statusComerciais}
          erro={erros.commercials}
          textoVazio="Nenhum comercial criado ainda. Crie o primeiro em Comerciais."
        />
      </div>

      {/* TR-04.8D.2b: EFICIÊNCIA — ROAS vs meta (regra explícita) + Top 5 */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-6 card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" /> ROAS vs Meta
            </CardTitle>
            <CardDescription>
              Campanhas com meta definida — ROAS real (receita ÷ investido) comparado à meta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            <p className="rounded-lg border border-border/50 bg-surface/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
              Regra do sistema: <span className="font-semibold text-success">na meta</span> ≥ 100%
              da meta · <span className="font-semibold text-warning">abaixo</span> 70–99% ·{" "}
              <span className="font-semibold text-destructive">muito abaixo</span> &lt; 70%. Sem
              meta ou sem investido não há classificação.
            </p>
            {dados.roasMeta === null ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Não disponível na demonstração — o dataset demo não inclui metas
                de ROAS. Conecte o Supabase para comparar metas reais.
              </p>
            ) : erros.campanhas ? (
              <p role="alert" className="py-6 text-center text-sm text-destructive">
                Campanhas indisponíveis — a comparação com metas não pode ser exibida
                (isso não é zero). Detalhe técnico: {erros.campanhas}
              </p>
            ) : dados.roasMeta.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhuma campanha com meta de ROAS definida. Defina metas na página
                Campanhas para compará-las aqui.
              </p>
            ) : (
              dados.roasMeta.map((c) => {
                const classif =
                  c.roasReal === null ? null : classificarRoas(c.roasReal, c.meta);
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-surface/40 px-3 py-2.5 text-xs"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium" title={c.nome}>
                      {c.nome}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      ROAS{" "}
                      <span className="font-semibold text-foreground">
                        {c.roasReal === null
                          ? "—"
                          : `${c.roasReal.toFixed(1).replace(".", ",")}x`}
                      </span>{" "}
                      · meta{" "}
                      <span className="font-semibold text-foreground">
                        {c.meta.toFixed(1).replace(".", ",")}x
                      </span>
                    </span>
                    {classif ? (
                      <span className={cn("shrink-0 font-semibold", classif.classe)}>
                        {classif.rotulo}
                      </span>
                    ) : (
                      <span className="shrink-0 font-medium text-muted-foreground">
                        Sem investido
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-6 card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="size-4 text-ai" /> Top 5 por Investimento
            </CardTitle>
            <CardDescription>
              As 5 campanhas com maior investimento — maior gasto, não necessariamente
              melhor desempenho
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {dados.topCampanhas === null ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Não disponível na demonstração — o dataset demo não inclui campanhas
                individuais. Conecte o Supabase para ver as reais.
              </p>
            ) : erros.campanhas ? (
              <p role="alert" className="py-6 text-center text-sm text-destructive">
                Campanhas indisponíveis — a tabela não pode ser exibida (isso não é
                zero). Detalhe técnico: {erros.campanhas}
              </p>
            ) : dados.topCampanhas.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhuma campanha cadastrada ainda. Crie a primeira em Campanhas.
              </p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 text-left text-muted-foreground">
                    <th className="py-2 pr-2 font-medium">Campanha</th>
                    <th className="py-2 pr-2 text-right font-medium">Investido</th>
                    <th className="hidden py-2 pr-2 text-right font-medium md:table-cell">CTR</th>
                    <th className="hidden py-2 pr-2 text-right font-medium md:table-cell">CPC</th>
                    <th className="py-2 pr-2 text-right font-medium">CPA</th>
                    <th className="py-2 text-right font-medium">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.topCampanhas.map((c) => {
                    const ctr =
                      c.impressions > 0
                        ? formatPercent((c.clicks / c.impressions) * 100)
                        : "—";
                    const cpc = c.clicks > 0 ? brl2(c.spend / c.clicks) : "—";
                    const cpa = c.conversions > 0 ? formatBRL(c.spend / c.conversions) : "—";
                    const roas =
                      c.spend > 0
                        ? `${(c.revenue / c.spend).toFixed(1).replace(".", ",")}x`
                        : "—";
                    return (
                      <tr key={c.id} className="border-b border-border/30 last:border-0">
                        <td className="max-w-[140px] truncate py-2 pr-2 font-medium" title={c.nome}>
                          {c.nome}
                        </td>
                        <td className="py-2 pr-2 text-right tabular-nums">{formatBRL(c.spend)}</td>
                        <td
                          className="hidden py-2 pr-2 text-right tabular-nums md:table-cell"
                          title={
                            c.impressions > 0
                              ? `CTR = cliques ÷ impressões (${formatNumber(c.clicks)} ÷ ${formatNumber(c.impressions)})`
                              : "Sem impressões registradas"
                          }
                        >
                          {ctr}
                        </td>
                        <td
                          className="hidden py-2 pr-2 text-right tabular-nums md:table-cell"
                          title={
                            c.clicks > 0
                              ? `CPC = investido ÷ cliques (${formatBRL(c.spend)} ÷ ${formatNumber(c.clicks)})`
                              : "Sem cliques registrados"
                          }
                        >
                          {cpc}
                        </td>
                        <td
                          className="py-2 pr-2 text-right tabular-nums"
                          title={
                            c.conversions > 0
                              ? `CPA = investido ÷ conversões (${formatBRL(c.spend)} ÷ ${formatNumber(c.conversions)})`
                              : "Sem conversões registradas"
                          }
                        >
                          {cpa}
                        </td>
                        <td
                          className="py-2 text-right tabular-nums"
                          title="ROAS = receita ÷ investido"
                        >
                          {roas}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* TR-04.8D.2b: REGISTROS CRIADOS (cadência real) + ASSETS */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-6 card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="size-4 text-success" /> Registros criados
            </CardTitle>
            <CardDescription>
              Volume de registros criados por mês — clientes, campanhas, briefings e
              comerciais (últimos 6 meses)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {dados.cadencia === null ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Não disponível na demonstração — o dataset demo não inclui datas de
                criação. Conecte o Supabase para ver a cadência real.
              </p>
            ) : cadenciaTotalmenteFalha ? (
              <p role="alert" className="py-6 text-center text-sm text-destructive">
                Todas as fontes desta contagem falharam — nada a exibir (isso não é
                zero). Use Recarregar.
              </p>
            ) : (
              <>
                {fontesCadenciaFalhas.length > 0 && (
                  <p role="alert" className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
                    Contagem parcial — fonte(s) indisponível(is): {fontesCadenciaFalhas.join(", ")}.
                    Os totais abaixo podem estar menores que o real.
                  </p>
                )}
                <div
                  className="flex h-36 items-end gap-2"
                  role="img"
                  aria-label={`Registros criados por mês: ${dados.cadencia
                    .map((m) => `${m.rotulo} ${m.total}`)
                    .join(", ")}`}
                >
                  {dados.cadencia.map((m) => {
                    const pct = Math.round((m.total / maxCadencia) * 100);
                    return (
                      <div key={m.chave} className="flex h-full flex-1 flex-col items-center gap-1">
                        <span className="text-[10px] font-semibold tabular-nums text-foreground">
                          {m.total}
                        </span>
                        <div className="flex w-full flex-1 items-end">
                          <div
                            style={{ height: m.total > 0 ? `${Math.max(6, pct)}%` : "0%" }}
                            className="w-full rounded-t-md bg-gradient-to-t from-primary/70 to-ai/70 transition-all duration-500"
                            title={`${m.rotulo}: ${m.total} registro(s) criados`}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{m.rotulo}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Mês sem registro aparece como 0 — derivado das datas reais de criação.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-6 card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Image className="size-4 text-ai" /> Assets por Categoria
            </CardTitle>
            <CardDescription>Contagem real de arquivos por categoria na biblioteca</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {erros.assets ? (
              <p role="alert" className="py-6 text-center text-sm text-destructive">
                Biblioteca indisponível — a contagem não pode ser exibida (isso não é
                zero). Detalhe técnico: {erros.assets}
              </p>
            ) : dados.assetsPorCategoria.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum asset na biblioteca ainda. Envie arquivos em Assets para vê-los
                contados aqui.
              </p>
            ) : (
              dados.assetsPorCategoria.map((cat) => (
                <div key={cat.rotulo} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{cat.rotulo}</span>
                    <span className="font-semibold tabular-nums">{cat.quantidade}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                    <div
                      style={{ width: `${Math.max(3, Math.round((cat.quantidade / maxAssets) * 100))}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-ai transition-all duration-500"
                      title={`${cat.rotulo}: ${cat.quantidade} asset(s)`}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}