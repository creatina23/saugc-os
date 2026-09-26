"use client";

// Dashboard — painel verdadeiro (016a) com Infográficos Premium Supremo
// TR-04.8D.2c-0: ORQUESTRADOR da tela — máquina de estados, coleta das 6
// fontes (Operational Truth), header/badges/skeleton e composição do layout.
// Blocos visuais vivem em src/components/dashboard/ (extração 1:1 — zero
// mudança funcional ou visual).

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  Bot,
  FileText,
  Megaphone,
  RefreshCw,
  Sparkles,
  Users,
  Video,
  Zap,
} from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBRL, formatNumber } from "@/lib/format";
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

// TR-04.8D.2c-2: motor PURO de attention (regras R1–R4/R6) + painel.
import {
  calcularSinais,
  type BriefingParaSinais,
  type CampanhaParaSinais,
  type ComercialParaSinais,
} from "@/lib/attention";

import { AssetsCategoria } from "@/components/dashboard/assets-categoria";
import { AttentionPanel } from "@/components/dashboard/attention-panel";
import { AtualizacoesRecentes } from "@/components/dashboard/atualizacoes-recentes";
import { CadenciaRegistros } from "@/components/dashboard/cadencia";
import { EstadoOperacao } from "@/components/dashboard/estado-operacao";
import { FunilComercial } from "@/components/dashboard/funil-comercial";
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { MrrClientes } from "@/components/dashboard/mrr-clientes";
import { PerformanceCanal } from "@/components/dashboard/performance-canal";
import { RoasVsMeta } from "@/components/dashboard/roas-vs-meta";
import { TopInvestimento } from "@/components/dashboard/top-investimento";
import type {
  Atividade,
  CanalPerformance,
  ContagemRotulo,
  FunilValorEtapa,
  Kpi,
  MesCadencia,
  ReceitaCliente,
  RoasMeta,
  TopCampanha,
} from "@/components/dashboard/types";
import { contarPorRotulo, dataCurta, MESES, numero, numeroEstrito } from "@/components/dashboard/utils";

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

// TR-04.8D.2b: linhas mínimas das novas fontes (read-only).
// TR-04.8D.2c-2: briefings/commercials recebem title+deadline (motor de
// attention). deadline é DATA CIVIL "YYYY-MM-DD" (input type="date") ou null.
interface LinhaBriefing {
  id: string;
  title: string | null;
  status: string | null;
  deadline: string | null;
  created_at: string | null;
}

interface LinhaComercial {
  id: string;
  title: string | null;
  status: string | null;
  deadline: string | null;
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
  // TR-04.8D.2c-2: linhas normalizadas p/ o motor de attention (src/lib/
  // attention.ts). Regras vivem SÓ no motor; aqui apenas preparação de dados.
  campanhasParaSinais: CampanhaParaSinais[];
  briefingsParaSinais: BriefingParaSinais[];
  commercialsParaSinais: ComercialParaSinais[];
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
    // TR-04.8D.2c-2 (demo selada): o motor de attention só recebe o que os
    // mocks sustentam. Mock NÃO tem campanhas individuais → array vazio.
    // Mocks de briefing/comercial têm status, mas o deadline do mock é TEXTO
    // de exibição ("12 ago 2026"), não data civil ISO → null honesto (motor
    // não gera R3/R4; painel exibe "Não disponível na demonstração.").
    campanhasParaSinais: [],
    briefingsParaSinais: briefingsMock.map((b) => ({
      id: b.id,
      titulo: b.title,
      status: b.status,
      deadline: null,
    })),
    commercialsParaSinais: commercialsMock.map((c) => ({
      id: c.id,
      titulo: c.title,
      status: c.status,
      deadline: null,
    })),
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

async function coletarDadosReais(
  supabase: SupabaseClient
): Promise<{ dados: DadosDashboard; erros: FonteErro }> {
  const [cli, cam, dea, bri, com, ass] = await Promise.all([
    supabase.from("clients").select("id, name, company, status, mrr, created_at"),
    supabase.from("campaigns").select("id, name, platform, status, spend, impressions, clicks, revenue, conversions, roas_meta, created_at"),
    supabase.from("deals").select("id, title, stage, value, created_at"),
    // TR-04.8D.2c-2: +title/deadline (somente o que o motor de attention usa)
    supabase.from("briefings").select("id, title, status, deadline, created_at"),
    supabase.from("commercials").select("id, title, status, deadline, created_at"),
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
  const briefings = (bri.data ?? []) as LinhaBriefing[];
  const commercials = (com.data ?? []) as LinhaComercial[];
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

  // TR-04.8D.2c-2: preparação p/ o motor de attention. Nomes seguem as
  // convenções existentes ("Sem nome"/"Sem título"). Regras ficam SÓ no motor.
  // Correção 1 (Operational Truth): conversions usa numeroEstrito — ausência
  // (null/undefined/""/inválido) vira NaN e o motor NÃO gera R2 ("0 conversões"
  // exige prova numérica de zero). Os demais campos mantêm numero(): ausência
  // de spend/revenue/roas_meta vira 0 e apenas SILENCIA R1/R2 (spend>0 e
  // meta>0 são pré-condições) — nenhum fato é afirmado a partir do zero.
  const campanhasParaSinais: CampanhaParaSinais[] = campanhas.map((c) => ({
    id: c.id,
    nome: c.name || "Sem nome",
    status: c.status ?? "",
    spend: numero(c.spend),
    revenue: numero(c.revenue),
    conversions: numeroEstrito(c.conversions),
    roasMeta: numero(c.roas_meta),
  }));
  const briefingsParaSinais: BriefingParaSinais[] = briefings.map((b) => ({
    id: b.id,
    titulo: b.title || "Sem título",
    status: b.status ?? "",
    deadline: typeof b.deadline === "string" ? b.deadline : null,
  }));
  const commercialsParaSinais: ComercialParaSinais[] = commercials.map((c) => ({
    id: c.id,
    titulo: c.title || "Sem título",
    status: c.status ?? "",
    deadline: typeof c.deadline === "string" ? c.deadline : null,
  }));

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
      campanhasParaSinais,
      briefingsParaSinais,
      commercialsParaSinais,
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



// TR-04.8D.2c-2: data civil "YYYY-MM-DD" montada com as partes LOCAIS do
// Date do navegador (o dashboard é client component) — a convenção é a data
// civil do ambiente do usuário, a mesma usada por deadline (input type="date").
// NUNCA toISOString(): converte para UTC e pode deslocar o dia em fusos
// negativos (dívida DATE-01). Sem fuso hardcodado.
function hojeIsoLocal(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// TR-04.8D.2c-3B: heading de seção — sinalização, não conteúdo. h2 real p/
// navegação por headings; divisor sutil; nenhum card extra.
function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section aria-label={titulo} className="mt-10">
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/70">
          {titulo}
        </h2>
        <div aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12">{children}</div>
    </section>
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
            <Skeleton key={chave} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
        {/* TR-04.8D.2c-2: skeleton do Attention na mesma posição do real */}
        <Skeleton className="h-28 w-full rounded-2xl" />
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

  // TR-04.8D.2c-0: máximos de escala vivem dentro de cada componente.
  // O orquestrador só prepara o que depende de `erros` (fontes da cadência).
  const fontesCadenciaFalhas = [
    erros.clientes ? "clientes" : null,
    erros.campanhas ? "campanhas" : null,
    erros.briefings ? "briefings" : null,
    erros.commercials ? "comerciais" : null,
  ].filter((f): f is string => f !== null);

  // TR-04.8D.2c-2: sinais REAIS calculados pelo motor puro (src/lib/
  // attention.ts). O orquestrador só fornece dados normalizados, a data
  // civil de hoje e as fontes que falharam (R6). Nenhuma regra aqui.
  const sinais = calcularSinais({
    hojeIso: hojeIsoLocal(),
    campanhas: dados.campanhasParaSinais,
    briefings: dados.briefingsParaSinais,
    commercials: dados.commercialsParaSinais,
    fontesIndisponiveis: [
      erros.clientes ? { fonte: "clientes", mensagem: erros.clientes } : null,
      erros.campanhas ? { fonte: "campanhas", mensagem: erros.campanhas } : null,
      erros.negocios ? { fonte: "negócios", mensagem: erros.negocios } : null,
      erros.briefings ? { fonte: "briefings", mensagem: erros.briefings } : null,
      erros.commercials ? { fonte: "comerciais", mensagem: erros.commercials } : null,
      erros.assets ? { fonte: "assets", mensagem: erros.assets } : null,
    ].filter((f): f is { fonte: string; mensagem: string } => f !== null),
  });

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
          // TR-04.8D.1: KPI de fonte falha não vira zero — vira indisponível.
          // Mapeamento por fonte real de cada KPI (2a): deals alimentam os 2
          // KPIs comerciais; clients alimenta MRR; campaigns, os demais.
          const erroFonte =
            metric.label === "Oportunidades abertas" || metric.label === "Pipeline aberto"
              ? erros.negocios
              : metric.label === "MRR" || metric.label === "Receita do mês"
                ? erros.clientes
                : erros.campanhas;
          return <KpiTile key={metric.label} metric={metric} erro={erroFonte} />;
        })}
      </div>

      {/* TR-04.8D.2c-2: O QUE MERECE ATENÇÃO — posição aprovada:
          Header → KPIs → Attention → Ações rápidas → demais grupos. */}
      <div className="mt-8">
        <AttentionPanel sinais={sinais} modoDemo={modoDemo} analiseParcial={temErroParcial} />
      </div>

      {/* Ações Rápidas — TR-04.8D.2c-3A: toolbar operacional compacta.
          Mesmas 4 ações e destinos; labels autoexplicativos (o title é só
          complemento). 2×2 no mobile, linha única no desktop; alvo ≥44px.
          Peso visual deliberadamente menor que o do Attention. */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:flex md:flex-wrap">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href} title={action.description}>
            <Button
              variant="outline"
              className="h-11 w-full justify-start gap-2 px-4 font-medium md:w-auto"
            >
              <action.icon className="size-4 text-muted-foreground" />
              {action.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* TR-04.8D.2c-3B: ARQUITETURA POR SEÇÕES — Performance & Receita →
          Funil Comercial → Operação → Base & Contexto. Dados/erros idênticos
          ao estado anterior; apenas composição e sinalização mudaram. */}
      <Secao titulo="Performance & Receita">
        <RoasVsMeta linhas={dados.roasMeta} erro={erros.campanhas} />
        <TopInvestimento campanhas={dados.topCampanhas} erro={erros.campanhas} />
        <div className="lg:col-span-12">
          <MrrClientes clientes={dados.receitaClientes} erro={erros.clientes} />
        </div>
      </Secao>

      <Secao titulo="Funil Comercial">
        <div className="lg:col-span-12">
          <FunilComercial
            oportunidadesAbertas={dados.oportunidadesAbertas}
            pipelineAberto={dados.pipelineAberto}
            ticketMedioAberto={dados.ticketMedioAberto}
            funilValor={dados.funilValor}
            erro={erros.negocios}
          />
        </div>
      </Secao>

      <Secao titulo="Operação">
        <PerformanceCanal canais={dados.canais} erro={erros.campanhas} />
        {/* Estado da Operação: 3 grupos, erros/estados independentes por fonte */}
        <EstadoOperacao
          grupos={[
            {
              chave: "campanhas",
              rotulo: "Campanhas",
              icone: Megaphone,
              itens: dados.statusCampanhas,
              erro: erros.campanhas,
              textoVazio: "Nenhuma campanha cadastrada ainda. Crie a primeira em Campanhas.",
            },
            {
              chave: "briefings",
              rotulo: "Briefings",
              icone: FileText,
              itens: dados.statusBriefings,
              erro: erros.briefings,
              textoVazio: "Nenhum briefing criado ainda. Crie o primeiro em Briefings.",
            },
            {
              chave: "comerciais",
              rotulo: "Comerciais",
              icone: Video,
              itens: dados.statusComerciais,
              erro: erros.commercials,
              textoVazio: "Nenhum comercial criado ainda. Crie o primeiro em Comerciais.",
            },
          ]}
        />
        <div className="lg:col-span-12">
          <CadenciaRegistros meses={dados.cadencia} fontesFalhas={fontesCadenciaFalhas} />
        </div>
      </Secao>

      <Secao titulo="Base & Contexto">
        <AtualizacoesRecentes
          atividades={dados.atividadesRecentes}
          erroClientes={erros.clientes}
          erroCampanhas={erros.campanhas}
        />
        <AssetsCategoria categorias={dados.assetsPorCategoria} erro={erros.assets} />
      </Secao>
    </>
  );
}