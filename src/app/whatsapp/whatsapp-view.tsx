"use client";

import { useState } from "react";
import { MessageSquare, Send, Bot, User, Sparkles, CheckCircle2, ShieldCheck, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Mensagem {
  id: string;
  remetente: "ia" | "lead";
  texto: string;
  hora: string;
}

const personasNicho = {
  supermercado: {
    nome: "Assistente Poup Marketing (Supermercado)",
    saudação: "Olá! Seja bem-vindo ao Poup Marketing em Mangaratiba! 🛒 Qual oferta do nosso encarte de fim de semana você veio garantir hoje?",
    contexto: "Supermercado varejista local. Foco em carne, hortifrúti, cerveja gelada e ofertas de gôndola.",
    promptSupremo: "Você é o MAIOR ESPECIALISTA EM VENDAS NO VAREJO ALIMENTAR DO BRASIL. Seu foco é gerar urgência de compra, destacar ofertas fresquinhas, encantar o cliente com economia e trazê-lo para a loja física em Mangaratiba com uma pitada de simpatia e alta persuasão.",
  },
  ecommerce: {
    nome: "Assistente Vitória Moda (E-commerce)",
    saudação: "Olá! Bem-vinda à Vitória Moda ✨ Procurando o look perfeito para o fim de semana ou querendo ver nossa nova coleção?",
    contexto: "E-commerce de vestuário feminino DTC. Foco em tendências, frete grátis e provador.",
    promptSupremo: "Você é o MASTER COPYWRITER E CLOSER DE E-COMMERCE DE MODA. Seu tom é magnético, elegante, acolhedor e altamente persuasivo. Você entende de caimento, tendências, urgência de estoque limitado e conversão imediata.",
  },
  saas: {
    nome: "Assistente TechFlow (SaaS B2B)",
    saudação: "Olá! Aqui é o assistente virtual da TechFlow. Como nossa plataforma de automação pode acelerar as vendas da sua empresa?",
    contexto: "Software B2B de automação de vendas. Foco em agendamento de demo e planos enterprise.",
    promptSupremo: "Você é o DIRETOR COMERCIAL DE SOFTWARE B2B DE ELITE. Seu foco é demonstrar autoridade técnica imediata, ROI acelerado, redução de custos operacionais e conversão de leads frios em reuniões de demonstração agendadas.",
  },
};

export function WhatsappView() {
  const [nichoAtivo, setNichoAtivo] = useState<keyof typeof personasNicho>("supermercado");
  const persona = personasNicho[nichoAtivo];

  const [mensagens, setMensagens] = useState<Record<string, Mensagem[]>>({
    supermercado: [
      { id: "1", remetente: "ia", texto: personasNicho.supermercado.saudação, hora: "09:00" },
    ],
    ecommerce: [
      { id: "1", remetente: "ia", texto: personasNicho.ecommerce.saudação, hora: "09:00" },
    ],
    saas: [
      { id: "1", remetente: "ia", texto: personasNicho.saas.saudação, hora: "09:00" },
    ],
  });

  const [inputTexto, setInputTesto] = useState("");
  const [qualificado, setQualificado] = useState(false);

  const mensagensAtuais = mensagens[nichoAtivo] || [];

  function mudarNicho(novoNicho: string) {
    setNichoAtivo(novoNicho as keyof typeof personasNicho);
    setQualificado(false);
  }

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
    
    setMensagens((prev) => ({
      ...prev,
      [nichoAtivo]: [...(prev[nichoAtivo] || []), novaMsg],
    }));
    setInputTesto("");

    // Resposta simulada operando sob a diretriz do Prompt Supremo
    setTimeout(() => {
      let respostaIa = "Com certeza! Temos ótimas condições para isso. Posso te enviar o catálogo completo aqui no WhatsApp?";
      
      if (nichoAtivo === "supermercado") {
        respostaIa = "Nossa carne para churrasco e as frutas do hortifrúti estão com preço de atacado hoje em Mangaratiba! 🥩🍎 Quer que eu te mande a lista de ofertas do fim de semana?";
      } else if (nichoAtivo === "ecommerce") {
        respostaIa = "Essa peça é um dos nossos maiores sucessos! Temos nos tamanhos P, M e G com frete grátis para compras acima de R$ 199. Qual o seu tamanho?";
      } else if (nichoAtivo === "saas") {
        respostaIa = "Perfeito! Nossa ferramenta integra CRM, tráfego e IA em um painel único. Gostaria de agendar uma demonstração de 15 minutos com um especialista?";
      }

      if (textoUsuario.includes("quero") || textoUsuario.includes("sim") || textoUsuario.includes("manda") || textoUsuario.includes("preço") || textoUsuario.includes("tamanho") || textoUsuario.includes("quanto")) {
        setQualificado(true);
        respostaIa = "Lead qualificado e direcionado com sucesso! 🎯 O fechamento foi engatilhado com alta prioridade pelo agente comercial.";
      }

      const respostaMsg: Mensagem = {
        id: (Date.now() + 1).toString(),
        remetente: "ia",
        texto: respostaIa,
        hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMensagens((prev) => ({
        ...prev,
        [nichoAtivo]: [...(prev[nichoAtivo] || []), respostaMsg],
      }));
    }, 1000);
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
            <h1 className="text-2xl font-bold tracking-tight">Agente Comercial de WhatsApp (Multi-Nicho Supremacia)</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Bot de vendas treinado com personas mestres de alta conversão para cada operação do seu CRM.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={nichoAtivo} onValueChange={mudarNicho}>
            <SelectTrigger className="w-[280px] bg-surface/80 border-border">
              <Building2 className="size-4 text-success mr-2" />
              <SelectValue placeholder="Selecione a operação..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="supermercado">🛒 Poup Marketing (Supermercado)</SelectItem>
              <SelectItem value="ecommerce">✨ Vitória Moda (E-commerce)</SelectItem>
              <SelectItem value="saas">💻 TechFlow (SaaS B2B)</SelectItem>
            </SelectContent>
          </Select>
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
                    <CardTitle className="text-sm font-semibold">{persona.nome}</CardTitle>
                    <CardDescription className="text-[11px]">{persona.contexto}</CardDescription>
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
              {mensagensAtuais.map((msg) => (
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
                  placeholder={`Digite como lead do ${persona.nome.split(" ")[1]}...`}
                  className="flex-1"
                />
                <Button type="submit" size="icon" className="shrink-0 bg-success hover:bg-success/90 text-success-foreground">
                  <Send className="size-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Estatísticas e Parâmetros */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border bg-surface/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base">Prompt Mestre Ativo</CardTitle>
              <CardDescription>Diretriz suprema injetada no agente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border/50 bg-background/50 p-3 space-y-1">
                <p className="text-xs font-semibold text-success">Persona em Execução</p>
                <p className="text-xs text-foreground font-medium">{persona.nome}</p>
                <p className="text-[11px] text-muted-foreground mt-1 italic">&quot;{persona.promptSupremo}&quot;</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Padrão de Qualidade</p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-success" /> Zero respostas genéricas — contexto 100% sob medida
                  </p>
                  <p className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" /> Foco agressivo em conversão e fechamento
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