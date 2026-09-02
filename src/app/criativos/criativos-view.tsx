"use client";

import { useState } from "react";
import { Award, Sparkles, Copy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast";

interface CriativoVencedor {
  id: string;
  nome: string;
  cliente: string;
  plataforma: string;
  roas: number;
  fórmula: string;
  hook: string;
}

export function CriativosView() {
  const [vencedores] = useState<CriativoVencedor[]>([
    {
      id: "v1",
      nome: "Unboxing Verão Glow — UGC v4",
      cliente: "Vitória Moda",
      plataforma: "TikTok",
      roas: 4.8,
      fórmula: "Problema imediato + Demonstração em câmera rápida + Garantia estendida",
      hook: "\"Se sua pele fica oleosa no verão, você precisa ver isso.\"",
    },
    {
      id: "v2",
      nome: "Depoimento Transformação 60 Dias",
      cliente: "NutriPlus",
      plataforma: "Meta Ads",
      roas: 4.2,
      fórmula: "Before/After emocional + Prova com números reais + CTA de lote limitado",
      hook: "\"Eu perdi 8kg em 2 meses sem deixar de comer o que gosto.\"",
    },
    {
      id: "v3",
      nome: "Tour Cozinha Compacta EcoHome",
      cliente: "EcoHome BR",
      plataforma: "Meta Ads",
      roas: 3.9,
      fórmula: "Tour rápido 15s + Destaque de 3 benefícios ocultos + Preço de lançamento",
      hook: "\"Como transformar um espaço pequeno em uma cozinha de revista.\"",
    },
  ]);

  function clonarEstrutura(item: CriativoVencedor) {
    toast(`Estrutura de "${item.nome}" copiada para o Orquestrador!`, {
      description: "Os agentes já estão configurados com esta fórmula vencedora.",
      type: "success",
    });
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-warning/15 text-warning">
              <Award className="size-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Memória de Criativos Vencedores</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Banco de inteligência de anúncios com ROAS superior a 3.5x. O sistema utiliza essas estruturas para gerar variações validadas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/orquestrador">
            <Button className="gap-2 font-semibold shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Sparkles className="size-4" />
              Criar Nova Variação no Orquestrador
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vencedores.map((item) => (
          <Card key={item.id} className="card-glow flex flex-col justify-between border-warning/30 bg-surface/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="success">ROAS {item.roas}x</Badge>
                <span className="text-xs text-muted-foreground">{item.plataforma}</span>
              </div>
              <CardTitle className="text-base mt-2">{item.nome}</CardTitle>
              <CardDescription className="text-xs">{item.cliente}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="rounded-xl border border-border/50 bg-background/50 p-3 space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Hook Vencedor</p>
                <p className="text-xs font-medium text-foreground italic">{item.hook}</p>
              </div>

              <div className="rounded-xl border border-border/50 bg-background/50 p-3 space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Fórmula Estrutural</p>
                <p className="text-xs text-muted-foreground">{item.fórmula}</p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full gap-2 border border-warning/40 bg-warning/10 text-warning hover:bg-warning/20 font-semibold"
                onClick={() => clonarEstrutura(item)}
              >
                <Copy className="size-3.5" /> Clonar Fórmula no Orquestrador
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}