"use client";

// ------------------------------------------------------------------
// Comerciais — quadro de produção REAL (tabela commercials).
// • Kanban com setas: ‹ › movem o criativo entre etapas (grava no banco,
//   otimista na tela, confessa e desfaz se falhar).
// • CRUD completo: criar, clicar no cartão pra editar, excluir.
// • Erros confessam "Detalhe técnico:" — nunca falha em silêncio.
// • Sem banco configurado → modo demonstração (mock, selo visível).
// ------------------------------------------------------------------

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  BadgeCheck,
  Building2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Eye,
  Film,
  Loader2,
  Play,
  Plus,
  Search,
  SearchX,
  Trash2,
  X,
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
import { clients, commercials } from "@/lib/mock-data";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { CommercialStatus, ThumbnailTone } from "@/types";


// ---------- Regras fixas ----------

const STATUS_ORDEM: CommercialStatus[] = ["Rascunho", "Produção", "Revisão", "Aprovado"];

const columns: { status: CommercialStatus; dot: string }[] = [
  { status: "Rascunho", dot: "bg-muted-foreground" },
  { status: "Produção", dot: "bg-info" },
  { status: "Revisão", dot: "bg-warning" },
  { status: "Aprovado", dot: "bg-success" },
];

const formatoOptions = ["Reels", "TikTok", "Shorts", "Feed"] as const;

const toneGradient: Record<ThumbnailTone, string> = {
  blue: "from-blue-500/60 to-blue-900/30",
  violet: "from-violet-500/60 to-violet-900/30",
  emerald: "from-emerald-500/60 to-emerald-900/30",
  amber: "from-amber-500/60 to-amber-900/30",
  pink: "from-pink-500/60 to-pink-900/30",
};

// Tons atribuídos em rodízio na criação (variedade automática no quadro)
const TONS: ThumbnailTone[] = ["violet", "blue", "emerald", "amber", "pink"];

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";


// ---------- Tipos e ponte com o banco ----------

type ComercialReal = {
  id: string;
  titulo: string;
  cliente: string;
  creator: string;
  formato: string;
  roteiro: string;
  prazoIso: string; // "" = sem prazo
  prazoRotulo: string;
  status: CommercialStatus;
  tom: ThumbnailTone;
};

type LinhaComercial = {
  id: string;
  title: string | null;
  client_name: string | null;
  creator: string | null;
  format: string | null;
  script: string | null;
  deadline: string | null;
  status: string | null;
  thumbnail_tone: string | null;
  created_at: string;
};

type MockComercial = (typeof commercials)[number];

const COLUNAS =
  "id, title, client_name, creator, format, script, deadline, status, thumbnail_tone, created_at";

function normalizaStatus(valor: string | null): CommercialStatus {
  return STATUS_ORDEM.includes(valor as CommercialStatus)
    ? (valor as CommercialStatus)
    : "Rascunho";
}

function normalizaTom(valor: string | null): ThumbnailTone {
  return TONS.includes(valor as ThumbnailTone) ? (valor as ThumbnailTone) : "violet";
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

function comercialDaLinha(linha: LinhaComercial): ComercialReal {
  const prazoIso = linha.deadline ?? "";
  return {
    id: linha.id,
    titulo: linha.title ?? "Sem título",
    cliente: linha.client_name ?? "",
    creator: linha.creator ?? "",
    formato: linha.format ?? "Reels",
    roteiro: linha.script ?? "",
    prazoIso,
    prazoRotulo: prazoIso ? dataCurta(prazoIso) : "Sem prazo",
    status: normalizaStatus(linha.status),
    tom: normalizaTom(linha.thumbnail_tone),
  };
}

// Mock (modo demonstração)
function demoParaComercial(item: MockComercial): ComercialReal {
  return {
    id: item.id,
    titulo: item.title,
    cliente: item.client,
    creator: item.creator,
    formato: item.format,
    roteiro: item.script ?? "",
    prazoIso: "",
    prazoRotulo: item.dueDate ?? "Sem prazo",
    status: normalizaStatus(item.status),
    tom: normalizaTom(item.thumbnailTone),
  };
}

async function coletarTudo(): Promise<{
  lista: ComercialReal[];
  clientes: string[];
} | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;

  const [resComerciais, resClientes] = await Promise.all([
    supabase.from("commercials").select(COLUNAS).order("created_at", { ascending: false }),
    supabase.from("clients").select("company").order("created_at", { ascending: false }),
  ]);

  if (resComerciais.error) return null; // cai no modo demo; selo fica visível

  return {
    lista: ((resComerciais.data ?? []) as LinhaComercial[]).map(comercialDaLinha),
    clientes: ((resClientes.data ?? []) as { company: string | null }[])
      .map((linha) => linha.company ?? "")
      .filter(Boolean),
  };
}


// ---------- Componente ----------

export function ComerciaisView() {
  const [lista, setLista] = useState<ComercialReal[]>([]);
  const [clientes, setClientes] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modoDemo, setModoDemo] = useState(false);

  const [search, setSearch] = useState("");
  const [client, setClient] = useState("Todos");

  // Dialog: cria OU edita (editingId = qual comercial abriu)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tituloF, setTituloF] = useState("");
  const [clienteSel, setClienteSel] = useState("Sem cliente");
  const [formatoSel, setFormatoSel] = useState<string>("Reels");
  const [creatorF, setCriadorF] = useState("");
  const [prazoF, setPrazoF] = useState("");
  const [statusSel, setStatusSel] = useState<CommercialStatus>("Rascunho");
  const [roteiroF, setRoteiroF] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroDialog, setErroDialog] = useState<string | null>(null);

  // Erros de ação (mover entre colunas) — banner confesso
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  // Carga inicial — setState SÓ em .then() (lei do ESLint)
  useEffect(() => {
    let ativo = true;
    coletarTudo().then((resultado) => {
      if (!ativo) return;
      if (resultado === null) {
        setModoDemo(true);
        setLista(commercials.map(demoParaComercial));
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

  const clientOptions = useMemo(
    () => ["Todos", ...new Set(lista.map((item) => item.cliente).filter(Boolean))],
    [lista]
  );

  const filtered = useMemo(
    () =>
      lista.filter((item) => {
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          item.titulo.toLowerCase().includes(query) ||
          item.cliente.toLowerCase().includes(query) ||
          item.creator.toLowerCase().includes(query);
        const matchesClient = client === "Todos" || item.cliente === client;
        return matchesSearch && matchesClient;
      }),
    [lista, search, client]
  );

  const temFiltroAtivo = search.trim() !== "" || client !== "Todos";

  const stats = [
    { label: "Total de comerciais", value: lista.length.toString(), icon: Film, tone: "bg-primary/15 text-primary" },
    {
      label: "Em produção",
      value: lista.filter((item) => item.status === "Produção").length.toString(),
      icon: Clapperboard,
      tone: "bg-info/15 text-info",
    },
    {
      label: "Em revisão",
      value: lista.filter((item) => item.status === "Revisão").length.toString(),
      icon: Eye,
      tone: "bg-warning/15 text-warning",
    },
    {
      label: "Aprovados",
      value: lista.filter((item) => item.status === "Aprovado").length.toString(),
      icon: BadgeCheck,
      tone: "bg-success/15 text-success",
    },
  ];

  function limparFormulario() {
    setEditingId(null);
    setTituloF("");
    setClienteSel("Sem cliente");
    setFormatoSel("Reels");
    setCriadorF("");
    setPrazoF("");
    setStatusSel("Rascunho");
    setRoteiroF("");
    setErroDialog(null);
  }

  function abrirNovo() {
    limparFormulario();
    setDialogOpen(true);
  }

  function abrirEdicao(c: ComercialReal) {
    setEditingId(c.id);
    setTituloF(c.titulo);
    setClienteSel(c.cliente || "Sem cliente");
    setFormatoSel(c.formato);
    setCriadorF(c.creator);
    setPrazoF(c.prazoIso);
    setStatusSel(c.status);
    setRoteiroF(c.roteiro);
    setErroDialog(null);
    setDialogOpen(true);
  }

  function montarRegistro(userId: string) {
    return {
      user_id: userId,
      title: tituloF.trim() || "Comercial sem título",
      client_name: clienteSel === "Sem cliente" ? null : clienteSel,
      creator: creatorF.trim() || null,
      format: formatoSel,
      script: roteiroF.trim() || null,
      deadline: prazoF || null,
      status: statusSel,
    };
  }

  async function handleSalvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroDialog(null);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setErroDialog(
        "Modo demonstração: para guardar comerciais de verdade, o banco precisa estar configurado."
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
        .from("commercials")
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
      const atualizado = comercialDaLinha(linha as LinhaComercial);
      setLista((atual) =>
        atual.map((c) => (c.id === atualizado.id ? atualizado : c))
      );
    } else {
      const registroNovo = {
        ...registro,
        thumbnail_tone: TONS[lista.length % TONS.length],
      };
      const { data: linha, error } = await supabase
        .from("commercials")
        .insert(registroNovo)
        .select(COLUNAS)
        .single();
      setSalvando(false);
      if (error || !linha) {
        setErroDialog(
          `Não consegui adicionar ao quadro. Detalhe técnico: ${error?.message ?? "o banco não devolveu a linha"}`
        );
        return;
      }
      setLista((atual) => [comercialDaLinha(linha as LinhaComercial), ...atual]);
    }

    setDialogOpen(false);
    limparFormulario();
  }

  // Setas do quadro: move o criativo entre etapas (otimista + confessa/desfaz)
  async function handleMover(c: ComercialReal, direcao: 1 | -1) {
    const indiceAtual = STATUS_ORDEM.indexOf(c.status);
    const indiceNovo = indiceAtual + direcao;
    if (indiceNovo < 0 || indiceNovo >= STATUS_ORDEM.length) return;
    const novoStatus = STATUS_ORDEM[indiceNovo];
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setErroAcao(null);
    setLista((atual) =>
      atual.map((x) => (x.id === c.id ? { ...x, status: novoStatus } : x))
    );
    const { error } = await supabase
      .from("commercials")
      .update({ status: novoStatus })
      .eq("id", c.id);
    if (error) {
      setLista((atual) =>
        atual.map((x) => (x.id === c.id ? { ...x, status: c.status } : x))
      );
      setErroAcao(
        `Não consegui mover "${c.titulo}". Detalhe técnico: ${error.message}`
      );
    }
  }

  async function handleExcluir(c: ComercialReal) {
    if (!window.confirm(`Excluir "${c.titulo}" do quadro? Essa ação não tem volta.`)) {
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setErroDialog("Modo demonstração: exclusão precisa do banco configurado.");
      return;
    }
    setExcluindo(true);
    const { error } = await supabase.from("commercials").delete().eq("id", c.id);
    setExcluindo(false);
    if (error) {
      setErroDialog(`Não consegui excluir. Detalhe técnico: ${error.message}`);
      return;
    }
    setLista((atual) => atual.filter((item) => item.id !== c.id));
    setDialogOpen(false);
    limparFormulario();
  }

  // ---------- Carregamento ----------
  if (carregando) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Carregando comerciais">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-white/10" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {["s1", "s2", "s3", "s4"].map((chave) => (
            <div key={chave} className="h-20 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {["k1", "k2", "k3", "k4"].map((chave) => (
            <div key={chave} className="h-80 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Comerciais"
        badge={modoDemo ? "Modo demonstração" : undefined}
        description="Anúncios  em produção pela equipe."
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
              <Plus /> Novo Comercial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Detalhes do comercial" : "Novo comercial"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Ajuste informações, etapa e roteiro do criativo."
                  : "Adicione um anúncio UGC ao quadro de produção."}
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSalvar}>
              <div>
                <label htmlFor="commercial-title" className={fieldLabel}>
                  Título do criativo
                </label>
                <Input
                  id="commercial-title"
                  value={tituloF}
                  onChange={(event) => setTituloF(event.target.value)}
                  placeholder="Ex.: Unboxing Coleção Verão"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="commercial-client" className={fieldLabel}>
                    Cliente
                  </label>
                  <Select value={clienteSel} onValueChange={setClienteSel}>
                    <SelectTrigger id="commercial-client" aria-label="Selecionar cliente">
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
                  <label htmlFor="commercial-format" className={fieldLabel}>
                    Formato
                  </label>
                  <Select value={formatoSel} onValueChange={setFormatoSel}>
                    <SelectTrigger id="commercial-format" aria-label="Selecionar formato">
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                    <SelectContent>
                      {formatoOptions.map((opcao) => (
                        <SelectItem key={opcao} value={opcao}>
                          {opcao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="commercial-creator" className={fieldLabel}>
                    Criador responsável
                  </label>
                  <Input
                    id="commercial-creator"
                    value={creatorF}
                    onChange={(event) => setCriadorF(event.target.value)}
                    placeholder="@ana.cria"
                  />
                </div>
                <div>
                  <label htmlFor="commercial-due" className={fieldLabel}>
                    Prazo
                  </label>
                  <Input
                    id="commercial-due"
                    type="date"
                    value={prazoF}
                    onChange={(event) => setPrazoF(event.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="commercial-status" className={fieldLabel}>
                  Etapa do quadro
                </label>
                <Select
                  value={statusSel}
                  onValueChange={(valor) => setStatusSel(valor as CommercialStatus)}
                >
                  <SelectTrigger id="commercial-status" aria-label="Selecionar etapa">
                    <SelectValue placeholder="Selecione a etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_ORDEM.map((opcao) => (
                      <SelectItem key={opcao} value={opcao}>
                        {opcao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="commercial-script" className={fieldLabel}>
                  Roteiro resumido
                </label>
                <Textarea
                  id="commercial-script"
                  value={roteiroF}
                  onChange={(event) => setRoteiroF(event.target.value)}
                  placeholder="Hook de 3s, demonstração, prova social e CTA..."
                  className="min-h-[88px]"
                />
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
                      const alvo = lista.find((c) => c.id === editingId);
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
                    "Adicionar ao quadro"
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
                aria-label="Buscar comerciais"
                className="pl-10"
              />
            </div>
            <Select value={client} onValueChange={setClient}>
              <SelectTrigger aria-label="Filtrar por cliente" className="w-full lg:w-[240px]">
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "Todos" ? "Todos os clientes" : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {erroAcao && (
        <div
          role="alert"
          className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
        >
          <p className="text-sm text-red-300">{erroAcao}</p>
          <button
            type="button"
            onClick={() => setErroAcao(null)}
            aria-label="Fechar aviso"
            className="cursor-pointer text-red-300 transition-colors hover:text-red-100"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((column) => {
            const items = filtered.filter((item) => item.status === column.status);
            return (
              <div
                key={column.status}
                className="flex min-h-[320px] flex-col rounded-2xl border border-border bg-surface-2/50 p-3"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", column.dot)} />
                    <p className="text-xs font-semibold tracking-wide uppercase">
                      {column.status}
                    </p>
                  </div>
                  <Badge variant="outline">{items.length}</Badge>
                </div>

                <div className="flex-1 space-y-3">
                  {items.map((item) => {
                    const indice = STATUS_ORDEM.indexOf(item.status);
                    return (
                      <Card
                        key={item.id}
                        className="card-glow cursor-pointer overflow-hidden transition-transform hover:-translate-y-0.5"
                        onClick={() => abrirEdicao(item)}
                      >
                        <div
                          className={cn(
                            "relative flex aspect-video items-center justify-center bg-gradient-to-br",
                            toneGradient[item.tom]
                          )}
                        >
                          <div className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm">
                            <Play className="ml-0.5 size-4 fill-white text-white" />
                          </div>
                          <Badge variant="violet" className="absolute top-2 left-2">
                            {item.formato}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <p className="text-sm leading-snug font-semibold">{item.titulo}</p>
                          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Building2 className="size-3" />
                            {item.cliente || "Sem cliente"}
                          </p>
                          {item.roteiro && (
                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                              {item.roteiro}
                            </p>
                          )}
                          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="size-6">
                                <AvatarFallback className="text-[9px]">
                                  {(item.creator || "AD")
                                    .replace("@", "")
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[11px] font-medium">
                                {item.creator || "A definir"}
                              </span>
                            </div>
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <CalendarClock className="size-3" />
                              {item.prazoRotulo}
                            </span>
                          </div>
                          <div
                            className="mt-3 flex items-center justify-between border-t border-border pt-2.5"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Voltar ${item.titulo} uma etapa`}
                              disabled={indice === 0}
                              onClick={() => void handleMover(item, -1)}
                              className="size-7 text-muted-foreground hover:text-foreground"
                            >
                              <ChevronLeft className="size-4" />
                            </Button>
                            <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
                              Etapa {indice + 1} de {STATUS_ORDEM.length}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Avançar ${item.titulo} uma etapa`}
                              disabled={indice === STATUS_ORDEM.length - 1}
                              onClick={() => void handleMover(item, 1)}
                              className="size-7 text-muted-foreground hover:text-foreground"
                            >
                              <ChevronRight className="size-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border px-3 py-8 text-center">
                      <p className="text-xs text-muted-foreground">Nenhum criativo</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <SearchX className="size-8 text-muted-foreground" />
            {temFiltroAtivo ? (
              <>
                <p className="mt-3 font-medium">Nenhum comercial encontrado</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajuste a busca ou o filtro de cliente para ver resultados.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearch("");
                    setClient("Todos");
                  }}
                >
                  Limpar filtros
                </Button>
              </>
            ) : (
              <>
                <p className="mt-3 font-medium">Quadro de produção vazio</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Adicione o primeiro criativo — ele entra em Rascunho e caminha
                  pelo quadro até Aprovado.
                </p>
                <Button size="sm" className="mt-4" onClick={abrirNovo}>
                  <Plus /> Adicionar primeiro comercial
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}