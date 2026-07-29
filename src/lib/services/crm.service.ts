// Camada de serviços — módulo CRM (deals + pipeline).
// Base da Sprint 004 (CRM & Pipeline). Hoje alimenta o widget do Dashboard.

import { deals, pipelineValueByStage } from "@/lib/mock-data";
import type { Deal, DealStage } from "@/types";
import { matches, normalize } from "./_utils";

/** Ordem oficial das etapas do funil. */
export const dealStageOrder: DealStage[] = [
  "Qualificação",
  "Proposta Enviada",
  "Negociação",
  "Contrato Fechado",
];

export const crmService = {
  /** Lista todos os deals. */
  listDeals: (): Deal[] => deals,

  /** Busca um deal pelo id. */
  getDealById: (id: string): Deal | undefined =>
    deals.find((deal) => deal.id === id),

  /** Filtra deals por etapa do funil. */
  filterDealsByStage: (stage: DealStage): Deal[] =>
    deals.filter((deal) => deal.stage === stage),

  /** Agrupa deals por etapa na ordem do funil (mantém etapas vazias). */
  groupDealsByStage: (): Record<DealStage, Deal[]> => {
    const groups: Record<DealStage, Deal[]> = {
      "Qualificação": [],
      "Proposta Enviada": [],
      "Negociação": [],
      "Contrato Fechado": [],
    };
    for (const deal of deals) {
      groups[deal.stage].push(deal);
    }
    return groups;
  },

  /** Valor somado por etapa do funil. */
  getPipelineValueByStage: (): typeof pipelineValueByStage =>
    pipelineValueByStage,

  /** Valor total do pipeline (soma de todas as etapas). */
  getTotalPipelineValue: (): number =>
    Object.values(pipelineValueByStage).reduce(
      (total, value) => total + value,
      0
    ),

  /** Busca livre por título ou empresa. */
  searchDeals: (query: string): Deal[] => {
    const q = normalize(query);
    if (!q) return deals;
    return deals.filter(
      (deal) => matches(deal.title, q) || matches(deal.company, q)
    );
  },
};