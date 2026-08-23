// imagem-service.ts — a única porta de IMAGEM das telas. (Sprint 019)
// ------------------------------------------------------------------
// Mesma filosofia do ia-service: as telas NUNCA falam com Cloudflare
// ou Gemini — falam com este serviço, que chama a nossa /api/imagem
// (servidor), onde as chaves vivem escondidas.
// A resposta carrega "motor" (quem gerou) e "formato" (dimensões).

export interface RespostaImagem {
  ok: boolean;
  imagem: string; // "data:image/png;base64,..." — joga direto num <img>
  erro: string | null;
  motor: string | null; // "Cloudflare · FLUX.2 klein-9b", "Gemini imagem · ..."
  formato: string | null; // "768x960" por exemplo
  promptUsado: string | null; // o prompt final (traduzido/enriquecido) — transparência
  notas: string[] | null; // a jornada da geração (qual motor, quem falhou e por quê)
}

export interface OpcoesImagem {
  // "quadrado" (1:1) · "retrato" (4:5) · "vertical" (9:16) · "paisagem" (5:4)
  formato?: "quadrado" | "retrato" | "vertical" | "paisagem";
  negativo?: string; // o que NÃO deve aparecer na imagem
}

// Um gerador visto de fora: só o id e se tem chave (nunca a chave)
export interface MotorDeImagem {
  id: string; // "cloudflare" | "gemini-imagem"
  armado: boolean;
}

export const imagemService = {
  async gerarImagem(
    prompt: string,
    opcoes: OpcoesImagem = {}
  ): Promise<RespostaImagem> {
    try {
      const resposta = await fetch("/api/imagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acao: "gerar-imagem",
          prompt,
          formato: opcoes.formato,
          negativo: opcoes.negativo,
        }),
      });

      const dados = (await resposta.json().catch(() => null)) as {
        imagem?: string;
        erro?: string;
        motor?: string;
        formato?: string;
        promptUsado?: string;
        notas?: string[];
      } | null;

      if (!resposta.ok) {
        return {
          ok: false,
          imagem: "",
          erro: dados?.erro ?? "Falha ao gerar a imagem.",
          motor: null,
          formato: null,
          promptUsado: null,
          notas: dados?.notas ?? null,
        };
      }

      return {
        ok: true,
        imagem: dados?.imagem ?? "",
        erro: null,
        motor: dados?.motor ?? null,
        formato: dados?.formato ?? null,
        promptUsado: dados?.promptUsado ?? null,
        notas: dados?.notas ?? null,
      };
    } catch {
      return {
        ok: false,
        imagem: "",
        erro: "Sem conexão com o servidor de imagens. Confira a internet.",
        motor: null,
        formato: null,
        promptUsado: null,
        notas: null,
      };
    }
  },

  // Espelho da Mesa de Imagens: quais geradores têm chave plantada.
  // null = não deu pra consultar (offline, demo) — tela mostra "sem leitura".
  async statusImagens(): Promise<MotorDeImagem[] | null> {
    try {
      const resposta = await fetch("/api/imagem", { method: "GET" });
      const dados = (await resposta.json().catch(() => null)) as {
        motores?: MotorDeImagem[];
      } | null;
      if (!resposta.ok || !Array.isArray(dados?.motores)) return null;
      return dados.motores;
    } catch {
      return null;
    }
  },
};
