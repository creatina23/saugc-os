import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deals, pipelineValueByStage } from "@/lib/mock-data";
import type { DealStage } from "@/types";

const columns: DealStage[] = [
  "Qualificação",
  "Proposta Enviada",
  "Negociação",
  "Contrato Fechado",
];

export default function ComerciaisPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        title="Comerciais"
        description="Pipeline de vendas com valor total por estágio (dados mock)."
        badge={`Pipeline R$ ${Object.values(pipelineValueByStage)
          .reduce((a, b) => a + b, 0)
          .toLocaleString("pt-BR")}`}
      />

      <div className="grid gap-4 lg:grid-cols-4">
        {columns.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          return (
            <div key={stage} className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <p className="text-sm font-medium">{stage}</p>
                <Badge variant="muted">
                  R$ {pipelineValueByStage[stage].toLocaleString("pt-BR")}
                </Badge>
              </div>
              <div className="space-y-3">
                {stageDeals.map((deal) => (
                  <Card key={deal.id} className="card-glow">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm">{deal.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">{deal.company}</p>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-xs">
                      <p className="font-mono-params text-emerald-400">
                        R$ {deal.value.toLocaleString("pt-BR")}
                      </p>
                      <p className="mt-2 text-muted-foreground">
                        {deal.owner} · {deal.probability}%
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {stageDeals.length === 0 && (
                  <p className="rounded-lg border border-dashed border-white/10 p-4 text-center text-xs text-muted-foreground">
                    Sem deals
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
