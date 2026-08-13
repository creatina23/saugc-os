// iaService — a única porta de IA das telas.
// ------------------------------------------------------------------
// As telas NUNCA falam com Gemini, Groq ou qualquer provider:
// falam com este serviço, que chama a nossa /api/ia (servidor),
// onde as chaves vivem escondidas. Trocar de provider um dia =
// mexer só no servidor, zero mudança aqui e nas telas.
// v2: gerarTexto aceita opções { temperatura, maxTokens } — os
// controles das telas chegam de verdade ao modelo.
// v3 (Mesa de Motores): a resposta carrega "motor" — quem de fato
// respondeu (Gemini, GitHub Models, Groq, OpenRouter…) — e nasce o
// statusMotores(), o espelho que mostra quais motores têm chave
// plantada no servidor (alimenta os cartões vivos do IA Studio).

export interface RespostaIA {
  ok: boolean;
  texto: string;
  erro: string | null;
  motor: string | null; // quem respondeu de verdade ("Gemini · gemini-3.6-flash", "Groq · Llama 3.3 70B"...)
}

export interface OpcoesGeracaoIA {
  temperatura?: number; // 0–1 (o servidor limita)
  maxTokens?: number; // 256–4096 (o servidor limita)
}

// Um motor da mesa visto de fora: só o id e se tem chave (nunca a chave)
export interface MotorNaMesa {
  id: string; // "gemini" | "github" | "groq" | "openrouter"
  armado: boolean;
}

export const iaService = {
  async gerarTexto(
    prompt: string,
    opcoes: OpcoesGeracaoIA = {}
  ): Promise<RespostaIA> {
    try {
      const resposta = await fetch("/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acao: "gerar-texto",
          prompt,
          temperatura: opcoes.temperatura,
          maxTokens: opcoes.maxTokens,
        }),
      });

      const dados = (await resposta.json().catch(() => null)) as {
        texto?: string;
        erro?: string;
        motor?: string;
      } | null;

      if (!resposta.ok) {
        return {
          ok: false,
          texto: "",
          erro: dados?.erro ?? "Falha ao falar com a IA.",
          motor: null,
        };
      }

      return {
        ok: true,
        texto: dados?.texto ?? "",
        erro: null,
        motor: dados?.motor ?? null,
      };
    } catch {
      return {
        ok: false,
        texto: "",
        erro: "Sem conexão com o servidor de IA. Confira a internet.",
        motor: null,
      };
    }
  },

  // Espelho da Mesa de Motores: pergunta ao servidor quais motores têm
  // chave plantada. Retorna null quando não deu pra consultar (offline,
  // login fora em modo demo etc.) — a tela mostra estado "sem leitura".
  async statusMotores(): Promise<MotorNaMesa[] | null> {
    try {
      const resposta = await fetch("/api/ia", { method: "GET" });
      const dados = (await resposta.json().catch(() => null)) as {
        motores?: MotorNaMesa[];
      } | null;
      if (!resposta.ok || !Array.isArray(dados?.motores)) return null;
      return dados.motores;
    } catch {
      return null;
    }
  },
};