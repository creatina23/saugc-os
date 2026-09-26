// TR-04.8D.2b: Top 5 por Investimento (spend DESC) — "top" = maior gasto,
// não "melhor desempenho".
// TR-04.8D.2c-0: movido 1:1 de src/app/dashboard-view.tsx.
import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, formatNumber, formatPercent } from "@/lib/format";

import type { TopCampanha } from "./types";
import { brl2 } from "./utils";

export function TopInvestimento({
  campanhas,
  erro,
}: {
  campanhas: TopCampanha[] | null;
  erro: string | null;
}) {
  return (
    <Card className="lg:col-span-6 card-glow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <BarChart3 className="size-4 text-ai" /> Top 5 por Investimento
        </CardTitle>
        <CardDescription>
          As 5 campanhas com maior investimento — maior gasto, não necessariamente
          melhor desempenho
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {campanhas === null ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Não disponível na demonstração — o dataset demo não inclui campanhas
            individuais. Conecte o Supabase para ver as reais.
          </p>
        ) : erro ? (
          <p role="alert" className="py-6 text-center text-sm text-destructive">
            Campanhas indisponíveis — a tabela não pode ser exibida (isso não é
            zero). Detalhe técnico: {erro}
          </p>
        ) : campanhas.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma campanha cadastrada ainda. Crie a primeira em Campanhas.
          </p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50 text-left text-muted-foreground">
                <th className="py-1.5 pr-2 font-medium">Campanha</th>
                <th className="py-1.5 pr-2 text-right font-medium">Investido</th>
                <th className="hidden py-1.5 pr-2 text-right font-medium md:table-cell">CTR</th>
                <th className="hidden py-1.5 pr-2 text-right font-medium md:table-cell">CPC</th>
                <th className="py-1.5 pr-2 text-right font-medium">CPA</th>
                <th className="py-1.5 text-right font-medium">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {campanhas.map((c) => {
                const ctr =
                  c.impressions > 0
                    ? formatPercent((c.clicks / c.impressions) * 100)
                    : "—";
                const cpc = c.clicks > 0 ? brl2(c.spend / c.clicks) : "—";
                const cpa = c.conversions > 0 ? formatBRL(c.spend / c.conversions) : "—";
                const roas =
                  c.spend > 0
                    ? `${(c.revenue / c.spend).toFixed(1).replace(".", ",")}x`
                    : "—";
                return (
                  <tr key={c.id} className="border-b border-border/30 last:border-0">
                    <td className="max-w-[140px] truncate py-1.5 pr-2 font-medium" title={c.nome}>
                      {c.nome}
                    </td>
                    <td className="py-1.5 pr-2 text-right tabular-nums">{formatBRL(c.spend)}</td>
                    <td
                      className="hidden py-1.5 pr-2 text-right tabular-nums md:table-cell"
                      title={
                        c.impressions > 0
                          ? `CTR = cliques ÷ impressões (${formatNumber(c.clicks)} ÷ ${formatNumber(c.impressions)})`
                          : "Sem impressões registradas"
                      }
                    >
                      {ctr}
                    </td>
                    <td
                      className="hidden py-1.5 pr-2 text-right tabular-nums md:table-cell"
                      title={
                        c.clicks > 0
                          ? `CPC = investido ÷ cliques (${formatBRL(c.spend)} ÷ ${formatNumber(c.clicks)})`
                          : "Sem cliques registrados"
                      }
                    >
                      {cpc}
                    </td>
                    <td
                      className="py-1.5 pr-2 text-right tabular-nums"
                      title={
                        c.conversions > 0
                          ? `CPA = investido ÷ conversões (${formatBRL(c.spend)} ÷ ${formatNumber(c.conversions)})`
                          : "Sem conversões registradas"
                      }
                    >
                      {cpa}
                    </td>
                    <td
                      className="py-1.5 text-right tabular-nums"
                      title="ROAS = receita ÷ investido"
                    >
                      {roas}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
