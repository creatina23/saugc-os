"use client";

import { useState } from "react";
import {
  Bell,
  Bot,
  Camera,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  Database,
  Eye,
  KeyRound,
  Mail,
  Megaphone,
  MessageCircle,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  Workflow,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { settingsTabs, workspaces } from "@/lib/mock-data";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

const notificationOptions = [
  { id: "campanhas", icon: Megaphone, title: "Atualizações de campanhas", description: "Status, aprovações e pausas de campanhas ativas." },
  { id: "briefings", icon: CheckCircle2, title: "Briefings aprovados", description: "Aviso quando um cliente aprovar um briefing." },
  { id: "revisao", icon: Eye, title: "Comerciais em revisão", description: "Alerta quando um criativo entrar na coluna de revisão." },
  { id: "resumo", icon: Mail, title: "Resumo semanal por e-mail", description: "Relatório de segunda-feira com KPIs da operação." },
  { id: "ia", icon: Sparkles, title: "Alertas de IA", description: "Sugestões de novos criativos e prompts gerados." },
];

const members = [
  { name: "Mateus Costa", email: "mateus@saugc.studio", role: "Administrador", initials: "MC" },
  { name: "Ana Souza", email: "ana@saugc.studio", role: "Gestora de Tráfego", initials: "AS" },
  { name: "Pedro Lima", email: "pedro@saugc.studio", role: "Editor de Vídeo", initials: "PL" },
];

const usageMetrics = [
  { label: "Clientes", used: 5, total: 25, display: "5 de 25" },
  { label: "Gerações de IA", used: 128, total: 500, display: "128 de 500" },
  { label: "Armazenamento", used: 8, total: 100, display: "4,2 GB de 50 GB" },
];

const integrations = [
  { id: "openai", name: "OpenAI", description: "GPT-4o para copy e estratégia", icon: Bot, status: "Conectado" },
  { id: "supabase", name: "Supabase", description: "Banco, auth e storage (Sprint 002)", icon: Database, status: "Pendente" },
  { id: "whatsapp", name: "WhatsApp Cloud API", description: "Envio de briefings e relatórios", icon: MessageCircle, status: "Em breve" },
  { id: "n8n", name: "n8n", description: "Automações e webhooks da operação", icon: Workflow, status: "Em breve" },
];

const apiKey = "sk-saugc-live-9f2a••••••••••••••••";

export function ConfiguracoesView() {
  const [tab, setTab] = useState<string>(settingsTabs[0]);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    campanhas: true,
    briefings: true,
    revisao: false,
    resumo: true,
    ia: false,
  });
  const [copiedKey, setCopiedKey] = useState(false);

  async function copyApiKey() {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 1800);
    } catch {
      setCopiedKey(false);
    }
  }

  return (
    <>
      <PageHeader title="Configurações" description="Preferências do workspace e da conta.">
        <Button variant="secondary">
          <Save /> Salvar alterações
        </Button>
      </PageHeader>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="max-w-full justify-start overflow-x-auto">
          {settingsTabs.map((item) => (
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
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ws-name" className={fieldLabel}>Nome do workspace</label>
                <Input id="ws-name" defaultValue={workspaces[0].name} />
              </div>
              <div>
                <label htmlFor="ws-slug" className={fieldLabel}>URL pública</label>
                <Input id="ws-slug" defaultValue="saugc.app/studio" />
              </div>
              <div>
                <label htmlFor="ws-lang" className={fieldLabel}>Idioma</label>
                <Select defaultValue="pt-br">
                  <SelectTrigger id="ws-lang" aria-label="Selecionar idioma">
                    <SelectValue placeholder="Idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                    <SelectItem value="en">English (em breve)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="ws-tz" className={fieldLabel}>Fuso horário</label>
                <Select defaultValue="sp">
                  <SelectTrigger id="ws-tz" aria-label="Selecionar fuso horário">
                    <SelectValue placeholder="Fuso horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sp">(GMT-3) São Paulo</SelectItem>
                    <SelectItem value="utc">(GMT+0) UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="ws-desc" className={fieldLabel}>Descrição</label>
                <Textarea id="ws-desc" defaultValue="Estúdio de produção de anúncios UGC com inteligência artificial." className="min-h-[88px]" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de perigo</CardTitle>
              <CardDescription>Ações irreversíveis do workspace</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Excluir o workspace remove clientes, campanhas e assets mockados.
              </p>
              <Button variant="destructive" size="sm">
                <Trash2 /> Excluir workspace
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Perfil">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Seus dados de acesso e identidade na equipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarFallback className="text-lg">MC</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Mateus Costa</p>
                  <p className="text-sm text-muted-foreground">Administrador do workspace</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Camera /> Alterar foto
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="profile-name" className={fieldLabel}>Nome completo</label>
                  <Input id="profile-name" defaultValue="Mateus Costa" />
                </div>
                <div>
                  <label htmlFor="profile-email" className={fieldLabel}>E-mail</label>
                  <Input id="profile-email" type="email" defaultValue="mateus@saugc.studio" />
                </div>
                <div>
                  <label htmlFor="profile-role" className={fieldLabel}>Função</label>
                  <Select defaultValue="admin">
                    <SelectTrigger id="profile-role" aria-label="Selecionar função">
                      <SelectValue placeholder="Função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="gestor">Gestor de Tráfego</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="profile-phone" className={fieldLabel}>Telefone</label>
                  <Input id="profile-phone" defaultValue="(11) 98888-0000" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save /> Salvar perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Notificações">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Escolha o que acompanhar em tempo real</CardDescription>
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
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, [option.id]: checked }))
                    }
                    aria-label={`Ativar ${option.title}`}
                  />
                </div>
              ))}
              <div className="flex justify-end pt-4">
                <Button>
                  <Bell /> Salvar preferências
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Equipe & Permissões" className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Membros da equipe</CardTitle>
                <CardDescription>{members.length} pessoas com acesso ao workspace</CardDescription>
              </div>
              <Button size="sm">
                <UserPlus /> Convidar membro
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.email}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{member.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === "Administrador" ? "violet" : "secondary"}>
                      {member.role}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remover ${member.name}`}
                      className="size-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">
                Papéis seguem o modelo Administrador, Gestor e Editor. Permissões finas por módulo
                chegam com o modo multiusuário da Sprint 002.
              </p>
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
                    Plano Pro
                  </CardTitle>
                  <Badge variant="success">Atual</Badge>
                </div>
                <CardDescription>Para estúdios em crescimento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-bold">
                  R$ 297<span className="text-sm font-normal text-muted-foreground">/mês</span>
                </p>
                <div className="space-y-3">
                  {usageMetrics.map((metric) => (
                    <div key={metric.label}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{metric.label}</span>
                        <span>{metric.display}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          style={{ width: `${Math.round((metric.used / metric.total) * 100)}%` }}
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
                <CardTitle>Plano Enterprise</CardTitle>
                <CardDescription>Workspaces ilimitados, SSO e API avançada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-bold">
                  R$ 897<span className="text-sm font-normal text-muted-foreground">/mês</span>
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["Clientes e campanhas ilimitados", "Gerações de IA sem teto mensal", "Suporte prioritário e onboarding guiado"].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="size-4 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="ai" className="w-full">
                  <Crown /> Falar com vendas
                </Button>
                <Button variant="ghost" className="w-full text-muted-foreground">
                  Gerenciar método de pagamento
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="Integrações API" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="size-5 text-primary" />
                Chave de API do workspace
              </CardTitle>
              <CardDescription>Use para webhooks e automações externas (mock)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input readOnly value={apiKey} aria-label="Chave de API" className="font-mono-params" />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={copyApiKey}>
                    {copiedKey ? <Check className="text-success" /> : <Copy />}
                    {copiedKey ? "Copiada" : "Copiar"}
                  </Button>
                  <Button variant="secondary">
                    <RefreshCw /> Regenerar
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Na Sprint 002, chaves reais ficam apenas no backend. Nunca exponha segredos no frontend.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Serviços conectados</CardTitle>
              <CardDescription>Integrações planejadas na ordem oficial do roadmap</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <integration.icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{integration.name}</p>
                      <p className="text-xs text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        integration.status === "Conectado"
                          ? "success"
                          : integration.status === "Pendente"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {integration.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={integration.status === "Em breve"}
                    >
                      {integration.status === "Conectado" ? "Gerenciar" : "Conectar"}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}