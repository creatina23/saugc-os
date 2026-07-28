import { Calendar, User } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { briefings } from "@/lib/mock-data";
import type { BriefingStatus } from "@/types";

function statusVariant(status: BriefingStatus) {
  if (status === "Aprovado") return "success";
  if (status === "Em Aprovação") return "warning";
  return "muted";
}

export default function BriefingsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        title="Briefings"
        description="Briefings UGC e conteúdo com status, creators e prazos."
        actions={<Button>+ Novo Briefing</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {briefings.map((briefing) => (
          <Card key={briefing.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-snug">{briefing.title}</CardTitle>
                <Badge variant={statusVariant(briefing.status)}>{briefing.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{briefing.client}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {briefing.creator}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {briefing.deadline}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {briefing.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
