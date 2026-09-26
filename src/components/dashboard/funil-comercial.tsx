// TR-04.8D.2a: Funil Comercial por VALOR (R$) — deals reais.
// TR-04.8D.2c-0: movido 1:1 de src/app/dashboard-view.tsx.
import Link from "next/link";
import { Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/format";

import type { FunilValorEtapa } from "./types";

export function FunilComercial({
  oportunidadesAbertas,
  pipelineAberto,
  ticketMedioAberto,
  funilValor,
  erro,
}: {
  oportunidadesAbertas: number;
  pipelineAberto: number;
  ticketMedioAberto: number | null;
  funilValor: FunilValorEtapa[];
  erro: string | null;
}) {
  const maxFunilValor = Math.max(1, ...funilValor.map((e) => e.valor));
  return (
    <Card className="lg:col-span-6 card-glow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Target className="size-4 text-success" /> Funil Comercial
          </CardTitle>
          <CardDescription>Valor em aberto por etapa (negócios não fechados)</CardDescription>
        </div>
        <Link href="/crm">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">Ver CRM</Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {erro ? (
          <p role="alert" className="text-sm text-destructive py-8 text-center">
            Negociações indisponíveis — o funil não pode ser exibido (isso não
            é zero). Detalhe técnico: {erro}
          </p>
        ) : oportunidadesAbertas === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Nenhuma oportunidade aberta. Crie negócios no CRM e o funil
            aparece aqui com o valor real de cada etapa.
          </p>
        ) : (
        <>
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/50 bg-surface/40 p-3 text-center">
            <div>
              <p className="text-[11px] text-muted-foreground">Abertas</p>
              <p className="text-sm font-bold tabular-nums">{oportunidadesAbertas}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Pipeline aberto</p>
              <p className="text-sm font-bold tabular-nums text-success">{formatBRL(pipelineAberto)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Ticket médio</p>
              <p className="text-sm font-bold tabular-nums">
                {ticketMedioAberto === null ? "—" : formatBRL(ticketMedioAberto)}
              </p>
            </div>
          </div>
          {funilValor.map((etapa) => {
            const pct = Math.max(4, Math.round((etapa.valor / maxFunilValor) * 100));
            return (
              <div key={etapa.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">{etapa.stage}</span>
                  <span className="font-bold text-foreground tabular-nums">
                    {formatBRL(etapa.valor)}
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      ({etapa.quantidade} {etapa.quantidade === 1 ? "negócio" : "negócios"})
                    </span>
                  </span>
                </div>
                <div
                  className="h-2 w-full rounded-full bg-muted/60 overflow-hidden"
                  title={`${etapa.stage}: ${formatBRL(etapa.valor)} em ${etapa.quantidade} negócio(s)`}
                >
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-success/80 to-success transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  />
                </div>
              </div>
            );
          })}
        </>
        )}
      </CardContent>
    </Card>
  );
}
