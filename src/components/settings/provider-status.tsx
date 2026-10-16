"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type Motor = { id: string; armado: boolean };
type Grupo = { titulo: string; motores: Motor[] | null };

/** Os endpoints autenticados devolvem apenas disponibilidade de configuração.
 *  Uma chave configurada não comprova conectividade, saldo ou permissão. */
export function ProviderStatus() {
  const [grupos, setGrupos] = useState<Grupo[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function carregar() {
      const resultado = await Promise.all(
        [
          { titulo: "Texto", url: "/api/ia" },
          { titulo: "Imagem", url: "/api/imagem" },
        ].map(async ({ titulo, url }): Promise<Grupo> => {
          try {
            const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
            if (!response.ok) return { titulo, motores: null };
            const dados: unknown = await response.json();
            if (!dados || typeof dados !== "object" || !("motores" in dados) || !Array.isArray(dados.motores)) {
              return { titulo, motores: null };
            }
            const motores = dados.motores.flatMap((motor: unknown): Motor[] => {
              if (!motor || typeof motor !== "object" || !("id" in motor) || !("armado" in motor)) return [];
              return typeof motor.id === "string" && typeof motor.armado === "boolean"
                ? [{ id: motor.id, armado: motor.armado }]
                : [];
            });
            return { titulo, motores };
          } catch {
            return { titulo, motores: null };
          }
        })
      );
      if (!controller.signal.aborted) setGrupos(resultado);
    }
    void carregar();
    return () => controller.abort();
  }, []);

  if (!grupos) return <p role="status" className="text-sm text-muted-foreground">Consultando configuração dos provedores…</p>;

  return (
    <div className="space-y-4">
      {grupos.map(({ titulo, motores }) => (
        <div key={titulo} className="space-y-2">
          <h3 className="text-sm font-medium">{titulo}</h3>
          {motores === null ? (
            <p role="status" className="text-sm text-muted-foreground">Status indisponível. Verifique sua sessão e tente novamente mais tarde.</p>
          ) : motores.map(({ id, armado }) => (
            <div key={id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <span className="text-sm">{id}</span>
              <Badge variant={armado ? "success" : "outline"}>{armado ? "Configurado" : "Não configurado"}</Badge>
            </div>
          ))}
        </div>
      ))}
      <p className="text-xs text-muted-foreground">O status indica somente configuração no servidor; não valida conexão nem cota. Outras integrações não são verificadas nesta tela.</p>
    </div>
  );
}
