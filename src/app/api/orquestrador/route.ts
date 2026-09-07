// /api/orquestrador/route.ts — P0.1 OPERATIONAL AI TRUTH
// ------------------------------------------------------------------
// Alteração (P0.1, unidade aprovada pelo dono):
// • REMOVIDOS todos os fallbacks hardcoded (templates que imitavam
//   análise de IA quando os provedores falhavam).
// • chamarIA() agora retorna string | null — null = nenhum provedor
//   respondeu. NUNCA há substituição por conteúdo simulado.
// • Cada etapa registra status REAL ("concluido" | "erro") e uma
//   mensagem honesta de erro quando o motor não respondeu.
// • Auditor: nota somente quando uma execução REAL devolver
//   "NOTA: X/10". Removida qualquer nota default/artificial (9.9).
// • Semântica global: 0 etapas com erro => ok:true · 1–5 com erro =>
//   ok:true com status individuais · 6/6 com erro => ok:false com
//   etapas preservadas + erro global honesto.
// • Fora de escopo (NÃO alterados): modelos cravados, retry,
//   autodescoberta, pipelineMode, autoCorrecao, salvar-operacao
//   (persistência com user_id é P0.5.1), Oracle/UI além do mínimo.

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

// Mensagem honesta de erro (user-facing) — NÃO afirma causa exata
// (P0.1 não possui diagnóstico de provedor suficiente para isso).
const MSG_ERRO_IA =
  "O motor de IA não conseguiu gerar uma resposta para esta etapa. " +
  "Nenhuma análise foi substituída por conteúdo simulado. Tente novamente.";

async function chamarIA(
  promptDoAgente: string,
  systemPrompt: string,
  _briefingContext?: {
    produto: string;
    nicho: string;
    publico: string;
    objetivo: string;
    pipelineMode: string;
  }
): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  const promptCompleto = `${systemPrompt}\n\n--- DADOS DE ENTRADA ---\n${promptDoAgente}`;

  // Camada 1: Gemini
  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptCompleto }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 3000 },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (texto) return texto.trim();
      } else {
        // Log interno: status apenas (nunca segredos/credenciais)
        console.warn("[orquestrador] Gemini recusou (status " + res.status + ")");
      }
    } catch (e) {
      console.warn("[orquestrador] Gemini exceção:", e instanceof Error ? e.message : "erro");
    }
  }

  // Camada 2: Groq
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: promptDoAgente },
          ],
          temperature: 0.8,
          max_tokens: 3000,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const texto = data?.choices?.[0]?.message?.content;
        if (texto) return texto.trim();
      } else {
        console.warn("[orquestrador] Groq recusou (status " + res.status + ")");
      }
    } catch (e) {
      console.warn("[orquestrador] Groq exceção:", e instanceof Error ? e.message : "erro");
    }
  }

  // Camada 3: OpenRouter
  if (openRouterKey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: promptDoAgente },
          ],
          temperature: 0.8,
          max_tokens: 3000,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const texto = data?.choices?.[0]?.message?.content;
        if (texto) return texto.trim();
      } else {
        console.warn("[orquestrador] OpenRouter recusou (status " + res.status + ")");
      }
    } catch (e) {
      console.warn("[orquestrador] OpenRouter exceção:", e instanceof Error ? e.message : "erro");
    }
  }

  // NENHUM provedor respondeu → null. Nunca conteúdo simulado.
  return null;
}

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const body = await req.json();
    const { acao, briefing, dados } = body;

    if (acao === "salvar-operacao" && dados) {
      if (supabase) {
        const { error } = await supabase.from("briefings").insert([
          {
            title: dados.titulo,
            client: dados.cliente,
            status: "Em Aprovação",
            deadline: new Date(Date.now() + 7 * 86400000).toLocaleDateString("pt-BR"),
            tags: ["Orquestrador", "UGC", "IA"],
          },
        ]);
        if (error) {
          return NextResponse.json({ ok: false, erro: error.message }, { status: 400 });
        }
      }
      return NextResponse.json({ ok: true });
    }

    if (acao !== "executar-020b" || !briefing) {
      return NextResponse.json({ erro: "Parâmetros inválidos." }, { status: 400 });
    }

    const { produto, nicho, publico, objetivo, pipelineMode = "completa", autoCorrecao = true } = briefing;
    const inputGeral = `Produto: ${produto}\nNicho: ${nicho}\nPúblico-alvo: ${publico}\nObjetivo: ${objetivo}\nModo Pipeline: ${pipelineMode}`;
    const briefingContext = { produto, nicho, publico, objetivo, pipelineMode };

    type StatusEtapa = "pendente" | "processando" | "concluido" | "erro";

    const etapas: Array<{
      id: string;
      agente: string;
      icone: string;
      status: StatusEtapa;
      resultado: string;
      nota?: number;
      iteracao?: number;
      erro?: string;
    }> = [
      { id: "comportamento", agente: "Psicologia do Consumidor", icone: "Brain", status: "pendente", resultado: "" },
      { id: "estrategista", agente: "Estrategista de Vendas", icone: "Target", status: "pendente", resultado: "" },
      { id: "copywriter", agente: "Copywriter de Alta Conversão", icone: "FileText", status: "pendente", resultado: "" },
      { id: "diretor", agente: "Diretor de Arte & Cena (Vídeos UGC)", icone: "Camera", status: "pendente", resultado: "" },
      { id: "engenheiro", agente: "Arquiteto Visual (Prompts PT/EN)", icone: "Sparkles", status: "pendente", resultado: "" },
      { id: "analista", agente: "Auditor de Qualidade (Revisão Final)", icone: "CheckCircle2", status: "pendente", resultado: "" },
    ];

    // Helper: executa a etapa e registra status REAL + erro honesto
    async function executarEtapa(
      etapa: (typeof etapas)[number],
      systemPrompt: string
    ): Promise<void> {
      etapa.status = "processando";
      const texto = await chamarIA(inputGeral, systemPrompt, briefingContext);
      if (texto) {
        etapa.resultado = texto;
        etapa.status = "concluido";
      } else {
        etapa.resultado = "";
        etapa.status = "erro";
        etapa.erro = MSG_ERRO_IA;
      }
    }

    await executarEtapa(etapas[0], "Você é o Agente de Comportamento Humano e Neuromarketing da AnuncIA.");
    await executarEtapa(etapas[1], "Você é o Estrategista de Crescimento da AnuncIA.");
    await executarEtapa(etapas[2], "Você é o Copywriter Direct Response e Roteirista UGC da AnuncIA.");
    await executarEtapa(etapas[3], "Você é o Diretor Criativo e Especialista em Vídeos UGC e IAs de Geração de Vídeo da AnuncIA.");
    await executarEtapa(etapas[4], "Você é o Engenheiro de Prompts Multimodal da AnuncIA. Forneça versões em PT-BR e INGLÊS.");

    // Etapa 5 — Auditor: nota SOMENTE se uma execução REAL devolver "NOTA: X/10"
    etapas[5].status = "processando";
    const textoAuditor = await chamarIA(
      inputGeral,
      "Você é o Auditor Chefe de Qualidade da AnuncIA. Forneça a NOTA no formato \"NOTA: X/10\".",
      briefingContext
    );
    if (textoAuditor) {
      const notaMatch = textoAuditor.match(/NOTA:\s*([0-9]+(?:\.[0-9]+)?)\s*\/\s*10/i);
      etapas[5].resultado = textoAuditor;
      etapas[5].nota = notaMatch ? parseFloat(notaMatch[1]) : undefined;
      etapas[5].status = "concluido";
    } else {
      etapas[5].resultado = "";
      etapas[5].nota = undefined;
      etapas[5].status = "erro";
      etapas[5].erro = MSG_ERRO_IA;
    }

    // ---- Semântica global honesta (C-01) ----
    const etapasComErro = etapas.filter((e) => e.status === "erro").length;
    const falhaTotal = etapasComErro === etapas.length;

    if (falhaTotal) {
      return NextResponse.json({
        ok: false,
        etapas,
        erro: "Nenhum motor de IA respondeu. A operação não foi executada — nenhuma etapa possui análise. Tente novamente em instantes.",
      });
    }

    return NextResponse.json({ ok: true, etapas });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno no Orquestrador";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}
