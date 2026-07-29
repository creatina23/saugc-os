"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  ChevronRight,
  CreditCard,
  Eye,
  Percent,
  Plus,
  Search,
  SearchX,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBRL, formatCompact, formatPercent } from "@/lib/format";
import { campaigns, clients } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { CampaignPlatform, CampaignStatus } from "@/types";

const statusFilters = ["Todas", "Ativa", "Pausada", "Rascunho"] as const;
const platformOptions = ["Todas", "Meta Ads", "Google Ads", "TikTok"] as const;

const platformBadge: Record<CampaignPlatform, "default" | "success" | "violet"> = {
  "Meta Ads": "default",
  "Google Ads": "success",
  TikTok: "violet",
};

const statusBadge: Record<CampaignStatus, "success" | "warning" | "secondary"> = {
  Ativa: "success",
  Pausada: "warning",
  Rascunho: "secondary",
};

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

export function CampanhasView() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("Todas");
  const [platform, setPlatform] = useState<string>("Todas");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(
    () =>
      campaigns.filter((campaign) => {
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          campaign.name.toLowerCase().includes(query) ||
          campaign.client.toLowerCase().includes(query);
        const matchesStatus = status === "Todas" || campaign.status === status;
        const matchesPlatform = platform === "Todas" || campaign.platform === platform;
        return matchesSearch && matchesStatus && matchesPlatform;
      }),
    [search, status, platform]
  );

  const totalBudget = campaigns.reduce((acc, campaign) => acc + campaign.budget, 0);
  const totalSpend = campaigns.reduce((acc, campaign) => acc + campaign.spend, 0);
  const totalImpressions = campaigns.reduce((acc, campaign) => acc + campaign.impressions, 0);
  const avgCtr =
    campaigns.length > 0
      ? campaigns.reduce((acc, campaign) => acc + campaign.ctr, 0) / campaigns.length
      : 0;

  const stats = [
    { label: "Orçamento total", value: formatBRL(totalBudget), icon: Wallet, tone: "bg-primary/15 text-primary" },
    { label: "Investido", value: formatBRL(totalSpend), icon: CreditCard, tone: "bg-warning/15 text-warning" },
    { label: "Impressões", value: formatCompact(totalImpressions), icon: Eye, tone: "bg-ai/15 text-ai" },
    { label: "CTR médio", value: formatPercent(avgCtr), icon: Percent, tone: "bg-success/15 text-success" },
  ];

  return (
    <>
      <PageHeader title="Campanhas" description="Campanhas multicanal de performance da agência.">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus /> Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar campanha</DialogTitle>
              <DialogDescription>
                Configure uma nova campanha de performance.
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setDialogOpen(false);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="campaign-name" className={fieldLabel}>
                    Nome da campanha
                  </label>
                  <Input id="campaign-name" placeholder="Ex.: Verão Glow — UGC Creators" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="campaign-client" className={fieldLabel}>
                      Cliente
                    </label>
                    <Select defaultValue={clients[0].company}>
                      <SelectTrigger id="campaign-client" aria-label="Selecionar cliente">
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.company}>
                            {client.company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="campaign-platform" className={fieldLabel}>
                      Plataforma
                    </label>
                    <Select defaultValue="Meta Ads">
                      <SelectTrigger id="campaign-platform" aria-label="Selecionar plataforma">
                        <SelectValue placeholder="Selecione a plataforma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Meta Ads">Meta Ads</SelectItem>
                        <SelectItem value="Google Ads">Google Ads</SelectItem>
                        <SelectItem value="TikTok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="campaign-budget" className={fieldLabel}>
                      Orçamento mensal (R$)
                    </label>
                    <Input id="campaign-budget" type="number" placeholder="45000" />
                  </div>
                  <div>
                    <label htmlFor="campaign-goal" className={fieldLabel}>
                      Objetivo
                    </label>
                    <Input id="campaign-goal" placeholder="Ex.: Escala, Otimização" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">Salvar campanha</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-glow">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${stat.tone}`}>
                <stat.icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">{stat.label}</p>
                <p className="truncate text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por campanha ou cliente..."
                aria-label="Buscar campanhas"
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {statusFilters.map((option) => {
                const count =
                  option === "Todas"
                    ? campaigns.length
                    : campaigns.filter((campaign) => campaign.status === option).length;
                const active = status === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStatus(option)}
                    aria-pressed={active}
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                      active
                        ? "border-primary/40 bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:border-[rgba(255,255,255,0.16)] hover:text-foreground"
                    )}
                  >
                    {option}
                    <span
                      className={cn(
                        "rounded-full px-1.5 text-[10px]",
                        active ? "bg-primary/20" : "bg-muted"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger aria-label="Filtrar por plataforma" className="w-full xl:w-[200px]">
                <SelectValue placeholder="Plataforma" />
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "Todas" ? "Todas as plataformas" : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((campaign) => {
            const usage =
              campaign.budget > 0
                ? Math.min(100, Math.round((campaign.spend / campaign.budget) * 100))
                : 0;
            return (
              <Card key={campaign.id} className="card-glow flex flex-col">
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={platformBadge[campaign.platform]}>{campaign.platform}</Badge>
                    <Badge variant={statusBadge[campaign.status]}>{campaign.status}</Badge>
                  </div>
                  <h3 className="mt-3 text-base font-semibold tracking-tight">
                    {campaign.name}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building2 className="size-3.5" />
                    {campaign.client}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Orçamento</p>
                      <p className="text-sm font-semibold">{formatBRL(campaign.budget)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">CTR</p>
                      <p className="text-sm font-semibold">{formatPercent(campaign.ctr)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Impressões</p>
                      <p className="text-sm font-semibold">{formatCompact(campaign.impressions)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Investido</p>
                      <p className="text-sm font-semibold">{formatBRL(campaign.spend)}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Consumo do orçamento</span>
                      <span>{usage}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        style={{ width: `${usage}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-ai"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <Badge variant="outline">{campaign.stage}</Badge>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      Detalhes
                      <ChevronRight />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <SearchX className="size-8 text-muted-foreground" />
            <p className="mt-3 font-medium">Nenhuma campanha encontrada</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ajuste a busca ou os filtros para ver resultados.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearch("");
                setStatus("Todas");
                setPlatform("Todas");
              }}
            >
              Limpar filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}