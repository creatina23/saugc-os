// src/lib/orquestrador/status.ts — CP-01 P4.1.2 (VERDICT SEMANTICS)
// ======================================================================
// STATUS GERAL composto: QUALIDADE (Auditor LLM) × INTEGRIDADE (Gate
// determinístico) → estado honesto de prontidão.
//
// REGRAS DE AUTORIDADE (não negociáveis):
// - O GATE determinístico é a ÚNICA barreira mecânica de integridade. O
//   veredito do Auditor LLM NUNCA ganha autoridade determinística — ele é
//   uma avaliação transcrita honestamente para o usuário decidir.
// - Auditor explicitamente REPROVADO ou pedindo REVISAR → nunca "PRONTO".
// - NÃO existe limiar oficial de nota 0–10 no produto: por decisão
//   documentada aqui, NÃO criamos limiar silencioso — a nota é exibida
//   como informação e a RPC usa o VEREDITO TEXTUAL parseado (contrato
//   AGT-012). Se um limiar de nota for decidido no futuro, deve vir com
//   regra de produto explicitamente aprovada.
// - Falha/ausência do Auditor ⇒ sem auditoria confiável ⇒ nunca PRONTO.
// ======================================================================

import type { VereditoEpistemico } from "./epistemico";

export type StatusGeral = "PRONTO" | "REVISAO_NECESSARIA" | "BLOQUEADO";

/** VEREDITO textual do AGT-012 (transcrição honesta, normalizada em
 *  maiúsculas, sem adicionar/remover semântica). */
export const REGEX_VEREDITO_AUDITOR =
  /(?:^|\n)\s*VEREDITO\s*:\s*(APROVADO COM AJUSTES|APROVADO|REVISAR|REPROVADO|N[AÃ]O\s+AVALIADO[^\n]*)/i;

export function parseVereditoAuditor(texto: string): string | null {
  const m = texto.match(REGEX_VEREDITO_AUDITOR);
  if (!m || typeof m[1] !== "string") return null;
  const valor = m[1].replace(/\s+/g, " ").trim().toUpperCase();
  return valor === "" ? null : valor;
}

/** Vereditos do Auditor que impedem "PRONTO" (qualidade não pronta). */
const AUDITOR_REPROVANTES: readonly string[] = ["REPROVADO", "REVISAR"];

export function calcularStatusGeral(entrada: {
  readonly vereditoGate?: VereditoEpistemico | null;
  readonly vereditoAuditorLlm?: string | null;
  readonly auditorConcluido?: boolean;
}): StatusGeral {
  const { vereditoGate, vereditoAuditorLlm, auditorConcluido } = entrada;

  // 1) Gate bloqueou ⇒ BLOQUEADO (integridade manda).
  if (vereditoGate === "BLOQUEADO_POR_EVIDENCIA") return "BLOQUEADO";

  // 2) Gate pede ajustes ⇒ revisão necessária.
  if (vereditoGate === "APROVADO_COM_AJUSTES") return "REVISAO_NECESSARIA";

  // 3) Auditor explicitamente reprova/pede revisar ⇒ revisão necessária.
  if (vereditoAuditorLlm) {
    if (
      AUDITOR_REPROVANTES.includes(vereditoAuditorLlm) ||
      vereditoAuditorLlm.startsWith("NÃO AVALIADO")
    ) {
      return "REVISAO_NECESSARIA";
    }
    if (vereditoAuditorLlm === "APROVADO COM AJUSTES") return "REVISAO_NECESSARIA";
  }

  // 4) Sem auditor concluído ⇒ não há como declarar pronto com honestidade.
  if (auditorConcluido === false) return "REVISAO_NECESSARIA";

  // 5) Gate sem bloqueios ∧ auditor não reprovou ⇒ PRONTO.
  return "PRONTO";
}
