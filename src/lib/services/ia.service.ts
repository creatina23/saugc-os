// Camada de serviços — módulo IA STUDIO (modelos + histórico).

import { aiHistory, aiModels } from "@/lib/mock-data";
import type { AiHistoryItem, AiModel, AiModelCategory } from "@/types";
import { matches, normalize } from "./_utils";

export const iaService = {
  /** Lista todos os modelos de IA. */
  listModels: (): AiModel[] => aiModels,

  /** Busca um modelo pelo id. */
  getModelById: (id: string): AiModel | undefined =>
    aiModels.find((model) => model.id === id),

  /** Filtra modelos por categoria (Texto, Imagem, Vídeo). */
  filterModelsByCategory: (category: AiModelCategory): AiModel[] =>
    aiModels.filter((model) => model.category === category),

  /** Busca livre entre modelos por nome, provedor ou descrição. */
  searchModels: (query: string): AiModel[] => {
    const q = normalize(query);
    if (!q) return aiModels;
    return aiModels.filter(
      (model) =>
        matches(model.name, q) ||
        matches(model.provider, q) ||
        matches(model.description, q)
    );
  },

  /** Lista o histórico de gerações. */
  listHistory: (): AiHistoryItem[] => aiHistory,

  /** Filtra o histórico por agente (ex.: "AI Copywriter"). */
  getHistoryByAgent: (agent: string): AiHistoryItem[] =>
    aiHistory.filter((item) => item.agent === agent),
};