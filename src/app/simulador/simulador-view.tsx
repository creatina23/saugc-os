"use client";

import { useState } from "react";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Target,
  Sparkles,
  ShieldAlert,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import { formatBRL, formatNumber } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function SimuladorView() {
  const [orcamentoDiario, setOrcamentoDiario] = useState<string>("300");
  const [ticketMedio, setTicketMedio] = useState<string>("297");
  const [roasEsperado, setRoasEsperado] = useState<string>("3.5");
  const [taxaConversao, setTaxaConversao] = useState<string>("2.5");

  const budgetDia = Number(orcamentoDiario) || 0;
  const budgetMes = budgetDia * 30;
  const ticket = Number(ticketMedio) || 1;
  const roas = Number(roasEsperado) || 1;
  const cpa = ticket > 0 && roas > 0 ? ticket / roas : 50;

  const receitaMensal = budgetMes * roas;
  const lucroEstimado = receitaMensal - budgetMes;
  const vendasMensais = ticket > 0 ? Math.round(receitaMensal / ticket) : 0;
  const cliquesEstimados = cpa > 0 ? Math.round((budgetMes / cpa) * 15) : 0;

  const alertaSaturacao = budgetDia > 2000;

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Calculator className="size-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Simulador de Projeção de Escala</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Projete receita, lucro, CPA e ponto de saturação de criativos antes de investir seu orçamento em tráfego pago.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <Sparkles className="size-3.5" /> Algoritmo Preditivo Ativo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border bg-surface/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base">Parâmetros da Operação</CardTitle>
              <CardDescription>Ajuste as variáveis para simular diferentes cenários de escala.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Orçamento Diário (R$)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    inputMode="numeric"
                    value={orcamentoDiario}
                    onChange={(e) => setOrcamentoDiario(e.target.value)}
                    placeholder="300"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Investimento mensal projetado: <span className="font-semibold text-foreground">{formatBRL(budgetMes)}</span></p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Ticket Médio do Produto (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">R$</span>
                  <Input
                    className="pl-8"
                    inputMode="numeric"
                    value={ticketMedio}
                    onChange={(e) => setTicketMedio(e.target.value)}
                    placeholder="297"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">ROAS Esperado (Retorno sobre o Gasto)</label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    inputMode="decimal"
                    value={roasEsperado}
                    onChange={(e) => setRoasEsperado(e.target.value)}
                    placeholder="3.5"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">CPA estimado: <span className="font-semibold text-emerald-400">{formatBRL(cpa)}</span></p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Taxa de Conversão Média (%)</label>
                <Input
                  inputMode="decimal"
                  value={taxaConversao}
                  onChange={(e) => setTaxaConversao(e.target.value)}
                  placeholder="2.5"
                />
              </div>

              {alertaSaturacao && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-start gap-2">
                  <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Alerta de Saturação de Público</p>
                    <p className="text-[11px] text-amber-200/80 mt-0.5">Orçamentos acima de R$ 2.000/dia exigem rotação semanal de criativos.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="card-glow border-border bg-surface/60 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 size-24 rounded-full bg-success/10 blur-2xl" />
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">Receita Bruta Mensal Projetada</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-success">{formatBRL(receitaMensal)}</p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-success">
                  <ArrowUpRight className="size-3.5" />
                  <span>{roas.toFixed(1)}x de retorno sobre o investimento</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-glow border-border bg-surface/60 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 size-24 rounded-full bg-primary/10 blur-2xl" />
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">Lucro Operacional Estimado</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-primary">{formatBRL(lucroEstimado)}</p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TrendingUp className="size-3.5 text-primary" />
                  <span>Subtraindo o budget de mídia</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-surface/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="size-4 text-ai" /> Indicadores de Conversão & Volume
              </CardTitle>
              <CardDescription>Métricas de vendas estimadas com base nos parâmetros</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border/50 bg-background/50">
                <div>
                  <p className="text-xs text-muted-foreground">Vendas / Mês</p>
                  <p className="text-xl font-bold mt-1">{formatNumber(vendasMensais)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vendas / Dia</p>
                  <p className="text-xl font-bold mt-1">~{Math.max(1, Math.round(vendasMensais / 30))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cliques Úteis</p>
                  <p className="text-xl font-bold mt-1">{formatNumber(cliquesEstimados)}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cenários de Sensibilidade</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-border/40 p-3 bg-surface/30">
                    <p className="text-xs font-medium text-amber-400">Conservador (-20%)</p>
                    <p className="text-sm font-bold mt-1">{formatBRL(receitaMensal * 0.8)}</p>
                  </div>
                  <div className="rounded-xl border border-primary/40 p-3 bg-primary/5">
                    <p className="text-xs font-medium text-primary">Realista (Atual)</p>
                    <p className="text-sm font-bold mt-1">{formatBRL(receitaMensal)}</p>
                  </div>
                  <div className="rounded-xl border border-success/40 p-3 bg-success/5">
                    <p className="text-xs font-medium text-success">Otimista (+25%)</p>
                    <p className="text-sm font-bold mt-1">{formatBRL(receitaMensal * 1.25)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}