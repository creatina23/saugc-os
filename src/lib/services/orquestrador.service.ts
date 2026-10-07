// orquestrador.service.ts — Sprint 020-C (Pipeline Dinâmica + Persistência Supabase)
// P0.1: campo aditivo "erro?" — mensagem honesta quando a etapa falhou por
// falta de resposta do motor de IA. Nenhum campo existente foi removido.
// CP-01 FIX P2 Fase 1: campo aditivo "diagnostico?" — DTO sanitizado
// (whitelist) da chamada do especialista; presente só quando o servidor o
// envia. Type-only import (apagado em runtime; sem custo no bundle).

import type { DiagnosticoEtapa } from "../orquestrador/pipeline";
import type { StatusGeral } from "../orquestrador/status";
import type { ResumoEntendimento } from "../orquestrador/entendimento";

export type VereditoAuditoriaEpistemica =
  | "APROVADO"
  | "APROVADO_COM_AJUSTES"
  | "BLOQUEADO_POR_EVIDENCIA";

export interface EtapaOrquestracao {
  id: string;
  agente: string;
  icone: string;
  status: "pendente" | "processando" | "concluido" | "erro";
  resultado: string;
  nota?: number;
  iteracao?: number;
  erro?: string; // P0.1 — mensagem honesta de falha (sem conteúdo simulado)
  diagnostico?: DiagnosticoEtapa; // P2-1 — camada 2 (detalhe técnico colapsável)
  /** ARC-02B · aditivo/whitelist: veredito estrutural do contrato da etapa
   *  (gerado pelo NOSSO código — distingue "motor sem resposta" de
   *  "resposta recebida e rejeitada pelo contrato", ARC-02B.2/UI-B). */
  conformidade?: {
    readonly status: "conforme" | "fora-do-contrato";
    readonly motivo?: string;
    readonly faltam?: readonly string[];
  };
  /** ARC-02B.1 · A-02: dependências obrigatórias indisponíveis (fail-closed). */
  dependenciasAusentes?: readonly string[];
  /** P4: veredito publicável DETERMINÍSTICO (Claim Guard, não o LLM) */
  veredito?: VereditoAuditoriaEpistemica;
  /** P4.1.2: veredito TEXTUAL do Auditor LLM transcrito (apresentação;
   *  NUNCA autoridade sobre o gate). */
  vereditoAuditorLlm?: string;
}

export interface PipelineResultado {
  ok: boolean;
  etapas: EtapaOrquestracao[];
  erro?: string;
  /** P4.1.2: estado composto QUALIDADE × INTEGRIDADE. */
  statusGeral?: StatusGeral;
  /** ARC-01: resumo honesto do Entendimento Canônico da entrada livre. */
  entendimento?: ResumoEntendimento;
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
        // P4.1.2: estado composto (QUALIDADE × INTEGRIDADE) vem do servidor
        statusGeral: typeof data.statusGeral === "string" ? data.statusGeral : undefined,
        // ARC-01: entendimento canônico (só existe em orquestrar-objetivo)
        entendimento: data.entendimento && typeof data.entendimento === "object" ? data.entendimento : undefined,
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

  /** CP-01 · ação ARQ-2: cadeia real a partir de um objetivo livre
   *  (página /orquestrador). Contrato de resposta IDÊNTICO à pipeline. */
  async orquestrarObjetivo(objetivo: string): Promise<PipelineResultado> {
    try {
      const response = await fetch("/api/orquestrador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "orquestrar-objetivo", objetivo }),
      });
      const data = await response.json();
      if (!response.ok) {
        return {
          ok: false,
          etapas: Array.isArray(data.etapas) ? data.etapas : [],
          erro: data.erro || "Erro ao executar a cadeia do Orquestrador.",
        };
      }
      return {
        ok: data.ok === true && Array.isArray(data.etapas) ? true : false,
        etapas: Array.isArray(data.etapas) ? data.etapas : [],
        erro: data.erro,
        // P4.1.2: estado composto (QUALIDADE × INTEGRIDADE) vem do servidor
        statusGeral: typeof data.statusGeral === "string" ? data.statusGeral : undefined,
        // ARC-01: resumo do entendimento canônico (leitura da entrada)
        entendimento: data.entendimento && typeof data.entendimento === "object" ? data.entendimento : undefined,
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
