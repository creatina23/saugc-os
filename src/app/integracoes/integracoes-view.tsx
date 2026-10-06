"use client";

import { useState } from "react";
import { Cpu, CheckCircle2, Key, RefreshCw, ShieldCheck, Webhook, Globe, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";

export function IntegracoesView() {
  const [metaToken, setMetaToken] = useState("");
  const [tiktokKey, setTiktokKey] = useState("");
  const [googleId, setGoogleId] = useState("");
  const [whatsappToken, setWhatsappToken] = useState("");
  const [salvando, setSalvando] = useState(false);

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    // AUD-COM-01: setTimeout apenas para cadência visual do botão —
    // não é validação com as plataformas.
    setTimeout(() => {
      setSalvando(false);
      toast("Credenciais armazenadas nesta sessão.", {
        description: "Nenhuma conexão foi verificada — os status abaixo permanecem como Não configurado até validação real de cada plataforma.",
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
            Configuração de credenciais para Meta Marketing API, TikTok Ads, Google Ads e WhatsApp Business. Nenhuma integração está conectada nesta versão.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <Key className="size-3.5" /> Configuração local — nenhuma plataforma conectada
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
              <CardDescription>Insira tokens de desenvolvedor para habilitar a sincronização (a verificação da conexão ainda não está implementada).</CardDescription>
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
                  <p className="text-[11px] text-muted-foreground">Endpoint planejado — ainda não emite nem registra eventos nesta versão.</p>
                </div>

                <Button type="submit" className="gap-2 font-semibold w-full sm:w-auto" disabled={salvando}>
                  {salvando ? <RefreshCw className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                  Salvar credenciais
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Status das Contas */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border bg-surface/65 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base">Status das Conexões</CardTitle>
              <CardDescription>Somente conexões verificadas podem aparecer como Ativo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex size-2.5">
                    <span className="relative inline-flex size-2.5 rounded-full bg-muted-foreground/40" />
                  </span>
                  <div>
                    <span className="text-xs font-semibold block">Meta Ads</span>
                    <span className="text-[10px] text-muted-foreground">Sem credencial verificada</span>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">Não configurado</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex size-2.5">
                    <span className="relative inline-flex size-2.5 rounded-full bg-muted-foreground/40" />
                  </span>
                  <div>
                    <span className="text-xs font-semibold block">TikTok Ads</span>
                    <span className="text-[10px] text-muted-foreground">Sem credencial verificada</span>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">Não configurado</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex size-2.5">
                    <span className="relative inline-flex size-2.5 rounded-full bg-muted-foreground/40" />
                  </span>
                  <div>
                    <span className="text-xs font-semibold block">Google Ads</span>
                    <span className="text-[10px] text-muted-foreground">Sem credencial verificada</span>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">Não configurado</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex size-2.5">
                    <span className="relative inline-flex size-2.5 rounded-full bg-muted-foreground/40" />
                  </span>
                  <div>
                    <span className="text-xs font-semibold block">WhatsApp Business</span>
                    <span className="text-[10px] text-muted-foreground">Sem credencial verificada</span>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">Não configurado</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}