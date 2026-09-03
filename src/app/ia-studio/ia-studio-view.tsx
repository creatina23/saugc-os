"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Brain,
  CheckCircle2,
  Copy,
  Cpu,
  Layers,
  Loader2,
  Sparkles,
  Terminal,
  Wand2,
  Image as ImageIcon,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { aiModels, aiHistory } from "@/lib/mock-data";
import { iaService } from "@/lib/services/ia-service";
import { toast } from "@/lib/toast";

export function IaStudioView() {
  const [modelos, setModelos] = useState<any[]>(aiModels);
  const [modeloSelecionado, setModeloSelecionado] = useState("GPT-4o");
  const [agenteSelecionado, setAgenteSelecionado] = useState("Copywriter Supremo");
  const [promptUsuario, setPromptUsuario] = useState("");
  const [resultadoIa, setResultadoIa] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [historico, setHistorico] = useState(aiHistory);

  // Aba ativa: "chat" (Mesa de Agentes) ou "imagem" (Engenheiro Visual Supremo)
  const [abaAtiva, setAbaAtiva] = useState<"chat" | "imagem">("chat");
  const [produtoImagem, setProdutoImagem] = useState("");
  const [nichoImagem, setNichoImagem] = useState("");
  const [promptGerado, setPromptGerado] = useState("");
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);
  const [gerandoImagem, setGerandoImagem] = useState(false);

  useEffect(() => {
    let ativo = true;
    iaService.statusMotores().then((lista) => {
      if (!ativo || !lista.length) return;
      setModelos(lista);
    });
    return () => {
      ativo = false;
    };
  }, []);

  async function handleGerarTexto(e: React.FormEvent) {
    e.preventDefault();
    if (!promptUsuario.trim()) return;

    setCarregando(true);
    setResultadoIa("");

    const promptSupremoMestre = `Você é o ${agenteSelecionado} — uma inteligência artificial de elite, absoluta masterclass na sua função, com especialidade em conversão agressiva, copy magnética e estratégias validadas de 9 dígitos. Responda com profundidade cirúrgica, sem rodeios e entregue o resultado em nível 10/10.

Contexto da Tarefa:
${promptUsuario}`;

    const resposta = await iaService.gerarTexto(promptSupremoMestre, {
      temperatura: 0.7,
      maxTokens: 2000,
    });

    setCarregando(false);

    if (!resposta.ok || !resposta.texto.trim()) {
      toast("Erro ao gerar resposta", { description: resposta.erro ?? "Falha no motor de IA", type: "error" });
      return;
    }

    const textoFinal = resposta.texto.trim();
    setResultadoIa(textoFinal);

    // Salva no histórico local
    const novoItem = {
      id: "h_" + Date.now(),
      agent: agenteSelecionado,
      model: modeloSelecionado,
      prompt: promptUsuario,
      output: textoFinal,
      createdAt: new Date().toLocaleString("pt-BR"),
    };
    setHistorico((prev) => [novoItem, ...prev]);
    toast("Execução concluída com sucesso!", { type: "success" });
  }

  // ENGENHEIRO DE PROMPT VISUAL SUPREMO (Criação de Criativos de Alta Conversão)
  async function handleEngenheiroVisual(e: React.FormEvent) {
    e.preventDefault();
    if (!produtoImagem.trim() || !nichoImagem.trim()) {
      toast("Preencha o produto e o nicho para o Engenheiro criar o conceito", { type: "error" });
      return;
    }

    setGerandoImagem(true);
    setPromptGerado("");
    setImagemUrl(null);

    // Prompt Supremo para o Engenheiro de Prompts Criar a Direção de Arte
    const promptEngenheiro = `Você é o ENGENHEIRO DE PROMPTS VISUAIS MAIS AVANÇADO DO MUNDO. Sua especialidade é criar conceitos de anúncios de alta conversão (Meta Ads, TikTok e E-commerce) que param o scroll instantaneamente.

Produto / Oferta: ${produtoImagem}
Nicho / Mercado: ${nichoImagem}

Sua missão é gerar um prompt hiper-detalhado em inglês para geradores de imagem de ponta (Midjourney v6 / DALL-E 3 / Flux) e a direção de arte completa em português.
Estruture a resposta EXATamente assim:
1. DIREÇÃO DE ARTE (pt-br): Explique o conceito visual, iluminação cinematográfica, paleta de cores e ângulo que farão o cliente clicar.
2. PROMPT MESTRE (en): O comando perfeito e ultra-detalhado para gerar a imagem ideal (--ar 9:16 --v 6.0).`;

    const resposta = await iaService.gerarTexto(promptEngenheiro, { temperatura: 0.8 });
    setGerandoImagem(false);

    if (!resposta.ok) {
      toast("Erro ao criar prompt visual", { type: "error" });
      return;
    }

    const textoGerado = resposta.texto.trim();
    setPromptGerado(textoGerado);

    // Simulação de renderização de imagem de alta performance baseada no nicho
    if (nichoImagem.toLowerCase().includes("supermercado") || nichoImagem.toLowerCase().includes("poup")) {
      setImagemUrl("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80");
    } else if (nichoImagem.toLowerCase().includes("moda") || nichoImagem.toLowerCase().includes("ecommerce")) {
      setImagemUrl("https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=80");
    } else {
      setImagemUrl("https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1000&q=80");
    }

    toast("Engenheiro de Prompts gerou o criativo visual com sucesso!", { type: "success" });
  }

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="IA Studio (Bancada de Agentes Supremos)"
        description="Central avançada de inteligência artificial com agentes especializados e Engenheiro Visual de Criativos."
      >
        <div className="flex items-center gap-2">
          <Button
            variant={abaAtiva === "chat" ? "default" : "outline"}
            onClick={() => setAbaAtiva("chat")}
            className="gap-2"
          >
            <Brain className="size-4" /> Mesa de Agentes
          </Button>
          <Button
            variant={abaAtiva === "imagem" ? "default" : "outline"}
            onClick={() => setAbaAtiva("imagem")}
            className="gap-2"
          >
            <ImageIcon className="size-4" /> Engenheiro Visual & Criativos
          </Button>
        </div>
      </PageHeader>

      {abaAtiva === "chat" ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Controles e Prompt */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-border bg-surface/65 backdrop-blur-xl">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Bot className="size-4 text-primary" /> Selecionar Agente Mestre
                  </label>
                  <Select value={agenteSelecionado} onValueChange={setAgenteSelecionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha o especialista..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Copywriter Supremo">✨ Copywriter Supremo (Conversão & Vendas)</SelectItem>
                      <SelectItem value="Estrategista de Negócios">🧠 Estrategista de Negócios (Funil & Escala)</SelectItem>
                      <SelectItem value="Roteirista de Vídeo UGC">🎬 Roteirista de Vídeo UGC (Retenção & Hook)</SelectItem>
                      <SelectItem value="Diretor de Tráfego de Elite">📈 Diretor de Tráfego de Elite (Mídia Paga)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Cpu className="size-4 text-ai" /> Motor de IA Ativo
                  </label>
                  <Select value={modeloSelecionado} onValueChange={setModeloSelecionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha o modelo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {modelos.map((m) => (
                        <SelectItem key={m.id || m.name} value={m.name}>
                          {m.name} ({m.provider})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <form onSubmit={handleGerarTexto} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <MessageSquareText className="size-4 text-success" /> Comando ou Briefing para o Agente
                    </label>
                    <Textarea
                      rows={6}
                      value={promptUsuario}
                      onChange={(e) => setPromptUsuario(e.target.value)}
                      placeholder="Ex: Crie uma sequência de copies agressivas para Black Friday de um supermercado..."
                      className="text-sm leading-relaxed"
                    />
                  </div>

                  <Button type="submit" className="w-full gap-2 font-semibold" disabled={carregando}>
                    {carregando ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Processando com Mago Supremo...
                      </>
                    ) : (
                      <>
                        <Wand2 className="size-4" />
                        Executar Agente de IA
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Resultado da IA */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-border bg-surface/65 backdrop-blur-xl h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
                        <Sparkles className="size-4" />
                      </span>
                      <h3 className="text-sm font-bold text-white">Saída do Agente ({agenteSelecionado})</h3>
                    </div>
                    {resultadoIa && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(resultadoIa);
                          toast("Copiado para a área de transferência!", { type: "success" });
                        }}
                        className="gap-1.5 text-xs"
                      >
                        <Copy className="size-3.5" /> Copiar Texto
                      </Button>
                    )}
                  </div>

                  <div className="min-h-[350px] rounded-xl border border-border/50 bg-background/60 p-5 text-sm leading-relaxed text-gray-200 overflow-y-auto whitespace-pre-wrap font-sans">
                    {resultadoIa || (
                      <span className="text-muted-foreground italic">
                        O resultado supremo do agente aparecerá aqui após a execução do comando...
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><ShieldCheck className="size-4 text-success" /> Cadeia de Pensamento 10/10</span>
                  <span>Motor: {modeloSelecionado}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* ABA DE ENGENHEIRO VISUAL & CRIATIVOS */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-border bg-surface/65 backdrop-blur-xl">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Wand2 className="size-5 text-amber-400" /> Engenheiro de Prompts Visuais
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Crie conceitos de anúncios que param o scroll. O engenheiro entende o seu nicho e gera a direção de arte perfeita.
                  </p>
                </div>

                <form onSubmit={handleEngenheiroVisual} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Produto ou Oferta Específica</label>
                    <Input
                      value={produtoImagem}
                      onChange={(e) => setProdutoImagem(e.target.value)}
                      placeholder="Ex: Churrasco de fim de semana com carne no capricho"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Nicho ou Empresa (Ex: Poup Marketing)</label>
                    <Input
                      value={nichoImagem}
                      onChange={(e) => setNichoImagem(e.target.value)}
                      placeholder="Ex: Supermercado varejo em Mangaratiba"
                    />
                  </div>

                  <Button type="submit" className="w-full gap-2 font-semibold bg-amber-500 hover:bg-amber-600 text-gray-950" disabled={gerandoImagem}>
                    {gerandoImagem ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Engenheiro criando conceito...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Gerar Prompt Visual & Direção de Arte
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Card className="border-border bg-surface/65 backdrop-blur-xl h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ImageIcon className="size-4 text-primary" /> Resultado do Engenheiro Visual
                  </h3>

                  {promptGerado ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border border-border/50 bg-background/60 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                        {promptGerado}
                      </div>

                      {imagemUrl && (
                        <div className="rounded-2xl overflow-hidden border border-border/60 shadow-2xl max-w-md mx-auto">
                          <img src={imagemUrl} alt="Criativo Gerado" className="w-full h-auto object-cover" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="min-h-[300px] flex items-center justify-center rounded-xl border border-border/50 bg-background/40 text-sm text-muted-foreground italic">
                      Preencha o produto e o nicho ao lado para o Engenheiro criar o criativo visual...
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><CheckCircle2 className="size-4 text-success" /> Otimizado para Meta Ads & TikTok</span>
                  <span>Midjourney / DALL-E 3 Ready</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}