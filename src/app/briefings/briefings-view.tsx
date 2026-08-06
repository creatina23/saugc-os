"use client";

// ------------------------------------------------------------------
// Briefings — pedidos de conteúdo UGC REAIS (tabela briefings).
// • CRUD completo: criar, editar (Abrir briefing), excluir, filtrar.
// • Prazo é data de verdade (type=date) exibida "12 ago 2026".
// • Campo "Detalhes do pedido" (notes): base pra IA gerar roteiro (Sprint 015).
// • Erros confessam "Detalhe técnico:" — nunca falha em silêncio.
// • Sem banco configurado → modo demonstração (mock, selo visível).
// ------------------------------------------------------------------

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  PenLine,
  Plus,
  Search,
  SearchX,
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
  const [creatorF, setCreatorF] = useState("");
  const [statusSel, setStatusSel] = useState<BriefingStatus>("Rascunho");
  const [prazoF, setPrazoF] = useState("");
  const [etiquetasF, setEtiquetasF] = useState("");
  const [notasF, setNotasF] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroDialog, setErroDialog] = useState<string | null>(null);

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

  function limparFormulario() {
    setEditingId(null);
    setTituloF("");
    setClienteSel("Sem cliente");
    setCreatorF("");
    setStatusSel("Rascunho");
    setPrazoF("");
    setEtiquetasF("");
    setNotasF("");
    setErroDialog(null);
  }

  function abrirNovo() {
    limparFormulario();
    setDialogOpen(true);
  }

  function abrirEdicao(b: BriefingReal) {
    setEditingId(b.id);
    setTituloF(b.titulo);
    setClienteSel(b.cliente || "Sem cliente");
    setCreatorF(b.creator);
    setStatusSel(b.status);
    setPrazoF(b.prazoIso);
    setEtiquetasF(b.etiquetas.join(", "));
    setNotasF(b.notas);
    setErroDialog(null);
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
        description="Briefings de conteúdo UGC padronizados."
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
                    Creator responsável
                  </label>
                  <Input
                    id="briefing-creator"
                    value={creatorF}
                    onChange={(event) => setCreatorF(event.target.value)}
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