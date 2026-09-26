// TR-04.8D.2c-2 — ATTENTION PANEL (apresentação).
// ---------------------------------------------------------------------
// Estritamente apresentacional: NÃO consulta Supabase e NÃO duplica as
// regras R1/R2/R3/R4/R6 — a Truth dos sinais vive exclusivamente em
// src/lib/attention.ts (motor puro). O painel só decide APRESENTAÇÃO:
// agrupamento visual, limite de 5 posições, níveis em texto e estados.
// Sem hooks/handlers → sem "use client" (renderiza na árvore do pai).

import Link from "next/link";
import { ArrowRight, Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { NivelAtencao, SinalAtencao } from "@/lib/attention";
import { cn } from "@/lib/utils";

import { agruparSinaisPorEntidade } from "@/components/dashboard/agrupamento-attention";

// Limite APRESENTACIONAL (o motor retorna todos os sinais; quem fatia é o
// consumidor — decisão aprovada na TR-04.8D.2c-A, item 7).
const MAX_POSICOES = 5;

const NIVEL_TEXTO: Record<NivelAtencao, string> = {
  prioridade: "Prioridade",
  acompanhar: "Acompanhar",
  informacao: "Informação",
};

// Cor reforça o nível, mas o nível SEMPRE aparece em texto (acessibilidade:
// cor nunca é o único canal). Tokens do sistema visual existente.
const NIVEL_BLOCO: Record<NivelAtencao, string> = {
  prioridade: "border-l-destructive",
  acompanhar: "border-l-warning",
  informacao: "border-l-primary",
};

const NIVEL_BADGE: Record<NivelAtencao, string> = {
  prioridade: "border-destructive/40 bg-destructive/10 text-destructive",
  acompanhar: "border-warning/40 bg-warning/10 text-warning",
  informacao: "border-primary/40 bg-primary/10 text-primary",
};

// TR-04.8D.2c-2 (Correção 2): o agrupamento apresentacional (identidade
// estrutural via sinal.id — nunca via titulo) vive em
// agrupamento-attention.ts, puro e testável.

interface AttentionPanelProps {
  /** Sinais calculados pelo motor (src/lib/attention.ts) — já ordenados. */
  sinais: SinalAtencao[];
  /** Modo demonstração: sem suporte honesto, exibe a mensagem padrão. */
  modoDemo?: boolean;
  /** Há fontes com falha → a análise está parcial (não esconder). */
  analiseParcial?: boolean;
}

export function AttentionPanel({ sinais, modoDemo = false, analiseParcial = false }: AttentionPanelProps) {
  const grupos = agruparSinaisPorEntidade(sinais);
  const visiveis = grupos.slice(0, MAX_POSICOES);
  const sinaisOcultos = grupos
    .slice(MAX_POSICOES)
    .reduce((total, grupo) => total + grupo.sinais.length, 0);
  // Demo: ausência de suporte honesto (motor não recebeu dados suficientes)
  // → mensagem padrão. Se algum dia os mocks suportarem uma regra, os
  // sinais reais aparecem — nada é fabricado.
  const semSuporteDemo = modoDemo && sinais.length === 0;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Bell className="size-4" />
          </div>
          <div className="min-w-0">
            <h2 id="titulo-attention-panel" className="text-sm font-semibold">
              O que merece atenção
            </h2>
            <p className="text-xs text-muted-foreground">
              Sinais calculados por regras explícitas sobre os dados carregados — sem previsão e sem recomendação automática.
            </p>
          </div>
        </div>

        {analiseParcial && (
          <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            Algumas fontes não carregaram; a análise está parcial.
          </p>
        )}

        {semSuporteDemo ? (
          <p className="mt-4 rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
            Não disponível na demonstração.
          </p>
        ) : sinais.length === 0 ? (
          // READY sem sinais: factual e positivo. Ausência de sinal ≠ ausência
          // de problema — nenhum julgamento sobre a saúde do negócio.
          <p className="mt-4 rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhum sinal operacional identificado com os dados disponíveis.
          </p>
        ) : (
          <>
            <ul
              aria-labelledby="titulo-attention-panel"
              className="mt-4 space-y-3"
            >
              {visiveis.map((grupo) => (
                <li
                  key={grupo.chave}
                  className={cn(
                    "rounded-xl border border-border/60 border-l-4 bg-background/40 p-4",
                    NIVEL_BLOCO[grupo.nivel]
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", NIVEL_BADGE[grupo.nivel])}
                        >
                          {NIVEL_TEXTO[grupo.nivel]}
                        </Badge>
                        {grupo.entidade && (
                          <span className="truncate text-sm font-semibold">
                            {grupo.entidade}
                          </span>
                        )}
                      </div>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground marker:text-muted-foreground/60">
                        {grupo.fatos.map((fato, indice) => (
                          <li key={`${grupo.chave}-fato-${indice}`}>{fato}</li>
                        ))}
                      </ul>
                    </div>
                    {grupo.destino && (
                      <Link
                        href={grupo.destino.href}
                        className="inline-flex h-11 shrink-0 items-center gap-1.5 self-start rounded-lg border border-border px-3 text-xs font-semibold transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:self-center"
                      >
                        {grupo.destino.rotulo}
                        <ArrowRight className="size-3.5" />
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {sinaisOcultos > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                + {sinaisOcultos} outro{sinaisOcultos === 1 ? "" : "s"} sinal{sinaisOcultos === 1 ? "" : "is"} não exibido{sinaisOcultos === 1 ? "" : "s"} (limite de {MAX_POSICOES} posições).
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
