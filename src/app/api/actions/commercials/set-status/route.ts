import { NextResponse } from "next/server";
import { verificarSessao } from "@/lib/actions/gate";
import { executarSetStatus } from "@/lib/actions/commercials-set-status";

// ---------------------------------------------------------------------------
// ADAPTADOR HTTP (fino): GATE de sessão → executor → NextResponse
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  const sessao = await verificarSessao();
  if (!sessao.autorizada) {
    return NextResponse.json({ erro: sessao.erro }, { status: sessao.httpStatus });
  }

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Payload inválido: JSON esperado." }, { status: 400 });
  }

  const resposta = await executarSetStatus(sessao.supabase, sessao.user.id, corpo);
  if ("receipt" in resposta) {
    return NextResponse.json(resposta.receipt, { status: resposta.httpStatus });
  }
  return NextResponse.json({ erro: resposta.erro }, { status: resposta.httpStatus });
}
