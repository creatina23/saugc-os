"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export interface WorkspaceClient {
  id: string;
  name: string;
  company: string;
  tier?: string;
}

export function useWorkspaceClient() {
  const [activeClient, setActiveClient] = useState<WorkspaceClient | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("anuncia_active_client");
    return saved ? JSON.parse(saved) : null;
  });

  const [clients, setClients] = useState<WorkspaceClient[]>([]);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (supabase) {
      supabase.from("clients").select("id, name, company, tier").then(({ data }) => {
        if (data && data.length > 0) {
          const mapped = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            company: c.company || c.name,
            tier: c.tier,
          }));
          setClients(mapped);
          if (!activeClient && mapped[0]) {
            setActiveClient(mapped[0]);
            localStorage.setItem("anuncia_active_client", JSON.stringify(mapped[0]));
          }
        }
      });
    } else {
      const mock = [
        { id: "c1", name: "Mariana Costa", company: "Vitória Moda", tier: "Enterprise" },
        { id: "c2", name: "Rafael Mendes", company: "NutriPlus", tier: "Growth" },
        { id: "c4", name: "Lucas Ferreira", company: "TechFlow SaaS", tier: "Enterprise" },
      ];
      setClients(mock);
      if (!activeClient) {
        setActiveClient(mock[0]);
        localStorage.setItem("anuncia_active_client", JSON.stringify(mock[0]));
      }
    }
  }, []);

  function selectClient(client: WorkspaceClient | null) {
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