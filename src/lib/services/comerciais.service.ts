// Camada de serviços — módulo COMERCIAIS (Kanban de anúncios UGC).

import { commercials } from "@/lib/mock-data";
import type { Commercial, CommercialFormat, CommercialStatus } from "@/types";
import { matches, normalize } from "./_utils";

/** Ordem oficial das colunas do Kanban. */
export const commercialStatusOrder: CommercialStatus[] = [
  "Rascunho",
  "Produção",
  "Revisão",
  "Aprovado",
];

export const comerciaisService = {
  /** Lista todos os comerciais. */
  list: (): Commercial[] => commercials,

  /** Busca um comercial pelo id. */
  getById: (id: string): Commercial | undefined =>
    commercials.find((commercial) => commercial.id === id),

  /** Filtra por status (coluna do Kanban). */
  filterByStatus: (status: CommercialStatus): Commercial[] =>
    commercials.filter((commercial) => commercial.status === status),

  /** Filtra por formato (Reels, TikTok, Shorts, Feed). */
  filterByFormat: (format: CommercialFormat): Commercial[] =>
    commercials.filter((commercial) => commercial.format === format),

  /** Agrupa por status na ordem do Kanban (mantém colunas vazias). */
  groupByStatus: (): Record<CommercialStatus, Commercial[]> => {
    const groups: Record<CommercialStatus, Commercial[]> = {
      Rascunho: [],
      "Produção": [],
      "Revisão": [],
      Aprovado: [],
    };
    for (const commercial of commercials) {
      groups[commercial.status].push(commercial);
    }
    return groups;
  },

  /** Busca livre por título, cliente ou creator. */
  search: (query: string): Commercial[] => {
    const q = normalize(query);
    if (!q) return commercials;
    return commercials.filter(
      (commercial) =>
        matches(commercial.title, q) ||
        matches(commercial.client, q) ||
        matches(commercial.creator, q)
    );
  },
};