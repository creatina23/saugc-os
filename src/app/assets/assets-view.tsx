"use client";

import { useMemo, useState } from "react";

import {
  Building2,
  Clapperboard,
  Clock,
  Download,
  Film,
  Image as ImageIcon,
  Play,
  Scissors,
  Search,
  SearchX,
  Upload,
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
import { cn } from "@/lib/utils";
import type { AssetCategory } from "@/types";

const categoryFilters = ["Todas", "Video Ads", "Hook Clips", "B-Roll", "Product Photos"] as const;

const categoryConfig: Record<
  AssetCategory,
  { gradient: string; isVideo: boolean; tone: string }
> = {
  "Video Ads": { gradient: "from-violet-500/60 to-violet-900/30", isVideo: true, tone: "bg-ai/15 text-ai" },
  "Hook Clips": { gradient: "from-blue-500/60 to-blue-900/30", isVideo: true, tone: "bg-primary/15 text-primary" },
  "B-Roll": { gradient: "from-emerald-500/60 to-emerald-900/30", isVideo: true, tone: "bg-success/15 text-success" },
  "Product Photos": { gradient: "from-amber-500/60 to-amber-900/30", isVideo: false, tone: "bg-warning/15 text-warning" },
};

const categoryIcon: Record<AssetCategory, typeof Film> = {
  "Video Ads": Clapperboard,
  "Hook Clips": Scissors,
  "B-Roll": Film,
  "Product Photos": ImageIcon,
};

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

export function MídiasView() {
  const assets = assetsService.list();
  const clients = clientesService.list();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("Todas");
  const [client, setClient] = useState("Todos");
  const [dialogOpen, setDialogOpen] = useState(false);

  const clientOptions = useMemo(
    () => ["Todos", ...new Set(clients.map((item) => item.company))],
    [clients]
  );

  const filtered = useMemo(
    () =>
      assets.filter((item) => {
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          item.name.toLowerCase().includes(query) ||
          item.client.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query));
        const matchesCategory = category === "Todas" || item.category === category;
        const matchesClient = client === "Todos" || item.client === client;
        return matchesSearch && matchesCategory && matchesClient;
      }),
    [assets, search, category, client]
  );

  const stats = (Object.keys(categoryConfig) as AssetCategory[]).map((item) => ({
    label: item,
    value: assets.filter((asset) => asset.category === item).length.toString(),
    icon: categoryIcon[item],
    tone: categoryConfig[item].tone,
  }));

  return (
    <>
      <PageHeader title="Mídias" description="Biblioteca de arquivos de produção da agência.">
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
                Adicione um novo arquivo à biblioteca de produção.
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setDialogOpen(false);
              }}
            >
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-[rgba(255,255,255,0.02)] px-4 py-8 text-center">
                <Upload className="size-6 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">Arraste arquivos aqui</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  MP4, MOV, PNG, JPG ou GIF
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="asset-name" className={fieldLabel}>
                    Nome do arquivo
                  </label>
                  <Input id="asset-name" placeholder="Ex.: Hook_04_UGC_Verao.mp4" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="asset-client" className={fieldLabel}>
                      Cliente
                    </label>
                    <Select defaultValue={clients[0].company}>
                      <SelectTrigger id="asset-client" aria-label="Selecionar cliente">
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
                    <label htmlFor="asset-category" className={fieldLabel}>
                      Categoria
                    </label>
                    <Select defaultValue="Video Ads">
                      <SelectTrigger id="asset-category" aria-label="Selecionar categoria">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Video Ads">Video Ads</SelectItem>
                        <SelectItem value="Hook Clips">Hook Clips</SelectItem>
                        <SelectItem value="B-Roll">B-Roll</SelectItem>
                        <SelectItem value="Product Photos">Product Photos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="asset-format" className={fieldLabel}>
                      Formato
                    </label>
                    <Select defaultValue="MP4">
                      <SelectTrigger id="asset-format" aria-label="Selecionar formato">
                        <SelectValue placeholder="Selecione o formato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MP4">MP4</SelectItem>
                        <SelectItem value="MOV">MOV</SelectItem>
                        <SelectItem value="PNG">PNG</SelectItem>
                        <SelectItem value="JPG">JPG</SelectItem>
                        <SelectItem value="GIF">GIF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="asset-tags" className={fieldLabel}>
                      Tags
                    </label>
                    <Input id="asset-tags" placeholder="Hook, Vertical, TikTok" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">Enviar para biblioteca</Button>
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
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, cliente ou tag..."
                aria-label="Buscar mídias"
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {categoryFilters.map((option) => {
                const count =
                  option === "Todas"
                    ? assets.length
                    : assets.filter((item) => item.category === option).length;
                const active = category === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCategory(option)}
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
            <Select value={client} onValueChange={setClient}>
              <SelectTrigger aria-label="Filtrar por cliente" className="w-full xl:w-[220px]">
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((asset) => {
            const config = categoryConfig[asset.category];
            return (
              <Card key={asset.id} className="card-glow overflow-hidden">
                <div
                  className={cn(
                    "relative flex aspect-video items-center justify-center bg-gradient-to-br",
                    config.gradient
                  )}
                >
                  {config.isVideo ? (
                    <div className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm">
                      <Play className="ml-0.5 size-4 fill-white text-white" />
                    </div>
                  ) : (
                    <div className="flex size-11 items-center justify-center rounded-xl border border-white/20 bg-black/30 backdrop-blur-sm">
                      <ImageIcon className="size-5 text-white" />
                    </div>
                  )}
                  <Badge variant="outline" className="absolute top-2 left-2 bg-black/40">
                    {asset.format}
                  </Badge>
                  <Badge variant="secondary" className="absolute top-2 right-2 bg-black/40 text-white">
                    {asset.resolution}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <p className="truncate text-sm font-medium" title={asset.name}>
                    {asset.name}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="size-3" />
                      {asset.client}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {asset.updatedAt}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {asset.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="secondary" size="sm" className="mt-4 w-full">
                    <Download />
                    Baixar arquivo
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