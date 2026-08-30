// Camada de serviços — módulo CLIENTES.

import { clients } from "@/lib/mock-data";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Client, ClientStatus, ClientTier } from "@/types";
import { matches, normalize } from "./_utils";

export const clientesService = {
  list: (): Client[] => clients,

  getById: (id: string): Client | undefined =>
    clients.find((client) => client.id === id),

  filterByStatus: (status: ClientStatus): Client[] =>
    clients.filter((client) => client.status === status),

  filterByTier: (tier: ClientTier): Client[] =>
    clients.filter((client) => client.tier === tier),

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

  async create(clientData: Omit<Client, "id">): Promise<{ ok: boolean; erro?: string; cliente?: Client }> {
    const newId = "cli_" + Date.now();
    const novo: Client = {
      id: newId,
      ...clientData,
    };

    clients.unshift(novo);

    try {
      const supabase = getSupabaseBrowser();
      if (supabase) {
        await supabase.from("clients").insert([
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
      }
    } catch (e) {
      console.warn("Supabase insert ignorado, mantido local:", e);
    }

    return { ok: true, cliente: novo };
  },

  async delete(id: string): Promise<{ ok: boolean; erro?: string }> {
    try {
      const index = clients.findIndex((c) => c.id === id);
      if (index !== -1) {
        clients.splice(index, 1);
      }

      const supabase = getSupabaseBrowser();
      if (supabase && id && !id.startsWith("cli_")) {
        await supabase.from("clients").delete().eq("id", id);
      }
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      return { ok: false, erro: msg };
    }
  },
};