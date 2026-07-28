"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { campaigns } from "@/lib/mock-data";
import type { CampaignStatus } from "@/types";

const statuses: CampaignStatus[] = ["Ativa", "Pausada", "Rascunho"];

function statusVariant(status: CampaignStatus) {
  if (status === "Ativa") return "success";
  if (status === "Pausada") return "warning";
  return "muted";
}

export default function CampanhasPage() {
  const [filter, setFilter] = useState<CampaignStatus | "Todas">("Todas");

  const filtered = useMemo(
    () =>
      campaigns.filter((c) => filter === "Todas" || c.status === filter),
    [filter]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        title="Campanhas"
        description="Visão multicanal de Meta Ads, TikTok e Google Ads com métricas mock."
        actions={<Button>+ Nova Campanha</Button>}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filter === "Todas" ? "default" : "outline"}
          onClick={() => setFilter("Todas")}
        >
          Todas
        </Button>
        {statuses.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{campaign.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{campaign.client}</p>
              </div>
              <Badge variant={statusVariant(campaign.status)}>{campaign.status}</Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Plataforma</p>
                <p>{campaign.platform}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="font-mono-params">
                  R$ {campaign.budget.toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Impressões</p>
                <p>{campaign.impressions.toLocaleString("pt-BR")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">CTR</p>
                <p>{campaign.ctr > 0 ? `${campaign.ctr}%` : "—"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
