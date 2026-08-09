"use client";

// Login — AnuncIA (v2.0 · Passo 015e final)
// ------------------------------------------------------------------
// VITRINE minimalista, estilo Vercel/Linear: só a marca (A com raio em
// destaque) + o cartão de vidro. Zero texto de apoio — o produto fala.
// Cartão: vidro com backdrop blur, borda fina, radius 16, ambiente com
// brilho violeta/indigo no padrão do app.
// MOTOR 100% preservado: interruptor CADASTRO_ABERTO, traduzErro (com
// "Invalid API key" em PT), signIn/signUp e redirecionos.
// Nota: o SVG da marca está duplicado aqui e no app-shell por ora
// (estacionamento: extrair pra componente compartilhado).
//
// 🔒 INTERRUPTOR DE CADASTRO (uma linha muda tudo):
// CADASTRO_ABERTO = false → a tela só oferece "Entrar" (fase fechada:
//   acesso por convite; o cadastro também está desligado no Supabase).
// CADASTRO_ABERTO = true  → volta o botão "Criar conta" (fase pública:
//   religar junto com o toggle "Allow new users" no Supabase e com o
//   "Confirm email").
// ------------------------------------------------------------------

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 🔒 O interruptor. Só mude para true na fase pública.
const CADASTRO_ABERTO = false;

function traduzErro(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("User already registered")) return "Este e-mail já tem conta. Troque para Entrar.";
  if (msg.includes("at least 6 characters")) return "A senha precisa de pelo menos 6 caracteres.";
  if (msg.includes("rate limit")) return "Muitas tentativas. Aguarde um minuto e tente de novo.";
  if (msg.toLowerCase().includes("signups not allowed"))
    return "Cadastro fechado no momento. O acesso é por convite.";
  if (msg.includes("Invalid API key"))
    return "Chave do banco inválida neste ambiente. Confira o arquivo .env.local.";
  return "Não foi possível concluir. Tente novamente.";
}

// Marca AnuncIA — "A com corte de raio", raio grosso/centro (o MESMO
// desenho da barra lateral; trocar um = trocar o outro)
function LogoMarca() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true" fill="none">
      <defs>
        <clipPath id="anuncia-logo-corte-login">
          <path d="M3 22 L11 2 H13 L21 22 H18.2 L12 8.2 L5.8 22 Z" />
        </clipPath>
      </defs>
      <path d="M3 22 L11 2 H13 L21 22 H18.2 L12 8.2 L5.8 22 Z" fill="#FFFFFF" />
      <g clipPath="url(#anuncia-logo-corte-login)">
        <path d="M15.2 4.8 L7.9 14.5 H11.3 L8.6 21.8 L16.6 9.6 H13.2 Z" fill="#0B0D12" />
      </g>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"entrar" | "cadastrar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem(null);

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setMensagem({
        tipo: "erro",
        texto: "Supabase não configurado neste ambiente. Confira o arquivo .env.local.",
      });
      return;
    }

    setCarregando(true);

    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) {
        setMensagem({ tipo: "erro", texto: traduzErro(error.message) });
        setCarregando(false);
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password: senha });
    if (error) {
      setMensagem({ tipo: "erro", texto: traduzErro(error.message) });
      setCarregando(false);
      return;
    }
    setMensagem({ tipo: "ok", texto: "Conta criada! Agora entre com seu e-mail e senha." });
    setModo("entrar");
    setCarregando(false);
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-background bg-grid">
      {/* Brilhos de ambiente — violeta em cima, indigo embaixo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(closest-side,rgba(139,92,246,0.18),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-[radial-gradient(closest-side,rgba(59,130,246,0.12),transparent)]" />

      <div className="relative flex min-h-full items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Marca — só símbolo e nome. Nada mais. */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-ai shadow-lg ring-1 ring-[rgba(139,92,246,0.35)]">
              <LogoMarca />
            </div>
            <h1 className="text-3xl font-bold text-gradient">AnuncIA</h1>
          </div>

          {/* Cartão de acesso — vidro: blur, borda fina, radius 16 */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(31,41,55,0.7)] p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white">
              {modo === "entrar" ? "Entrar na sua conta" : "Criar sua conta"}
            </h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              {modo === "entrar"
                ? "Abra as portas do seu centro de comando."
                : "Leva menos de 1 minuto."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-200">
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="senha" className="text-sm font-medium text-gray-200">
                  Senha
                </label>
                <Input
                  id="senha"
                  type="password"
                  autoComplete={modo === "entrar" ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  placeholder="mínimo 6 caracteres"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                />
              </div>

              {mensagem ? (
                <div
                  role="alert"
                  className={
                    mensagem.tipo === "erro"
                      ? "rounded-lg border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.1)] px-3 py-2 text-sm text-red-300"
                      : "rounded-lg border border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.1)] px-3 py-2 text-sm text-emerald-300"
                  }
                >
                  {mensagem.texto}
                </div>
              ) : null}

              <Button type="submit" disabled={carregando} className="h-11 w-full text-base">
                {carregando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    {modo === "entrar" ? "Entrando…" : "Criando…"}
                  </>
                ) : modo === "entrar" ? (
                  "Entrar"
                ) : (
                  "Criar conta"
                )}
              </Button>
            </form>

            {/* Rodapé do cartão: troca de modo OU aviso de convite */}
            <div className="mt-6 border-t border-[rgba(255,255,255,0.08)] pt-4 text-center">
              {CADASTRO_ABERTO ? (
                <button
                  type="button"
                  onClick={() => {
                    setModo(modo === "entrar" ? "cadastrar" : "entrar");
                    setMensagem(null);
                  }}
                  className="text-sm text-blue-400 transition-colors hover:text-blue-300"
                >
                  {modo === "entrar"
                    ? "Ainda não tem conta? Criar conta"
                    : "Já tem conta? Entrar"}
                </button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Acesso por convite · solicite sua conta ao administrador
                </p>
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Acesso restrito · Dados protegidos por criptografia
          </p>
        </div>
      </div>
    </div>
  );
}