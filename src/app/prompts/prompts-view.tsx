"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  Braces,
  Check,
  Copy,
  Plus,
  Search,
  SearchX,
  Sparkles,
  Tags,
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
import { Textarea } from "@/components/ui/textarea";
import { prompts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const modelBadge: Record<string, "default" | "violet" | "warning" | "secondary"> = {
  "GPT-4o": "default",
  "Claude 3.5 Sonnet": "violet",
  Midjourney: "warning",
};

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

function renderContent(content: string) {
  return content.split(/(\{[^}]+\})/g).map((part, index) =>
    part.startsWith("{") && part.endsWith("}") ? (
      <code
        key={`${part}-${index}`}
        className="rounded-md border border-ai/30 bg-ai/15 px-1.5 py-0.5 text-ai"
      >
        {part}
      </code>
    ) : (
      <span key={`text-${index}`}>{part}</span>
    )
  );
}

export function PromptsView() {
  const [search, setSearch] = useState("");
  const [model, setModel] = useState("Todos");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const modelOptions = useMemo(
    () => ["Todos", ...new Set(prompts.flatMap((item) => item.models))],
    []
  );

  const filtered = useMemo(
    () =>
      prompts.filter((item) => {
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query));
        const matchesModel = model === "Todos" || item.models.includes(model);
        return matchesSearch && matchesModel;
      }),
    [search, model]
  );

  const totalVariables = prompts.reduce(
    (acc, item) => acc + (item.content.match(/\{[^}]+\}/g)?.length ?? 0),
    0
  );

  const stats = [
    { label: "Total de prompts", value: prompts.length.toString(), icon: Sparkles, tone: "bg-ai/15 text-ai" },
    { label: "Modelos-alvo", value: (modelOptions.length - 1).toString(), icon: Bot, tone: "bg-primary/15 text-primary" },
    { label: "Variáveis dinâmicas", value: totalVariables.toString(), icon: Braces, tone: "bg-warning/15 text-warning" },
    {
      label: "Tags únicas",
      value: new Set(prompts.flatMap((item) => item.tags)).size.toString(),
      icon: Tags,
      tone: "bg-success/15 text-success",
    },
  ];

  async function copyPrompt(id: string, content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <>
      <PageHeader title="Prompts" description="Biblioteca de prompts de IA reutilizáveis.">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus /> Novo Prompt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Salvar novo prompt</DialogTitle>
              <DialogDescription>
                Adicione um prompt reutilizável à biblioteca da agência.
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
                  <label htmlFor="prompt-title" className={fieldLabel}>
                    Título
                  </label>
                  <Input id="prompt-title" placeholder="Ex.: Briefing UGC por Nicho" />
                </div>
                <div>
                  <label htmlFor="prompt-description" className={fieldLabel}>
                    Descrição
                  </label>
                  <Input id="prompt-description" placeholder="O que este prompt gera..." />
                </div>
                <div>
                  <label htmlFor="prompt-content" className={fieldLabel}>
                    Conteúdo do prompt
                  </label>
                  <Textarea
                    id="prompt-content"
                    placeholder="Crie um briefing UGC para o nicho {nicho}..."
                    className="font-mono-params min-h-[110px]"
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Dica: use {"{chaves}"} para criar variáveis dinâmicas.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="prompt-model" className={fieldLabel}>
                      Modelo recomendado
                    </label>
                    <Select defaultValue="GPT-4o">
                      <SelectTrigger id="prompt-model" aria-label="Selecionar modelo">
                        <SelectValue placeholder="Selecione o modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GPT-4o">GPT-4o</SelectItem>
                        <SelectItem value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</SelectItem>
                        <SelectItem value="Midjourney">Midjourney</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="prompt-tags" className={fieldLabel}>
                      Tags
                    </label>
                    <Input id="prompt-tags" placeholder="UGC, Briefing, Roteiro" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">Salvar prompt</Button>
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
                placeholder="Buscar por título, conteúdo ou tag..."
                aria-label="Buscar prompts"
                className="pl-10"
              />
            </div>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger aria-label="Filtrar por modelo" className="w-full lg:w-[240px]">
                <SelectValue placeholder="Modelo" />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "Todos" ? "Todos os modelos" : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {filtered.map((prompt) => (
            <Card key={prompt.id} className="card-glow flex flex-col">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold tracking-tight">{prompt.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{prompt.description}</p>
                  </div>
                  <Button
                    variant={copiedId === prompt.id ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => copyPrompt(prompt.id, prompt.content)}
                    aria-label={`Copiar prompt ${prompt.title}`}
                    className="shrink-0"
                  >
                    {copiedId === prompt.id ? <Check className="text-success" /> : <Copy />}
                    {copiedId === prompt.id ? "Copiado" : "Copiar"}
                  </Button>
                </div>

                <div
                  className={cn(
                    "font-mono-params mt-4 rounded-xl border border-border bg-[rgba(255,255,255,0.02)] p-4 leading-relaxed text-muted-foreground"
                  )}
                >
                  {renderContent(prompt.content)}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {prompt.models.map((item) => (
                    <Badge key={item} variant={modelBadge[item] ?? "secondary"}>
                      {item}
                    </Badge>
                  ))}
                  {prompt.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
                  {Object.entries(prompt.parameters).map(([key, value]) => (
                    <span
                      key={key}
                      className="font-mono-params rounded-md border border-border bg-muted px-2 py-1 text-[11px] text-muted-foreground"
                    >
                      {key}: <span className="text-foreground">{value}</span>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <SearchX className="size-8 text-muted-foreground" />
            <p className="mt-3 font-medium">Nenhum prompt encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ajuste a busca ou o filtro de modelo para ver resultados.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearch("");
                setModel("Todos");
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