// TR-04.8D.2b: cartão de status operacional (reutilizado por campanhas,
// briefings e comerciais — mesma anatomia, erro/vazio próprios por fonte).
// TR-04.8D.2c-0: movido 1:1 de src/app/dashboard-view.tsx. Sem "use client":
// não possui hooks/handlers — é renderizado dentro da árvore client do pai.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

import type { ContagemRotulo } from "./types";

// TR-04.8D.2b: cor por status conhecido (mesma semântica dos módulos);
// status desconhecido recebe cor neutra — a informação nunca depende só da
// cor (legenda com nome + contagem sempre visível).
const CORES_STATUS: Record<string, string> = {
  Ativa: "bg-success",
  Aprovado: "bg-success",
  Pausada: "bg-warning",
  "Em Aprovação": "bg-warning",
  Revisão: "bg-warning",
  Produção: "bg-primary",
  Rascunho: "bg-muted-foreground",
  "Sem status": "bg-border",
  "Sem categoria": "bg-border",
};
const COR_STATUS_NEUTRA = "bg-muted-foreground/60";

export function StatusCard({
  titulo,
  icone: Icone,
  itens,
  erro,
  textoVazio,
}: {
  titulo: string;
  icone: LucideIcon;
  itens: ContagemRotulo[] | null;
  erro: string | null;
  textoVazio: string;
}) {
  const total = itens?.reduce((acc, i) => acc + i.quantidade, 0) ?? 0;
  return (
    <Card className="lg:col-span-4 card-glow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Icone className="size-4 text-primary" /> {titulo}
        </CardTitle>
        <CardDescription>
          {itens === null
            ? "Não disponível na demonstração"
            : erro
              ? "Fonte indisponível neste momento"
              : `${total} registro${total === 1 ? "" : "s"} na base`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {itens === null ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Não disponível na demonstração — o dataset demo não inclui esses
            dados. Conecte o Supabase para ver os números reais.
          </p>
        ) : erro ? (
          <p role="alert" className="py-6 text-center text-sm text-destructive">
            Fonte indisponível — isso não é zero. Detalhe técnico: {erro}
          </p>
        ) : itens.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{textoVazio}</p>
        ) : (
          <>
            <div
              className="flex h-3 w-full overflow-hidden rounded-full bg-muted/60"
              role="img"
              aria-label={`${titulo}: ${itens
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
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
              {itens.map((i) => (
                <span key={i.rotulo} className="flex items-center gap-1.5">
                  <span
                    className={cn("size-2.5 rounded-full", CORES_STATUS[i.rotulo] ?? COR_STATUS_NEUTRA)}
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
      </CardContent>
    </Card>
  );
}
