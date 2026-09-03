"use client";

import { useState } from "react";
import { Award, Sparkles, TrendingUp, Filter, Play, CheckCircle2, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";

interface Criativo {
  id: string;
  titulo: string;
  cliente: string;
  nicho: string;
  formato: string;
  roas: string;
  score: number;
  hookVencedor: string;
  status: string;
}

export function CriativosView() {
  const [criativos] = useState<Criativo[]>([
    {
      id: "1",
      titulo: "Unboxing Surpresa — Linha Skincare Premium",
      cliente: "Vitória Moda",
      nicho: "E-commerce DTC",
      formato: "Reels / TikTok (9:16)",
      roas: "4.8x",
      score: 9.8,
      hookVencedor: "'Eu testei o produto que esgotou em 24h e o resultado na minha pele foi surreal...'",
      status: "Escalando (R$ 2.500/dia)",
    },
    {
      id: "2",
      titulo: "Oferta de Churrasco do Fim de Semana",
      cliente: "Poup Marketing",
      nicho: "Supermercado Varejo",
      formato: "Carrossel / Stories",
      roas: "5.2x",
      score: 9.9,
      hookVencedor: "'O coxão mole e a cerveja gelada mais baratos de Mangaratiba estão aqui...'",
      status: "Campeão de Vendas na Loja Física",
    },
    {
      id: "3",
      titulo: "Depoimento Transformação 30 Dias",
      cliente: "NutriPlus",
      nicho: "Suplementos",
      formato: "Vídeo Depoimento UGC",
      roas: "3.9x",
      score: 9.4,
      hookVencedor: "'De 82kg para 74kg sem deixar de comer o que eu gosto no fim de semana...'",
      status: "Estável em Escala",
    },
  ]);

  const [busca, setBusca] = useState("");

  const filtrados = criativos.filter(
    (c) =>
      c.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      c.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      c.nicho.toLowerCase().includes(busca.toLowerCase())
  );

  function handleAuditar(titulo: string) {
    toast(`Auditoria IA iniciada para: ${titulo}`, {
      description: "O Analista Criativo de Elite está varrendo os ângulos de retenção desta peça.",
      type: "success",
    });
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <Award className="size-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Criativos Vencedores (Validação Suprema)</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Repositório blindado de anúncios validados com alto ROAS, ganchos de retenção de elite e análise de IA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
            <Sparkles className="size-3.5" /> Analista Criativo IA Ativo
          </span>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Filter className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filtrar criativos por título, cliente ou nicho..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Grid de Criativos Campeões */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((item) => (
          <Card key={item.id} className="border-border bg-surface/60 backdrop-blur-xl flex flex-col justify-between hover:border-amber-500/40 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2">
                    {item.nicho}
                  </span>
                  <CardTitle className="text-base">{item.titulo}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.cliente} • {item.formato}</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-xl text-xs font-black shadow-inner">
                  <Star className="size-3.5 fill-current" /> {item.score}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="p-3.5 rounded-xl border border-border/50 bg-background/50 space-y-1.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Hook Vencedor (Primeiros 3s)</p>
                <p className="text-xs font-medium text-foreground italic">{item.hookVencedor}</p>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase">Performance Real</span>
                  <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="size-3.5" /> ROAS {item.roas}
                  </p>
                </div>
                <span className="rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-bold text-success">
                  {item.status}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs font-semibold hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-500/30"
                onClick={() => handleAuditar(item.titulo)}
              >
                <Play className="size-3.5 fill-current" /> Auditar Variações com IA
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}