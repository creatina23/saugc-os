"use client";

import { useState } from "react";
import { Cpu, CheckCircle2, Key, RefreshCw, ShieldCheck, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";

export function IntegracoesView() {
  const [metaToken, setMetaToken] = useState("EAAQ...active_token_v2");
  const [tiktokKey, setTiktokKey] = useState("app_tk_8892304921");
  const [salvando, setSalvando] = useState(false);

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setTimeout(() => {
      setSalvando(false);
      toast("Credenciais de API sincronizadas com sucesso!", {
        description: "Os webhooks de Meta Ads e TikTok Ads estão ativos na infraestrutura.",
        type: "success",
      });
    }, 1000);
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Cpu className="size-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">APIs & Webhooks de Anúncios</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Central de integração oficial com o Meta Marketing API, TikTok Ads e Webhooks de conversão em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <ShieldCheck className="size-3.5" /> Conexão SSL Segura
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border bg-surface/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base">Credenciais de Acesso às Plataformas</CardTitle>
              <CardDescription>Insira os tokens de desenvolvedor para sincronizar gastos e métricas automaticamente.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSalvar} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Key className="size-3.5 text-blue-400" /> Meta Marketing API Access Token (Facebook / Instagram)
                  </label>
                  <Input
                    type="password"
                    value={metaToken}
                    onChange={(e) => setMetaToken(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Key className="size-3.5 text-violet-400" /> TikTok Ads Developer App Secret
                  </label>
                  <Input
                    type="password"
                    value={tiktokKey}
                    onChange={(e) => setTiktokKey(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Webhook className="size-3.5 text-emerald-400" /> Endpoint de Webhook (Postback de Vendas)
                  </label>
                  <Input
                    readOnly
                    value="https://os.anuncia.app/api/webhooks/v2/conversion-pixel"
                    className="bg-muted/50 font-mono text-xs"
                  />
                </div>

                <Button type="submit" className="gap-2 font-semibold" disabled={salvando}>
                  {salvando ? <RefreshCw className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                  Salvar e Sincronizar APIs
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border bg-surface/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base">Status das Contas Conectadas</CardTitle>
              <CardDescription>Monitoramento de saúde das conexões</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-medium">Meta Ads (Act_9921)</span>
                </div>
                <span className="text-[10px] text-success font-bold">Ativo</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-medium">TikTok Ads (App_441)</span>
                </div>
                <span className="text-[10px] text-success font-bold">Ativo</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}