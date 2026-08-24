import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

// MESA DE MOTORES — a IA da AnuncIA nunca morre.
// ------------------------------------------------------------------
// Route Handler (roda SÓ no servidor). Chaves JAMAIS vão pro navegador.
//
// CADEIA DE RESERVAS (texto), na ordem — um falha, o próximo assume:
//   1) Gemini (titular) — AUTODESCOBERTA + hall dos reprovados iguais
//      ao motor original: lista os modelos da chave, ordena os "flash"
//      do mais novo pro mais velho, fixa o primeiro que responde 200.
//   2) GitHub Models (GPT-4o) — grátis com a conta GitHub
//   3) Groq (Llama 3.3 70B) — velocidade, cota diária generosa
//   4) OpenRouter (modelo :free) — rota de fuga completa
//
// • SKIP GRACIOSO: camada sem chave é pulada em silêncio (só log).
//   Sem chave nova nenhuma, o app se comporta exatamente como antes.
// • GET /api/ia = espelho da mesa: quais motores têm chave plantada
//   booleanos, zero segredo) — alimenta os cartões do IA Studio.
// • A resposta de sucesso carrega "motor": quem de fato respondeu.
//   As telas de hoje ignoram esse campo com segurança.
// • Só atende usuário logado: protege as cotas gratuitas de estranhos.
// • Logs [motor-ia] aparecem só no TERMINAL do servidor.
// • (Sprint 019) DETALHE TÉCNICO NA TELA: o motivo real do último erro
//   (sanitizado, sem segredo) viaja na resposta final — a mesma verdade
//   visível que curou a Mesa de Imagens. Erro mudo é coisa do passado.

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

// (Sprint 019) O motivo REAL do último erro — sanitizado, sem segredo.
let ultimoDetalheMotorIA: string | null = null;

function anotarDetalheIA(texto: unknown) {
  const bruto = typeof texto === "string" ? texto : JSON.stringify(texto) ?? "";
  ultimoDetalheMotorIA = bruto.replace(/\s+/g, " ").trim().slice(0, 180) || null;
}

// ---------- Os motores de reserva (mesmo formato OpenAI-compatível) ----------

type MotorReserva = {
  id: string; // rótulo que viaja na resposta ("motor": ...)
  nome: string; // pros logs do terminal
  env: string; // variável de ambiente da chave (server-side)
  url: string;
  modelo: string; // se o provedor aposentar, troca SÓ esta linha
  extraHeaders?: Record<string, string>;
};

const RESERVAS: MotorReserva[] = [
  {
    id: "GitHub Models · GPT-4o",
    nome: "GitHub Models",
    env: "GITHUB_MODELS_TOKEN",
    url: "https://models.github.ai/inference/chat/completions",
    modelo: "openai/gpt-4o",
  },
  {
    id: "Groq · Llama 3.3 70B",
    nome: "Groq",
    env: "GROQ_API_KEY",
    url: "https://api.groq.com/openai/v1/chat/completions",
    modelo: "llama-3.3-70b-versatile",
  },
  {
    id: "OpenRouter · Llama 3.3 70B free",
    nome: "OpenRouter",
    env: "OPENROUTER_API_KEY",
    url: "https://openrouter.ai/api/v1/chat/completions",
    modelo: "meta-llama/llama-3.3-70b-instruct:free",
    extraHeaders: {
      "HTTP-Referer": "https://anuncia-three.vercel.app",
      "X-Title": "AnuncIA",
    },
  },
];

type PedidoIA = {
  acao?: string;
  prompt?: string;
  temperatura?: number;
  maxTokens?: number;
};

// Resultado padronizado de qualquer tentativa de motor
type Tentativa =
  | { ok: true; texto: string; motor: string }
  | { ok: false; status: number | null };

type ParteGemini = { text?: string };
type RespostaGemini = {
  candidates?: { content?: { parts?: ParteGemini[] } }[];
};

type ModeloGemini = {
  name?: string;
  supportedGenerationMethods?: string[];
};

type RespostaOpenAI = { choices?: { message?: { content?: string } }[] };

// Extrai a versão numérica do nome ("gemini-2.5-flash" → 250, "gemini-3-flash" → 300)
// pra ordenar do mais novo pro mais velho.
function versaoDoModelo(nome: string): number {
  const alvo = /gemini-(\d+)(?:\.(\d+))?/i.exec(nome);
  if (!alvo) return 0;
  return Number(alvo[1]) * 100 + Number(algo2(alvo));
}

// pequena guarda contra grupo ausente
function algo2(alvo: RegExpExecArray): string {
  return alvo[2] ?? "0";
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

// Pergunta ao Google os modelos da chave e escolhe o melhor candidato,
// ignorando especialidades e reprovados anteriores.
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

// ---------- Camada 1: Gemini (titular) ----------

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
          anotarDetalheIA(dados); // (Sprint 019)
          ultimoStatus = 502;
          break;
        }
        modeloAprovado = modelo;
        console.log(`[motor-ia] Gemini aprovado e fixado: ${modelo}`);
        return { ok: true, texto: gerado, motor: `Gemini · ${modelo}` };
      }

      ultimoStatus = resposta.status;
      anotarDetalheIA(dados); // (Sprint 019) o motivo viaja pra tela
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
      break; // demais erros: desfila pro reserva
    } catch (excecao) {
      console.error("[motor-ia] Exceção ao chamar o Gemini:", excecao);
      ultimoStatus = null; // timeout/rede — tenta o próximo motor
      break;
    }
  }

  return { ok: false, status: ultimoStatus };
}

// ---------- Camadas 2–4: reservas OpenAI-compatíveis ----------

async function gerarViaReserva(
  reserva: MotorReserva,
  prompt: string,
  temperatura: number,
  maxTokens: number
): Promise<Tentativa> {
  const chave = process.env[reserva.env];
  if (!chave) {
    console.log(`[motor-ia] ${reserva.nome}: sem chave (${reserva.env}) — pulando`);
    return { ok: false, status: null };
  }

  try {
    const resposta = await fetch(reserva.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${chave}`,
        ...(reserva.extraHeaders ?? {}),
      },
      body: JSON.stringify({
        model: reserva.modelo,
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
        console.log(`[motor-ia] ${reserva.nome} respondeu (${reserva.modelo})`);
        return { ok: true, texto, motor: reserva.id };
      }
      console.error(
        `[motor-ia] ${reserva.nome} respondeu sem texto. detalhe:`,
        JSON.stringify(dados)?.slice(0, 600)
      );
      anotarDetalheIA(dados); // (Sprint 019)
      return { ok: false, status: 502 };
    }

    anotarDetalheIA(dados); // (Sprint 019) o motivo viaja pra tela
    console.error(
      `[motor-ia] ${reserva.nome} recusou. status:`,
      resposta.status,
      "| detalhe:",
      JSON.stringify(dados)?.slice(0, 600)
    );
    return { ok: false, status: resposta.status };
  } catch (excecao) {
    console.error(`[motor-ia] Exceção ao chamar ${reserva.nome}:`, excecao);
    return { ok: false, status: null };
  }
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

  // Só booleanos — NUNCA as chaves
  return NextResponse.json({
    motores: [
      { id: "gemini", armado: Boolean(process.env.GEMINI_API_KEY) },
      { id: "github", armado: Boolean(process.env.GITHUB_MODELS_TOKEN) },
      { id: "groq", armado: Boolean(process.env.GROQ_API_KEY) },
      { id: "openrouter", armado: Boolean(process.env.OPENROUTER_API_KEY) },
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

  // 3) Monta a fila: Gemini (se tiver chave) + cada reserva com chave plantada
  const fila: (() => Promise<Tentativa>)[] = [];

  const chaveGemini = process.env.GEMINI_API_KEY;
  if (chaveGemini) {
    fila.push(() => gerarViaGemini(chaveGemini, prompt, temperatura, maxTokens));
  } else {
    console.log("[motor-ia] sem GEMINI_API_KEY — indo direto pros reservas");
  }

  for (const reserva of RESERVAS) {
    if (process.env[reserva.env]) {
      fila.push(() => gerarViaReserva(reserva, prompt, temperatura, maxTokens));
    } else {
      console.log(`[motor-ia] ${reserva.nome}: sem chave (${reserva.env}) — fora da fila`);
    }
  }

  if (fila.length === 0) {
    return NextResponse.json(
      { erro: "IA não configurada neste ambiente (nenhuma chave plantada)." },
      { status: 503 }
    );
  }

  // 4) Desfila até um responder
  let ultimoStatus: number | null = null;
  let houveLimite = false;

  for (const tentar of fila) {
    const resultado = await tentar();
    if (resultado.ok) {
      return NextResponse.json({ texto: resultado.texto, motor: resultado.motor });
    }
    if (resultado.status !== null) {
      ultimoStatus = resultado.status;
      if (resultado.status === 429) houveLimite = true;
    }
  }

  // 5) Todos falharam — confessa em PT-BR (com o detalhe REAL, Sprint 019)
  console.error("[motor-ia] TODOS os motores falharam. último status:", ultimoStatus);

  if (houveLimite) {
    return NextResponse.json(
      {
        erro:
          "Todos os motores gratuitos bateram o limite agora. Aguarde 1 minuto e tente de novo — a cota volta sozinha.",
      },
      { status: 429 }
    );
  }

  if (ultimoStatus === null) {
    return NextResponse.json(
      {
        erro:
          "Nenhum motor de IA conseguiu responder agora (rede ou tempo). Tente de novo em instantes.",
      },
      { status: 503 }
    );
  }

  const detalheFinal = ultimoDetalheMotorIA
    ? ` Detalhe técnico: ${ultimoDetalheMotorIA}`
    : "";

  return NextResponse.json(
    { erro: `${traduzErroIA(ultimoStatus)}${detalheFinal}` },
    { status: 502 }
  );
}
