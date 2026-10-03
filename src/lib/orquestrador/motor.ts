// src/lib/orquestrador/motor.ts — CP-01 FIX P1 · CONSUMIDOR DA CASCATA CANÔNICA
// ======================================================================
// Callback REAL de geração do Orquestrador: compõe com FND-03 (Constituição
// + CONTRATO_AGENTE persona + repertório opcional + dados da cadeia) e
// delega o TRANSPORTE à cascata canônica (src/lib/ia/cadeia-texto.ts) —
// A MESMA de /api/ia: Gemini (autodescoberta) → Groq (auto) → OpenRouter
// (:free auto) → Cerebras (auto), com hall dos reprovados e skip gracioso.
//
// ELIMINADO neste FIX (causa do incidente P1 2026-10-02): a cascata
// duplicada e degradada que existia aqui — 3 slugs cravados
// (gemini-2.0-flash · llama-3.3-70b-versatile · gemini-2.0-flash-exp:free),
// sem auto-descoberta, sem Cerebras, sem hall, com catch{} mudo que
// engolia status HTTP por provider. UMA capacidade, UMA implementação.
//
// ARQ-3 — DECISÃO DE EVIDÊNCIA SOBRE O REPERTÓRIO (mantida):
//   injetar BASE_EXCELENCIA como SELEÇÃO EXPLÍCITA de cada chamada real
//   (camada 6 do compositor, id rastreável). Ponto de corte = constante
//   abaixo — declaração de intenção no código, não efeito surpresa.
//
// ORÇAMENTO TEMPORAL (P1 §9 — decisão documentada):
//   • PRAZO_POR_ETAPA = 40s: uma etapa (especialista) pode desfilar a
//     cascata inteira, mas nunca mais que 40s no total.
//   • PRAZO_GLOBAL = 240s: deadline compartilhado por execução do
//     Orquestrador (criado em criarGeradorReal, que roda 1× por request).
//     6 especialistas × sucesso típico (3–8s) ≪ 240s; cascata lenta em
//     uma etapa não pode derrubar as seguintes. Rota exporta
//     maxDuration = 300 (teto serverless; acima do pior caso com folga).
//   • A cascata herda o teto restante por fetch (min(45s, restante)) —
//     resiliência integral preservada, sem cascata teoricamente ilimitada.
//
// Logs estruturados (ARQ-7/Observabilidade P1): sem segredos, sem prompt,
// somente metadados: etapa, agentId, agentVersion, motor vencedor, ok,
// duração, blocos de dados e a FILA de tentativas por provider
// (provider→categoria) — o buraco de observabilidade do incidente está
// fechado server-side.
// ======================================================================

import type { GeradorIA, BlocoDado, DiagnosticoEtapa } from "./pipeline";
import { gerarTextoCascata } from "../ia/cadeia-texto";
import type { TentativaCascata } from "../ia/cadeia-texto";

export const INJETAR_BASE_EXCELENCIA_NA_PIPELINE = true;

const PRAZO_POR_ETAPA_MS = 40_000;
const PRAZO_GLOBAL_MS = 240_000;

/** Resumo sanitizado da fila: "Gemini→HTTP_404_MODEL | Groq→SUCCESS" */
function resumoTentativas(
  tentativas: readonly {
    provider: string;
    categoria: string;
    duracaoMs: number;
  }[]
): string {
  return tentativas
    .map((t) => `${t.provider}→${t.categoria}`)
    .join(" | ");
}

/** CP-01 FIX P2 Fase 1 — PROJEÇÃO WHITELIST: reduz a tentativa interna
 *  ao DTO sanitizado autorizado a chegar ao frontend. Campos são labels
 *  e números produzidos pelo nosso código — provider/modelo de input,
 *  chaves, headers e respostas brutas NÃO existem aqui por construção. */
function dtoTentativa(t: TentativaCascata) {
  return {
    provider: t.provider,
    redeHouve: t.redeHouve,
    duracaoMs: t.duracaoMs,
    categoria: t.categoria,
    status: t.status,
  } as const;
}

/**
 * Cria o callback `gerar` injetado na pipeline. `montar` é o compositor
 * (passado por parâmetro para ficar mediamente lib⊥implementação); a
 * variedade só existe no servidor real. O deadline global nasce aqui e
 * é compartilhado por todas as etapas desta execução.
 */
export function criarGeradorReal(deps: {
  montar: (input: {
    userCommand: string;
    agentContract: { id: string; versao: string; conteudo: string };
    selectedRepertoire?: { ids: readonly string[]; conteudo: string };
    dados?: readonly BlocoDado[];
  }) => string;
  repertorio: { ids: readonly string[]; conteudo: string } | null;
}): GeradorIA {
  const { montar, repertorio } = deps;
  const alvoGlobal = Date.now() + PRAZO_GLOBAL_MS;

  return async (entrada) => {
    const inicio = Date.now();
    const promptCompleto = montar({
      userCommand: entrada.userCommand,
      agentContract: entrada.agentContract,
      selectedRepertoire:
        INJETAR_BASE_EXCELENCIA_NA_PIPELINE && repertorio
          ? repertorio
          : undefined,
      dados: entrada.dados,
    });

    const restanteGlobal = Math.max(0, alvoGlobal - inicio);
    if (restanteGlobal < 5000) {
      // Deadline global estourado antes de arrancar: fail-closed honesto.
      const duracaoExcedida = Date.now() - inicio;
      console.log(
        "[orquestrador]",
        JSON.stringify({
          etapa: entrada.agentContract.id,
          agentVersion: entrada.agentContract.versao,
          motor: null,
          ok: false,
          fila: "GLOBAL_DEADLINE_EXCEEDED",
          blocosDados: entrada.dados.length,
          duracaoMs: duracaoExcedida,
        })
      );
      return {
        texto: null,
        motor: null,
        diagnostico: {
          duracaoMs: duracaoExcedida,
          categoriaFinal: "TIMEOUT",
          tentativas: [],
          fila: "GLOBAL_DEADLINE_EXCEEDED",
        } satisfies DiagnosticoEtapa,
      };
    }

    const resultado = await gerarTextoCascata(promptCompleto, {
      temperatura: 0.8,
      maxTokens: 3000,
      prazoMs: Math.min(PRAZO_POR_ETAPA_MS, restanteGlobal),
    });

    // Log estrutural — SEM segredos, SEM prompt, COM a fila por provider
    const duracaoMs = Date.now() - inicio;
    console.log(
      "[orquestrador]",
      JSON.stringify({
        etapa: entrada.agentContract.id,
        agentVersion: entrada.agentContract.versao,
        motor: resultado.ok ? resultado.motor : null,
        ok: resultado.ok,
        fila: resumoTentativas(resultado.tentativas),
        categoriaFinal: resultado.ok ? "SUCCESS" : resultado.categoriaFinal,
        blocosDados: entrada.dados.length,
        duracaoMs,
      })
    );

    // P2 Fase 1: DTO sanitizado (whitelist) — atravessa pipeline→rota→view.
    const diagnostico: DiagnosticoEtapa =
      resultado.ok === true
        ? {
            duracaoMs: resultado.duracaoMs,
            categoriaFinal: "SUCCESS",
            tentativas: resultado.tentativas.map(dtoTentativa),
            fila: resumoTentativas(resultado.tentativas),
          }
        : {
            duracaoMs: resultado.duracaoMs,
            categoriaFinal: resultado.categoriaFinal,
            tentativas: resultado.tentativas.map(dtoTentativa),
            fila: resumoTentativas(resultado.tentativas),
          };

    if (resultado.ok) {
      return { texto: resultado.texto, motor: resultado.motor, diagnostico };
    }
    // Fail-closed honesto: a pipeline transforma texto:null na mensagem
    // C-17 ("Sem resposta do motor") — nada de conteúdo simulado.
    return { texto: null, motor: null, diagnostico };
  };
}
