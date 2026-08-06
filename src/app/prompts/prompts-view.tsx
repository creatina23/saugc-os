"use client";

// ------------------------------------------------------------------
// Prompts — biblioteca de prompts REAL (tabela prompts).
// • CRUD completo: criar, Editar (cartão), excluir, copiar, filtrar.
// • Variáveis dinâmicas {chaves} destacadas no conteúdo.
// • Erros confessam "Detalhe técnico:" — nunca falha em silêncio.
// • Sem banco configurado → modo demonstração (mock, selo visível).
// ------------------------------------------------------------------

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Bot,
  Braces,
  Check,
  Copy,
  Loader2,
  Pencil,
  Plus,
  Search,
  SearchX,
  Sparkles,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
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
import { prompts } from "@/lib/mock-data";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";


// ---------- Regras fixas ----------

const modeloOptions = ["Gemini", "GPT-4o", "Claude 3.5 Sonnet", "Midjourney"] as const;

const modelBadge: Record<string, "default" | "violet" | "warning" | "secondary" | "info"> = {
  Gemini: "info",
  "GPT-4o": "default",
  "Claude 3.5 Sonnet": "violet",
  Midjourney: "warning",
};

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

// Destaca variáveis {chaves} no conteúdo do prompt
function renderContent(content: string) {
  return content.split(/(\{[^}]+\})/g).map((part, index) =>
    part.startsWith("{") && part.endsWith("}") ? (
      <code
        key={`${part}-${index}`}
        className="rounded-md border border-ai/30 bg-ai/15 px-1.5 py-0.5 text-ai"
      >
        {part}
      </code>
    ) : (
      <span key={`text-${index}`}>{part}</span>
    )
  );
}


// ---------- Tipos e ponte com o banco ----------

type PromptReal = {
  id: string;
  titulo: string;
  descricao: string;
  conteudo: string;
  modelos: string[];
  etiquetas: string[];
  parametros: Record<string, string>;
};

type LinhaPrompt = {
  id: string;
  title: string | null;
  description: string | null;
  content: string | null;
  models: string[] | null;
  tags: string[] | null;
  parameters: Record<string, string> | null;
  created_at: string;
};

type MockPrompt = (typeof prompts)[number];

const COLUNAS = "id, title, description, content, models, tags, parameters, created_at";

function promptDaLinha(linha: LinhaPrompt): PromptReal {
  return {
    id: linha.id,
    titulo: linha.title ?? "Sem título",
    descricao: linha.description ?? "",
    conteudo: linha.content ?? "",
    modelos: linha.models ?? [],
    etiquetas: linha.tags ?? [],
    parametros: linha.parameters ?? {},
  };
}

// Mock (modo demonstração)
function demoParaPrompt(item: MockPrompt): PromptReal {
  return {
    id: item.id,
    titulo: item.title,
    descricao: item.description,
    conteudo: item.content,
    modelos: item.models ?? [],
    etiquetas: item.tags ?? [],
    parametros: (item.parameters as Record<string, string>) ?? {},
  };
}

async function coletarTudo(): Promise<{ lista: PromptReal[] } | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("prompts")
    .select(COLUNAS)
    .order("created_at", { ascending: false });

  if (error) return null; // cai no modo demo; selo fica visível

  return { lista: ((data ?? []) as LinhaPrompt[]).map(promptDaLinha) };
}


// ---------- Componente ----------

export function PromptsView() {
  const [lista, setLista] = useState<PromptReal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modoDemo, setModoDemo] = useState(false);

  const [search, setSearch] = useState("");
  const [model, setModel] = useState("Todos");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dialog: cria OU edita (editingId = qual prompt abriu)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tituloF, setTituloF] = useState("");
  const [descricaoF, setDescricaoF] = useState("");
  const [conteudoF, setConteudoF] = useState("");
  const [modeloSel, setModeloSel] = useState<string>("Gemini");
  const [etiquetasF, setEtiquetasF] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroDialog, setErroDialog] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  // Carga inicial — setState SÓ em .then() (lei do ESLint)
  useEffect(() => {
    let ativo = true;
    coletarTudo().then((resultado) => {
      if (!ativo) return;
      if (resultado === null) {
        setModoDemo(true);
        setLista(prompts.map(demoParaPrompt));
      } else {
        setLista(resultado.lista);
      }
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, []);

  const modelOptions = useMemo(
    () => ["Todos", ...new Set(lista.flatMap((item) => item.modelos))],
    [lista]
  );

  const filtered = useMemo(
    () =>
      lista.filter((item) => {
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          item.titulo.toLowerCase().includes(query) ||
          item.descricao.toLowerCase().includes(query) ||
          item.conteudo.toLowerCase().includes(query) ||
          item.etiquetas.some((tag) => tag.toLowerCase().includes(query));
        const matchesModel = model === "Todos" || item.modelos.includes(model);
        return matchesSearch && matchesModel;
      }),
    [lista, search, model]
  );

  const temFiltroAtivo = search.trim() !== "" || model !== "Todos";

  const totalVariables = lista.reduce(
    (acc, item) => acc + (item.conteudo.match(/\{[^}]+\}/g)?.length ?? 0),
    0
  );

  const stats = [
    { label: "Total de prompts", value: lista.length.toString(), icon: Sparkles, tone: "bg-ai/15 text-ai" },
    {
      label: "Modelos-alvo",
      value: new Set(lista.flatMap((item) => item.modelos)).size.toString(),
      icon: Bot,
      tone: "bg-primary/15 text-primary",
    },
    { label: "Variáveis dinâmicas", value: totalVariables.toString(), icon: Braces, tone: "bg-warning/15 text-warning" },
    {
      label: "Tags únicas",
      value: new Set(lista.flatMap((item) => item.etiquetas)).size.toString(),
      icon: Tags,
      tone: "bg-success/15 text-success",
    },
  ];

  function limparFormulario() {
    setEditingId(null);
    setTituloF("");
    setDescricaoF("");
    setConteudoF("");
    setModeloSel("Gemini");
    setEtiquetasF("");
    setErroDialog(null);
  }

  function abrirNovo() {
    limparFormulario();
    setDialogOpen(true);
  }

  function abrirEdicao(item: PromptReal) {
    setEditingId(item.id);
    setTituloF(item.titulo);
    setDescricaoF(item.descricao);
    setConteudoF(item.conteudo);
    setModeloSel(modeloOptions.includes(item.modelos[0] as (typeof modeloOptions)[number]) ? item.modelos[0] : "Gemini");
    setEtiquetasF(item.etiquetas.join(", "));
    setErroDialog(null);
    setDialogOpen(true);
  }

  function montarRegistro(userId: string) {
    return {
      user_id: userId,
      title: tituloF.trim() || "Prompt sem título",
      description: descricaoF.trim() || null,
      content: conteudoF.trim() || "Sem conteúdo",
      models: [modeloSel],
      tags: etiquetasF
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
  }

  async function handleSalvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroDialog(null);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setErroDialog(
        "Modo demonstração: para guardar prompts de verdade, o banco precisa estar configurado."
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
      // update sem tocar em "parameters" (preserva o que já existia)
      const { data: linha, error } = await supabase
        .from("prompts")
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
      const atualizado = promptDaLinha(linha as LinhaPrompt);
      setLista((atual) =>
        atual.map((item) => (item.id === atualizado.id ? atualizado : item))
      );
    } else {
      const { data: linha, error } = await supabase
        .from("prompts")
        .insert({ ...registro, parameters: {} })
        .select(COLUNAS)
        .single();
      setSalvando(false);
      if (error || !linha) {
        setErroDialog(
          `Não consegui salvar o prompt. Detalhe técnico: ${error?.message ?? "o banco não devolveu a linha"}`
        );
        return;
      }
      setLista((atual) => [promptDaLinha(linha as LinhaPrompt), ...atual]);
    }

    setDialogOpen(false);
    limparFormulario();
  }

  async function handleExcluir(item: PromptReal) {
    if (!window.confirm(`Excluir o prompt "${item.titulo}"? Essa ação não tem volta.`)) {
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setErroDialog("Modo demonstração: exclusão precisa do banco configurado.");
      return;
    }
    setExcluindo(true);
    const { error } = await supabase.from("prompts").delete().eq("id", item.id);
    setExcluindo(false);
    if (error) {
      setErroDialog(`Não consegui excluir. Detalhe técnico: ${error.message}`);
      return;
    }
    setLista((atual) => atual.filter((entry) => entry.id !== item.id));
    setDialogOpen(false);
    limparFormulario();
  }

  async function copyPrompt(id: string, content: string) {
    setErroAcao(null);
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setCopiedId(null);
      setErroAcao("Não consegui copiar. Seleciona o texto do prompt e copia com Ctrl+C.");
    }
  }

  // ---------- Carregamento ----------
  if (carregando) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Carregando prompts">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-white/10" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {["s1", "s2", "s3", "s4"].map((chave) => (
            <div key={chave} className="h-20 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {["c1", "c2"].map((chave) => (
            <div key={chave} className="h-64 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Prompts"
        badge={modoDemo ? "Modo demonstração" : undefined}
        description="Biblioteca de prompts de IA reutilizáveis."
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
              <Plus /> Novo Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar prompt" : "Salvar novo prompt"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Ajuste conteúdo, tags e modelo recomendado."
                  : "Adicione um prompt reutilizável à biblioteca da agência."}
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSalvar}>
              <div>
                <label htmlFor="prompt-title" className={fieldLabel}>
                  Título
                </label>
                <Input
                  id="prompt-title"
                  value={tituloF}
                  onChange={(event) => setTituloF(event.target.value)}
                  placeholder="Ex.: Briefing UGC por Nicho"
                />
              </div>
              <div>
                <label htmlFor="prompt-description" className={fieldLabel}>
                  Descrição
                </label>
                <Input
                  id="prompt-description"
                  value={descricaoF}
                  onChange={(event) => setDescricaoF(event.target.value)}
                  placeholder="O que este prompt gera..."
                />
              </div>
              <div>
                <label htmlFor="prompt-content" className={fieldLabel}>
                  Conteúdo do prompt
                </label>
                <Textarea
                  id="prompt-content"
                  value={conteudoF}
                  onChange={(event) => setConteudoF(event.target.value)}
                  placeholder="Crie um briefing UGC para o nicho {nicho}..."
                  className="font-mono-params min-h-[110px]"
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Dica: use {"{chaves}"} para criar variáveis dinâmicas.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="prompt-model" className={fieldLabel}>
                    Modelo recomendado
                  </label>
                  <Select value={modeloSel} onValueChange={setModeloSel}>
                    <SelectTrigger id="prompt-model" aria-label="Selecionar modelo">
                      <SelectValue placeholder="Selecione o modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {modeloOptions.map((opcao) => (
                        <SelectItem key={opcao} value={opcao}>
                          {opcao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="prompt-tags" className={fieldLabel}>
                    Tags <span className="text-muted-foreground/60">(separadas por vírgula)</span>
                  </label>
                  <Input
                    id="prompt-tags"
                    value={etiquetasF}
                    onChange={(event) => setEtiquetasF(event.target.value)}
                    placeholder="UGC, Briefing, Roteiro"
                  />
                </div>
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
                      const alvo = lista.find((item) => item.id === editingId);
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
                    "Salvar prompt"
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
                placeholder="Buscar por título, conteúdo ou tag..."
                aria-label="Buscar prompts"
                className="pl-10"
              />
            </div>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger aria-label="Filtrar por modelo" className="w-full lg:w-[240px]">
                <SelectValue placeholder="Modelo" />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "Todos" ? "Todos os modelos" : option}
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
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {filtered.map((prompt) => (
            <Card key={prompt.id} className="card-glow flex flex-col">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold tracking-tight">{prompt.titulo}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{prompt.descricao}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      variant={copiedId === prompt.id ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => void copyPrompt(prompt.id, prompt.conteudo)}
                      aria-label={`Copiar prompt ${prompt.titulo}`}
                    >
                      {copiedId === prompt.id ? <Check className="text-success" /> : <Copy />}
                      {copiedId === prompt.id ? "Copiado" : "Copiar"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => abrirEdicao(prompt)}
                      aria-label={`Editar prompt ${prompt.titulo}`}
                      className="text-muted-foreground"
                    >
                      <Pencil />
                      Editar
                    </Button>
                  </div>
                </div>

                <div
                  className={cn(
                    "font-mono-params mt-4 flex-1 rounded-xl border border-border bg-[rgba(255,255,255,0.02)] p-4 leading-relaxed text-muted-foreground"
                  )}
                >
                  {renderContent(prompt.conteudo)}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {prompt.modelos.map((item) => (
                    <Badge key={item} variant={modelBadge[item] ?? "secondary"}>
                      {item}
                    </Badge>
                  ))}
                  {prompt.etiquetas.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {Object.keys(prompt.parametros).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
                    {Object.entries(prompt.parametros).map(([key, value]) => (
                      <span
                        key={key}
                        className="font-mono-params rounded-md border border-border bg-muted px-2 py-1 text-[11px] text-muted-foreground"
                      >
                        {key}: <span className="text-foreground">{String(value)}</span>
                      </span>
                    ))}
                  </div>
                )}
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
                <p className="mt-3 font-medium">Nenhum prompt encontrado</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajuste a busca ou o filtro de modelo para ver resultados.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearch("");
                    setModel("Todos");
                  }}
                >
                  Limpar filtros
                </Button>
              </>
            ) : (
              <>
                <p className="mt-3 font-medium">Nenhum prompt guardado ainda</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Salve seus melhores prompts — com {"{variáveis}"} eles viram
                  máquinas de reaproveitamento.
                </p>
                <Button size="sm" className="mt-4" onClick={abrirNovo}>
                  <Plus /> Salvar primeiro prompt
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}