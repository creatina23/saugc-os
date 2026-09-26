// TR-04.8D.1: "Atualizações Recentes" derivadas de created_at real.
// TR-04.8D.2c-0: movido 1:1 de src/app/dashboard-view.tsx. As duas fontes
// (clientes/campanhas) chegam como erros específicos — não o FonteErro todo.
import {
  Activity,
  Megaphone,
  Sparkles,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { Atividade } from "./types";

const activityConfig: Record<string, { icon: LucideIcon; tone: string }> = {
  deal: { icon: Target, tone: "bg-primary/15 text-primary" },
  campaign: { icon: Megaphone, tone: "bg-ai/15 text-ai" },
  client: { icon: Users, tone: "bg-success/15 text-success" },
  prompt: { icon: Sparkles, tone: "bg-warning/15 text-warning" },
};

export function AtualizacoesRecentes({
  atividades,
  erroClientes,
  erroCampanhas,
}: {
  atividades: Atividade[];
  erroClientes: string | null;
  erroCampanhas: string | null;
}) {
  return (
    <Card className="lg:col-span-6 card-glow">
      <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="size-4 text-warning" /> Atualizações Recentes
          </CardTitle>
          <CardDescription>Derivadas das datas de criação de clientes e campanhas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5 pt-2">
        {erroClientes && erroCampanhas ? (
          <p role="alert" className="text-sm text-destructive py-6 text-center">
            Registros indisponíveis — as fontes que alimentam estas
            atualizações falharam (isso não é vazio).
          </p>
        ) : atividades.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Nenhum registro ainda. Clientes e campanhas que você criar
            aparecem aqui com a data real de cadastro.
          </p>
        ) : (
        atividades.map((item) => {
          const cfg = activityConfig[item.type] ?? activityConfig.deal;
          return (
            <div key={item.id} className="flex items-start gap-3 rounded-xl border border-border/40 bg-surface/30 p-3 transition-colors hover:border-border">
              <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg mt-0.5", cfg.tone)}>
                <cfg.icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold truncate">{item.message}</p>
                  <span className="text-[11px] text-muted-foreground">{item.timestamp}</span>
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
