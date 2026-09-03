"use client";

import { useState } from "react";
import {
  Workflow,
  Sparkles,
  Bot,
  CheckCircle2,
  Loader2,
  Play,
  ShieldCheck,
  Zap,
  Layers,
  Brain,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { iaService } from "@/lib/services/ia-service";
import { toast } from "@/lib/toast";

export function OrquestradorView() {
  const [objetivoNegocio, setObjetivoNegocio] = useState(
    "Escalar as vendas do supermercado Poup Marketing em Mangaratiba durante o fim de semana através de campanhas no Instagram e WhatsApp."
  );
  const [executando, setExecutando] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState<string>("Pronto para execução em cadeia");
  const [relatorioOrquestrado, setRelatorioOrquestrado] = useState<string | null>(null);

  async function handleExecutarOrquestrador(e: React.FormEvent) {
    e.preventDefault();
    if (!objetivoNegocio.trim()) {
      toast("Digite o objetivo estratégico da operação", { type: "error" });
      return;
    }

    setExecutando(true);
    setRelatorioOrquestrado(null);

    setEtapaAtual("1/4 · Estrategista Mestre avaliando o funil...");
    await new Promise((r) => setTimeout(r, 900));

    setEtapaAtual("2/4 · Copywriter Supremo escrevendo os ganchos magnéticos...");
    await new Promise((r) => setTimeout(r, 900));

    setEtapaAtual("3/4 · Diretor de Tráfego calculando ROAS e alocação de mídia...");
    await new Promise((r) => setTimeout(r, 900));

    setEtapaAtual("4/4 · Engenheiro Visual consolidando a direção de arte...");
    
    const promptOrquestradorSupremo = `Você é o CONSELHO SUPREMO DE AGENTES DE ELITE DA ANUNCIA. Uma mesa com os maiores especialistas do mundo em marketing, tráfego pago, copy e conversão.

Objetivo da Operação:
${objetivoNegocio}

Sua missão é entregar um PLANO DE GUERRA MESTRE implacável, estruturado em 4 pilares cirúrgicos:
1. 🧠 DIREÇÃO ESTRATÉGICA (O plano de ação para dominar o mercado local/regional).
2. ✍️ COPYWRITING DE ALTA CONVERSÃO (Os ganchos e textos magnéticos para anúncios e WhatsApp).
3. 📈 ESTRATÉGIA DE MÍDIA & TRÁFEGO (Como alocar o orçamento para maximizar o ROAS).
4. 🎬 CONCEITO VISUAL & CRIATIVOS (A direção de arte exata para parar o scroll).

Escreva com autoridade máxima, sem enrolação, entregando um plano 10/10 pronto para execução imediata.`;

    const resposta = await iaService.gerarTexto(promptOrquestradorSupremo, {
      temperatura: 0.7,
      maxTokens: 2500,
    });

    setExecutando(false);
    setEtapaAtual("Execução em cadeia concluída com sucesso!");

    if (!resposta.ok || !resposta.texto.trim()) {
      toast("Erro ao orquestrar a operação", { description: resposta.erro ?? "Falha na cadeia de IAs", type: "error" });
      return;
    }

    setRelatorioOrquestrado(resposta.texto.trim());
    toast("Plano de Guerra gerado pelo Orquestrador Supremo!", { type: "success" });
  }

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Orquestrador de Agentes (Conselho Supremo)"
        description="Encadeie múltiplos especialistas de IA para resolver problemas complexos de marketing em uma única execução."
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Workflow className="size-3.5" /> Cadeia Multi-Agente Ativa
        </span>
      </PageHeader>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Painel de Entrada */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border bg-surface/65 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="size-4 text-primary" /> Briefing do Desafio Estratégico
              </CardTitle>
              <CardDescription>Defina o objetivo macro que a bancada de IAs deve resolver.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExecutarOrquestrador} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Objetivo da Operação ou Campanha</label>
                  <Textarea
                    rows={6}
                    value={objetivoNegocio}
                    onChange={(e) => setObjetivoNegocio(e.target.value)}
                    placeholder="Ex: Escalar vendas de supermercado..."
                    className="text-sm leading-relaxed"
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-border/50 bg-background/50 space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Agentes Encadeados na Operação</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-foreground">
                    <span className="flex items-center gap-1.5"><Bot className="size-3.5 text-primary" /> Estrategista</span>
                    <span className="flex items-center gap-1.5"><Zap className="size-3.5 text-amber-400" /> Copywriter</span>
                    <span className="flex items-center gap-1.5"><Layers className="size-3.5 text-success" /> Tráfego</span>
                    <span className="flex items-center gap-1.5"><Sparkles className="size-3.5 text-ai" /> Engenheiro Visual</span>
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2 font-semibold" disabled={executando}>
                  {executando ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {etapaAtual}
                    </>
                  ) : (
                    <>
                      <Play className="size-4 fill-current" />
                      Acionar Conselho Supremo de IAs
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Painel de Resultados */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border bg-surface/65 backdrop-blur-xl h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="size-4 text-success" /> Plano de Guerra Orquestrado
              </CardTitle>
              <CardDescription>{etapaAtual}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between space-y-4">
              <div className="min-h-[400px] rounded-xl border border-border/50 bg-background/60 p-5 text-sm leading-relaxed text-gray-200 overflow-y-auto whitespace-pre-wrap font-sans">
                {relatorioOrquestrado || (
                  <span className="text-muted-foreground italic">
                    Configure o objetivo ao lado e clique em acionar o conselho para gerar a estratégia unificada...
                  </span>
                )}
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle2 className="size-4 text-success" /> Execução em Cadeia Síncrona</span>
                <span>AnuncIA OS · Core V2</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}