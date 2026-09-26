// TR-04.8D.2c-3B — ESTADO DA OPERAÇÃO: superfície única com três grupos
// independentes (Campanhas, Briefings, Comerciais). Substitui VISUALMENTE os
// três StatusCards lado a lado; nada de dados muda — cada grupo continua
// recebendo `itens` (ContagemRotulo[] | null) e `erro` da SUA fonte:
// - erro de uma fonte NUNCA contamina as outras;
// - erro NUNCA vira zero ("isso não é zero" preservado);
// - null = "Não disponível na demonstração" (demo isolation preservada);
// - status desconhecidos/"Sem status" continuam aparecendo (contarPorRotulo
//   no orquestrador já garante; aqui só apresentação).
// Sem "use client": sem hooks/handlers — renderiza na árvore client do pai.
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

import { CORES_STATUS, COR_STATUS_NEUTRA } from "./status-cores";
import type { ContagemRotulo } from "./types";

export interface GrupoEstadoOperacao {
  chave: string;
  rotulo: string;
  icone: LucideIcon;
  itens: ContagemRotulo[] | null;
  erro: string | null;
  textoVazio: string;
}

export function EstadoOperacao({ grupos }: { grupos: GrupoEstadoOperacao[] }) {
  return (
    <Card className="lg:col-span-6 card-glow">
      <CardContent className="p-5">
        <h3 className="text-base font-semibold">Estado da Operação</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Distribuição real por status — campanhas, briefings e comerciais.
        </p>
        <div className="mt-4 space-y-5">
          {grupos.map((grupo) => (
            <GrupoEstado key={grupo.chave} grupo={grupo} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GrupoEstado({ grupo }: { grupo: GrupoEstadoOperacao }) {
  const Icone = grupo.icone;
  const { itens, erro, textoVazio } = grupo;
  const total = itens?.reduce((acc, i) => acc + i.quantidade, 0) ?? 0;
  return (
    <section aria-label={`Estado da operação — ${grupo.rotulo}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Icone className="size-4 text-primary" /> {grupo.rotulo}
        </p>
        <p className="text-xs text-muted-foreground">
          {itens === null
            ? "Não disponível na demonstração"
            : erro
              ? "Fonte indisponível neste momento"
              : `${total} registro${total === 1 ? "" : "s"} na base`}
        </p>
      </div>
      {itens === null ? (
        <p className="mt-2 rounded-lg border border-dashed border-border/60 px-3 py-3 text-center text-xs text-muted-foreground">
          Não disponível na demonstração — o dataset demo não inclui esses
          dados. Conecte o Supabase para ver os números reais.
        </p>
      ) : erro ? (
        <p
          role="alert"
          className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-3 text-center text-xs text-destructive"
        >
          Fonte indisponível — isso não é zero. Detalhe técnico: {erro}
        </p>
      ) : itens.length === 0 ? (
        <p className="mt-2 rounded-lg border border-dashed border-border/60 px-3 py-3 text-center text-xs text-muted-foreground">
          {textoVazio}
        </p>
      ) : (
        <>
          <div
            className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-muted/60"
            role="img"
            aria-label={`${grupo.rotulo}: ${itens
              .map((i) => `${i.rotulo} ${i.quantidade}`)
              .join(", ")} — total ${total}`}
          >
            {itens.map((i) => (
              <div
                key={i.rotulo}
                style={{ width: `${(i.quantidade / Math.max(1, total)) * 100}%` }}
                className={cn("h-full", CORES_STATUS[i.rotulo] ?? COR_STATUS_NEUTRA)}
                title={`${i.rotulo}: ${i.quantidade}`}
              />
            ))}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {itens.map((i) => (
              <span key={i.rotulo} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "size-2.5 rounded-full",
                    CORES_STATUS[i.rotulo] ?? COR_STATUS_NEUTRA
                  )}
                  aria-hidden="true"
                />
                <span className="text-muted-foreground">{i.rotulo}</span>
                <span className="font-semibold tabular-nums">{i.quantidade}</span>
              </span>
            ))}
            <span className="ml-auto text-muted-foreground">
              Total <span className="font-semibold tabular-nums text-foreground">{total}</span>
            </span>
          </div>
        </>
      )}
    </section>
  );
}
