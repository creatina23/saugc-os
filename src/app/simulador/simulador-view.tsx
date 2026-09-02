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
                <p className="text-[11px] text-muted-foreground">Investimento mensal: <span className="font-semibold text-foreground">{formatBRL(budgetMes)}</span></p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Ticket Médio (R$)</label>
                <Input
                  inputMode="numeric"
                  value={ticketMedio}
                  onChange={(e) => setTicketMedio(e.target.value)}
                  placeholder="297"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">ROAS Esperado</label>
                <Input
                  inputMode="decimal"
                  value={roasEsperado}
                  onChange={(e) => setRoasEsperado(e.target.value)}
                  placeholder="3.5"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="card-glow border-border bg-surface/60 p-5">
              <p className="text-xs text-muted-foreground">Receita Bruta Mensal Projetada</p>
              <p className="mt-2 text-3xl font-bold text-success">{formatBRL(receitaMensal)}</p>
            </CardCard>
            <Card className="card-glow border-border bg-surface/60 p-5">
              <p className="text-xs text-muted-foreground">Lucro Operacional Estimado</p>
              <p className="mt-2 text-3xl font-bold text-primary">{formatBRL(lucroEstimado)}</p>
            </CardCard>
          </div>
        </div>
      </div>
    </div>
  );
}