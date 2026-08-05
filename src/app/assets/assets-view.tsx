"use client";

// ------------------------------------------------------------------
// Mídias — biblioteca de arquivos REAL (Supabase Storage + tabela assets).
// v2 "dedo-duro confesso":
// • Upload: grava user_id explícito + erros mostram o detalhe técnico.
// • Baixar: abre via âncora invisível (não tromba no bloqueador de pop-up)
//   e confessa o erro se o link falhar.
// • Lixeira: confirma no banco ANTES de tirar da tela; confessa se falhar.
// • Categorias: valores do cofre em inglês (AssetCategory),
//   rótulos na tela em PT-BR (Lei da Língua: tela PT, motor EN).
// • Sem banco configurado → modo demonstração (mock, com selo visível).
// ------------------------------------------------------------------

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Building2,
  Clapperboard,
  Clock,
  Download,
  Film,
  Image as ImageIcon,
  Loader2,
  Play,
  Scissors,
  Search,
  SearchX,
  Trash2,
  Upload,
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
import { assetsService, clientesService } from "@/lib/services";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Asset, AssetCategory } from "@/types";


// ---------- Regras fixas ----------

const BALDE = "midias";
const TAMANHO_MAX_MB = 50; // limite por arquivo do plano gratuito do Supabase

// Valores de cofre (inglês, do tipo AssetCategory) × rótulos da tela (PT-BR)
const categorias = [
  { valor: "Video Ads" as AssetCategory, rotulo: "Anúncios em Vídeo" },
  { valor: "Hook Clips" as AssetCategory, rotulo: "Hooks" },
  { valor: "B-Roll" as AssetCategory, rotulo: "Cenas de Apoio" },
  { valor: "Product Photos" as AssetCategory, rotulo: "Fotos de Produto" },
];

function rotuloCategoria(valor: string): string {
  return categorias.find((c) => c.valor === valor)?.rotulo ?? valor;
}

const categoryConfig: Record<
  AssetCategory,
  { gradient: string; isVideo: boolean; tone: string }
> = {
  "Video Ads": {
    gradient: "from-violet-500/60 to-violet-900/30",
    isVideo: true,
    tone: "bg-ai/15 text-ai",
  },
  "Hook Clips": {
    gradient: "from-blue-500/60 to-blue-900/30",
    isVideo: true,
    tone: "bg-primary/15 text-primary",
  },
  "B-Roll": {
    gradient: "from-emerald-500/60 to-emerald-900/30",
    isVideo: true,
    tone: "bg-success/15 text-success",
  },
  "Product Photos": {
    gradient: "from-amber-500/60 to-amber-900/30",
    isVideo: false,
    tone: "bg-warning/15 text-warning",
  },
};

const categoryIcon: Record<AssetCategory, typeof Film> = {
  "Video Ads": Clapperboard,
  "Hook Clips": Scissors,
  "B-Roll": Film,
  "Product Photos": ImageIcon,
};

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";


// ---------- Utilitários ----------

const EXTS_IMAGEM = ["png", "jpg", "jpeg", "gif", "webp"];

function extensaoDe(nomeArquivo: string): string {
  const partes = nomeArquivo.split(".");
  return partes.length > 1 ? (partes.pop() ?? "").toLowerCase() : "";
}

function ehImagem(nomeArquivo: string): boolean {
  return EXTS_IMAGEM.includes(extensaoDe(nomeArquivo));
}

function formatarTamanho(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
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

// Nome seguro pro Storage (sem acentos/espaços/símbolos)
function sanitizarNome(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-");
}


// ---------- Ponte com o banco ----------

type MidiaReal = {
  id: string;
  nome: string;
  cliente: string;
  categoria: string;
  formato: string;
  rotuloTamanho: string;
  etiquetas: string[];
  dataCurta: string;
  caminho: string | null; // storage_path (null = item de demonstração)
  ehImagem: boolean;
};

type LinhaMidia = {
  id: string;
  name: string | null;
  client_name: string | null;
  category: string | null;
  format: string | null;
  size_bytes: number | null;
  tags: string[] | null;
  storage_path: string | null;
  created_at: string;
};

const COLUNAS =
  "id, name, client_name, category, format, size_bytes, tags, storage_path, created_at";

function midiaDaLinha(linha: LinhaMidia): MidiaReal {
  const nome = linha.name ?? "sem-nome";
  return {
    id: linha.id,
    nome,
    cliente: linha.client_name ?? "",
    categoria: linha.category ?? "Video Ads",
    formato: (linha.format ?? extensaoDe(nome).toUpperCase()) || "—",
    rotuloTamanho: formatarTamanho(linha.size_bytes),
    etiquetas: linha.tags ?? [],
    dataCurta: dataCurta(linha.created_at),
    caminho: linha.storage_path,
    ehImagem: ehImagem(nome),
  };
}

function demoParaMidia(item: Asset): MidiaReal {
  return {
    id: item.id,
    nome: item.name,
    cliente: item.client,
    categoria: item.category,
    formato: item.format,
    rotuloTamanho: "—",
    etiquetas: item.tags ?? [],
    dataCurta: item.updatedAt ?? "",
    caminho: null,
    ehImagem: ehImagem(item.name),
  };
}

async function coletarTudo(): Promise<{
  midias: MidiaReal[];
  clientes: string[];
} | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;

  const promessaMidias = supabase
    .from("assets")
    .select(COLUNAS)
    .order("created_at", { ascending: false });
  const promessaClientes = supabase
    .from("clients")
    .select("company")
    .order("created_at", { ascending: false });

  const [resMidias, resClientes] = await Promise.all([
    promessaMidias,
    promessaClientes,
  ]);

  if (resMidias.error) return null; // cai no modo demo; selo fica visível

  return {
    midias: ((resMidias.data ?? []) as LinhaMidia[]).map(midiaDaLinha),
    clientes: ((resClientes.data ?? []) as { company: string | null }[])
      .map((linha) => linha.company ?? "")
      .filter(Boolean),
  };
}

// URLs assinadas (60 min) pras prévias de imagem do bucket privado
async function coletarUrlsAssinadas(
  supabase: SupabaseClient,
  caminhos: string[]
): Promise<Record<string, string>> {
  if (caminhos.length === 0) return {};
  const { data, error } = await supabase.storage
    .from(BALDE)
    .createSignedUrls(caminhos, 3600);
  if (error) return {};
  const mapa: Record<string, string> = {};
  (data ?? []).forEach((item) => {
    if (item.path && item.signedUrl) mapa[item.path] = item.signedUrl;
  });
  return mapa;
}


// ---------- Componente ----------

export function MídiasView() {
  const [midias, setMidias] = useState<MidiaReal[]>([]);
  const [clientes, setClientes] = useState<string[]>([]);
  const [urlsAssinadas, setUrlsAssinadas] = useState<Record<string, string>>(
    {}
  );
  const [carregando, setCarregando] = useState(true);
  const [modoDemo, setModoDemo] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("Todas");
  const [clientFiltro, setClientFiltro] = useState("Todos");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [nome, setNome] = useState("");
  const [clienteSel, setClienteSel] = useState("Sem cliente");
  const [categoriaSel, setCategoriaSel] = useState<AssetCategory>("Video Ads");
  const [etiquetasInput, setEtiquetasInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroDialog, setErroDialog] = useState<string | null>(null);

  // Ações dos cards (baixar/excluir): id ocupado + aviso confesso
  const [ocupandoId, setOcupandoId] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  // Carga inicial — todo setState dentro de .then() (lei do ESLint)
  useEffect(() => {
    let ativo = true;
    coletarTudo().then((resultado) => {
      if (!ativo) return;
      if (resultado === null) {
        setModoDemo(true);
        setMidias(assetsService.list().map(demoParaMidia));
        setClientes(clientesService.list().map((c) => c.company));
      } else {
        setMidias(resultado.midias);
        setClientes(resultado.clientes);
        const supabase = getSupabaseBrowser();
        const caminhos = resultado.midias
          .filter((m) => m.caminho && m.ehImagem)
          .map((m) => m.caminho as string);
        if (supabase && caminhos.length > 0) {
          coletarUrlsAssinadas(supabase, caminhos).then((mapa) => {
            if (ativo) setUrlsAssinadas(mapa);
          });
        }
      }
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, []);

  const clientOptions = useMemo(
    () => ["Todos", ...new Set(clientes)],
    [clientes]
  );

  const filtrosCategoria = useMemo(
    () => [
      { rotulo: "Todas", valor: "Todas" },
      ...categorias.map((c) => ({ rotulo: c.rotulo, valor: c.valor })),
    ],
    []
  );

  const filtered = useMemo(
    () =>
      midias.filter((item) => {
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          item.nome.toLowerCase().includes(query) ||
          item.cliente.toLowerCase().includes(query) ||
          item.etiquetas.some((tag) => tag.toLowerCase().includes(query));
        const matchesCategory =
          category === "Todas" || item.categoria === category;
        const matchesClient =
          clientFiltro === "Todos" || item.cliente === clientFiltro;
        return matchesSearch && matchesCategory && matchesClient;
      }),
    [midias, search, category, clientFiltro]
  );

  const temFiltroAtivo =
    search.trim() !== "" || category !== "Todas" || clientFiltro !== "Todos";

  const stats = categorias.map((cat) => ({
    label: cat.rotulo,
    value: midias
      .filter((m) => m.categoria === cat.valor)
      .length.toString(),
    icon: categoryIcon[cat.valor],
    tone: categoryConfig[cat.valor].tone,
  }));

  async function handleEnviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroDialog(null);

    if (!arquivo) {
      setErroDialog("Escolha um arquivo primeiro (clica na caixa tracejada).");
      return;
    }
    if (arquivo.size > TAMANHO_MAX_MB * 1024 * 1024) {
      setErroDialog(
        `Esse arquivo passa de ${TAMANHO_MAX_MB} MB — limite por arquivo no plano gratuito.`
      );
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setErroDialog(
        "Modo demonstração: uploads precisam do banco configurado."
      );
      return;
    }

    setEnviando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setEnviando(false);
      setErroDialog("Sua sessão caiu. Entre de novo e repita o envio.");
      return;
    }

    const nomeFinal = nome.trim() || arquivo.name;
    const caminho = `${user.id}/${Date.now()}-${sanitizarNome(arquivo.name)}`;

    const { error: erroUpload } = await supabase.storage
      .from(BALDE)
      .upload(caminho, arquivo, { cacheControl: "3600", upsert: false });
    if (erroUpload) {
      setEnviando(false);
      setErroDialog(
        `Não consegui enviar o arquivo. Detalhe técnico: ${erroUpload.message}`
      );
      return;
    }

    const etiquetas = etiquetasInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const { data: linha, error: erroBanco } = await supabase
      .from("assets")
      .insert({
        user_id: user.id,
        name: nomeFinal,
        category: categoriaSel,
        client_name: clienteSel === "Sem cliente" ? null : clienteSel,
        format: extensaoDe(arquivo.name).toUpperCase(),
        size_bytes: arquivo.size,
        tags: etiquetas,
        storage_path: caminho,
      })
      .select(COLUNAS)
      .single();

    setEnviando(false);

    if (erroBanco || !linha) {
      setErroDialog(
        `O arquivo subiu, mas não consegui registrar na biblioteca. Detalhe técnico: ${
          erroBanco?.message ?? "o banco não devolveu a linha registrada"
        }`
      );
      return;
    }

    const nova = midiaDaLinha(linha as LinhaMidia);
    setMidias((atual) => [nova, ...atual]);
    if (nova.ehImagem) {
      void coletarUrlsAssinadas(supabase, [caminho]).then((mapa) =>
        setUrlsAssinadas((atual) => ({ ...atual, ...mapa }))
      );
    }

    setArquivo(null);
    setNome("");
    setEtiquetasInput("");
    setCategoriaSel("Video Ads");
    setClienteSel("Sem cliente");
    setDialogOpen(false);
  }

  async function handleBaixar(midia: MidiaReal) {
    if (!midia.caminho) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setErroAcao(null);
    setOcupandoId(midia.id);
    const { data, error } = await supabase.storage
      .from(BALDE)
      .createSignedUrl(midia.caminho, 600);
    setOcupandoId(null);
    if (error || !data?.signedUrl) {
      setErroAcao(
        `Não consegui abrir "${midia.nome}". Detalhe técnico: ${
          error?.message ?? "o cofre devolveu um link vazio"
        }`
      );
      return;
    }
    // Âncora invisível: abre/baixa sem trombar no bloqueador de pop-up
    const ancora = document.createElement("a");
    ancora.href = data.signedUrl;
    ancora.target = "_blank";
    ancora.rel = "noopener";
    ancora.download = midia.nome;
    document.body.appendChild(ancora);
    ancora.click();
    ancora.remove();
  }

  async function handleExcluir(midia: MidiaReal) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setErroAcao(null);
    setOcupandoId(midia.id);
    if (midia.caminho) {
      const { error: erroNuvem } = await supabase.storage
        .from(BALDE)
        .remove([midia.caminho]);
      if (erroNuvem) {
        setOcupandoId(null);
        setErroAcao(
          `Não consegui apagar "${midia.nome}" da nuvem. Detalhe técnico: ${erroNuvem.message}`
        );
        return;
      }
    }
    const { error: erroBanco } = await supabase
      .from("assets")
      .delete()
      .eq("id", midia.id);
    setOcupandoId(null);
    if (erroBanco) {
      setErroAcao(
        `O arquivo saiu da nuvem, mas a linha do cofre resistiu. Detalhe técnico: ${erroBanco.message}`
      );
      return;
    }
    setMidias((atual) => atual.filter((m) => m.id !== midia.id));
  }

  // ---------- Carregamento ----------
  if (carregando) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Carregando mídias">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-white/10" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {["s1", "s2", "s3", "s4"].map((chave) => (
            <div key={chave} className="h-20 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {["c1", "c2", "c3", "c4"].map((chave) => (
            <div key={chave} className="h-56 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Mídias"
        badge={modoDemo ? "Modo demonstração" : "Nuvem privada"}
        description="Biblioteca de arquivos de produção da agência — salva na sua nuvem privada."
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload /> Enviar Mídia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar mídia</DialogTitle>
              <DialogDescription>
                O arquivo vai pra sua pasta privada na nuvem e aparece aqui na
                biblioteca.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleEnviar}>
              <label
                htmlFor="asset-file"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-[rgba(255,255,255,0.02)] px-4 py-8 text-center transition-colors hover:border-[rgba(255,255,255,0.16)]"
              >
                <Upload className="size-6 text-muted-foreground" />
                {arquivo ? (
                  <>
                    <p className="mt-2 text-sm font-medium">{arquivo.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatarTamanho(arquivo.size)} · clique para trocar
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-sm font-medium">
                      Clique para escolher o arquivo
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      MP4, MOV, PNG, JPG ou GIF · até {TAMANHO_MAX_MB} MB
                    </p>
                  </>
                )}
              </label>
              <input
                id="asset-file"
                type="file"
                accept="video/*,image/*"
                className="hidden"
                onChange={(event) => {
                  const escolhido = event.target.files?.[0] ?? null;
                  setArquivo(escolhido);
                  if (escolhido && !nome.trim()) setNome(escolhido.name);
                }}
              />

              <div>
                <label htmlFor="asset-name" className={fieldLabel}>
                  Nome do arquivo
                </label>
                <Input
                  id="asset-name"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Ex.: Hook_04_UGC_Verao.mp4"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="asset-client" className={fieldLabel}>
                    Cliente
                  </label>
                  <Select value={clienteSel} onValueChange={setClienteSel}>
                    <SelectTrigger id="asset-client" aria-label="Selecionar cliente">
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
                  <label htmlFor="asset-category" className={fieldLabel}>
                    Categoria
                  </label>
                  <Select
                    value={categoriaSel}
                    onValueChange={(valor) =>
                      setCategoriaSel(valor as AssetCategory)
                    }
                  >
                    <SelectTrigger
                      id="asset-category"
                      aria-label="Selecionar categoria"
                    >
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
              </div>

              <div>
                <label htmlFor="asset-tags" className={fieldLabel}>
                  Etiquetas <span className="text-muted-foreground/60">(separadas por vírgula)</span>
                </label>
                <Input
                  id="asset-tags"
                  value={etiquetasInput}
                  onChange={(event) => setEtiquetasInput(event.target.value)}
                  placeholder="Hook, Vertical, TikTok"
                />
              </div>

              {erroDialog && (
                <p role="alert" className="text-sm text-red-400">
                  {erroDialog}
                </p>
              )}

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={enviando}>
                  {enviando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
                    </>
                  ) : (
                    "Enviar para biblioteca"
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
                <p className="truncate text-xs text-muted-foreground">
                  {stat.label}
                </p>
                <p className="truncate text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, cliente ou etiqueta..."
                aria-label="Buscar mídias"
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {filtrosCategoria.map((option) => {
                const count =
                  option.valor === "Todas"
                    ? midias.length
                    : midias.filter((item) => item.categoria === option.valor)
                        .length;
                const active = category === option.valor;
                return (
                  <button
                    key={option.valor}
                    type="button"
                    onClick={() => setCategory(option.valor)}
                    aria-pressed={active}
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                      active
                        ? "border-primary/40 bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:border-[rgba(255,255,255,0.16)] hover:text-foreground"
                    )}
                  >
                    {option.rotulo}
                    <span
                      className={cn(
                        "rounded-full px-1.5 text-[10px]",
                        active ? "bg-primary/20" : "bg-muted"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <Select value={clientFiltro} onValueChange={setClientFiltro}>
              <SelectTrigger
                aria-label="Filtrar por cliente"
                className="w-full xl:w-[220px]"
              >
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((midia) => {
            const config =
              categoryConfig[midia.categoria as AssetCategory] ??
              categoryConfig["Video Ads"];
            const previewUrl = midia.caminho
              ? urlsAssinadas[midia.caminho]
              : undefined;
            const ocupado = ocupandoId === midia.id;
            return (
              <Card key={midia.id} className="card-glow overflow-hidden">
                <div
                  className={cn(
                    "relative flex aspect-video items-center justify-center bg-gradient-to-br",
                    config.gradient
                  )}
                >
                  {midia.ehImagem && previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt={midia.nome}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : config.isVideo ? (
                    <div className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm">
                      <Play className="ml-0.5 size-4 fill-white text-white" />
                    </div>
                  ) : (
                    <div className="flex size-11 items-center justify-center rounded-xl border border-white/20 bg-black/30 backdrop-blur-sm">
                      <ImageIcon className="size-5 text-white" />
                    </div>
                  )}
                  <Badge
                    variant="outline"
                    className="absolute top-2 left-2 bg-black/40"
                  >
                    {midia.formato}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 bg-black/40 text-white"
                  >
                    {midia.rotuloTamanho}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <p className="truncate text-sm font-medium" title={midia.nome}>
                    {midia.nome}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="size-3" />
                      {rotuloCategoria(midia.categoria) && (midia.cliente || "Sem cliente")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {midia.dataCurta}
                    </span>
                  </div>
                  {midia.etiquetas.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {midia.etiquetas.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => void handleBaixar(midia)}
                      disabled={!midia.caminho || ocupado}
                    >
                      {ocupado ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Abrindo…
                        </>
                      ) : (
                        <>
                          <Download />
                          Baixar arquivo
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Excluir ${midia.nome}`}
                      onClick={() => void handleExcluir(midia)}
                      disabled={ocupado}
                      className="size-8 shrink-0 text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="size-4" />
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
                <p className="mt-3 font-medium">Nenhuma mídia encontrada</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajuste a busca ou os filtros para ver resultados.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearch("");
                    setCategory("Todas");
                    setClientFiltro("Todos");
                  }}
                >
                  Limpar filtros
                </Button>
              </>
            ) : (
              <>
                <p className="mt-3 font-medium">Sua biblioteca está vazia</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Envie a primeira mídia do seu portfólio — ela fica guardada
                  na sua nuvem privada e aparece aqui.
                </p>
                <Button
                  size="sm"
                  className="mt-4"
                  onClick={() => setDialogOpen(true)}
                >
                  <Upload /> Enviar primeira mídia
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}