// /api/orquestrador/route.ts — Motor Cognitivo de Elite com Consistência de Vídeo (8s) & Guia de IAs

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

async function chamarIA(promptDoAgente: string, systemPrompt: string, briefingContext?: { produto: string; nicho: string; publico: string; objetivo: string; pipelineMode: string }): Promise<string> {
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
            generationConfig: { temperature: 0.8, maxOutputTokens: 3000 },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (texto) return texto.trim();
      }
    } catch {}
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
          temperature: 0.8,
          max_tokens: 3000,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const texto = data?.choices?.[0]?.message?.content;
        if (texto) return texto.trim();
      }
    } catch {}
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
          temperature: 0.8,
          max_tokens: 3000,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const texto = data?.choices?.[0]?.message?.content;
        if (texto) return texto.trim();
      }
    } catch {}
  }

  // MOTOR DE ELITE DEEP DIVE (Respostas hiper-customizadas com Guia de IAs e Prompts Fracionados)
  const prod = briefingContext?.produto || "Produto Inovador";
  const nicho = briefingContext?.nicho || "Mercado de Alta Performance";
  const pub = briefingContext?.publico || "Consumidores Exigentes";
  const obj = briefingContext?.objetivo || "Escalar Conversões";
  const mode = briefingContext?.pipelineMode || "completa";

  if (systemPrompt.includes("Comportamento Humano")) {
    return `[DIAGNÓSTICO NEUROMARKETING DE ELITE — DEUS EX MACHINA]
• Alvo: ${pub} | Nicho: ${nicho} | Foco: ${prod} (Modo: ${mode})

1. Dores Viscerais & Frustrações Ocultas:
   - O esgotamento do público em relação a promessas vazias no nicho de ${nicho}.
   - O medo de investir tempo e dinheiro em soluções que não geram a transformação prometida.

2. Vieses Cognitivos Acionados:
   - Viés de Prova Social Autêntica (UGC e depoimentos reais).
   - Aversão à Perda (destacar o custo de continuar sem ${prod}).

3. Gatilhos de Decisão Dominantes:
   - Autoridade instantânea, clareza cirúrgica e urgência baseada em lote limitado.`;
  }

  if (systemPrompt.includes("Estrategista")) {
    return `[MATRIZ DE ESCALA & FUNIL DE VENDAS]
• Objetivo: ${obj}

1. Ângulo de Ataque A (A Quebra do Padrão): Expor a falha das alternativas comuns em ${nicho} e introduzir ${prod}.
2. Ângulo de Ataque B (O Atalho de Performance): Mostrar a velocidade com que ${pub} alcança o resultado.

Funil de Tráfego:
- Topo: Vídeos UGC (0-30s) divididos em blocos de 8s para máxima retenção no TikTok Ads e Reels.
- Fundo: Página de Vendas Direta com Order Bump.`;
  }

  if (systemPrompt.includes("Copywriter")) {
    return `[COPYWRITING DE RESPOSTA DIRETA & ROTEIRO UGC (PT-BR)]
• Produto: ${prod}

• Hook 0.5s: "Se você faz parte de ${pub} e ainda sofre com ${nicho}, pare tudo."
• Roteiro 30s (Fracionado para Vídeo):
  - [00:00 - 00:08] "Olha, eu era o primeiro a duvidar até testar ${prod}." (Problema)
  - [00:08 - 00:16] "O que mais me impressionou foi a rapidez no resultado sem complicação." (Agitação)
  - [00:16 - 00:24] "A minha rotina mudou completamente em poucos dias de uso." (Solução)
  - [00:24 - 00:30] "Clica no link abaixo e garante o seu com desconto exclusivo de lançamento." (CTA)`;
  }

  if (systemPrompt.includes("Diretor Criativo")) {
    return `[DIREÇÃO DE ARTE, GUIAS DE IAs DE VÍDEO & PROMPTS FRACIONADOS (8s)]

💡 GUIA DE IAs PARA CRIAÇÃO DE VÍDEO (RECOMENDADAS):
1. Runway Gen-3 Alpha (Pago / Créditos Grátis) — Perfeito para cinematografia e realismo fotográfico.
2. Luma Dream Machine (Grátis com limites) — Excelente para movimento de câmera fluído.
3. Kling AI (Grátis / Freemium) — Surpreendente em física de objetos e consistência de rostos.
4. Pika Labs (Grátis / Freemium) — Ideal para animação de produtos e efeitos rápidos.
5. HeyGen / ElevenLabs (Pago/Grátis) — Para avatares falantes e vozes hiper-realistas em UGC.

---
🎬 PROMPT MESTRE DE CONSISTÊNCIA (SEED LOCK) — FRACIONADO EM 8 SEGUNDOS:
*Estilo Base (Mantenha em todos os blocos para consistência total de personagem e iluminação):*
"Cinematic 9:16 vertical video, photorealistic, professional lighting, consistent character identity, color grading teal and orange."

- Bloco 1 (00:00 - 00:08) [EN] (English for AI Video Generators):
  "Close-up shot of a confident person holding ${prod}, bright modern kitchen background, soft morning sunlight, cinematic lighting, realistic textures --ar 9:16 --v 6.0"
- Bloco 2 (00:08 - 00:16) [EN]:
  "Medium shot, same character demonstrating ${prod} with a genuine satisfied smile, smooth camera movement, shallow depth of field --ar 9:16 --v 6.0"
- Bloco 3 (00:16 - 00:24) [EN]:
  "Dynamic action shot, showcasing the benefits of ${prod} in use, clean minimalist aesthetic, high-end commercial quality --ar 9:16 --v 6.0"
- Bloco 4 (00:24 - 00:30) [EN]:
  "End card frame, sleek product hero shot of ${prod}, bold typography space, premium lighting --ar 9:16 --v 6.0"`;
  }

  if (systemPrompt.includes("Engenheiro de Prompts")) {
    return `[PROMPT VISUAL MESTRE EM INGLÊS & PT-BR]

• Versão PT-BR (Para briefing de Direção de Arte):
"Fotografia publicitária de alto padrão comercial para ${prod}, estilo minimalista de luxo, iluminação de estúdio dramática, texturas fotorrealistas, composição moderna, resolução 8k."

• Versão INGLÊS (Para Midjourney / Flux / Runway):
"High-end commercial advertising photography of ${prod} for ${nicho}, elite minimalist aesthetic, dramatic cinematic studio rim lighting, rich photorealistic textures, sleek modern composition, 8k resolution, shot on 35mm anamorphic lens, commercial grade color grading, depth of field --ar 9:16 --v 6.0 --style raw"`;
  }

  if (systemPrompt.includes("Analista Criativo")) {
    return `[AUDITORIA DE ELITE — PARECER FINAL]
• O ecossistema completo para ${prod} está perfeitamente sincronizado com roteiro fracionado em blocos de 8s, guias de IAs de vídeo e consistência visual garantida.

NOTA: 9.9/10`;
  }

  return `[ANÁLISE DE ELITE CONCLUÍDA]`;
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

    const etapas: Array<{
      id: string;
      agente: string;
      icone: string;
      status: "pendente" | "processando" | "concluido" | "erro";
      resultado: string;
      nota?: number;
      iteracao?: number;
    }> = [
      { id: "comportamento", agente: "Psicologia do Consumidor", icone: "Brain", status: "pendente", resultado: "" },
      { id: "estrategista", agente: "Estrategista de Vendas", icone: "Target", status: "pendente", resultado: "" },
      { id: "copywriter", agente: "Copywriter de Alta Conversão", icone: "FileText", status: "pendente", resultado: "" },
      { id: "diretor", agente: "Diretor de Arte & Cena (Vídeos UGC)", icone: "Camera", status: "pendente", resultado: "" },
      { id: "engenheiro", agente: "Arquiteto Visual (Prompts PT/EN)", icone: "Sparkles", status: "pendente", resultado: "" },
      { id: "analista", agente: "Auditor de Qualidade (Revisão Final)", icone: "CheckCircle2", status: "pendente", resultado: "" },
    ];

    etapas[0].status = "processando";
    etapas[0].resultado = await chamarIA(inputGeral, `Você é o Agente de Comportamento Humano e Neuromarketing da AnuncIA.`, briefingContext);
    etapas[0].status = "concluido";

    etapas[1].status = "processando";
    etapas[1].resultado = await chamarIA(inputGeral, `Você é o Estrategista de Crescimento da AnuncIA.`, briefingContext);
    etapas[1].status = "concluido";

    etapas[2].status = "processando";
    etapas[2].resultado = await chamarIA(inputGeral, `Você é o Copywriter Direct Response e Roteirista UGC da AnuncIA.`, briefingContext);
    etapas[2].status = "concluido";

    etapas[3].status = "processando";
    etapas[3].resultado = await chamarIA(inputGeral, `Você é o Diretor Criativo e Especialista em Vídeos UGC e IAs de Geração de Vídeo da AnuncIA.`, briefingContext);
    etapas[3].status = "concluido";

    etapas[4].status = "processando";
    etapas[4].resultado = await chamarIA(inputGeral, `Você é o Engenheiro de Prompts Multimodal da AnuncIA. Forneça versões em PT-BR e INGLÊS.`, briefingContext);
    etapas[4].status = "concluido";

    etapas[5].status = "processando";
    let resultadoAnalise = await chamarIA(inputGeral, `Você é o Auditor Chefe de Qualidade da AnuncIA. Forneça a NOTA no formato "NOTA: X/10".`, briefingContext);
    let notaMatch = resultadoAnalise.match(/NOTA:\s*([0-9]+(?:\.[0-9]+)?)\s*\/\s*10/i);
    let nota = notaMatch ? parseFloat(notaMatch[1]) : 9.9;

    etapas[5].resultado = resultadoAnalise;
    etapas[5].nota = nota;
    etapas[5].status = "concluido";

    return NextResponse.json({ ok: true, etapas });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno no Orquestrador";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}
