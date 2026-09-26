// TR-04.8D.2a: Performance por Canal — descritivo, sem recomendação.
// TR-04.8D.2c-0: movido 1:1 de src/app/dashboard-view.tsx.
import { PieChart } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { CanalPerformance } from "./types";
import { brl2 } from "./utils";

const coresPlataforma: Record<string, string> = {
  "Meta Ads": "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]",
  "Google Ads": "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]",
  TikTok: "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.4)]",
};

export function PerformanceCanal({
  canais,
  erro,
}: {
  canais: CanalPerformance[];
  erro: string | null;
}) {
  // TR-04.8D.2a: escala única p/ comparar investido × retorno no mesmo eixo.
  const maxCanal = Math.max(1, ...canais.flatMap((c) => [c.spend, c.revenue]));
  return (
    <Card className="lg:col-span-6 card-glow">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <PieChart className="size-4 text-ai" /> Performance por Canal
        </CardTitle>
        <CardDescription>Como os canais estão performando — investido, retorno e eficiência (dados reais das campanhas)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-2">
        {erro ? (
          <p role="alert" className="text-sm text-destructive py-8 text-center">
            Campanhas indisponíveis — o desempenho por canal não pode ser
            exibido (isso não é zero). Detalhe técnico: {erro}
          </p>
        ) : canais.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Nenhuma campanha cadastrada ainda. Crie a primeira em Campanhas.
          </p>
        ) : (
        canais.map((canal) => {
          const corBarra = coresPlataforma[canal.platform] || "bg-primary";
          const roi = canal.spend > 0 ? canal.revenue / canal.spend : null;
          const roiTexto = roi === null ? "—" : `${roi.toFixed(1).replace(".", ",")}x`;
          // Correção 8D.2a: ROI do canal é DESCRITIVO e visualmente neutro —
          // não há meta de ROI por canal que justifique semáforo aqui. O
          // semáforo real (roas vs roas_meta) entra na 8D.2b.
          // Denominador zero ⇒ "—", nunca zero falso.
          const ctr = canal.impressions > 0 ? formatPercent((canal.clicks / canal.impressions) * 100) : "—";
          const cpc = canal.clicks > 0 ? brl2(canal.spend / canal.clicks) : "—";
          const cpa = canal.conversions > 0 ? formatBRL(canal.spend / canal.conversions) : "—";
          const pctSpend = canal.spend > 0 ? Math.max(2, Math.round((canal.spend / maxCanal) * 100)) : 0;
          const pctRetorno = canal.revenue > 0 ? Math.max(2, Math.round((canal.revenue / maxCanal) * 100)) : 0;
          return (
            <div key={canal.platform} className="space-y-2.5 rounded-xl border border-border/50 bg-surface/40 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={cn("size-3 shrink-0 rounded-full", corBarra)} />
                  <span className="truncate text-sm font-semibold">{canal.platform}</span>
                </div>
                <span
                  className="shrink-0 text-xs font-bold tabular-nums text-foreground"
                  title="ROI = retorno ÷ investido"
                >
                  {roiTexto} ROI
                </span>
              </div>
              <div
                className="space-y-1.5"
                role="img"
                aria-label={`${canal.platform}: investido ${formatBRL(canal.spend)}, retorno ${formatBRL(canal.revenue)}, ${formatNumber(canal.conversions)} conversões, ROI ${roiTexto}`}
              >
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="w-16 shrink-0 text-muted-foreground">Investido</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/60">
                    <div
                      style={{ width: `${pctSpend}%` }}
                      className="h-full rounded-full bg-primary/60 transition-all duration-500"
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right font-medium tabular-nums">{formatBRL(canal.spend)}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="w-16 shrink-0 text-muted-foreground">Retorno</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/60">
                    <div
                      style={{ width: `${pctRetorno}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-ai shadow-[0_0_8px_rgba(59,130,246,0.35)] transition-all duration-500"
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right font-medium tabular-nums">{formatBRL(canal.revenue)}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-0.5 text-xs">
                <div>
                  <p className="text-muted-foreground">Conversões</p>
                  <p className="font-medium tabular-nums text-foreground">{formatNumber(canal.conversions)}</p>
                </div>
                <div
                  title={
                    canal.impressions > 0
                      ? `CTR = cliques ÷ impressões (${formatNumber(canal.clicks)} ÷ ${formatNumber(canal.impressions)})`
                      : "Sem impressões registradas neste canal"
                  }
                >
                  <p className="text-muted-foreground">CTR</p>
                  <p className="font-medium tabular-nums text-foreground">{ctr}</p>
                </div>
                <div
                  title={
                    canal.clicks > 0
                      ? `CPC = investido ÷ cliques (${formatBRL(canal.spend)} ÷ ${formatNumber(canal.clicks)})`
                      : "Sem cliques registrados neste canal"
                  }
                >
                  <p className="text-muted-foreground">CPC</p>
                  <p className="font-medium tabular-nums text-foreground">{cpc}</p>
                </div>
                <div
                  title={
                    canal.conversions > 0
                      ? `CPA = investido ÷ conversões (${formatBRL(canal.spend)} ÷ ${formatNumber(canal.conversions)})`
                      : "Sem conversões registradas neste canal"
                  }
                >
                  <p className="text-muted-foreground">CPA</p>
                  <p className="font-medium tabular-nums text-foreground">{cpa}</p>
                </div>
              </div>
            </div>
          );
        })
        )}
      </CardContent>
    </Card>
  );
}
