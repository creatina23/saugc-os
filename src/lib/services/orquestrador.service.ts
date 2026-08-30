// orquestrador.service.ts — Sprint 020-C (Pipeline Dinâmica + Persistência Supabase)

export interface EtapaOrquestracao {
  id: string;
  agente: string;
  icone: string;
  status: "pendente" | "processando" | "concluido" | "erro";
  resultado: string;
  nota?: number;
  iteracao?: number;
}

export interface PipelineResultado {
  ok: boolean;
  etapas: EtapaOrquestracao[];
  erro?: string;
}

export interface BriefingOrquestrador {
  produto: string;
  nicho: string;
  publico: string;
  objetivo: string;
  pipelineMode?: "completa" | "ugc" | "performance";
  autoCorrecao?: boolean;
}

export const orquestradorService = {
  async executarPipeline(briefing: BriefingOrquestrador): Promise<PipelineResultado> {
    try {
      const response = await fetch("/api/orquestrador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "executar-020b", briefing }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          ok: false,
          etapas: [],
          erro: data.erro || "Erro ao executar pipeline do Orquestrador.",
        };
      }

      return {
        ok: true,
        etapas: data.etapas || [],
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      return {
        ok: false,
        etapas: [],
        erro: "Falha de conexão com o Orquestrador: " + message,
      };
    }
  },

  async salvarNaOperacao(dados: {
    titulo: string;
    cliente: string;
    script: string;
    promptVisual: string;
  }): Promise<{ ok: boolean; erro?: string }> {
    try {
      const response = await fetch("/api/orquestrador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "salvar-operacao", dados }),
      });
      const res = await response.json();
      return { ok: response.ok && res.ok, erro: res.erro };
    } catch (err: unknown) {
      return { ok: false, erro: err instanceof Error ? err.message : "Erro ao salvar na operação" };
    }
  },
};