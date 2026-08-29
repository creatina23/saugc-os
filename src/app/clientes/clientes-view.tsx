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
import { clientesService } from "@/lib/services/clientes.service";
import { toast } from "@/lib/toast";
import type { Client } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ClientesView() {
  const [clientes, setClientes] = useState<Client[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  // Estados do Modal de Novo Cliente
  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [plano, setPlano] = useState("Growth");
  const [mrr, setMrr] = useState("12900");

  async function carregarClientes() {
    setCarregando(true);
    const lista = await clientesService.list();
    setClientes(lista);
    setCarregando(false);
  }

  useEffect(() => {
    carregarClientes();
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

    const iniciais = nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const res = await clientesService.create({
      name: nome,
      company: empresa,
      email: email || "contato@empresa.com",
      phone: telefone || "(11) 99999-9999",
      tier: plano as any,
      status: "Ativo",
      mrr: Number(mrr) || 0,
      logoInitials: iniciais,
      since: new Date().toISOString().slice(0, 7),
    });

    if (res.ok) {
      toast("Cliente cadastrado com sucesso!", { type: "success" });
      setModalAberto(false);
      setNome("");
      setEmpresa("");
      setEmail("");
      setTelefone("");
      carregarClientes();
    } else {
      toast("Erro ao cadastrar", { description: res.erro, type: "error" });
    }
  }

  async function handleExcluir(id: string) {
    if (!confirm("Deseja realmente remover este cliente da operação?")) return;
    const res = await clientesService.delete(id);
    if (res.ok) {
      toast("Cliente removido", { type: "success" });
      carregarClientes();
    } else {
      toast("Erro ao remover", { description: res.erro, type: "error" });
    }
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

      {/* Lista de Clientes */}
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
                <Button type="submit">Salvar Cliente</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}