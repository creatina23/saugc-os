"use client";

import { useState } from "react";
import React from "react";
import {
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Database,
  Loader2,
  Play,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";
import { orquestradorService, type EtapaOrquestracao } from "@/lib/services/orquestrador.service";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function OrquestradorView() {
  const [produto, setProduto] = useState("Sérum Facial Rejuvenescedor Glow 30ml");
  const [nicho, setNicho] = useState("Cosméticos e Skincare DTC");
  const [publico, setPublico] = useState("Mulheres de 28 a 45 anos preocupadas com linhas de expressão e manchas na pele");
  const [objetivo, setObjetivo] = useState("Escalar vendas no TikTok Ads com criativos UGC de alta conversão");
  const [pipelineMode, setPipelineMode] = useState<"completa" | "ugc" | "performance">("completa");
  const [autoCorrecao, setAutoCorrecao] = useState(true);

  const [executando, setExecutando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  const [etapas, setEtapas] = useState<EtapaOrquestracao[]>([
    { id: "comportamento", agente: "Psicologia do Consumidor", icone: "Brain", status: "pendente", resultado: "Aguardando início da operação..." },
    { id: "estrategista", agente: "Estrategista de Vendas", icone: "Target", status: "pendente", resultado: "Aguardando início da operação..." },
    { id: "copywriter", agente: "Copywriter de Alta Conversão", icone: "FileText", status: "pendente", resultado: "Aguardando início da operação..." },
    { id: "diretor", agente: "Diretor de Arte & Cena", icone: "Camera", status: "pendente", resultado: "Aguardando início da operação..." },
    { id: "engenheiro", agente: "Arquiteto Visual (Criativo Pronto)", icone: "Sparkles", status: "pendente", resultado: "Aguardando início da operação..." },
    { id: "analista", agente: "Auditor de Qualidade (Revisão Final)", icone: "CheckCircle2", status: "pendente", resultado: "Aguardando início da operação..." },
  ]);

  const [expandidoId, setExpandidoId] = useState<string | null>("comportamento");

  async function handleIniciarMissao(e: React.FormEvent) {
    e.preventDefault();
    if (!produto || !nicho || !publico || !objetivo) {
      toast("Preencha todos os campos do briefing", { type: "error" });
      return;
    }

    setExecutando(true);
    setConcluido(false);
    toast("Operação Iniciada", { description: "Nossa equipe de especialistas está estruturando sua campanha.", type: "success" });

    setEtapas((prev) =>
      prev.map((et) => ({ ...et, status: "processando", resultado: "Especialista em campo analisando..." }))
    );

    const res = await orquestradorService.executarPipeline({
      produto,
      nicho,
      publico,
      objetivo,
      pipelineMode,
      autoCorrecao,
    });

    setExecutando(false);

    if (!res.ok) {
      toast("Erro na execução", { description: res.erro || "Falha na operação", type: "error" });
      setEtapas((prev) =>
        prev.map((et) => (et.status === "processando" ? { ...et, status: "erro", resultado: res.erro || "Erro" } : et))
      );
      return;
    }

    setEtapas(res.etapas);
    setConcluido(true);
    toast("Campanha Pronta com Sucesso!", { description: "Estratégia validada e pronta para entrar em campo.", type: "success" });
  }

  async function handleSalvarOperacao() {
    setSalvando(true);
    const copyResult = etapas.find((e) => e.id === "copywriter")?.resultado || "";
    const promptResult = etapas.find((e) => e.id === "engenheiro")?.resultado || "";

    const res = await orquestradorService.salvarNaOperacao({
      titulo: `Estratégia: ${produto}`,
      cliente: nicho,
      script: copyResult,
      promptVisual: promptResult,
    });

    setSalvando(false);

    if (res.ok) {
      toast("Salvo na sua operação com sucesso!", { description: "Estratégia adicionada aos briefings oficiais.", type: "success" });
    } else {
      toast("Erro ao salvar", { description: res.erro || "Falha na persistência", type: "error" });
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Workflow className="size-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Centro de Decisão — Inteligência Operacional</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Um único briefing aciona nossa equipe de especialistas virtuais. Estratégia, copy e criativos prontos em minutos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
            <Sparkles className="size-3.5" /> Operação de Ponta a Ponta
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border bg-surface/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base">O que vamos lançar hoje?</CardTitle>
              <CardDescription>Conte sobre seu produto e deixe nossa inteligência desenhar a estratégia.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleIniciarMissao} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Foco da Operação</label>
                  <select
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={pipelineMode}
                    onChange={(e) => setPipelineMode(e.target.value as "completa" | "ugc" | "performance")}
                    disabled={executando}
                  >
                    <option value="completa">Campanha Completa (Estratégia + Copy + Criativo)</option>
                    <option value="ugc">Foco em Vídeos UGC & Roteiros</option>
                    <option value="performance">Foco em Anúncios de Resposta Direta (Vendas)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-background/50">
                  <div>
                    <p className="text-xs font-medium">Revisão de Qualidade Automática</p>
                    <p className="text-[11px] text-muted-foreground">Garante excelência máxima antes da entrega</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoCorrecao}
                    onChange={(e) => setAutoCorrecao(e.target.checked)}
                    disabled={executando}
                    className="size-4 accent-primary cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Produto ou Serviço</label>
                  <Input
                    value={produto}
                    onChange={(e) => setProduto(e.target.value)}
                    placeholder="Ex.: Sérum facial Glow"
                    disabled={executando}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Nicho de Mercado</label>
                  <Input
                    value={nicho}
                    onChange={(e) => setNicho(e.target.value)}
                    placeholder="Ex.: Cosméticos DTC"
                    disabled={executando}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Quem compra de você? (Público)</label>
                  <Textarea
                    value={publico}
                    onChange={(e) => setPublico(e.target.value)}
                    placeholder="Descreva o perfil do cliente ideal..."
                    rows={3}
                    disabled={executando}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Qual o objetivo comercial?</label>
                  <Input
                    value={objetivo}
                    onChange={(e) => setObjetivo(e.target.value)}
                    placeholder="Ex.: Vender no TikTok Ads"
                    disabled={executando}
                  />
                </div>

                <Button type="submit" className="w-full gap-2 font-semibold" disabled={executando}>
                  {executando ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Especialistas trabalhando...
                    </>
                  ) : (
                    <>
                      <Play className="size-4 fill-current" />
                      Executar Operação Completa
                    </>
                  )}
                </Button>

                {concluido && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full gap-2 font-semibold border border-success/40 bg-success/10 text-success hover:bg-success/20"
                    onClick={handleSalvarOperacao}
                    disabled={salvando}
                  >
                    {salvando ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Salvando na base...
                      </>
                    ) : (
                      <>
                        <Database className="size-4" />
                        Salvar Estratégia na Operação
                      </>
                    )}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Linha de Produção Estratégica</h2>
            <span className="text-xs text-muted-foreground">6 etapas integradas</span>
          </div>

          <div className="space-y-3">
            {etapas.map((etapa, idx) => {
              const expandido = expandidoId === etapa.id;
              return (
                <Card
                  key={etapa.id}
                  className={`border transition-all bg-surface/40 backdrop-blur-md ${
                    etapa.status === "processando"
                      ? "border-primary/60 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : etapa.status === "concluido"
                      ? "border-success/40"
                      : etapa.status === "erro"
                      ? "border-red-500/40"
                      : "border-border"
                  }`}
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer select-none"
                    onClick={() => setExpandidoId(expandido ? null : etapa.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex size-9 items-center justify-center rounded-xl font-bold text-xs ${
                          etapa.status === "concluido"
                            ? "bg-success/20 text-success"
                            : etapa.status === "processando"
                            ? "bg-primary/20 text-primary animate-pulse"
                            : etapa.status === "erro"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{etapa.agente}</p>
                          {etapa.nota !== undefined && (
                            <span className="rounded-md bg-violet-500/20 px-2 py-0.5 text-[11px] font-bold text-violet-300">
                              Nota: {etapa.nota}/10
                            </span>
                          )}
                          {etapa.iteracao && etapa.iteracao > 1 && (
                            <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                              Ajustado pelo Auditor (v{etapa.iteracao})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">
                          Status: {etapa.status === "concluido" ? "Pronto" : etapa.status === "processando" ? "Em andamento..." : "Aguardando"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {etapa.status === "processando" && <Loader2 className="size-4 animate-spin text-primary" />}
                      {etapa.status === "concluido" && <CheckCircle2 className="size-4 text-success" />}
                      <Button variant="ghost" size="icon" className="size-8">
                        {expandido ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </Button>
                    </div>
                  </div>

                  {expandido && (
                    <div className="border-t border-border px-4 py-4 bg-background/40 rounded-b-xl">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Resultado do Especialista:
                      </p>
                      <div className="rounded-lg bg-surface-2 p-3 text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto text-foreground/90 border border-border">
                        {etapa.resultado || "Aguardando início da operação..."}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}