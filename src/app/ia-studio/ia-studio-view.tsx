"use client";

// IA Studio — playground de agentes ligado no MOTOR REAL (/api/ia).
// ------------------------------------------------------------------
// • Cada agente é uma persona de verdade (prefixo de instrução enviado
//   junto com a tarefa do usuário).
// • Temperatura e Máx. tokens são controles REAIS (chegam ao modelo).
// • Providers: mostramos a verdade — Gemini conectado; demais "Em breve".
// • Histórico: gerações reais DESTA sessão (persistência vem na fase
//   de Integrações/Storage, em sprint futura).

import { useState } from "react";
import {
  Bot,
  Brain,
  Check,
  Clapperboard,
  Coins,
  Copy,
  FileText,
  Gauge,
  History,
  Loader2,
  PenLine,
  Settings2,
  Sparkles,
  Terminal,
  Wand2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { iaService } from "@/lib/services/ia-service";
import { cn } from "@/lib/utils";

// ---------- Agentes (personas reais, em PT-BR) ----------

const agents = [
  {
    name: "Estrategista IA",
    icon: Brain,
    description: "Ângulos de venda e posicionamento",
    instrucao:
      "Você é o Estrategista IA da AnuncIA, especialista em marketing de resposta direta e mídia paga no Brasil. Entregue ângulos de venda, posicionamentos e big ideas com clareza cirúrgica, sempre pensando em conversão.",
  },
  {
    name: "Copywriter IA",
    icon: PenLine,
    description: "Hooks, headlines e CTAs",
    instrucao:
      "Você é o Copywriter IA da AnuncIA, especialista em direct response. Escreva hooks, headlines e CTAs curtos, específicos e orientados a ação.",
  },
  {
    name: "Roteirista UGC IA",
    icon: Clapperboard,
    description: "Roteiros UGC em cenas",
    instrucao:
      "Você é o Roteirista UGC IA da AnuncIA. Escreva roteiros para vídeos UGC em cenas (Hook 0-3s, dor, demonstração, prova, oferta+CTA), com falas naturais de conversa, indicações visuais entre colchetes e duração por cena.",
  },
  {
    name: "Engenheiro de Prompts IA",
    icon: Terminal,
    description: "Prompts para imagem e vídeo",
    instrucao:
      "Você é o Engenheiro de Prompts IA da AnuncIA. Crie prompts detalhados para geradores de imagem e vídeo (estilo, luz, enquadramento, câmera, clima), em português, prontos para copiar e colar.",
  },
  {
    name: "Analista Criativo IA",
    icon: Gauge,
    description: "Nota e melhorias do criativo",
    instrucao:
      "Você é o Analista Criativo IA da AnuncIA. Avalie o material enviado com nota de 0 a 10, justificativa curta, 3 pontos fortes e 3 melhorias práticas ordenadas por impacto.",
  },
];

// ---------- Providers (a verdade, sem fingimento) ----------

const providers = [
  {
    nome: "Gemini Flash",
    detalhe: "Google · texto",
    descricao:
      "Conectado e respondendo. O modelo exato é escolhido sozinho pelo motor — sempre o flash mais novo da sua chave.",
    icone: FileText,
    conectado: true,
  },
  {
    nome: "Groq",
    detalhe: "texto rápido · Whisper",
    descricao:
      "Reserva de velocidade — entra quando precisarmos de resposta quase instantânea.",
    icone: Bot,
    conectado: false,
  },
  {
    nome: "GitHub Models",
    detalhe: "grátis com sua conta GitHub",
    descricao:
      "Cardápio de modelos sem custo, usando a conta que você já tem.",
    icone: Terminal,
    conectado: false,
  },
  {
    nome: "OpenRouter",
    detalhe: "35+ modelos gratuitos",
    descricao:
      "Rota de fuga completa, caso algum provider mude as regras do jogo.",
    icone: Sparkles,
    conectado: false,
  },
];

const MODELO_ROTULO = "Gemini Flash (auto)";

type GeracaoReal = {
  id: string;
  agente: string;
  modelo: string;
  prompt: string;
  output: string;
  hora: string;
};

export function IaStudioView() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0].name);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1200);
  const [promptText, setPromptText] = useState("");
  const [output, setOutput] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);
  const [historico, setHistorico] = useState<GeracaoReal[]>([]);

  const stats = [
    {
      label: "Modelo em uso",
      value: "Automático",
      icon: Bot,
      tone: "bg-primary/15 text-primary",
    },
    {
      label: "Agentes ativos",
      value: agents.length.toString(),
      icon: Wand2,
      tone: "bg-ai/15 text-ai",
    },
    {
      label: "Gerações nesta sessão",
      value: historico.length.toString(),
      icon: History,
      tone: "bg-success/15 text-success",
    },
    {
      label: "Custo de IA hoje",
      value: "R$ 0",
      icon: Coins,
      tone: "bg-warning/15 text-warning",
    },
  ];

  async function handleGenerate() {
    if (!promptText.trim() || generating) return;

    setGenerating(true);
    setOutput("");
    setErro(null);

    const agente =
      agents.find((item) => item.name === selectedAgent) ?? agents[0];

    // Persona do agente + tarefa + regras de saída — o segredo de um bom resultado
    const promptFinal = [
      agente.instrucao,
      "",
      `Tarefa: ${promptText.trim()}`,
      "",
      "Responda em português do Brasil, direto ao ponto, sem preâmbulo e sem cercas de código — texto pronto para copiar e colar no trabalho.",
    ].join("\n");

    const resultado = await iaService.gerarTexto(promptFinal, {
      temperatura: temperature,
      maxTokens,
    });

    setGenerating(false);

    if (resultado.ok) {
      setOutput(resultado.texto);
      setHistorico((atual) => [
        {
          id: `gen-${Date.now()}`,
          agente: agente.name,
          modelo: MODELO_ROTULO,
          prompt: promptText.trim(),
          output: resultado.texto,
          hora: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...atual,
      ]);
    } else {
      setErro(resultado.erro ?? "A IA não respondeu. Tente de novo.");
    }
  }

  async function copyText(target: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTarget(target);
      setTimeout(() => setCopiedTarget(null), 1800);
    } catch {
      setCopiedTarget(null);
    }
  }

  return (
    <>
      <PageHeader
        title="IA Studio"
        badge="IA real"
        description="Seus agentes de IA — ligados no motor de verdade."
      >
        <Button
          variant="ai"
          onClick={() => document.getElementById("studio-prompt")?.focus()}
        >
          <Sparkles /> Nova Geração
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-glow">
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${stat.tone}`}
              >
                <stat.icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">
                  {stat.label}
                </p>
                <p className="truncate text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        Providers de IA
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {providers.map((provider) => (
          <Card
            key={provider.nome}
            className={
              provider.conectado
                ? "h-full border-success/40 shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_0_24px_rgba(16,185,129,0.08)]"
                : "card-glow h-full opacity-70"
            }
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-ai/15 text-ai">
                  <provider.icone className="size-4" />
                </div>
                <Badge variant={provider.conectado ? "success" : "secondary"}>
                  {provider.conectado ? "Conectado" : "Em breve"}
                </Badge>
              </div>
              <p className="mt-3 text-sm font-semibold">{provider.nome}</p>
              <p className="text-[11px] text-muted-foreground">
                {provider.detalhe}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {provider.descricao}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="size-5 text-primary" />
              Configuração da geração
            </CardTitle>
            <CardDescription>
              Agente, contexto e parâmetros do modelo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Agente especializado
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {agents.map((agent) => {
                  const active = agent.name === selectedAgent;
                  return (
                    <button
                      key={agent.name}
                      type="button"
                      onClick={() => setSelectedAgent(agent.name)}
                      aria-pressed={active}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all",
                        active
                          ? "border-ai/50 bg-ai/10"
                          : "border-border hover:border-[rgba(255,255,255,0.16)]"
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg",
                          active
                            ? "bg-ai/20 text-ai"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <agent.icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">
                          {agent.name}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {agent.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border p-3 text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">
                Modelo em uso:{" "}
              </span>
              automático — o motor escolhe o melhor Gemini disponível para a
              sua chave e troca sozinho se o Google aposentar algum. Zero
              manutenção pra você.
            </div>

            <div>
              <label
                htmlFor="studio-prompt"
                className="mb-2 block text-xs font-medium text-muted-foreground"
              >
                Tarefa para o agente
              </label>
              <Textarea
                id="studio-prompt"
                value={promptText}
                onChange={(event) => setPromptText(event.target.value)}
                placeholder="Descreva o que o agente deve gerar... Ex.: Crie 5 hooks para a campanha Verão Glow focando em prova social."
                className="min-h-[120px]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">
                    Temperatura
                  </span>
                  <span className="font-mono-params text-foreground">
                    {temperature.toLocaleString("pt-BR")}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={temperature}
                  onChange={(event) =>
                    setTemperature(Number(event.target.value))
                  }
                  aria-label="Temperatura do modelo"
                  className="w-full accent-primary"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  0 = mais certeira · 1 = mais criativa
                </p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">
                    Máx. tokens
                  </span>
                  <span className="font-mono-params text-foreground">
                    {maxTokens}
                  </span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={4000}
                  step={200}
                  value={maxTokens}
                  onChange={(event) => setMaxTokens(Number(event.target.value))}
                  aria-label="Máximo de tokens"
                  className="w-full accent-ai"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  roteiros longos = aumente pra não cortar no meio
                </p>
              </div>
            </div>

            <Button
              variant="ai"
              className="w-full"
              onClick={() => void handleGenerate()}
              disabled={generating || !promptText.trim()}
            >
              {generating ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {generating ? "Gerando resposta..." : "Gerar resposta"}
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-ai" />
              Saída do agente
            </CardTitle>
            <CardDescription>
              Resultado real, pronto para copiar e colar
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <div className="flex-1 rounded-xl border border-border bg-[rgba(255,255,255,0.02)] p-4">
              {generating ? (
                <div className="space-y-3">
                  {[85, 95, 60, 90, 40].map((width) => (
                    <div
                      key={width}
                      style={{ width: `${width}%` }}
                      className="h-3 animate-pulse rounded-full bg-muted"
                    />
                  ))}
                  <p className="pt-2 text-xs text-muted-foreground">
                    {selectedAgent} pensando com Gemini Flash…
                  </p>
                </div>
              ) : erro ? (
                <div
                  role="alert"
                  className="rounded-lg border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.1)] px-3 py-2 text-sm text-red-300"
                >
                  {erro}
                </div>
              ) : output ? (
                <pre className="font-mono-params text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {output}
                </pre>
              ) : (
                <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center">
                  <Sparkles className="size-8 text-muted-foreground/40" />
                  <p className="mt-3 text-sm font-medium">
                    Nenhuma geração ainda
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    Escolha um agente, descreva a tarefa e clique em Gerar
                    resposta para ver a IA trabalhar de verdade.
                  </p>
                </div>
              )}
            </div>
            {output && !generating && (
              <div className="mt-3 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyText("output", output)}
                >
                  {copiedTarget === "output" ? (
                    <Check className="text-success" />
                  ) : (
                    <Copy />
                  )}
                  {copiedTarget === "output" ? "Copiado" : "Copiar"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-5 text-muted-foreground" />
            Histórico de gerações
          </CardTitle>
          <CardDescription>
            Suas gerações reais — vivem nesta sessão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {historico.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nenhuma geração ainda nesta sessão — a sua primeira está a um
              clique. ✨
            </div>
          ) : (
            historico.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border p-4 transition-colors hover:border-[rgba(255,255,255,0.16)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="violet">{item.agente}</Badge>
                    <Badge variant="outline">{item.modelo}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {item.hora}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Copiar resposta do histórico"
                      onClick={() => copyText(item.id, item.output)}
                      className="size-8 text-muted-foreground"
                    >
                      {copiedTarget === item.id ? (
                        <Check className="size-3.5 text-success" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-lg border border-border bg-[rgba(255,255,255,0.02)] p-3">
                    <p className="mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Entrada
                    </p>
                    <p className="text-xs leading-relaxed">{item.prompt}</p>
                  </div>
                  <div className="rounded-lg border border-ai/20 bg-ai/5 p-3">
                    <p className="mb-1 text-[10px] font-semibold tracking-wider text-ai uppercase">
                      Saída
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {item.output}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}