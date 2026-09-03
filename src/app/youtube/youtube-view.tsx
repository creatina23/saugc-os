"use client";

import { useState } from "react";
import { Video, Sparkles, CheckCircle2, Loader2, Play, Flame, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";

interface YoutubeResult {
  titulo: string;
  hook: string;
  capitulos: string[];
  thumbnailPrompt: string;
  estrategiaCapping: string;
}

export function YoutubeView() {
  const [tema, setTema] = useState("Como escalar tráfego pago usando agentes de IA no Orquestrador da AnuncIA");
  const [gerando, setAnalisando] = useState(false);
  const [resultado, setResultado] = useState<YoutubeResult | null>(null);

  async function handleGerarPauta(e: React.FormEvent) {
    e.preventDefault();
    if (!tema) {
      toast("Digite o tema do vídeo", { type: "error" });
      return;
    }

    setAnalisando(true);
    
    // Simulação executada sob a diretriz do Prompt Mestre Supremo (Mago do YouTube)
    setTimeout(() => {
      setAnalisando(false);
      setResultado({
        titulo: `[O Segredo] ${tema} (Revelado por Especialistas)`,
        hook: "00:00 - 00:45: Revelando o erro de R$ 50.000 que 93% dos gestores cometem ao tentar escalar tráfego manualmente — e como a IA resolve isso em minutos.",
        capitulos: [
          "00:45 - O Caos Operacional e o Fim das Agências Lentas",
          "03:20 - A Anatomia do Orquestrador de Agentes de IA",
          "08:15 - Estudo de Caso Prático: Do Briefing ao Criativo Validado",
          "14:40 - O Futuro do Marketing Digital com Automação Total",
        ],
        thumbnailPrompt: "Cinematic close-up of a digital marketer looking at glowing analytics dashboard, neon lighting, dramatic high contrast, YouTube thumbnail style --ar 16:9 --v 6.0",
        estrategiaCapping: "Foque nos primeiros 3 segundos de vídeo com corte seco na dor principal do público. Isso garante retenção acima de 70% no primeiro minuto.",
      });
      toast("Pauta, Roteiro Mestre e Estratégia gerados com sucesso!", { type: "success" });
    }, 1200);
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
              <Video className="size-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">YouTube Growth Engine (Supremacia de Conteúdo)</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Central de inteligência para estruturar pautas, ganchos de retenção implacáveis e capas de alta conversão.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
            <Sparkles className="size-3.5" /> Motor de Retenção Ativo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border bg-surface/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="size-4 text-red-400" /> Briefing do Vídeo de Impacto
              </CardTitle>
              <CardDescription>Defina o tema central ou a dor mestre do seu próximo vídeo.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGerarPauta} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tema ou Pergunta Central</label>
                  <Textarea
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    rows={4}
                    placeholder="Ex: Como escalar tráfego pago..."
                  />
                </div>
                <Button type="submit" className="w-full gap-2 font-semibold bg-red-600 hover:bg-red-700 text-white" disabled={gerando}>
                  {gerando ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Invocando Mago do YouTube...
                    </>
                  ) : (
                    <>
                      <Play className="size-4 fill-current" />
                      Gerar Pauta & Estrutura Suprema
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border bg-surface/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="size-4 text-amber-400" /> Resultado Estratégico Mestre
              </CardTitle>
              <CardDescription>Estrutura cirúrgica pronta para gravação e explosão de views</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resultado ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-xl border border-border/50 bg-background/50 space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Título Otimizado (CTR Max)</p>
                    <p className="text-base font-bold text-foreground">{resultado.titulo}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-border/50 bg-background/50 space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Hook de Retenção Crítica (Primeiros 45s)</p>
                    <p className="text-sm font-medium text-primary">{resultado.hook}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-border/50 bg-background/50 space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Capítulos / Timestamps Estratégicos</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {resultado.capitulos.map((cap: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-success shrink-0" /> {cap}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-border/50 bg-background/50 space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Estratégia de Retenção do Mago</p>
                    <p className="text-xs text-amber-300 font-medium">{resultado.estrategiaCapping}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-border/50 bg-background/50 space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Prompt para Thumbnail (Capa de Alto Clique)</p>
                    <p className="text-xs font-mono text-ai">{resultado.thumbnailPrompt}</p>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-muted-foreground text-sm">
                  Preencha o tema ao lado e clique em gerar para estruturar seu vídeo magnético.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}