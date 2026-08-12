"use client";

// ------------------------------------------------------------------
// Configurações — REAL (conta Supabase + user_metadata).
// • Perfil: nome gravado na conta + e-mail real + troca de senha de
//   verdade + FOTO DE PERFIL real (016c: bucket "avatars", pasta do
//   dono, endereço no crachá user_metadata.avatar_url).
// • Workspace: nome/descrição/fuso gravados na conta.
// • Notificações: preferências com autosave (persistem de verdade).
// • Equipe: mostra o dono real (multiusuário = em breve, honesto).
// • Plano: "Fundador — Cliente Zero" + métricas REAIS de uso.
// • Verdade na tela: nada de chave fake, plano fake ou botão de enfeite.
// ------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Bot,
  Check,
  CheckCircle2,
  Crown,
  Database,
  Eye,
  ImagePlus,
  Loader2,
  Mail,
  Megaphone,
  MessageCircle,
  Save,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Workflow,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseBrowser } from "@/lib/supabase/client";


const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const ABAS = ["Geral", "Perfil", "Notificações", "Equipe & Permissões", "Faturamento & Plano", "Integrações API"];

const notificationOptions = [
  { id: "campanhas", icon: Megaphone, title: "Atualizações de campanhas", description: "Status, aprovações e pausas de campanhas ativas." },
  { id: "briefings", icon: CheckCircle2, title: "Briefings aprovados", description: "Aviso quando um cliente aprovar um briefing." },
  { id: "revisao", icon: Eye, title: "Comerciais em revisão", description: "Alerta quando um criativo entrar na coluna de revisão." },
  { id: "resumo", icon: Mail, title: "Resumo semanal por e-mail", description: "Relatório de segunda-feira com KPIs da operação." },
  { id: "ia", icon: Sparkles, title: "Alertas de IA", description: "Sugestões de novos criativos e prompts gerados." },
];

const NOTIFS_PADRAO: Record<string, boolean> = {
  campanhas: true,
  briefings: true,
  revisao: false,
  resumo: true,
  ia: false,
};

// 016c — regras da foto de perfil
const MAX_FOTO_BYTES = 2 * 1024 * 1024; // 2 MB
const EXTENSOES_FOTO: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

type Feedback = { area: string; ok: boolean; texto: string } | null;

function iniciaisDe(texto: string): string {
  const base = texto.includes("@") ? texto.split("@")[0] : texto;
  const partes = base.replace(/[._-]+/g, " ").trim().split(/\s+/);
  return partes
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatarTamanho(bytes: number): string {
  if (bytes <= 0) return "0 MB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}


export function ConfiguracoesView() {
  const [carregando, setCarregando] = useState(true);
  const [semBanco, setSemBanco] = useState(false);
  const [tab, setTab] = useState<string>(ABAS[0]);

  // Sua conta
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [perfilNome, setPerfilNome] = useState("");
  const [iniciais, setIniciais] = useState("AD");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  // Workspace (persistido na conta)
  const [wsNome, setWsNome] = useState("");
  const [wsDesc, setWsDesc] = useState("");
  const [wsFuso, setWsFuso] = useState("sp");

  // Senha
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaConfirma, setSenhaConfirma] = useState("");

  // Notificações (autosave)
  const [notifications, setNotifications] = useState<Record<string, boolean>>(NOTIFS_PADRAO);

  // Métricas reais de uso
  const [usoClientes, setUsoClientes] = useState(0);
  const [usoBiblioteca, setUsoBiblioteca] = useState(0);
  const [usoStorageBytes, setUsoStorageBytes] = useState(0);

  const [salvando, setSalvando] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  // Carga inicial — setState SÓ em .then() (lei do ESLint)
  useEffect(() => {
    let ativo = true;
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      Promise.resolve().then(() => {
        if (!ativo) return;
        setSemBanco(true);
        setCarregando(false);
      });
      return () => {
        ativo = false;
      };
    }

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!ativo) return;
      if (!user) {
        setCarregando(false);
        return;
      }
      const meta = (user.user_metadata ?? {}) as {
        full_name?: string;
        avatar_url?: string;
        workspace?: { nome?: string; descricao?: string; fuso?: string };
        notificacoes?: Record<string, boolean>;
      };
      const nome = meta.full_name?.trim() || user.email?.split("@")[0] || "Administrador";
      setUserId(user.id);
      setEmail(user.email ?? "");
      setPerfilNome(meta.full_name ?? "");
      setIniciais(iniciaisDe(meta.full_name?.trim() || user.email || "admin"));
      setAvatarUrl(meta.avatar_url ?? null);
      setWsNome(meta.workspace?.nome ?? "");
      setWsDesc(meta.workspace?.descricao ?? "");
      setWsFuso(meta.workspace?.fuso ?? "sp");
      setNotifications({ ...NOTIFS_PADRAO, ...(meta.notificacoes ?? {}) });
      void nome;

      // Métricas reais (contagens + soma do Storage)
      const [resClientes, resBiblioteca, resAssets] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("library_items").select("id", { count: "exact", head: true }),
        supabase.from("assets").select("size_bytes"),
      ]);
      if (!ativo) return;
      setUsoClientes(resClientes.count ?? 0);
      setUsoBiblioteca(resBiblioteca.count ?? 0);
      const soma = ((resAssets.data ?? []) as { size_bytes: number | null }[]).reduce(
        (acc, linha) => acc + (linha.size_bytes ?? 0),
        0
      );
      setUsoStorageBytes(soma);
      setCarregando(false);
    });

    return () => {
      ativo = false;
    };
  }, []);

  function anunciar(area: string, ok: boolean, texto: string) {
    setFeedback({ area, ok, texto });
    if (ok) {
      setTimeout(() => {
        setFeedback((atual) => (atual?.area === area && atual.ok ? null : atual));
      }, 3000);
    }
  }

  function feedbackDaArea(area: string) {
    if (!feedback || feedback.area !== area) return null;
    return (
      <p role={feedback.ok ? "status" : "alert"} className={`text-xs ${feedback.ok ? "text-success" : "text-red-400"}`}>
        {feedback.texto}
      </p>
    );
  }

  async function handleSalvarWorkspace() {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      anunciar("workspace", false, "Banco não configurado — ajustes precisam dele.");
      return;
    }
    setSalvando("workspace");
    const { error } = await supabase.auth.updateUser({
      data: {
        workspace: {
          nome: wsNome.trim(),
          descricao: wsDesc.trim(),
          fuso: wsFuso,
        },
      },
    });
    setSalvando(null);
    anunciar(
      "workspace",
      !error,
      error
        ? `Não consegui gravar. Detalhe técnico: ${error.message}`
        : "Workspace gravado ✓ (sobrevive ao F5)"
    );
  }

  async function handleSalvarPerfil() {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      anunciar("perfil", false, "Banco não configurado — ajustes precisam dele.");
      return;
    }
    setSalvando("perfil");
    const nomeLimpo = perfilNome.trim();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: nomeLimpo },
    });
    setSalvando(null);
    if (error) {
      anunciar("perfil", false, `Não consegui gravar. Detalhe técnico: ${error.message}`);
      return;
    }
    setIniciais(iniciaisDe(nomeLimpo || email));
    anunciar("perfil", true, "Perfil gravado ✓ — já vale na próxima tela");
  }

  // 016c — Foto de perfil: valida → sobe no bucket "avatars" (pasta do
  // dono) → grava o endereço no crachá (user_metadata.avatar_url).
  // A barra lateral e o topo escutam a troca sozinhos (USER_UPDATED).
  async function handleTrocarFoto(arquivo: File | null) {
    if (!arquivo) return;
    const supabase = getSupabaseBrowser();
    if (!supabase || !userId) {
      anunciar("perfil", false, "Banco não configurado — a foto precisa dele.");
      return;
    }
    const extensao = EXTENSOES_FOTO[arquivo.type];
    if (!extensao) {
      anunciar("perfil", false, "Formato não vale. Use PNG, JPG ou WebP.");
      return;
    }
    if (arquivo.size > MAX_FOTO_BYTES) {
      anunciar("perfil", false, "Foto acima de 2 MB. Escolha uma mais leve.");
      return;
    }

    setSalvando("foto");
    const caminho = `${userId}/avatar.${extensao}`;
    const { error: erroUpload } = await supabase.storage
      .from("avatars")
      .upload(caminho, arquivo, { upsert: true, contentType: arquivo.type });
    if (erroUpload) {
      setSalvando(null);
      anunciar("perfil", false, `Não consegui enviar a foto. Detalhe técnico: ${erroUpload.message}`);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(caminho);
    const urlComVersao = `${data.publicUrl}?v=${Date.now()}`;
    const { error: erroPerfil } = await supabase.auth.updateUser({
      data: { avatar_url: urlComVersao },
    });
    setSalvando(null);
    if (erroPerfil) {
      anunciar("perfil", false, `A foto subiu mas não grudou no perfil. Detalhe técnico: ${erroPerfil.message}`);
      return;
    }
    setAvatarUrl(urlComVersao);
    anunciar("perfil", true, "Foto no ar ✓ — ela já aparece na barra lateral e no topo");
  }

  async function handleTrocarSenha() {
    if (senhaNova.length < 6) {
      anunciar("senha", false, "A nova senha precisa de pelo menos 6 caracteres.");
      return;
    }
    if (senhaNova !== senhaConfirma) {
      anunciar("senha", false, "A confirmação não bate com a nova senha.");
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      anunciar("senha", false, "Banco não configurado — ajustes precisam dele.");
      return;
    }
    setSalvando("senha");
    const { error } = await supabase.auth.updateUser({ password: senhaNova });
    setSalvando(null);
    if (error) {
      anunciar("senha", false, `Não consegui trocar a senha. Detalhe técnico: ${error.message}`);
      return;
    }
    setSenhaNova("");
    setSenhaConfirma("");
    anunciar("senha", true, "Senha trocada ✓ — vale no próximo login");
  }

  async function handleNotificacao(id: string, valor: boolean) {
    const novo = { ...notifications, [id]: valor };
    setNotifications(novo);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      anunciar("notificacoes", false, "Banco não configurado — preferências não foram gravadas.");
      return;
    }
    const { error } = await supabase.auth.updateUser({
      data: { notificacoes: novo },
    });
    anunciar(
      "notificacoes",
      !error,
      error
        ? `Não consegui gravar a preferência. Detalhe técnico: ${error.message}`
        : "Preferências guardadas ✓"
    );
  }

  const usoArmazenamentoRotulo = formatarTamanho(usoStorageBytes);
  const usoMetrics = [
    { label: "Clientes cadastrados", usado: usoClientes, teto: 25, display: `${usoClientes} de 25` },
    { label: "Itens na biblioteca", usado: usoBiblioteca, teto: 100, display: `${usoBiblioteca} de 100` },
    { label: "Armazenamento usado", usado: usoStorageBytes, teto: 1024 * 1024 * 1024, display: `${usoArmazenamentoRotulo} de 1 GB` },
  ];

  const integracaoSupabase = semBanco ? "Sem configuração" : "Conectado";
  const integracoes = [
    { id: "supabase", nome: "Supabase", descricao: "Banco, login e nuvem de arquivos — tudo real", icon: Database, status: integracaoSupabase },
    { id: "gemini", nome: "IA Gemini (motor /api/ia)", descricao: "Texto dos agentes — autodescoberta de modelo", icon: Bot, status: "Conectado" },
    { id: "whatsapp", nome: "WhatsApp Cloud API", descricao: "Envio de briefings e relatórios ao cliente", icon: MessageCircle, status: "Em breve" },
    { id: "n8n", nome: "n8n", descricao: "Automações e webhooks da operação", icon: Workflow, status: "Em breve" },
  ];

  if (carregando) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Carregando configurações">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-white/10" />
        <div className="h-10 w-full max-w-xl animate-pulse rounded-lg bg-white/5" />
        <div className="h-80 animate-pulse rounded-2xl bg-white/5" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Configurações"
        badge={semBanco ? "Sem banco configurado" : "Sua conta"}
        description="Preferências do workspace e da conta."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="max-w-full justify-start overflow-x-auto">
          {ABAS.map((item) => (
            <TabsTrigger key={item} value={item}>
              {item}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ---------- Geral ---------- */}
        <TabsContent value="Geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workspace</CardTitle>
              <CardDescription>Informações públicas do espaço de trabalho</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="ws-name" className={fieldLabel}>Nome do workspace</label>
                  <Input
                    id="ws-name"
                    value={wsNome}
                    onChange={(event) => setWsNome(event.target.value)}
                    placeholder="Ex.: Studio AnuncIA"
                  />
                </div>
                <div>
                  <label htmlFor="ws-tz" className={fieldLabel}>Fuso horário</label>
                  <Select value={wsFuso} onValueChange={setWsFuso}>
                    <SelectTrigger id="ws-tz" aria-label="Selecionar fuso horário">
                      <SelectValue placeholder="Fuso horário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sp">(GMT-3) São Paulo</SelectItem>
                      <SelectItem value="utc">(GMT+0) UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label htmlFor="ws-desc" className={fieldLabel}>Descrição</label>
                <Textarea
                  id="ws-desc"
                  value={wsDesc}
                  onChange={(event) => setWsDesc(event.target.value)}
                  placeholder="Estúdio de produção de anúncios com inteligência artificial."
                  className="min-h-[88px]"
                />
              </div>
              <div>
                <p className={fieldLabel}>Idioma</p>
                <p className="text-sm">Português (Brasil) <span className="text-xs text-muted-foreground">— outros idiomas em breve</span></p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3">
                {feedbackDaArea("workspace")}
                <Button onClick={() => void handleSalvarWorkspace()} disabled={salvando === "workspace"}>
                  {salvando === "workspace" ? <Loader2 className="animate-spin" /> : <Save />}
                  Salvar workspace
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">
                Sem zona de perigo por aqui: exclusão de conta e dados só chega
                quando existir um fluxo seguro (confirmação dupla e backup).
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- Perfil ---------- */}
        <TabsContent value="Perfil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Seus dados de identidade na equipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt="Sua foto de perfil" /> : null}
                  <AvatarFallback className="text-lg">{iniciais}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{perfilNome.trim() || "Administrador"}</p>
                  <p className="text-sm text-muted-foreground">{email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="violet">Administrador do workspace</Badge>
                    {/* 016c — o seletor de arquivo é invisível; o botão aciona ele */}
                    <input
                      ref={inputFotoRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      aria-hidden="true"
                      onChange={(event) => {
                        void handleTrocarFoto(event.target.files?.[0] ?? null);
                        event.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => inputFotoRef.current?.click()}
                      disabled={salvando === "foto"}
                    >
                      {salvando === "foto" ? <Loader2 className="animate-spin" /> : <ImagePlus />}
                      {salvando === "foto" ? "Enviando…" : avatarUrl ? "Trocar foto" : "Enviar foto"}
                    </Button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    PNG, JPG ou WebP · até 2 MB
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="profile-name" className={fieldLabel}>Nome completo</label>
                  <Input
                    id="profile-name"
                    value={perfilNome}
                    onChange={(event) => setPerfilNome(event.target.value)}
                    placeholder="Seu nome como aparece na equipe"
                  />
                </div>
                <div>
                  <label htmlFor="profile-email" className={fieldLabel}>E-mail de acesso</label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={email}
                    readOnly
                    aria-readonly="true"
                    className="opacity-70"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3">
                {feedbackDaArea("perfil")}
                <Button onClick={() => void handleSalvarPerfil()} disabled={salvando === "perfil"}>
                  {salvando === "perfil" ? <Loader2 className="animate-spin" /> : <Save />}
                  Salvar perfil
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Troque a senha de acesso — vale no próximo login</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="pass-new" className={fieldLabel}>Nova senha</label>
                  <Input
                    id="pass-new"
                    type="password"
                    value={senhaNova}
                    onChange={(event) => setSenhaNova(event.target.value)}
                    placeholder="mínimo 6 caracteres"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label htmlFor="pass-confirm" className={fieldLabel}>Confirmar nova senha</label>
                  <Input
                    id="pass-confirm"
                    type="password"
                    value={senhaConfirma}
                    onChange={(event) => setSenhaConfirma(event.target.value)}
                    placeholder="repita a nova senha"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3">
                {feedbackDaArea("senha")}
                <Button onClick={() => void handleTrocarSenha()} disabled={salvando === "senha"}>
                  {salvando === "senha" ? <Loader2 className="animate-spin" /> : <Save />}
                  Trocar senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- Notificações ---------- */}
        <TabsContent value="Notificações">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Preferências com gravação automática — entram em ação quando os
                alertas forem ligados (fase de automações)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {notificationOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <option.icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{option.title}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications[option.id]}
                    onCheckedChange={(checked) => void handleNotificacao(option.id, checked)}
                    aria-label={`Ativar ${option.title}`}
                  />
                </div>
              ))}
              <div className="flex items-center justify-end gap-2 pt-3">
                <Bell className="size-3.5 text-muted-foreground" />
                {feedbackDaArea("notificacoes") ?? (
                  <p className="text-xs text-muted-foreground">
                    Cada interruptor grava na hora — sem botão Salvar.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- Equipe ---------- */}
        <TabsContent value="Equipe & Permissões" className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Membros da equipe</CardTitle>
                <CardDescription>1 pessoa com acesso ao workspace</CardDescription>
              </div>
              <Button size="sm" disabled title="Multiusuário chega junto com o Portal do Cliente">
                <UserPlus /> Convidar membro · em breve
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {avatarUrl ? <AvatarImage src={avatarUrl} alt="Sua foto de perfil" /> : null}
                    <AvatarFallback>{iniciais}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{perfilNome.trim() || "Administrador"}</p>
                    <p className="text-xs text-muted-foreground">{email}</p>
                  </div>
                </div>
                <Badge variant="violet">Administrador</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">
                Hoje o sistema é de dono único por design: cada conta vê só os
                próprios dados (trava de segurança no banco). Perfis como Gestor
                e Editor chegam com o modo multiusuário.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- Faturamento & Plano ---------- */}
        <TabsContent value="Faturamento & Plano" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-primary/40 shadow-[0_0_0_1px_rgba(59,130,246,0.25)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="size-5 text-primary" />
                    Plano Fundador
                  </CardTitle>
                  <Badge variant="success">Cliente Zero</Badge>
                </div>
                <CardDescription>
                  Acesso total enquanto o AnuncIA nasce — cobrança chega na fase comercial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-bold">
                  R$ 0<span className="text-sm font-normal text-muted-foreground">/mês</span>
                </p>
                <div className="space-y-3">
                  {usoMetrics.map((metric) => (
                    <div key={metric.label}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{metric.label}</span>
                        <span>{metric.display}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          style={{
                            width: `${Math.min(100, Math.round((metric.usado / metric.teto) * 100))}%`,
                          }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-ai"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Uso real do seu cofre — atualiza a cada visita nesta página.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>O que vem por aí</CardTitle>
                <CardDescription>Próximas peças do roadmap (sem promessa vazia)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "Portal do Cliente — ele vê mídias e aprovações em tempo real",
                    "Link público de Briefing — cliente preenche sem login",
                    "Relatório de 1 clique — métricas de campanha comentadas pela IA",
                    "Multiusuário e cobrança — na fase comercial",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Badge variant="secondary">Em breve — na ordem do roadmap</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---------- Integrações API ---------- */}
        <TabsContent value="Integrações API" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Serviços conectados</CardTitle>
              <CardDescription>
                A verdade sobre cada integração — quando uma chegar, aparece aqui com botão de verdade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {integracoes.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <integration.icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{integration.nome}</p>
                      <p className="text-xs text-muted-foreground">{integration.descricao}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      integration.status === "Conectado"
                        ? "success"
                        : integration.status === "Em breve"
                          ? "secondary"
                          : "warning"
                    }
                  >
                    {integration.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">
                Chaves e segredos moram só no servidor e nas variáveis de
                ambiente — nunca na tela. Por isso esta página não mostra nem
                guarda nenhuma chave.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}