import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Cog,
  Film,
  Handshake,
  Megaphone,
  Minus,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatBRL, formatNumber } from "@/lib/format";
import {
  activityLog,
  campaignPerformance,
  dashboardMetrics,
  deals,
  pipelineValueByStage,
  revenueTrajectory,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

// Rótulos dos cartões — SEMPRE entre aspas (têm espaço/acento; sem aspas
// o código quebra, aprendizado do Passo 015d).
const kpiConfig: Record<string, { icon: LucideIcon; tone: string }> = {
  "Receita do mês": { icon: Wallet, tone: "bg-primary/15 text-primary" },
  Conversões: { icon: Target, tone: "bg-success/15 text-success" },
  "Campanhas ativas": { icon: Megaphone, tone: "bg-ai/15 text-ai" },
  "ROI Médio": { icon: TrendingUp, tone: "bg-warning/15 text-warning" },
};

const activityConfig: Record<string, { icon: LucideIcon; tone: string }> = {
  campaign: { icon: Megaphone, tone: "bg-primary/15 text-primary" },
  deal: { icon: Handshake, tone: "bg-warning/15 text-warning" },
  client: { icon: Users, tone: "bg-success/15 text-success" },
  asset: { icon: Film, tone: "bg-ai/15 text-ai" },
  system: { icon: Cog, tone: "bg-secondary text-muted-foreground" },
};

const quickActions = [
  {
    label: "Novo Cliente",
    description: "Cadastrar empresa na base",
    href: "/clientes",
    icon: Users,
    tone: "bg-success/15 text-success",
  },
  {
    label: "Nova Campanha",
    description: "Criar campanha multicanal",
    href: "/campanhas",
    icon: Megaphone,
    tone: "bg-primary/15 text-primary",
  },
  {
    label: "Novo Prompt",
    description: "Salvar prompt reutilizável",
    href: "/prompts",
    icon: Sparkles,
    tone: "bg-ai/15 text-ai",
  },
  {
    label: "IA Studio",
    description: "Gerar copy e roteiros",
    href: "/ia-studio",
    icon: Bot,
    tone: "bg-warning/15 text-warning",
  },
];

const trendIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
} as const;

export default function DashboardPage() {
  const maxRevenue = Math.max(...revenueTrajectory.map((point) => point.value));
  const lastRevenue = revenueTrajectory[revenueTrajectory.length - 1];
  const totalConversions = campaignPerformance.reduce(
    (acc, item) => acc + item.conversions,
    0
  );
  const pipelineTotal = Object.values(pipelineValueByStage).reduce(
    (acc, value) => acc + value,
    0
  );
  const maxStageValue = Math.max(...Object.values(pipelineValueByStage));
  const openDeals = deals.filter((deal) => deal.stage !== "Contrato Fechado").length;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral da sua operação, num relance."
      >
        <Button variant="secondary" asChild>
          <Link href="/campanhas">
            <Plus /> Nova Campanha
          </Link>
        </Button>
        <Button variant="ai" asChild>
          <Link href="/ia-studio">
            <Sparkles /> Gerar com IA
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => {
          const config = kpiConfig[metric.label] ?? kpiConfig["Receita do mês"];
          const TrendIcon = trendIcon[metric.trend];
          return (
            <Card key={metric.label} className="card-glow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <div
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg",
                      config.tone
                    )}
                  >
                    <config.icon className="size-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                  {metric.value}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  <TrendIcon
                    className={cn(
                      "size-3.5",
                      metric.trend === "up" && "text-success",
                      metric.trend === "down" && "text-destructive",
                      metric.trend === "neutral" && "text-muted-foreground"
                    )}
                  />
                  <span className="text-muted-foreground">{metric.change}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.href + action.label} href={action.href} className="group">
            <Card className="card-glow h-full">
              <CardContent className="flex items-center gap-3 p-4">
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    action.tone
                  )}
                >
                  <action.icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{action.label}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Trajetória de Receita</CardTitle>
              <CardDescription>Últimos 6 meses de receita</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="success">+12,4%</Badge>
              <p className="text-lg font-bold">{formatBRL(lastRevenue.value)}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-44 items-end gap-3">
              {revenueTrajectory.map((point) => (
                <div key={point.month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {formatBRL(point.value)}
                  </span>
                  <div className="flex h-28 w-full items-end">
                    <div
                      title={`${point.month}: ${formatBRL(point.value)}`}
                      style={{ height: `${Math.round((point.value / maxRevenue) * 100)}%` }}
                      className={cn(
                        "w-full rounded-t-lg bg-gradient-to-t transition-all duration-300 hover:brightness-125",
                        point.month === lastRevenue.month
                          ? "from-primary to-ai"
                          : "from-primary/40 to-ai/40"
                      )}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{point.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance por Canal</CardTitle>
            <CardDescription>Investimento e conversões no mês</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {campaignPerformance.map((item) => (
              <div key={item.platform}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2.5 rounded-full", item.color)} />
                    <span className="font-medium">{item.platform}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {formatBRL(item.spend)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    style={{
                      width: `${Math.round((item.conversions / totalConversions) * 100)}%`,
                    }}
                    className={cn("h-full rounded-full", item.color)}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {formatNumber(item.conversions)} conversões
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimos eventos da operação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {activityLog.map((item) => {
              const config = activityConfig[item.type] ?? activityConfig.system;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-accent"
                >
                  <div
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                      config.tone
                    )}
                  >
                    <config.icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{item.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Negociações em andamento</CardTitle>
            <CardDescription>
              {openDeals} negociações ativas · {formatBRL(pipelineTotal)} em funil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {Object.entries(pipelineValueByStage).map(([stage, value]) => (
              <div key={stage}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">{stage}</span>
                  <span className="text-muted-foreground">{formatBRL(value)}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    style={{ width: `${Math.round((value / maxStageValue) * 100)}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-ai"
                  />
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-dashed border-border p-3 text-center">
              <p className="text-xs text-muted-foreground">
                Ticket médio ponderado
              </p>
              <p className="mt-1 text-lg font-bold">
                {formatBRL(Math.round(pipelineTotal / deals.length))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}