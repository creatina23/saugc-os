"use client";

// Clientes — agora com memória: clientes cadastrados pelo usuário
// ficam no NAVEGADOR (localStorage) e migram pro banco na fase
// Supabase sem mudar uma linha desta tela.

import { useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import {
  Pencil,
  Plus,
  Search,
  SearchX,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
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
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBRL } from "@/lib/format";
import { clientesService } from "@/lib/services";
import { toast } from "@/lib/toast";
import type { Client, ClientStatus, ClientTier } from "@/types";

// ---------- Mini-store persistente (localStorage) ----------

const STORAGE_KEY = "anuncia:clientes-extras";

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedClients: Client[] = [];

function parseClients(raw: string | null | undefined): Client[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is Client =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        "company" in item
    );
  } catch {
    return [];
  }
}

function readSnapshot(): Client[] {
  if (typeof window === "undefined") return cachedClients;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedClients = parseClients(raw);
  }
  return cachedClients;
}

function serverSnapshot(): Client[] {
  return [];
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function writeClients(clients: Client[]): void {
  cachedRaw = JSON.stringify(clients);
  cachedClients = clients;
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  listeners.forEach((listener) => listener());
}

// ---------- Regras visuais ----------

const tierOptions = ["Todos", "Enterprise", "Growth", "Starter"] as const;
const statusOptions = ["Todos", "Ativo", "Inativo", "Em onboarding"] as const;

const tierBadge: Record<ClientTier, "violet" | "default" | "secondary"> = {
  Enterprise: "violet",
  Growth: "default",
  Starter: "secondary",
};

const statusBadge: Record<ClientStatus, "success" | "secondary" | "warning"> = {
  Ativo: "success",
  Inativo: "secondary",
  "Em onboarding": "warning",
};

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function hojeCurto(): string {
  const hoje = new Date();
  return `${hoje.getDate()} ${MESES[hoje.getMonth()]} ${hoje.getFullYear()}`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const emptyForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  tier: "Starter" as ClientTier,
  notes: "",
};

export function ClientesView() {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<string>("Todos");
  const [status, setStatus] = useState<string>("Todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Clientes do usuário (persistem no navegador; vazios no SSR)
  const extraClients = useSyncExternalStore(subscribe, readSnapshot, serverSnapshot);

  const allClients = useMemo(
    () => [...clientesService.list(), ...extraClients],
    [extraClients]
  );

  const filtered = useMemo(
    () =>
      allClients.filter((client) => {
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          client.name.toLowerCase().includes(query) ||
          client.company.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query);
        const matchesTier = tier === "Todos" || client.tier === tier;
        const matchesStatus = status === "Todos" || client.status === status;
        return matchesSearch && matchesTier && matchesStatus;
      }),
    [allClients, search, tier, status]
  );

  const totalMrr = allClients.reduce((acc, client) => acc + client.mrr, 0);
  const activeClients = allClients.filter((client) => client.status === "Ativo").length;

  const stats = [
    {
      label: "Total de clientes",
      tip: "Empresas na base (mock + as que você cadastrou)",
      value: allClients.length.toString(),
      icon: Users,
      tone: "bg-primary/15 text-primary",
    },
    {
      label: "Clientes ativos",
      tip: "Clientes com status Ativo",
      value: activeClients.toString(),
      icon: UserCheck,
      tone: "bg-success/15 text-success",
    },
    {
      label: "MRR total",
      tip: "Soma da receita mensal recorrente de todos",
      value: formatBRL(totalMrr),
      icon: Wallet,
      tone: "bg-ai/15 text-ai",
    },
    {
      label: "Ticket médio",
      tip: "MRR total dividido pelo número de clientes",
      value: formatBRL(
        allClients.length > 0 ? Math.round(totalMrr / allClients.length) : 0
      ),
      icon: TrendingUp,
      tone: "bg-warning/15 text-warning",
    },
  ];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const company = form.company.trim();
    const newClient: Client = {
      id: `local-${Date.now()}`,
      name: form.name.trim() || "Contato principal",
      company,
      email: form.email.trim(),
      phone: form.phone.trim(),
      tier: form.tier,
      status: "Em onboarding",
      mrr: 0,
      logoInitials: initials(company),
      since: hojeCurto(),
    };
    writeClients([...extraClients, newClient]);
    setForm(emptyForm);
    setDialogOpen(false);
    toast("Cliente adicionado", {
      description: `${company} entrou na base como ${form.tier} · Em onboarding.`,
      type: "success",
    });
  }

  return (
    <>
      <PageHeader title="Clientes" description="Gestão da base de clientes da agência.">
        <div className="flex items-center gap-3">
          {extraClients.length > 0 && (
            <button
              type="button"
              onClick={() => writeClients([])}
              className="inline-flex items-center gap-1.5 text-xs text-white/40 underline-offset-2 transition-colors hover:text-white/75 hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Limpar meus clientes ({extraClients.length})
            </button>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus /> Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar cliente</DialogTitle>
                <DialogDescription>
                  Cadastre uma nova empresa na base da agência. Fica salva neste
                  navegador; na fase com login, vale para toda a equipe.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="client-name" className={fieldLabel}>
                      Nome do contato
                    </label>
                    <Input
                      id="client-name"
                      required
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, name: event.target.value }))
                      }
                      placeholder="Ex.: Mariana Costa"
                    />
                  </div>
                  <div>
                    <label htmlFor="client-company" className={fieldLabel}>
                      Empresa
                    </label>
                    <Input
                      id="client-company"
                      required
                      value={form.company}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, company: event.target.value }))
                      }
                      placeholder="Ex.: Vitória Moda"
                    />
                  </div>
                  <div>
                    <label htmlFor="client-email" className={fieldLabel}>
                      E-mail
                    </label>
                    <Input
                      id="client-email"
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, email: event.target.value }))
                      }
                      placeholder="contato@empresa.com.br"
                    />
                  </div>
                  <div>
                    <label htmlFor="client-phone" className={fieldLabel}>
                      Telefone
                    </label>
                    <Input
                      id="client-phone"
                      value={form.phone}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, phone: event.target.value }))
                      }
                      placeholder="(11) 98765-4321"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="client-tier" className={fieldLabel}>
                      Tier
                    </label>
                    <Select
                      value={form.tier}
                      onValueChange={(value) =>
                        setForm((current) => ({ ...current, tier: value as ClientTier }))
                      }
                    >
                      <SelectTrigger id="client-tier" aria-label="Selecionar tier">
                        <SelectValue placeholder="Selecione o tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                        <SelectItem value="Growth">Growth</SelectItem>
                        <SelectItem value="Starter">Starter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="client-notes" className={fieldLabel}>
                      Observações
                    </label>
                    <Textarea
                      id="client-notes"
                      value={form.notes}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, notes: event.target.value }))
                      }
                      placeholder="Nicho, objetivos, preferências do cliente..."
                      className="min-h-[88px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button type="submit">Salvar cliente</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-glow">
            <CardContent className="flex items-center gap-3 p-4">
              <Tooltip label={stat.tip}>
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${stat.tone}`}
                >
                  <stat.icon className="size-4" />
                </div>
              </Tooltip>
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
                placeholder="Buscar por nome, empresa ou e-mail..."
                aria-label="Buscar clientes"
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:w-[380px]">
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger aria-label="Filtrar por tier">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  {tierOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === "Todos" ? "Todos os tiers" : option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger aria-label="Filtrar por status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === "Todos" ? "Todos os status" : option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>

        {filtered.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden lg:table-cell">Contato</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">MRR</TableHead>
                <TableHead className="hidden xl:table-cell">Desde</TableHead>
                <TableHead className="w-[100px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{client.logoInitials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{client.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {client.company}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <p className="truncate text-sm">{client.email}</p>
                    <p className="text-xs text-muted-foreground">{client.phone}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tierBadge[client.tier]}>{client.tier}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadge[client.status]}>{client.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {client.mrr > 0 ? formatBRL(client.mrr) : "—"}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground xl:table-cell">
                    {client.since}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar ${client.company}`}
                        className="size-8 text-muted-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir ${client.company}`}
                        className="size-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon={SearchX}
            title="Nenhum cliente encontrado"
            description="Ajuste a busca ou os filtros para ver resultados."
            className="m-4"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setTier("Todos");
                  setStatus("Todos");
                }}
              >
                Limpar filtros
              </Button>
            }
          />
        )}
      </Card>
    </>
  );
}