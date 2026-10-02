// TR-04.8D.3.4.5 — ADAPTADOR UI → ACTION LAYER (camada única de tradução).
// ======================================================================
// ÚNICO ponto onde uma CandidatoAcao internal-execution vira chamada HTTP.
// A UI (CommandCenter) NUNCA monta URL/corpo sozinha e NUNCA toca o
// Supabase diretamente: ela entrega a candidata + a entidade da prioridade
// e recebe de volta o Receipt da Action Layer (ou um erro honesto).
//
// O contrato (priority-types.ts) diz que `operacao` é um NOME simbólico
// declarativo: "quem interpreta o identificador é a camada de execução".
// Este arquivo É essa interpretação — tabela de mapeamento explícita e
// revisável, sem parsing de strings, sem inferência a partir de label.
//
// Operational Truth:
// - Ausência de resposta ≠ falha confirmada: erro de rede/JSON devolve
//   httpStatus -1 com instrução de verificação (NUNCA fingir sucesso e
//   NUNCA chamar de "falhou" o que pode ter executado).
// - Cadeia de sucesso: sucesso só existe quando há Receipt — o componente
//   decide a apresentação a partir dele (confirmed/already_satisfied/failed).

import type { CandidatoAcao, ReferenciaEntidade } from "@/lib/priority-types";
import type { ReceiptAcao } from "@/lib/actions/receipt";

/** Resultado honesto da tentativa de execução via Action Layer. */
export type RespostaCandidata =
  | { readonly tipo: "receipt"; readonly receipt: ReceiptAcao }
  | {
      readonly tipo: "erro";
      /** -1 = resposta não chegou/não interpretável (resultado NÃO confirmado). */
      readonly httpStatus: number;
      readonly erro: string;
    };

type OperacaoSuportada = (entidadeId: string) => {
  readonly url: string;
  readonly corpo: Record<string, string>;
};

/** Tabela host única: nome simbólico (contrato) → chamada concreta na
 *  Action Layer já confirmada em produção (8D.3.4.1). Adicionar operação
 *  = adicionar UMA linha aqui + o Executor correspondente no servidor. */
const OPERACOES_SUPORTADAS: Record<string, OperacaoSuportada> = {
  "commercials:marcar-em-revisao": (entidadeId) => ({
    url: "/api/actions/commercials/set-status",
    corpo: { commercialId: entidadeId, status: "Revisão" },
  }),
};

/** Traduz e executa a candidata contra a Action Layer. Valida a
 *  elegibilidade estrutural ANTES da rede (categoria, operação conhecida,
 *  entidade-alvo presente) — tentativa inválida nunca vira POST. */
export async function executarCandidata(
  acao: CandidatoAcao,
  entidade: ReferenciaEntidade | null
): Promise<RespostaCandidata> {
  if (acao.categoria === "navigation") {
    return {
      tipo: "erro",
      httpStatus: 0,
      erro: "Ação de navegação não é executável.",
    };
  }
  if (entidade === null) {
    return {
      tipo: "erro",
      httpStatus: 0,
      erro: "Ação sem entidade alvo — nada foi enviado.",
    };
  }
  const interpretacao = OPERACOES_SUPORTADAS[acao.operacao ?? ""];
  if (interpretacao === undefined) {
    return {
      tipo: "erro",
      httpStatus: 0,
      erro: `Operação "${acao.operacao ?? "(ausente)"}" não é suportada por esta interface. Nada foi enviado.`,
    };
  }

  const { url, corpo } = interpretacao(entidade.id);
  try {
    const resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
    let dados: unknown = null;
    try {
      dados = await resposta.json();
    } catch {
      // JSON ilegível = resultado NÃO confirmado (não é falha confirmada).
      return {
        tipo: "erro",
        httpStatus: -1,
        erro: "A resposta da Action Layer não pôde ser lida. Verifique o estado do registro antes de tentar de novo.",
      };
    }
    // Receipt = prova (sucesso ou falha confirmada, conforme `resultado`).
    if (
      typeof dados === "object" &&
      dados !== null &&
      "resultado" in dados
    ) {
      return { tipo: "receipt", receipt: dados as ReceiptAcao };
    }
    // Recusa do Gate (401/400/404/503): nada executou.
    const erro =
      typeof dados === "object" && dados !== null && "erro" in dados
        ? String((dados as { erro: unknown }).erro)
        : `HTTP ${resposta.status}`;
    return { tipo: "erro", httpStatus: resposta.status, erro };
  } catch (excecao) {
    return {
      tipo: "erro",
      httpStatus: -1,
      erro:
        "A resposta não chegou (" +
        (excecao instanceof Error ? excecao.message : "falha de rede") +
        "). Verifique o estado do registro antes de tentar de novo.",
    };
  }
}
