// TR-04.8D.3.2B — PRIORITY ENGINE V1 (motor puro de prioridades).
// ======================================================================
// Camada determinística ENTRE o Attention Engine e o futuro Command
// Center (decisão D1: o motor de sinais permanece independente e IMUTÁVEL;
// este engine CONSOME seus sinais — nunca os reimplementa nem os altera).
//
// O que este arquivo faz: converte cada SinalAtencao em uma PriorityV1
// (contratos de src/lib/priority-types.ts), 1:1, preservando a ordem
// recebida, com validação estrutural explícita e falha honesta em
// violação de contrato (padrão C-17 do compositor: Error explícito,
// nunca saída parcial que aparente sucesso).
//
// O que este arquivo NÃO faz (proteções permanentes, não esquecimentos):
// - NÃO gera recomendação / score / ranking próprio / probability;
// - NÃO chama IA, Supabase, fetch, relógio, aleatoriedade ou qualquer IO;
// - NÃO executa ações, NÃO persiste, NÃO tem memory/learning/outcome;
// - NÃO tem regra de orçamento/budget (EvidenciaOrcamentoConsumido existe
//   no contrato, mas NENHUMA prioridade V1 é criada a partir dela —
//   "80% consumido" isolado não é problema e não há end_date no schema);
// - NÃO tem expiration/lifecycle (prioridade é recalculada em memória a
//   cada carga — não existe o que expirar);
// - NÃO usa `titulo` para identidade ou reason (titulo é conveniência de
//   exibição do motor, nunca fonte de verdade).
//
// ORDEM (Correção 2, verbatim comportamental):
//   "calcularPrioridades preserva a ordem dos sinais recebidos."
// Preservar != exigir: este engine NÃO declara nenhuma ordenação própria
// como pré-condição estrutural, NÃO reordena, NÃO chama ordenarSinais e
// NÃO duplica o algoritmo aprovado do motor. O produtor atual
// (calcularSinais) entrega sinais ordenados; consumidores futuros decidem
// sua própria ordem — aqui ela é simplesmente respeitada.
//
// IDENTIDADE (Correção 1): entityId vem EXCLUSIVAMENTE de sinal.entityId
// (campo estrutural exposto pelo motor na 8D.3.2B-0 — blob 446d3b72…).
// PROIBIDO reconstruí-lo por split/substring/regex/parsing de sinal.id.
// sinal.id serve para identidade/rastreabilidade da prioridade e para
// deduplicação — nada mais.
//
// VERSIONAMENTO: PRIORITY_ENGINE_VERSION segue "priority-N", com bump
// somente quando a semântica de mapeamento/validação mudar. Independente
// de Constituição (1.0.0), COMPOSITION (cmp-1.0) e do motor attention.
//
// JSON-SAFE por construção: produz apenas contratos de priority-types.ts.
// PURO: import type apenas; nenhum import de runtime.

import type { RegraId, SinalAtencao } from "./attention";
import type {
  CandidatoAcao,
  FonteEntidade,
  PriorityV1,
} from "./priority-types";

// 8D.3.4.2: bump priority-1 → priority-2 — semântica de mapeamento mudou:
// R4 com status "Produção" passa a emitir candidata INTERNAL-EXECUTION
// (piloto da Action Layer) além da navigation já existente.
export const PRIORITY_ENGINE_VERSION = "priority-2";

export interface EntradaPrioridades {
  /** Sinais produzidos pelo Attention Engine (src/lib/attention.ts). A
   *  ordem recebida é preservada 1:1 — este engine não ordena. */
  readonly sinais: readonly SinalAtencao[];
  /** ISO-8601 do MOMENTO DESTE CÁLCULO, fornecido pelo consumidor (o
   *  engine não consulta relógio — determinismo/testabilidade). Vira
   *  `createdAt` de cada prioridade: significa "quando esta prioridade
   *  foi calculada" e NÃO frescor/atualidade dos dados de origem. */
  readonly calculadoEm: string;
}

// --------------------------- Tabela de regras --------------------------
// Correspondência regra → (tipo de evidência esperado, fonte/tabela da
// entidade, reason factual). Os reasons são FACTUAIS e deriváveis da
// evidência: sem verbos causais, sem prescrição, sem adjetivo de juízo.
// Suportadas no V1: exatamente R1, R2, R3, R4, R6 (as regras do motor).

interface DefinicaoRegra {
  /** Tipo de evidência que a regra DEVE carregar (validado por sinal). */
  readonly tipoEvidencia: SinalAtencao["evidencia"]["tipo"];
  /** Tabela real da entidade de negócio; null = prioridade de SISTEMA
   *  (R6) — a falha de uma fonte não é uma linha de negócio. */
  readonly fonteEntidade: FonteEntidade | null;
  /** Reason factual aprovada (R6 é interpolada com a fonte real, ver
   *  prioridadeDoSinal). */
  readonly reason: string;
}

const REGRAS_V1: Record<RegraId, DefinicaoRegra> = {
  R1: {
    tipoEvidencia: "roas-abaixo-meta",
    fonteEntidade: "campaigns",
    reason: "Campanha ativa com ROAS abaixo da meta configurada.",
  },
  R2: {
    tipoEvidencia: "investimento-sem-conversao",
    fonteEntidade: "campaigns",
    // "registradas" é semântica, não estilo: o dado prova o que foi
    // registrado (tracking quebrado também produz este sinal).
    reason:
      "Campanha ativa com investimento registrado e zero conversões registradas.",
  },
  R3: {
    tipoEvidencia: "prazo-vencido",
    fonteEntidade: "briefings",
    reason: "Briefing aguardando aprovação com prazo vencido.",
  },
  R4: {
    tipoEvidencia: "prazo-vencido",
    fonteEntidade: "commercials",
    reason: "Comercial em produção ou revisão com prazo vencido.",
  },
  R6: {
    tipoEvidencia: "fonte-indisponivel",
    fonteEntidade: null,
    reason: "", // interpolada com a fonte real da evidência (abaixo)
  },
};

// ------------------------- Conversão de um sinal ------------------------

function prioridadeDoSinal(sinal: SinalAtencao, calculadoEm: string): PriorityV1 {
  // Regra desconhecida: THROW. Nunca converter genericamente, nunca
  // ignorar silenciosamente, nunca inventar/usar titulo como reason.
  // (TypeScript vê RegraId fechado; o guard é para entrada fora de
  // contrato em runtime — ex.: versão futura do motor com regra nova.)
  const definicao = (REGRAS_V1 as Record<string, DefinicaoRegra | undefined>)[
    sinal.regraId
  ];
  if (definicao === undefined) {
    throw new Error(
      `calcularPrioridades: regraId não suportado ("${sinal.regraId}") no sinal "${sinal.id}". ` +
        "O Priority Engine V1 suporta exatamente R1, R2, R3, R4 e R6 — " +
        "uma regra nova exige unidade aprovada de mapeamento."
    );
  }

  // Regra ↔ evidência: correspondência obrigatória (o engine não valida
  // números — as pré-condições numéricas são garantidas pelo motor — mas
  // exige que a ESTRUTURA seja a da regra declarada).
  if (sinal.evidencia.tipo !== definicao.tipoEvidencia) {
    throw new Error(
      `calcularPrioridades: evidência "${sinal.evidencia.tipo}" incompatível com a regra ${sinal.regraId} ` +
        `(esperado "${definicao.tipoEvidencia}") no sinal "${sinal.id}".`
    );
  }

  // Entidade: estrutural via sinal.entityId; null para prioridade de
  // sistema (R6). NUNCA parsing de sinal.id. Sem fallback e sem
  // clientName (o sinal não o carrega — campo opcional fica ausente).
  let entidade: PriorityV1["entidade"] = null;
  if (definicao.fonteEntidade !== null) {
    const entityId = sinal.entityId;
    if (typeof entityId !== "string" || entityId.trim() === "") {
      throw new Error(
        `calcularPrioridades: entityId vazio ou inválido no sinal "${sinal.id}" (regra ${sinal.regraId}). ` +
          "Prioridade sobre entidade exige identificador estrutural real — sem fallback."
      );
    }
    entidade = { fonte: definicao.fonteEntidade, id: entityId };
  }

  // Reason: R6 é interpolado com a fonte REAL da evidência (a validação
  // acima já garantiu o discriminante — o narrowing é seguro);
  // as demais regras usam o texto factual fixo da tabela.
  const reason =
    sinal.evidencia.tipo === "fonte-indisponivel"
      ? `Fonte «${sinal.evidencia.fonte}» indisponível — os dados desta fonte não foram carregados nesta análise.`
      : definicao.reason;

  // Ações: navigation quando o sinal tem destino — POSSIBILIDADE de ir
  // verificar, NÃO recomendação de executar nada (literais congelados do
  // contrato: sempre available, nunca exige confirmação). R6 tem destino
  // null → acoes [] (Retry é comportamento da tela, não da prioridade).
  const acoes: CandidatoAcao[] = [];
  if (sinal.destino !== null) {
    const href = sinal.destino.href;
    if (typeof href !== "string" || href.trim() === "") {
      throw new Error(
        `calcularPrioridades: destino sem href válido no sinal "${sinal.id}". ` +
          "Navigation candidate não existe sem rota real."
      );
    }
    acoes.push({
      id: `nav:${href}`,
      categoria: "navigation",
      label: sinal.destino.rotulo,
      href,
      availability: "available",
      requiresConfirmation: false,
    });
  }

  // TR-04.8D.3.4.2 — candidata INTERNAL-EXECUTION (piloto da Action
  // Layer). Condição DETERMINÍSTICA e explicável, sustentada pela
  // própria evidência da R4: comercial com prazo vencido E status real
  // "Produção" — o fluxo legítimo é seguir para revisão ("Marcar em
  // revisão"). Status "Revisão" NÃO emite candidata: já está no destino
  // (a Action Layer ainda responderia already_satisfied, mas oferecer
  // no-op não é proposta honesta). R3 usa o mesmo tipo de evidência mas
  // outro enum de status (briefings) — fora do piloto. Nenhuma regra de
  // negócio nova é inventada aqui: é a mesma leitura factual da R4.
  // requiresConfirmation: true (congelado para o piloto): apresentar a
  // candidata NUNCA executa nada; a execução exige confirmação humana
  // explícita na UI + decisão da Action Layer server-side.
  if (
    sinal.regraId === "R4" &&
    sinal.evidencia.tipo === "prazo-vencido" &&
    sinal.evidencia.status === "Produção" &&
    entidade !== null
  ) {
    acoes.push({
      // Id estável e determinístico (âncora; nunca aleatório/índice).
      id: `op:commercials:marcar-em-revisao:${sinal.entityId}`,
      categoria: "internal-execution",
      label: "Marcar em revisão",
      availability: "available",
      requiresConfirmation: true,
      // NOME simbólico declarativo (contrato): quem interpreta este
      // identificador e o traduz para a rota concreta é a camada de
      // execução (adaptador), nunca a UI solta.
      operacao: "commercials:marcar-em-revisao",
    });
  }

  return {
    // Identidade/rastreabilidade/dedup: direta do sinal (estável).
    id: sinal.id,
    ruleId: sinal.regraId,
    entidade,
    classe: sinal.nivel,
    // A evidência do sinal É a evidência da prioridade (sem cópia, sem
    // resumo, sem fusão): é ela que responde "Por que estou vendo isso?".
    evidencias: [sinal.evidencia],
    reason,
    // Toda prioridade V1 deriva de regra determinística sobre dado real.
    // "inferida-ia"/"precisa-confirmacao" não têm produtor no V1.
    confidence: "factual",
    acoes,
    origem: { engine: "rules", version: PRIORITY_ENGINE_VERSION },
    createdAt: calculadoEm,
  };
}

// ------------------------------- Engine ---------------------------------

/** Converte os sinais recebidos em prioridades V1, 1:1, preservando a
 *  ordem dos sinais recebidos. Puro e determinístico: mesma entrada →
 *  mesma saída. Entrada vazia → saída vazia (vazio legítimo, não erro).
 *
 *  Falha explícita (throw) em qualquer violação de contrato: regra
 *  desconhecida, evidência incompatível, entityId inválido, destino sem
 *  rota OU id duplicado — sem first-wins, sem last-wins, sem merge, sem
 *  silêncio. */
export function calcularPrioridades(
  entrada: EntradaPrioridades
): readonly PriorityV1[] {
  const prioridades: PriorityV1[] = [];
  const idsVistos = new Set<string>();
  for (const sinal of entrada.sinais) {
    // Dedup por id estável. Duplicata = bug estrutural no produtor (o
    // motor emite no máximo 1 sinal por `${regraId}:${entityId}`): falhar
    // alto é preferível a descartar um fato aprovado sem registro.
    if (idsVistos.has(sinal.id)) {
      throw new Error(
        `calcularPrioridades: id duplicado ("${sinal.id}") — violação de contrato do produtor; ` +
          "nenhuma prioridade foi mesclada nem descartada silenciosamente."
      );
    }
    idsVistos.add(sinal.id);
    prioridades.push(prioridadeDoSinal(sinal, entrada.calculadoEm));
  }
  return prioridades;
}
