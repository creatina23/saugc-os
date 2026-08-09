"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Loader2, Plus, Search, Trash2, Users } from "lucide-react";
import type { Client } from "@/types";
import { clientesService } from "@/lib/services";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function hojeCurto(): string {
  const d = new Date();
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

function iniciaisDe(texto: string): string {
  const partes = texto.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.charAt(0) ?? "C";
  const segunda = partes[1]?.charAt(0) ?? partes[0]?.charAt(1) ?? "L";
  return (primeira + segunda).toUpperCase();
}

function varianteStatus(status: string) {
  switch (status.toLowerCase()) {
    case "ativo":
      return "success" as const;
    case "em onboarding":
      return "info" as const;
    case "pausado":
      return "warning" as const;
    case "churn":
    case "cancelado":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

// Linha como vem do Supabase (snake_case) → Client do app (camelCase)
interface ClienteRow {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  tier: string;
  status: string;
  mrr: number | string;
  logo_initials: string;
  since: string;
}

function paraCliente(linha: ClienteRow): Client {
  return {
    id: linha.id,
    name: linha.name,
    company: linha.company,
    email: linha.email,
    phone: linha.phone,
    tier: linha.tier as Client["tier"],
    status: linha.status as Client["status"],
    mrr: Number(linha.mrr),
    logoInitials: linha.logo_initials,
    since: linha.since,
  };
}

const LEGADO_KEY = "anuncia:clientes-extras";

// Busca no banco: migra legado do localStorage (1x) + lê a tabela clients
async function coletarClientes(
  supabase: SupabaseClient,
): Promise<{ clientes: Client[]; erro: string | null }> {
  try {
    const legadoBruto = localStorage.getItem(LEGADO_KEY);
    if (legadoBruto) {
      const legado = JSON.parse(legadoBruto) as Client[];
      if (Array.isArray(legado) && legado.length > 0) {
        await supabase.from("clients").insert(
          legado.map((c) => ({
            name: c.name,
            company: c.company,
            email: c.email,
            phone: c.phone,
            tier: c.tier,
            status: c.status,
            mrr: c.mrr,
            logo_initials: c.logoInitials,
            since: c.since,
          })),
        );
        localStorage.removeItem(LEGADO_KEY);
        toast("Clientes migrados", {
          description: `${legado.length} cliente(s) do armazenamento local foram para o banco.`,
          type: "success",
        });
      } else {
        localStorage.removeItem(LEGADO_KEY);
      }
    }
  } catch {
    // migração é best-effort; segue para a leitura
  }

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { clientes: [], erro: error.message };
  }
  return { clientes: ((data ?? []) as ClienteRow[]).map(paraCliente), erro: null };
}

export function ClientesView() {
  const supabase = useMemo(() => getSupabaseBrowser(), []);
  const [clientes, setClientes] = useState<Client[]>([]);
  const [carregando, setCarregando] = useState(() => Boolean(supabase));
  const [busca, setBusca] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [emailForm, setEmailForm] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tier, setTier] = useState("Pro");
  const [clienteParaExcluir, setClienteParaExcluir] = useState<Client | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const modoDemo = !supabase;
  const listaVisivel = modoDemo ? clientesService.list() : clientes;

  // Effect no padrão permitido: dispara a promessa; setState só dentro de callback
  useEffect(() => {
    if (!supabase) return;
    let ativo = true;

    coletarClientes(supabase).then((resultado) => {
      if (!ativo) return;
      if (resultado.erro) {
        toast("Não foi possível carregar os clientes", {
          description: `Detalhe técnico: ${resultado.erro}`,
          type: "error",
        });
        setClientes([]);
      } else {
        setClientes(resultado.clientes);
      }
      setCarregando(false);
    });

    return () => {
      ativo = false;
    };
  }, [supabase]);

  const filtrados = listaVisivel.filter((c) => {
    const q = busca.trim().toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const totalAtivos = listaVisivel.filter((c) => c.status === "Ativo").length;
  const mrrTotal = listaVisivel.reduce((acc, c) => acc + c.mrr, 0);

  async function handleSalvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setSalvando(true);

    const novo = {
      name: nome.trim(),
      company: empresa.trim(),
      email: emailForm.trim(),
      phone: telefone.trim(),
      tier,
      status: "Em onboarding",
      mrr: 0,
      logo_initials: iniciaisDe(empresa || nome),
      since: hojeCurto(),
    };

    const { error } = await supabase.from("clients").insert(novo);
    setSalvando(false);

    if (error) {
      toast("Não consegui cadastrar o cliente", {
        description: `Detalhe técnico: ${error.message}`,
        type: "error",
      });
      return;
    }

    toast("Cliente cadastrado 🎉", {
      description: `${novo.name} entrou em onboarding.`,
      type: "success",
    });
    setDialogAberto(false);
    setNome("");
    setEmpresa("");
    setEmailForm("");
    setTelefone("");
    setTier("Pro");

    const resultado = await coletarClientes(supabase);
    if (!resultado.erro) {
      setClientes(resultado.clientes);
    }
  }

  function handlePedirExclusao(cliente: Client) {
    if (modoDemo) {
      toast("Modo demonstração", {
        description:
          "Os dados de exemplo não podem ser excluídos. Entre com sua conta real para gerenciar seus clientes.",
        type: "error",
      });
      return;
    }
    setClienteParaExcluir(cliente);
  }

  async function handleExcluir() {
    if (!clienteParaExcluir || !supabase) return;
    const alvo = clienteParaExcluir;
    setExcluindo(true);

    const { error } = await supabase.from("clients").delete().eq("id", alvo.id);
    setExcluindo(false);

    if (error) {
      toast("Não consegui excluir o cliente", {
        description: `Detalhe técnico: ${error.message}`,
        type: "error",
      });
      return;
    }

    setClientes((lista) => lista.filter((c) => c.id !== alvo.id));
    setClienteParaExcluir(null);
    toast("Cliente excluído 🗑️", {
      description: `${alvo.name} saiu da sua operação pra sempre.`,
      type: "success",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            {modoDemo
              ? "Modo demonstração — configure o Supabase para gravar de verdade."
              : "Os clientes da sua operação, num lugar só."}
          </p>
        </div>

        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button disabled={modoDemo}>
              <Plus />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar cliente</DialogTitle>
              <DialogDescription>
                Entra com status “Em onboarding” e Receita do mês R$ 0 — você ajusta depois.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSalvar} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="nome" className="text-sm font-medium">
                  Nome do responsável *
                </label>
                <Input
                  id="nome"
                  required
                  placeholder="Ana Souza"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="empresa" className="text-sm font-medium">
                  Empresa *
                </label>
                <Input
                  id="empresa"
                  required
                  placeholder="Clínica Sorriso"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="emailCli" className="text-sm font-medium">
                    E-mail
                  </label>
                  <Input
                    id="emailCli"
                    type="email"
                    placeholder="ana@clinica.com"
                    value={emailForm}
                    onChange={(e) => setEmailForm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="telCli" className="text-sm font-medium">
                    Telefone
                  </label>
                  <Input
                    id="telCli"
                    placeholder="(24) 99999-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="tierCli" className="text-sm font-medium">
                  Plano
                </label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger id="tierCli">
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Starter">Starter</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={salvando}>
                  {salvando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Salvando…
                    </>
                  ) : (
                    "Cadastrar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Confirmação de exclusão — nada de apagar num clique só */}
      <Dialog
        open={clienteParaExcluir !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setClienteParaExcluir(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir cliente?</DialogTitle>
            <DialogDescription>
              Essa ação não tem volta: {clienteParaExcluir?.name} (
              {clienteParaExcluir?.company}) sai do banco pra sempre. Os anúncios e briefings que
              citam esse cliente continuam salvos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="outline"
              onClick={handleExcluir}
              disabled={excluindo}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              {excluindo ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Excluindo…
                </>
              ) : (
                <>
                  <Trash2 /> Sim, excluir pra sempre
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(31,41,55,0.7)] p-4">
          <p className="text-xs text-muted-foreground">Total de clientes</p>
          <p className="mt-1 text-2xl font-bold text-white">{listaVisivel.length}</p>
        </div>
        <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(31,41,55,0.7)] p-4">
          <p className="text-xs text-muted-foreground">Ativos</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{totalAtivos}</p>
        </div>
        <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(31,41,55,0.7)] p-4">
          <p className="text-xs text-muted-foreground">Receita do mês somado</p>
          <p className="mt-1 text-2xl font-bold text-blue-400">{moeda.format(mrrTotal)}</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Buscar cliente"
          placeholder="Buscar por nome, empresa ou e-mail…"
          className="pl-9"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {carregando && !modoDemo ? (
        <div className="space-y-3" aria-busy="true" aria-label="Carregando clientes">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <EmptyState
          icon={Users}
          title={busca ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
          description={
            busca
              ? `Nada encontrado para "${busca}". Tente outro termo.`
              : "Cadastre seu primeiro cliente e ele fica salvo no banco pra sempre."
          }
          action={
            !modoDemo && !busca ? (
              <Button onClick={() => setDialogAberto(true)}>
                <Plus /> Cadastrar primeiro cliente
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">E-mail</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Plano</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Receita do mês</th>
                <th className="px-2 py-3 text-right font-medium">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="border-b border-[rgba(255,255,255,0.05)] transition-colors hover:bg-[rgba(255,255,255,0.03)]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback>{cliente.logoInitials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{cliente.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {cliente.company} · desde {cliente.since}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {cliente.email || "—"}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <Badge variant="secondary">{cliente.tier}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={varianteStatus(cliente.status)}>{cliente.status}</Badge>
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right font-medium",
                      cliente.mrr > 0 ? "text-white" : "text-muted-foreground",
                    )}
                  >
                    {moeda.format(cliente.mrr)}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <button
                      type="button"
                      aria-label={`Excluir ${cliente.name}`}
                      title={`Excluir ${cliente.name}`}
                      onClick={() => handlePedirExclusao(cliente)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}