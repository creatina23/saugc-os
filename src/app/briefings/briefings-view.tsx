"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  PenLine,
  Plus,
  Search,
  SearchX,
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
import { briefings, clients } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { BriefingStatus } from "@/types";

const statusFilters = ["Todos", "Em Aprovação", "Aprovado", "Rascunho"] as const;

const statusBadge: Record<BriefingStatus, "warning" | "success" | "secondary"> = {
  "Em Aprovação": "warning",
  Aprovado: "success",
  Rascunho: "secondary",
};

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

export function BriefingsView() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("Todos");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(
    () =>
      briefings.filter((briefing) => {
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          briefing.title.toLowerCase().includes(query) ||
          briefing.client.toLowerCase().includes(query) ||
          briefing.creator.toLowerCase().includes(query);
        const matchesStatus = status === "Todos" || briefing.status === status;
        return matchesSearch && matchesStatus;
      }),
    [search, status]
  );

  const stats = [
    { label: "Total de briefings", value: briefings.length.toString(), icon: FileText, tone: "bg-primary/15 text-primary" },
    {
      label: "Em aprovação",
      value: briefings.filter((item) => item.status === "Em Aprovação").length.toString(),
      icon: Clock,
      tone: "bg-warning/15 text-warning",
    },
    {
      label: "Aprovados",
      value: briefings.filter((item) => item.status === "Aprovado").length.toString(),
      icon: CheckCircle2,
      tone: "bg-success/15 text-success",
    },
    {
      label: "Rascunhos",
      value: briefings.filter((item) => item.status === "Rascunho").length.toString(),
      icon: PenLine,
      tone: "bg-secondary text-muted-foreground",
    },
  ];

  return (
    <>
      <PageHeader title="Briefings" description="Briefings de conteúdo UGC padronizados.">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus /> Novo Briefing
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar briefing</DialogTitle>
              <DialogDescription>
                Estruture um novo pedido de conteúdo para o creator.
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setDialogOpen(false);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="briefing-title" className={fieldLabel}>
                    Título do briefing
                  </label>
                  <Input id="briefing-title" placeholder="Ex.: UGC Unboxing — Linha Skincare" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="briefing-client" className={fieldLabel}>
                      Cliente
                    </label>
                    <Select defaultValue={clients[0].company}>
                      <SelectTrigger id="briefing-client" aria-label="Selecionar cliente">
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.company}>
                            {client.company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="briefing-creator" className={fieldLabel}>
                      Creator responsável
                    </label>
                    <Input id="briefing-creator" placeholder="@ana.cria" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="briefing-deadline" className={fieldLabel}>
                      Prazo de entrega
                    </label>
                    <Input id="briefing-deadline" placeholder="Ex.: 12 ago 2026" />
                  </div>
                  <div>
                    <label htmlFor="briefing-tags" className={fieldLabel}>
                      Tags de requisitos
                    </label>
                    <Input id="briefing-tags" placeholder="Unboxing, 15s, Hook forte" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">Salvar briefing</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-glow">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${stat.tone}`}>
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
                    ? briefings.length
                    : briefings.filter((briefing) => briefing.status === option).length;
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
                    {briefing.id.toUpperCase()}
                  </Badge>
                  <Badge variant={statusBadge[briefing.status]}>{briefing.status}</Badge>
                </div>
                <h3 className="mt-3 text-base font-semibold tracking-tight">{briefing.title}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2 className="size-3.5" />
                  {briefing.client}
                </p>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-[10px]">
                        {briefing.creator.replace("@", "").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{briefing.creator}</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClock className="size-3.5" />
                    {briefing.deadline}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {briefing.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex justify-end border-t border-border pt-4">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
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
          </CardContent>
        </Card>
      )}
    </>
  );
}