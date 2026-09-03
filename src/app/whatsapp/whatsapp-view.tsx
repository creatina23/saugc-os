"use client";

import { useState } from "react";
import { MessageSquare, Send, Bot, User, Sparkles, CheckCircle2, ShieldCheck, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Mensagem {
  id: string;
  remetente: "ia" | "lead";
  texto: string;
  hora: string;
}

export function WhatsappView() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: "1",
      remetente: "ia",
      texto: "Olá! Sou a assistente virtual comercial da AnuncIA. Como posso ajudar a escalar a sua operação de marketing e tráfego hoje?",
      hora: "09:00",
    },
  ]);
  const [inputTexto, setInputTesto] = useState("");
  const [qualificado, setQualificado] = useState(false);

  function enviarMensagem(e: React.FormEvent) {
    e.preventDefault();
    if (!inputTexto.trim()) return;

    const novaMsg: Mensagem = {
      id: Date.now().toString(),
      remetente: "lead",
      texto: inputTexto,
      hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const textoUsuario = inputTexto.toLowerCase();
    setMensagens((prev) => [...prev, novaMsg]);
    setInputTesto("");

    // Resposta simulada da IA Comercial de WhatsApp
    setTimeout(() => {
      let respostaIa = "Entendi perfeitamente! Para operações como a sua, a AnuncIA automatiza a criação de criativos UGC, organização de campanhas e estratégia de escala com IA. Você gostaria de conhecer o plano Growth ou Enterprise?";
      
      if (textoConversao(textoUsuario)) {
        setQualificado(true);
        respostaIa = "Lead qualificado com sucesso! 🎯 Identifiquei alto potencial de escala na sua operação. Nosso plano Enterprise atende perfeitamente agências e gestores com múltiplos clientes. Vou encaminhar o link de acesso imediato e o contrato de implantação.";
      }

      const respostaMsg: Mensagem = {
        id: (Date.now() + 1).toString(),
        remetente: "ia",
        texto: respostaIa,
        hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMensagens((prev) => [...prev, respostaMsg]);
    }, 1000);
  }

  function textoConversao(texto: string) {
    return texto.includes("quero") || texto.includes("comprar") || texto.includes("preço") || texto.includes("plano") || texto.includes("agência") || texto.includes("orçamento");
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-success/15 text-success">
              <MessageSquare className="size-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Agente Comercial de WhatsApp (SaaS)</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Simulador e central operacional do agente de vendas automatizado que qualifica leads e apresenta os planos da AnuncIA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <Sparkles className="size-3.5" /> Bot Comercial Ativo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Painel do Chat Simulador */}
        <div className="lg:col-span-8">
          <Card className="border-border bg-surface/60 backdrop-blur-xl flex flex-col min-h-[550px]">
            <CardHeader className="border-b border-border py-4 bg-background/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="flex size-10 items-center justify-center rounded-full bg-success/20 text-success font-bold">
                      <Bot className="size-5" />
                    </span>
                    <span className="absolute bottom-0 right-0 size-3 rounded-full bg-success border-2 border-background" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">AnuncIA Assistant (WhatsApp)</CardTitle>
                    <CardDescription className="text-[11px]">Online — Qualificação automática de leads</CardDescription>
                  </div>
                </div>
                {qualificado && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-2.5 py-1 text-xs font-medium text-success">
                    <CheckCircle2 className="size-3.5" /> Lead Qualificado (Hot)
                  </span>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
              {mensagens.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.remetente === "lead" ? "justify-end" : "justify-start"}`}
                >
                  {msg.remetente === "ia" && (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success/20 text-success text-xs">
                      <Bot className="size-3.5" />
                    </span>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-md ${
                      msg.remetente === "lead"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-surface-2 border border-border text-foreground rounded-bl-none"
                    }`}
                  >
                    <p>{msg.texto}</p>
                    <span className={`block text-[10px] mt-1 text-right ${msg.remetente === "lead" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {msg.hora}
                    </span>
                  </div>
                  {msg.remetente === "lead" && (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs">
                      <User className="size-3.5" />
                    </span>
                  )}
                </div>
              ))}
            </CardContent>

            <div className="border-t border-border p-4 bg-background/40 mt-auto">
              <form onSubmit={enviarMensagem} className="flex items-center gap-2">
                <Input
                  value={inputTexto}
                  onChange={(e) => setInputTesto(e.target.value)}
                  placeholder="Digite uma mensagem simulando um lead (ex: 'Quero conhecer os planos')..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" className="shrink-0 bg-success hover:bg-success/90 text-success-foreground">
                  <Send className="size-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Estatísticas e Parâmetros do Agente */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border bg-surface/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base">Métricas do Funil WhatsApp</CardTitle>
              <CardDescription>Performance em tempo real do agente comercial</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/50 bg-background/50 p-3">
                  <p className="text-xs text-muted-foreground">Leads Atendidos</p>
                  <p className="text-xl font-bold mt-1">142</p>
                  <p className="text-[10px] text-success mt-0.5">últimas 24h</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-background/50 p-3">
                  <p className="text-xs text-muted-foreground">Taxa Qualificação</p>
                  <p className="text-xl font-bold mt-1">68.4%</p>
                  <p className="text-[10px] text-primary mt-0.5">+4.2% vs ontem</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Regras de Atendimento</p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-success" /> Qualificação automática de intenção de compra
                  </p>
                  <p className="flex items-center gap-2">
                    <PhoneCall className="size-4 text-primary" /> Encaminhamento inteligente para fechar plano Enterprise
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}