// TR-04.8D.2b: ROAS real vs meta — somente campanhas com meta válida.
// TR-04.8D.2c-0: movido 1:1 de src/app/dashboard-view.tsx (regra inclusa).
import { TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { RoasMeta } from "./types";

// TR-04.8D.2b: REGRA DO SISTEMA (documentada na própria UI, não é verdade
// universal): ROAS real ÷ meta ≥ 100% = "Na meta"; 70–99% = "Abaixo da meta";
// < 70% = "Muito abaixo". Sem meta válida ou sem investido: sem classificação.
function classificarRoas(roas: number, meta: number): { rotulo: string; classe: string } {
  const pct = roas / meta;
  if (pct >= 1) return { rotulo: "Na meta", classe: "text-success" };
  if (pct >= 0.7) return { rotulo: "Abaixo da meta", classe: "text-warning" };
  return { rotulo: "Muito abaixo", classe: "text-destructive" };
}

export function RoasVsMeta({
  linhas,
  erro,
}: {
  linhas: RoasMeta[] | null;
  erro: string | null;
}) {
  return (
    <Card className="lg:col-span-6 card-glow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" /> ROAS vs Meta
        </CardTitle>
        <CardDescription>
          Campanhas com meta definida — ROAS real (receita ÷ investido) comparado à meta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-2">
        <p className="rounded-lg border border-border/50 bg-surface/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          Regra do sistema: <span className="font-semibold text-success">na meta</span> ≥ 100%
          da meta · <span className="font-semibold text-warning">abaixo</span> 70–99% ·{" "}
          <span className="font-semibold text-destructive">muito abaixo</span> &lt; 70%. Sem
          meta ou sem investido não há classificação.
        </p>
        {linhas === null ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Não disponível na demonstração — o dataset demo não inclui metas
            de ROAS. Conecte o Supabase para comparar metas reais.
          </p>
        ) : erro ? (
          <p role="alert" className="py-6 text-center text-sm text-destructive">
            Campanhas indisponíveis — a comparação com metas não pode ser exibida
            (isso não é zero). Detalhe técnico: {erro}
          </p>
        ) : linhas.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma campanha com meta de ROAS definida. Defina metas na página
            Campanhas para compará-las aqui.
          </p>
        ) : (
          linhas.map((c) => {
            const classif =
              c.roasReal === null ? null : classificarRoas(c.roasReal, c.meta);
            return (
              <div
                key={c.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-surface/40 px-3 py-2.5 text-xs"
              >
                <span className="min-w-0 flex-1 truncate font-medium" title={c.nome}>
                  {c.nome}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  ROAS{" "}
                  <span className="font-semibold text-foreground">
                    {c.roasReal === null
                      ? "—"
                      : `${c.roasReal.toFixed(1).replace(".", ",")}x`}
                  </span>{" "}
                  · meta{" "}
                  <span className="font-semibold text-foreground">
                    {c.meta.toFixed(1).replace(".", ",")}x
                  </span>
                </span>
                {classif ? (
                  <span className={cn("shrink-0 font-semibold", classif.classe)}>
                    {classif.rotulo}
                  </span>
                ) : (
                  <span className="shrink-0 font-medium text-muted-foreground">
                    Sem investido
                  </span>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
