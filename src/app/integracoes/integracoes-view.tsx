"use client";

import { useState } from "react";
import { Cpu, CheckCircle2, Key, RefreshCw, ShieldCheck, Webhook, Globe, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";

export function IntegracoesView() {
  const [metaToken, setMetaToken] = useState("EAAQ_active_token_meta_v2");
  const [tiktokKey, setTiktokKey] = useState("app_tk_8892304921");
  const [googleId, setGoogleId] = useState("MCC-992-102-441");
  const [whatsappToken, setWhatsappToken] = useState("EAAG_wa_business_token_v9");
  const [salvando, setSalvando] = useState(false);

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setTimeout(() => {
      setSalvando(false);
      toast("Credenciais de API sincronizadas com sucesso!", {
        description: "Meta Ads, TikTok Ads, Google Ads e WhatsApp Business conectados na infraestrutura.",
        type: "success",
      });
    }, 1000);
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Cpu className="size-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">APIs & Webhooks de Anúncios</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Central de integração oficial com o Meta Marketing API, TikTok Ads, Google Ads e WhatsApp Business.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <ShieldCheck className="size-3.5" /> Conexão SSL Segura (TLS 1.3)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Formulário Principal */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border bg-surface/65 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="size-4 text-primary" /> Credenciais de Acesso às Plataformas
              </CardTitle>
              <CardDescription>Insira os tokens de desenvolvedor para sincronizar gastos e métricas automaticamente.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSalvar} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Globe className="size-3.5 text-blue-400" /> Meta Marketing API Access Token (Facebook / Instagram)
                  </label>
                  <Input
                    type="password"
                    value={metaToken}
                    onChange={(e) => setMetaToken(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">Utilizado para puxar campanhas, criativos e métricas de ROAS do Meta Ads.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Zap className="size-3.5 text-violet-400" /> TikTok Ads Developer App Secret
                  </label>
                  <Input
                    type="password"
                    value={tiktokKey}
                    onChange={(e) => setTiktokKey(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">Sincroniza o spend e conversões de campanhas UGC no TikTok.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Cpu className="size-3.5 text-emerald-400" /> Google Ads MCC Manager ID
                  </label>
                  <Input
                    value={googleId}
                    onChange={(e) => setGoogleId(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">Conexão com a rede de pesquisa e Performance Max.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Webhook className="size-3.5 text-success" /> Endpoint de Webhook (Postback de Conversão)
                  </label>
                  <Input
                    readOnly
                    value="https://os.anuncia.app/api/webhooks/v2/conversion-pixel"
                    className="bg-muted/50 font-mono text-xs text-muted-foreground"
                  />
                  <p className="text-[11px] text-muted-foreground">Cole este endpoint na sua plataforma de checkout para registrar vendas em tempo real.</p>
                </div>

                <Button type="submit" className="gap-2 font-semibold w-full sm:w-auto" disabled={salvando}>
                  {salvando ? <RefreshCw className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                  Salvar e Sincronizar Credenciais
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Status das Contas */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border bg-surface/65 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base">Status das Contas Conectadas</CardTitle>
              <CardDescription>Monitoramento de saúde das conexões</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-success" />
                  </span>
                  <div>
                    <span className="text-xs font-semibold block">Meta Ads</span>
                    <span className="text-[10px] text-muted-foreground">Conta Act_9921</span>
                  </div>
                </div>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">Ativo</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-success" />
                  </span>
                  <div>
                    <span className="text-xs font-semibold block">TikTok Ads</span>
                    <span className="text-[10px] text-muted-foreground">App_441 Global</span>
                  </div>
                </div>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">Ativo</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-success" />
                  </span>
                  <div>
                    <span className="text-xs font-semibold block">Google Ads</span>
                    <span className="text-[10px] text-muted-foreground">MCC_77 Reseller</span>
                  </div>
                </div>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">Ativo</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-success" />
                  </span>
                  <div>
                    <span className="text-xs font-semibold block">WhatsApp Business</span>
                    <span className="text-[10px] text-muted-foreground">API Oficial v19</span>
                  </div>
                </div>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">Ativo</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}