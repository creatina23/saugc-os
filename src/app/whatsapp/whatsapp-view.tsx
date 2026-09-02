"use client";

import { MessageSquare, Bot, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export function WhatsappView() {
  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-success/15 text-success">
          <MessageSquare className="size-5" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Agente Comercial de WhatsApp (SaaS)</h1>
      </div>
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Simulador e central operacional do agente de vendas automatizado.</p>
      </Card>
    </div>
  );
}