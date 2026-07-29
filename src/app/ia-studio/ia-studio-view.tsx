"use client";

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
  Image as ImageIcon,
  Loader2,
  PenLine,
  Save,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { aiHistory, aiModels } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { AiModelCategory } from "@/types";

const agents = [
  { name: "AI Strategist", icon: Brain, description: "Ângulos de venda e posicionamento" },
  { name: "AI Copywriter", icon: PenLine, description: "Hooks, headlines e CTAs" },
  { name: "AI UGC Writer", icon: Clapperboard, description: "Roteiros UGC em cenas" },
  { name: "AI Prompt Engineer", icon: Terminal, description: "Prompts para imagem e vídeo" },
  { name: "AI Creative Analyst", icon: Gauge, description: "Nota e melhorias do criativo" },
];

const categoryIcon: Record<AiModelCategory, typeof FileText> = {
  Texto: FileText,
  Imagem: ImageIcon,
  Vídeo: Clapperboard,
};

const categoryBadge: Record<AiModelCategory, "default" | "violet" | "info"> = {
  Texto: "default",
  Imagem: "violet",
  Vídeo: "info",
};

const highlightBadge: Record<string, "success" | "violet" | "info" | "warning" | "secondary"> = {
  Recomendado: "success",
  Premium: "violet",
  Novo: "info",
  Visual: "warning",
  Beta: "secondary",
};

export function IaStudioView() {
  const [selectedModel, setSelectedModel] = useState(aiModels[0].id);
  const [selectedAgent, setSelectedAgent] = useState(agents[0].name);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1200);
  const [promptText, setPromptText] = useState("");
  const [output, setOutput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);

  const currentModel = aiModels.find((item) => item.id === selectedModel) ?? aiModels[0];

  const stats = [
    { label: "Modelos disponíveis", value: aiModels.length.toString(), icon: Bot, tone: "bg-primary/15 text-primary" },
    { label: "Agentes ativos", value: agents.length.toString(), icon: Wand2, tone: "bg-ai/15 text-ai" },
    { label: "Gerações no histórico", value: aiHistory.length.toString(), icon: History, tone: "bg-success/15 text-success" },
    { label: "Tokens consumidos", value: "128,4 mil", icon: Coins, tone: "bg-warning/15 text-warning" },
  ];

  function handleGenerate() {
    setGenerating(true);
    setOutput("");
    setTimeout(() => {
      setOutput(
        `Resultado simulado pelo ${selectedAgent} com ${currentModel.name} (temp ${temperature.toLocaleString("pt-BR")} · máx ${maxTokens} tokens):\n\nHook: "Pare de perder vendas por criativos fracos — seu produto merece um anúncio que segura o dedo do scroll."\n\nCena 1 (0-3s): hook visual com prova social.\nCena 2 (3-12s): dor do avatar em situação real.\nCena 3 (12-22s): demonstração do produto em uso.\nCena 4 (22-30s): oferta, urgência e CTA direto.\n\nObservação: conteúdo gerado em modo de demonstração. Na Sprint 002, este playground se conecta aos modelos reais.`
      );
      setGenerating(false);
    }, 1400);
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
      <PageHeader title="IA Studio" badge="Beta" description="Playground de agentes de IA da operação.">
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
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${stat.tone}`}>
                <stat.icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">{stat.label}</p>
                <p className="truncate text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        Modelos conectados
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {aiModels.map((model) => {
          const CategoryIcon = categoryIcon[model.category];
          const selected = model.id === selectedModel;
          return (
            <button
              key={model.id}
              type="button"
              onClick={() => setSelectedModel(model.id)}
              aria-pressed={selected}
              className="cursor-pointer text-left"
            >
              <Card
                className={cn(
                  "h-full transition-all",
                  selected
                    ? "border-primary/50 shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_0_24px_rgba(59,130,246,0.12)]"
                    : "card-glow"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-ai/15 text-ai">
                      <CategoryIcon className="size-4" />
                    </div>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Badge variant={highlightBadge[model.badge] ?? "secondary"}>
                        {model.badge}
                      </Badge>
                      <Badge variant={categoryBadge[model.category]}>{model.category}</Badge>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold">{model.name}</p>
                  <p className="text-[11px] text-muted-foreground">{model.provider}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {model.description}
                  </p>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="size-5 text-primary" />
              Configuração da geração
            </CardTitle>
            <CardDescription>Agente, contexto e parâmetros do modelo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Agente especializado</p>
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
                          active ? "bg-ai/20 text-ai" : "bg-muted text-muted-foreground"
                        )}
                      >
                        <agent.icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">{agent.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {agent.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Modelo selecionado</p>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger aria-label="Selecionar modelo">
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
                <SelectContent>
                  {aiModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} · {model.provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="studio-prompt" className="mb-2 block text-xs font-medium text-muted-foreground">
                Prompt
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
                  <span className="font-medium text-muted-foreground">Temperatura</span>
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
                  onChange={(event) => setTemperature(Number(event.target.value))}
                  aria-label="Temperatura do modelo"
                  className="w-full accent-primary"
                />
              </div>
              <div className="rounded-xl border border-border p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">Máx. tokens</span>
                  <span className="font-mono-params text-foreground">{maxTokens}</span>
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
              </div>
            </div>

            <Button
              variant="ai"
              className="w-full"
              onClick={handleGenerate}
              disabled={generating || !promptText.trim()}
            >
              {generating ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {generating ? "Gerando resposta..." : "Gerar resposta (mock)"}
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-ai" />
              Saída do agente
            </CardTitle>
            <CardDescription>Resultado estruturado pronto para revisão</CardDescription>
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
                    {selectedAgent} processando com {currentModel.name}...
                  </p>
                </div>
              ) : output ? (
                <pre className="font-mono-params text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {output}
                </pre>
              ) : (
                <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center">
                  <Sparkles className="size-8 text-muted-foreground/40" />
                  <p className="mt-3 text-sm font-medium">Nenhuma geração ainda</p>
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    Escolha um agente, descreva a tarefa e clique em Gerar resposta para ver o
                    resultado simulado.
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
                  {copiedTarget === "output" ? <Check className="text-success" /> : <Copy />}
                  {copiedTarget === "output" ? "Copiado" : "Copiar"}
                </Button>
                <Button variant="secondary" size="sm">
                  <Save />
                  Salvar na biblioteca
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
          <CardDescription>Últimas execuções dos agentes da operação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {aiHistory.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border p-4 transition-colors hover:border-[rgba(255,255,255,0.16)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="violet">{item.agent}</Badge>
                  <Badge variant="outline">{item.model}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">{item.createdAt}</span>
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
                  <p className="text-xs leading-relaxed text-muted-foreground">{item.output}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}