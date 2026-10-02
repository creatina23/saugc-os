// TR-04.8D.3.4.1 — EXECUTOR PILOTO: commercials:set-status (server-side).
// ======================================================================
// Menor piloto da Action Layer: alteração controlada de `status` de UM
// registro de `commercials` do PRÓPRIO usuário autenticado.
//
// Por que esta operação (Boundary Design 8D.3.4.0B §L):
//   interna · reversível (status volta) · sem integração externa · sem
//   gasto · estado desejado consultável · naturalmente idempotente
//   (SET converge: repetir não duplica efeito).
//
// IDEMPOTÊNCIA: este piloto prova idempotência POR ESTADO CONVERGENTE.
// Isso NÃO autoriza futuras ações não-convergentes (criar registro,
// enviar mensagem, cobrança…) a usar a mesma estratégia.
//
// Sem consumidor de UI nesta unidade (decisão congelada): a rota existe
// para provar Gate → Executor → Receipt; a ligação ao Command Center é
// HUMAN GATE futuro.
//
// Fluxo (§5 da spec):
//   REQUEST → AUTH → VALIDATION → OWNERSHIP → POLICY GATE
//   → READ CURRENT STATE → DECISION → EXECUTION IF NECESSARY
//   → READ/RETURN CONFIRMED STATE → RECEIPT
//
// Nunca declarar sucesso sem linha confirmada (update → select → single).

import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { verificarSessao } from "@/lib/actions/gate";
import { montarReceipt, type ReceiptAcao } from "@/lib/actions/receipt";
import type { CommercialStatus } from "@/types";

// ---------------------------------------------------------------------------
// CONTRATO DA OPERAÇÃO (server-side — allowlist estrita de status).
// Fonte do enum: src/types/index.ts (CommercialStatus). A Action Layer
// restringe-se a este conjunto; qualquer status fora dele = rejeição.
// ---------------------------------------------------------------------------
export const OPERACAO = "commercials:set-status" as const;

const STATUS_PERMITIDOS: readonly CommercialStatus[] = [
  "Rascunho",
  "Produção",
  "Revisão",
  "Aprovado",
];

/** Forma mínima do client que o executor precisa (facilita teste com
 *  double — produção usa o Supabase real do gate). */
export type ClienteAcao = Pick<SupabaseClient, "from">;

/** Resposta do executor em nível de domínio (a rota converte em HTTP).
 *  Toda EXECUÇÃO (ou tentativa com falha confirmada) devolve Receipt;
 *  recusas do Gate (payload/recurso) devolvem erro simples, padrão /api/ia. */
export type RespostaAcao =
  | { readonly httpStatus: 200 | 500; readonly receipt: ReceiptAcao }
  | { readonly httpStatus: 400 | 404; readonly erro: string };

// ---------------------------------------------------------------------------
// EXECUTOR (puro de transporte: recebe client + actor + corpo CRU)
// ---------------------------------------------------------------------------
export async function executarSetStatus(
  supabase: ClienteAcao,
  actorId: string,
  corpo: unknown
): Promise<RespostaAcao> {
  // ---- VALIDATION: payload estrito (schema da operação) ----
  if (typeof corpo !== "object" || corpo === null) {
    return { httpStatus: 400, erro: "Payload inválido: objeto esperado." };
  }
  const { commercialId, status } = corpo as Record<string, unknown>;
  if (typeof commercialId !== "string" || commercialId.trim() === "") {
    return { httpStatus: 400, erro: "Payload inválido: commercialId ausente." };
  }
  if (
    typeof status !== "string" ||
    !STATUS_PERMITIDOS.includes(status as CommercialStatus)
  ) {
    return {
      httpStatus: 400,
      erro: `Payload inválido: status deve ser um de ${STATUS_PERMITIDOS.join(", ")}.`,
    };
  }
  const id = commercialId.trim();
  const desejado = status as CommercialStatus;

  // ---- READ CURRENT STATE + OWNERSHIP (um select na fronteira) ----
  // 404 genérico para inexistente E para recurso de outro usuário:
  // nunca vazar se o recurso existe fora do ownership.
  const { data: atual, error: erroLeitura } = await supabase
    .from("commercials")
    .select("id, status, user_id")
    .eq("id", id)
    .single();

  if (erroLeitura && erroLeitura.code !== "PGRST116") {
    // Falha CONFIRMADA já na leitura (o banco respondeu com erro real).
    // Receipt honesto com resultado failed — nunca sucesso.
    return {
      httpStatus: 500,
      receipt: montarReceipt({
        operacao: OPERACAO,
        recurso: { fonte: "commercials", id },
        actorId,
        estadoAnterior: null,
        estadoDesejado: desejado,
        resultado: "failed",
        estadoConfirmado: null,
        evidencia: null,
        sucesso: false,
        erro: erroLeitura.message,
      }),
    };
  }
  const naoEncontrado: RespostaAcao = {
    httpStatus: 404,
    erro: "Recurso não encontrado para esta sessão.",
  };
  // PGRST116 = "0 linhas" do PostgREST (não é erro de infraestrutura).
  if (!atual) {
    return naoEncontrado;
  }
  // ---- POLICY GATE (ownership): o recurso PRECISA ser do actor ----
  const linha = atual as { id: string; status: string; user_id: string | null };
  if (linha.user_id !== actorId) {
    return naoEncontrado;
  }

  const baseReceipt = {
    operacao: OPERACAO,
    recurso: { fonte: "commercials", id },
    actorId,
    estadoDesejado: desejado,
  } as const;

  // ---- DECISION: idempotência por estado convergente ----
  if (linha.status === desejado) {
    // Nenhum write desnecessário. O objetivo operacional JÁ está
    // satisfeito — isso NÃO é erro.
    return {
      httpStatus: 200,
      receipt: montarReceipt({
        ...baseReceipt,
        estadoAnterior: linha.status,
        resultado: "already_satisfied",
        estadoConfirmado: linha.status,
        evidencia: "estado-ja-satisfeito",
        sucesso: true,
        erro: null,
      }),
    };
  }

  // ---- EXECUTION + READ/RETURN CONFIRMED STATE (update → select → single) ----
  const { data: confirmada, error: erroUpdate } = await supabase
    .from("commercials")
    .update({ status: desejado })
    .eq("id", id)
    .select("id, status")
    .single();

  if (erroUpdate || !confirmada) {
    // Falha CONFIRMADA: o banco respondeu com erro ou não devolveu linha.
    // Nunca sucesso falso; motivo real no Receipt.
    return {
      httpStatus: 500,
      receipt: montarReceipt({
        ...baseReceipt,
        estadoAnterior: linha.status,
        resultado: "failed",
        estadoConfirmado: null,
        evidencia: null,
        sucesso: false,
        erro: erroUpdate?.message ?? "o banco não devolveu a linha atualizada",
      }),
    };
  }

  const linhaConfirmada = confirmada as { id: string; status: string };
  // ---- RECEIPT (a única fonte de verdade sobre o que aconteceu) ----
  // Se por qualquer divergência a linha confirmada não refletir o desejado,
  // o Receipt declara o que a EVIDÊNCIA mostra — nunca a intenção.
  const confirmou = linhaConfirmada.status === desejado;
  return {
    httpStatus: confirmou ? 200 : 500,
    receipt: montarReceipt({
      ...baseReceipt,
      estadoAnterior: linha.status,
      resultado: confirmou ? "confirmed" : "failed",
      estadoConfirmado: linhaConfirmada.status,
      evidencia: confirmou ? "linha-confirmada" : null,
      sucesso: confirmou,
      erro: confirmou
        ? null
        : `Estado confirmado diverge do desejado (banco devolveu "${linhaConfirmada.status}").`,
    }),
  };
}

// ---------------------------------------------------------------------------
// ADAPTADOR HTTP (fino): GATE de sessão → executor → NextResponse
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  const sessao = await verificarSessao();
  if (!sessao.autorizada) {
    return NextResponse.json({ erro: sessao.erro }, { status: sessao.httpStatus });
  }

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Payload inválido: JSON esperado." }, { status: 400 });
  }

  const resposta = await executarSetStatus(sessao.supabase, sessao.user.id, corpo);
  if ("receipt" in resposta) {
    return NextResponse.json(resposta.receipt, { status: resposta.httpStatus });
  }
  return NextResponse.json({ erro: resposta.erro }, { status: resposta.httpStatus });
}
