"use client";

import { useState } from "react";
import { Award, Sparkles, Copy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast";

export function CriativosView() {
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
            Banco de inteligência de anúncios com ROAS superior a 3.5x para clonagem automática.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="card-glow p-5 border-warning/30 bg-surface/40">
          <Badge variant="success">ROAS 4.8x</Badge>
          <h3 className="text-base font-bold mt-2">Unboxing Verão Glow</h3>
          <p className="text-xs text-muted-foreground mt-1">Fórmula: Problema + Demonstração rápida</p>
        </Card>
      </div>
    </div>
  );
}