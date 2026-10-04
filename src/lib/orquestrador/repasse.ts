// src/lib/orquestrador/repasse.ts — CP-01 P4.1.2 (CONTEXT INTEGRITY)
// ======================================================================
// HIGIENE DE REPASSE entre agentes.
//
// PROBLEMA (auditoria pós-smoke P4.1.1): o output INTEIRO de um agente
// era copiado como camada 7 da etapa seguinte. Quando o LLM ecoa blocos
// internos (---[BLOCO:CONTRATO_AGENTE ...]--- etc.), esse eco subia na
// cadeia e virava "arquitetura duplicada" para os demais especialistas
// (context pollution / snowball).
//
// CONTRATO DESTA FUNÇÃO:
// - Remove SOMENTE delimitadores estruturais EXATOS produzidos pelo nosso
//   compositor (composicao.ts: `---[BLOCO:X]---` ... `---[FIM:BLOCO:X]---`),
//   com MESMO rótulo X na abertura e no fechamento (backreference).
// - NÃO é filtro semântico: jamais remove parágrafo por conter palavras
//   como "Constituição", "briefing", "contrato", "epistêmico".
// - Bloco aberto SEM fechamento confiável = AMBÍGUO: conteúdo é PRESERVADO
//   e o caso é contado em `ambiguos` para diagnóstico (nunca apagamos
//   conteúdo incerto — "limpeza de contexto" NÃO é "limpeza de evidência").
// - Determinístico puro: mesmo texto → mesmo resultado.
// - ZERO custo: sem rede, sem IA, sem estado.
//
// NOTA DE AUDITABILIDADE: esta função é usada apenas para o cartão
// propagationOutput/publicOutput. O pipeline mantém separadamente o
// auditableText (raw integral) — ver pipeline.ts. Claims materiais NUNCA
// desaparecem do caminho auditável.
// ======================================================================

/** Rótulos internos cuja remoção é segura quando o BLOCO COMPLETO aparece
 *  ecoado (sabemos que são artefatos de transporte, nunca entrega de
 *  especialista). */
const ROTULOS_INTERNOS = [
  "CONTRATO_AGENTE",
  "REPERTORIO",
  "SAIDA_FERRAMENTA",
  "CONSTITUICAO",
  "AUTORIZACAO",
] as const;

const GRUPO_ROTULOS = ROTULOS_INTERNOS.join("|");

/** Abertura de bloco completo com o rótulo exato; o fechamento deve repetir
 *  o mesmo rótulo (backreference \1). Lazy = blocos adjacentes não se fundem. */
const RX_BLOCO_COMPLETO = new RegExp(
  `---\\[BLOCO:(${GRUPO_ROTULOS})[^\\]\\r\\n]*\\]---\\r?\\n?[\\s\\S]*?\\n?---\\[FIM:BLOCO:\\1[^\\]\\r\\n]*\\]---`,
  "g"
);

/** Abertura solta (para contar blocos AMBÍGUOS que não seremos capazes de
 *  remover com segurança). */
const RX_ABERTURA = new RegExp(`---\\[BLOCO:(${GRUPO_ROTULOS})[^\\]\\r\\n]*\\]---`, "g");
const RX_FECHAMENTO = new RegExp(`---\\[FIM:BLOCO:(${GRUPO_ROTULOS})[^\\]\\r\\n]*\\]---`, "g");

export interface ResultadoHigiene {
  /** Texto com os blocos internos completos removidos (propagação/UI). */
  readonly texto: string;
  /** Quantidade de blocos internos COMPLETOS removidos. */
  readonly blocosRemovidos: number;
  /** Aberturas sem fechamento pareado — NADA foi apagado delas; só reportam. */
  readonly ambiguos: number;
  readonly charsAntes: number;
  readonly charsDepois: number;
}

export function higienizarRepasse(texto: string): ResultadoHigiene {
  if (!texto) {
    return { texto, blocosRemovidos: 0, ambiguos: 0, charsAntes: 0, charsDepois: 0 };
  }
  let blocosRemovidos = 0;
  const semBlocos = texto.replace(RX_BLOCO_COMPLETO, () => {
    blocosRemovidos += 1;
    return "";
  });
  // Colapso leve e DETERMINÍSTICO de vazios excessivos deixados pela remoção
  // (máx. 2 quebras seguidas). Não toca conteúdo residual de nenhum parágrafo.
  const limpo = semBlocos.replace(/\n{3,}/g, "\n\n").replace(/^[ \t]+$/gm, "").trim();

  const aberturas = (limpo.match(RX_ABERTURA) ?? []).length;
  const fechamentos = (limpo.match(RX_FECHAMENTO) ?? []).length;
  const ambiguos = Math.max(aberturas - 0, Math.abs(aberturas - fechamentos));

  return {
    texto: limpo,
    blocosRemovidos,
    ambiguos,
    charsAntes: texto.length,
    charsDepois: limpo.length,
  };
}

/** Evento mínimo de eco para o DIAGNÓSTICO (camada técnica colapsável,
 *  jamais despejado no usuário comum). Campos são apenas contagens —
 *  nunca conteúdo do provider (whitelist P2). */
export function diagnosticoEco(limpeza: ResultadoHigiene) {
  if (limpeza.blocosRemovidos === 0 && limpeza.ambiguos === 0) return null;
  return {
    ecoDetectado: true,
    ecoBlocosRemovidos: limpeza.blocosRemovidos,
    ecoBlocosAmbiguosPreservados: limpeza.ambiguos,
    repasseCharsAntes: limpeza.charsAntes,
    repasseCharsDepois: limpeza.charsDepois,
  } as const;
}
