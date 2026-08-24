"use client";

// IA Studio — playground de agentes ligado na MESA DE MOTORES (/api/ia).
// ------------------------------------------------------------------
// • Cada agente é uma persona de verdade (prefixo enviado junto com a tarefa).
// • Temperatura e Máx. tokens são controles REAIS (chegam ao modelo).
// • Cartões de motores: VIVOS — a tela pergunta ao servidor quais motores
//   têm chave armada (o servidor NUNCA devolve o segredo, só o status).
// • Cadeia de verdade: Gemini → GitHub Models → Groq → OpenRouter; quem
//   não tem chave é pulado em silêncio. O histórico grava quem respondeu.
// • v3.1 — "Salvar na biblioteca" reconectado: qualquer saída vira item
//   permanente na tabela library_items (categoria sugerida pelo agente).
// • v3.2 — motores vivos + rótulo real de quem respondeu em cada geração +
//   aposenta o "Custo R$ 0" fixo e o "35+ modelos" (Verdade na tela).
// • v3.3 (Sprint 019) — GERADOR DE IMAGEM dentro do Studio: o Engenheiro
//   de Prompts cria, você edita, cola a referência (≤512 auto) e gera na
//   Mesa de Imagens (/api/imagem) — com painel de diagnóstico honesto.
// ------------------------------------------------------------------

import { useEffect, useState, type ChangeEvent } from "react";
import {
  BookMarked,
  Bot,
  Brain,
  Check,
  Clapperboard,
  Copy,
  FileText,
  Gauge,
  History,
  Image as ImageIcon,
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { iaService } from "@/lib/services/ia-service";
import { imagemService } from "@/lib/services/imagem-service";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { LibraryCategory } from "@/types";


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


// ---------- Mesa de motores (selo vivo, sem segredo na tela) ----------

// undefined = ainda lendo · null = o espelho falhou (sem leitura) · lista = ok
type LeituraMesa = { id: string; armado: boolean }[] | null | undefined;

type MotorId = "gemini" | "github" | "groq" | "openrouter";

const provedores: {
  id: MotorId;
  nome: string;
  detalhe: string;
  descricao: string;
  icone: typeof FileText;
}[] = [
  {
    id: "gemini",
    nome: "Gemini Flash",
    detalhe: "Google · texto",
    descricao:
      "Primeiro da fila. O modelo exato é descoberto sozinho pelo motor — sempre o flash mais novo da sua chave.",
    icone: FileText,
  },
  {
    id: "github",
    nome: "GitHub Models",
    detalhe: "grátis com a sua conta GitHub",
    descricao:
      "Primeira reserva. Entra em campo usando a conta que você já tem, sem custo.",
    icone: Terminal,
  },
  {
    id: "groq",
    nome: "Groq",
    detalhe: "texto quase instantâneo",
    descricao:
      "Segunda reserva. Velocidade altíssima para o app continuar respondendo.",
    icone: Bot,
  },
  {
    id: "openrouter",
    nome: "OpenRouter",
    detalhe: "cota grátis diária",
    descricao:
      "Última linha de defesa. Garante resposta se os outros mudarem as regras do jogo.",
    icone: Sparkles,
  },
];

function armadoNaMesa(mesa: LeituraMesa, id: MotorId): boolean | null {
  if (!mesa) return null;
  const motor = mesa.find((m) => m.id === id);
  return motor ? motor.armado : null;
}

// Rótulo honesto de quem respondeu. A rota devolve "Gemini · modelo"
// ou o apelido da reserva: github / groq / openrouter.
function rotuloMotor(motor: string | null): string {
  if (!motor) return "Gemini (auto)";
  if (motor.startsWith("Gemini")) return motor;
  if (motor === "github") return "GitHub Models (reserva)";
  if (motor === "groq") return "Groq (reserva)";
  if (motor === "openrouter") return "OpenRouter (reserva)";
  return motor;
}


// ---------- Salvar na biblioteca (baú real) ----------

const categoriasBiblioteca = [
  { valor: "UGC Script Templates" as LibraryCategory, rotulo: "Modelos de Roteiro UGC" },
  { valor: "Ad Copy Hooks" as LibraryCategory, rotulo: "Hooks de Copy" },
  { valor: "Criador Guidelines" as LibraryCategory, rotulo: "Guias do Criador" },
  { valor: "Strategy Guides" as LibraryCategory, rotulo: "Guias de Estratégia" },
];

// Categoria sugerida conforme o agente que gerou
const mapaCategoriaAgente: Record<string, LibraryCategory> = {
  "Estrategista IA": "Strategy Guides",
  "Copywriter IA": "Ad Copy Hooks",
  "Roteirista UGC IA": "UGC Script Templates",
  "Engenheiro de Prompts IA": "UGC Script Templates",
  "Analista Criativo IA": "Strategy Guides",
};

type AlvoSalvamento = {
  alvo: string; // identificador ("saida-atual" ou id do histórico)
  agente: string;
  prompt: string;
  output: string;
  motor: string; // rótulo real de quem respondeu
};


type GeracaoReal = {
  id: string;
  agente: string;
  modelo: string; // rótulo do motor que respondeu de fato
  prompt: string;
  output: string;
  hora: string;
};


// ---------- Gerador de imagem (Sprint 019) ----------

// Formatos aceitos pela Mesa de Imagens (/api/imagem)
const imagemFormatoOptions = [
  { valor: "quadrado", rotulo: "Quadrado 1:1 (feed)" },
  { valor: "retrato", rotulo: "Retrato 4:5 (feed)" },
  { valor: "vertical", rotulo: "Vertical 9:16 (stories/reels)" },
  { valor: "paisagem", rotulo: "Paisagem 5:4 (banner)" },
] as const;

export function IaStudioView() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0].name);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1200);
  const [promptText, setPromptText] = useState("");
  const [output, setOutput] = useState("");
  const [motorSaida, setMotorSaida] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);
  const [historico, setHistorico] = useState<GeracaoReal[]>([]);
  const [mesa, setMesa] = useState<LeituraMesa>(undefined);

  // Salvar na biblioteca
  const [salvamentoAberto, setSalvamentoAberto] = useState(false);
  const [alvoSalvamento, setAlvoSalvamento] = useState<AlvoSalvamento | null>(null);
  const [tituloSalvoF, setTituloSalvoF] = useState("");
  const [categoriaSalvaF, setCategoriaSalvaF] = useState<LibraryCategory>("UGC Script Templates");
  const [autorSalvoF, setAutorSalvoF] = useState("");
  const [salvandoNaBiblioteca, setSalvandoNaBiblioteca] = useState(false);
  const [erroSalvamento, setErroSalvamento] = useState<string | null>(null);
  const [salvoRecente, setSalvoRecente] = useState<string | null>(null);

  // Gerador de imagem (Sprint 019)
  const [imagemPromptF, setImagemPromptF] = useState("");
  const [imagemFormatoF, setImagemFormatoF] = useState<string>("quadrado");
  const [imagemReferencia, setImagemReferencia] = useState<string | null>(null);
  const [gerandoImagem, setGerandoImagem] = useState(false);
  const [imagemGerada, setImagemGerada] = useState<string | null>(null);
  const [imagemMotor, setImagemMotor] = useState<string | null>(null);
  const [imagemNotas, setImagemNotas] = useState<string[] | null>(null);
  const [promptImagemUsado, setPromptImagemUsado] = useState<string | null>(null);
  const [erroImagem, setErroImagem] = useState<string | null>(null);

  // Lê o espelho da mesa uma vez por visita (só status, nunca segredo).
  useEffect(() => {
    let ativo = true;
    iaService.statusMotores().then((lista) => {
      if (ativo) setMesa(lista);
    });
    return () => {
      ativo = false;
    };
  }, []);

  const motoresArmados = mesa ? mesa.filter((m) => m.armado).length : 0;
  const leituraMesaRotulo =
    mesa === undefined
      ? "…"
      : mesa === null
        ? "—"
        : `${motoresArmados} de ${mesa.length}`;

  const stats = [
    {
      label: "Motores armados",
      value: leituraMesaRotulo,
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
      label: "Último motor",
      value: historico[0]?.modelo ?? "—",
      icon: Sparkles,
      tone: "bg-warning/15 text-warning",
    },
  ];

  async function handleGenerate() {
    if (!promptText.trim() || generating) return;

    setGenerating(true);
    setOutput("");
    setErro(null);
    setSalvoRecente(null);

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
      const motorReal = rotuloMotor(resultado.motor);
      setOutput(resultado.texto);
      setMotorSaida(motorReal);
      setHistorico((atual) => [
        {
          id: `gen-${Date.now()}`,
          agente: agente.name,
          modelo: motorReal,
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

  // ---------- Gerador de imagem (Sprint 019) ----------

  // Botão na saída do agente: manda o prompt criado pro gerador de imagem
  function handleUsarNoGeradorImagem() {
    const texto = output.trim();
    if (!texto) return;
    setImagemPromptF(texto);
    document.getElementById("gerador-imagem-prompt")?.focus();
  }

  // Referência: o NAVEGADOR já reduz pra ≤512×512 (exigência do klein)
  function handleReferenciaImagem(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    event.target.value = ""; // permite reenviar o mesmo arquivo
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/")) {
      setErroImagem("A referência precisa ser uma imagem.");
      return;
    }
    const leitor = new FileReader();
    leitor.onload = () => {
      const dado = String(leitor.result ?? "");
      const imagem = new Image();
      imagem.onload = () => {
        const escala = Math.min(1, 512 / Math.max(imagem.width, imagem.height));
        const tela = document.createElement("canvas");
        tela.width = Math.max(1, Math.round(imagem.width * escala));
        tela.height = Math.max(1, Math.round(imagem.height * escala));
        const contexto = tela.getContext("2d");
        if (!contexto) {
          setErroImagem("Não consegui preparar a referência. Tente outra imagem.");
          return;
        }
        contexto.drawImage(imagem, 0, 0, tela.width, tela.height);
        setImagemReferencia(tela.toDataURL("image/png"));
      };
      imagem.onerror = () => setErroImagem("Não consegui ler essa imagem.");
      imagem.src = dado;
    };
    leitor.readAsDataURL(arquivo);
  }

  async function handleGerarImagem() {
    const prompt = imagemPromptF.trim();
    if (!prompt || gerandoImagem) return;
    setErroImagem(null);
    setGerandoImagem(true);
    const formato = imagemFormatoF as "quadrado" | "retrato" | "vertical" | "paisagem";
    const resposta = await imagemService.gerarImagem(prompt, {
      formato,
      referencia: imagemReferencia ?? undefined,
    });
    setGerandoImagem(false);
    if (!resposta.ok) {
      setImagemGerada(null);
      setImagemMotor(null);
      setPromptImagemUsado(null);
      setImagemNotas(resposta.notas ?? null);
      setErroImagem(resposta.erro ?? "Falha ao gerar a imagem.");
      return;
    }
    setImagemGerada(resposta.imagem);
    setImagemMotor(resposta.motor);
    setPromptImagemUsado(resposta.promptUsado ?? null);
    setImagemNotas(resposta.notas ?? null);
  }

  // ---------- Salvar na biblioteca ----------

  function abrirSalvamento(payload: AlvoSalvamento) {
    setAlvoSalvamento(payload);
    setTituloSalvoF(
      payload.prompt.trim().slice(0, 60) || `Geração do ${payload.agente}`
    );
    setCategoriaSalvaF(
      mapaCategoriaAgente[payload.agente] ?? "Strategy Guides"
    );
    setAutorSalvoF(payload.agente);
    setErroSalvamento(null);
    setSalvamentoAberto(true);
  }

  async function handleSalvarNaBiblioteca() {
    if (!alvoSalvamento || salvandoNaBiblioteca) return;
    setErroSalvamento(null);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setErroSalvamento("Banco não configurado — a biblioteca real precisa dele.");
      return;
    }
    setSalvandoNaBiblioteca(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSalvandoNaBiblioteca(false);
      setErroSalvamento("Sua sessão caiu. Entre de novo e repita o salvamento.");
      return;
    }

    const { error } = await supabase.from("library_items").insert({
      user_id: user.id,
      title: tituloSalvoF.trim() || "Geração do IA Studio",
      category: categoriaSalvaF,
      author: autorSalvoF.trim() || "Equipe AnuncIA",
      description: `Gerado no IA Studio · agente ${alvoSalvamento.agente} · motor ${alvoSalvamento.motor}`,
      content: alvoSalvamento.output,
    });

    setSalvandoNaBiblioteca(false);

    if (error) {
      setErroSalvamento(
        `Não consegui gravar na biblioteca. Detalhe técnico: ${error.message}`
      );
      return;
    }

    setSalvoRecente(alvoSalvamento.alvo);
    setSalvamentoAberto(false);
    setAlvoSalvamento(null);
  }

  return (
    <>
      <Dialog open={salvamentoAberto} onOpenChange={setSalvamentoAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar na biblioteca</DialogTitle>
            <DialogDescription>
              Esta geração vira um item permanente — aparece na página
              Biblioteca e fica guardada no seu cofre.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="salvar-titulo" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Título
              </label>
              <Input
                id="salvar-titulo"
                value={tituloSalvoF}
                onChange={(event) => setTituloSalvoF(event.target.value)}
                placeholder="Ex.: Hooks Verão Glow — prova social"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="salvar-categoria" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Categoria
                </label>
                <Select
                  value={categoriaSalvaF}
                  onValueChange={(valor) => setCategoriaSalvaF(valor as LibraryCategory)}
                >
                  <SelectTrigger id="salvar-categoria" aria-label="Selecionar categoria">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasBiblioteca.map((cat) => (
                      <SelectItem key={cat.valor} value={cat.valor}>
                        {cat.rotulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="salvar-autor" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Autor
                </label>
                <Input
                  id="salvar-autor"
                  value={autorSalvoF}
                  onChange={(event) => setAutorSalvoF(event.target.value)}
                  placeholder="Equipe AnuncIA"
                />
              </div>
            </div>
            {erroSalvamento && (
              <p role="alert" className="text-sm text-red-400">
                {erroSalvamento}
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              variant="ai"
              onClick={() => void handleSalvarNaBiblioteca()}
              disabled={salvandoNaBiblioteca}
            >
              {salvandoNaBiblioteca ? (
                <>
                  <Loader2 className="animate-spin" /> Gravando…
                </>
              ) : (
                <>
                  <BookMarked /> Gravar na biblioteca
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageHeader
        title="IA Studio"
        badge="Agentes exclusivos"
        description="Agentes especializados para cada etapa do processo."
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

      <h2 className="mt-8 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        Mesa de motores
      </h2>
      <p className="mt-1 mb-3 text-xs text-muted-foreground">
        A cadeia tenta nesta ordem e pula em silêncio quem não tem chave
        armada — você só fica sem resposta se TODOS falharem.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {provedores.map((provedor) => {
          const armado = armadoNaMesa(mesa, provedor.id);
          const conectado = armado === true;
          const rotuloSelo =
            mesa === undefined
              ? "Lendo…"
              : mesa === null
                ? "Sem leitura"
                : conectado
                  ? "Conectado"
                  : "Sem chave";
          return (
            <Card
              key={provedor.id}
              className={
                conectado
                  ? "h-full border-success/40 shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_0_24px_rgba(16,185,129,0.08)]"
                  : "card-glow h-full opacity-70"
              }
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-ai/15 text-ai">
                    <provedor.icone className="size-4" />
                  </div>
                  <Badge variant={conectado ? "success" : "secondary"}>
                    {rotuloSelo}
                  </Badge>
                </div>
                <p className="mt-3 text-sm font-semibold">{provedor.nome}</p>
                <p className="text-[11px] text-muted-foreground">
                  {provedor.detalhe}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {provedor.descricao}
                </p>
              </CardContent>
            </Card>
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
                Mesa em cadeia:{" "}
              </span>
              o app tenta o Gemini primeiro; se faltar chave ou a cota do dia
              acabar, cai para o próximo motor armado (GitHub Models → Groq →
              OpenRouter) sem te pedir nada. A seta só para quando alguém
              responde.
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
                    {selectedAgent} pensando…
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
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] text-muted-foreground">
                  {motorSaida ? `Respondido por ${motorSaida}` : ""}
                </p>
                <div className="flex flex-wrap gap-2">
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
                  {/* (Sprint 019) o prompt criado vai direto pro gerador de imagem */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUsarNoGeradorImagem}
                    disabled={gerandoImagem}
                  >
                    <ImageIcon /> Usar no gerador de imagem
                  </Button>
                  <Button
                    variant="ai"
                    size="sm"
                    onClick={() =>
                      abrirSalvamento({
                        alvo: "saida-atual",
                        agente: selectedAgent,
                        prompt: promptText,
                        output,
                        motor: motorSaida ?? rotuloMotor(null),
                      })
                    }
                  >
                    {salvoRecente === "saida-atual" ? (
                      <>
                        <Check className="text-success" /> Salvo na biblioteca
                      </>
                    ) : (
                      <>
                        <BookMarked /> Salvar na biblioteca
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ---------- Gerador de imagem (Sprint 019) ---------- */}
      <h2 className="mt-8 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        Gerador de imagem
      </h2>
      <p className="mt-1 mb-3 text-xs text-muted-foreground">
        Peça ao Engenheiro de Prompts, clique em “Usar no gerador de imagem”,
        edite se quiser e gere. A referência (o produto/estilo) é opcional — a
        gente já reduz pra 512 por você.
      </p>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="size-5 text-ai" />
              Prompt da imagem
            </CardTitle>
            <CardDescription>
              Em português — a Mesa traduz e enriquece sozinha na geração
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              id="gerador-imagem-prompt"
              value={imagemPromptF}
              onChange={(event) => setImagemPromptF(event.target.value)}
              placeholder="Cole aqui o prompt do Engenheiro (ou escreva o seu). Ex.:Retrato publicitário de uma mulher segurando um morango junto aos lábios, luz natural suave, fundo neutro claro, sem nenhum texto na imagem."
              className="min-h-[120px]"
            />

            <div className="flex flex-wrap items-center gap-2">
              <label className="text-[11px] text-muted-foreground">
                Referência (o produto/estilo — opcional):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleReferenciaImagem}
                aria-label="Escolher imagem de referência"
                className="max-w-[220px] text-[11px] text-muted-foreground file:mr-2 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-transparent file:px-2 file:py-1 file:text-[11px] file:text-muted-foreground"
              />
              {imagemReferencia && (
                <span className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagemReferencia}
                    alt="Referência escolhida"
                    className="size-10 rounded-md border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImagemReferencia(null)}
                    className="cursor-pointer text-muted-foreground transition-colors hover:text-red-400"
                    aria-label="Remover referência"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Select value={imagemFormatoF} onValueChange={setImagemFormatoF}>
                <SelectTrigger aria-label="Formato da imagem" className="w-full sm:max-w-[240px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {imagemFormatoOptions.map((opcao) => (
                    <SelectItem key={opcao.valor} value={opcao.valor}>
                      {opcao.rotulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ai"
                onClick={() => void handleGerarImagem()}
                disabled={gerandoImagem || !imagemPromptF.trim()}
                className="shrink-0"
              >
                {gerandoImagem ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Gerando…
                  </>
                ) : (
                  <>
                    <ImageIcon /> Gerar imagem
                  </>
                )}
              </Button>
            </div>

            {erroImagem && (
              <p role="alert" className="text-sm text-red-400">
                {erroImagem}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="size-5 text-primary" />
              Prévia da imagem
            </CardTitle>
            <CardDescription>
              Nasce aqui — baixe e use no seu criativo
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <div className="flex flex-1 items-center justify-center rounded-xl border border-border bg-[rgba(255,255,255,0.02)] p-4">
              {gerandoImagem ? (
                <div className="flex flex-col items-center gap-3 py-10">
                  <Loader2 className="size-8 animate-spin text-ai" />
                  <p className="text-xs text-muted-foreground">
                    A Mesa de Imagens está pintando… (cadeia klein → SDXL → schnell → rede pública)
                  </p>
                </div>
              ) : imagemGerada ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={imagemGerada}
                  alt="Imagem gerada pela IA da AnuncIA"
                  className="max-h-[420px] w-auto rounded-xl border border-border"
                />
              ) : (
                <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center">
                  <ImageIcon className="size-8 text-muted-foreground/40" />
                  <p className="mt-3 text-sm font-medium">
                    Nenhuma imagem ainda
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    Escreva (ou cole) o prompt ao lado e clique em Gerar
                    imagem — a Mesa cuida do resto.
                  </p>
                </div>
              )}
            </div>

            {imagemGerada && !gerandoImagem && (
              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {imagemMotor && <Badge variant="violet">{imagemMotor}</Badge>}
                  <a
                    href={imagemGerada}
                    download="anuncia-criativo.png"
                    className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    Baixar imagem
                  </a>
                </div>
                {promptImagemUsado && (
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Prompt enviado aos motores: {promptImagemUsado}
                  </p>
                )}
                {imagemNotas && imagemNotas.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
                      Diagnóstico da geração
                    </p>
                    <ul className="mt-0.5 space-y-0.5">
                      {imagemNotas.map((nota, indice) => (
                        <li
                          key={`${indice}-${nota.slice(0, 12)}`}
                          className="text-[10.5px] leading-relaxed text-muted-foreground/80"
                        >
                          • {nota}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
            Suas gerações reais — vivem nesta sessão; salve os melhores na
            Biblioteca pra guardar de vez
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
                      aria-label="Salvar resposta na biblioteca"
                      title="Salvar na biblioteca"
                      onClick={() =>
                        abrirSalvamento({
                          alvo: item.id,
                          agente: item.agente,
                          prompt: item.prompt,
                          output: item.output,
                          motor: item.modelo,
                        })
                      }
                      className="size-8 text-muted-foreground"
                    >
                      {salvoRecente === item.id ? (
                        <Check className="size-3.5 text-success" />
                      ) : (
                        <BookMarked className="size-3.5" />
                      )}
                    </Button>
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
