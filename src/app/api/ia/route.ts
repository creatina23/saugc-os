// /api/ia/route.ts — CP-01 FIX P1 · camada HTTP sobre a CASCATA CANÔNICA
// ======================================================================
// A cascata de providers (Gemini→Groq→OpenRouter→Cerebras, com
// auto-descoberta/rotação/cache/hall dos reprovados) vive agora em
// src/lib/ia/cadeia-texto.ts — implementação canônica extraída DESTA
// rota sem mudança comportamental, e compartilhada com o Orquestrador
// (motor.ts). Esta rota mantém EXATAMENTE seu contrato HTTP:
//   GET  /api/ia        → { motores: [{ id, armado }] } (booleanos, sem segredo)
//   POST /api/ia        → { texto, motor } | { erro } (com resumo da fila)
// Auth, limites (prompt ≤ 8.000), normalização ARQ-4 de evidências
// (dados → camada 7 do compositor FND-03) e composição cognitiva
// (Constituição 1.0.0 + LEGACY_REPERTOIRE) permanecem AQUI (camada HTTP).
// Verdade na tela preservada: erro final continua carregando o resumo da
// fila inteira ("Gemini→429 | Groq→rede | …"), agora derivado das
// tentativas categorizadas da cascata canônica.
// ======================================================================

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { BASE_EXCELENCIA } from "@/lib/base-excelencia";
import { montarPromptCognitivo } from "@/lib/constituicao/composicao";
import {
  gerarTextoCascata,
  motoresArmados,
  detalheSanitizadoUltimoErro,
} from "@/lib/ia/cadeia-texto";

type DadoExternoPedido = {
  tipo?: unknown;
  fonte?: unknown;
  conteudo?: unknown;
};

type PedidoIA = {
  acao?: string;
  prompt?: string;
  temperatura?: number;
  maxTokens?: number;
  /** CP-01B · ARQ-4 (aditivo): dados/evidências p/ camada 7 do
   *  compositor. Validado server-side; ausente = comportamento atual. */
  dados?: DadoExternoPedido[];
};

/** Valida e normaliza dados de evidência (ARQ-4). Conservador:
 *  qualquer item malformado derruba o pedido com 400 honesto —
 *  preferível a ignorar evidência em silêncio (C-17). */
function normalizarDadosExternos(
  entrada: unknown
): { ok: true; dados: Parameters<typeof montarPromptCognitivo>[0]["dados"] } | { ok: false; erro: string } {
  if (entrada === undefined) return { ok: true, dados: undefined };
  if (!Array.isArray(entrada) || entrada.length > 8) {
    return { ok: false, erro: "Campo 'dados' deve ser uma lista de até 8 evidências." };
  }
  type Bloco = NonNullable<Parameters<typeof montarPromptCognitivo>[0]["dados"]>[number];
  const saida: Bloco[] = [];
  for (const item of entrada as DadoExternoPedido[]) {
    const tipo = item?.tipo;
    const conteudo = typeof item?.conteudo === "string" ? item.conteudo.trim() : "";
    if (!conteudo || conteudo.length > 4000) {
      return { ok: false, erro: "Cada evidência em 'dados' precisa de 'conteudo' válido (até 4.000 caracteres)." };
    }
    const fonte = typeof item?.fonte === "string" && item.fonte.trim() ? item.fonte.trim().slice(0, 120) : null;
    switch (tipo) {
      case "userSuppliedData":
        saida.push({ tipo: "userSuppliedData" as const, conteudo });
        break;
      case "externalData":
        if (!fonte) return { ok: false, erro: "Evidência 'externalData' exige 'fonte' (proveniência)." };
        saida.push({ tipo: "externalData" as const, fonte, conteudo });
        break;
      case "toolOutput":
        if (!fonte) return { ok: false, erro: "Evidência 'toolOutput' exige 'fonte' (ferramenta de origem)." };
        saida.push({ tipo: "toolOutput" as const, ferramenta: fonte, conteudo });
        break;
      default:
        return { ok: false, erro: "Campo 'dados[].tipo' inválido (use userSuppliedData, externalData ou toolOutput)." };
    }
  }
  return { ok: true, dados: saida.length ? saida : undefined };
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
  return NextResponse.json({ motores: motoresArmados() });
}

// ---------- POST: gerar texto, caindo pela cascata canônica ----------

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

  // ARQ-4 (CP-01B): evidências do chamador entram pela camada 7 do
  // compositor — rótulo DADO NÃO-AUTORITATIVO (proveniência visível;
  // nem FND-03 nem o contrato HTTP existente foram alterados — dados é
  // campo aditivo e opcional).
  const dadosExternos = normalizarDadosExternos(corpo.dados);
  if (!dadosExternos.ok) {
    return NextResponse.json({ erro: dadosExternos.erro }, { status: 400 });
  }

  // Compositor cognitivo: Constituição 1.0.0 sempre presente (não
  // parametrizável); prompt do usuário = USER_COMMAND; BASE_EXCELENCIA =
  // LEGACY_REPERTOIRE (íntegra). Metadata do compositor permanece interno.
  const { prompt: promptComExcelencia } = montarPromptCognitivo({
    userCommand: prompt,
    selectedRepertoire: {
      ids: ["legacy-base-excelencia"],
      conteudo: BASE_EXCELENCIA,
    },
    ...(dadosExternos.dados ? { dados: dadosExternos.dados } : {}),
  });

  // 3) Cascata canônica (UMA capacidade, UMA implementação)
  const resultado = await gerarTextoCascata(promptComExcelencia, {
    temperatura: corpo.temperatura,
    maxTokens: corpo.maxTokens,
  });

  if (resultado.ok) {
    return NextResponse.json({ texto: resultado.texto, motor: resultado.motor });
  }

  // 4) Todos falharam — confessa em PT-BR com a fila INTEIRA na tela.
  //    (o resumo só inclui tentativas REAIS — camadas sem chave ou puladas
  //    por cooldown efêmero (P2 Fase 2) não entram no resumo de falhas.)
  const reais = resultado.tentativas.filter(
    (t) => t.redeHouve === true
  );
  const falhas = reais.map(
    (t) => `${t.provider.slice(0, 9)}→${t.status ?? (t.categoria === "TIMEOUT" ? "timeout" : "rede")}`
  );
  const resumoFalhas = falhas.length ? ` (fila: ${falhas.join(" | ")})` : "";

  if (resultado.categoriaFinal === "SKIPPED_NO_KEY") {
    return NextResponse.json(
      { erro: "IA não configurada neste ambiente (nenhuma chave plantada)." },
      { status: 503 }
    );
  }

  const houveLimite = reais.some((t) => t.categoria === "HTTP_429_QUOTA");
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

  const ultimoStatus = reais.length ? reais[reais.length - 1].status : null;

  if (ultimoStatus === null) {
    return NextResponse.json(
      {
        erro:
          "Nenhum motor de IA consegue responder agora (rede ou tempo). Tente de novo em instantes." +
          resumoFalhas,
      },
      { status: 503 }
    );
  }

  const detalhe = detalheSanitizadoUltimoErro() ?? "sem detalhe";
  const detalheFinal = falhas.length
    ? ` Detalhe técnico: ${falhas.join(" | ")} — último motivo: ${detalhe}`
    : "";

  return NextResponse.json(
    { erro: `${traduzErroIA(ultimoStatus)}${detalheFinal}` },
    { status: 502 }
  );
}
