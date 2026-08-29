// Camada de serviços — módulo CLIENTES.

import { clients } from "@/lib/mock-data";
import { getSupabaseBrowser } from "@/lib/supabase/client";
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

  /** Cria um novo cliente (mock local + opcional Supabase). */
  async create(clientData: Omit<Client, "id">): Promise<{ ok: boolean; erro?: string; cliente?: Client }> {
    const newId = "cli_" + Date.now();
    const novo: Client = {
      id: newId,
      ...clientData,
    };

    // Adiciona no topo do array local de mock para refletir na hora
    clients.unshift(novo);

    const supabase = getSupabaseBrowser();
    if (supabase) {
      const { error } = await supabase.from("clients").insert([
        {
          name: novo.name,
          company: novo.company,
          email: novo.email,
          phone: novo.phone,
          tier: novo.tier,
          status: novo.status,
          mrr: novo.mrr,
          logoInitials: novo.logoInitials,
          since: novo.since,
        },
      ]);
      if (error) {
        console.warn("Aviso Supabase (cliente salvo localmente):", error.message);
      }
    }
    return { ok: true, cliente: novo };
  },

  /** Exclui um cliente pelo id. */
  async delete(id: string): Promise<{ ok: boolean; erro?: string }> {
    // Remove do array local de mock independentemente do ID
    const index = clients.findIndex((c) => c.id === id);
    if (index !== -1) {
      clients.splice(index, 1);
    }

    const supabase = getSupabaseBrowser();
    if (supabase && !id.startsWith("cli_")) {
      // Se for um UUID real do Supabase, deleta no banco
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) {
        return { ok: false, erro: error.message };
      }
    }
    return { ok: true };
  },
};