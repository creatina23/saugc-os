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

import type { PromptParticionado } from "../constituicao/composicao";
export type { PromptParticionado };

export type CategoriaFalhaCascata =
  | "SKIPPED_NO_KEY"
  /** P2 Fase 2: provider pulado POR SAÚDE efêmera desta execução
   *  (quota/indisponibilidade já demonstrada nesta request). Não é
   *  mascaramento de falha de rede — é decisão registrada. */
  | "SKIPPED_PROVIDER_COOLDOWN"
  | "HTTP_401"
  | "HTTP_403"
  | "HTTP_404_MODEL"
  /** P2 Fase 2: 402 = Payment Required (semântica canônica do status —
   *  não distinguimos crédito vs quota vs assinatura; isso é o que o
   *  status, sozinho, permite afirmar sem inventar significado). */
  | "HTTP_402_PAYMENT_REQUIRED"
  | "HTTP_429_QUOTA"
  | "HTTP_4XX"
  | "HTTP_5XX"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "INVALID_RESPONSE"
  /** P2 Fase 2: categoria agregada quando TODOS falharam com tentativas
   *  reais — as categorias individuais permanecem em tentativas[]. */
  | "ALL_PROVIDERS_UNAVAILABLE";

/** P2 Fase 2 — SAÚDE EFÊMERA por execução (memória viva SÓ durante a
 *  request). CUSTO R$0: sem banco, sem KV, sem persistência, sem serviço
 *  externo. Criada por execução do Orquestrador (criarGeradorReal) e
 *  descartada com ela; /api/ia não a usa (cada geração é independente). */
export type SaudeProvider =
  | "healthy"
  | "temporary_failure"
  | "quota_limited"
  | "unavailable_for_run";

/** ARC-02B.3 · FASE 4 — saúde com ORIGEM FORENSE: o cooldown não é um
 *  booleano cego; cada provider sabe QUAL falha (categoria nossa) em QUAL
 *  etapa o pôs em quarentena. `undefined` para healthy/prior limpo. */
export interface SaudeRegistro {
  estado: SaudeProvider;
  /** categoria NOSSA da falha que pôs o provider nesse estado. */
  categoriaOrigem?: CategoriaFalhaCascata;
  /** persona/etapa da cadeia onde a falha ocorreu (rótulo nosso). */
  etapaOrigem?: string;
}

/** Compat defensiva: consumidores legados usavam Map<string,string>; a
 *  leitura tolera valor-string (trata como estado), mas o código só ESCREVE
 *  o novo formato `SaudeRegistro`. */
export type SaudeExecucao = Map<string, SaudeRegistro>;

export type TentativaCascata = {
  provider: string; // "Gemini" | "Groq" | "OpenRouter" | "Cerebras" | "Cloudflare"
  redeHouve: boolean; // true = a requsição saiu (útil p/ distinguir skip de falha)
  duracaoMs: number;
  categoria: CategoriaFalhaCascata | "SUCCESS";
  status: number | null; // status HTTP quando existiu (null = sem resposta)
  modelo?: string | null; // P3.1: slug do modelo (seguro: não é segredo — é dado técnico público)
  terminoStatus?: string | null; // P3.2: status canônico de término (label nosso)
  saidaTokens?: number | null;   // P3.2: tokens de saída quando o provider informa (número puro)
  /** ARC-02B.3 · FASE 4 — quando categoria === SKIPPED_PROVIDER_COOLDOWN,
   *  explica o skip, ex.: "HTTP_429_QUOTA na etapa \"estrategista\"" (rótulos
   *  NOSSOS: categoria + etapa, nunca texto do provider). Null = skip sem
   *  origem registrada (compat com consumidores que não passam etapaId). */
  cooldownOrigem?: string | null;
};

export type ResultadoCascata =
  | {
      ok: true;
      texto: string;
      motor: string;
      provider: string;
      modelo: string;
      termino: MetadadosTermino;
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
  /** ARC-02B.3 · FASE 4 — id da etapa (persona) que chamou, rotulado pelo
   *  consumidor (nosso código). Usado para rastrear origem de cooldown.
   *  Consumidores legados não passam — saude ainda funciona, sem origem. */
  etapaId?: string;
  /** Deadline (ms) global DESTA chamada: cada tentativa herda o teto
   *  restante (mínimo 5s). Default: 240s (orçamento P1, ver §9 do FIX). */
  prazoMs?: number;
  /** P2 Fase 2: saúde efêmera da execução (ver SaudeExecucao). Ausente =
   *  comportamento clássico (cada chamada independente). */
  saude?: SaudeExecucao;
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
  // P3.1: para a ÚLTIMA camada da cascata o "fallback protegido pela
  // metade" não existe — dividir o restante por 2 capava o Cloudflare em
  // ~20s exatos (causa do TIMEOUT no smoke). Regra da última camada:
  // teto = min(timeoutDaEtapa, restante - MARGEM), piso 5s — respeita o
  // orçamento restante da etapa, nunca ultrapassa o deadline.
  const sinalRestante = (timeoutMs: number): AbortSignal => {
    const restante = restanteMs();
    const orcado = Math.max(
      5000,
      Math.min(timeoutMs, Math.max(5000, restante - 1500))
    );
    return AbortSignal.timeout(orcado);
  };
  const esgotado = () => restanteMs() <= 0;
  return { restanteMs, sinal, sinalRestante, esgotado };
}

type Orcamento = ReturnType<typeof criarOrcamento>;

// ---------- Política mínima de resiliência (P2 Fase 2) ----------
//
// Baseada na evidência REAL de produção (smoke P2 F1): Gemini 503, Groq
// 429, OpenRouter 429, Cerebras 402 — esgotamento de free tiers, NÃO
// timeout/deadline. Sem aumentar timeout, sem loops longos:
//
//  • 5xx (transitório): até 1 retentativa com espera curta determinística
//    (ESPERA_5XX_MS), respeitando o orçamento da etapa.
//  • 429 + Retry-After PEQUENO (≤ TETO_RETRY_AFTER_MS): espera o indicado
//    e faz 1 retentativa; Retry-After ausente ou grande → NÃO espera, e o
//    provider entra em quota_limited (efêmero desta execução): as etapas
//    seguintes o SKIPAM com categoria explícita SKIPPED_PROVIDER_COOLDOWN.
//  • 402 (Payment Required): não melhora com retry imediato →
//    unavailable_for_run imediato nesta execução.
//  • Marcação centralizada em gerarTextoCascata (camadas só relatam a
//    categoria — decisão de saúde mora num lugar só, fácil de auditar).
const ESPERA_5XX_MS = 1200;
const TETO_RETRY_AFTER_MS = 5000;
const MARGEM_SEGURANCA_MS = 500;

/** Lê Retry-After (segundos → ms). Ausente/inválido → null (não esperar). */
function lerRetryAfterMs(resposta: Response): number | null {
  const bruto = resposta.headers.get("retry-after");
  if (!bruto) return null;
  const segundos = Number(bruto);
  if (!Number.isFinite(segundos) || segundos <= 0) return null;
  return Math.round(segundos * 1000);
}

/** Espera curta determinística, sempre limitada pelo orçamento restante. */
async function esperarRespeitando(ms: number, orc: Orcamento): Promise<void> {
  const disponivel = Math.max(0, orc.restanteMs() - MARGEM_SEGURANCA_MS);
  const alvo = Math.min(ms, disponivel);
  if (alvo > 0) await new Promise((resolver) => setTimeout(resolver, alvo));
}

/** true = Retry-After vale esperar (pequeno e cabe no orçamento). */
function valeEsperarRetryAfter(raMs: number | null, orc: Orcamento): raMs is number {
  return (
    raMs !== null &&
    raMs <= TETO_RETRY_AFTER_MS &&
    orc.restanteMs() > raMs + 2 * MARGEM_SEGURANCA_MS
  );
}

// ---------- Tipos e helpers ----------

type ParteGemini = { text?: string };
type RespostaGemini = {
  candidates?: {
    content?: { parts?: ParteGemini[] };
    finishReason?: string;
  }[];
  usageMetadata?: { candidatesTokenCount?: number; totalTokenCount?: number };
};

type ModeloGemini = {
  name?: string;
  supportedGenerationMethods?: string[];
};

type RespostaOpenAI = {
  choices?: { message?: { content?: string }; finish_reason?: string }[];
  usage?: { completion_tokens?: number; total_tokens?: number };
};

// ---------- Completion canônica (P3.2) ----------
// SUCCESS ≠ "recebi texto". SUCCESS = texto válido + término aceitável.
// finish_reason/stop_reason era DESCARTADO pelos parsers dos 5 providers
// (causa raiz da truncação silenciosa). Estados canônicos:
export type StatusTermino =
  | "COMPLETE"               // stop/end_turn natural do provider
  | "TRUNCATED_TOKEN_LIMIT"  // provider DISSE: encerrado no teto de geração
  | "TRUNCATED_TIMEOUT"      // resposta parcial por tempo (reservado; hoje timeout aborta sem texto)
  | "UNKNOWN_COMPLETION";    // provider não informou (nunca inventar COMPLETE)

export type MetadadosTermino = {
  readonly status: StatusTermino;
  /** forma canônica sanitizada do finish_reason original (enum conhecido
   *  APENAS — texto arbitrário do provider jamais atravessa). */
  readonly finishReason: string | null;
  /** tokens de saída quando o provider informa (número puro, seguro). */
  readonly outputTokens: number | null;
};

/** Conjunto FECHADO de finish_reasons reconhecidos — whitelist de transporte. */
const FINISH_CONHECIDOS: ReadonlySet<string> = new Set([
  "stop", "length", "end_turn", "tool_calls", "content_filter",
  "STOP", "MAX_TOKENS", "SAFETY", "RECITATION", "OTHER", "BLOCKLIST",
  "PROHIBITED_CONTENT", "SPII", "LANGUAGE", "MALFORMED_FUNCTION_CALL",
]);

function finishSanitizado(bruto: unknown): string | null {
  const texto = typeof bruto === "string" ? bruto : null;
  return texto && FINISH_CONHECIDOS.has(texto) ? texto : null;
}

/** Gemini: STOP→COMPLETE; MAX_TOKENS→TRUNCATED; SAFETY/…→TRUNCATED (provider
 *  alega encerramento não-natural); ausente→UNKNOWN. */
function terminoDeRespostaGemini(dados: unknown): MetadadosTermino {
  const g = dados as RespostaGemini | null;
  const bruto = g?.candidates?.[0]?.finishReason;
  const finishReason = finishSanitizado(bruto);
  const outputTokens =
    typeof g?.usageMetadata?.candidatesTokenCount === "number"
      ? g.usageMetadata.candidatesTokenCount
      : null;
  let status: StatusTermino = "UNKNOWN_COMPLETION";
  if (finishReason === "STOP") status = "COMPLETE";
  else if (finishReason === "MAX_TOKENS") status = "TRUNCATED_TOKEN_LIMIT";
  else if (finishReason === null) status = "UNKNOWN_COMPLETION";
  else status = typeof bruto === "string" ? "TRUNCATED_TOKEN_LIMIT" : "UNKNOWN_COMPLETION";
  return { status, finishReason, outputTokens };
}

/** Formato OpenAI (Groq · Cerebras · OpenRouter · Cloudflare REST):
 *  stop/end_turn→COMPLETE; length→TRUNCATED_TOKEN_LIMIT; ausente→UNKNOWN. */
function terminoDeRespostaOpenAI(dados: unknown): MetadadosTermino {
  const r = dados as RespostaOpenAI | null;
  const bruto = r?.choices?.[0]?.finish_reason;
  const finishReason = finishSanitizado(bruto);
  const outputTokens =
    typeof r?.usage?.completion_tokens === "number"
      ? r.usage.completion_tokens
      : null;
  let status: StatusTermino = "UNKNOWN_COMPLETION";
  if (finishReason === "stop" || finishReason === "end_turn") status = "COMPLETE";
  else if (finishReason === "length") status = "TRUNCATED_TOKEN_LIMIT";
  else if (finishReason === null) status = "UNKNOWN_COMPLETION";
  else status = typeof bruto === "string" ? "TRUNCATED_TOKEN_LIMIT" : "UNKNOWN_COMPLETION";
  return { status, finishReason, outputTokens };
}

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
  if (status === 402) return "HTTP_402_PAYMENT_REQUIRED";
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
  | { ok: true; texto: string; motor: string; provider: string; modelo: string; termino: MetadadosTermino }
  | { ok: false; status: number | null; categoria: CategoriaFalhaCascata; modelo?: string };

// ---------- P4.1.2: prompt particionado (system × user) ----------
// Consumidor novo (motor/pipeline) passa { system, user }; consumidor
// legado passa uma string — normalizada para { system:"", user:string }
// e os providers SIMPLESMENTE omitem o canal system (comportamento
// idêntico ao anterior). Continuation P3.2 PRESERVA o particionamento:
// o system é reenviado na systemInstruction/mensagem system da chamada
// de continuação, o user vai no primeiro turno, o parcial no do modelo.
export type EntradaPrompt = string | PromptParticionado;

function particionar(entrada: EntradaPrompt): PromptParticionado {
  if (typeof entrada === "string") return { system: "", user: entrada };
  return { system: entrada.system ?? "", user: entrada.user };
}

/** Junção determinística de parcial+continuação (P4.1.2 §14).
 *  Caso A (junção normal, sem overlap) → concatenação direta: MAX_TOKENS
 *  corta no meio de qualquer token/linha, então NUNCA inserir separador
 *  artificial no meio. Casos B/C (a continuação repete a CAUDA do parcial:
 *  linha da fronteira ou trecho maior exato) → o overlap é removido e a
 *  junção fica com UMA ocorrência. Caso D (repetição legítima em outra
 *  posição do texto) → intocado: só deduplicamos PREFIXO×SUFIXO exato.
 *  Regra: maior k≥1 tal que cont.startsWith(parcial.slice(-k)); zero se
 *  não houver. O maior k vence primeiro, então overlaps longos são
 *  preferidos a micro-matches acidentais. Sondagem limitada a 2000 chars
 *  de cauda (determinístico). */
export function juntarContinuacao(parcial: string, continuacao: string): string {
  if (!continuacao) return parcial;
  if (!parcial) return continuacao;
  const LIMITE_SONDA = 2000;
  const cauda = parcial.slice(-LIMITE_SONDA);
  const alvo = Math.min(cauda.length, continuacao.length);
  for (let k = alvo; k >= 1; k -= 1) {
    if (continuacao.startsWith(cauda.slice(-k))) {
      return parcial + continuacao.slice(k);
    }
  }
  return parcial + continuacao;
}

// ---------- Continuação canônica após TRUNCATED_TOKEN_LIMIT (P3.2) ----------
// Regras duras: MÁXIM0 1 continuação automática por geração; no MESMO
// provider/modelo; só se restarem ≥ ORCAMENTO_MINIMO_MS; a segunda
// resposta IMPOE o status final (truncate de novo → permanece marcado,
// sem loop). Se a continuação falha em transporte → mantemos o parcial
// com status TRUNCADO honesto.
const PROMPT_CONTINUACAO =
  "Continue exatamente de onde parou. Não reinicie a resposta. " +
  "Não repita conteúdo já produzido. Conclua apenas as partes restantes do contrato.";
const ORCAMENTO_MINIMO_CONTINUACAO_MS = 8000;

type RespostaComposta =
  | { texto: string; termino: MetadadosTermino }
  | null;

async function continuarGemini(
  chave: string,
  modelo: string,
  prompt: EntradaPrompt,
  parcial: string,
  temperatura: number,
  maxTokens: number,
  orc: Orcamento
): Promise<RespostaComposta> {
  try {
    const partes = particionar(prompt);
    const resposta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": chave },
        body: JSON.stringify({
          // P4.1.2: continuation preserva o particionamento (system intacto)
          ...(partes.system
            ? { systemInstruction: { parts: [{ text: partes.system }] } }
            : {}),
          contents: [
            { role: "user", parts: [{ text: partes.user }] },
            { role: "model", parts: [{ text: parcial }] },
            { role: "user", parts: [{ text: PROMPT_CONTINUACAO }] },
          ],
          generationConfig: { temperature: temperatura, maxOutputTokens: maxTokens },
        }),
        signal: orc.sinalRestante(45000),
      }
    );
    if (!resposta.ok) return null;
    const dados: unknown = await resposta.json().catch(() => null);
    const texto = textoDaRespostaGemini(dados);
    if (!texto) return null;
    return { texto, termino: terminoDeRespostaGemini(dados) };
  } catch {
    return null;
  }
}

async function continuarOpenAICompativel(
  urlChat: string,
  chave: string,
  modelo: string,
  prompt: EntradaPrompt,
  parcial: string,
  temperatura: number,
  maxTokens: number,
  orc: Orcamento,
  headersExtras?: Record<string, string>
): Promise<RespostaComposta> {
  try {
    const partes = particionar(prompt);
    const resposta = await fetch(urlChat, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${chave}`,
        ...(headersExtras ?? {}),
      },
      body: JSON.stringify({
        model: modelo,
        messages: [
          // P4.1.2: continuation preserva o particionamento (system intacto)
          ...(partes.system ? [{ role: "system", content: partes.system }] : []),
          { role: "user", content: partes.user },
          { role: "assistant", content: parcial },
          { role: "user", content: PROMPT_CONTINUACAO },
        ],
        temperature: temperatura,
        max_tokens: maxTokens,
      }),
      signal: orc.sinalRestante(45000),
    });
    if (!resposta.ok) return null;
    const dados: unknown = await resposta.json().catch(() => null);
    const texto = textoDeRespostaOpenAI(dados);
    if (!texto) return null;
    return { texto, termino: terminoDeRespostaOpenAI(dados) };
  } catch {
    return null;
  }
}

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
  prompt: EntradaPrompt,
  temperatura: number,
  maxTokens: number,
  orc: Orcamento
): Promise<TentativaInterna> {
  const particoes = particionar(prompt); // P4.1.2
  let ultimoStatus: number | null = null;
  let ultimaCategoria: CategoriaFalhaCascata = "HTTP_4XX";
  let retentou5xx = false; // P2-2: no máximo 1 retry p/ erro transitório 5xx
  let retentou429 = false; // P2-2: no máximo 1 retry p/ 429 c/ Retry-After pequeno

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
            // P4.1.2: systemInstruction nativo (Constituição/contrato/cadeia)
            ...(particoes.system
              ? { systemInstruction: { parts: [{ text: particoes.system }] } }
              : {}),
            contents: [{ role: "user", parts: [{ text: particoes.user }] }],
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
        // P3.2: SUCCESS = texto + TÉRMINO aceitável. TRUNCATED_TOKEN_LIMIT
        // gera no máximo 1 continuação no MESMO modelo; sem orçamento →
        // mantém o parcial MARCADO (nunca silencioso).
        let termino = terminoDeRespostaGemini(dados);
        let textoFinal = gerado;
        if (termino.status === "TRUNCATED_TOKEN_LIMIT") {
          if (orc.restanteMs() >= ORCAMENTO_MINIMO_CONTINUACAO_MS) {
            console.log(`[motor-ia] Gemini ${modelo}: MAX_TOKENS — 1 continuação automática`);
            const cont = await continuarGemini(chave, modelo, prompt, gerado, temperatura, maxTokens, orc);
            if (cont) {
              textoFinal = juntarContinuacao(gerado, cont.texto);
              termino = cont.termino;
            } else {
              console.log("[motor-ia] Gemini: continuação falhou — parcial mantido marcado");
            }
          } else {
            console.log("[motor-ia] Gemini: MAX_TOKENS sem orçamento p/ continuação — parcial marcado");
          }
        }
        return {
          ok: true,
          texto: textoFinal,
          motor: `Gemini · ${modelo}`,
          provider: "Gemini",
          modelo,
          termino,
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
      // P2 Fase 2: 5xx transitório → 1 retentativa com espera curta.
      if (resposta.status >= 500 && !retentou5xx && orc.restanteMs() > ESPERA_5XX_MS + 5000) {
        retentou5xx = true;
        console.log(`[motor-ia] Gemini 5xx transitório — 1 retentativa em ${ESPERA_5XX_MS}ms`);
        await esperarRespeitando(ESPERA_5XX_MS, orc);
        continue;
      }
      // P2 Fase 2: 429 → só espera se Retry-After PEQUENO couber no orçamento.
      if (resposta.status === 429 && !retentou429) {
        const raMs = lerRetryAfterMs(resposta);
        if (valeEsperarRetryAfter(raMs, orc)) {
          retentou429 = true;
          console.log(`[motor-ia] Gemini 429 — Retry-After ${raMs}ms respeitado (1 retentativa)`);
          await esperarRespeitando(raMs, orc);
          continue;
        }
        console.log(`[motor-ia] Gemini 429 — sem Retry-After compatível (ausente ou grande): NÃO esperar`);
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
  prompt: EntradaPrompt,
  temperatura: number,
  maxTokens: number,
  preferencias: string[],
  rotulo: string,
  orc: Orcamento
): Promise<TentativaInterna> {
  const particoes = particionar(prompt); // P4.1.2
  let retentou5xx = false; // P2-2
  let retentou429 = false; // P2-2
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
          messages: [
            // P4.1.2: canal system nativo quando houver particionamento
            ...(particoes.system ? [{ role: "system", content: particoes.system }] : []),
            { role: "user", content: particoes.user },
          ],
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
          // P3.2: término canônico + no máximo 1 continuação automática
          let termino = terminoDeRespostaOpenAI(dados);
          let textoFinal = texto;
          if (termino.status === "TRUNCATED_TOKEN_LIMIT") {
            if (orc.restanteMs() >= ORCAMENTO_MINIMO_CONTINUACAO_MS) {
              console.log(`[motor-ia] ${rotulo} (${modelo}): length — 1 continuação automática`);
              const cont = await continuarOpenAICompativel(
                urlChat, chave, modelo, prompt, texto, temperatura, maxTokens, orc
              );
              if (cont) {
                textoFinal = juntarContinuacao(texto, cont.texto);
                termino = cont.termino;
              } else {
                console.log(`[motor-ia] ${rotulo}: continuação falhou — parcial mantido marcado`);
              }
            } else {
              console.log(`[motor-ia] ${rotulo}: length sem orçamento p/ continuação — parcial marcado`);
            }
          }
          return {
            ok: true,
            texto: textoFinal,
            motor: `${rotulo} · ${modelo}`,
            provider: rotulo,
            modelo,
            termino,
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
      // P2 Fase 2: 5xx transitório → 1 retentativa com espera curta.
      if (resposta.status >= 500 && !retentou5xx && orc.restanteMs() > ESPERA_5XX_MS + 5000) {
        retentou5xx = true;
        console.log(`[motor-ia] ${rotulo} 5xx transitório — 1 retentativa em ${ESPERA_5XX_MS}ms`);
        await esperarRespeitando(ESPERA_5XX_MS, orc);
        tentativa -= 1;
        continue;
      }
      // P2 Fase 2: 429 → Retry-After pequeno ou nada.
      if (resposta.status === 429 && !retentou429) {
        const raMs = lerRetryAfterMs(resposta);
        if (valeEsperarRetryAfter(raMs, orc)) {
          retentou429 = true;
          console.log(`[motor-ia] ${rotulo} 429 — Retry-After ${raMs}ms respeitado (1 retentativa)`);
          await esperarRespeitando(raMs, orc);
          tentativa -= 1;
          continue;
        }
        console.log(`[motor-ia] ${rotulo} 429 — sem Retry-After compatível: NÃO esperar`);
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
  prompt: EntradaPrompt,
  temperatura: number,
  maxTokens: number,
  orc: Orcamento
): Promise<
  | { ok: true; texto: string; termino: MetadadosTermino }
  | { ok: false; status: number; categoria: CategoriaFalhaCascata; retryAfterMs: number | null }
> {
  try {
    const partes = particionar(prompt); // P4.1.2
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
        messages: [
          ...(partes.system ? [{ role: "system", content: partes.system }] : []),
          { role: "user", content: partes.user },
        ],
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
        retryAfterMs: lerRetryAfterMs(resposta),