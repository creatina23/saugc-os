"use client";

import { useState } from "react";
import { Video, Sparkles, Youtube, CheckCircle2, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";

export function YoutubeView() {
  const [tema, setTema] = useState("Como escalar tráfego pago usando agentes de IA no Orquestrador da AnuncIA");
  const [gerando, setAnalisando] = useState(false);
  const [resultado, setResultado] = useState<any | null>(null);

  async function handleGerarPauta(e: React.FormEvent) {
    e.preventDefault();
    if (!tema) {
      toast("Digite o tema do vídeo", { type: "error" });
      return;
    }

    setAnalisando(true);
    setTimeout(() => {
      setAnalisando(false);
      setResultado({
        titulo: `[Growth & IA] ${tema} (O Guia Definitivo 2026)`,
        hook: "00:00 - 00:45: Revelando o erro de R$ 50.000 que a maioria dos gestores comete ao tentar escalar tráfego manualmente.",
        capitulos: [
          "00:45 - O Caos Operacional das Agências Tradicionais",
          "03:20 - Como o Orquestrador de 6 Agentes Automatiza a Estratégia",
          "08:15 - Estudo de Caso Prático: Do Zero ao Criativo Validado",
          "14:40 - O Futuro do Marketing Digital com IA Aplicada",
        ],
        thumbnailPrompt: "Cinematic close-up of a digital marketer looking at glowing analytics dashboard, neon lighting, highly detailed, YouTube thumbnail style --ar 16:9 --v 6.0",
      });
      toast("Pauta e Roteiro para YouTube gerados com sucesso!", { type: "success" });
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
            <h1 className="text-2xl font-bold tracking-tight">YouTube Growth Engine</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Central de inteligência para estruturar pautas, títulos magnéticos, roteiros e thumbnails para o seu canal de marketing e IA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
            <Sparkles className="size-3.5" /> Funil de Conteúdo Ativo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border bg-surface/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base">Briefing do Vídeo</CardTitle>
              <CardDescription>Defina o tema central do seu próximo vídeo para o YouTube.</CardDescription>
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
                <Button type="submit" className="w-full gap-2 font-semibold" disabled={gerando}>
                  {gerando ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Gerando Roteiro e Pauta...
                    </>
                  ) : (
                    <>
                      <Play className="size-4 fill-current" />
                      Gerar Pauta & Estrutura YouTube
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
              <CardTitle className="text-base">Resultado Estratégico</CardTitle>
              <CardDescription>Estrutura pronta para gravação e publicação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resultado ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-xl border border-border/50 bg-background/50 space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Título Otimizado (CTR Max)</p>
                    <p className="text-base font-bold text-foreground">{resultado.titulo}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-border/50 bg-background/50 space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Hook de Retenção (Primeiros 45s)</p>
                    <p className="text-sm font-medium text-primary">{resultado.hook}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-border/50 bg-background/50 space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Capítulos / Timestamps</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {resultado.capitulos.map((cap: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-success shrink-0" /> {cap}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-border/50 bg-background/50 space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Prompt para Thumbnail (Capa)</p>
                    <p className="text-xs font-mono text-ai">{resultado.thumbnailPrompt}</p>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-muted-foreground text-sm">
                  Preencha o tema ao lado e clique em gerar para estruturar seu vídeo.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}