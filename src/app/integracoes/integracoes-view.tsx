"use client";

import { Cpu, CheckCircle2, Key, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function IntegracoesView() {
  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Cpu className="size-5" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">APIs & Webhooks de Anúncios</h1>
      </div>
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Conectado ao Meta Marketing API e TikTok Ads com segurança SSL.</p>
      </Card>
    </div>
  );
}