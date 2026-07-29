// Camada de serviços — módulo CLIENTES.
// Hoje: lê dos mocks (src/lib/mock-data.ts).
// Futuro: quando o Supabase entrar, SÓ este arquivo muda.
// Read-only: nenhuma escrita até o backend existir.

import { clients } from "@/lib/mock-data";
import type { Client, ClientStatus, ClientTier } from "@/types";
import { matches, normalize } from "./_utils";

export const clientesService = {
  /** Lista todos os clientes. */
  list: (): Client[] => clients,

  /** Busca um cliente pelo id. */
  getById: (id: string): Client | undefined =>
    clients.find((client) => client.id === id),

  /** Filtra por status (Ativo, Inativo, Em onboarding). */
  filterByStatus: (status: ClientStatus): Client[] =>
    clients.filter((client) => client.status === status),

  /** Filtra por plano (Enterprise, Growth, Starter). */
  filterByTier: (tier: ClientTier): Client[] =>
    clients.filter((client) => client.tier === tier),

  /** Busca livre por nome, empresa ou e-mail. */
  search: (query: string): Client[] => {
    const q = normalize(query);
    if (!q) return clients;
    return clients.filter(
      (client) =>
        matches(client.name, q) ||
        matches(client.company, q) ||
        matches(client.email, q)
    );
  },
};