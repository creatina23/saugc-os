"use client";

// Laboratório de IA — bancada de testes do motor (rota interna).
// Não aparece no menu de propósito: é nossa área de engenharia,
// acessível digitando /laboratorio na barra de endereço (com login).

import { useState } from "react";
import { Check, Copy, FlaskConical, Loader2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { iaService } from "@/lib/services/ia-service";

const EXEMPLOS = [
  {
    rotulo: "🐶 Slogans p/ petshop",
    texto: "Crie 3 slogans curtos e memoráveis para um petshop de bairro chamado AuAu Feliz, em português do Brasil. Lista numerada, só os slogans.",
  },
  {
    rotulo: "💄 Hook UGC skincare",
    texto: "Escreva 1 hook (frase de abertura de até 12 palavras) para um vídeo UGC de um sérum facial de vitamina C, em português do Brasil. Só o hook, sem explicações.",
  },
  {
    rotulo: "🎬 Títulos p/ anúncio",
    texto: "Sugira 3 títulos chamativos para um vídeo de anúncio de um curso online de inglês para adultos, em português do Brasil. Lista numerada, só os títulos.",
  },
];

export function LaboratorioView() {
  const [prompt, setPrompt] = useState("");
  const [resposta, setResposta] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function handleGerar() {
    if (!prompt.trim() || carregando) return;
    setCarregando(true);
    setErro(null);
    setResposta("");
    setCopiado(false);

    const resultado = await iaService.gerarTexto(prompt);
    setCarregando(false);

    if (resultado.ok) {
      setResposta(resultado.texto);
    } else {
      setErro(resultado.erro ?? "Falha desconhecida.");
    }
  }

  async function handleCopiar() {
    if (!resposta) return;
    await navigator.clipboard.writeText(resposta);
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Laboratório de IA
          </h1>
          <Badge variant="outline">rota interna · fora do menu</Badge>
        </div>
        <p className="text-sm text-white/60">
          Bancada de testes do motor de IA. Aqui a gente experimenta antes de
          ligar nas telas de verdade.
        </p>
      </div>

      {/* Pedido */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">O que a IA deve fazer?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {EXEMPLOS.map((exemplo) => (
              <button
                key={exemplo.rotulo}
                type="button"
                onClick={() => setPrompt(exemplo.texto)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/25 hover:text-white"
              >
                {exemplo.rotulo}
              </button>
            ))}
          </div>

          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={5}
            placeholder="Escreva o pedido aqui — ou clique num exemplo acima…"
            aria-label="Pedido para a IA"
            className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-white/35">
              {prompt.length}/8.000 caracteres
            </p>
            <Button
              onClick={() => void handleGerar()}
              disabled={carregando || !prompt.trim()}
            >
              {carregando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Pensando…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" aria-hidden />
                  Gerar com IA
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resposta */}
      {(carregando || resposta || erro) && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FlaskConical
                  className="h-4 w-4 text-violet-400"
                  aria-hidden
                />
                Resposta da IA
              </CardTitle>
              {resposta && (
                <Button
                  variant="outline"
                  onClick={() => void handleCopiar()}
                >
                  {copiado ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" aria-hidden />
                      Copiar
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {carregando && (
              <div className="space-y-2" aria-busy="true">
                <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-white/5" />
              </div>
            )}
            {erro && (
              <div
                role="alert"
                className="rounded-lg border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.1)] px-3 py-2 text-sm text-red-300"
              >
                {erro}
              </div>
            )}
            {resposta && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">
                {resposta}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}