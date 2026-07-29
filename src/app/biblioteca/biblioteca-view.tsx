"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  CalendarClock,
  ChevronRight,
  Compass,
  Plus,
  ScrollText,
  Search,
  SearchX,
  Target,
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
import type { LibraryCategory } from "@/types";

const categoryConfig: Record<
  LibraryCategory,
  { icon: typeof BookOpen; badge: "violet" | "warning" | "info" | "success"; tone: string }
> = {
  "UGC Script Templates": { icon: ScrollText, badge: "violet", tone: "bg-ai/15 text-ai" },
  "Ad Copy Hooks": { icon: Zap, badge: "warning", tone: "bg-warning/15 text-warning" },
  "Creator Guidelines": { icon: BookOpen, badge: "info", tone: "bg-info/15 text-info" },
  "Strategy Guides": { icon: Compass, badge: "success", tone: "bg-success/15 text-success" },
};

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function BibliotecaView() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("Todos");
  const [dialogOpen, setDialogOpen] = useState(false);

  const stats = (Object.keys(categoryConfig) as LibraryCategory[]).map((item) => ({
    label: item,
    value: libraryItems.filter((entry) => entry.category === item).length.toString(),
    icon: categoryConfig[item].icon,
    tone: categoryConfig[item].tone,
  }));

  const filtered = useMemo(
    () =>
      libraryItems.filter((item) => {
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.author.toLowerCase().includes(query);
        const matchesTab = tab === "Todos" || item.category === tab;
        return matchesSearch && matchesTab;
      }),
    [search, tab]
  );

  return (
    <>
      <PageHeader title="Biblioteca" description="Conhecimento reutilizável da operação.">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus /> Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo item de conhecimento</DialogTitle>
              <DialogDescription>
                Adicione um template, hook, guideline ou guia à biblioteca.
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
                  <label htmlFor="library-title" className={fieldLabel}>
                    Título
                  </label>
                  <Input id="library-title" placeholder="Ex.: Script UGC — Problema / Solução / CTA" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="library-category" className={fieldLabel}>
                      Categoria
                    </label>
                    <Select defaultValue="UGC Script Templates">
                      <SelectTrigger id="library-category" aria-label="Selecionar categoria">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UGC Script Templates">UGC Script Templates</SelectItem>
                        <SelectItem value="Ad Copy Hooks">Ad Copy Hooks</SelectItem>
                        <SelectItem value="Creator Guidelines">Creator Guidelines</SelectItem>
                        <SelectItem value="Strategy Guides">Strategy Guides</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="library-author" className={fieldLabel}>
                      Autor
                    </label>
                    <Input id="library-author" placeholder="Equipe SAUGC" />
                  </div>
                </div>
                <div>
                  <label htmlFor="library-description" className={fieldLabel}>
                    Descrição
                  </label>
                  <Textarea
                    id="library-description"
                    placeholder="Resumo do conteúdo e quando usar..."
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
                <Button type="submit">Salvar na biblioteca</Button>
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

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={tab} onValueChange={setTab} className="min-w-0">
          <TabsList className="max-w-full justify-start overflow-x-auto">
            <TabsTrigger value="Todos">Todos</TabsTrigger>
            <TabsTrigger value="UGC Script Templates">Scripts UGC</TabsTrigger>
            <TabsTrigger value="Ad Copy Hooks">Hooks</TabsTrigger>
            <TabsTrigger value="Creator Guidelines">Guidelines</TabsTrigger>
            <TabsTrigger value="Strategy Guides">Estratégia</TabsTrigger>
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

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const config = categoryConfig[item.category];
            return (
              <Card key={item.id} className="card-glow flex flex-col">
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`flex size-9 items-center justify-center rounded-lg ${config.tone}`}>
                      <config.icon className="size-4" />
                    </div>
                    <Badge variant={config.badge}>{item.category}</Badge>
                  </div>
                  <h3 className="mt-4 text-base font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[9px]">{initials(item.author)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{item.author}</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <CalendarClock className="size-3" />
                      {item.updatedAt}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-3 -mb-1 self-end text-muted-foreground">
                    Abrir item
                    <ChevronRight />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <SearchX className="size-8 text-muted-foreground" />
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
          </CardContent>
        </Card>
      )}
      <Target className="hidden" aria-hidden="true" />
    </>
  );
}