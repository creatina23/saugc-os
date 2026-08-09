import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

// Rotas que qualquer pessoa pode acessar sem login
const ROTAS_PUBLICAS = ["/login"];

// Next 16: o antigo "middleware" agora se chama "proxy" — mesma função, nome novo.
// Blindagem (Sprint 015): se o Supabase estiver fora do ar (queda ou
// hibernação do plano Free), o app NÃO morre em tela 500 — segue aberto e
// as telas caem em modo demonstração com selo visível. Queda vira aviso.
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sem chaves configuradas neste ambiente, o app segue aberto (modo mock).
  // É o que mantém o site da Vercel funcionando até cadastrarmos as chaves lá.
  if (!url || !anonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
        },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() valida a sessão no servidor (seguro) e já renova o cookie
  // quando necessário — mantém o usuário logado.
  // ⚠️ getUser() FAZ CHAMADA DE REDE. Se o Supabase não responder, ele
  // dispara exceção (TypeError: fetch failed) — sem try/catch, o app
  // inteiro caía numa tela 500 feia. Agora: avisamos no log do servidor e
  // deixamos o app abrir; cada tela cai em modo demonstração (selo visível).
  let user: User | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (erro) {
    console.warn(
      "[proxy] Supabase não respondeu; o app segue aberto em modo degradado.",
      erro,
    );
    return response;
  }

  const pathname = request.nextUrl.pathname;
  const ehRotaPublica = ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota));

  // Sem login tentando acessar área protegida → manda pro /login
  if (!user && !ehRotaPublica) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  // Já logado tentando abrir o /login → manda pro painel
  if (user && ehRotaPublica) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};