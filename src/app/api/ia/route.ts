import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { BASE_EXCELENCIA } from "@/lib/base-excelencia";

// MESA DE MOTORES — a IA da AnuncIA nunca morre.
// ------------------------------------------------------------------
// Route Handler (roda SÓ no servidor). Chaves JAMAIS vão pro navegador.
//
// CADEIA (texto), na ordem — um falha, o próximo assume:
//   1) Gemini (titular) — AUTODESCOBERTA + hall dos reprovados.
//   2) Groq — AUTO-DESCOBERTA (slug cravado morreu: 404 real em 23 ago).
//   3) OpenRouter — modelos :free com AUTO-DESCOBERTA (slugs morrem
//      sem aviso; 2 funerais reais caçados em 23 ago).
//   4) Cerebras (opcional) — ultra-rápido, cota grátis (CEREBRAS_API_KEY).
//   ⚰️ GitHub Models: FALECIDO em 30 jul 2026 (aposentado pra TODOS —
//      anúncio oficial de 1º jul). Removido da Mesa com honras: serviu
//      desde a Sprint 017. NENHUM modelo é cravado nesta rota: cada
//      camada pergunta à própria API quem tá vivo HOJE (lição 9).
//
// • SKIP GRACIOSO: camada sem chave é pulada em silêncio (só log).
// • GET /api/ia = espelho da mesa: quais motores têm chave (booleanos,
//   zero segredo) — alimenta os cartões do IA Studio.
// • Resposta de sucesso carrega "motor": quem de fato respondeu.
// • Só atende usuário logado: protege as cotas gratuitas de estranhos.
// • Logs [motor-ia] aparecem só no TERMINAL do servidor.
// • (v5/v6) VERDADE NA TELA: todo erro final carrega o resumo da fila
//   inteira ("Gemini→429 | Groq→404 | …") — erro mudo é coisa do passado.

const MODELO_RESERVA = "gemini-2.0-flash";
const MAX_TENTATIVAS = 4;

// Especialidades que não servem pro nosso uso (não são texto puro)
const MODELOS_BLOQUEADOS = [
  "image",
  "imagen",
  "tts",
  "embedding",
  "computer-use",
  "aqa",
];

// Memória deste boot do servidor (camada Gemini)
let modeloAprovado: string | null = null; // já respondeu 200 → fica fixado
const modelosReprovados = new Set<string>(); // recusados (404) pelo Google

// O motivo REAL do último erro — sanitizado, sem segredo.
let ultimoDetalheMotorIA: string | null = null;

function anotarDetalheIA(texto: unknown) {
  const bruto = typeof texto === "string" ? texto : JSON.stringify(texto) ?? "";
  ultimoDetalheMotorIA = bruto.replace(/\s+/g, " ").trim().slice(0, 180) || null;
}

// ---------- Tipos e helpers ----------

type Tentativa =
  | { ok: true; texto: string; motor: string }
  | { ok: false; status: number | null };

type PedidoIA = {
  acao?: string;
  prompt?: string;
  temperatura?: number;
  maxTokens?: number;
};

type ParteGemini = { text?: string };
type RespostaGemini = {
  candidates?: { content?: { parts?: ParteGemini[] } }[];
};

type ModeloGemini = {
  name?: string;
  supportedGenerationMethods?: string[];
};

type RespostaOpenAI = { choices?: { message?: { content?: string } }[] };

// Extrai a versão numérica do nome ("gemini-2.5-flash" → 250)
function versaoDoModelo(nome: string): number {
  const alvo = /gemini-(\d+)(?:\.(\d+))?/i.exec(nome);
  if (!alvo) return 0;
  return Number(alvo[1]) * 100 + Number(alvo[2] ?? "0");
}

// Parâmetros da geração, com limites saudáveis (protege cota e bolso)
function pegarTemperatura(valor: unknown): number {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return 0.7;
  return Math.min(1, Math.max(0, numero));
}

function pegarMaxTokens(valor: unknown): number {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return 1024;
  return Math.min(4096, Math.max(256, Math.round(numero)));
}

function textoDaRespostaGemini(dados: unknown): string {
  const gemini = dados as RespostaGemini | null;
  const partes = gemini?.candidates?.[0]?.content?.parts ?? [];
  return partes
    .map((parte) => parte.text ?? "")
    .join("")
    .trim();
}

function textoDeRespostaOpenAI(dados: unknown): string {
  const r = dados as RespostaOpenAI | null;
  return (r?.choices?.[0]?.message?.content ?? "").trim();
}

function traduzErroIA(status: number): string {
  if (status === 429)
    return "Limite gratuito da IA atingido agora. Aguarde 1 minuto e tente de novo.";
  if (status === 401 || status === 403)
    return "Chave de IA inválida ou sem permissão. Confira o .env.local.";
  if (status === 400) return "O pedido foi recusado pela IA. Reformule o texto.";
  if (status >= 500) return "A IA está instável agora. Tente de novo em instantes.";
  return "Falha ao falar com a IA. Tente de novo.";
}

// ---------- Camada 1: Gemini (titular, autodescoberta) ----------

async function descobrirModelo(chave: string): Promise<string | null> {
  try {
    const resposta = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models",
      {
        headers: { "x-goog-api-key": chave },
        signal: AbortSignal.timeout(20000),
      }
    );

    if (!resposta.ok) {
      console.error(
        "[motor-ia] listagem de modelos falhou (status:",
        resposta.status,
        ")"
      );
      return null;
    }

    const dados = (await resposta.json().catch(() => null)) as {
      models?: ModeloGemini[];
    } | null;

    const geradoresTexto = (dados?.models ?? [])
      .filter((modelo) =>
        (modelo.supportedGenerationMethods ?? []).includes("generateContent")
      )
      .map((modelo) => (modelo.name ?? "").replace(/^models\//, ""))
      .filter(
        (nome) =>
          nome &&
          !MODELOS_BLOQUEADOS.some((bloqueio) =>
            nome.toLowerCase().includes(bloqueio)
          ) &&
          !modelosReprovados.has(nome)
      );

    const porVersao = (a: string, b: string) =>
      versaoDoModelo(b) - versaoDoModelo(a);
    const flashes = geradoresTexto
      .filter((nome) => nome.toLowerCase().includes("flash"))
      .sort(porVersao);
    const outros = geradoresTexto
      .filter((nome) => !nome.toLowerCase().includes("flash"))
      .sort(porVersao);

    const escolhido = flashes[0] ?? outros[0] ?? null;
    if (escolhido) {
      console.log(
        `[motor-ia] candidato escolhido: ${escolhido} (${geradoresTexto.length} disponíveis)`
      );
    }
    return escolhido;
  } catch {
    console.error("[motor-ia] erro ao listar modelos");
    return null;
  }
}

async function gerarViaGemini(
  chave: string,
  prompt: string,
  temperatura: number,
  maxTokens: number
): Promise<Tentativa> {
  let ultimoStatus: number | null = null;

  for (
    let tentativa = 1;
    tentativa <= MAX_TENTATIVAS;
    tentativa += 1
  ) {
    const modelo =
      modeloAprovado ?? (await descobrirModelo(chave)) ?? MODELO_RESERVA;

    if (modelosReprovados.has(modelo)) {
      console.log("[motor-ia] Gemini sem novos candidatos — passando pro reserva");
      break;
    }

    try {
      const resposta = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": chave,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: temperatura,
              maxOutputTokens: maxTokens,
            },
          }),
          signal: AbortSignal.timeout(45000),
        }
      );

      const dados: unknown = await resposta.json().catch(() => null);

      if (resposta.ok) {
        const gerado = textoDaRespostaGemini(dados);
        if (!gerado) {
          console.error(
            "[motor-ia] Gemini respondeu sem texto. detalhe:",
            JSON.stringify(dados)?.slice(0, 600)
          );
          anotarDetalheIA(dados);
          ultimoStatus = 502;
          break;
        }
        modeloAprovado = modelo;
        console.log(`[motor-ia] Gemini aprovado e fixado: ${modelo}`);
        return { ok: true, texto: gerado, motor: `Gemini · ${modelo}` };
      }

      ultimoStatus = resposta.status;
      anotarDetalheIA(dados);
      console.error(
        "[motor-ia] Gemini recusou. status:",
        resposta.status,
        "| detalhe:",
        JSON.stringify(dados)?.slice(0, 600)
      );

      if (resposta.status === 404) {
        modelosReprovados.add(modelo);
        if (modeloAprovado === modelo) modeloAprovado = null;
        console.log(
          `[motor-ia] "${modelo}" foi pro hall dos reprovados (${modelosReprovados.size}) — próximo candidato…`
        );
        continue;
      }
      break; // demais erros: desfila pra reserva
    } catch (excecao) {
      console.error("[motor-ia] Exceção ao chamar o Gemini:", excecao);
      ultimoStatus = null; // timeout/rede — tenta o próximo motor
      break;
    }
  }

  return { ok: false, status: ultimoStatus };
}

// ---------- Camadas compatíveis (Groq · Cerebras): auto-descoberta ----------
// Formato OpenAI, mas NENHUM modelo cravado: a rota lista os modelos da
// própria API, prefere as famílias de confiança e mantém hall dos mortos.

const cacheModelosCompativeis = new Map<string, string[]>(); // env → slugs vivos
const reprovadosCompativeis = new Set<string>(); // "ENV:slug"

async function descobrirModeloCompativel(
  env: string,
  urlLista: string,
  chave: string,
  preferencias: string[]
): Promise<string | null> {
  const emCache = cacheModelosCompativeis.get(env);
  if (emCache && emCache.length) return emCache[0];
  try {
    const resposta = await fetch(urlLista, {
      headers: { Authorization: `Bearer ${chave}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!resposta.ok) {
      console.log(`[motor-ia] listagem de modelos falhou (${env}):`, resposta.status);
      return null;
    }
    const dados = (await resposta.json().catch(() => null)) as {
      data?: { id?: string }[];
    } | null;
    const ids = (dados?.data ?? [])
      .map((modelo) => modelo.id ?? "")
      .filter((id) => id && !reprovadosCompativeis.has(`${env}:${id}`));
    if (!ids.length) return null;
    const ranque = (id: string) => {
      const indice = preferencias.findIndex((pref) =>
        id.toLowerCase().includes(pref)
      );
      return indice === -1 ? preferencias.length : indice;
    };
    ids.sort((a, b) => ranque(a) - ranque(b));
    cacheModelosCompativeis.set(env, ids);
    console.log(`[motor-ia] ${env} vivos: ${ids.slice(0, 3).join(", ")}`);
    return ids[0];
  } catch {
    return null;
  }
}

async function gerarViaCompativel(
  env: string,
  urlChat: string,
  urlLista: string,
  chave: string,
  prompt: string,
  temperatura: number,
  maxTokens: number,
  preferencias: string[],
  rotulo: string
): Promise<Tentativa> {
  for (let tentativa = 0; tentativa < 2; tentativa += 1) {
    const modelo = await descobrirModeloCompativel(env, urlLista, chave, preferencias);
    if (!modelo) return { ok: false, status: null };

    try {
      const resposta = await fetch(urlChat, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${chave}`,
        },
        body: JSON.stringify({
          model: modelo,
          messages: [{ role: "user", content: prompt }],
          temperature: temperatura,
          max_tokens: maxTokens,
        }),
        signal: AbortSignal.timeout(45000),
      });
      const dados: unknown = await resposta.json().catch(() => null);
      if (resposta.ok) {
        const texto = textoDeRespostaOpenAI(dados);
        if (texto) {
          console.log(`[motor-ia] ${rotulo} respondeu (${modelo})`);
          return { ok: true, texto, motor: `${rotulo} · ${modelo}` };
        }
        anotarDetalheIA(dados);
        return { ok: false, status: 502 };
      }
      anotarDetalheIA(dados);
      console.error(`[motor-ia] ${rotulo} (${modelo}) recusou:`, resposta.status);
      if (resposta.status === 404 || resposta.status === 410) {
        // slug morto: hall dos reprovados e tenta o próximo vivo
        reprovadosCompativeis.add(`${env}:${modelo}`);
        const cache = cacheModelosCompativeis.get(env) ?? [];
        cacheModelosCompativeis.set(env, cache.filter((m) => m !== modelo));
        continue;
      }
      return { ok: false, status: resposta.status };
    } catch (excecao) {
      console.error(`[motor-ia] Exceção no ${rotulo}:`, excecao);
      return { ok: false, status: null };
    }
  }
  return { ok: false, status: 404 };
}

// ---------- OpenRouter: auto-descoberta dos modelos FREE vivos ----------

// Preferência por famílias que já deram certo na casa (ordem de rank)
const FAMILIAS_FREE = [
  "deepseek",
  "llama",
  "gemma",
  "qwen",
  "gpt-oss",
  "mistral",
  "nemotron",
];

let openRouterFreeAprovados: string[] | null = null; // cache deste boot
const openRouterFreeReprovados = new Set<string>(); // 404/429 na prática

type ModeloOpenRouter = {
  id?: string;
};

async function descobrirFreeOpenRouter(chave: string): Promise<string[]> {
  if (openRouterFreeAprovados) return openRouterFreeAprovados;
  try {
    const resposta = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${chave}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!resposta.ok) {
      console.log("[motor-ia] listagem OpenRouter falhou:", resposta.status);
      return [];
    }
    const dados = (await resposta.json().catch(() => null)) as {
      data?: ModeloOpenRouter[];
    } | null;
    const livres = (dados?.data ?? [])
      .map((modelo) => modelo.id ?? "")
      .filter(
        (id) => id && id.endsWith(":free") && !openRouterFreeReprovados.has(id)
      );
    const ranque = (id: string) => {
      const indice = FAMILIAS_FREE.findIndex((familia) => id.includes(familia));
      return indice === -1 ? FAMILIAS_FREE.length : indice;
    };
    const escolhidos = livres.sort((a, b) => ranque(a) - ranque(b)).slice(0, 3);
    if (escolhidos.length) {
      openRouterFreeAprovados = escolhidos;
      console.log(`[motor-ia] OpenRouter free vivos: ${escolhidos.join(", ")}`);
    }
    return escolhidos;
  } catch {
    console.log("[motor-ia] erro ao listar modelos do OpenRouter");
    return [];
  }
}

// Tentativa única num slug específico do OpenRouter
async function chamarOpenRouter(
  chave: string,
  modelo: string,
  prompt: string,
  temperatura: number,
  maxTokens: number
): Promise<{ ok: true; texto: string } | { ok: false; status: number }> {
  try {
    const resposta = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${chave}`,
        "HTTP-Referer": "https://anuncia-three.vercel.app",
        "X-Title": "AnuncIA",
      },
      body: JSON.stringify({
        model: modelo,
        messages: [{ role: "user", content: prompt }],
        temperature: temperatura,
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(45000),
    });
    const dados: unknown = await resposta.json().catch(() => null);
    if (!resposta.ok) {
      anotarDetalheIA(dados);
      console.error(`[motor-ia] OpenRouter ${modelo} recusou. status:`, resposta.status);
      return { ok: false, status: resposta.status };
    }
    const texto = textoDeRespostaOpenAI(dados);
    if (!texto) {
      anotarDetalheIA(dados);
      return { ok: false, status: 502 };
    }
    return { ok: true, texto };
  } catch {
    console.error(`[motor-ia] Exceção no OpenRouter ${modelo}`);
    return { ok: false, status: 0 };
  }
}

// A camada OpenRouter em ação: descobre os free vivos e desfila até 3
async function gerarViaOpenRouterFree(
  chave: string,
  prompt: string,
  temperatura: number,
  maxTokens: number
): Promise<Tentativa> {
  let candidatos = await descobrirFreeOpenRouter(chave);
  if (!candidatos.length) return { ok: false, status: null };

  for (let tentativa = 0; tentativa < 3 && tentativa < candidatos.length; tentativa += 1) {
    const modelo = candidatos[tentativa];
    const resultado = await chamarOpenRouter(chave, modelo, prompt, temperatura, maxTokens);
    if (resultado.ok) {
      console.log(`[motor-ia] OpenRouter free respondeu: ${modelo}`);
      return { ok: true, texto: resultado.texto, motor: `OpenRouter · ${modelo}` };
    }
    if (resultado.status === 404 || resultado.status === 400) {
      // slug morto: hall dos reprovados e re-descobre
      openRouterFreeReprovados.add(modelo);
      if (openRouterFreeAprovados) {
        openRouterFreeAprovados = openRouterFreeAprovados.filter((m) => m !== modelo);
      }
      candidatos = (await descobrirFreeOpenRouter(chave)).filter((m) => m !== modelo);
      if (!candidatos.length) break;
      tentativa -= 1; // reposiciona pro próximo vivo
    } else {
      return { ok: false, status: resultado.status };
    }
  }
  return { ok: false, status: 404 };
}

// ---------- GET: espelho da mesa (quais motores têm chave plantada) ----------

export async function GET() {
  // Mesma porta do POST: com Supabase configurado, só usuário logado espia
  const supabase = await getSupabaseServer();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { erro: "Faça login para ver os motores." },
        { status: 401 }
      );
    }
  }

  // Só booleanos — NUNCA as chaves (GitHub Models descansa em paz)
  return NextResponse.json({
    motores: [
      { id: "gemini", armado: Boolean(process.env.GEMINI_API_KEY) },
      { id: "groq", armado: Boolean(process.env.GROQ_API_KEY) },
      { id: "openrouter", armado: Boolean(process.env.OPENROUTER_API_KEY) },
      { id: "cerebras", armado: Boolean(process.env.CEREBRAS_API_KEY) },
    ],
  });
}

// ---------- POST: gerar texto, caindo pela cadeia ----------

export async function POST(request: Request) {
  // 1) Porta: quando o Supabase está configurado, exige usuário logado
  const supabase = await getSupabaseServer();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { erro: "Faça login para usar a IA." },
        { status: 401 }
      );
    }
  }

  // 2) Pedido
  let corpo: PedidoIA;
  try {
    corpo = (await request.json()) as PedidoIA;
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  const acao = corpo.acao ?? "gerar-texto";
  const prompt = corpo.prompt?.trim() ?? "";

  if (acao !== "gerar-texto") {
    return NextResponse.json({ erro: "Ação desconhecida." }, { status: 400 });
  }
  if (!prompt) {
    return NextResponse.json(
      { erro: "Escreva algo para a IA trabalhar." },
      { status: 400 }
    );
  }
  if (prompt.length > 8000) {
    return NextResponse.json(
      { erro: "Texto longo demais (máximo 8.000 caracteres)." },
      { status: 400 }
    );
  }

  // Parâmetros vivos dos controles das telas (com limites saudáveis)
  const temperatura = pegarTemperatura(corpo.temperatura);
  const maxTokens = pegarMaxTokens(corpo.maxTokens);

  // 020-A: Base de Excelência muda da tela pra rota — injetada em TODAS as gerações (decisão Reunião 2)
  // Quanto for necessário para excelência SEM LIMITE — sem diminuir caracteres
  const promptComExcelencia = `${BASE_EXCELENCIA}\n\n---\nTAREFA DO USUÁRIO:\n${prompt}\n\n---\nLEMBRETE: Entregue quanto for necessário para nível de excelência, sem limite de palavras. Resultado real > aparência.`;

  // 3) Monta a fila — cada etapa carrega rótulo pro resumo da verdade
  const fila: { rotulo: string; rodar: () => Promise<Tentativa> }[] = [];

  const chaveGemini = process.env.GEMINI_API_KEY;
  if (chaveGemini) {
    fila.push({
      rotulo: "Gemini",
      rodar: () => gerarViaGemini(chaveGemini, promptComExcelencia, temperatura, maxTokens),
    });
  } else {
    console.log("[motor-ia] sem GEMINI_API_KEY — indo direto pros reservas");
  }

  const chaveGroq = process.env.GROQ_API_KEY;
  if (chaveGroq) {
    fila.push({
      rotulo: "Groq (auto)",
      rodar: () =>
        gerarViaCompativel(
          "GROQ_API_KEY",
          "https://api.groq.com/openai/v1/chat/completions",
          "https://api.groq.com/openai/v1/models",
          chaveGroq,
          promptComExcelencia,
          temperatura,
          maxTokens,
          ["llama-4", "gpt-oss", "llama-3.3", "qwen", "mistral"],
          "Groq"
        ),
    });
  } else {
    console.log("[motor-ia] Groq: sem GROQ_API_KEY — fora da fila");
  }

  const chaveOpenRouter = process.env.OPENROUTER_API_KEY;
  if (chaveOpenRouter) {
    fila.push({
      rotulo: "OpenRouter (free auto)",
      rodar: () => gerarViaOpenRouterFree(chaveOpenRouter, promptComExcelencia, temperatura, maxTokens),
    });
  } else {
    console.log("[motor-ia] OpenRouter: sem OPENROUTER_API_KEY — fora da fila");
  }

  const chaveCerebras = process.env.CEREBRAS_API_KEY;
  if (chaveCerebras) {
    fila.push({
      rotulo: "Cerebras (auto)",
      rodar: () =>
        gerarViaCompativel(
          "CEREBRAS_API_KEY",
          "https://api.cerebras.ai/v1/chat/completions",
          "https://api.cerebras.ai/v1/models",
          chaveCerebras,
          promptComExcelencia,
          temperatura,
          maxTokens,
          ["llama-3.3", "llama-4", "gpt-oss", "qwen"],
          "Cerebras"
        ),
    });
  } else {
    console.log("[motor-ia] Cerebras: sem CEREBRAS_API_KEY — fora da fila (opcional)");
  }

  if (fila.length === 0) {
    return NextResponse.json(
      { erro: "IA não configurada neste ambiente (nenhuma chave plantada)." },
      { status: 503 }
    );
  }

  // 4) Desfila até um responder (anotando QUEM caiu e por quê)
  let ultimoStatus: number | null = null;
  let houveLimite = false;
  const falhas: string[] = [];

  for (const etapa of fila) {
    const resultado = await etapa.rodar();
    if (resultado.ok) {
      return NextResponse.json({ texto: resultado.texto, motor: resultado.motor });
    }
    falhas.push(`${etapa.rotulo}→${resultado.status ?? "rede"}`);
    if (resultado.status !== null) {
      ultimoStatus = resultado.status;
      if (resultado.status === 429) houveLimite = true;
    }
  }

  // 5) Todos falharam — confessa em PT-BR com a fila INTEIRA na tela
  console.error("[motor-ia] TODOS os motores falharam. último status:", ultimoStatus);

  // (v5) o resumo da fila viaja em TODOS os erros
  const resumoFalhas = falhas.length ? ` (fila: ${falhas.join(" | ")})` : "";

  if (houveLimite) {
    return NextResponse.json(
      {
        erro:
          "Todos os motores gratuitos bateram o limite agora. Aguarde 1 minuto e tente de novo — a cota volta sozinha." +
          resumoFalhas,
      },
      { status: 429 }
    );
  }

  if (ultimoStatus === null) {
    return NextResponse.json(
      {
        erro:
          "Nenhum motor de IA conseguiu responder agora (rede ou tempo). Tente de novo em instantes." +
          resumoFalhas,
      },
      { status: 503 }
    );
  }

  const detalheFinal = falhas.length
    ? ` Detalhe técnico: ${falhas.join(" | ")} — último motivo: ${ultimoDetalheMotorIA ?? "sem detalhe"}`
    : "";

  return NextResponse.json(
    { erro: `${traduzErroIA(ultimoStatus)}${detalheFinal}` },
    { status: 502 }
  );
}
