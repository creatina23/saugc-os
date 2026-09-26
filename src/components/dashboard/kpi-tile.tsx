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
  return (
    <Card className="card-glow relative overflow-hidden group">
      <div className="absolute -right-6 -bottom-6 size-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/15" />
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{metric.label}</p>
          <div className={cn("flex size-9 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110", config.tone)}>
            <config.icon className="size-4" />
          </div>
        </div>
        {erro ? (
          <>
            <p className="mt-3 text-2xl font-bold tracking-tight text-muted-foreground tabular-nums md:text-3xl">—</p>
            <p className="mt-2 text-xs text-destructive">
              Indisponível — falha na consulta. Detalhe técnico: {erro}
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums md:text-3xl">{metric.value}</p>
            {metric.sub && (
              <p className="mt-2 text-xs text-muted-foreground">{metric.sub}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
