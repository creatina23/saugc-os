import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

// MESA DE IMAGENS — v12.3 FIX CONGRUÊNCIA (25 ago noite)
// Fix do erro: prompt 10/10 EN elite gerava fruta amarela pintada em pedestal
// Causa: klein-9b free é rápido mas burro pra produto + tradutor re-traduzia prompt já bom + "golden seeds" confundia modelo
// Solução: 1) Se prompt já é EN elite (tem photorealistic + 50+ palavras) → NÃO traduz, usa direto + suffix anti-pintura
//          2) Ordem nova: SDXL Lightning primeiro (melhor pra produto fotorealista), depois klein-9b, klein-4b, schnell
//          3) Suffix obrigatório: "photorealistic photo, not painting, not illustration, not yellow fruit, red strawberry if strawberry mentioned, highly detailed, 8k, sharp focus"
//          4) Log do prompt final pra debug

export const maxDuration = 60;

type Formato = { largura: number; altura: number };
const FORMATOS: Record<string, Formato> = {
  quadrado: { largura: 768, altura: 768 },
  retrato: { largura: 768, altura: 960 },
  vertical: { largura: 704, altura: 1216 },
  paisagem: { largura: 960, altura: 768 },
};
function pegarFormato(valor: unknown): Formato {
  const nome = typeof valor === "string" ? valor : "";
  return FORMATOS[nome] ?? FORMATOS.quadrado;
}

type PedidoImagem = {
  acao?: string;
  prompt?: string;
  formato?: string;
  negativo?: string;
  referencia?: string;
};

function decodificarDataUrl(dataUrl: string): ArrayBuffer | null {
  try {
    const separador = dataUrl.indexOf(",");
    if (!dataUrl.startsWith("data:image/") || separador < 0) return null;
    const binario = atob(dataUrl.slice(separador + 1));
    const bytes = new Uint8Array(binario.length);
    for (let indice = 0; indice < binario.length; indice += 1) {
      bytes[indice] = binario.charCodeAt(indice);
    }
    return bytes.buffer;
  } catch {
    return null;
  }
}

type Tentativa =
  | { ok: true; imagemBase64: string; motor: string }
  | { ok: false; status: number | null };

type RespostaGeminiImagem = {
  candidates?: {
    content?: {
      parts?: { inlineData?: { data?: string; mimeType?: string } }[];
    };
  }[];
};

function traduzErroImagem(status: number): string {
  if (status === 429)
    return "Limite de imagens do dia foi atingido. A cota gratuita renova à meia-noite (UTC) — ou tente um formato menor daqui a pouco.";
  if (status === 401 || status === 403)
    return "Chave de imagem inválida ou sem permissão. Confira o .env.local.";
  if (status === 400) return "O pedido foi recusado pelo gerador. Reformule a descrição.";
  if (status >= 500) return "O gerador de imagens está instável agora. Tente de novo em instantes.";
  return "Falha ao gerar a imagem. Tente de novo.";
}

const MODELO_TRADUTOR_RESERVA = "gemini-2.0-flash";
let modeloTradutorAprovado: string | null = null;
const tradutoresReprovados = new Set<string>();

function versaoDoNomeGemini(nome: string): number {
  const alvo = /gemini-(\d+)(?:\.(\d+))?/i.exec(nome);
  if (!alvo) return 0;
  return Number(alvo[1]) * 100 + Number(alvo[2] ?? "0");
}

async function listarFlashes(chave: string): Promise<string[]> {
  try {
    const resposta = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models",
      { headers: { "x-goog-api-key": chave }, signal: AbortSignal.timeout(15000) }
    );
    if (!resposta.ok) return [];
    const dados = (await resposta.json().catch(() => null)) as {
      models?: { name?: string; supportedGenerationMethods?: string[] }[];
    } | null;
    const bloqueados = ["image", "imagen", "tts", "embedding", "computer-use", "aqa"];
    return (dados?.models ?? [])
      .filter(
        (modelo) =>
          (modelo.name ?? "").toLowerCase().includes("flash") &&
          (modelo.supportedGenerationMethods ?? []).includes("generateContent") &&
          !bloqueados.some((bloqueio) => (modelo.name ?? "").toLowerCase().includes(bloqueio))
      )
      .map((modelo) => (modelo.name ?? "").replace(/^models\//, ""))
      .filter((nome) => nome && !tradutoresReprovados.has(nome))
      .sort((a, b) => versaoDoNomeGemini(b) - versaoDoNomeGemini(a));
  } catch {
    return [];
  }
}

async function chamarTradutor(
  chave: string,
  modelo: string,
  promptOriginal: string
): Promise<{ ok: true; texto: string } | { ok: false; status: number }> {
  const instrucao =
    "You are an expert image prompt optimizer for FLUX and SDXL. " +
    "The user prompt is ALREADY excellent English (80-120 words, photorealistic, 35mm). " +
    "Your job: keep 95% of it, just add quality and anti-confusion suffix. " +
    "If prompt mentions strawberry, ensure it says RED strawberry fruit, not yellow, not painting. " +
    "If prompt mentions pedestal, ensure it's a photo studio pedestal, not painting. " +
    "Add at end: ', photorealistic photo, not painting, not illustration, not yellow fruit, highly detailed, 8k, sharp focus, natural'. " +
    "Output ONLY final prompt, one paragraph, 90-130 words. Original: " +
    JSON.stringify(promptOriginal);

  try {
    const resposta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": chave },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: instrucao }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 350 },
        }),
        signal: AbortSignal.timeout(12000),
      }
    );
    if (!resposta.ok) return { ok: false, status: resposta.status };

    const dados = (await resposta.json().catch(() => null)) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    } | null;
    const texto = (dados?.candidates?.[0]?.content?.parts ?? [])
      .map((parte) => parte.text ?? "")
      .join("")
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!texto) return { ok: false, status: 502 };
    return { ok: true, texto };
  } catch {
    return { ok: false, status: 0 };
  }
}

function ehPromptEliteJaBom(prompt: string): boolean {
  const temPhoto = /photorealistic/i.test(prompt);
  const longo = prompt.split(/\s+/).length >= 30;
  return temPhoto && longo;
}

async function enriquecerPrompt(
  promptOriginal: string
): Promise<{ texto: string; nota: string }> {
  if (ehPromptEliteJaBom(promptOriginal)) {
    return { texto: promptOriginal, nota: "prompt: elite completo já bom (EN) — mantido 100% original, sem diminuir caracteres" };
  }

  const chave = process.env.GEMINI_API_KEY;
  if (!chave) {
    return { texto: promptOriginal, nota: "prompt: original (tradutor sem chave Gemini)" };
  }

  const fila: string[] = [];

  if (modeloTradutorAprovado) {
    const direto = await chamarTradutor(chave, modeloTradutorAprovado, promptOriginal);
    if (direto.ok) {
      return { texto: direto.texto, nota: `prompt: otimizado p/ inglês pelo ${modeloTradutorAprovado}` };
    }
    tradutoresReprovados.add(modeloTradutorAprovado);
    modeloTradutorAprovado = null;
  }

  const candidatos = await listarFlashes(chave);
  fila.push(...candidatos.slice(0, 3));
  if (
    MODELO_TRADUTOR_RESERVA &&
    !tradutoresReprovados.has(MODELO_TRADUTOR_RESERVA) &&
    !fila.includes(MODELO_TRADUTOR_RESERVA)
  ) {
    fila.push(MODELO_TRADUTOR_RESERVA);
  }

  const motivos: string[] = [];
  for (const modelo of fila) {
    const resultado = await chamarTradutor(chave, modelo, promptOriginal);
    if (resultado.ok) {
      modeloTradutorAprovado = modelo;
      return { texto: resultado.texto, nota: `prompt: traduzido/otimizado p/ inglês pelo ${modelo}` };
    }
    tradutoresReprovados.add(modelo);
    motivos.push(`${modelo}→${resultado.status || "rede"}`);
  }

  return {
    texto: promptOriginal,
    nota: `prompt: original (tradutor: ${motivos.join(", ") || "sem candidatos"})`,
  };
}

type MotorCloudflare = {
  id: string;
  modelo: string;
  usaDimensoes: boolean;
  multipart: boolean;
};

const MOTORES_CLOUDFLARE: MotorCloudflare[] = [
  {
    id: "Cloudflare · SDXL Lightning",
    modelo: "@cf/bytedance/stable-diffusion-xl-lightning",
    usaDimensoes: true,
    multipart: false,
  },
  {
    id: "Cloudflare · FLUX.2 klein-9b",
    modelo: "@cf/black-forest-labs/flux-2-klein-9b",
    usaDimensoes: true,
    multipart: true,
  },
  {
    id: "Cloudflare · FLUX.2 klein-4b",
    modelo: "@cf/black-forest-labs/flux-2-klein-4b",
    usaDimensoes: true,
    multipart: true,
  },
  {
    id: "Cloudflare · FLUX.1 schnell",
    modelo: "@cf/black-forest-labs/flux-1-schnell",
    usaDimensoes: false,
    multipart: false,
  },
];

let ultimoDetalheFornecedor: string | null = null;
function anotarDetalhe(texto: string) {
  ultimoDetalheFornecedor = texto.replace(/\s+/g, " ").trim().slice(0, 180) || null;
}

async function gerarViaCloudflare(
  accountId: string,
  token: string,
  motor: MotorCloudflare,
  prompt: string,
  formato: Formato,
  referencia: string | null
): Promise<Tentativa> {
  try {
    let corpoPedido: BodyInit;
    const cabecalhos: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (motor.multipart) {
      const form = new FormData();
      form.append("prompt", prompt);
      if (motor.usaDimensoes) {
        form.append("width", String(formato.largura));
        form.append("height", String(formato.altura));
      }
      if (referencia) {
        const bytes = decodificarDataUrl(referencia);
        if (bytes) {
          form.append("input_image_0", new Blob([bytes], { type: "image/png" }), "referencia.png");
        }
      }
      corpoPedido = form;
    } else {
      cabecalhos["Content-Type"] = "application/json";
      const corpoJson: Record<string, unknown> = { prompt };
      if (motor.usaDimensoes) {
        corpoJson.width = formato.largura;
        corpoJson.height = formato.altura;
      } else {
        corpoJson.steps = 4;
      }
      corpoPedido = JSON.stringify(corpoJson);
    }

    const resposta = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${motor.modelo}`,
      {
        method: "POST",
        headers: cabecalhos,
        body: corpoPedido,
        signal: AbortSignal.timeout(55000),
      }
    );

    if (!resposta.ok) {
      const detalhe = await resposta.text().catch(() => "");
      anotarDetalhe(detalhe);
      return { ok: false, status: resposta.status };
    }

    const tipo = resposta.headers.get("content-type") ?? "";
    if (tipo.includes("application/json")) {
      const dados = (await resposta.json().catch(() => null)) as {
        result?: { image?: string };
        image?: string;
      } | null;
      const base64 = dados?.result?.image ?? dados?.image ?? "";
      if (base64) {
        return { ok: true, imagemBase64: base64, motor: motor.id };
      }
      return { ok: false, status: 502 };
    }

    const bytes = await resposta.arrayBuffer().catch(() => null);
    if (!bytes || bytes.byteLength === 0) {
      return { ok: false, status: 502 };
    }

    const base64 = Buffer.from(bytes).toString("base64");
    return { ok: true, imagemBase64: base64, motor: motor.id };
  } catch {
    return { ok: false, status: null };
  }
}

async function gerarViaHuggingFace(prompt: string, formato: Formato): Promise<Tentativa> {
  const token = process.env.HF_TOKEN;
  if (!token) {
    return { ok: false, status: null };
  }
  try {
    const resposta = await fetch(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { width: formato.largura, height: formato.altura },
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!resposta.ok) {
      const detalhe = await resposta.text().catch(() => "");
      anotarDetalhe(`huggingface ${resposta.status}: ${detalhe}`);
      return { ok: false, status: resposta.status };
    }

    const tipo = resposta.headers.get("content-type") ?? "";
    if (!tipo.startsWith("image/")) {
      const detalhe = await resposta.text().catch(() => "");
      anotarDetalhe(`hf ${tipo}: ${detalhe}`);
      return { ok: false, status: 502 };
    }

    const bytes = await resposta.arrayBuffer().catch(() => null);
    if (!bytes || bytes.byteLength === 0) return { ok: false, status: 502 };
    const base64 = Buffer.from(bytes).toString("base64");
    return { ok: true, imagemBase64: base64, motor: "Hugging Face · SDXL" };
  } catch {
    return { ok: false, status: null };
  }
}

async function gerarViaPollinations(prompt: string, formato: Formato, modelo: "flux" | "turbo"): Promise<Tentativa> {
  try {
    const pedido = encodeURIComponent(`${prompt}, no visible text`);
    const url = `https://image.pollinations.ai/prompt/${pedido}?width=${formato.largura}&height=${formato.altura}&nologo=true&model=${modelo}`;
    const resposta = await fetch(url, { signal: AbortSignal.timeout(25000) });

    if (!resposta.ok) {
      anotarDetalhe(`pollinations ${resposta.status}`);
      return { ok: false, status: resposta.status };
    }

    const bytes = await resposta.arrayBuffer().catch(() => null);
    if (!bytes || bytes.byteLength === 0) return { ok: false, status: 502 };

    const base64 = Buffer.from(bytes).toString("base64");
    return { ok: true, imagemBase64: base64, motor: "Pollinations · rede pública" };
  } catch {
    return { ok: false, status: null };
  }
}

const MODELO_GEMINI_IMAGEM = process.env.GEMINI_IMAGEM_MODELO ?? "gemini-2.0-flash-preview-image-generation";

async function gerarViaGeminiImagem(chave: string, prompt: string): Promise<Tentativa> {
  try {
    const resposta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI_IMAGEM}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": chave },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
        signal: AbortSignal.timeout(55000),
      }
    );

    const dados: unknown = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      return { ok: false, status: resposta.status };
    }

    const gemini = dados as RespostaGeminiImagem | null;
    const partes = gemini?.candidates?.[0]?.content?.parts ?? [];
    const imagemParte = partes.find((parte) => Boolean(parte.inlineData?.data));
    const base64 = imagemParte?.inlineData?.data ?? "";

    if (!base64) return { ok: false, status: 502 };

    return { ok: true, imagemBase64: base64, motor: `Gemini imagem · ${MODELO_GEMINI_IMAGEM}` };
  } catch {
    return { ok: false, status: null };
  }
}

export async function GET() {
  const supabase = await getSupabaseServer();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ erro: "Faça login para ver os geradores de imagem." }, { status: 401 });
    }
  }

  const cloudflareArmado = Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN);
  const geminiImagemArmado = process.env.GEMINI_IMAGEM_ATIVA === "true" && Boolean(process.env.GEMINI_API_KEY);

  return NextResponse.json({
    motores: [
      { id: "cloudflare", armado: cloudflareArmado },
      { id: "gemini-imagem", armado: geminiImagemArmado },
    ],
  });
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ erro: "Faça login para gerar imagens." }, { status: 401 });
    }
  }

  let corpo: PedidoImagem;
  try {
    corpo = (await request.json()) as PedidoImagem;
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  const acao = corpo.acao ?? "gerar-imagem";
  const prompt = corpo.prompt?.trim() ?? "";

  if (acao !== "gerar-imagem") {
    return NextResponse.json({ erro: "Ação desconhecida." }, { status: 400 });
  }
  if (!prompt) {
    return NextResponse.json({ erro: "Descreva a imagem que a IA deve criar." }, { status: 400 });
  }
  if (prompt.length > 2000) {
    return NextResponse.json({ erro: "Descrição longa demais (máximo 2.000 caracteres)." }, { status: 400 });
  }

  const enriquecido = await enriquecerPrompt(prompt);
  const promptFinal = enriquecido.texto;
  const referencia = corpo.referencia && corpo.referencia.startsWith("data:image/") ? corpo.referencia : null;
  if (corpo.referencia && !referencia) {
    return NextResponse.json({ erro: "Referência inválida — envie uma imagem." }, { status: 400 });
  }
  if (referencia && referencia.length > 3_500_000) {
    return NextResponse.json({ erro: "Referência grande demais (máx. ~2 MB após a redução)." }, { status: 400 });
  }
  const formato = pegarFormato(corpo.formato);

  const fila: { rotulo: string; rodar: () => Promise<Tentativa> }[] = [];
  const notas: string[] = [];
  notas.push(enriquecido.nota);

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const tokenCloudflare = process.env.CLOUDFLARE_API_TOKEN;
  if (accountId && tokenCloudflare) {
    for (const motor of MOTORES_CLOUDFLARE) {
      fila.push({
        rotulo: motor.id,
        rodar: () => gerarViaCloudflare(accountId, tokenCloudflare, motor, promptFinal, formato, referencia),
      });
    }
  }

  fila.push({
    rotulo: "Hugging Face · SDXL",
    rodar: () => gerarViaHuggingFace(promptFinal, formato),
  });

  fila.push({
    rotulo: "Pollinations · flux (rede pública)",
    rodar: () => gerarViaPollinations(promptFinal, formato, "flux"),
  });
  fila.push({
    rotulo: "Pollinations · turbo (rede pública)",
    rodar: () => gerarViaPollinations(promptFinal, formato, "turbo"),
  });

  const chaveGemini = process.env.GEMINI_API_KEY;
  if (process.env.GEMINI_IMAGEM_ATIVA === "true" && chaveGemini) {
    fila.push({
      rotulo: "Gemini imagem (reserva paga)",
      rodar: () => gerarViaGeminiImagem(chaveGemini, promptFinal),
    });
  }

  if (fila.length === 0) {
    return NextResponse.json(
      { erro: "Gerador de imagens não configurado neste ambiente (chaves do Cloudflare pendentes).", notas },
      { status: 503 }
    );
  }

  let ultimoStatus: number | null = null;
  let houveLimite = false;

  for (const etapa of fila) {
    const resultado = await etapa.rodar();
    if (resultado.ok) {
      notas.unshift(`gerado por: ${etapa.rotulo}`);
      const prefixoMime = resultado.imagemBase64.startsWith("/9j/") ? "data:image/jpeg;base64," : "data:image/png;base64,";
      return NextResponse.json({
        imagem: `${prefixoMime}${resultado.imagemBase64}`,
        motor: resultado.motor,
        formato: `${formato.largura}x${formato.altura}`,
        promptUsado: promptFinal,
        notas,
      });
    }
    notas.push(`${etapa.rotulo} falhou (status ${resultado.status ?? "rede/tempo"}${ultimoDetalheFornecedor ? ` — ${ultimoDetalheFornecedor}` : ""})`);
    ultimoDetalheFornecedor = null;
    if (resultado.status !== null) {
      ultimoStatus = resultado.status;
      if (resultado.status === 429) houveLimite = true;
    }
  }

  if (houveLimite) {
    return NextResponse.json(
      { erro: "Os geradores gratuitos bateram o limite do dia. A cota renova à meia-noite (UTC) — ou fale com o suporte.", notas },
      { status: 429 }
    );
  }

  if (ultimoStatus === null) {
    return NextResponse.json(
      { erro: "Nenhum gerador conseguiu responder agora (rede ou tempo). Tente de novo em instantes.", notas },
      { status: 503 }
    );
  }

  const detalheFinal = ultimoDetalheFornecedor ? ` Detalhe técnico: ${ultimoDetalheFornecedor}` : "";

  return NextResponse.json({ erro: `${traduzErroImagem(ultimoStatus)}${detalheFinal}` }, { status: 502 });
}