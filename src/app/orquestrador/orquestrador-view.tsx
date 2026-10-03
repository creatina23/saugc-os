"use client";

// ORQUESTRADOR V1 — CP-01 · página alinhada à ARQUITETURA REAL
// ======================================================================
// Verdade na tela (C-01): a cadeia É enfileirada de verdade — cada botão
// aciona /api/orquestrador (ação "orquestrar-objetivo", Gate 401 se houver
// sem sessão), e a sequência abaixo mostra o status REAL de cada etapa
// especializada após a resposta. O teatro anterior (rótulo hiperbólico +
// animação de 4 etapas fakes com setTimeout) NÃO representava o sistema —
// e o rascunho dessa dívida (AGT-013) virou LEGADO/ORPHAN no CP-01B: sem
// consumidor real, não mantido por nostalgia.
//
// Contrato UX preservado pelo rito:
// - o input objetivo deixa de vir pré-preenchido com exemplo fictício;
// - saída = cartão por etapa (agente, ícone mapeado por id, status real,
//   resultado, nota do auditor quando houver).
// - falha intermediária = banner honesto na etapa (msg do motor), a
//   cadeia continua — exatamente o mesmo comportamento do servidor.
// - não afirmamos memória, ferramenta, execução externa ou prova.

import { useState } from "react";
import {
  Workflow,
  Loader2,
  Play,
  ShieldCheck,
  Brain,
  Target,
  FileText,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { orquestradorService, type EtapaOrquestracao } from "@/lib/services/orquestrador.service";
import { PERSONAS_ORQUESTRADOR } from "@/lib/orquestrador/pipeline";
import { toast } from "@/lib/toast";

const ICONES: Record<string, typeof Brain> = {
  Brain,
  Target,
  FileText,
  Camera,
  Sparkles,
  CheckCircle2,
};

const STATUS_TEXTO: Record<EtapaOrquestracao["status"], string> = {
  pendente: "Aguardando",
  processando: "Processando…",
  concluido: "Concluído",
  erro: "Sem resposta do motor",
};

const STATUS_BADGE: Record<EtapaOrquestracao["status"], "outline" | "success" | "warning" | "secondary"> = {
  pendente: "secondary",
  processando: "outline",
  concluido: "success",
  erro: "warning",
};

export function OrquestradorView() {
  const [objetivoNegocio, setObjetivoNegocio] = useState("");
  const [executando, setExecutando] = useState(false);
  const [etapas, setEtapas] = useState<EtapaOrquestracao[] | null>(null);
  const [erroGlobal, setErroGlobal] = useState<string | null>(null);

  async function handleExecutar(e: React.FormEvent) {
    e.preventDefault();
    if (!objetivoNegocio.trim()) {
      toast("Escreva o objetivo estratégico que a cadeia deve resolver", { type: "error" });
      return;
    }
    setExecutando(true);
    setEtapas(null);
    setErroGlobal(null);

    const resultado = await orquestradorService.orquestrarObjetivo(objetivoNegocio.trim());
    setExecutando(false);

    if (resultado.etapas.length > 0) {
      setEtapas(resultado.etapas);
    }
    if (!resultado.ok) {
      setErroGlobal(resultado.erro ?? "Falha na cadeia de especialistas");
      toast("A cadeia não concluiu", { description: resultado.erro ?? "falha geral", type: "error" });
      return;
    }
    toast("Cadeia executada — cada especialista recebeu a inteligência do anterior.", { type: "success" });
  }

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Orquestrador de Agentes"
        description="Cadeia de especialistas: o objetivo passa em sequência e cada um recebe a inteligência real produzida pelo anterior."
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Workflow className="size-3.5" /> Cadeia real em sequência
        </span>
      </PageHeader>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Entrada */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border bg-surface/65 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="size-4 text-primary" /> Objetivo da Operação
              </CardTitle>
              <CardDescription>
                Descreva o objetivo estratégico. A cadeia inteira vai trabalhar exatamente sobre esta entrada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExecutar} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Objetivo</label>
                  <Textarea
                    rows={6}
                    value={objetivoNegocio}
                    onChange={(e) => setObjetivoNegocio(e.target.value)}
                    placeholder="Ex.: lançar uma campanha de reativação de clientes inativos da loja em 30 dias, com verba limitada e foco em WhatsApp."
                    className="text-sm leading-relaxed"
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-border/50 bg-background/50 space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Especialistas da cadeia (ordem real)</p>
                  <ol className="text-xs text-foreground space-y-1.5">
                    {PERSONAS_ORQUESTRADOR.map((persona, indice) => {
                      const Icone = ICONES[persona.icone] ?? Brain;
                      return (
                        <li key={persona.id} className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground tabular-nums w-4">{indice + 1}.</span>
                          <Icone className="size-3.5 text-primary" />
                          <span>{persona.agente}</span>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                <Button type="submit" className="w-full gap-2 font-semibold" disabled={executando}>
                  {executando ? (
                    <><Loader2 className="size-4 animate-spin" /> Executando a cadeia…</>
                  ) : (
                    <><Play className="size-4 fill-current" /> Executar cadeia de especialistas</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border bg-surface/65 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="size-4 text-success" /> Resultado da cadeia
              </CardTitle>
              <CardDescription>
                {etapas === null
                  ? "Os resultados reais de cada etapa aparecem aqui após a execução."
                  : "Cada cartão mostra exatamente o que aquele especialista produziu com o contexto recebido."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {erroGlobal && (
                <div className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-xs text-warning flex items-start gap-2">
                  <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                  <p>{erroGlobal}</p>
                </div>
              )}
              {etapas === null && !erroGlobal && (
                <p className="text-sm italic text-muted-foreground">
                  Escreva o objetivo ao lado e execute a cadeia…
                </p>
              )}
              {etapas?.map((etapa) => {
                const Icone = ICONES[etapa.icone] ?? Brain;
                return (
                  <section key={etapa.id} className="rounded-xl border border-border/50 bg-background/60 p-4 space-y-2">
                    <header className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold m-0 flex items-center gap-2">
                        <Icone className="size-3.5 text-primary" /> {etapa.agente}
                      </h3>
                      <Badge variant={STATUS_BADGE[etapa.status]}>{STATUS_TEXTO[etapa.status]}</Badge>
                    </header>
                    {etapa.erro && (
                      <p className="text-[11px] text-warning">{etapa.erro}</p>
                    )}
                    {etapa.resultado && (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{etapa.resultado}</p>
                    )}
                    {typeof etapa.nota === "number" && (
                      <p className="text-[11px] font-semibold text-primary">Nota do auditor: {etapa.nota}/10</p>
                    )}
                  </section>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
