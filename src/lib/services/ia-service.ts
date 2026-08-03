// iaService — a única porta de IA das telas.
// ------------------------------------------------------------------
// As telas NUNCA falam com Gemini, Groq ou qualquer provider:
// falam com este serviço, que chama a nossa /api/ia (servidor),
// onde as chaves vivem escondidas. Trocar de provider um dia =
// mexer só no servidor, zero mudança aqui e nas telas.
// v2: gerarTexto aceita opções { temperatura, maxTokens } — os
// controles das telas chegam de verdade ao modelo.

export interface RespostaIA {
  ok: boolean;
  texto: string;
  erro: string | null;
}

export interface OpcoesGeracaoIA {
  temperatura?: number; // 0–1 (o servidor limita)
  maxTokens?: number; // 256–4096 (o servidor limita)
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
      } | null;

      if (!resposta.ok) {
        return {
          ok: false,
          texto: "",
          erro: dados?.erro ?? "Falha ao falar com a IA.",
        };
      }

      return { ok: true, texto: dados?.texto ?? "", erro: null };
    } catch {
      return {
        ok: false,
        texto: "",
        erro: "Sem conexão com o servidor de IA. Confira a internet.",
      };
    }
  },
};