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
};

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
// O v5 cravou "gemini-2.0-flash" e o tradutor morreu em silêncio — nunca mais.)
const MODELO_TRADUTOR_RESERVA = "gemini-2.0-flash";
let modeloTradutorAprovado: string | null = null;

function versaoDoNomeGemini(nome: string): number {
  const alvo = /gemini-(\d+)(?:\.(\d+))?/i.exec(nome);
  if (!alvo) return 0;
  return Number(alvo[1]) * 100 + Number(alvo[2] ?? "0");
}

async function descobrirModeloTradutor(chave: string): Promise<string> {
  if (modeloTradutorAprovado) return modeloTradutorAprovado;
  try {
    const resposta = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models",
      { headers: { "x-goog-api-key": chave }, signal: AbortSignal.timeout(15000) }
    );
    if (resposta.ok) {
      const dados = (await resposta.json().catch(() => null)) as {
        models?: { name?: string; supportedGenerationMethods?: string[] }[];
      } | null;
      const bloqueados = ["image", "imagen", "tts", "embedding", "computer-use", "aqa"];
      const flashes = (dados?.models ?? [])
        .map((modelo) => (modelo.name ?? "").replace(/^models\//, ""))
        .filter(
          (nome) =>
            nome &&
            nome.toLowerCase().includes("flash") &&
            !bloqueados.some((bloqueio) => nome.toLowerCase().includes(bloqueio)) &&
            (dados?.models ?? []).some(
              (modelo) =>
                modelo.name === `models/${nome}` &&
                (modelo.supportedGenerationMethods ?? []).includes("generateContent")
            )
        )
        .sort((a, b) => versaoDoNomeGemini(b) - versaoDoNomeGemini(a));
      if (flashes[0]) {
        modeloTradutorAprovado = flashes[0];
        console.log(`[motor-imagem] tradutor fixado por autodescoberta: ${flashes[0]}`);
        return flashes[0];
      }
    }
  } catch {
    console.log("[motor-imagem] autodescoberta do tradutor falhou — usando reserva");
  }
  return MODELO_TRADUTOR_RESERVA;
}

async function enriquecerPrompt(
  promptOriginal: string
): Promise<{ texto: string; nota: string }> {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) {
    return { texto: promptOriginal, nota: "prompt: original (tradutor sem chave Gemini)" };
  }

  try {
    const modeloTradutor = await descobrirModeloTradutor(chave);
    const instrucao =
      "Turn this Brazilian Portuguese description into a short, dense English image-generation prompt. " +
      "Include subject, scene, composition, visual style and lighting. " +
      "Answer ONLY with the prompt itself, no quotes, maximum 60 words. Description: " +
      JSON.stringify(promptOriginal);

    const resposta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modeloTradutor}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": chave,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: instrucao }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 200 },
        }),
        signal: AbortSignal.timeout(12000),
      }
    );

    if (!resposta.ok) {
      console.log("[motor-imagem] tradutor de prompt indisponível — usando original");
      return {
        texto: promptOriginal,
        nota: `prompt: original (tradutor recusou status ${resposta.status} no modelo ${modeloTradutor})`,
      };
    }

    const dados = (await resposta.json().catch(() => null)) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    } | null;

    const enriquecido = (dados?.candidates?.[0]?.content?.parts ?? [])
      .map((parte) => parte.text ?? "")
      .join("")
      .trim()
      .replace(/^["']|["']$/g, "");

    if (!enriquecido) {
      return { texto: promptOriginal, nota: "prompt: original (tradutor respondeu vazio)" };
    }
    console.log(`[motor-imagem] prompt enriquecido p/ inglês (${enriquecido.length} caracteres)`);
    return {
      texto: enriquecido,
      nota: `prompt: traduzido p/ inglês pelo ${modeloTradutor}`,
    };
  } catch {
    console.log("[motor-imagem] tradutor de prompt falhou (rede/tempo) — usando original");
    return { texto: promptOriginal, nota: "prompt: original (tradutor caiu na rede/tempo)" };
  }
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
  formato: Formato
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
      corpoPedido = form; // o fetch gera o multipart com boundary certinho
    } else {
      cabecalhos["Content-Type"] = "application/json";
      corpoPedido = JSON.stringify({ prompt, steps: 4 }); // schema do schnell
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

// ---------- Camada 2: Gemini imagem (reserva PAGA — desligada por padrão) ----------

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
  const formato = pegarFormato(corpo.formato);
  // Nota (Sprint 019): os schemas FLUX do Cloudflare NÃO aceitam
  // negative_prompt — o campo chega aqui e fica reservado pro dia em
  // que um motor da mesa aceitar (ex.: SDXL). Não é enviado hoje.
  const _negativoReservado = corpo.negativo?.trim().slice(0, 500) ?? "";

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
          gerarViaCloudflare(accountId, tokenCloudflare, motor, promptFinal, formato),
      });
    }
  } else {
    console.log(
      "[motor-imagem] sem chaves Cloudflare (CLOUDFLARE_ACCOUNT_ID/CLOUDFLARE_API_TOKEN) — motores fora da fila"
    );
  }

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
      return NextResponse.json({
        imagem: `data:image/png;base64,${resultado.imagemBase64}`,
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
