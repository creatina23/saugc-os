// TR-04.8D.2c-0: tile de KPI do Pulso do Negócio — movido 1:1 de
// src/app/dashboard-view.tsx. O mapeamento de erro por fonte permanece no
// orquestrador (dashboard-view); aqui chega pronto como `erro`.
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  CircleDollarSign,
  Megaphone,
  Target,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { Kpi } from "./types";

const kpiConfig: Record<string, { icon: LucideIcon; tone: string }> = {
  "Receita do mês": { icon: Wallet, tone: "bg-primary/15 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]" },
  MRR: { icon: Wallet, tone: "bg-primary/15 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]" },
  Conversões: { icon: Target, tone: "bg-success/15 text-success shadow-[0_0_15px_rgba(16,185,129,0.2)]" },
  "Campanhas ativas": { icon: Megaphone, tone: "bg-ai/15 text-ai shadow-[0_0_15px_rgba(139,92,246,0.2)]" },
  "ROI Médio": { icon: TrendingUp, tone: "bg-warning/15 text-warning shadow-[0_0_15px_rgba(245,158,11,0.2)]" },
  "ROI Global": { icon: TrendingUp, tone: "bg-warning/15 text-warning shadow-[0_0_15px_rgba(245,158,11,0.2)]" },
  "Oportunidades abertas": { icon: Briefcase, tone: "bg-success/15 text-success shadow-[0_0_15px_rgba(16,185,129,0.2)]" },
  "Pipeline aberto": { icon: CircleDollarSign, tone: "bg-ai/15 text-ai shadow-[0_0_15px_rgba(139,92,246,0.2)]" },
};

export function KpiTile({ metric, erro }: { metric: Kpi; erro: string | null }) {
  const config = kpiConfig[metric.label] ?? kpiConfig["Receita do mês"];
  // TR-04.8D.2c-3A: tile compacto — p-4, ícone menor, sem blur decorativo
  // (o hover de borda sutil vem do card-glow, linguagem existente do produto).
  // Subtexto factual permanece integral e legível (text-xs, sem truncate).
  return (
    <Card className="card-glow group">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{metric.label}</p>
          <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110", config.tone)}>
            <config.icon className="size-4" />
          </div>
        </div>
        {erro ? (
          <>
            <p className="mt-2 text-2xl font-bold tracking-tight text-muted-foreground tabular-nums md:text-3xl">—</p>
            <p className="mt-1.5 text-xs text-destructive">
              Indisponível — falha na consulta. Detalhe técnico: {erro}
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums md:text-3xl">{metric.value}</p>
            {metric.sub && (
              <p className="mt-1.5 text-xs text-muted-foreground">{metric.sub}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
