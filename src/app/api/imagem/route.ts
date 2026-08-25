import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

// MESA DE IMAGENS — o criativo estático nasce DENTRO da AnuncIA. (Sprint 019)
// ------------------------------------------------------------------
// Route Handler (roda SÓ no servidor). Chaves JAMAIS vão pro navegador.
//
// CADEIA (imagem), na ordem — um falha, o próximo assume:
//   1) Cloudflare Workers AI · FLUX.2 klein-9b (titular) — aceita
//      largura/altura (256–1920) e, no futuro, imagens de referência.
//      Neurônios grátis do plano free: 10.000/dia (reseta 00:00 UTC).
//      Fatos verificados em 23 ago 2026 (docs Cloudflare): o
//      flux-1-schnell SÓ aceita prompt+steps no schema — dimensões
//      extras dão erro 400 (caçado e corrigido na prática).
//   2) Cloudflare Workers AI · FLUX.1 schnell (reserva) — schema
//      mínimo: só { prompt, steps }. Gera no tamanho padrão dele.
//   3) Gemini imagem (reserva PAGA) — DESLIGADA POR PADRÃO.
//      Só acorda se GEMINI_IMAGEM_ATIVA="true" E houver GEMINI_API_KEY.
//      Ninguém liga sem cliente pagando a conta (decisão em ata, 20 ago).
//
// • SKIP GRACIOSO: camada sem chave é pulada em silêncio (só log) —
//   igual à Mesa de texto. Sem chaves novas, o app segue como antes.
// • GET /api/imagem = espelho: quais motores de imagem têm chave
//   (booleanos, zero segredo) — alimentará os cartões do IA Studio.
// • Resposta de sucesso: { imagem: "data:image/png;base64,..." , motor }.
//   A tela joga direto num <img> e (Fase 4) salva no bucket Mídias.
// • Só atende usuário logado: protege os ~230 créditos/dia da casa.
// • Cota do dia é da CASA (compartilhada) — medição por usuário vem na
//   Sprint de assinatura (anotado em ata como URGENTE).
// • Logs [motor-imagem] aparecem só no TERMINAL do servidor.

// Vercel Hobby corta a função em 10s por padrão — imagem pede fôlego.
export const maxDuration = 60;

// ---------- Formatos prontos (evita queimar neurônios com tamanho maluco) ----------

type Formato = { largura: number; altura: number };

const FORMATOS: Record<string, Formato> = {
  quadrado: { largura: 768, altura: 768 }, // feed 1:1
  retrato: { largura: 768, altura: 960 }, // feed 4:5
  vertical: { largura: 704, altura: 1216 }, // stories/reels 9:16
  paisagem: { largura: 960, altura: 768 }, // banners 5:4
};

function pegarFormato(valor: unknown): Formato {
  const nome = typeof valor === "string" ? valor : "";
  return FORMATOS[nome] ?? FORMATOS.quadrado;
}

// ---------- Pedidos e resultados ----------

type PedidoImagem = {
  acao?: string;
  prompt?: string;
  formato?: string;
  negativo?: string;
  referencia?: string; // data URL (data:image/...;base64) — o produto/estilo de referência
};

// Decodifica um data URL de imagem em ArrayBuffer puro (pra anexar no
// multipart). Usa atob — padrão do runtime — em vez de Buffer: a
// tipagem do Buffer (ArrayBufferLike) não casa com BlobPart do DOM.
function decodificarDataUrl(dataUrl: string): ArrayBuffer | null {
  try {
    const separador = dataUrl.indexOf(",");
    if (!dataUrl.startsWith("data:image/") || separador < 0) return null;
    const binario = atob(dataUrl.slice(separador + 1));
    const bytes = new Uint8Array(binario.length);
    for (let indice = 0; indice < binario.length; indice += 1) {
      bytes[indice] = binario.charCodeAt(indice);
    }
    return bytes.buffer; // ArrayBuffer puro — BlobPart válido
  } catch {
    return null;
  }
}

// Resultado padronizado de qualquer tentativa de motor de imagem
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

// ---------- Enriquecimento de prompt: PT solto → EN denso (Sprint 019) ----------
// A Mesa de TEXTO trabalha pra Mesa de IMAGEM: o Gemini (grátis, já
// plantado) transforma a descrição em português num prompt curto e
// denso em INGLÊS (os modelos de imagem entendem inglês muito melhor).
// Se o tradutor falhar ou não tiver chave, segue o texto ORIGINAL —
// o enriquecimento NUNCA derruba a geração.

// (Lição 9 da casa: modelo IA aposentado → autodescoberta; NUNCA nome fixo.
// E padrão da Mesa de texto (Sprint 011): candidato só é aprovado DEPOIS
// de responder 200 na prática — os recusados (503 de preview, 404 de
// aposentado…) vão pro hall e nunca mais são tentados no mesmo boot.)
const MODELO_TRADUTOR_RESERVA = "gemini-2.0-flash";
let modeloTradutorAprovado: string | null = null; // fixado só após 200 real
const tradutoresReprovados = new Set<string>();

function versaoDoNomeGemini(nome: string): number {
  const alvo = /gemini-(\d+)(?:\.(\d+))?/i.exec(nome);
  if (!alvo) return 0;
  return Number(alvo[1]) * 100 + Number(alvo[2] ?? "0");
}

// Lista os modelos de TEXTO da chave, ordenados do mais novo pro mais velho,
// já fora os reprovados deste boot.
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

// Uma tentativa de tradução num modelo específico — ELITE v2 (120w + qualidade).
async function chamarTradutor(
  chave: string,
  modelo: string,
  promptOriginal: string
): Promise<{ ok: true; texto: string } | { ok: false; status: number }> {
  const instrucao =
    "You are an expert image prompt translator for FLUX and SDXL. " +
    "Turn this description (PT-BR or EN) into a highly detailed, dense English image prompt. " +
    "Structure: subject + action + environment + lighting (soft natural window light) + camera (35mm lens, shallow depth of field, eye-level) + style (photorealistic, highly detailed, natural skin texture, 8k, UGC style if needed) + composition + mood. " +
    "Add quality boosters: highly detailed, photorealistic, natural lighting, clean, sharp focus. " +
    "NEVER include text, letters, words in image. " +
    "Output ONLY the final prompt, one paragraph, 80-120 words, ready to paste. Description: " +
    JSON.stringify(promptOriginal);

  try {
    const resposta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": chave },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: instrucao }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 300 },
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
    return { ok: false, status: 0 }; // rede/tempo
  }
}

// Enriquece com o padrão da Mesa: aprovado fixo → senão desfila candidatos
// (máx. 3 por chamada) até um responder 200. Motivos vão pra nota do painel.
async function enriquecerPrompt(
  promptOriginal: string
): Promise<{ texto: string; nota: string }> {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) {
    return { texto: promptOriginal, nota: "prompt: original (tradutor sem chave Gemini)" };
  }

  const fila: string[] = [];

  if (modeloTradutorAprovado) {
    // caminho feliz: modelo já provado neste boot
    const direto = await chamarTradutor(chave, modeloTradutorAprovado, promptOriginal);
    if (direto.ok) {
      return { texto: direto.texto, nota: `prompt: traduzido p/ inglês pelo ${modeloTradutorAprovado}` };
    }
    tradutoresReprovados.add(modeloTradutorAprovado);
    console.log(`[motor-imagem] tradutor fixado caiu (${direto.status}) — reprovando e redescobrindo`);
    modeloTradutorAprovado = null;
  }

  const candidatos = await listarFlashes(chave);
  fila.push(...candidatos.slice(0, 3));
  if (
    MODELO_TRADUTOR_RESERVA &&
    !tradutoresReprovados.has(MODELO_TRADUTOR_RESERVA) &&
    !fila.includes(MODELO_TRADUTOR_RESERVA)
  ) {
    fila.push(MODELO_TRADUTOR_RESERVA); // a reserva entra por último, como manda a casa
  }

  const motivos: string[] = [];
  for (const modelo of fila) {
    const resultado = await chamarTradutor(chave, modelo, promptOriginal);
    if (resultado.ok) {
      modeloTradutorAprovado = modelo;
      console.log(`[motor-imagem] tradutor aprovado e fixado: ${modelo}`);
      return { texto: resultado.texto, nota: `prompt: traduzido p/ inglês pelo ${modelo}` };
    }
    tradutoresReprovados.add(modelo);
    motivos.push(`${modelo}→${resultado.status || "rede"}`);
    console.log(`[motor-imagem] tradutor ${modelo} recusou (${resultado.status || "rede"})`);
  }

  return {
    texto: promptOriginal,
    nota: `prompt: original (tradutor: ${motivos.join(", ") || "sem candidatos"})`,
  };
}

// ---------- Camada 1: Cloudflare Workers AI (titular klein + reserva schnell) ----------

// Cada modelo tem schema PRÓPRIO no Workers AI — o corpo do pedido é
// montado exatamente como o schema manda (nada de campo extra: vira 400).
type MotorCloudflare = {
  id: string; // rótulo que viaja na resposta ("motor": ...)
  modelo: string; // caminho do modelo na URL
  usaDimensoes: boolean; // klein aceita width/height; schnell NÃO aceita
  multipart: boolean; // klein EXIGE formulário (multipart); schnell aceita JSON
};

const MOTORES_CLOUDFLARE: MotorCloudflare[] = [
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
    id: "Cloudflare · SDXL Lightning",
    modelo: "@cf/stability/stable-diffusion-xl-lightning",
    usaDimensoes: true, // aceita width/height — e gasta MENOS neurônios que o klein
    multipart: false,
  },
  {
    id: "Cloudflare · FLUX.1 schnell",
    modelo: "@cf/black-forest-labs/flux-1-schnell",
    usaDimensoes: false,
    multipart: false,
  },
];

// O motivo REAL do último erro do fornecedor (sanitizado) — vai pro
// "Detalhe técnico:" da resposta, dedo-duro da casa (nunca segredo).
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
      // Fato caçado no diagnóstico (23 ago): os FLUX.2 klein EXIGEM
      // multipart/form-data — JSON dá 400 ("required properties 'multipart'").
      const form = new FormData();
      form.append("prompt", prompt);
      if (motor.usaDimensoes) {
        form.append("width", String(formato.largura));
        form.append("height", String(formato.altura));
      }
      if (referencia) {
        // Referência do dono (produto/estilo) — o klein aceita até 4
        // (input_image_0..3, cada <512×512 — o navegador já reduz antes).
        const bytes = decodificarDataUrl(referencia);
        if (bytes) {
          form.append("input_image_0", new Blob([bytes], { type: "image/png" }), "referencia.png");
        }
      }
      corpoPedido = form; // o fetch gera o multipart com boundary certinho
    } else {
      cabecalhos["Content-Type"] = "application/json";
      const corpoJson: Record<string, unknown> = { prompt };
      if (motor.usaDimensoes) {
        corpoJson.width = formato.largura; // SDXL: dimensões via JSON
        corpoJson.height = formato.altura;
      } else {
        corpoJson.steps = 4; // schema do schnell: só prompt e steps
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
      console.error(
        `[motor-imagem] ${motor.id} recusou. status:`,
        resposta.status,
        "| detalhe:",
        detalhe.slice(0, 600)
      );
      return { ok: false, status: resposta.status };
    }

    // O REST do Cloudflare devolve a imagem em bytes; por robustez,
    // aceitamos também JSON com base64 (defensivo, sem adivinhar demais).
    const tipo = resposta.headers.get("content-type") ?? "";
    if (tipo.includes("application/json")) {
      const dados = (await resposta.json().catch(() => null)) as {
        result?: { image?: string };
        image?: string;
      } | null;
      const base64 = dados?.result?.image ?? dados?.image ?? "";
      if (base64) {
        console.log(`[motor-imagem] ${motor.id} respondeu (json)`);
        return { ok: true, imagemBase64: base64, motor: motor.id };
      }
      console.error("[motor-imagem] Cloudflare devolveu JSON sem imagem");
      return { ok: false, status: 502 };
    }

    const bytes = await resposta.arrayBuffer().catch(() => null);
    if (!bytes || bytes.byteLength === 0) {
      console.error("[motor-imagem] Cloudflare devolveu vazio");
      return { ok: false, status: 502 };
    }

    const base64 = Buffer.from(bytes).toString("base64");
    console.log(
      `[motor-imagem] ${motor.id} respondeu (${Math.round(bytes.byteLength / 1024)} KB, ${motor.usaDimensoes ? `${formato.largura}x${formato.altura}` : "tamanho padrão do modelo"})`
    );
    return { ok: true, imagemBase64: base64, motor: motor.id };
  } catch (excecao) {
    console.error("[motor-imagem] Exceção ao chamar o Cloudflare:", excecao);
    return { ok: false, status: null };
  }
}

// ---------- Camada extra: Hugging Face (cota free SEPARADA) ----------
// Bucket de cota próprio (~80 imagens/mês no free) — precisa só de um
// token grátis (hf.co/settings/tokens) plantado como HF_TOKEN. Sem
// token: pulado em silêncio, como manda a casa. (Sprint 019, v12)

async function gerarViaHuggingFace(
  prompt: string,
  formato: Formato
): Promise<Tentativa> {
  const token = process.env.HF_TOKEN;
  if (!token) {
    console.log("[motor-imagem] Hugging Face: sem HF_TOKEN — pulando");
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
          parameters: {
            width: formato.largura,
            height: formato.altura,
          },
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!resposta.ok) {
      const detalhe = await resposta.text().catch(() => "");
      anotarDetalhe(`huggingface ${resposta.status}: ${detalhe}`);
      console.error("[motor-imagem] Hugging Face recusou. status:", resposta.status);
      return { ok: false, status: resposta.status };
    }

    const tipo = resposta.headers.get("content-type") ?? "";
    if (!tipo.startsWith("image/")) {
      // HF devolve JSON quando dá errado (fila cheia, modelo dormindo)
      const detalhe = await resposta.text().catch(() => "");
      anotarDetalhe(`huggingface devolveu ${tipo || "sem tipo"}: ${detalhe}`);
      console.error("[motor-imagem] Hugging Face devolveu não-imagem:", detalhe.slice(0, 300));
      return { ok: false, status: 502 };
    }

    const bytes = await resposta.arrayBuffer().catch(() => null);
    if (!bytes || bytes.byteLength === 0) {
      return { ok: false, status: 502 };
    }
    const base64 = Buffer.from(bytes).toString("base64");
    console.log(`[motor-imagem] Hugging Face SDXL respondeu (${Math.round(bytes.byteLength / 1024)} KB)`);
    return { ok: true, imagemBase64: base64, motor: "Hugging Face · SDXL" };
  } catch (excecao) {
    console.error("[motor-imagem] Exceção no Hugging Face:", excecao);
    return { ok: false, status: null };
  }
}

// ---------- Camada pública: Pollinations (sem chave, sem cota) ----------
// Última linha de defesa: quando TODOS os Cloudflare batem a cota do dia
// (429), a rede pública segura — sem chave e sem cota, mas com fila pública
// e marca d'água possível. O rótulo confessa: "rede pública". (Sprint 019)

async function gerarViaPollinations(
  prompt: string,
  formato: Formato,
  modelo: "flux" | "turbo"
): Promise<Tentativa> {
  try {
    const pedido = encodeURIComponent(`${prompt}, no visible text`);
    const url =
      `https://image.pollinations.ai/prompt/${pedido}` +
      `?width=${formato.largura}&height=${formato.altura}&nologo=true&model=${modelo}`;
    // Timeout curto: a rede pública tem fila — 25s por sabor e bora
    const resposta = await fetch(url, { signal: AbortSignal.timeout(25000) });

    if (!resposta.ok) {
      anotarDetalhe(`pollinations ${resposta.status}`);
      console.error("[motor-imagem] Pollinations recusou. status:", resposta.status);
      return { ok: false, status: resposta.status };
    }

    const bytes = await resposta.arrayBuffer().catch(() => null);
    if (!bytes || bytes.byteLength === 0) {
      console.error("[motor-imagem] Pollinations devolveu vazio");
      return { ok: false, status: 502 };
    }

    const base64 = Buffer.from(bytes).toString("base64");
    console.log(
      `[motor-imagem] Pollinations respondeu (${Math.round(bytes.byteLength / 1024)} KB)`
    );
    return { ok: true, imagemBase64: base64, motor: "Pollinations · rede pública" };
  } catch (excecao) {
    console.error("[motor-imagem] Exceção no Pollinations:", excecao);
    return { ok: false, status: null };
  }
}

// ---------- Camada paga: Gemini imagem (reserva PAGA — desligada por padrão) ----------

// Liga SOMENTE com GEMINI_IMAGEM_ATIVA="true" + GEMINI_API_KEY no cofre.
// Antes de ligar: conferir o nome do modelo de imagem vigente na conta
// (a Google aposenta/renomeia — o padrão abaixo era o estável da época).
const MODELO_GEMINI_IMAGEM =
  process.env.GEMINI_IMAGEM_MODELO ?? "gemini-2.0-flash-preview-image-generation";

// Nota: o Gemini imagem decide o enquadramento sozinho (não recebe
// largura/altura) — por isso esta reserva não usa o parâmetro formato.
async function gerarViaGeminiImagem(
  chave: string,
  prompt: string
): Promise<Tentativa> {
  try {
    const resposta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI_IMAGEM}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": chave,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
        signal: AbortSignal.timeout(55000),
      }
    );

    const dados: unknown = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      console.error(
        "[motor-imagem] Gemini imagem recusou. status:",
        resposta.status,
        "| detalhe:",
        JSON.stringify(dados)?.slice(0, 600)
      );
      return { ok: false, status: resposta.status };
    }

    const gemini = dados as RespostaGeminiImagem | null;
    const partes = gemini?.candidates?.[0]?.content?.parts ?? [];
    const imagemParte = partes.find((parte) => Boolean(parte.inlineData?.data));
    const base64 = imagemParte?.inlineData?.data ?? "";

    if (!base64) {
      console.error(
        "[motor-imagem] Gemini imagem respondeu sem imagem. detalhe:",
        JSON.stringify(dados)?.slice(0, 600)
      );
      return { ok: false, status: 502 };
    }

    console.log("[motor-imagem] Gemini imagem respondeu (reserva paga)");
    return { ok: true, imagemBase64: base64, motor: `Gemini imagem · ${MODELO_GEMINI_IMAGEM}` };
  } catch (excecao) {
    console.error("[motor-imagem] Exceção ao chamar o Gemini imagem:", excecao);
    return { ok: false, status: null };
  }
}

// ---------- GET: espelho da mesa de imagens (booleanos, zero segredo) ----------

export async function GET() {
  const supabase = await getSupabaseServer();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { erro: "Faça login para ver os geradores de imagem." },
        { status: 401 }
      );
    }
  }

  const cloudflareArmado = Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN
  );
  const geminiImagemArmado =
    process.env.GEMINI_IMAGEM_ATIVA === "true" && Boolean(process.env.GEMINI_API_KEY);

  return NextResponse.json({
    motores: [
      { id: "cloudflare", armado: cloudflareArmado },
      { id: "gemini-imagem", armado: geminiImagemArmado },
    ],
  });
}

// ---------- POST: gerar imagem, caindo pela cadeia ----------

export async function POST(request: Request) {
  // 1) Porta: quando o Supabase está configurado, exige usuário logado
  const supabase = await getSupabaseServer();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { erro: "Faça login para gerar imagens." },
        { status: 401 }
      );
    }
  }

  // 2) Pedido
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
    return NextResponse.json(
      { erro: "Descreva a imagem que a IA deve criar." },
      { status: 400 }
    );
  }
  if (prompt.length > 2000) {
    return NextResponse.json(
      { erro: "Descrição longa demais (máximo 2.000 caracteres)." },
      { status: 400 }
    );
  }

  // Enriquece UMA vez, antes da fila: PT solto → prompt EN denso.
  // A "nota" carrega o MOTIVO (funcionou? recusou? por quê?) pro painel.
  const enriquecido = await enriquecerPrompt(prompt);
  const promptFinal = enriquecido.texto;
  const referencia =
    corpo.referencia && corpo.referencia.startsWith("data:image/")
      ? corpo.referencia
      : null;
  if (corpo.referencia && !referencia) {
    return NextResponse.json(
      { erro: "Referência inválida — envie uma imagem." },
      { status: 400 }
    );
  }
  if (referencia && referencia.length > 3_500_000) {
    return NextResponse.json(
      { erro: "Referência grande demais (máx. ~2 MB após a redução)." },
      { status: 400 }
    );
  }
  const formato = pegarFormato(corpo.formato);
  // Nota (Sprint 019): os schemas FLUX do Cloudflare NÃO aceitam
  // negative_prompt — o campo chega aqui e fica reservado pro dia em
  // que um motor da mesa aceitar (ex.: SDXL). Não é enviado hoje.
  // (não lido hoje — nem warning de ocioso; o campo fica reservado)

  // 3) Monta a fila de geradores armados (skip gracioso, igual à Mesa de texto)
  // Cada etapa carrega o rótulo — as "notas" contam a jornada na resposta
  // (qual motor gerou, quem falhou e por quê). Verdade visível na tela.
  const fila: { rotulo: string; rodar: () => Promise<Tentativa> }[] = [];
  const notas: string[] = [];
  notas.push(enriquecido.nota);

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const tokenCloudflare = process.env.CLOUDFLARE_API_TOKEN;
  if (accountId && tokenCloudflare) {
    for (const motor of MOTORES_CLOUDFLARE) {
      fila.push({
        rotulo: motor.id,
        rodar: () =>
          gerarViaCloudflare(accountId, tokenCloudflare, motor, promptFinal, formato, referencia),
      });
    }
  } else {
    console.log(
      "[motor-imagem] sem chaves Cloudflare (CLOUDFLARE_ACCOUNT_ID/CLOUDFLARE_API_TOKEN) — motores fora da fila"
    );
  }

  // Hugging Face: cota free SEPARADA (se o token estiver plantado)
  fila.push({
    rotulo: "Hugging Face · SDXL",
    rodar: () => gerarViaHuggingFace(promptFinal, formato),
  });

  // Rede pública: sem chave, sem cota — a segurança contra o "limite do dia"
  // (dois sabores, tentativa curta de 25s cada)
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
  } else {
    console.log("[motor-imagem] reserva Gemini imagem: desligada (padrão — custo)");
  }

  if (fila.length === 0) {
    return NextResponse.json(
      {
        erro: "Gerador de imagens não configurado neste ambiente (chaves do Cloudflare pendentes).",
        notas,
      },
      { status: 503 }
    );
  }

  // 4) Desfila até um responder
  let ultimoStatus: number | null = null;
  let houveLimite = false;

  for (const etapa of fila) {
    const resultado = await etapa.rodar();
    if (resultado.ok) {
      notas.unshift(`gerado por: ${etapa.rotulo}`);
      // Pollinations devolve JPEG (começa com /9j/ em base64) — o mime viaja certo
      const prefixoMime = resultado.imagemBase64.startsWith("/9j/")
        ? "data:image/jpeg;base64,"
        : "data:image/png;base64,";
      return NextResponse.json({
        imagem: `${prefixoMime}${resultado.imagemBase64}`,
        motor: resultado.motor,
        formato: `${formato.largura}x${formato.altura}`,
        promptUsado: promptFinal,
        notas,
      });
    }
    notas.push(
      `${etapa.rotulo} falhou (status ${resultado.status ?? "rede/tempo"}${ultimoDetalheFornecedor ? ` — ${ultimoDetalheFornecedor}` : ""})`
    );
    ultimoDetalheFornecedor = null; // detalhe é da etapa que falhou
    if (resultado.status !== null) {
      ultimoStatus = resultado.status;
      if (resultado.status === 429) houveLimite = true;
    }
  }

  // 5) Todos falharam — confessa em PT-BR
  console.error("[motor-imagem] TODOS os geradores falharam. último status:", ultimoStatus);

  if (houveLimite) {
    return NextResponse.json(
      {
        erro:
          "Os geradores gratuitos bateram o limite do dia. A cota renova à meia-noite (UTC) — ou fale com o suporte.",
        notas,
      },
      { status: 429 }
    );
  }

  if (ultimoStatus === null) {
    return NextResponse.json(
      {
        erro:
          "Nenhum gerador conseguiu responder agora (rede ou tempo). Tente de novo em instantes.",
        notas,
      },
      { status: 503 }
    );
  }

  const detalheFinal = ultimoDetalheFornecedor
    ? ` Detalhe técnico: ${ultimoDetalheFornecedor}`
    : "";

  return NextResponse.json(
    { erro: `${traduzErroImagem(ultimoStatus)}${detalheFinal}` },
    { status: 502 }
  );
}