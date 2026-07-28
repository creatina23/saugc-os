import Link from "next/link";
import {
  ArrowUpRight,
  Megaphone,
  TrendingUp,
  UserPlus,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  activityLog,
  campaignPerformance,
  dashboardMetrics,
  revenueTrajectory,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const maxRevenue = Math.max(...revenueTrajectory.map((p) => p.value));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        title="Dashboard"
        description="Visão geral de receita, campanhas UGC e atividade recente da operação."
        badge="Tempo real (mock)"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">{metric.value}</p>
              <p
                className={cn(
                  "mt-1 text-xs",
                  metric.trend === "up" ? "text-emerald-400" : "text-muted-foreground"
                )}
              >
                {metric.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Performance por canal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaignPerformance.map((row) => (
              <div key={row.platform} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{row.platform}</span>
                  <span className="text-muted-foreground">
                    R$ {row.spend.toLocaleString("pt-BR")} · {row.conversions} conv.
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={cn("h-full rounded-full", row.color)}
                    style={{
                      width: `${Math.min(100, (row.conversions / 900) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ações rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/clientes">
                <UserPlus className="h-4 w-4" />
                Novo cliente
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/campanhas">
                <Megaphone className="h-4 w-4" />
                Nova campanha
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/ia-studio">
                <Zap className="h-4 w-4" />
                Abrir IA Studio
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trajetória de receita (MRR)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2">
              {revenueTrajectory.map((point) => (
                <div key={point.month} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-emerald-600/80 to-violet-500/60"
                    style={{ height: `${(point.value / maxRevenue) * 100}%`, minHeight: 8 }}
                  />
                  <span className="text-[10px] text-muted-foreground">{point.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Atividade recente</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">
              Ver tudo
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {activityLog.map((item) => (
              <div key={item.id} className="flex gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <Badge variant="muted" className="h-6 shrink-0 capitalize">
                  {item.type}
                </Badge>
                <div className="min-w-0">
                  <p className="text-sm leading-snug">{item.message}</p>
                  <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
