import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

// Motor de IA da AnuncIA — Route Handler (roda SÓ no servidor).
// ------------------------------------------------------------------
// • A chave GEMINI_API_KEY vive apenas aqui: nunca vai para o navegador.
// • AUTODESCOBERTA + MEMÓRIA DO ERRO: pergunta à API quais modelos a
//   chave pode usar, ordena os "flash" do mais novo pro mais velho e
//   testa em ordem. Modelo reprovado (404 / aposentado) entra na lista
//   de reprovados e nunca mais é escolhido neste boot. O primeiro que
//   responder 200 vira o modelo fixado até o próximo boot.
// • Providers futuros (Groq, GitHub Models, OpenRouter) entram NESTE
//   arquivo, sem mudar uma linha das telas — elas falam só com iaService.
// • Só atende usuário logado: protege a cota gratuita de estranhos.
// • Logs [motor-ia] aparecem só no TERMINAL do servidor (jamais no navegador).

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

// Memória deste boot do servidor
let modeloAprovado: string | null = null; // já respondeu 200 → fica fixado
const modelosReprovados = new Set<string>(); // recusados (404) pelo Google

type PedidoIA = { acao?: string; prompt?: string };

type ParteGemini = { text?: string };
type RespostaGemini = {
  candidates?: { content?: { parts?: ParteGemini[] } }[];
};

type ModeloGemini = {
  name?: string;
  supportedGenerationMethods?: string[];
};

// Extrai a versão numérica do nome ("gemini-2.5-flash" → 250, "gemini-3-flash" → 300)
// pra ordenar do mais novo pro mais velho.
function versaoDoModelo(nome: string): number {
  const alvo = /gemini-(\d+)(?:\.(\d+))?/i.exec(nome);
  if (!alvo) return 0;
  return Number(alvo[1]) * 100 + Number(alvo[2] ?? "0");
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

function traduzErroIA(status: number): string {
  if (status === 429)
    return "Limite gratuito da IA atingido agora. Aguarde 1 minuto e tente de novo.";
  if (status === 401 || status === 403)
    return "Chave de IA inválida ou sem permissão. Confira o .env.local.";
  if (status === 400) return "O pedido foi recusado pela IA. Reformule o texto.";
  if (status >= 500) return "A IA está instável agora. Tente de novo em instantes.";
  return "Falha ao falar com a IA. Tente de novo.";
}

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

  // 2) Chave: sem ela, erro amigável (sem expor detalhes)
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) {
    return NextResponse.json(
      { erro: "IA não configurada neste ambiente (GEMINI_API_KEY ausente)." },
      { status: 503 }
    );
  }

  // 3) Pedido
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

  // 4) Gemini — desfila candidatos até um responder 200
  let texto = "";
  let ultimoStatus = 0;

  for (
    let tentativa = 1;
    tentativa <= MAX_TENTATIVAS && !texto;
    tentativa += 1
  ) {
    const modelo =
      modeloAprovado ?? (await descobrirModelo(chave)) ?? MODELO_RESERVA;

    if (modelosReprovados.has(modelo)) {
      console.log("[motor-ia] sem novos candidatos — encerrando tentativas");
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
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
          signal: AbortSignal.timeout(45000),
        }
      );

      const dados: unknown = await resposta.json().catch(() => null);

      if (resposta.ok) {
        const gerado = textoDaRespostaGemini(dados);
        if (!gerado) {
          console.error(
            "[motor-ia] Resposta veio sem texto. detalhe:",
            JSON.stringify(dados)?.slice(0, 600)
          );
          return NextResponse.json(
            { erro: "A IA não respondeu desta vez. Tente de novo." },
            { status: 502 }
          );
        }
        texto = gerado;
        modeloAprovado = modelo;
        console.log(`[motor-ia] modelo aprovado e fixado: ${modelo}`);
        break;
      }

      ultimoStatus = resposta.status;
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
      break; // demais erros não melhoram com nova tentativa
    } catch (excecao) {
      console.error("[motor-ia] Exceção ao chamar a IA:", excecao);
      return NextResponse.json(
        { erro: "A IA demorou demais para responder. Tente de novo." },
        { status: 504 }
      );
    }
  }

  if (texto) {
    return NextResponse.json({ texto });
  }

  if (ultimoStatus === 0) {
    return NextResponse.json(
      {
        erro:
          "Nenhum modelo de IA disponível para sua chave agora. Tente mais tarde.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { erro: traduzErroIA(ultimoStatus) },
    { status: 502 }
  );
}