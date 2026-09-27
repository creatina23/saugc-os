"use client";

// TR-04.8D.3.3.1A — COMMAND CENTER (apresentação L1–L3, componente inerte).
// ======================================================================
// Superfície de apoio à decisão humana sobre o Priority Engine V1.
// Estritamente APRESENTACIONAL: recebe PriorityV1[] JÁ CALCULADO pelo
// wiring (3.3.1B) — este componente NÃO chama calcularSinais/
// calcularPrioridades, NÃO consulta Supabase/rede/relógio para criar
// verdade e NÃO recria prioridades.
//
// Truth por construção:
// - Prioridade ≠ Recomendação: nada aqui sugere curso de ação. A razão
//   (reason) vem pronta do engine e é exibida verbatim — nunca
//   reinterpretada, reescrita ou reclassificada.
// - L3 renderiza SOMENTE os CandidatoAcao recebidos (hoje: navegação).
//   Nenhuma ação é inferida de reason/regra/evidência; nada executa nada.
// - Regra de negócio duplicada: ZERO (auditoria da unidade). O único
//   pattern matching permitido é o discriminante `tipo` da evidência —
//   APRESENTAÇÃO factual de números crus, não reimplementação de regra.
//   Este arquivo não contém "R1:"…"R6:" nem os reasons oficiais.
// - Erros do engine: o try/catch mora no wiring (3.3.1B, dashboard-view).
//   Este componente NÃO recebe mensagem técnica (nunca error.message) —
//   recebe apenas o flag booleano `erroCalculo` e exibe a verdade
//   operacional aprovada: "o cálculo não pôde ser concluído".
//   O flag tem precedência sobre demo/vazio/lista: com erro, `prioridades`
//   é ignorada e o estado de vazio legítimo NUNCA é exibido.
//
// Dívida declarada: os mapas visuais de classe (badge/borda) repetem os
// tokens do attention-panel por decisão de não tocar naquele arquivo.
// Extração compartilhada fica para housekeeping autorizado.
//
// Progressive disclosure: L1 sempre visível → L2 ("Por quê?") por linha →
// L3 é a zona de ação permitida pelo contrato, dentro da linha.

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Compass } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  CandidatoAcao,
  ClassePrioridade,
  EvidenciaPrioridade,
  FonteEntidade,
  OrigemPrioridade,
  PriorityV1,
} from "@/lib/priority-types";

// Limite APRESENTACIONAL inicial (padrão da casa, ver attention-panel).
// O array recebido nunca é modificado nem reordenado — apenas fatiado para
// exibição, com disclosure honesto das restantes na ordem original.
const MAX_INICIAL = 5;

// Classe em TEXTO sempre (cor nunca é o único canal — acessibilidade).
const CLASSE_TEXTO: Record<ClassePrioridade, string> = {
  prioridade: "Prioridade",
  acompanhar: "Acompanhar",
  informacao: "Informação",
};

// Tokens visuais da casa (idênticos aos do attention-panel — dívida §header).
const CLASSE_BLOCO: Record<ClassePrioridade, string> = {
  prioridade: "border-l-destructive",
  acompanhar: "border-l-warning",
  informacao: "border-l-primary",
};

const CLASSE_BADGE: Record<ClassePrioridade, string> = {
  prioridade: "border-destructive/40 bg-destructive/10 text-destructive",
  acompanhar: "border-warning/40 bg-warning/10 text-warning",
  informacao: "border-primary/40 bg-primary/10 text-primary",
};

// Rótulo de exibição da fonte/tabela (apresentação — a entidade não traz
// nome legível no contrato V1; exibimos fonte + id, sem inventar nome).
const FONTE_ROTULO: Record<FonteEntidade, string> = {
  campaigns: "Campanha",
  briefings: "Briefing",
  commercials: "Comercial",
  deals: "Negócio",
  clients: "Cliente",
  assets: "Asset",
};

// --------------------- Formatação de APRESENTAÇÃO ----------------------
// Convenções visuais da casa (BRL, "1,4x", %, data civil curta). Nada
// aqui altera dados: só renderiza o que já veio pronto na evidência.

const MESES_CURTOS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

/** "2026-09-12" → "12 set 2026" — só manipulação de string (sem fuso). */
function fmtDataCivil(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const dia = Number(iso.slice(8, 10));
  const mes = Number(iso.slice(5, 7));
  const ano = iso.slice(0, 4);
  return `${dia} ${MESES_CURTOS[mes - 1]} ${ano}`;
}

function fmtRoas(valor: number): string {
  return Number.isFinite(valor) ? `${valor.toFixed(1).replace(".", ",")}x` : "—";
}

function fmtBrl(valor: number): string {
  return Number.isFinite(valor) ? formatBRL(valor) : "—";
}

function fmtPct(valor: number): string {
  return Number.isFinite(valor) ? `${Math.round(valor)}%` : "—";
}

function fmtInteiro(valor: number): string {
  return Number.isFinite(valor) ? String(valor) : "—";
}

/** createdAt recebido → legível pt-BR. Apresentação de timestamp PRONTO
 *  (nunca cria verdade operacional). Se o valor for inesperado, exibe o
 *  texto cru — guarda puramente visual, nunca mascaramento de cálculo. */
function fmtCalculadoEm(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --------------------- Evidências como FATOS (L2) ----------------------
// Pattern matching SOMENTE no discriminante `tipo` — render factual dos
// campos crus, sem verbos causais e sem interpretação. Exhaustividade em
// tempo de compilação: se a union crescer sem render, tsc falha aqui.

function fatosDaEvidencia(evidencia: EvidenciaPrioridade): string[] {
  switch (evidencia.tipo) {
    case "roas-abaixo-meta":
      return [
        `Investido: ${fmtBrl(evidencia.spend)}`,
        `Receita registrada: ${fmtBrl(evidencia.revenue)}`,
        `ROAS real: ${fmtRoas(evidencia.roas)}`,
        `Meta configurada: ${fmtRoas(evidencia.meta)}`,
        `Distância da meta: ${fmtPct(evidencia.percentualAbaixo)} abaixo`,
      ];
    case "investimento-sem-conversao":
      return [
        `Investido: ${fmtBrl(evidencia.spend)}`,
        `Conversões registradas: ${fmtInteiro(evidencia.conversions)}`,
      ];
    case "prazo-vencido":
      return [
        `Prazo: ${fmtDataCivil(evidencia.deadline)}`,
        `Status registrado: ${evidencia.status}`,
        `Vencido há: ${evidencia.diasVencido} dia${evidencia.diasVencido === 1 ? "" : "s"}`,
      ];
    case "fonte-indisponivel":
      return [
        `Fonte: ${evidencia.fonte}`,
        `Mensagem real: ${evidencia.mensagem}`,
      ];
    case "orcamento-consumido":
      // Contrato suportado (3.1A) — NENHUM produtor no V1. Render pronto
      // para o dia em que uma regra aprovada o emitir.
      return [
        `Orçamento configurado: ${fmtBrl(evidencia.budget)}`,
        `Investido: ${fmtBrl(evidencia.spend)}`,
        `Consumido: ${fmtPct(evidencia.percentualConsumido)} do orçamento`,
      ];
    default: {
      const exaustivo: never = evidencia;
      return [String(exaustivo)];
    }
  }
}

function rotuloDaOrigem(origem: OrigemPrioridade): string {
  // Union discriminada do contrato: IA carrega motor obrigatório; rules não.
  return origem.engine === "ai"
    ? `Origem: IA · ${origem.motor} · ${origem.version}`
    : `Origem: motor de regras · ${origem.version}`;
}

// ------------------------------- Props ---------------------------------

interface CommandCenterProps {
  /** Prioridades JÁ calculadas pelo engine (src/lib/priority.ts), na
   *  ordem recebida — exibidas 1:1, sem reagrupar/reclassificar. */
  prioridades: readonly PriorityV1[];
  /** Modo demonstração: sem suporte honesto, mensagem padrão. */
  modoDemo: boolean;
  /** Há fontes com falha → cobertura parcial (nunca afirmar completude). */
  analiseParcial: boolean;
  /** Flag booleano do wiring (3.3.1B): o cálculo do Priority Engine FALHOU.
   *  Sem mensagem técnica por contrato — o componente exibe apenas a
   *  verdade operacional aprovada. Quando true, este estado tem
   *  precedência e substitui demo/vazio/lista (vazio legítimo nunca é
   *  exibido junto de erro). Default: false (presente somente no erro). */
  erroCalculo?: boolean;
}

export function CommandCenter({
  prioridades,
  modoDemo,
  analiseParcial,
  erroCalculo = false,
}: CommandCenterProps) {
  // Estado LOCAL exclusivamente de disclosure (L2 e "mostrar restantes").
  const [abertos, setAbertos] = useState<ReadonlySet<string>>(new Set());
  const [mostrarRestantes, setMostrarRestantes] = useState(false);

  const alternarL2 = (id: string) => {
    setAbertos((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  };

  const semSuporteDemo = modoDemo && prioridades.length === 0;
  const iniciais = prioridades.slice(0, MAX_INICIAL);
  const restantes = prioridades.slice(MAX_INICIAL);
  const exibidas = mostrarRestantes ? prioridades : iniciais;

  const renderPrioridade = (prioridade: PriorityV1) => {
    const aberto = abertos.has(prioridade.id);
    const regiaoId = `cc-evidencias-${prioridade.id}`;
    // R6/sistema: entidade null por contrato — a fonte vem da evidência
    // fonte-indisponivel (pattern matching de apresentação, nunca entidade
    // inventada).
    const rotuloEntidade =
      prioridade.entidade !== null
        ? `${FONTE_ROTULO[prioridade.entidade.fonte]} · ${prioridade.entidade.id}`
        : prioridade.evidencias[0]?.tipo === "fonte-indisponivel"
          ? `Sistema · fonte ${prioridade.evidencias[0].fonte}`
          : "Sistema";

    return (
      <li
        key={prioridade.id}
        className={cn(
          "rounded-xl border border-border/60 border-l-4 bg-background/40 p-4",
          CLASSE_BLOCO[prioridade.classe]
        )}
      >
        {/* ---------- L1 — Consciência: "O que precisa de mim?" ---------- */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn("text-xs", CLASSE_BADGE[prioridade.classe])}
              >
                {CLASSE_TEXTO[prioridade.classe]}
              </Badge>
              <span className="break-all text-xs font-medium text-muted-foreground">
                {rotuloEntidade}
              </span>
            </div>
            {/* Reason vem pronta do engine — exibida verbatim, jamais reescrita. */}
            <p className="mt-2 text-sm font-medium">{prioridade.reason}</p>
          </div>
          <button
            type="button"
            onClick={() => alternarL2(prioridade.id)}
            aria-expanded={aberto}
            aria-controls={regiaoId}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 self-start rounded-lg border border-border px-3 text-xs font-semibold transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:self-center"
          >
            {aberto ? "Ocultar evidências" : "Por quê? (evidências)"}
            <ChevronDown
              aria-hidden="true"
              className={cn("size-3.5 transition-transform", aberto && "rotate-180")}
            />
          </button>
        </div>

        {/* ---------- L2 — Contexto: "Por quê?" (disclosure) ---------- */}
        {aberto && (
          <div
            id={regiaoId}
            className="mt-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5"
          >
            <p className="text-xs font-semibold text-foreground/80">Fatos</p>
            {prioridade.evidencias.map((evidencia, indice) => (
              <ul
                key={`${prioridade.id}-ev-${indice}`}
                className="mt-1.5 list-disc space-y-1 pl-5 text-xs text-muted-foreground marker:text-muted-foreground/60"
              >
                {fatosDaEvidencia(evidencia).map((fato, fatoIndice) => (
                  <li key={`${prioridade.id}-ev-${indice}-f-${fatoIndice}`} className="break-all tabular-nums">
                    {fato}
                  </li>
                ))}
              </ul>
            ))}
            <p className="mt-2.5 text-xs text-muted-foreground">
              {rotuloDaOrigem(prioridade.origem)}
            </p>
            {/* Rótulo honesto: momento do CÁLCULO — nunca frescor dos dados. */}
            <p className="mt-1 text-xs text-muted-foreground">
              Calculado em {fmtCalculadoEm(prioridade.createdAt)}
            </p>
          </div>
        )}

        {/* ---------- L3 — Ação permitida pelo contrato ---------- */}
        {/* Renderiza SOMENTE o que o engine entregou. Nada é inferido. */}
        {prioridade.acoes.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Nenhuma ação disponível para esta prioridade.
          </p>
        ) : (
          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-2">
              {prioridade.acoes.map((acao: CandidatoAcao) =>
                acao.categoria === "navigation" ? (
                  <Link
                    key={acao.id}
                    href={acao.href}
                    className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {acao.label}
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                ) : (
                  // Contract-defensivo: V1 nunca emite não-navigation. Se um
                  // dia emitir, exibimos honestamente como não executável
                  // aqui (nunca prometemos execução que não existe).
                  <span
                    key={acao.id}
                    className="inline-flex h-11 items-center rounded-lg border border-dashed border-border/60 px-3 text-xs text-muted-foreground"
                  >
                    {acao.label} — {acao.availability === "available" ? "disponível" : "não disponível"}
                  </span>
                )
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Abrir o contexto real para verificar — nenhuma ação é executada aqui.
            </p>
          </div>
        )}
      </li>
    );
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/80">
            <Compass aria-hidden="true" className="size-4" />
          </div>
          <div className="min-w-0">
            <h2 id="titulo-command-center" className="text-sm font-semibold">
              Central de Prioridades
            </h2>
            <p className="text-xs text-muted-foreground">
              Calculadas por regras determinísticas sobre dados reais — contexto para a sua decisão, não instrução de ação.
            </p>
          </div>
        </div>

        {analiseParcial && (
          <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            Algumas fontes não carregaram; a análise está parcial.
          </p>
        )}

        {erroCalculo ? (
          // Erro HONESTO do cálculo (3.3.1B): a verdade operacional —
          // nunca a mensagem técnica do engine (fica no console do wiring).
          // `prioridades` é ignorada aqui: erro NÃO é vazio legítimo.
          <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-6 text-center">
            <p className="text-sm font-medium text-destructive">
              O cálculo de prioridades não pôde ser concluído nesta análise.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              O painel de atenção continua disponível acima. Você pode recarregar o painel para tentar de novo.
            </p>
          </div>
        ) : semSuporteDemo ? (
          <p className="mt-4 rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
            Não disponível na demonstração.
          </p>
        ) : prioridades.length === 0 ? (
          // Vazio legítimo: factual — NUNCA "está tudo certo/perfeito".
          <p className="mt-4 rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhuma prioridade operacional identificada com os dados disponíveis neste cálculo.
          </p>
        ) : (
          <>
            <ul
              aria-labelledby="titulo-command-center"
              className="mt-4 space-y-3"
            >
              {exibidas.map(renderPrioridade)}
            </ul>
            {restantes.length > 0 && !mostrarRestantes && (
              <button
                type="button"
                onClick={() => setMostrarRestantes(true)}
                className="mt-3 inline-flex h-11 items-center rounded-lg border border-border px-3 text-xs font-semibold transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Mostrar mais {restantes.length} prioridade{restantes.length === 1 ? "" : "s"} (ordem original)
              </button>
            )}
            {restantes.length > 0 && mostrarRestantes && (
              <button
                type="button"
                onClick={() => setMostrarRestantes(false)}
                className="mt-3 inline-flex h-11 items-center rounded-lg border border-border px-3 text-xs font-semibold transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Mostrar apenas as {MAX_INICIAL} iniciais
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
