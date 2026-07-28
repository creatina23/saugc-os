"use client";

import { useState } from "react";
import { Play, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockOutput = `## Roteiro UGC (mock)

**Hook (0-3s):** "Você ainda compra {produto} errado?"

**Corpo:** Demonstração autêntica com prova social e benefício claro para {publico}.

**CTA:** "Link na bio — cupom SAUGC10."

_Generated locally · sem chamada de API_`;

export default function IaStudioPage() {
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(800);
  const [prompt, setPrompt] = useState(
    "Gere um roteiro UGC de 30s para {nicho} focado em {publico}."
  );
  const [output, setOutput] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        title="IA Studio"
        description="Playground estilo Linear/OpenAI com controles visuais e saída mock."
        badge="Preview local"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Modelo & parâmetros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Modelo</label>
              <Select defaultValue="gpt-4o">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="claude">Claude 3.5 Sonnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">System prompt</label>
              <textarea
                className="min-h-[100px] w-full rounded-md border border-white/10 bg-white/5 p-3 text-sm"
                defaultValue="Você é um estrategista UGC da SAUGC. Responda em português do Brasil."
                readOnly
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Temperature</span>
                <span className="font-mono-params">{temperature.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Max tokens</span>
                <span className="font-mono-params">{maxTokens}</span>
              </div>
              <input
                type="range"
                min={256}
                max={2000}
                step={64}
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Workspace</CardTitle>
            <Badge variant="success">Mock mode</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="prompt">
              <TabsList>
                <TabsTrigger value="prompt">Prompt</TabsTrigger>
                <TabsTrigger value="vars">Variáveis</TabsTrigger>
              </TabsList>
              <TabsContent value="prompt">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[140px] w-full rounded-md border border-white/10 bg-black/30 p-3 text-sm font-mono-params"
                />
              </TabsContent>
              <TabsContent value="vars" className="grid gap-2 sm:grid-cols-2">
                <Input placeholder="{nicho}" defaultValue="skincare premium" />
                <Input placeholder="{publico}" defaultValue="mulheres 25-40" />
              </TabsContent>
            </Tabs>
            <Button
              className="gap-2"
              onClick={() =>
                setOutput(
                  mockOutput
                    .replace("{produto}", "sérum")
                    .replace("{publico}", "mulheres 25-40")
                )
              }
            >
              <Play className="h-4 w-4" />
              Gerar preview
            </Button>
            {output && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  Saída simulada
                </div>
                <pre className="whitespace-pre-wrap text-sm text-foreground/90">
                  {output}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
