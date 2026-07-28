"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prompts } from "@/lib/mock-data";

export default function PromptsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyPrompt(id: string, content: string) {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        title="Prompts"
        description="Biblioteca de prompts com variáveis, modelos alvo e parâmetros."
        actions={<Button>+ Novo Prompt</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {prompts.map((prompt) => (
          <Card key={prompt.id}>
            <CardHeader>
              <CardTitle className="text-base">{prompt.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{prompt.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <pre className="font-mono-params overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-3 text-xs leading-relaxed text-emerald-100/90">
                {prompt.content}
              </pre>
              <div className="flex flex-wrap gap-1.5">
                {prompt.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {prompt.models.map((model) => (
                    <Badge key={model} variant="violet" className="font-normal">
                      {model}
                    </Badge>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyPrompt(prompt.id, prompt.content)}
                >
                  {copiedId === prompt.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono-params">
                params: {JSON.stringify(prompt.parameters)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
