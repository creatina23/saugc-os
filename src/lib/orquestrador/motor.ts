// src/lib/orquestrador/motor.ts — CP-01 · ARQ-3 + Observabilidade mínima
// ======================================================================
// Callback REAL de geração do Orquestrador: compõe com FND-03 (Constituição
// + CONTRATO_AGENTE persona + repertório opcional + dados da cadeia) e
// desfila os provedores. Não inventa autodescoberta (fora do escopo da
// unidade; modelos homologados em runtime do provider, não aqui).
//
// ARQ-3 — DECISÃO DE EVIDÊNCIA SOBRE O REPERTÓRIO:
//   O comentário histórico em base-excelencia.ts dizia "injetada em TODAS
//   as gerações na rota /api/ia e /api/orquestrador", mas a V0 do
//   orquestrador NUNCA injetava. Decisão arquitetural desta unidade:
//   injetar como SELEÇÃO EXPLÍCITA de cada chamada real (camada 6 do
//   compositor, id rastreável), porque as personas legadas são uma linha
//   cada e as LEIS DA CASA/métodos vivem no repertório. Se a devolução do
//   Agente 2 trouxer personas já saturadas, o ponto de corte é ESTA
//   constante — declaração de intenção no código, não efeito surpresa.
//
// Logs estruturados (ARQ-7/Observabilidade): sem segredos, sem conteúdo
// de prompt, somente metadados: etapa, agentId, agentVersion, motor,
// sucesso, duração em ms, quantidade de blocos de dados.
// ======================================================================

// Alterar para false quando a devolução do Agente 2 declarar repertório
// próprio por agente (cut point administrável, não comentário solto).
import type { GeradorIA, BlocoDado } from "./pipeline";

export const INJETAR_BASE_EXCELENCIA_NA_PIPELINE = true;

const GEMINI_MODELO = "gemini-2.0-flash";
const GROQ_MODELO = "llama-3.3-70b-versatile";
const OPENROUTER_MODELO = "google/gemini-2.0-flash-exp:free";
const TEMPERATURA = 0.8;
const MAX_TOKENS = 3000;

type TextoPlano = { texto: string; motor: string } | { texto: null; motor: null };

async function tentarGemini(chave: string, prompt: string): Promise<TextoPlano> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODELO}:generateContent?key=${chave}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: TEMPERATURA, maxOutputTokens: MAX_TOKENS },
        }),
        signal: AbortSignal.timeout(45000),
      }
    );
    if (res.ok) {
      const data = (await res.json().catch(() => null)) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      } | null;
      const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (texto) return { texto: texto.trim(), motor: `Gemini · ${GEMINI_MODELO}` };
    }
  } catch {
    // silêncio honesto — tenta o próximo
  }
  return { texto: null, motor: null };
}

async function tentarCompativel(
  chave: string,
  url: string,
  modelo: string,
  prompt: string,
  rotulo: string
): Promise<TextoPlano> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${chave}`,
      },
      body: JSON.stringify({
        model: modelo,
        messages: [{ role: "user", content: prompt }],
        temperature: TEMPERATURA,
        max_tokens: MAX_TOKENS,
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (res.ok) {
      const data = (await res.json().catch(() => null)) as {
        choices?: { message?: { content?: string } }[];
      } | null;
      const texto = data?.choices?.[0]?.message?.content;
      if (texto) return { texto: texto.trim(), motor: `${rotulo} · ${modelo}` };
    }
  } catch {
    // tenta o próximo
  }
  return { texto: null, motor: null };
}

/**
 * Cria o callback `gerar` injetado na pipeline. `montar` é o compositor
 * (passado por parâmetro para ficar mediamento lib⊥implementação); a
 * variedade só existe no servidor real.
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

    const chaveGemini = process.env.GEMINI_API_KEY;
    const chaveGroq = process.env.GROQ_API_KEY;
    const chaveOpenRouter = process.env.OPENROUTER_API_KEY;

    let resultado: TextoPlano = { texto: null, motor: null };
    if (chaveGemini) {
      resultado = await tentarGemini(chaveGemini, promptCompleto);
    }
    if (resultado.texto === null && chaveGroq) {
      resultado = await tentarCompativel(
        chaveGroq,
        "https://api.groq.com/openai/v1/chat/completions",
        GROQ_MODELO,
        promptCompleto,
        "Groq"
      );
    }
    if (resultado.texto === null && chaveOpenRouter) {
      resultado = await tentarCompativel(
        chaveOpenRouter,
        "https://openrouter.ai/api/v1/chat/completions",
        OPENROUTER_MODELO,
        promptCompleto,
        "OpenRouter"
      );
    }

    // Log estrututal — SEM segredos, SEM prompt
    const duracaoMs = Date.now() - inicio;
    const blocosDados = entrada.dados.length;
    console.log(
      "[orquestrador]",
      JSON.stringify({
        etapa: entrada.agentContract.id,
        agentVersion: entrada.agentContract.versao,
        motor: resultado.motor,
        ok: resultado.texto !== null,
        blocosDados,
        duracaoMs,
      })
    );

    return { texto: resultado.texto, motor: resultado.motor };
  };
}
