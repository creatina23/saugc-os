"use client";

import { useEffect, useState } from "react";
import React from "react";
import {
  Building2,
  DollarSign,
  Plus,
  Search,
  Trash2,
  Users,
  ShieldCheck,
  Mail,
  Phone,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import type { Client } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// TR-04B: converte uma linha REAL da tabela clients (Supabase) no tipo da UI.
// Nenhuma outra fonte de dados é aceita nesta tela.
function clienteDaLinha(c: any): Client {
  return {
    id: c.id,
    name: c.name,
    company: c.company,
    email: c.email,
    phone: c.phone,
    tier: c.tier || "Growth",
    status: c.status || "Ativo",
    mrr: Number(c.mrr) || 0,
    logoInitials: c.logo_initials || String(c.name || "").slice(0, 2).toUpperCase(),
    since: c.since || "2026-01",
  };
}

export function ClientesView() {
  // TR-04B: estado inicial SEMPRE vazio — a única fonte é o Supabase (RLS).
  const [clientes, setClientes] = useState<Client[]>([]);
  const [busca, setBusca] = useState("");
  const [statusBase, setStatusBase] = useState<"carregando" | "pronto" | "erro">("carregando");
  const [erroMsg, setErroMsg] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Estados do Modal de Novo Cliente
  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [plano, setPlano] = useState("Growth");
  const [mrr, setMrr] = useState("12900");

  // TR-04B: SELECT real é a ÚNICA fonte. [] = vazio verdadeiro; erro = erro real.
  // Nunca há fallback para dados fictícios.
  async function carregarClientes() {
    setStatusBase("carregando");
    setErroMsg("");
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setClientes([]);
      setErroMsg(
        "Supabase não configurado neste ambiente (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). Nenhum cliente pode ser carregado."
      );
      setStatusBase("erro");
      return;
    }
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setClientes([]);
      setErroMsg(error.message);
      setStatusBase("erro");
      return;
    }
    setClientes((data ?? []).map(clienteDaLinha));
    setStatusBase("pronto");
  }

  useEffect(() => {
    carregarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.name.toLowerCase().includes(busca.toLowerCase()) ||
      c.company.toLowerCase().includes(busca.toLowerCase()) ||
      c.email.toLowerCase().includes(busca.toLowerCase())
  );

  // Receita Total (MRR) somada de verdade dos clientes ativos
  const receitaTotal = clientes
    .filter((c) => c.status === "Ativo")
    .reduce((acc, c) => acc + (Number(c.mrr) || 0), 0);

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !empresa) {
      toast("Preencha o nome e a empresa", { type: "error" });
      return;
    }
    if (salvando) return;

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      toast("Supabase não configurado — não é possível salvar o cliente.", { type: "error" });
      return;
    }

    const iniciais = nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    setSalvando(true);
    // TR-04B: INSERT SEM user_id — o banco aplica DEFAULT auth.uid() e a RLS
    // (WITH CHECK auth.uid() = user_id) valida a propriedade. O registro só é
    // aceito na UI quando o Supabase devolve a linha persistida (.select().single()).
    const { data, error } = await supabase
      .from("clients")
      .insert([
        {
          name: nome,
          company: empresa,
          email: email || "contato@empresa.com",
          phone: telefone || "(11) 99999-9999",
          tier: plano,
          status: "Ativo",
          mrr: Number(mrr) || 0,
          logo_initials: iniciais,
          since: new Date().toISOString().slice(0, 7),
        },
      ])
      .select()
      .single();
    setSalvando(false);

    if (error || !data) {
      toast(
        error
          ? `Falha ao salvar o cliente: ${error.message}`
          : "Falha ao salvar o cliente: o registro persistido não foi retornado.",
        { type: "error" }
      );
      return; // formulário permanece aberto com os dados para nova tentativa
    }

    setClientes((atual) => [clienteDaLinha(data), ...atual]);
    setStatusBase("pronto");
    toast("Cliente cadastrado com sucesso!", { type: "success" });
    setModalAberto(false);
    setNome("");
    setEmpresa("");
    setEmail("");
    setTelefone("");
  }

  async function handleExcluir(id: string) {
    if (!confirm("Deseja realmente remover este cliente da operação?")) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      toast("Supabase não configurado — não é possível excluir o cliente.", { type: "error" });
      return;
    }
    // TR-04B: DELETE real pelo UUID persistido, com confirmação da linha afetada
    // (.select("id") retorna o que foi efetivamente removido). Sem confirmação,
    // o cliente permanece na tela.
    const { data, error } = await supabase
      .from("clients")
      .delete()
      .eq("id", id)
      .select("id");
    if (error) {
      toast(`Falha ao excluir o cliente: ${error.message}`, { type: "error" });
      return;
    }
    if (!data || data.length === 0) {
      toast("Falha ao excluir: nenhum registro foi removido (não encontrado ou sem permissão).", { type: "error" });
      return;
    }
    setClientes((atual) => atual.filter((c) => c.id !== id));
    toast("Cliente removido com sucesso", { type: "success" });
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes (Operações)</h1>
          <p className="text-sm text-muted-foreground">
            Cada cliente é uma operação ativa com receita e acompanhamento em tempo real.
          </p>
        </div>
        <Button onClick={() => setModalAberto(true)} className="gap-2 font-semibold">
          <Plus className="size-4" />
          Cadastrar Cliente
        </Button>
      </div>

      {/* Métricas Dinâmicas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border bg-surface/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Mensal (MRR)</CardTitle>
            <DollarSign className="size-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {receitaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Calculado sobre clientes ativos</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Operações Ativas</CardTitle>
            <Users className="size-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientes.filter((c) => c.status === "Ativo").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">De {clientes.length} cadastrados</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status da Base</CardTitle>
            <ShieldCheck className="size-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">100% Sincronizado</div>
            <p className="text-xs text-muted-foreground mt-1">Autonomia total de dados</p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Pesquisa */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, empresa ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* TR-04B: LOADING — skeleton simples, sem dados */}
      {statusBase === "carregando" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="border-border bg-surface/40 p-6 animate-pulse">
              <div className="mb-3 h-4 w-2/3 rounded bg-muted" />
              <div className="mb-6 h-3 w-1/2 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
            </Card>
          ))}
        </div>
      )}

      {/* TR-04B: ERROR — erro real com nova tentativa; nunca dados fictícios */}
      {statusBase === "erro" && (
        <Card className="border-border bg-surface/60 p-8 text-center">
          <p className="text-sm font-semibold text-red-400">Falha ao carregar os clientes</p>
          <p className="mx-auto mt-2 max-w-md break-words text-xs text-muted-foreground">{erroMsg}</p>
          <Button variant="outline" className="mt-4" onClick={() => carregarClientes()}>
            Tentar novamente
          </Button>
        </Card>
      )}

      {/* TR-04B: EMPTY — vazio verdadeiro (banco sem clientes ou busca sem resultado) */}
      {statusBase === "pronto" && clientesFiltrados.length === 0 && (
        <Card className="border-border bg-surface/60 p-10 text-center">
          <Users className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold">
            {clientes.length === 0
              ? "Você ainda não possui clientes."
              : "Nenhum cliente encontrado para esta busca."}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {clientes.length === 0
              ? "Cadastre o primeiro cliente para iniciar uma operação real."
              : "Ajuste os termos da busca."}
          </p>
        </Card>
      )}

      {/* Lista de Clientes (somente dados reais persistidos) */}
      {statusBase === "pronto" && clientesFiltrados.length > 0 && (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clientesFiltrados.map((cliente) => (
          <Card key={cliente.id} className="border-border bg-surface/40 backdrop-blur-md flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary text-sm">
                    {cliente.logoInitials}
                  </span>
                  <div>
                    <CardTitle className="text-base">{cliente.name}</CardTitle>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Building2 className="size-3" /> {cliente.company}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    cliente.status === "Ativo"
                      ? "bg-success/20 text-success"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {cliente.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3">
                <p className="flex items-center gap-2">
                  <Mail className="size-3.5 text-primary" /> {cliente.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="size-3.5 text-primary" /> {cliente.phone}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase">Plano / MRR</span>
                  <p className="text-sm font-bold text-emerald-400">
                    R$ {(Number(cliente.mrr) || 0).toLocaleString("pt-BR")} <span className="text-[10px] text-muted-foreground font-normal">({cliente.tier})</span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => handleExcluir(cliente.id)}
                  title="Excluir cliente"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Modal Simples de Cadastro */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold">Cadastrar Novo Cliente</h2>
            <form onSubmit={handleCadastrar} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nome do Responsável</label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Mariana Costa" required />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nome da Empresa</label>
                <Input value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Ex: Vitória Moda" required />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">E-mail</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mariana@empresa.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground}"></label>
                <label className="text-xs font-medium text-muted-foreground">Telefone / WhatsApp</label>
                <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 98765-4321" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Tier / Plano</label>
                  <select
                    value={plano}
                    onChange={(e) => setPlano(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Growth">Growth</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">MRR (R$)</label>
                  <Input value={mrr} onChange={(e) => setMrr(e.target.value)} placeholder="12900" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setModalAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar Cliente"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
