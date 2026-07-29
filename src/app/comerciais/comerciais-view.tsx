"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  CalendarClock,
  Clapperboard,
  Eye,
  Film,
  Play,
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
import { Textarea } from "@/components/ui/textarea";
import { clients, commercials } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { CommercialStatus, ThumbnailTone } from "@/types";

const columns: { status: CommercialStatus; dot: string }[] = [
  { status: "Rascunho", dot: "bg-muted-foreground" },
  { status: "Produção", dot: "bg-info" },
  { status: "Revisão", dot: "bg-warning" },
  { status: "Aprovado", dot: "bg-success" },
];

const toneGradient: Record<ThumbnailTone, string> = {
  blue: "from-blue-500/60 to-blue-900/30",
  violet: "from-violet-500/60 to-violet-900/30",
  emerald: "from-emerald-500/60 to-emerald-900/30",
  amber: "from-amber-500/60 to-amber-900/30",
  pink: "from-pink-500/60 to-pink-900/30",
};

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

export function ComerciaisView() {
  const [search, setSearch] = useState("");
  const [client, setClient] = useState("Todos");
  const [dialogOpen, setDialogOpen] = useState(false);

  const clientOptions = useMemo(
    () => ["Todos", ...new Set(commercials.map((item) => item.client))],
    []
  );

  const filtered = useMemo(
    () =>
      commercials.filter((item) => {
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          item.title.toLowerCase().includes(query) ||
          item.client.toLowerCase().includes(query) ||
          item.creator.toLowerCase().includes(query);
        const matchesClient = client === "Todos" || item.client === client;
        return matchesSearch && matchesClient;
      }),
    [search, client]
  );

  const stats = [
    { label: "Total de comerciais", value: commercials.length.toString(), icon: Film, tone: "bg-primary/15 text-primary" },
    {
      label: "Em produção",
      value: commercials.filter((item) => item.status === "Produção").length.toString(),
      icon: Clapperboard,
      tone: "bg-info/15 text-info",
    },
    {
      label: "Em revisão",
      value: commercials.filter((item) => item.status === "Revisão").length.toString(),
      icon: Eye,
      tone: "bg-warning/15 text-warning",
    },
    {
      label: "Aprovados",
      value: commercials.filter((item) => item.status === "Aprovado").length.toString(),
      icon: BadgeCheck,
      tone: "bg-success/15 text-success",
    },
  ];

  return (
    <>
      <PageHeader title="Comerciais" description="Anúncios UGC em produção pela equipe.">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus /> Novo Comercial
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo comercial</DialogTitle>
              <DialogDescription>
                Adicione um anúncio UGC ao quadro de produção.
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
                  <label htmlFor="commercial-title" className={fieldLabel}>
                    Título do criativo
                  </label>
                  <Input id="commercial-title" placeholder="Ex.: Unboxing Coleção Verão" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="commercial-client" className={fieldLabel}>
                      Cliente
                    </label>
                    <Select defaultValue={clients[0].company}>
                      <SelectTrigger id="commercial-client" aria-label="Selecionar cliente">
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((item) => (
                          <SelectItem key={item.id} value={item.company}>
                            {item.company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="commercial-format" className={fieldLabel}>
                      Formato
                    </label>
                    <Select defaultValue="Reels">
                      <SelectTrigger id="commercial-format" aria-label="Selecionar formato">
                        <SelectValue placeholder="Selecione o formato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Reels">Reels</SelectItem>
                        <SelectItem value="TikTok">TikTok</SelectItem>
                        <SelectItem value="Shorts">Shorts</SelectItem>
                        <SelectItem value="Feed">Feed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="commercial-creator" className={fieldLabel}>
                      Creator responsável
                    </label>
                    <Input id="commercial-creator" placeholder="@ana.cria" />
                  </div>
                  <div>
                    <label htmlFor="commercial-due" className={fieldLabel}>
                      Prazo
                    </label>
                    <Input id="commercial-due" placeholder="Ex.: 12 ago 2026" />
                  </div>
                </div>
                <div>
                  <label htmlFor="commercial-script" className={fieldLabel}>
                    Roteiro resumido
                  </label>
                  <Textarea
                    id="commercial-script"
                    placeholder="Hook de 3s, demonstração, prova social e CTA..."
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
                <Button type="submit">Adicionar ao quadro</Button>
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
                aria-label="Buscar comerciais"
                className="pl-10"
              />
            </div>
            <Select value={client} onValueChange={setClient}>
              <SelectTrigger aria-label="Filtrar por cliente" className="w-full lg:w-[240px]">
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

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((column) => {
            const items = filtered.filter((item) => item.status === column.status);
            return (
              <div
                key={column.status}
                className="flex min-h-[320px] flex-col rounded-2xl border border-border bg-surface-2/50 p-3"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", column.dot)} />
                    <p className="text-xs font-semibold tracking-wide uppercase">
                      {column.status}
                    </p>
                  </div>
                  <Badge variant="outline">{items.length}</Badge>
                </div>

                <div className="flex-1 space-y-3">
                  {items.map((item) => (
                    <Card key={item.id} className="card-glow overflow-hidden">
                      <div
                        className={cn(
                          "relative flex aspect-video items-center justify-center bg-gradient-to-br",
                          toneGradient[item.thumbnailTone]
                        )}
                      >
                        <div className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm">
                          <Play className="ml-0.5 size-4 fill-white text-white" />
                        </div>
                        <Badge variant="violet" className="absolute top-2 left-2">
                          {item.format}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm leading-snug font-semibold">{item.title}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Building2 className="size-3" />
                          {item.client}
                        </p>
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {item.script}
                        </p>
                        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="size-6">
                              <AvatarFallback className="text-[9px]">
                                {item.creator.replace("@", "").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[11px] font-medium">{item.creator}</span>
                          </div>
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <CalendarClock className="size-3" />
                            {item.dueDate}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border px-3 py-8 text-center">
                      <p className="text-xs text-muted-foreground">Nenhum criativo</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <SearchX className="size-8 text-muted-foreground" />
            <p className="mt-3 font-medium">Nenhum comercial encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ajuste a busca ou o filtro de cliente para ver resultados.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearch("");
                setClient("Todos");
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