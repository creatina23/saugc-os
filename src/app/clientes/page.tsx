"use client";

import { useMemo, useState } from "react";
import { Mail, Phone, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { clients } from "@/lib/mock-data";
import type { ClientTier } from "@/types";

const tiers: Array<ClientTier | "Todos"> = [
  "Todos",
  "Enterprise",
  "Growth",
  "Starter",
];

function tierVariant(tier: ClientTier) {
  if (tier === "Enterprise") return "violet";
  if (tier === "Growth") return "success";
  return "muted";
}

function statusVariant(status: string) {
  if (status === "Ativo") return "success";
  if (status === "Em onboarding") return "warning";
  return "muted";
}

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<ClientTier | "Todos">("Todos");

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchTier = tier === "Todos" || c.tier === tier;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      return matchTier && matchSearch;
    });
  }, [search, tier]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        title="Clientes"
        description="Gerencie contas, tiers e MRR da base de clientes SAUGC."
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Adicionar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo cliente</DialogTitle>
                <DialogDescription>
                  Formulário visual mock — sem persistência nesta sprint.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <Input placeholder="Nome da empresa" />
                <Input placeholder="E-mail de contato" />
                <Input placeholder="Telefone" />
              </div>
              <DialogFooter>
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar (mock)</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar clientes..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {tiers.map((t) => (
            <Button
              key={t}
              size="sm"
              variant={tier === t ? "default" : "outline"}
              onClick={() => setTier(t)}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-muted-foreground">
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Tier</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">MRR</th>
                  <th className="p-4 font-medium">Contato</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-xs font-semibold">
                          {client.logoInitials}
                        </div>
                        <div>
                          <p className="font-medium">{client.company}</p>
                          <p className="text-xs text-muted-foreground">{client.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={tierVariant(client.tier)}>{client.tier}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={statusVariant(client.status)}>{client.status}</Badge>
                    </td>
                    <td className="p-4 font-mono-params">
                      {client.mrr > 0
                        ? `R$ ${client.mrr.toLocaleString("pt-BR")}`
                        : "—"}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Nenhum cliente encontrado.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
