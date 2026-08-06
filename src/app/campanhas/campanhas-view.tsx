"use client";

// ------------------------------------------------------------------
// Campanhas — gestão REAL (tabela campaigns no Supabase).
// • CRUD completo: criar, editar (Detalhes), excluir, filtrar.
// • Métricas no DNA (impressões, cliques, conversões, receita, meta de
//   ROAS) — casa pronta pro "Waze do tráfego" (v3.0).
// • CTR calculado (cliques/impressões), ROAS calculado (receita/investido)
//   com semáforo contra a meta.
// • Erros confessam "Detalhe técnico:" — nunca falha em silêncio.
// • Sem banco configurado → modo demonstração (mock, selo visível).
// ------------------------------------------------------------------

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Building2,
  ChevronRight,
  CreditCard,
  Eye,
  Loader2,
  Percent,
  Plus,
  Search,
  SearchX,
  Trash2,
  Wallet,
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
import { formatBRL, formatCompact } from "@/lib/format";
import { campaigns, clients } from "@/lib/mock-data";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { CampaignPlatform, CampaignStatus } from "@/types";


// ---------- Regras fixas ----------

const statusFilters = ["Todas", "Ativa", "Pausada", "Rascunho"] as const;
const platformOptions = ["Todas", "Meta Ads", "Google Ads", "TikTok"] as const;
const estagioOptions = ["Teste", "Otimização", "Escala"] as const;

const platformBadge: Record<CampaignPlatform, "default" | "success" | "violet"> = {
  "Meta Ads": "default",
  "Google Ads": "success",
  TikTok: "violet",
};

const statusBadge: Record<CampaignStatus, "success" | "warning" | "secondary"> = {
  Ativa: "success",
  Pausada: "warning",
  Rascunho: "secondary",
};

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";


// ---------- Tipos e ponte com o banco ----------

type CampanhaReal = {
  id: string;
  nome: string;
  cliente: string;
  plataforma: CampaignPlatform;
  status: CampaignStatus;
  estagio: string;
  objetivo: string;
  orcamento: number;
  investido: number;
  impressoes: number;
  cliques: number;
  conversoes: number;
  receita: number;
  roasMeta: number | null;
};

type LinhaCampanha = {
  id: string;
  name: string | null;
  client_name: string | null;
  platform: string | null;
  status: string | null;
  stage: string | null;
  goal: string | null;
  budget: number | string | null;
  spend: number | string | null;
  impressions: number | string | null;
  clicks: number | string | null;
  conversions: number | string | null;
  revenue: number | string | null;
  roas_meta: number | string | null;
  created_at: string;
};

type MockCampanha = (typeof campaigns)[number];

const COLUNAS =
  "id, name, client_name, platform, status, stage, goal, budget, spend, impressions, clicks, conversions, revenue, roas_meta, created_at";

function numero(valor: number | string | null): number {
  const n = Number(valor ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function normalizaPlataforma(valor: string | null): CampaignPlatform {
  return valor === "Google Ads" || valor === "TikTok" ? valor : "Meta Ads";
}

function normalizaStatus(valor: string | null): CampaignStatus {
  return valor === "Ativa" || valor === "Pausada" ? valor : "Rascunho";
}

function campanhaDaLinha(linha: LinhaCampanha): CampanhaReal {
  return {
    id: linha.id,
    nome: linha.name ?? "Sem nome",
    cliente: linha.client_name ?? "",
    plataforma: normalizaPlataforma(linha.platform),
    status: normalizaStatus(linha.status),
    estagio: linha.stage ?? "Teste",
    objetivo: linha.goal ?? "",
    orcamento: numero(linha.budget),
    investido: numero(linha.spend),
    impressoes: numero(linha.impressions),
    cliques: numero(linha.clicks),
    conversoes: numero(linha.conversions),
    receita: numero(linha.revenue),
    roasMeta: linha.roas_meta === null ? null : numero(linha.roas_meta),
  };
}

// Mock (modo demonstração) — CTR do mock vira cliques estimados
function demoParaCampanha(item: MockCampanha): CampanhaReal {
  const cliquesEstimados = Math.round((item.impressions * item.ctr) / 100);
  return {
    id: item.id,
    nome: item.name,
    cliente: item.client,
    plataforma: normalizaPlataforma(item.platform),
    status: normalizaStatus(item.status),
    estagio: item.stage ?? "Teste",
    objetivo: "",
    orcamento: numero(item.budget),
    investido: numero(item.spend),
    impressoes: numero(item.impressions),
    cliques: cliquesEstimados,
    conversoes: 0,
    receita: 0,
    roasMeta: null,
  };
}

async function coletarTudo(): Promise<{
  campanhas: CampanhaReal[];
  clientes: string[];
} | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;

  const [resCampanhas, resClientes] = await Promise.all([
    supabase.from("campaigns").select(COLUNAS).order("created_at", { ascending: false }),
    supabase.from("clients").select("company").order("created_at", { ascending: false }),
  ]);

  if (resCampanhas.error) return null; // cai no modo demo; selo fica visível

  return {
    campanhas: ((resCampanhas.data ?? []) as LinhaCampanha[]).map(campanhaDaLinha),
    clientes: ((resClientes.data ?? []) as { company: string | null }[])
      .map((linha) => linha.company ?? "")
      .filter(Boolean),
  };
}


// ---------- Formatadores ----------

function formatarPct(valor: number): string {
  return `${valor.toFixed(1).replace(".", ",")}%`;
}

function ctrDe(c: CampanhaReal): number {
  return c.impressoes > 0 ? (c.cliques / c.impressoes) * 100 : 0;
}

function roasDe(c: CampanhaReal): number {
  return c.investido > 0 ? c.receita / c.investido : 0;
}

// "45.000,50" / "45000" / "45000.5" → número
function toNumero(texto: string): number {
  const limpo = texto.trim().replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(limpo);
  return Number.isFinite(n) ? n : 0;
}


// ---------- Componente ----------

export function CampanhasView() {
  const [lista, setLista] = useState<CampanhaReal[]>([]);
  const [clientes, setClientes] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modoDemo, setModoDemo] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("Todas");
  const [platform, setPlatform] = useState<string>("Todas");

  // Dialog: cria OU edita (editingId = qual campanha abriu)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nomeF, setNomeF] = useState("");
  const [clienteSel, setClienteSel] = useState("Sem cliente");
  const [plataformaSel, setPlataformaSel] = useState<CampaignPlatform>("Meta Ads");
  const [statusSel, setStatusSel] = useState<CampaignStatus>("Rascunho");
  const [estagioSel, setEstagioSel] = useState<string>("Teste");
  const [objetivoF, setObjetivoF] = useState("");
  const [orcamentoF, setOrcamentoF] = useState("");
  const [roasMetaF, setRoasMetaF] = useState("");
  const [investidoF, setInvestidoF] = useState("");
  const [impressoesF, setImpressoesF] = useState("");
  const [cliquesF, setCliquesF] = useState("");
  const [conversoesF, setConversoesF] = useState("");
  const [receitaF, setReceitaF] = useState("");
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
        setLista(campaigns.map(demoParaCampanha));
        setClientes(clients.map((c) => c.company));
      } else {
        setLista(resultado.campanhas);
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
      lista.filter((campaign) => {
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          campaign.nome.toLowerCase().includes(query) ||
          campaign.cliente.toLowerCase().includes(query);
        const matchesStatus = status === "Todas" || campaign.status === status;
        const matchesPlatform =
          platform === "Todas" || campaign.plataforma === platform;
        return matchesSearch && matchesStatus && matchesPlatform;
      }),
    [lista, search, status, platform]
  );

  const temFiltroAtivo =
    search.trim() !== "" || status !== "Todas" || platform !== "Todas";

  const totalBudget = lista.reduce((acc, c) => acc + c.orcamento, 0);
  const totalSpend = lista.reduce((acc, c) => acc + c.investido, 0);
  const totalImpressions = lista.reduce((acc, c) => acc + c.impressoes, 0);
  const totalClicks = lista.reduce((acc, c) => acc + c.cliques, 0);
  const ctrGeral = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  const stats = [
    { label: "Orçamento total", value: formatBRL(totalBudget), icon: Wallet, tone: "bg-primary/15 text-primary" },
    { label: "Investido", value: formatBRL(totalSpend), icon: CreditCard, tone: "bg-warning/15 text-warning" },
    { label: "Impressões", value: formatCompact(totalImpressions), icon: Eye, tone: "bg-ai/15 text-ai" },
    { label: "CTR médio", value: formatarPct(ctrGeral), icon: Percent, tone: "bg-success/15 text-success" },
  ];

  function limparFormulario() {
    setEditingId(null);
    setNomeF("");
    setClienteSel("Sem cliente");
    setPlataformaSel("Meta Ads");
    setStatusSel("Rascunho");
    setEstagioSel("Teste");
    setObjetivoF("");
    setOrcamentoF("");
    setRoasMetaF("");
    setInvestidoF("");
    setImpressoesF("");
    setCliquesF("");
    setConversoesF("");
    setReceitaF("");
    setErroDialog(null);
  }

  function abrirNova() {
    limparFormulario();
    setDialogOpen(true);
  }

  function abrirEdicao(c: CampanhaReal) {
    setEditingId(c.id);
    setNomeF(c.nome);
    setClienteSel(c.cliente || "Sem cliente");
    setPlataformaSel(c.plataforma);
    setStatusSel(c.status);
    setEstagioSel(c.estagio);
    setObjetivoF(c.objetivo);
    setOrcamentoF(c.orcamento > 0 ? String(c.orcamento) : "");
    setRoasMetaF(c.roasMeta !== null ? String(c.roasMeta) : "");
    setInvestidoF(c.investido > 0 ? String(c.investido) : "");
    setImpressoesF(c.impressoes > 0 ? String(c.impressoes) : "");
    setCliquesF(c.cliques > 0 ? String(c.cliques) : "");
    setConversoesF(c.conversoes > 0 ? String(c.conversoes) : "");
    setReceitaF(c.receita > 0 ? String(c.receita) : "");
    setErroDialog(null);
    setDialogOpen(true);
  }

  function montarRegistro(userId: string) {
    return {
      user_id: userId,
      name: nomeF.trim() || "Campanha sem nome",
      client_name: clienteSel === "Sem cliente" ? null : clienteSel,
      platform: plataformaSel,
      status: statusSel,
      stage: estagioSel,
      goal: objetivoF.trim() || null,
      budget: toNumero(orcamentoF),
      spend: toNumero(investidoF),
      impressions: Math.round(toNumero(impressoesF)),
      clicks: Math.round(toNumero(cliquesF)),
      conversions: Math.round(toNumero(conversoesF)),
      revenue: toNumero(receitaF),
      roas_meta: roasMetaF.trim() === "" ? null : toNumero(roasMetaF),
    };
  }

  async function handleSalvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroDialog(null);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setErroDialog(
        "Modo demonstração: para guardar campanhas de verdade, o banco precisa estar configurado."
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
        .from("campaigns")
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
      const atualizada = campanhaDaLinha(linha as LinhaCampanha);
      setLista((atual) =>
        atual.map((c) => (c.id === atualizada.id ? atualizada : c))
      );
    } else {
      const { data: linha, error } = await supabase
        .from("campaigns")
        .insert(registro)
        .select(COLUNAS)
        .single();
      setSalvando(false);
      if (error || !linha) {
        setErroDialog(
          `Não consegui registrar a campanha. Detalhe técnico: ${error?.message ?? "o banco não devolveu a linha"}`
        );
        return;
      }
      setLista((atual) => [campanhaDaLinha(linha as LinhaCampanha), ...atual]);
    }

    setDialogOpen(false);
    limparFormulario();
  }

  async function handleExcluir(c: CampanhaReal) {
    if (!window.confirm(`Excluir a campanha "${c.nome}"? Essa ação não tem volta.`)) {
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setErroDialog("Modo demonstração: exclusão precisa do banco configurado.");
      return;
    }
    setExcluindo(true);
    const { error } = await supabase.from("campaigns").delete().eq("id", c.id);
    setExcluindo(false);
    if (error) {
      setErroDialog(
        `Não consegui excluir. Detalhe técnico: ${error.message}`
      );
      return;
    }
    setLista((atual) => atual.filter((item) => item.id !== c.id));
    setDialogOpen(false);
    limparFormulario();
  }

  // ---------- Carregamento ----------
  if (carregando) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Carregando campanhas">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-white/10" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {["s1", "s2", "s3", "s4"].map((chave) => (
            <div key={chave} className="h-20 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {["c1", "c2", "c3"].map((chave) => (
            <div key={chave} className="h-72 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Campanhas"
        badge={modoDemo ? "Modo demonstração" : undefined}
        description="Campanhas multicanal de performance da agência."
      >
        <Dialog
          open={dialogOpen}
          onOpenChange={(aberto) => {
            setDialogOpen(aberto);
            if (!aberto) limparFormulario();
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={abrirNova}>
              <Plus /> Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Detalhes da campanha" : "Criar campanha"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Ajuste a configuração e atualize os resultados."
                  : "Configure uma nova campanha de performance."}
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSalvar}>
              <div>
                <label htmlFor="campaign-name" className={fieldLabel}>
                  Nome da campanha
                </label>
                <Input
                  id="campaign-name"
                  value={nomeF}
                  onChange={(event) => setNomeF(event.target.value)}
                  placeholder="Ex.: Verão Glow — UGC Creators"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="campaign-client" className={fieldLabel}>
                    Cliente
                  </label>
                  <Select value={clienteSel} onValueChange={setClienteSel}>
                    <SelectTrigger id="campaign-client" aria-label="Selecionar cliente">
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
                  <label htmlFor="campaign-platform" className={fieldLabel}>
                    Plataforma
                  </label>
                  <Select
                    value={plataformaSel}
                    onValueChange={(valor) =>
                      setPlataformaSel(valor as CampaignPlatform)
                    }
                  >
                    <SelectTrigger id="campaign-platform" aria-label="Selecionar plataforma">
                      <SelectValue placeholder="Selecione a plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Meta Ads">Meta Ads</SelectItem>
                      <SelectItem value="Google Ads">Google Ads</SelectItem>
                      <SelectItem value="TikTok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="campaign-status" className={fieldLabel}>
                    Status
                  </label>
                  <Select
                    value={statusSel}
                    onValueChange={(valor) => setStatusSel(valor as CampaignStatus)}
                  >
                    <SelectTrigger id="campaign-status" aria-label="Selecionar status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativa">Ativa</SelectItem>
                      <SelectItem value="Pausada">Pausada</SelectItem>
                      <SelectItem value="Rascunho">Rascunho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="campaign-stage" className={fieldLabel}>
                    Estágio
                  </label>
                  <Select value={estagioSel} onValueChange={setEstagioSel}>
                    <SelectTrigger id="campaign-stage" aria-label="Selecionar estágio">
                      <SelectValue placeholder="Selecione o estágio" />
                    </SelectTrigger>
                    <SelectContent>
                      {estagioOptions.map((opcao) => (
                        <SelectItem key={opcao} value={opcao}>
                          {opcao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="campaign-budget" className={fieldLabel}>
                    Orçamento mensal (R$)
                  </label>
                  <Input
                    id="campaign-budget"
                    inputMode="decimal"
                    value={orcamentoF}
                    onChange={(event) => setOrcamentoF(event.target.value)}
                    placeholder="45000"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="campaign-goal" className={fieldLabel}>
                    Objetivo
                  </label>
                  <Input
                    id="campaign-goal"
                    value={objetivoF}
                    onChange={(event) => setObjetivoF(event.target.value)}
                    placeholder="Ex.: Escala, Otimização"
                  />
                </div>
                <div>
                  <label htmlFor="campaign-roas-meta" className={fieldLabel}>
                    Meta de ROAS
                  </label>
                  <Input
                    id="campaign-roas-meta"
                    inputMode="decimal"
                    value={roasMetaF}
                    onChange={(event) => setRoasMetaF(event.target.value)}
                    placeholder="Ex.: 2,5"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-[rgba(255,255,255,0.02)] p-4">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Resultados até agora
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Traga os números do Gerenciador de Anúncios — são eles que
                  alimentam os indicadores do painel.
                </p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="campaign-spend" className={fieldLabel}>
                      Investido (R$)
                    </label>
                    <Input
                      id="campaign-spend"
                      inputMode="decimal"
                      value={investidoF}
                      onChange={(event) => setInvestidoF(event.target.value)}
                      placeholder="12500"
                    />
                  </div>
                  <div>
                    <label htmlFor="campaign-impressions" className={fieldLabel}>
                      Impressões
                    </label>
                    <Input
                      id="campaign-impressions"
                      inputMode="numeric"
                      value={impressoesF}
                      onChange={(event) => setImpressoesF(event.target.value)}
                      placeholder="800000"
                    />
                  </div>
                  <div>
                    <label htmlFor="campaign-clicks" className={fieldLabel}>
                      Cliques
                    </label>
                    <Input
                      id="campaign-clicks"
                      inputMode="numeric"
                      value={cliquesF}
                      onChange={(event) => setCliquesF(event.target.value)}
                      placeholder="19000"
                    />
                  </div>
                  <div>
                    <label htmlFor="campaign-conversions" className={fieldLabel}>
                      Conversões
                    </label>
                    <Input
                      id="campaign-conversions"
                      inputMode="numeric"
                      value={conversoesF}
                      onChange={(event) => setConversoesF(event.target.value)}
                      placeholder="320"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="campaign-revenue" className={fieldLabel}>
                      Receita gerada (R$)
                    </label>
                    <Input
                      id="campaign-revenue"
                      inputMode="decimal"
                      value={receitaF}
                      onChange={(event) => setReceitaF(event.target.value)}
                      placeholder="38000"
                    />
                  </div>
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
                    "Salvar campanha"
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
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por campanha ou cliente..."
                aria-label="Buscar campanhas"
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {statusFilters.map((option) => {
                const count =
                  option === "Todas"
                    ? lista.length
                    : lista.filter((campaign) => campaign.status === option).length;
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
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger aria-label="Filtrar por plataforma" className="w-full xl:w-[200px]">
                <SelectValue placeholder="Plataforma" />
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "Todas" ? "Todas as plataformas" : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {erroAcao && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {erroAcao}
        </p>
      )}

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((campaign) => {
            const usage =
              campaign.orcamento > 0
                ? Math.min(100, Math.round((campaign.investido / campaign.orcamento) * 100))
                : 0;
            const ctr = ctrDe(campaign);
            const roas = roasDe(campaign);
            const roasVariant: "success" | "warning" | "destructive" =
              campaign.roasMeta !== null && roas >= campaign.roasMeta
                ? "success"
                : campaign.roasMeta !== null && roas >= campaign.roasMeta * 0.7
                  ? "warning"
                  : "destructive";
            return (
              <Card key={campaign.id} className="card-glow flex flex-col">
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={platformBadge[campaign.plataforma]}>
                      {campaign.plataforma}
                    </Badge>
                    <Badge variant={statusBadge[campaign.status]}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <h3 className="mt-3 text-base font-semibold tracking-tight">
                    {campaign.nome}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building2 className="size-3.5" />
                    {campaign.cliente || "Sem cliente"}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Orçamento</p>
                      <p className="text-sm font-semibold">{formatBRL(campaign.orcamento)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">CTR</p>
                      <p className="text-sm font-semibold">{formatarPct(ctr)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Impressões</p>
                      <p className="text-sm font-semibold">{formatCompact(campaign.impressoes)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Investido</p>
                      <p className="text-sm font-semibold">{formatBRL(campaign.investido)}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Consumo do orçamento</span>
                      <span>{usage}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        style={{ width: `${usage}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-ai"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline">{campaign.estagio}</Badge>
                      {campaign.receita > 0 && (
                        <Badge
                          variant={roasVariant}
                          title={
                            campaign.roasMeta !== null
                              ? `Meta de ROAS: ${String(campaign.roasMeta).replace(".", ",")}`
                              : "ROAS da campanha"
                          }
                        >
                          ROAS {roas.toFixed(1).replace(".", ",")}×
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => abrirEdicao(campaign)}
                    >
                      Detalhes
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
                <p className="mt-3 font-medium">Nenhuma campanha encontrada</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajuste a busca ou os filtros para ver resultados.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearch("");
                    setStatus("Todas");
                    setPlatform("Todas");
                  }}
                >
                  Limpar filtros
                </Button>
              </>
            ) : (
              <>
                <p className="mt-3 font-medium">Nenhuma campanha por aqui ainda</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Crie a primeira campanha — os resultados que você registrar
                  viram os indicadores do painel.
                </p>
                <Button size="sm" className="mt-4" onClick={abrirNova}>
                  <Plus /> Criar primeira campanha
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}