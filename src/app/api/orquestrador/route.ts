// /api/orquestrador/route.ts — CP-01 · ARQ-1 (auth) + ARQ-2 (pipeline real)
// ======================================================================
// Rota FINA. V0 (CP-00): pipeline inline, sem autenticação, personas
// recebiam só o briefing. V1 desta unidade:
//   ARQ-1 → Gate server-side obrigatório (verificarSessao — MESMO
//   padrão auditado em /api/actions/*: sem sessão = 401; backend sem
//   config = 503 honesto; falha aberta não finge).
//   ARQ-2 → delega a execução da cadeia a src/lib/orquestrador/pipeline.ts
//   (puro, encadeado com proveniência via camada 7 do compositor).
//   ARQ-3 → base de excelência entra como seleção EXPLÍCITA (motor.ts).
//
// Contrato HTTP preservado:
//   { acao: "executar-020b", briefing } → { ok, etapas, erro? }
//   { acao: "salvar-operacao", dados }  → { ok } (com Gate agora)
// Aditivo (v1):
//   { acao: "orquestrar-objetivo", objetivo } → { ok, etapas, erro? }
//
// Nenhuma execução externa além das chamadas de LLM dos motores.
// Nenhuma mutação na Action Layer (FROZEN) desta missão.

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { verificarSessao } from "@/lib/actions/gate";
import {
  montarPromptParticionado,
  type PromptParticionado,
} from "@/lib/constituicao/composicao";
import { selecionarRepertorioPersona } from "@/lib/base-excelencia";
import { PREAMBULO_CADEIA } from "@/lib/agentes/pipeline";
import {
  executarPipeline,
  type BriefingOrquestrador,
  type BlocoDado,
} from "@/lib/orquestrador/pipeline";
import { criarGeradorReal } from "@/lib/orquestrador/motor";

/** CP-01 FIX P1 §9 — teto serverless desta rota: 300s.
 *  Orçamento real: deadline global do gerador = 240s compartilhado por
 *  todas as etapas + PRAZO_POR_ETAPA = 40s por especialista; a cascata
 *  herda min(45s, restante) por fetch. 300 dá folga ao pior caso sem
 *  permitir cascata teoricamente ilimitada. */
export const maxDuration = 300;

/** P4.1.2: composição PARTICIONADA (system × user). SYSTEM = Constituição
 *  + autorização + instrução de cadeia (PREAMBULO_CADEIA) + contrato do
 *  agente; USER = briefing do usuário + repertório seletivo da função +
 *  dados/envelope (camada 7). BlocoDado do pipeline → BlocoDados do
 *  compositor (formato contraditório mínimo; pipeline.dados são sempre
 *  tipo toolOutput nesta unidade). */
function montarComposicao(entrada: {
  userCommand: string;
  agentContract: { id: string; versao: string; conteudo: string };
  selectedRepertoire?: { ids: readonly string[]; conteudo: string };
  dados?: readonly BlocoDado[];
  instrucaoCadeia?: string;
}): PromptParticionado {
  const { prompt } = montarPromptParticionado({
    userCommand: entrada.userCommand,
    agentContract: entrada.agentContract,
    selectedRepertoire: entrada.selectedRepertoire,
    instrucaoCadeia: entrada.instrucaoCadeia,
    dados: (entrada.dados ?? []).map((dado) => {
      switch (dado.tipo) {
        case "userSuppliedData":
          return { tipo: "userSuppliedData" as const, conteudo: dado.conteudo };
        case "externalData":
          return {
            tipo: "externalData" as const,
            fonte: dado.fonteOuFerramenta ?? "desconhecida",
            conteudo: dado.conteudo,
          };
        case "toolOutput":
          return {
            tipo: "toolOutput" as const,
            ferramenta: dado.fonteOuFerramenta ?? "desconhecida",
            conteudo: dado.conteudo,
          };
      }
    }),
  });
  return prompt;
}

// P4.1.2: o Envelope Epistêmico (ENVELOPE EPISTÊMICO (P4)) é gerado UMA
// vez por execução em executarPipeline (pipeline.ts) e transportado aqui
// como camada 7 — nunca reconstruído/girado nesta rota (justificativa do
// singleton: pipeline mantém 1 instância local; o compositor apenas o
// encapsula em BLOCO no user).

async function negarSeSemSessao() {
  const sessao = await verificarSessao();
  if (!sessao.autorizada) {
    return NextResponse.json({ erro: sessao.erro }, { status: sessao.httpStatus });
  }
  return null;
}

export async function POST(req: Request) {
  const negacao = await negarSeSemSessao();
  if (negacao) return negacao;

  const body = await req.json().catch(() => null);
  if (body === null) {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }
  const { acao, briefing, dados, objetivo } = body as {
    acao?: string;
    briefing?: BriefingOrquestrador;
    dados?: { titulo?: string; cliente?: string; script?: string; promptVisual?: string };
    objetivo?: string;
  };

  // ---- ação: salvar na operação (contrato preservado, agora com Gate) ----
  if (acao === "salvar-operacao" && dados) {
    const supabase = await getSupabaseServer();
    if (supabase) {
      const { error } = await supabase.from("briefings").insert([
        {
          title: dados.titulo,
          client: dados.cliente,
          status: "Em Aprovação",
          deadline: new Date(Date.now() + 7 * 86400000).toLocaleDateString("pt-BR"),
          tags: ["Orquestrador", "UGC", "IA"],
        },
      ]);
      if (error) {
        return NextResponse.json({ ok: false, erro: error.message }, { status: 400 });
      }
    }
    return NextResponse.json({ ok: true });
  }

  // ---- ação: pipeline encadeada REAL ----
  if (acao !== "executar-020b" && acao !== "orquestrar-objetivo") {
    return NextResponse.json({ erro: "Parâmetros inválidos." }, { status: 400 });
  }

  const briefingFinal: BriefingOrquestrador =
    acao === "orquestrar-objetivo"
      ? { objetivoLivre: typeof objetivo === "string" ? objetivo : "" }
      : (briefing ?? {});

  if (
    (acao === "executar-020b" && briefing === undefined) ||
    (acao === "orquestrar-objetivo" &&
      typeof objetivo !== "string" &&
      typeof briefingFinal.objetivo !== "string")
  ) {
    return NextResponse.json({ erro: "Parâmetros inválidos." }, { status: 400 });
  }

  const gerador = criarGeradorReal({
    montar: montarComposicao,
    // P4.1.2: repertório SELETIVO por função (seções reais da base;
    // persona sem utilidade declarada → zero repertório, nunca inventado)
    selecionarRepertorio: selecionarRepertorioPersona,
    // P4.1.2: o contexto de cadeia viaja no SYSTEM — fora dos contratos
    instrucaoCadeia: PREAMBULO_CADEIA,
  });

  const resultado = await executarPipeline(briefingFinal, gerador);
  return NextResponse.json(resultado);
}
