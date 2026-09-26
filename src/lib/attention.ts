// TR-04.8D.2c-1 — MOTOR PURO DE ATTENTION (regras R1, R2, R3, R4, R6).
// ---------------------------------------------------------------------
// Determinístico e auditável: sem React, sem UI, sem Supabase, sem rede.
// O consumidor (dashboard-view) prepara as linhas com números normalizados
// e informa a data civil de hoje; este módulo só aplica regras explícitas.
//
// Operational Truth: cada sinal carrega `regraId` + `evidencia` estruturada
// (números crus) — o `titulo` é conveniência de exibição, NUNCA a única
// fonte de verdade. Nenhum threshold arbitrário: as únicas comparações são
// contra a meta configurada pelo usuário (R1) e contra a data de hoje (R3/R4).
//
// Tempo: `deadline` no produto é DATA CIVIL "YYYY-MM-DD" (input type="date",
// armazenado sem conversão). Comparações são de calendário (lexicográficas
// em ISO) e a aritmética de dias usa Date.UTC com as partes da string —
// nenhuma conversão de fuso capaz de deslocar o dia. A data de hoje é
// fornecida pelo consumidor via `hojeIso` (convenção explícita, não oculta).

import { formatBRL } from "@/lib/format";

export type NivelAtencao = "prioridade" | "acompanhar" | "informacao";

/** Regras aprovadas na TR-04.8D.2c-A (revisão com correções). R5 (pipeline
 *  aberto) foi EXCLUÍDA do painel pelo dono — pipeline permanece no Funil. */
export type RegraId = "R1" | "R2" | "R3" | "R4" | "R6";

export interface DestinoAcao {
  href: string;
  rotulo: string;
}

// ----------------------------- Evidências ------------------------------

export interface EvidenciaRoasAbaixoMeta {
  tipo: "roas-abaixo-meta";
  spend: number;
  revenue: number;
  roas: number; // revenue / spend (spend > 0 garantido pela regra)
  meta: number; // roas_meta configurada (> 0 garantido pela regra)
  percentualAbaixo: number; // (meta - roas) / meta * 100, > 0
}

export interface EvidenciaInvestimentoSemConversao {
  tipo: "investimento-sem-conversao";
  spend: number; // > 0 garantido pela regra
  conversions: number; // === 0 garantido pela regra
}

export interface EvidenciaPrazoVencido {
  tipo: "prazo-vencido";
  deadline: string; // data civil original "YYYY-MM-DD", como está no banco
  status: string; // status real da entidade no momento do cálculo
  diasVencido: number; // >= 1 (aritmética de calendário, sem fuso)
}

export interface EvidenciaFonteIndisponivel {
  tipo: "fonte-indisponivel";
  fonte: string; // nome da fonte que falhou (ex.: "campanhas")
  mensagem: string; // mensagem de erro real vinda do cliente de dados
}

export type EvidenciaSinal =
  | EvidenciaRoasAbaixoMeta
  | EvidenciaInvestimentoSemConversao
  | EvidenciaPrazoVencido
  | EvidenciaFonteIndisponivel;

// ------------------------------- Sinal ---------------------------------

export interface SinalAtencao {
  /** Estável e único: `${regraId}:${id da entidade (ou fonte, na R6)}`. */
  id: string;
  regraId: RegraId;
  nivel: NivelAtencao;
  /** Texto curto e factual (espelha a evidência; não é a fonte de verdade). */
  titulo: string;
  evidencia: EvidenciaSinal;
  /** Fonte de dados que sustenta o sinal. */
  fonte: string;
  /** Navegação sugerida; null quando a ação não é uma rota (ex.: Retry). */
  destino: DestinoAcao | null;
}

// ------------------------------- Entradas ------------------------------
// O consumidor entrega números já normalizados (o dashboard usa numero());
// o motor ainda assim se defende de NaN/Infinity e nunca inventa valores.

export interface CampanhaParaSinais {
  id: string;
  nome: string;
  status: string; // espera-se "Ativa" | "Pausada" | "Rascunho"
  spend: number;
  revenue: number;
  conversions: number;
  roasMeta: number; // 0 = meta não configurada
}

export interface BriefingParaSinais {
  id: string;
  titulo: string;
  status: string; // espera-se "Em Aprovação" | "Aprovado" | "Rascunho"
  deadline: string | null; // data civil "YYYY-MM-DD" ou null
}

export interface ComercialParaSinais {
  id: string;
  titulo: string;
  status: string; // espera-se "Rascunho" | "Produção" | "Revisão" | "Aprovado"
  deadline: string | null;
}

export interface FonteIndisponivel {
  fonte: string;
  mensagem: string;
}

export interface EntradaSinais {
  /** Data civil de hoje, "YYYY-MM-DD". Fornecida pelo consumidor — o motor
   *  não consulta relógio nem fuso por conta própria (determinismo). */
  hojeIso: string;
  campanhas: CampanhaParaSinais[];
  briefings: BriefingParaSinais[];
  commercials: ComercialParaSinais[];
  /** Fontes cuja consulta falhou (espelhadas como sinais R6, nível
   *  Informação — problema do sistema, não do negócio). */
  fontesIndisponiveis: FonteIndisponivel[];
}

// --------------------------- Tempo (civil) ------------------------------

const MESES_CURTOS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

/** True somente para data civil válida "YYYY-MM-DD" (sem horário, sem fuso). */
function isDataCivil(valor: string | null | undefined): valor is string {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const ano = Number(valor.slice(0, 4));
  const mes = Number(valor.slice(5, 7));
  const dia = Number(valor.slice(8, 10));
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return false;
  // ida e volta por Date.UTC garante que a data existe de verdade
  // (ex.: rejeita 2026-02-30) sem envolver fuso horário em nenhum momento.
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia
  );
}

/** "2026-09-12" → "12 set 2026". Só manipulação de string: sem Date local,
 *  sem fuso — impossível deslocar o dia. Mesma convenção visual do produto. */
function dataCivilCurta(iso: string): string {
  const dia = Number(iso.slice(8, 10));
  const mes = Number(iso.slice(5, 7));
  const ano = iso.slice(0, 4);
  return `${dia} ${MESES_CURTOS[mes - 1]} ${ano}`;
}

/** Dias de calendário entre duas datas civis (>= 0 quando depois > antes). */
function diasEntreCivis(antesIso: string, depoisIso: string): number {
  const [ay, am, ad] = antesIso.split("-").map(Number);
  const [by, bm, bd] = depoisIso.split("-").map(Number);
  const antes = Date.UTC(ay, am - 1, ad);
  const depois = Date.UTC(by, bm - 1, bd);
  return Math.round((depois - antes) / 86_400_000);
}

// ------------------------- Formatação factual ---------------------------
// Espelha convenções já usadas no Dashboard (roas-vs-meta.tsx: "1,4x";
// lib/format: formatBRL). Números crus permanecem na evidência.

function roasTexto(valor: number): string {
  return `${valor.toFixed(1).replace(".", ",")}x`;
}

// ------------------------------ Regras ----------------------------------

function sinaisR1(campanhas: CampanhaParaSinais[]): SinalAtencao[] {
  const sinais: SinalAtencao[] = [];
  for (const c of campanhas) {
    const spendOk = Number.isFinite(c.spend) && c.spend > 0;
    const revOk = Number.isFinite(c.revenue) && c.revenue >= 0;
    const metaOk = Number.isFinite(c.roasMeta) && c.roasMeta > 0;
    if (c.status !== "Ativa" || !spendOk || !revOk || !metaOk) continue;
    const roas = c.revenue / c.spend;
    if (roas >= c.roasMeta) continue; // na meta ou acima: fato positivo, não é sinal
    const percentualAbaixo = ((c.roasMeta - roas) / c.roasMeta) * 100;
    sinais.push({
      id: `R1:${c.id}`,
      regraId: "R1",
      nivel: "acompanhar",
      titulo: `«${c.nome}» — ROAS ${roasTexto(roas)} contra meta ${roasTexto(c.roasMeta)} (${Math.round(percentualAbaixo)}% abaixo)`,
      evidencia: {
        tipo: "roas-abaixo-meta",
        spend: c.spend,
        revenue: c.revenue,
        roas,
        meta: c.roasMeta,
        percentualAbaixo,
      },
      fonte: "campanhas",
      destino: { href: "/campanhas", rotulo: "Abrir Campanhas" },
    });
  }
  return sinais;
}

function sinaisR2(campanhas: CampanhaParaSinais[]): SinalAtencao[] {
  const sinais: SinalAtencao[] = [];
  for (const c of campanhas) {
    const spendOk = Number.isFinite(c.spend) && c.spend > 0;
    if (c.status !== "Ativa" || !spendOk) continue;
    if (!(Number.isFinite(c.conversions) && c.conversions === 0)) continue;
    sinais.push({
      id: `R2:${c.id}`,
      regraId: "R2",
      nivel: "acompanhar",
      titulo: `«${c.nome}» — ${formatBRL(c.spend)} investidos, 0 conversões registradas`,
      evidencia: {
        tipo: "investimento-sem-conversao",
        spend: c.spend,
        conversions: 0,
      },
      fonte: "campanhas",
      destino: { href: "/campanhas", rotulo: "Abrir Campanhas" },
    });
  }
  return sinais;
}

function sinaisR3(briefings: BriefingParaSinais[], hojeIso: string): SinalAtencao[] {
  const sinais: SinalAtencao[] = [];
  if (!isDataCivil(hojeIso)) return sinais; // sem data de hoje confiável: silêncio
  for (const b of briefings) {
    // Só "Em Aprovação": rascunho não é compromisso; aprovado está concluído.
    if (b.status !== "Em Aprovação") continue;
    if (!isDataCivil(b.deadline)) continue; // sem prazo ou formato inesperado: silêncio
    if (b.deadline >= hojeIso) continue; // vence hoje ou no futuro: não vencido
    sinais.push({
      id: `R3:${b.id}`,
      regraId: "R3",
      nivel: "prioridade",
      titulo: `Briefing «${b.titulo}» — prazo de ${dataCivilCurta(b.deadline)} vencido, aguardando aprovação`,
      evidencia: {
        tipo: "prazo-vencido",
        deadline: b.deadline,
        status: b.status,
        diasVencido: diasEntreCivis(b.deadline, hojeIso),
      },
      fonte: "briefings",
      destino: { href: "/briefings", rotulo: "Abrir Briefings" },
    });
  }
  return sinais;
}

function sinaisR4(commercials: ComercialParaSinais[], hojeIso: string): SinalAtencao[] {
  const sinais: SinalAtencao[] = [];
  if (!isDataCivil(hojeIso)) return sinais;
  for (const c of commercials) {
    // Só trabalhos em andamento: rascunho não é compromisso; aprovado encerrou.
    if (c.status !== "Produção" && c.status !== "Revisão") continue;
    if (!isDataCivil(c.deadline)) continue;
    if (c.deadline >= hojeIso) continue;
    sinais.push({
      id: `R4:${c.id}`,
      regraId: "R4",
      nivel: "prioridade",
      titulo: `Comercial «${c.titulo}» — prazo de ${dataCivilCurta(c.deadline)} vencido, em ${c.status}`,
      evidencia: {
        tipo: "prazo-vencido",
        deadline: c.deadline,
        status: c.status,
        diasVencido: diasEntreCivis(c.deadline, hojeIso),
      },
      fonte: "commercials",
      destino: { href: "/comerciais", rotulo: "Abrir Comerciais" },
    });
  }
  return sinais;
}

function sinaisR6(fontes: FonteIndisponivel[]): SinalAtencao[] {
  return fontes.map((f) => ({
    id: `R6:${f.fonte}`,
    regraId: "R6" as const,
    nivel: "informacao" as const,
    titulo: `Fonte ${f.fonte} indisponível — dados desta fonte não carregados`,
    evidencia: {
      tipo: "fonte-indisponivel" as const,
      fonte: f.fonte,
      mensagem: f.mensagem,
    },
    fonte: f.fonte,
    // Sem rota: a ação é o Retry do próprio Dashboard (comportamento de UI).
    destino: null,
  }));
}

// ---------------------------- Ordenação ---------------------------------
// Totalmente determinística: (nível, regraId, chave da regra, id).
// - Prioridade: R3 antes de R4; em cada uma, deadline mais antigo primeiro.
// - Acompanhar: R1 antes de R2; R1 por distância da meta (maior primeiro);
//   R2 por spend (maior primeiro).
// - Informação: R6 por nome da fonte.
// O motor NÃO aplica limite de exibição — o consumidor decide quantos mostrar.

const ORDEM_NIVEL: Record<NivelAtencao, number> = {
  prioridade: 0,
  acompanhar: 1,
  informacao: 2,
};

function chavePrimaria(s: SinalAtencao): { num?: number; texto?: string } {
  switch (s.regraId) {
    case "R1":
      return { num: -(s.evidencia as EvidenciaRoasAbaixoMeta).percentualAbaixo };
    case "R2":
      return { num: -(s.evidencia as EvidenciaInvestimentoSemConversao).spend };
    case "R3":
    case "R4":
      return { texto: (s.evidencia as EvidenciaPrazoVencido).deadline };
    case "R6":
      return { texto: (s.evidencia as EvidenciaFonteIndisponivel).fonte };
  }
}

function ordenarSinais(sinais: SinalAtencao[]): SinalAtencao[] {
  return [...sinais].sort((a, b) => {
    const nivelDiff = ORDEM_NIVEL[a.nivel] - ORDEM_NIVEL[b.nivel];
    if (nivelDiff !== 0) return nivelDiff;
    if (a.regraId !== b.regraId) return a.regraId < b.regraId ? -1 : 1;
    const ka = chavePrimaria(a);
    const kb = chavePrimaria(b);
    if (ka.num !== undefined && kb.num !== undefined && ka.num !== kb.num) {
      return ka.num - kb.num;
    }
    if (ka.texto !== undefined && kb.texto !== undefined && ka.texto !== kb.texto) {
      return ka.texto < kb.texto ? -1 : 1;
    }
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

// ------------------------------ Motor -----------------------------------

/** Calcula todos os sinais suportados pelos dados recebidos. Puro e
 *  determinístico: mesma entrada → mesma saída, sempre ordenada. */
export function calcularSinais(entrada: EntradaSinais): SinalAtencao[] {
  const sinais = [
    ...sinaisR1(entrada.campanhas),
    ...sinaisR2(entrada.campanhas),
    ...sinaisR3(entrada.briefings, entrada.hojeIso),
    ...sinaisR4(entrada.commercials, entrada.hojeIso),
    ...sinaisR6(entrada.fontesIndisponiveis),
  ];
  return ordenarSinais(sinais);
}
