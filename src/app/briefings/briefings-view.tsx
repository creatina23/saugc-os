"use client";

// ------------------------------------------------------------------
// Briefings — pedidos de conteúdo UGC REAIS (tabela briefings).
// • CRUD completo: criar, editar (Abrir briefing), excluir, filtrar.
// • Prazo é data de verdade (type=date) exibida "12 ago 2026".
// • Sprint 015b: botão "✨ Gerar roteiro" — a IA lê este briefing
//   (título, cliente, creator, tags, prazo e detalhes) e escreve o
//   roteiro; editável na hora; 1 clique vira criativo no quadro
//   Comerciais (tabela commercials, status Rascunho, formato Reels).
// • Sprint 017: nasce a Ponte do Vídeo — 1 clique transforma o
//   roteiro em comandos prontos pro Flow (Google), cena a cena, 8s
//   cada, já no estilo caseiro de celular. Caminho A: Flow → CapCut
//   → Mídias.
// • Erros confessam "Detalhe técnico:" — nunca falha em silêncio.
// • Sem banco configurado → modo demonstração (mock, selo visível);
//   a IA gera mesmo assim — só o "salvar no quadro" pede o banco.
// ------------------------------------------------------------------

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clapperboard,
  Clock,
  Copy,
  FileText,
  Film,
  Loader2,
  PenLine,
  Plus,
  RefreshCw,
  Search,
  SearchX,
  Sparkles,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { briefings, clients } from "@/lib/mock-data";
import { iaService } from "@/lib/services/ia-service";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { BriefingStatus } from "@/types";

// ---------- Regras fixas ----------

const statusFilters = ["Todos", "Em Aprovação", "Aprovado", "Rascunho"] as const;

const statusBadge: Record<BriefingStatus, "warning" | "success" | "secondary"> = {
  "Em Aprovação": "warning",
  Aprovado: "success",
  Rascunho: "secondary",
};

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

// ---------- Tipos e ponte com o banco ----------

type BriefingReal = {
  id: string;
  codigo: string;
  titulo: string;
  cliente: string;
  creator: string;
  status: BriefingStatus;
  prazoIso: string; // "" = sem prazo
  prazoRotulo: string;
  etiquetas: string[];
  notas: string;
};

type LinhaBriefing = {
  id: string;
  title: string | null;
  client_name: string | null;
  creator: string | null;
  status: string | null;
  deadline: string | null;
  tags: string[] | null;
  notes: string | null;
  created_at: string;
};

type MockBriefing = (typeof briefings)[number];

const COLUNAS =
  "id, title, client_name, creator, status, deadline, tags, notes, created_at";

function normalizaStatus(valor: string | null): BriefingStatus {
  return valor === "Em Aprovação" || valor === "Aprovado" ? valor : "Rascunho";
}

const MESES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

// "2026-08-12" → "12 ago 2026" (sem fuso: monta a data local)
function dataCurta(iso: string): string {
  const data = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(data.getTime())) return "";
  return `${data.getDate()} ${MESES[data.getMonth()]} ${data.getFullYear()}`;
}

function briefingDaLinha(linha: LinhaBriefing): BriefingReal {
  const prazoIso = linha.deadline ?? "";
  return {
    id: linha.id,
    codigo: `BRF-${linha.id.replace(/-/g, "").slice(0, 4).toUpperCase()}`,
    titulo: linha.title ?? "Sem título",
    cliente: linha.client_name ?? "",
    creator: linha.creator ?? "",
    status: normalizaStatus(linha.status),
    prazoIso,
    prazoRotulo: prazoIso ? dataCurta(prazoIso) : "Sem prazo",
    etiquetas: linha.tags ?? [],
    notas: linha.notes ?? "",
  };
}

// Mock (modo demonstração) — prazo já vem como texto "12 ago 2026"
function demoParaBriefing(item: MockBriefing): BriefingReal {
  return {
    id: item.id,
    codigo: `BRF-${item.id.replace(/-/g, "").slice(0, 4).toUpperCase()}`,
    titulo: item.title,
    cliente: item.client,
    creator: item.creator,
    status: normalizaStatus(item.status),
    prazoIso: "",
    prazoRotulo: item.deadline ?? "Sem prazo",
    etiquetas: item.tags ?? [],
    notas: "",
  };
}

async function coletarTudo(): Promise<{
  lista: BriefingReal[];
  clientes: string[];
} | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;

  const [resBriefings, resClientes] = await Promise.all([
    supabase.from("briefings").select(COLUNAS).order("created_at", { ascending: false }),
    supabase.from("clients").select("company").order("created_at", { ascending: false }),
  ]);

  if (resBriefings.error) return null; // cai no modo demo; selo fica visível

  return {
    lista: ((resBriefings.data ?? []) as LinhaBriefing[]).map(briefingDaLinha),
    clientes: ((resClientes.data ?? []) as { company: string | null }[])
      .map((linha) => linha.company ?? "")
      .filter(Boolean),
  };
}

// ---------- Componente ----------

export function BriefingsView() {
  const [lista, setLista] = useState<BriefingReal[]>([]);
  const [clientes, setClientes] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modoDemo, setModoDemo] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("Todos");

  // Dialog: cria OU edita (editingId = qual briefing abriu)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tituloF, setTituloF] = useState("");
  const [clienteSel, setClienteSel] = useState("Sem cliente");
  const [creatorF, setCriadorF] = useState("");
  const [statusSel, setStatusSel] = useState<BriefingStatus>("Rascunho");
  const [prazoF, setPrazoF] = useState("");
  const [etiquetasF, setEtiquetasF] = useState("");
  const [notasF, setNotasF] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroDialog, setErroDialog] = useState<string | null>(null);

  // IA — briefing vira roteiro (Sprint 015b)
  const [roteiro, setRoteiro] = useState("");
  const [gerando, setGerando] = useState(false);
  const [salvandoCriativo, setSalvandoCriativo] = useState(false);
  const [sucessoIa, setSucessoIa] = useState(false);
  const [erroIa, setErroIa] = useState<string | null>(null);

  // IA — roteiro vira comandos de vídeo pro Flow (Sprint 017)
  const [comandosVideo, setComandosVideo] = useState("");
  const [gerandoComandos, setGerandoComandos] = useState(false);
  const [copiaComandosOk, setCopiaComandosOk] = useState(false);

  // Carga inicial — setState SÓ em .then() (lei do ESLint)
  useEffect(() => {
    let ativo = true;
    coletarTudo().then((resultado) => {
      if (!ativo) return;
      if (resultado === null) {
        setModoDemo(true);
        setLista(briefings.map(demoParaBriefing));
        setClientes(clients.map((c) => c.company));
      } else {
        setLista(resultado.lista);
        setClientes(resultado.clientes);
      }
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      lista.filter((briefing) => {
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          briefing.titulo.toLowerCase().includes(query) ||
          briefing.cliente.toLowerCase().includes(query) ||
          briefing.creator.toLowerCase().includes(query);
        const matchesStatus = status === "Todos" || briefing.status === status;
        return matchesSearch && matchesStatus;
      }),
    [lista, search, status]
  );

  const temFiltroAtivo = search.trim() !== "" || status !== "Todos";

  const stats = [
    { label: "Total de briefings", value: lista.length.toString(), icon: FileText, tone: "bg-primary/15 text-primary" },
    {
      label: "Em aprovação",
      value: lista.filter((item) => item.status === "Em Aprovação").length.toString(),
      icon: Clock,
      tone: "bg-warning/15 text-warning",
    },
    {
      label: "Aprovados",
      value: lista.filter((item) => item.status === "Aprovado").length.toString(),
      icon: CheckCircle2,
      tone: "bg-success/15 text-success",
    },
    {
      label: "Rascunhos",
      value: lista.filter((item) => item.status === "Rascunho").length.toString(),
      icon: PenLine,
      tone: "bg-secondary text-muted-foreground",
    },
  ];

  function limparIa() {
    setRoteiro("");
    setGerando(false);
    setSalvandoCriativo(false);
    setSucessoIa(false);
    setErroIa(null);
    setComandosVideo("");
    setGerandoComandos(false);
    setCopiaComandosOk(false);
  }

  function limparFormulario() {
    setEditingId(null);
    setTituloF("");
    setClienteSel("Sem cliente");
    setCriadorF("");
    setStatusSel("Rascunho");
    setPrazoF("");
    setEtiquetasF("");
    setNotasF("");
    setErroDialog(null);
    limparIa();
  }

  function abrirNovo() {
    limparFormulario();
    setDialogOpen(true);
  }

  function abrirEdicao(b: BriefingReal) {
    setEditingId(b.id);
    setTituloF(b.titulo);
    setClienteSel(b.cliente || "Sem cliente");
    setCriadorF(b.creator);
    setStatusSel(b.status);
    setPrazoF(b.prazoIso);
    setEtiquetasF(b.etiquetas.join(", "));
    setNotasF(b.notas);
    setErroDialog(null);
    limparIa();
    setDialogOpen(true);
  }

  function montarRegistro(userId: string) {
    return {
      user_id: userId,
      title: tituloF.trim() || "Briefing sem título",
      client_name: clienteSel === "Sem cliente" ? null : clienteSel,
      creator: creatorF.trim() || null,
      status: statusSel,
      deadline: prazoF || null,
      tags: etiquetasF
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes: notasF.trim() || null,
    };
  }

  async function handleSalvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroDialog(null);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setErroDialog(
        "Modo demonstração: para guardar briefings de verdade, o banco precisa estar configurado."
      );
      return;
    }
    setSalvando(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSalvando(false);
      setErroDialog("Sua sessão caiu. Entre de novo e repita o salvamento.");
      return;
    }

    const registro = montarRegistro(user.id);

    if (editingId) {
      const { data: linha, error } = await supabase
        .from("briefings")
        .update(registro)
        .eq("id", editingId)
        .select(COLUNAS)
        .single();
      setSalvando(false);
      if (error || !linha) {
        setErroDialog(
          `Não consegui salvar as alterações. Detalhe técnico: ${error?.message ?? "o banco não devolveu a linha"}`
        );
        return;
      }
      const atualizado = briefingDaLinha(linha as LinhaBriefing);
      setLista((atual) =>
        atual.map((b) => (b.id === atualizado.id ? atualizado : b))
      );
    } else {
      const { data: linha, error } = await supabase
        .from("briefings")
        .insert(registro)
        .select(COLUNAS)
        .single();
      setSalvando(false);
      if (error || !linha) {
        setErroDialog(
          `Não consegui registrar o briefing. Detalhe técnico: ${error?.message ?? "o banco não devolveu a linha"}`
        );
        return;
      }
      setLista((atual) => [briefingDaLinha(linha as LinhaBriefing), ...atual]);
    }

    setDialogOpen(false);
    limparFormulario();
  }

  async function handleExcluir(b: BriefingReal) {
    if (!window.confirm(`Excluir o briefing "${b.titulo}"? Essa ação não tem volta.`)) {
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setErroDialog("Modo demonstração: exclusão precisa do banco configurado.");
      return;
    }
    setExcluindo(true);
    const { error } = await supabase.from("briefings").delete().eq("id", b.id);
    setExcluindo(false);
    if (error) {
      setErroDialog(`Não consegui excluir. Detalhe técnico: ${error.message}`);
      return;
    }
    setLista((atual) => atual.filter((item) => item.id !== b.id));
    setDialogOpen(false);
    limparFormulario();
  }

  // ---------- IA: briefing vira roteiro (Sprint 015b) ----------

  function montarPromptRoteiro(): string {
    const prazoLegivel = prazoF ? dataCurta(prazoF) : "";
    const contexto = [
      `- Título do briefing: ${tituloF.trim() || "(não informado)"}`,
      clienteSel !== "Sem cliente" ? `- Cliente/marca: ${clienteSel}` : "",
      creatorF.trim() ? `- Criador que vai gravar: ${creatorF.trim()}` : "",
      etiquetasF.trim() ? `- Requisitos (tags): ${etiquetasF.trim()}` : "",
      prazoLegivel ? `- Prazo de entrega: ${prazoLegivel}` : "",
      notasF.trim() ? `- Detalhes do pedido: ${notasF.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return `Você é um roteirista sênior de anúncios UGC — vídeos curtos que parecem orgânicos, gravados por pessoas reais com o celular — especialista em Meta Ads. Você escreve sempre em português do Brasil, natural, como gente de verdade fala. Nada de texto corporativo.

Com base no briefing abaixo, escreva o roteiro completo do criativo, pronto para o creator gravar.

BRIEFING:
${contexto}

Entregue o roteiro EXATAMENTE nesta estrutura, sem introdução nem conclusão:

🎯 CONCEITO: a ideia central do vídeo em 1 frase
🎣 GANCHO (0–3s): a fala ou ação exata que para o scroll
🎬 CENA A CENA: 3 a 6 cenas numeradas — cada uma com "O que aparece:" e "O que é dito:"
💬 LEGENDA SUGERIDA: texto do post com 1 pergunta que puxe comentário
📣 CTA: a chamada final para ação`;
  }

  async function handleGerarRoteiro() {
    setErroIa(null);
    setSucessoIa(false);
    if (!tituloF.trim() && !notasF.trim()) {
      setErroIa(
        "Escreva pelo menos o título ou os detalhes do pedido — a IA precisa de contexto pra criar."
      );
      return;
    }
    setGerando(true);
    const resposta = await iaService.gerarTexto(montarPromptRoteiro(), {
      temperatura: 0.8,
      maxTokens: 1500,
    });
    setGerando(false);
    if (!resposta.ok || !resposta.texto.trim()) {
      setErroIa(
        `A IA não conseguiu escrever agora. Detalhe técnico: ${resposta.erro ?? "resposta vazia do modelo"}`
      );
      return;
    }
    // Roteiro novo = comandos velhos não valem mais; a Ponte zera junto
    setComandosVideo("");
    setCopiaComandosOk(false);
    setRoteiro(resposta.texto.trim());
  }

  // ---------- IA: roteiro vira comandos de vídeo (Ponte do Vídeo, 017) ----------

  function montarPromptComandosVideo(): string {
    return `Você é um engenheiro de comandos sênior para geradores de vídeo com IA, especialista no Flow/Veo do Google. Você transforma roteiros de anúncios UGC em comandos de vídeo prontos pra colar, um por cena.

ROTEIRO DO ANÚNCIO:
${roteiro.trim()}

Regras dos comandos:
- 1 comando por cena do roteiro (na mesma ordem), cada um pensado pra um clipe de 8 segundos.
- Escreva em português do Brasil, descrevendo: quem aparece e faz o quê, onde está (cenário simples e real), iluminação natural, câmera na mão estilo caseiro gravado com celular, clima/emoção da cena.
- Estilo UGC de verdade: pessoa comum, ambiente real (quarto, cozinha, rua), nada de estúdio ou perfeito demais.
- Se a cena tem fala, termine o comando com a fala exata entre aspas duplas e a indicação de idioma: falando em português brasileiro: "...".
- Mantenha o MESMO personagem em todos os comandos (aparência e roupa descritas iguais em cada cena).

Formato EXATO de saída, sem introdução nem conclusão:

CENA 1 (8s): <comando completo>
CENA 2 (8s): <comando completo>
(quantas cenas o roteiro tiver)

💡 DICA FINAL: <1 orientação rápida pra manter o mesmo personagem em todos os clipes gerados no Flow>`;
  }

  async function handleGerarComandosVideo() {
    setErroIa(null);
    if (!roteiro.trim()) return;
    setGerandoComandos(true);
    const resposta = await iaService.gerarTexto(montarPromptComandosVideo(), {
      temperatura: 0.6,
      maxTokens: 1800,
    });
    setGerandoComandos(false);
    if (!resposta.ok || !resposta.texto.trim()) {
      setErroIa(
        `A IA não conseguiu montar os comandos agora. Detalhe técnico: ${resposta.erro ?? "resposta vazia do modelo"}`
      );
      return;
    }
    setComandosVideo(resposta.texto.trim());
  }

  async function handleCopiarComandos() {
    try {
      await navigator.clipboard.writeText(comandosVideo);
      setCopiaComandosOk(true);
      setTimeout(() => setCopiaComandosOk(false), 1800);
    } catch {
      setCopiaComandosOk(false);
    }
  }

  async function handleSalvarCriativo() {
    setErroIa(null);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setErroIa(
        "Modo demonstração: o roteiro sai de boa, mas pra salvar o criativo no quadro o banco precisa estar configurado."
      );
      return;
    }
    if (!roteiro.trim()) return;
    setSalvandoCriativo(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSalvandoCriativo(false);
      setErroIa("Sua sessão caiu. Entre de novo e repita o envio.");
      return;
    }

    const { error } = await supabase.from("commercials").insert({
      user_id: user.id,
      title: tituloF.trim() || "Roteiro gerado por IA",
      client_name: clienteSel === "Sem cliente" ? null : clienteSel,
      creator: creatorF.trim() || null,
      format: "Reels",
      script: roteiro.trim(),
      deadline: prazoF || null,
      status: "Rascunho",
      thumbnail_tone: "violet",
    });
    setSalvandoCriativo(false);
    if (error) {
      setErroIa(
        `O roteiro tá pronto, mas não consegui gravar o criativo no quadro. Detalhe técnico: ${error.message}`
      );
      return;
    }
    setSucessoIa(true);
  }

  // ---------- Carregamento ----------
  if (carregando) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Carregando briefings">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-white/10" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {["s1", "s2", "s3", "s4"].map((chave) => (
            <div key={chave} className="h-20 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {["c1", "c2", "c3"].map((chave) => (
            <div key={chave} className="h-64 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Briefings"
        badge={modoDemo ? "Modo demonstração" : undefined}
        description="Pedidos que dão origem aos anúncios e às campanhas."
      >
        <Dialog
          open={dialogOpen}
          onOpenChange={(aberto) => {
            setDialogOpen(aberto);
            if (!aberto) limparFormulario();
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={abrirNovo}>
              <Plus /> Novo Briefing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Detalhes do briefing" : "Criar briefing"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Ajuste informações, status e acompanhe o pedido."
                  : "Estruture um novo pedido de conteúdo para o creator."}
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSalvar}>
              <div>
                <label htmlFor="briefing-title" className={fieldLabel}>
                  Título do briefing
                </label>
                <Input
                  id="briefing-title"
                  value={tituloF}
                  onChange={(event) => setTituloF(event.target.value)}
                  placeholder="Ex.: UGC Unboxing — Linha Skincare"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="briefing-client" className={fieldLabel}>
                    Cliente
                  </label>
                  <Select value={clienteSel} onValueChange={setClienteSel}>
                    <SelectTrigger id="briefing-client" aria-label="Selecionar cliente">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sem cliente">Sem cliente</SelectItem>
                      {clientes.map((empresa) => (
                        <SelectItem key={empresa} value={empresa}>
                          {empresa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="briefing-creator" className={fieldLabel}>
                    Criador responsável
                  </label>
                  <Input
                    id="briefing-creator"
                    value={creatorF}
                    onChange={(event) => setCriadorF(event.target.value)}
                    placeholder="@ana.cria"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="briefing-deadline" className={fieldLabel}>
                    Prazo de entrega
                  </label>
                  <Input
                    id="briefing-deadline"
                    type="date"
                    value={prazoF}
                    onChange={(event) => setPrazoF(event.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="briefing-status" className={fieldLabel}>
                    Status
                  </label>
                  <Select
                    value={statusSel}
                    onValueChange={(valor) => setStatusSel(valor as BriefingStatus)}
                  >
                    <SelectTrigger id="briefing-status" aria-label="Selecionar status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rascunho">Rascunho</SelectItem>
                      <SelectItem value="Em Aprovação">Em Aprovação</SelectItem>
                      <SelectItem value="Aprovado">Aprovado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label htmlFor="briefing-tags" className={fieldLabel}>
                  Tags de requisitos <span className="text-muted-foreground/60">(separadas por vírgula)</span>
                </label>
                <Input
                  id="briefing-tags"
                  value={etiquetasF}
                  onChange={(event) => setEtiquetasF(event.target.value)}
                  placeholder="Unboxing, 15s, Hook forte"
                />
              </div>
              <div>
                <label htmlFor="briefing-notes" className={fieldLabel}>
                  Detalhes do pedido
                </label>
                <Textarea
                  id="briefing-notes"
                  value={notasF}
                  onChange={(event) => setNotasF(event.target.value)}
                  placeholder="O que o creator precisa saber: produto, ângulo, obrigatórios, o que evitar..."
                  rows={4}
                />
              </div>

              {/* ---------- IA: briefing vira roteiro (Sprint 015b) ---------- */}
              <div className="space-y-3 rounded-xl border border-ai/30 bg-ai/10 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-ai">
                      <Sparkles className="size-4" /> Roteirista IA
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Lê este briefing e escreve o roteiro pronto pro creator
                      gravar.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ai"
                    size="sm"
                    disabled={gerando || salvandoCriativo}
                    onClick={() => void handleGerarRoteiro()}
                  >
                    {gerando ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Escrevendo
                        roteiro…
                      </>
                    ) : roteiro ? (
                      <>
                        <RefreshCw /> Gerar outra versão
                      </>
                    ) : (
                      <>
                        <Sparkles /> Gerar roteiro
                      </>
                    )}
                  </Button>
                </div>

                {roteiro && (
                  <>
                    <Textarea
                      id="roteiro-ia"
                      value={roteiro}
                      onChange={(event) => {
                        setRoteiro(event.target.value);
                        setSucessoIa(false);
                      }}
                      rows={12}
                      aria-label="Roteiro gerado pela IA — editável"
                      className="bg-background/60 text-sm leading-relaxed"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Pode editar à vontade — o que estiver aqui é exatamente o
                      que vai pro quadro.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={
                          salvandoCriativo || gerando || !roteiro.trim() || sucessoIa
                        }
                        onClick={() => void handleSalvarCriativo()}
                      >
                        {salvandoCriativo ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Enviando
                            pro quadro…
                          </>
                        ) : (
                          <>
                            <Clapperboard /> Salvar como criativo no quadro
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={salvandoCriativo || gerando}
                        onClick={limparIa}
                      >
                        Descartar roteiro
                      </Button>
                    </div>

                    {/* ---------- Ponte do Vídeo: roteiro vira comandos pro Flow (017) ---------- */}
                    <div className="space-y-3 rounded-xl border border-border bg-background/40 p-3.5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="flex items-center gap-1.5 text-sm font-medium">
                            <Film className="size-4 text-ai" /> Ponte do Vídeo
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Transforma o roteiro acima em comandos prontos pra
                            colar no Flow — 1 comando por cena, já no estilo
                            caseiro de celular.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={gerandoComandos || gerando || !roteiro.trim()}
                          onClick={() => void handleGerarComandosVideo()}
                        >
                          {gerandoComandos ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />{" "}
                              Montando comandos…
                            </>
                          ) : comandosVideo ? (
                            <>
                              <RefreshCw /> Gerar novos comandos
                            </>
                          ) : (
                            <>
                              <Film /> Comandos de vídeo pro Flow
                            </>
                          )}
                        </Button>
                      </div>

                      {comandosVideo && (
                        <>
                          <Textarea
                            id="comandos-video-ia"
                            value={comandosVideo}
                            onChange={(event) =>
                              setComandosVideo(event.target.value)
                            }
                            rows={10}
                            aria-label="Comandos de vídeo gerados pela IA — editáveis"
                            className="bg-background/60 text-sm leading-relaxed"
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => void handleCopiarComandos()}
                            >
                              {copiaComandosOk ? (
                                <>
                                  <CheckCircle2 className="text-success" />{" "}
                                  Copiado!
                                </>
                              ) : (
                                <>
                                  <Copy /> Copiar tudo
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={gerandoComandos}
                              onClick={() => {
                                setComandosVideo("");
                                setCopiaComandosOk(false);
                              }}
                            >
                              Descartar comandos
                            </Button>
                          </div>
                          <p className="text-[11px] leading-relaxed text-muted-foreground">
                            Caminho A: cole cada comando no Flow (2 a 4 vídeos
                            grátis por dia), baixe os trechos, monte no CapCut
                            e suba o vídeo final na página Mídias.
                          </p>
                        </>
                      )}
                    </div>
                  </>
                )}

                {sucessoIa && (
                  <p className="flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
                    <CheckCircle2 className="size-4 shrink-0" />
                    Roteiro enviado! Abra a página Comerciais — o cartão novo tá
                    na coluna Rascunho, formato Reels.
                  </p>
                )}

                {erroIa && (
                  <p role="alert" className="text-sm text-red-400">
                    {erroIa}
                  </p>
                )}
              </div>

              {erroDialog && (
                <p role="alert" className="text-sm text-red-400">
                  {erroDialog}
                </p>
              )}

              <DialogFooter>
                {editingId && (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={excluindo || salvando}
                    onClick={() => {
                      const alvo = lista.find((b) => b.id === editingId);
                      if (alvo) void handleExcluir(alvo);
                    }}
                    className="mr-auto text-muted-foreground hover:text-red-400"
                  >
                    {excluindo ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Excluindo…
                      </>
                    ) : (
                      <>
                        <Trash2 /> Excluir
                      </>
                    )}
                  </Button>
                )}
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={salvando || excluindo}>
                  {salvando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Salvando…
                    </>
                  ) : editingId ? (
                    "Salvar alterações"
                  ) : (
                    "Salvar briefing"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                <p className="truncate text-xs text-muted-foreground">{stat.label}</p>
                <p className="truncate text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por título, cliente ou creator..."
                aria-label="Buscar briefings"
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {statusFilters.map((option) => {
                const count =
                  option === "Todos"
                    ? lista.length
                    : lista.filter((briefing) => briefing.status === option).length;
                const active = status === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStatus(option)}
                    aria-pressed={active}
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                      active
                        ? "border-primary/40 bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:border-[rgba(255,255,255,0.16)] hover:text-foreground"
                    )}
                  >
                    {option}
                    <span className={cn("rounded-full px-1.5 text-[10px]", active ? "bg-primary/20" : "bg-muted")}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((briefing) => (
            <Card key={briefing.id} className="card-glow flex flex-col">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {briefing.codigo}
                  </Badge>
                  <Badge variant={statusBadge[briefing.status]}>{briefing.status}</Badge>
                </div>
                <h3 className="mt-3 text-base font-semibold tracking-tight">{briefing.titulo}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2 className="size-3.5" />
                  {briefing.cliente || "Sem cliente"}
                </p>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-[10px]">
                        {(briefing.creator || "AD")
                          .replace("@", "")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">
                      {briefing.creator || "A definir"}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClock className="size-3.5" />
                    {briefing.prazoRotulo}
                  </span>
                </div>

                {briefing.etiquetas.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {briefing.etiquetas.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex justify-end border-t border-border pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => abrirEdicao(briefing)}
                  >
                    Abrir briefing
                    <ChevronRight />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <SearchX className="size-8 text-muted-foreground" />
            {temFiltroAtivo ? (
              <>
                <p className="mt-3 font-medium">Nenhum briefing encontrado</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajuste a busca ou os filtros para ver resultados.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearch("");
                    setStatus("Todos");
                  }}
                >
                  Limpar filtros
                </Button>
              </>
            ) : (
              <>
                <p className="mt-3 font-medium">Nenhum briefing por aqui ainda</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Crie o primeiro briefing — ele é o pedido que organiza a
                  produção de conteúdo do creator.
                </p>
                <Button size="sm" className="mt-4" onClick={abrirNovo}>
                  <Plus /> Criar primeiro briefing
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}