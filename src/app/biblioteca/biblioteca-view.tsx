"use client";

// ------------------------------------------------------------------
// Biblioteca — conhecimento reutilizável REAL (tabela library_items).
// • CRUD completo: criar, Abrir item (edita), excluir, filtrar por abas.
// • Categorias: valores EN no cofre (LibraryCategory), rótulos PT-BR na
//   tela (Lei da Língua: tela PT, motor EN).
// • "Conteúdo completo" = baú das gerações da IA + botão Copiar.
// • Erros confessam "Detalhe técnico:" — nunca falha em silêncio.
// • Sem banco configurado → modo demonstração (mock, selo visível).
// ------------------------------------------------------------------

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  BookOpen,
  CalendarClock,
  Check,
  ChevronRight,
  Compass,
  Copy,
  Loader2,
  Plus,
  ScrollText,
  Search,
  SearchX,
  Trash2,
  X,
  Zap,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { libraryItems } from "@/lib/mock-data";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { LibraryCategory } from "@/types";


// ---------- Regras fixas ----------

const categoryConfig: Record<
  LibraryCategory,
  { icon: typeof BookOpen; badge: "violet" | "warning" | "info" | "success"; tone: string }
> = {
  "UGC Script Templates": { icon: ScrollText, badge: "violet", tone: "bg-ai/15 text-ai" },
  "Ad Copy Hooks": { icon: Zap, badge: "warning", tone: "bg-warning/15 text-warning" },
  "Creator Guidelines": { icon: BookOpen, badge: "info", tone: "bg-info/15 text-info" },
  "Strategy Guides": { icon: Compass, badge: "success", tone: "bg-success/15 text-success" },
};

// Valores de cofre (EN, do tipo LibraryCategory) × rótulos da tela (PT-BR)
const categorias = [
  { valor: "UGC Script Templates" as LibraryCategory, rotulo: "Modelos de Roteiro UGC" },
  { valor: "Ad Copy Hooks" as LibraryCategory, rotulo: "Hooks de Copy" },
  { valor: "Creator Guidelines" as LibraryCategory, rotulo: "Guias do Creator" },
  { valor: "Strategy Guides" as LibraryCategory, rotulo: "Guias de Estratégia" },
];

function rotuloCategoria(valor: string): string {
  return categorias.find((c) => c.valor === valor)?.rotulo ?? valor;
}

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}


// ---------- Tipos e ponte com o banco ----------

type ItemReal = {
  id: string;
  titulo: string;
  categoria: LibraryCategory;
  autor: string;
  descricao: string;
  conteudo: string;
  dataRotulo: string;
};

type LinhaItem = {
  id: string;
  title: string | null;
  category: string | null;
  author: string | null;
  description: string | null;
  content: string | null;
  created_at: string;
};

type MockItem = (typeof libraryItems)[number];

const COLUNAS = "id, title, category, author, description, content, created_at";

function normalizaCategoria(valor: string | null): LibraryCategory {
  return categorias.some((c) => c.valor === valor)
    ? (valor as LibraryCategory)
    : "UGC Script Templates";
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

function dataCurta(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";
  return `${data.getDate()} ${MESES[data.getMonth()]} ${data.getFullYear()}`;
}

function itemDaLinha(linha: LinhaItem): ItemReal {
  return {
    id: linha.id,
    titulo: linha.title ?? "Sem título",
    categoria: normalizaCategoria(linha.category),
    autor: linha.author ?? "Equipe AnuncIA",
    descricao: linha.description ?? "",
    conteudo: linha.content ?? "",
    dataRotulo: dataCurta(linha.created_at),
  };
}

// Mock (modo demonstração)
function demoParaItem(item: MockItem): ItemReal {
  return {
    id: item.id,
    titulo: item.title,
    categoria: normalizaCategoria(item.category),
    autor: item.author ?? "Equipe AnuncIA",
    descricao: item.description ?? "",
    conteudo: "",
    dataRotulo: item.updatedAt ?? "",
  };
}

async function coletarTudo(): Promise<{ lista: ItemReal[] } | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("library_items")
    .select(COLUNAS)
    .order("created_at", { ascending: false });

  if (error) return null; // cai no modo demo; selo fica visível

  return { lista: ((data ?? []) as LinhaItem[]).map(itemDaLinha) };
}


// ---------- Componente ----------

export function BibliotecaView() {
  const [lista, setLista] = useState<ItemReal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modoDemo, setModoDemo] = useState(false);

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("Todos");

  // Dialog: cria OU edita (editingId = qual item abriu)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tituloF, setTituloF] = useState("");
  const [categoriaSel, setCategoriaSel] = useState<LibraryCategory>("UGC Script Templates");
  const [autorF, setAutorF] = useState("");
  const [descricaoF, setDescricaoF] = useState("");
  const [conteudoF, setConteudoF] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroDialog, setErroDialog] = useState<string | null>(null);

  // Copiar conteúdo + erros de ação
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  // Carga inicial — setState SÓ em .then() (lei do ESLint)
  useEffect(() => {
    let ativo = true;
    coletarTudo().then((resultado) => {
      if (!ativo) return;
      if (resultado === null) {
        setModoDemo(true);
        setLista(libraryItems.map(demoParaItem));
      } else {
        setLista(resultado.lista);
      }
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, []);

  const stats = categorias.map((cat) => ({
    label: cat.rotulo,
    value: lista.filter((entry) => entry.categoria === cat.valor).length.toString(),
    icon: categoryConfig[cat.valor].icon,
    tone: categoryConfig[cat.valor].tone,
  }));

  const filtered = useMemo(
    () =>
      lista.filter((item) => {
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          item.titulo.toLowerCase().includes(query) ||
          item.descricao.toLowerCase().includes(query) ||
          item.conteudo.toLowerCase().includes(query) ||
          item.autor.toLowerCase().includes(query);
        const matchesTab = tab === "Todos" || item.categoria === tab;
        return matchesSearch && matchesTab;
      }),
    [lista, search, tab]
  );

  const temFiltroAtivo = search.trim() !== "" || tab !== "Todos";

  function limparFormulario() {
    setEditingId(null);
    setTituloF("");
    setCategoriaSel("UGC Script Templates");
    setAutorF("");
    setDescricaoF("");
    setConteudoF("");
    setErroDialog(null);
  }

  function abrirNovo() {
    limparFormulario();
    setDialogOpen(true);
  }

  function abrirEdicao(item: ItemReal) {
    setEditingId(item.id);
    setTituloF(item.titulo);
    setCategoriaSel(item.categoria);
    setAutorF(item.autor);
    setDescricaoF(item.descricao);
    setConteudoF(item.conteudo);
    setErroDialog(null);
    setDialogOpen(true);
  }

  function montarRegistro(userId: string) {
    return {
      user_id: userId,
      title: tituloF.trim() || "Item sem título",
      category: categoriaSel,
      author: autorF.trim() || "Equipe AnuncIA",
      description: descricaoF.trim() || null,
      content: conteudoF.trim() || null,
    };
  }

  async function handleSalvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroDialog(null);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setErroDialog(
        "Modo demonstração: para guardar itens de verdade, o banco precisa estar configurado."
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
        .from("library_items")
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
      const atualizado = itemDaLinha(linha as LinhaItem);
      setLista((atual) =>
        atual.map((item) => (item.id === atualizado.id ? atualizado : item))
      );
    } else {
      const { data: linha, error } = await supabase
        .from("library_items")
        .insert(registro)
        .select(COLUNAS)
        .single();
      setSalvando(false);
      if (error || !linha) {
        setErroDialog(
          `Não consegui salvar na biblioteca. Detalhe técnico: ${error?.message ?? "o banco não devolveu a linha"}`
        );
        return;
      }
      setLista((atual) => [itemDaLinha(linha as LinhaItem), ...atual]);
    }

    setDialogOpen(false);
    limparFormulario();
  }

  async function handleExcluir(item: ItemReal) {
    if (!window.confirm(`Excluir "${item.titulo}" da biblioteca? Essa ação não tem volta.`)) {
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setErroDialog("Modo demonstração: exclusão precisa do banco configurado.");
      return;
    }
    setExcluindo(true);
    const { error } = await supabase.from("library_items").delete().eq("id", item.id);
    setExcluindo(false);
    if (error) {
      setErroDialog(`Não consegui excluir. Detalhe técnico: ${error.message}`);
      return;
    }
    setLista((atual) => atual.filter((entry) => entry.id !== item.id));
    setDialogOpen(false);
    limparFormulario();
  }

  async function handleCopiar(item: ItemReal) {
    if (!item.conteudo) return;
    setErroAcao(null);
    try {
      await navigator.clipboard.writeText(item.conteudo);
      setCopiadoId(item.id);
      setTimeout(() => {
        setCopiadoId((atual) => (atual === item.id ? null : atual));
      }, 2000);
    } catch {
      setErroAcao(
        "Não consegui copiar. Abre o item, seleciona o texto e copia com Ctrl+C."
      );
    }
  }

  // ---------- Carregamento ----------
  if (carregando) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Carregando biblioteca">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-white/10" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {["s1", "s2", "s3", "s4"].map((chave) => (
            <div key={chave} className="h-20 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {["c1", "c2", "c3"].map((chave) => (
            <div key={chave} className="h-60 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Biblioteca"
        badge={modoDemo ? "Modo demonstração" : undefined}
        description="Conhecimento reutilizável da operação."
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
              <Plus /> Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Detalhes do item" : "Novo item de conhecimento"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Ajuste conteúdo, categoria e descrição."
                  : "Adicione um template, hook, guideline ou guia à biblioteca."}
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSalvar}>
              <div>
                <label htmlFor="library-title" className={fieldLabel}>
                  Título
                </label>
                <Input
                  id="library-title"
                  value={tituloF}
                  onChange={(event) => setTituloF(event.target.value)}
                  placeholder="Ex.: Script UGC — Problema / Solução / CTA"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="library-category" className={fieldLabel}>
                    Categoria
                  </label>
                  <Select
                    value={categoriaSel}
                    onValueChange={(valor) => setCategoriaSel(valor as LibraryCategory)}
                  >
                    <SelectTrigger id="library-category" aria-label="Selecionar categoria">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.valor} value={cat.valor}>
                          {cat.rotulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="library-author" className={fieldLabel}>
                    Autor
                  </label>
                  <Input
                    id="library-author"
                    value={autorF}
                    onChange={(event) => setAutorF(event.target.value)}
                    placeholder="Equipe AnuncIA"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="library-description" className={fieldLabel}>
                  Descrição
                </label>
                <Textarea
                  id="library-description"
                  value={descricaoF}
                  onChange={(event) => setDescricaoF(event.target.value)}
                  placeholder="Resumo do conteúdo e quando usar..."
                  className="min-h-[72px]"
                />
              </div>
              <div>
                <label htmlFor="library-content" className={fieldLabel}>
                  Conteúdo completo <span className="text-muted-foreground/60">(opcional)</span>
                </label>
                <Textarea
                  id="library-content"
                  value={conteudoF}
                  onChange={(event) => setConteudoF(event.target.value)}
                  placeholder="Cole aqui o texto completo — ideal pra guardar gerações da IA..."
                  className="min-h-[120px]"
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
                    "Salvar na biblioteca"
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

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={tab} onValueChange={setTab} className="min-w-0">
          <TabsList className="max-w-full justify-start overflow-x-auto">
            <TabsTrigger value="Todos">Todos</TabsTrigger>
            {categorias.map((cat) => (
              <TabsTrigger key={cat.valor} value={cat.valor}>
                {cat.rotulo}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={tab} className="sr-only" />
        </Tabs>
        <div className="relative lg:w-[320px]">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar na biblioteca..."
            aria-label="Buscar na biblioteca"
            className="pl-10"
          />
        </div>
      </div>

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
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const config = categoryConfig[item.categoria];
            return (
              <Card key={item.id} className="card-glow flex flex-col">
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`flex size-9 items-center justify-center rounded-lg ${config.tone}`}>
                      <config.icon className="size-4" />
                    </div>
                    <Badge variant={config.badge}>{rotuloCategoria(item.categoria)}</Badge>
                  </div>
                  <h3 className="mt-4 text-base font-semibold tracking-tight">{item.titulo}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {item.descricao || "Sem descrição — abre o item pra ver o conteúdo."}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[9px]">{initials(item.autor)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{item.autor}</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <CalendarClock className="size-3" />
                      {item.dataRotulo}
                    </span>
                  </div>
                  <div className="mt-3 -mb-1 flex items-center justify-end gap-1">
                    {item.conteudo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => void handleCopiar(item)}
                      >
                        {copiadoId === item.id ? (
                          <>
                            <Check className="text-success" /> Copiado!
                          </>
                        ) : (
                          <>
                            <Copy /> Copiar
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => abrirEdicao(item)}
                    >
                      Abrir item
                      <ChevronRight />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <SearchX className="size-8 text-muted-foreground" />
            {temFiltroAtivo ? (
              <>
                <p className="mt-3 font-medium">Nenhum item encontrado</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajuste a busca ou a categoria para ver resultados.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearch("");
                    setTab("Todos");
                  }}
                >
                  Limpar filtros
                </Button>
              </>
            ) : (
              <>
                <p className="mt-3 font-medium">Sua biblioteca está vazia</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Guarde templates, hooks e gerações da IA — tudo que é bom se
                  reaproveita.
                </p>
                <Button size="sm" className="mt-4" onClick={abrirNovo}>
                  <Plus /> Adicionar primeiro item
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}