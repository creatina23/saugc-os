// TR-04.8D.3.4.1 — ACTION LAYER · EXECUTION RECEIPT (camada comum mínima).
// ======================================================================
// Receipt = Comprovante de Execução: a ÚNICA forma de resposta de um
// Executor. Não existe "resposta solta": toda execução (ou convergência
// já satisfeita, ou falha real) devolve este formato — a mesma espinha
// para qualquer operação futura (CandidatoAcao prepara o caminho).
//
// Operational Truth:
// - sucesso:true EXIGE evidência ("linha-confirmada" | "estado-ja-satisfeito");
// - "failed" é FALHA CONFIRMADA (o servidor respondeu com erro real);
// - "resultado não confirmado" NÃO é sintetizado aqui: surge no CLIENTE
//   quando nenhum Receipt chega (rede/reload). Nunca confundir com failed.
// - actor = id da própria sessão autenticada (dado seguro por definição).
//   Nenhum segredo, service key ou dado interno desnecessário entra aqui.

/** Resultado semântico da execução: */
// - "confirmed": mutação executada E confirmada por leitura (linha via
//   select pós-update — chamada ≠ sucesso; a linha é a prova);
// - "already_satisfied": estado atual JÁ era o desejado (convergência
//   idempotente — não é erro; nenhum write desnecessário foi feito);
// - "failed": falha confirmada com erro real da fonte.
export type ResultadoReceita = "confirmed" | "already_satisfied" | "failed";

export interface ReceiptAcao {
  /** Nome simbólico da operação (allowlist do contrato, ex.: "commercials:set-status"). */
  readonly operacao: string;
  /** Recurso alvo: tabela real + id. */
  readonly recurso: { readonly fonte: string; readonly id: string };
  /** Id da sessão autenticada que executou (dono do recurso). */
  readonly actorId: string;
  /** Estado lido ANTES da decisão (null quando indisponível — ex.: falha na leitura). */
  readonly estadoAnterior: string | null;
  readonly estadoDesejado: string;
  readonly resultado: ResultadoReceita;
  /** Estado confirmado por evidência (null quando não há prova — nunca preenchido por intenção). */
  readonly estadoConfirmado: string | null;
  /** Evidência que sustenta o resultado declarado (null em falha). */
  readonly evidencia: "linha-confirmada" | "estado-ja-satisfeito" | null;
  readonly sucesso: boolean;
  /** Erro REAL da fonte quando resultado="failed" (nunca mensagem inventada). */
  readonly erro: string | null;
  /** ISO-8601 do servidor no momento do Receipt. */
  readonly timestamp: string;
}

export function agoraIso(): string {
  return new Date().toISOString();
}

/** Única fábrica de Receipt — impossível montar "sucesso sem evidência"
 *  sem passar explicitamente os campos (a forma deixa a intenção visível
 *  em revisão de código). */
export function montarReceipt(
  entrada: Omit<ReceiptAcao, "timestamp">
): ReceiptAcao {
  return { ...entrada, timestamp: agoraIso() };
}
