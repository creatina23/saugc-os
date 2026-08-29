// Camada de serviços — módulo CLIENTES (Com suporte a Supabase real + fallback local)

import { clients as mockClients } from "@/lib/mock-data";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Client } from "@/types";
import { matches, normalize } from "./_utils";

export const clientesService = {
  /** Lista todos os clientes (do Supabase ou mock). */
  async list(): Promise<Client[]> {
    const supabase = getSupabaseBrowser();
    if (supabase) {
      const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((c: any) => ({
          id: c.id,
          name: c.name,
          company: c.company,
          email: c.email,
          phone: c.phone,
          tier: c.tier || "Growth",
          status: c.status || "Ativo",
          mrr: Number(c.mrr) || 0,
          logoInitials: c.logoInitials || c.name.slice(0, 2).toUpperCase(),
          since: c.since || "2026-01",
        }));
      }
    }
    return mockClients;
  },

  /** Cria um novo cliente no Supabase. */
  async create(clientData: Omit<Client, "id">): Promise<{ ok: boolean; erro?: string }> {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      return { ok: false, erro: "Supabase não configurado no navegador." };
    }

    const { error } = await supabase.from("clients").insert([
      {
        name: clientData.name,
        company: clientData.company,
        email: clientData.email,
        phone: clientData.phone,
        tier: clientData.tier,
        status: clientData.status,
        mrr: clientData.mrr,
        logoInitials: clientData.logoInitials,
        since: clientData.since,
      },
    ]);

    if (error) {
      return { ok: false, erro: error.message };
    }
    return { ok: true };
  },

  /** Exclui um cliente pelo id. */
  async delete(id: string): Promise<{ ok: boolean; erro?: string }> {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      return { ok: false, erro: "Supabase não configurado." };
    }

    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) {
      return { ok: false, erro: error.message };
    }
    return { ok: true };
  },
};