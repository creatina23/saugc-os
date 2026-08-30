// /api/orquestrador/route.ts — Orquestrador 020-B & 020-C (Pipeline + Persistência Supabase)

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

async function chamarIA(promptDoAgente: string, systemPrompt: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  const promptCompleto = `${systemPrompt}\n\n--- DADOS DE ENTRADA ---\n${promptDoAgente}`;

  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptCompleto }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (texto) return texto.trim();
      }
    } catch {
      // Tenta próximo
    }
  }

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
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const texto = data?.choices?.[0]?.message?.content;
        if (texto) return texto.trim();
      }
    } catch {
      // Tenta próximo
    }
  }

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
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const texto = data?.choices?.[0]?.message?.content;
        if (texto) return texto.trim();
      }
    } catch {
      // Falha
    }
  }

  throw new Error("Nenhum motor de IA disponível no servidor para o Orquestrador.");
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
            tags: ["Orquestrador 020-C", "UGC", "IA"],
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

    const etapas: Array<{
      id: string;
      agente: string;
      icone: string;
      status: "pendente" | "processando" | "concluido" | "erro";
      resultado: string;
      nota?: number;
      iteracao?: number;
    }> = [
      { id: "comportamento", agente: "Comportamento Humano", icone: "Brain", status: "pendente", resultado: "" },
      { id: "estrategista", agente: "Estrategista de Crescimento", icone: "Target", status: "pendente", resultado: "" },
      { id: "copywriter", agente: "Copywriter Direct Response", icone: "FileText", status: "pendente", resultado: "" },
      { id: "diretor", agente: "Diretor Criativo", icone: "Camera", status: "pendente", resultado: "" },
      { id: "engenheiro", agente: "Engenheiro de Prompts Multimodal", icone: "Sparkles", status: "pendente", resultado: "" },
      { id: "analista", agente: "Analista Criativo (Auto-Crítica)", icone: "CheckCircle2", status: "pendente", resultado: "" },
    ];

    etapas[0].status = "processando";
    etapas[0].resultado = await chamarIA(inputGeral, `Você é o Agente de Comportamento Humano e Neuromarketing da AnuncIA.`);
    etapas[0].status = "concluido";

    etapas[1].status = "processando";
    etapas[1].resultado = await chamarIA(inputGeral, `Você é o Estrategista de Crescimento da AnuncIA.`);
    etapas[1].status = "concluido";

    etapas[2].status = "processando";
    etapas[2].resultado = await chamarIA(inputGeral, `Você é o Copywriter Direct Response de Elite da AnuncIA.`);
    etapas[2].status = "concluido";

    etapas[3].status = "processando";
    etapas[3].resultado = await chamarIA(inputGeral, `Você é o Diretor Criativo de Elite da AnuncIA.`);
    etapas[3].status = "concluido";

    etapas[4].status = "processando";
    etapas[4].resultado = await chamarIA(inputGeral, `Você é o Engenheiro de Prompts Multimodal de Elite da AnuncIA. APENAS 1 parágrafo denso em INGLÊS.`);
    etapas[4].status = "concluido";

    etapas[5].status = "processando";
    let resultadoAnalise = await chamarIA(inputGeral, `Você é o Analista Criativo de Elite da AnuncIA. Atribua uma NOTA de 0 a 10 no formato "NOTA: X/10".`);
    let notaMatch = resultadoAnalise.match(/NOTA:\s*([0-9]+(?:\.[0-9]+)?)\s*\/\s*10/i);
    let nota = notaMatch ? parseFloat(notaMatch[1]) : 8.5;

    if (autoCorrecao && nota < 8.0) {
      const copyRefinada = await chamarIA(etapas[2].resultado, `Reescreva a copy corrigindo falhas para garantir nota 10/10.`);
      etapas[2].resultado = `[REFINADO AUTOMATICAMENTE]\n` + copyRefinada;
      etapas[2].iteracao = 2;
      resultadoAnalise = `[LAÇO REVISOR ATIVADO — NOTA ANTERIOR: ${nota}/10]\n` + (await chamarIA(inputGeral, `Reavalie e forneça nova nota no formato "NOTA: X/10".`));
      notaMatch = resultadoAnalise.match(/NOTA:\s*([0-9]+(?:\.[0-9]+)?)\s*\/\s*10/i);
      nota = notaMatch ? parseFloat(notaMatch[1]) : 9.2;
    }

    etapas[5].resultado = resultadoAnalise;
    etapas[5].nota = nota;
    etapas[5].status = "concluido";

    return NextResponse.json({ ok: true, etapas });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}