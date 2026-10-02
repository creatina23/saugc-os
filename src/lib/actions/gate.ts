// TR-04.8D.3.4.1 — ACTION LAYER · POLICY GATE (camada comum mínima).
// ======================================================================
// Gate de SESSÃO compartilhado por todos os Executores server-side.
// Responsabilidades DESTA camada mínima:
//   A. sessão autenticada;
//   B. identidade real do usuário (via auth.getUser — nunca do payload).
// As demais verificações do Gate (payload, recurso, ownership, operação,
// estado de destino, pré-condição) são ESPECÍFICAS de cada operação e
// vivem no handler fino do Executor — sem abstração prematura.
//
// Regras inegociáveis:
// - sem sessão → 401 (sempre; o proxy de borda falha aberto, portanto
//   o gate DEVE existir in-handler, padrão /api/ia);
// - backend não configurado → 503 honesto (nunca fingir sessão);
// - decidirPorSessao é PURA (testável sem Supabase/rede).
//
// localStorage / workspace-context NUNCA são autorização.

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface SessaoConfirmada {
  readonly autorizada: true;
  readonly user: User;
}

export interface SessaoNegada {
  readonly autorizada: false;
  readonly httpStatus: number;
  readonly erro: string;
}

export interface SessaoAutorizada extends SessaoConfirmada {
  readonly supabase: SupabaseClient;
}

export type DecisaoSessao = SessaoAutorizada | SessaoNegada;

/** Núcleo PURO do gate: dado o usuário RESOLVIDO pelo servidor, decide.
 *  null → 401. Sem client aqui: verificarSessao é quem anexa o supabase. */
export function decidirPorSessao(user: User | null): SessaoConfirmada | SessaoNegada {
  if (!user) {
    return {
      autorizada: false,
      httpStatus: 401,
      erro: "Faça login para executar ações.",
    };
  }
  return { autorizada: true, user };
}

/** Gate real: resolve client server-side + sessão autenticada.
 *  - sem env Supabase → 503 honesto;
 *  - auth.getUser → null → 401;
 *  - exceção da chamada de auth → 503 honesto (nunca 200 duvidoso). */
export async function verificarSessao(): Promise<DecisaoSessao> {
  const supabase = await getSupabaseServer();
  if (!supabase) {
    return {
      autorizada: false,
      httpStatus: 503,
      erro: "Backend não configurado neste ambiente; nenhuma ação pode ser executada.",
    };
  }
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const decisao = decidirPorSessao(user);
    if (!decisao.autorizada) {
      return decisao;
    }
    return { autorizada: true, supabase, user: decisao.user };
  } catch (erro) {
    return {
      autorizada: false,
      httpStatus: 503,
      erro:
        "Não foi possível confirmar a sessão agora (" +
        (erro instanceof Error ? erro.message : "erro desconhecido") +
        "). Incerteza não autoriza.",
    };
  }
}
