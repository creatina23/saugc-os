// src/lib/ia/cadeia-texto.ts — CP-01 FIX P1 · CASCATA CANÔNICA DE TEXTO
// ======================================================================
// UMA CAPACIDADE → UMA IMPLEMENTAÇÃO CANÔNICA → MÚLTIPLOS CONSUMIDORES.
//
// MESA DE MOTORES — extraída SEM mudança comportamental de /api/ia (que
// segue funcionando idêntica, agora importando daqui). O Orquestrador
// (motor.ts) passa a consumir ESTA cascata — a cascata duplicada e
// degradada dele (3 slugs cravados, sem auto-descoberta, sem 4º provider,
// catch mudo) foi eliminada (incidente P1 de 2026-10-02).
//
// CADEIA (texto), na ordem — um falha, o próximo assume:
//   1) Gemini (titular) — AUTODESCOBERTA + hall dos reprovados.
//   2) Groq — AUTO-DESCOBERTA (slug cravado morreu: 404 real em 23 ago).
//   3) OpenRouter — modelos :free com AUTO-DESCOBERTA (slugs morrem
//      sem aviso; 2 funerais reais caçados em 23 ago).
//   4) Cerebras (opcional) — ultra-rápido, cota grátis (CEREBRAS_API_KEY).
//   ⚰️ GitHub Models: FALECIDO em 30 jul 2026 (aposentado pra TODOS —
//      anúncio oficial de 1º jul). Removido da Mesa com honras: serviu
//      desde a Sprint 017. NENHUM modelo é cravado nesta cascata: cada
//      camada pergunta à própria API quem tá vivo HOJE (lição 9).
//
// • SKIP GRACIOSO: camada sem chave é pulada em silêncio (só log).
// • Resposta de sucesso carrega "motor": quem de fato respondeu.
// • Logs [motor-ia] aparecem só no TERMINAL do servidor.
// • OBSERVABILIDADE P1: cada tentativa agora carrega categoria sanitizada
//   (CategoriaFalhaCascata) — provider, se houve rede, status, duração.
//   SEGREDOS JAMAIS entram em log nem no retorno.
// ======================================================================

export type CategoriaFalhaCascata =
  | "SKIPPED_NO_KEY"
  | "HTTP_401"
  | "HTTP_403"
  | "HTTP_404_MODEL"
  | "HTTP_429_QUOTA"
  | "HTTP_4XX"
  | "HTTP_5XX"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "INVALID_RESPONSE";

export type TentativaCascata = {
  provider: string; // "Gemini" | "Groq" | "OpenRouter" | "Cerebras"
  redeHouve: boolean; // true = a requsição saiu (útil p/ distinguir skip de falha)
  duracaoMs: number;
  categoria: CategoriaFalhaCascata | "SUCCESS";
  status: number | null; // status HTTP quando existiu (null = sem resposta)
};

export type ResultadoCascata =
  | {
      ok: true;
      texto: string;
      motor: string;
      provider: string;
      modelo: string;
      tentativas: TentativaCascata[];
      duracaoMs: number;
    }
  | {
      ok: false;
      tentativas: TentativaCascata[];
      categoriaFinal: CategoriaFalhaCascata;
      duracaoMs: number;
    };

export type OpcoesCascata = {
  temperatura?: number; // default 0.7 (clamp 0..1)
  maxTokens?: number; // default 1024 (clamp 256..4096)
  /** Deadline (ms) global DESTA chamada: cada tentativa herda o teto
   *  restante (mínimo 5s). Default: 240s (orçamento P1, ver §9 do FIX). */
  prazoMs?: number;
};

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

// ---------- Orçamento temporal (P1 §9): deadline global por chamada ----------
//
// Relógio único por chamada da cascata: cada fetch recebe
// min(timeoutDaEtapa, deadlineRestante). Consequência honesta: a cascata
// NUNCA é teoricamente ilimitada — no teto, a tentativa vigente aborta
// (AbortError → TIMEOUT) e o próximo provider ainda pode responder no
// tempo que sobrar. Não degradamos resiliência: os limites por etapa
// continuam os mesmos da /api/ia; só há um teto compartilhado por cima.
function criarOrcamento(prazoMs: number) {
  const alvo = Date.now() + prazoMs;
  const restanteMs = () => Math.max(0, alvo - Date.now());
  const sinal = (timeoutMs: number): AbortSignal => {
    const restante = restanteMs();
    // P1 §9: uma tentativa NUNCA pode comer o deadline inteiro da chamada
    // — senão um provider lento esgotaria o orçamento e mataria o
    // fallback (era exatamente o modo de falha medido no incidente).
    // Regra: teto da tentativa = min(timeoutDaEtapa, floor(restante/2)),
    // piso 5s. Efeito: 40s/etapa → 20s+10s+5s…; /api/ia (240s) mantém o
    // teto clássico de 45s na 1ª tentativa (comportamento preservado).
    const orcado = Math.max(
      5000,
      Math.min(timeoutMs, Math.max(5000, Math.floor(restante / 2)))
    );
    return AbortSignal.timeout(orcado);
  };
  const esgotado = () => restanteMs() <= 0;
  return { restanteMs, sinal, esgotado };
}

type Orcamento = ReturnType<typeof criarOrcamento>;

// ---------- Tipos e helpers ----------

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

function categorizarStatus(status: number): CategoriaFalhaCascata {
  if (status === 401) return "HTTP_401";
  if (status === 403) return "HTTP_403";
  if (status === 404 || status === 410) return "HTTP_404_MODEL";
  if (status === 429) return "HTTP_429_QUOTA";
  if (status >= 500) return "HTTP_5XX";
  return "HTTP_4XX";
}

function categorizarExcecao(excecao: unknown): CategoriaFalhaCascata {
  const nome =
    typeof excecao === "object" && excecao !== null
      ? String((excecao as { name?: unknown }).name ?? "")
      : "";
  if (nome === "AbortError" || nome === "TimeoutError") return "TIMEOUT";
  return "NETWORK_ERROR";
}

type TentativaInterna =
  | { ok: true; texto: string; motor: string; provider: string; modelo: string }
  | { ok: false; status: number | null; categoria: CategoriaFalhaCascata };

// ---------- Camada 1: Gemini (titular, autodescoberta) ----------

async function descobrirModelo(chave: string, orc: Orcamento): Promise<string | null> {
  try {
    const resposta = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models",
      {
        headers: { "x-goog-api-key": chave },
        signal: orc.sinal(20000),
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
  maxTokens: number,
  orc: Orcamento
): Promise<TentativaInterna> {
  let ultimoStatus: number | null = null;
  let ultimaCategoria: CategoriaFalhaCascata = "HTTP_4XX";

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa += 1) {
    if (orc.esgotado()) {
      return { ok: false, status: null, categoria: "TIMEOUT" };
    }
    const modelo =
      modeloAprovado ?? (await descobrirModelo(chave, orc)) ?? MODELO_RESERVA;

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
          signal: orc.sinal(45000),
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
          ultimaCategoria = "INVALID_RESPONSE";
          break;
        }
        modeloAprovado = modelo;
        console.log(`[motor-ia] Gemini aprovado e fixado: ${modelo}`);
        return {
          ok: true,
          texto: gerado,
          motor: `Gemini · ${modelo}`,
          provider: "Gemini",
          modelo,
        };
      }

      ultimoStatus = resposta.status;
      ultimaCategoria = categorizarStatus(resposta.status);
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
      ultimaCategoria = categorizarExcecao(excecao);
      break;
    }
  }

  if (ultimaCategoria === "HTTP_4XX" && ultimoStatus !== null) {
    ultimaCategoria = categorizarStatus(ultimoStatus);
  }
  return { ok: false, status: ultimoStatus, categoria: ultimaCategoria };
}

// ---------- Camadas compatíveis (Groq · Cerebras): auto-descoberta ----------
// Formato OpenAI, mas NENHUM modelo cravado: a cascata lista os modelos da
// própria API, prefere as famílias de confiança e mantém hall dos mortos.

const cacheModelosCompativeis = new Map<string, string[]>(); // env → slugs vivos
const reprovadosCompativeis = new Set<string>(); // "ENV:slug"

async function descobrirModeloCompativel(
  env: string,
  urlLista: string,
  chave: string,
  preferencias: string[],
  orc: Orcamento
): Promise<string | null> {
  const emCache = cacheModelosCompativeis.get(env);
  if (emCache && emCache.length) return emCache[0];
  try {
    const resposta = await fetch(urlLista, {
      headers: { Authorization: `Bearer ${chave}` },
      signal: orc.sinal(15000),
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
  rotulo: string,
  orc: Orcamento
): Promise<TentativaInterna> {
  for (let tentativa = 0; tentativa < 2; tentativa += 1) {
    if (orc.esgotado()) {
      return { ok: false, status: null, categoria: "TIMEOUT" };
    }
    const modelo = await descobrirModeloCompativel(env, urlLista, chave, preferencias, orc);
    if (!modelo) return { ok: false, status: null, categoria: "HTTP_404_MODEL" };

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
        signal: orc.sinal(45000),
      });
      const dados: unknown = await resposta.json().catch(() => null);
      if (resposta.ok) {
        const texto = textoDeRespostaOpenAI(dados);
        if (texto) {
          console.log(`[motor-ia] ${rotulo} respondeu (${modelo})`);
          return {
            ok: true,
            texto,
            motor: `${rotulo} · ${modelo}`,
            provider: rotulo,
            modelo,
          };
        }
        anotarDetalheIA(dados);
        return { ok: false, status: 502, categoria: "INVALID_RESPONSE" };
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
      return {
        ok: false,
        status: resposta.status,
        categoria: categorizarStatus(resposta.status),
      };
    } catch (excecao) {
      console.error(`[motor-ia] Exceção no ${rotulo}:`, excecao);
      return { ok: false, status: null, categoria: categorizarExcecao(excecao) };
    }
  }
  return { ok: false, status: 404, categoria: "HTTP_404_MODEL" };
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

async function descobrirFreeOpenRouter(
  chave: string,
  orc: Orcamento
): Promise<string[]> {
  if (openRouterFreeAprovados) return openRouterFreeAprovados;
  try {
    const resposta = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${chave}` },
      signal: orc.sinal(15000),
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
  maxTokens: number,
  orc: Orcamento
): Promise<{ ok: true; texto: string } | { ok: false; status: number; categoria: CategoriaFalhaCascata }> {
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
      signal: orc.sinal(45000),
    });
    const dados: unknown = await resposta.json().catch(() => null);
    if (!resposta.ok) {
      anotarDetalheIA(dados);
      console.error(`[motor-ia] OpenRouter ${modelo} recusou. status:`, resposta.status);
      return {
        ok: false,
        status: resposta.status,
        categoria: categorizarStatus(resposta.status),
      };
    }
    const texto = textoDeRespostaOpenAI(dados);
    if (!texto) {
      anotarDetalheIA(dados);
      return { ok: false, status: 502, categoria: "INVALID_RESPONSE" };
    }
    return { ok: true, texto };
  } catch (excecao) {
    console.error(`[motor-ia] Exceção no OpenRouter ${modelo}`);
    return { ok: false, status: 0, categoria: categorizarExcecao(excecao) };
  }
}

// A camada OpenRouter em ação: descobre os free vivos e desfila até 3
async function gerarViaOpenRouterFree(
  chave: string,
  prompt: string,
  temperatura: number,
  maxTokens: number,
  orc: Orcamento
): Promise<TentativaInterna> {
  let candidatos = await descobrirFreeOpenRouter(chave, orc);
  if (!candidatos.length) return { ok: false, status: null, categoria: "HTTP_404_MODEL" };

  for (let tentativa = 0; tentativa < 3 && tentativa < candidatos.length; tentativa += 1) {
    if (orc.esgotado()) {
      return { ok: false, status: null, categoria: "TIMEOUT" };
    }
    const modelo = candidatos[tentativa];
    const resultado = await chamarOpenRouter(chave, modelo, prompt, temperatura, maxTokens, orc);
    if (resultado.ok) {
      console.log(`[motor-ia] OpenRouter free respondeu: ${modelo}`);
      return {
        ok: true,
        texto: resultado.texto,
        motor: `OpenRouter · ${modelo}`,
        provider: "OpenRouter",
        modelo,
      };
    }
    if (resultado.ok === false && (resultado.status === 404 || resultado.status === 400)) {
      // slug morto: hall dos reprovados e re-descobre
      openRouterFreeReprovados.add(modelo);
      if (openRouterFreeAprovados) {
        openRouterFreeAprovados = openRouterFreeAprovados.filter((m) => m !== modelo);
      }
      candidatos = (await descobrirFreeOpenRouter(chave, orc)).filter((m) => m !== modelo);
      if (!candidatos.length) break;
      tentativa -= 1; // reposiciona pro próximo vivo
    } else if (resultado.ok === false) {
      return { ok: false, status: resultado.status, categoria: resultado.categoria };
    }
  }
  return { ok: false, status: 404, categoria: "HTTP_404_MODEL" };
}

// ---------- API canônica ----------

/** Espelho da mesa (booleanos — NUNCA as chaves). */
export function motoresArmados(): { id: string; armado: boolean }[] {
  return [
    { id: "gemini", armado: Boolean(process.env.GEMINI_API_KEY) },
    { id: "groq", armado: Boolean(process.env.GROQ_API_KEY) },
    { id: "openrouter", armado: Boolean(process.env.OPENROUTER_API_KEY) },
    { id: "cerebras", armado: Boolean(process.env.CEREBRAS_API_KEY) },
  ];
}

/** Detalhe sanitizado do último erro (sem segredo) — usado na resposta 502. */
export function detalheSanitizadoUltimoErro(): string | null {
  return ultimoDetalheMotorIA;
}

/**
 * Gera texto desfilando a Mesa (Gemini → Groq → OpenRouter → Cerebras).
 * ÚNICA implementação de transporte provider do produto a partir daqui.
 */
export async function gerarTextoCascata(
  prompt: string,
  opcoes: OpcoesCascata = {}
): Promise<ResultadoCascata> {
  const inicio = Date.now();
  const temperatura = pegarTemperatura(opcoes.temperatura);
  const maxTokens = pegarMaxTokens(opcoes.maxTokens);
  const orc = criarOrcamento(
    Number.isFinite(opcoes.prazoMs) ? Math.max(15000, Math.floor(opcoes.prazoMs as number)) : 240000
  );

  const tentativas: TentativaCascata[] = [];
  const registrarTentativa = (
    provider: string,
    inicioEtapa: number,
    resultado: TentativaInterna | { skip: true }
  ) => {
    if ("skip" in resultado) {
      tentativas.push({
        provider,
        redeHouve: false,
        duracaoMs: 0,
        categoria: "SKIPPED_NO_KEY",
        status: null,
      });
      return;
    }
    if (resultado.ok === true) {
      tentativas.push({
        provider,
        redeHouve: true,
        duracaoMs: Date.now() - inicioEtapa,
        categoria: "SUCCESS",
        status: 200,
      });
      return;
    }
    tentativas.push({
      provider,
      redeHouve: true,
      duracaoMs: Date.now() - inicioEtapa,
      categoria: resultado.categoria,
      status: resultado.status,
    });
  };

  // 1) Gemini
  const chaveGemini = process.env.GEMINI_API_KEY;
  if (chaveGemini) {
    const t0 = Date.now();
    const r = await gerarViaGemini(chaveGemini, prompt, temperatura, maxTokens, orc);
    registrarTentativa("Gemini", t0, r);
    if (r.ok) {
      return {
        ok: true,
        texto: r.texto,
        motor: r.motor,
        provider: r.provider,
        modelo: r.modelo,
        tentativas,
        duracaoMs: Date.now() - inicio,
      };
    }
  } else {
    console.log("[motor-ia] sem GEMINI_API_KEY — indo direto pros reservas");
    registrarTentativa("Gemini", 0, { skip: true });
  }

  // 2) Groq
  const chaveGroq = process.env.GROQ_API_KEY;
  if (chaveGroq && !orc.esgotado()) {
    const t0 = Date.now();
    const r = await gerarViaCompativel(
      "GROQ_API_KEY",
      "https://api.groq.com/openai/v1/chat/completions",
      "https://api.groq.com/openai/v1/models",
      chaveGroq,
      prompt,
      temperatura,
      maxTokens,
      ["llama-4", "gpt-oss", "llama-3.3", "qwen", "mistral"],
      "Groq",
      orc
    );
    registrarTentativa("Groq", t0, r);
    if (r.ok) {
      return {
        ok: true,
        texto: r.texto,
        motor: r.motor,
        provider: r.provider,
        modelo: r.modelo,
        tentativas,
        duracaoMs: Date.now() - inicio,
      };
    }
  } else {
    if (!chaveGroq) console.log("[motor-ia] Groq: sem GROQ_API_KEY — fora da fila");
    registrarTentativa("Groq", 0, { skip: true });
  }

  // 3) OpenRouter (free auto)
  const chaveOpenRouter = process.env.OPENROUTER_API_KEY;
  if (chaveOpenRouter && !orc.esgotado()) {
    const t0 = Date.now();
    const r = await gerarViaOpenRouterFree(chaveOpenRouter, prompt, temperatura, maxTokens, orc);
    registrarTentativa("OpenRouter", t0, r);
    if (r.ok) {
      return {
        ok: true,
        texto: r.texto,
        motor: r.motor,
        provider: r.provider,
        modelo: r.modelo,
        tentativas,
        duracaoMs: Date.now() - inicio,
      };
    }
  } else {
    if (!chaveOpenRouter)
      console.log("[motor-ia] OpenRouter: sem OPENROUTER_API_KEY — fora da fila");
    registrarTentativa("OpenRouter", 0, { skip: true });
  }

  // 4) Cerebras (opcional)
  const chaveCerebras = process.env.CEREBRAS_API_KEY;
  if (chaveCerebras && !orc.esgotado()) {
    const t0 = Date.now();
    const r = await gerarViaCompativel(
      "CEREBRAS_API_KEY",
      "https://api.cerebras.ai/v1/chat/completions",
      "https://api.cerebras.ai/v1/models",
      chaveCerebras,
      prompt,
      temperatura,
      maxTokens,
      ["llama-3.3", "llama-4", "gpt-oss", "qwen"],
      "Cerebras",
      orc
    );
    registrarTentativa("Cerebras", t0, r);
    if (r.ok) {
      return {
        ok: true,
        texto: r.texto,
        motor: r.motor,
        provider: r.provider,
        modelo: r.modelo,
        tentativas,
        duracaoMs: Date.now() - inicio,
      };
    }
  } else {
    if (!chaveCerebras)
      console.log("[motor-ia] Cerebras: sem CEREBRAS_API_KEY — fora da fila (opcional)");
    registrarTentativa("Cerebras", 0, { skip: true });
  }

  // Fail-closed: categoria final = última tentativa REAL (ou SKIPPED se nenhuma foi feita)
  const reais = tentativas.filter((t) => t.categoria !== "SKIPPED_NO_KEY");
  const categoriaFinal =
    reais.length > 0
      ? (reais[reais.length - 1].categoria as CategoriaFalhaCascata)
      : "SKIPPED_NO_KEY";

  console.error(
    "[motor-ia] TODOS os motores falharam. fila:",
    tentativas.map((t) => `${t.provider}→${t.categoria}`).join(" | ")
  );

  return {
    ok: false,
    tentativas,
    categoriaFinal,
    duracaoMs: Date.now() - inicio,
  };
}
