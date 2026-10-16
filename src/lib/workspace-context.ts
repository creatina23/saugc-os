"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export interface WorkspaceClient {
  id: string;
  name: string;
  company: string;
  tier?: string;
}

type LinhaWorkspaceClient = { id: string; name: string; company: string | null; tier?: string };

async function consultarClientesWorkspace(): Promise<WorkspaceClient[]> {
  const supabase = getSupabaseBrowser();
  if (supabase) {
    const { data } = await supabase.from("clients").select("id, name, company, tier");
    return (data ?? []).map((c: LinhaWorkspaceClient) => ({
      id: c.id, name: c.name, company: c.company || c.name, tier: c.tier,
    }));
  }
  return [
    { id: "c1", name: "Mariana Costa", company: "Vitória Moda", tier: "Enterprise" },
    { id: "c2", name: "Rafael Mendes", company: "NutriPlus", tier: "Growth" },
    { id: "c4", name: "Lucas Ferreira", company: "TechFlow SaaS", tier: "Enterprise" },
  ];
}

export function useWorkspaceClient() {
  const [activeClient, setActiveClient] = useState<WorkspaceClient | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem("anuncia_active_client");
      const parsed: unknown = saved ? JSON.parse(saved) : null;
      if (!parsed || typeof parsed !== "object" || !("id" in parsed) || !("name" in parsed) || !("company" in parsed)) return null;
      return typeof parsed.id === "string" && typeof parsed.name === "string" && typeof parsed.company === "string"
        ? parsed as WorkspaceClient : null;
    } catch {
      return null;
    }
  });

  const [clients, setClients] = useState<WorkspaceClient[]>([]);

  const activeClientRef = useRef(activeClient);
  useEffect(() => {
    let ativo = true;
    async function carregar() {
      const mapped = await consultarClientesWorkspace();
      if (!ativo) return;
      setClients(mapped);
      if (!activeClientRef.current && mapped[0]) {
        activeClientRef.current = mapped[0];
        setActiveClient(mapped[0]);
        localStorage.setItem("anuncia_active_client", JSON.stringify(mapped[0]));
      }
    }
    void carregar();
    return () => { ativo = false; };
  }, []);

  function selectClient(client: WorkspaceClient | null) {
    activeClientRef.current = client;
    setActiveClient(client);
    if (client) {
      localStorage.setItem("anuncia_active_client", JSON.stringify(client));
    } else {
      localStorage.removeItem("anuncia_active_client");
    }
    window.dispatchEvent(new Event("anuncia_client_change"));
  }

  return { activeClient, clients, selectClient };
}