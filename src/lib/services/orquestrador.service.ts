// orquestrador.service.ts — Sprint 020-C (Pipeline Dinâmica + Persistência Supabase)
// P0.1: campo aditivo "erro?" — mensagem honesta quando a etapa falhou por
// falta de resposta do motor de IA. Nenhum campo existente foi removido.

export interface EtapaOrquestracao {
  id: string;
  agente: string;
  icone: string;
  status: "pendente" | "processando" | "concluido" | "erro";
  resultado: string;
  nota?: number;
  iteracao?: number;
  erro?: string; // P0.1 — mensagem honesta de falha (sem conteúdo simulado)
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

      // P0.1: ok:false (falha total) AINDA carrega etapas — a UI precisa
      // preservar e renderizar o estado real de cada etapa.
      return {
        ok: data.ok === true && Array.isArray(data.etapas) ? true : false,
        etapas: Array.isArray(data.etapas) ? data.etapas : [],
        erro: data.erro,
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
