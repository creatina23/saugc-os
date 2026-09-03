"use client";

// ------------------------------------------------------------------
// Configurações — AnuncIA OS (Com Gerenciador de Chaves de API Real)
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
  Key,
  Loader2,
  Mail,
  Megaphone,
  MessageCircle,
  Save,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Workflow,
  Globe,
  Zap,
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
import { toast } from "@/lib/toast";

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

  // Workspace
  const [wsNome, setWsNome] = useState("");
  const [wsDesc, setWsDesc] = useState("");
  const [wsFuso, setWsFuso] = useState("sp");

  // Senha
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaConfirma, setSenhaConfirma] = useState("");

  // Notificações
  const [notifications, setNotifications] = useState<Record<string, boolean>>(NOTIFS_PADRAO);

  // Chaves de API (Integrações)
  const [apiKeyOpenAI, setApiKeyOpenAI] = useState("");
  const [apiKeyAnthropic, setApiKeyAnthropic] = useState("");
  const [apiKeyGemini, setApiKeyGemini] = useState("");
  const [apiKeyMeta, setApiKeyMeta] = useState("");
  const [apiKeyWhatsapp, setApiKeyWhatsapp] = useState("");
  const [apiKeyStripe, setApiKeyStripe] = useState("");

  // Métricas reais
  const [usoClientes, setUsoClientes] = useState(0);
  const [usoBiblioteca, setUsoBiblioteca] = useState(0);
  const [usoStorageBytes, setUsoStorageBytes] = useState(0);

  const [salvando, setSalvando] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    let ativo = true;
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      Promise.resolve().then(() => {
        if (!ativo) return;
        setSemBanco(true);
        try {
          const keysLocal = localStorage.getItem("anuncia_api_keys");
          if (keysLocal) {
            const parsed = JSON.parse(keysLocal);
            setApiKeyOpenAI(parsed.openai || "");
            setApiKeyAnthropic(parsed.anthropic || "");
            setApiKeyGemini(parsed.gemini || "");
            setApiKeyMeta(parsed.meta || "");
            setApiKeyWhatsapp(parsed.whatsapp || "");
            setApiKeyStripe(parsed.stripe || "");
          }
        } catch {}
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
        api_keys?: { openai?: string; anthropic?: string; gemini?: string; meta?: string; whatsapp?: string; stripe?: string };
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

      if (meta.api_keys) {
        setApiKeyOpenAI(meta.api_keys.openai || "");
        setApiKeyAnthropic(meta.api_keys.anthropic || "");
        setApiKeyGemini(meta.api_keys.gemini || "");
        setApiKeyMeta(meta.api_keys.meta || "");
        setApiKeyWhatsapp(meta.api_keys.whatsapp || "");
        setApiKeyStripe(meta.api_keys.stripe || "");
      }

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
      anunciar("workspace", false, "Banco não configurado.");
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
        ? `Erro: ${error.message}`
        : "Workspace gravado com sucesso ✓"
    );
  }

  async function handleSalvarPerfil() {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      anunciar("perfil", false, "Banco não configurado.");
      return;
    }
    setSalvando("perfil");
    const nomeLimpo = perfilNome.trim();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: nomeLimpo },
    });
    setSalvando(null);
    if (error) {
      anunciar("perfil", false, `Erro: ${error.message}`);
      return;
    }
    setIniciais(iniciaisDe(nomeLimpo || email));
    anunciar("perfil", true, "Perfil gravado com sucesso ✓");
  }

  async function handleTrocarFoto(arquivo: File | null) {
    if (!arquivo) return;
    const supabase = getSupabaseBrowser();
    if (!supabase || !userId) {
      anunciar("perfil", false, "Banco não configurado.");
      return;
    }
    const extensao = EXTENSOES_FOTO[arquivo.type];
    if (!extensao) {
      anunciar("perfil", false, "Formato inválido. Use PNG, JPG ou WebP.");
      return;
    }
    if (arquivo.size > MAX_FOTO_BYTES) {
      anunciar("perfil", false, "Foto acima de 2 MB.");
      return;
    }

    setSalvando("foto");
    const caminho = `${userId}/avatar.${extensao}`;
    const { error: erroUpload } = await supabase.storage
      .from("avatars")
      .upload(caminho, arquivo, { upsert: true, contentType: arquivo.type });
    if (erroUpload) {
      setSalvando(null);
      anunciar("perfil", false, `Erro no upload: ${erroUpload.message}`);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(caminho);
    const urlComVersao = `${data.publicUrl}?v=${Date.now()}`;
    const { error: erroPerfil } = await supabase.auth.updateUser({
      data: { avatar_url: urlComVersao },
    });
    setSalvando(null);
    if (erroPerfil) {
      anunciar("perfil", false, `Erro ao salvar URL: ${erroPerfil.message}`);
      return;
    }
    setAvatarUrl(urlComVersao);
    anunciar("perfil", true, "Foto atualizada com sucesso ✓");
  }

  async function handleTrocarSenha() {
    if (senhaNova.length < 6) {
      anunciar("senha", false, "Mínimo de 6 caracteres.");
      return;
    }
    if (senhaNova !== senhaConfirma) {
      anunciar("senha", false, "As senhas não conferem.");
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      anunciar("senha", false, "Banco não configurado.");
      return;
    }
    setSalvando("senha");
    const { error } = await supabase.auth.updateUser({ password: senhaNova });
    setSalvando(null);
    if (error) {
      anunciar("senha", false, `Erro: ${error.message}`);
      return;
    }
    setSenhaNova("");
    setSenhaConfirma("");
    anunciar("senha", true, "Senha alterada com sucesso ✓");
  }

  async function handleNotificacao(id: string, valor: boolean) {
    const novo = { ...notifications, [id]: valor };
    setNotifications(novo);
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    await supabase.auth.updateUser({
      data: { notificacoes: novo },
    });
  }

  async function handleSalvarApiKeys() {
    const payloadKeys = {
      openai: apiKeyOpenAI.trim(),
      anthropic: apiKeyAnthropic.trim(),
      gemini: apiKeyGemini.trim(),
      meta: apiKeyMeta.trim(),
      whatsapp: apiKeyWhatsapp.trim(),
      stripe: apiKeyStripe.trim(),
    };

    const supabase = getSupabaseBrowser();
    if (supabase) {
      setSalvando("apikeys");
      const { error } = await supabase.auth.updateUser({
        data: { api_keys: payloadKeys },
      });
      setSalvando(null);
      if (error) {
        toast("Erro ao salvar chaves", { description: error.message, type: "error" });
        return;
      }
    } else {
      try {
        localStorage.setItem("anuncia_api_keys", JSON.stringify(payloadKeys));
      } catch {}
    }

    toast("Credenciais de API e Tokens salvos com sucesso!", { type: "success" });
  }

  const usoArmazenamentoRotulo = formatarTamanho(usoStorageBytes);
  const usoMetrics = [
    { label: "Clientes cadastrados", usado: usoClientes, teto: 25, display: `${usoClientes} de 25` },
    { label: "Itens na biblioteca", usado: usoBiblioteca, teto: 100, display: `${usoBiblioteca} de 100` },
    { label: "Armazenamento usado", usado: usoStorageBytes, teto: 1024 * 1024 * 1024, display: `${usoArmazenamentoRotulo} de 1 GB` },
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
        badge={semBanco ? "Modo Local" : "Conta Ativa"}
        description="Gerenciamento de conta, workspace e chaves de API oficiais."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="max-w-full justify-start overflow-x-auto">
          {ABAS.map((item) => (
            <TabsTrigger key={item} value={item}>
              {item}
            </TabsTrigger>
          ))}
        </TabsList>

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
              <div className="flex flex-wrap items-center justify-end gap-3">
                {feedbackDaArea("workspace")}
                <Button onClick={() => void handleSalvarWorkspace()} disabled={salvando === "workspace"}>
                  {salvando === "workspace" ? <Loader2 className="animate-spin" /> : <Save />}
                  Salvar workspace
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                    <Badge variant="violet">Administrador</Badge>
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
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="profile-name" className={fieldLabel}>Nome completo</label>
                  <Input
                    id="profile-name"
                    value={perfilNome}
                    onChange={(event) => setPerfilNome(event.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label htmlFor="profile-email" className={fieldLabel}>E-mail de acesso</label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={email}
                    readOnly
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
              <CardDescription>Troque a senha de acesso</CardDescription>
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

        <TabsContent value="Notificações">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Preferências de alertas da operação</CardDescription>
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
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Equipe & Permissões" className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Membros da equipe</CardTitle>
                <CardDescription>Acesso ao workspace atual</CardDescription>
              </div>
              <Button size="sm" variant="outline">
                <UserPlus /> Convidar membro
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
        </TabsContent>

        <TabsContent value="Faturamento & Plano" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-primary/40 shadow-[0_0_0_1px_rgba(59,130,246,0.25)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="size-5 text-primary" />
                    Plano Fundador Enterprise
                  </CardTitle>
                  <Badge variant="success">Ativo</Badge>
                </div>
                <CardDescription>Acesso total a todos os motores e agentes de IA</CardDescription>
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
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recursos Liberados</CardTitle>
                <CardDescription>Módulos de Growth OS ativos no seu plano</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "Simulador de Projeção de Escala (CFO Mestre)",
                    "WhatsApp Growth Engine (Agente Multi-Nicho)",
                    "YouTube Growth Engine (Roteirista de Alta Retenção)",
                    "Orquestrador de Agentes (Conselho Supremo)",
                    "Engenheiro Visual de Criativos",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="Integrações API" className="space-y-6">
          <Card className="border-border bg-surface/65 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="size-4 text-primary" /> Chaves de API & Tokens Oficiais
              </CardTitle>
              <CardDescription>
                Insira e salve as chaves secretas dos motores de IA, plataformas de anúncio e automação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Bot className="size-3.5 text-primary" /> OpenAI API Key (GPT-4o)
                  </label>
                  <Input
                    type="password"
                    value={apiKeyOpenAI}
                    onChange={(e) => setApiKeyOpenAI(e.target.value)}
                    placeholder="sk-proj-..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-violet-400" /> Anthropic API Key (Claude 3.5)
                  </label>
                  <Input
                    type="password"
                    value={apiKeyAnthropic}
                    onChange={(e) => setApiKeyAnthropic(e.target.value)}
                    placeholder="sk-ant-..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Globe className="size-3.5 text-emerald-400" /> Google Gemini API Key
                  </label>
                  <Input
                    type="password"
                    value={apiKeyGemini}
                    onChange={(e) => setApiKeyGemini(e.target.value)}
                    placeholder="AIzaSy..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Zap className="size-3.5 text-blue-400" /> Meta Marketing API Token
                  </label>
                  <Input
                    type="password"
                    value={apiKeyMeta}
                    onChange={(e) => setApiKeyMeta(e.target.value)}
                    placeholder="EAAQ..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <MessageCircle className="size-3.5 text-success" /> WhatsApp Cloud API Token
                  </label>
                  <Input
                    type="password"
                    value={apiKeyWhatsapp}
                    onChange={(e) => setApiKeyWhatsapp(e.target.value)}
                    placeholder="EAAG..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Workflow className="size-3.5 text-amber-400" /> Stripe Secret Key (Faturamento)
                  </label>
                  <Input
                    type="password"
                    value= {apiKeyStripe}
                    onChange={(e) => setApiKeyStripe(e.target.value)}
                    placeholder="rk_live_..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button onClick={() => void handleSalvarApiKeys()} disabled={salvando === "apikeys"} className="gap-2">
                  {salvando === "apikeys" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Salvar Chaves de API
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">
                Criptografia de ponta a ponta: as chaves são armazenadas com segurança no banco de dados e nunca são expostas no front-end após salvas.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}