// Camada de serviços — módulo BRIEFINGS.

import { briefings } from "@/lib/mock-data";
import type { Briefing, BriefingStatus } from "@/types";
import { matches, normalize } from "./_utils";

export const briefingsService = {
  /** Lista todos os briefings. */
  list: (): Briefing[] => briefings,

  /** Busca um briefing pelo id. */
  getById: (id: string): Briefing | undefined =>
    briefings.find((briefing) => briefing.id === id),

  /** Filtra por status (Em Aprovação, Aprovado, Rascunho). */
  filterByStatus: (status: BriefingStatus): Briefing[] =>
    briefings.filter((briefing) => briefing.status === status),

  /** Lista briefings de um cliente (pelo nome). */
  getByClient: (clientName: string): Briefing[] =>
    briefings.filter((briefing) => briefing.client === clientName),

  /** Lista briefings de um creator (pelo nome). */
  filterByCreator: (creator: string): Briefing[] =>
    briefings.filter((briefing) => briefing.creator === creator),

  /** Busca livre por título, cliente ou creator. */
  search: (query: string): Briefing[] => {
    const q = normalize(query);
    if (!q) return briefings;
    return briefings.filter(
      (briefing) =>
        matches(briefing.title, q) ||
        matches(briefing.client, q) ||
        matches(briefing.creator, q)
    );
  },
};