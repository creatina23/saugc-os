// ia-service.ts — O motor central de inteligência e resiliência (Mesa de Motores em Cadeia)

export type AiResponse = {
  ok: boolean;
  texto: string;
  provedorUsado?: string;
  erro?: string;
};

export type AiOptions = {
  temperatura?: number;
  maxTokens?: number;
  /** CP-01B · ARQ-4 (aditivo): evidências que trafegam pela camada 7 do
   *  compositor FND-03 na /api/ia (rótulo DADO NÃO-AUTORITATIVO).
   *  Nenhum outro consumidor é obrigado a usar. */
  dados?: DadoEvidenciaIA[];
};

/** Espelho da união DadoNaoAutoritativo do compositor FND-03. */
export type DadoEvidenciaIA = {
  tipo: "userSuppliedData" | "externalData" | "toolOutput";
  fonte?: string; // obrigatória p/ externalData/toolOutput
  conteudo: string;
};

export const iaService = {
  async gerarTexto(prompt: string, opcoes?: AiOptions): Promise<AiResponse> {
    try {
      const resposta = await fetch("/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          options: opcoes,
          ...(opcoes?.dados && opcoes.dados.length > 0 ? { dados: opcoes.dados } : {}),
        }),
      });

      if (!resposta.ok) {
        const dadosErro = await resposta.json().catch(() => ({}));
        return {
          ok: false,
          texto: "",
          erro: dadosErro.erro || `Erro HTTP ${resposta.status}: Falha na comunicação com o motor de IA.`,
        };
      }

      const dados = await resposta.json();
      return {
        ok: true,
        texto: dados.texto || "",
        provedorUsado: dados.provedor || "AnuncIA Multi-Chain",
      };
    } catch (erro: any) {
      return {
        ok: false,
        texto: "",
        erro: erro?.message || "Erro de rede ao acionar a IA. Verifique sua conexão.",
      };
    }
  },

  async statusMotores(): Promise<any[]> {
    return [
      { id: "m1", name: "GPT-4o", provider: "OpenAI", category: "Texto", badge: "Supremo Mestre" },
      { id: "m2", name: "Claude 3.5 Sonnet", provider: "Anthropic", category: "Texto", badge: "Estratégico" },
      { id: "m3", name: "Gemini 2.0 Pro", provider: "Google", category: "Texto", badge: "Alta Velocidade" },
      { id: "m4", name: "Groq Llama 3", provider: "Groq", category: "Texto", badge: "Resiliência Ativa" },
    ];
  },
};