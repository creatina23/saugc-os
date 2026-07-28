import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { settingsTabs } from "@/lib/mock-data";

export default function ConfiguracoesPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        title="Configurações"
        description="Painel de preferências da conta e workspace (visual mock)."
      />

      <Tabs defaultValue="Geral" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {settingsTabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="text-xs sm:text-sm">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {settingsTabs.map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{tab}</CardTitle>
                <CardDescription>
                  Conteúdo placeholder para a aba {tab}. Sem persistência nesta sprint.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tab === "Geral" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm">Nome do workspace</label>
                      <Input defaultValue="SAUGC Studio" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Fuso horário</label>
                      <Input defaultValue="America/Sao_Paulo" readOnly />
                    </div>
                  </>
                )}
                {tab === "Integrações API" && (
                  <div className="space-y-3">
                    {["Meta Ads", "Google Ads", "TikTok", "Webhook SAUGC"].map(
                      (name) => (
                        <div
                          key={name}
                          className="flex items-center justify-between rounded-lg border border-white/10 p-3"
                        >
                          <span className="text-sm">{name}</span>
                          <Badge variant="success">Conectado (mock)</Badge>
                        </div>
                      )
                    )}
                  </div>
                )}
                {tab === "Faturamento & Plano" && (
                  <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
                    <p className="font-medium">Plano Pro</p>
                    <p className="text-sm text-muted-foreground">
                      R$ 2.490/mês · Renovação em 15/04/2025
                    </p>
                    <Button className="mt-4" variant="outline" size="sm">
                      Gerenciar faturamento
                    </Button>
                  </div>
                )}
                {!["Geral", "Integrações API", "Faturamento & Plano"].includes(tab) && (
                  <p className="text-sm text-muted-foreground">
                    Configure opções de {tab.toLowerCase()} em sprints futuras.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
