import type {
  ActivityLog,
  AiHistoryItem,
  AiModel,
  AppNotification,
  Asset,
  Briefing,
  Campaign,
  Client,
  Commercial,
  DashboardMetric,
  Deal,
  LibraryItem,
  PromptItem,
  RevenuePoint,
} from "@/types";

export const dashboardMetrics: DashboardMetric[] = [
  { label: "MRR", value: "R$ 284.500", change: "+12,4% vs mês anterior", trend: "up" },
  { label: "Conversões", value: "1.842", change: "+8,2% esta semana", trend: "up" },
  { label: "Campanhas UGC Ativas", value: "37", change: "5 novas em março", trend: "up" },
  { label: "ROI Médio", value: "4,2x", change: "+0,3x no trimestre", trend: "up" },
];

export const revenueTrajectory: RevenuePoint[] = [
  { month: "Out", value: 198000 },
  { month: "Nov", value: 215000 },
  { month: "Dez", value: 232000 },
  { month: "Jan", value: 248000 },
  { month: "Fev", value: 265000 },
  { month: "Mar", value: 284500 },
];

export const activityLog: ActivityLog[] = [
  { id: "a1", message: "Campanha TikTok 'Verão Glow' aprovada para Vitória Moda", timestamp: "Há 12 min", type: "campaign" },
  { id: "a2", message: "Novo deal R$ 48.000 movido para Negociação — TechFlow SaaS", timestamp: "Há 45 min", type: "deal" },
  { id: "a3", message: "Cliente NutriPlus assinou tier Growth (MRR R$ 12.900)", timestamp: "Há 2 h", type: "client" },
  { id: "a4", message: "Asset 'Hook_03_UGC.mp4' enviado para biblioteca compartilhada", timestamp: "Há 3 h", type: "asset" },
  { id: "a5", message: "Sincronização mock de integrações concluída", timestamp: "Há 5 h", type: "system" },
];

export const campaignPerformance = [
  { platform: "Meta Ads", spend: 84200, conversions: 620, color: "bg-blue-500" },
  { platform: "TikTok", spend: 52800, conversions: 890, color: "bg-pink-500" },
  { platform: "Google Ads", spend: 39100, conversions: 332, color: "bg-emerald-500" },
];

export const clients: Client[] = [
  { id: "c1", name: "Mariana Costa", company: "Vitória Moda", email: "mariana@vitoriamoda.com.br", phone: "(11) 98765-4321", tier: "Enterprise", status: "Ativo", mrr: 28900, logoInitials: "VM", since: "2024-03" },
  { id: "c2", name: "Rafael Mendes", company: "NutriPlus", email: "rafael@nutriplus.com.br", phone: "(21) 99876-5432", tier: "Growth", status: "Ativo", mrr: 12900, logoInitials: "NP", since: "2024-08" },
  { id: "c3", name: "Camila Rocha", company: "EcoHome BR", email: "camila@ecohome.br", phone: "(31) 97654-3210", tier: "Starter", status: "Em onboarding", mrr: 4900, logoInitials: "EH", since: "2025-01" },
  { id: "c4", name: "Lucas Ferreira", company: "TechFlow SaaS", email: "lucas@techflow.io", phone: "(48) 99123-4567", tier: "Enterprise", status: "Ativo", mrr: 42000, logoInitials: "TF", since: "2023-11" },
  { id: "c5", name: "Beatriz Alves", company: "FitClub App", email: "beatriz@fitclub.app", phone: "(85) 98888-7777", tier: "Growth", status: "Inativo", mrr: 0, logoInitials: "FC", since: "2024-05" },
];

export const campaigns: Campaign[] = [
  { id: "cp1", name: "Verão Glow — UGC Creators", client: "Vitória Moda", platform: "TikTok", status: "Ativa", budget: 45000, spend: 31200, impressions: 2400000, ctr: 3.8, stage: "Otimização" },
  { id: "cp2", name: "Retargeting Carrinho", client: "NutriPlus", platform: "Meta Ads", status: "Ativa", budget: 22000, spend: 18400, impressions: 890000, ctr: 2.1, stage: "Escala" },
  { id: "cp3", name: "Search Brand — TechFlow", client: "TechFlow SaaS", platform: "Google Ads", status: "Pausada", budget: 15000, spend: 9800, impressions: 420000, ctr: 4.5, stage: "Pausada" },
  { id: "cp4", name: "Lançamento EcoHome", client: "EcoHome BR", platform: "Meta Ads", status: "Rascunho", budget: 8000, spend: 0, impressions: 0, ctr: 0, stage: "Briefing" },
];

export const briefings: Briefing[] = [
  { id: "b1", title: "UGC Unboxing — Linha Skincare", client: "Vitória Moda", creator: "@ana.cria", status: "Em Aprovação", deadline: "28/03/2025", tags: ["Unboxing", "15s", "Hook forte"] },
  { id: "b2", title: "Testimonial NutriPlus — Transformação", client: "NutriPlus", creator: "@joao.fitness", status: "Aprovado", deadline: "02/04/2025", tags: ["Depoimento", "Before/After"] },
  { id: "b3", title: "EcoHome — Tour do Produto", client: "EcoHome BR", creator: "@livia.home", status: "Rascunho", deadline: "10/04/2025", tags: ["B-Roll", "Lifestyle"] },
];

export const deals: Deal[] = [
  { id: "d1", title: "Pacote Enterprise Anual", company: "TechFlow SaaS", value: 480000, stage: "Negociação", owner: "Pedro Lima", probability: 75 },
  { id: "d2", title: "Campanhas Q2 — Growth", company: "NutriPlus", value: 96000, stage: "Proposta Enviada", owner: "Ana Souza", probability: 55 },
  { id: "d3", title: "Pilot UGC 90 dias", company: "EcoHome BR", value: 42000, stage: "Qualificação", owner: "Pedro Lima", probability: 30 },
  { id: "d4", title: "Renovação + Upsell Creators", company: "Vitória Moda", value: 156000, stage: "Contrato Fechado", owner: "Ana Souza", probability: 100 },
];

export const assets: Asset[] = [
  { id: "as1", name: "Hook_03_UGC_Verao.mp4", category: "Hook Clips", format: "MP4", resolution: "1080x1920", tags: ["Hook", "Vertical", "TikTok"], client: "Vitória Moda", updatedAt: "25/03/2025" },
  { id: "as2", name: "Product_Hero_NutriPlus.png", category: "Product Photos", format: "PNG", resolution: "2048x2048", tags: ["E-commerce", "Hero"], client: "NutriPlus", updatedAt: "22/03/2025" },
  { id: "as3", name: "Ad_Full_30s_Meta.mp4", category: "Video Ads", format: "MP4", resolution: "1080x1080", tags: ["Meta", "30s"], client: "TechFlow SaaS", updatedAt: "20/03/2025" },
  { id: "as4", name: "Broll_EcoHome_Cozinha.mov", category: "B-Roll", format: "MOV", resolution: "4K", tags: ["Lifestyle", "Interior"], client: "EcoHome BR", updatedAt: "18/03/2025" },
];

export const libraryItems: LibraryItem[] = [
  { id: "l1", title: "Script UGC — Problema / Solução / CTA", category: "UGC Script Templates", description: "Estrutura de 45s para produtos DTC com hook nos primeiros 3 segundos.", updatedAt: "15/03/2025", author: "Equipe SAUGC" },
  { id: "l2", title: "50 Hooks de Alta Retenção", category: "Ad Copy Hooks", description: "Biblioteca de aberturas testadas em Meta e TikTok para nichos variados.", updatedAt: "10/03/2025", author: "Ana Souza" },
  { id: "l3", title: "Guidelines para Creators — Marca Premium", category: "Creator Guidelines", description: "Tom de voz, restrições legais e checklist de entrega para campanhas enterprise.", updatedAt: "05/03/2025", author: "Pedro Lima" },
  { id: "l4", title: "Playbook Escala UGC Q1", category: "Strategy Guides", description: "Framework de testes criativos, orçamento e métricas de decisão.", updatedAt: "01/03/2025", author: "Equipe SAUGC" },
];

export const prompts: PromptItem[] = [
  {
    id: "p1",
    title: "Briefing UGC por Nicho",
    description: "Gera briefing completo para creator com base no nicho e público.",
    content: "Crie um briefing UGC para o nicho {nicho}, público {publico}, tom {tom}. Inclua hook, roteiro 30s, CTA e restrições de marca.",
    tags: ["UGC", "Briefing", "Roteiro"],
    models: ["GPT-4o", "Claude 3.5 Sonnet"],
    parameters: { temperature: 0.7, maxTokens: 1200 },
  },
  {
    id: "p2",
    title: "Variações de Ad Copy",
    description: "10 variações de copy para teste A/B em Meta Ads.",
    content: "Produto: {produto}. Benefício principal: {beneficio}. Gere 10 variações de primary text com emoji moderado e CTA claro.",
    tags: ["Copy", "Meta Ads", "A/B"],
    models: ["GPT-4o"],
    parameters: { temperature: 0.9, maxTokens: 800 },
  },
  {
    id: "p3",
    title: "Thumbnail Concept — Midjourney",
    description: "Prompt visual para capa de anúncio vertical.",
    content: "Product photography, {produto}, studio lighting, {estilo}, 9:16, ultra detailed --ar 9:16 --v 6",
    tags: ["Visual", "Midjourney", "Thumb"],
    models: ["Midjourney"],
    parameters: { stylize: 250, chaos: 15 },
  },
];

export const pipelineValueByStage: Record<string, number> = {
  Qualificação: 42000,
  "Proposta Enviada": 96000,
  Negociação: 480000,
  "Contrato Fechado": 156000,
};

export const workspaces = [
  { id: "studio", name: "SAUGC Studio", plan: "Pro" },
  { id: "agency", name: "Agência Demo", plan: "Enterprise" },
] as const;

export const navItems = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/clientes", label: "Clientes", icon: "Users" },
  { href: "/campanhas", label: "Campanhas", icon: "Megaphone" },
  { href: "/briefings", label: "Briefings", icon: "FileText" },
  { href: "/comerciais", label: "Comerciais", icon: "Kanban" },
  { href: "/assets", label: "Assets", icon: "Film" },
  { href: "/biblioteca", label: "Biblioteca", icon: "Library" },
  { href: "/prompts", label: "Prompts", icon: "Sparkles" },
  { href: "/ia-studio", label: "IA Studio", icon: "Bot" },
  { href: "/configuracoes", label: "Configurações", icon: "Settings" },
] as const;

export const settingsTabs = [
  "Geral",
  "Perfil",
  "Notificações",
  "Equipe & Permissões",
  "Faturamento & Plano",
  "Integrações API",
] as const;

/* ============================================
   NOVOS EXPORTS OFICIAIS — Sprint 001
   ============================================ */

export const commercials: Commercial[] = [
  {
    id: "cm1",
    title: "Unboxing Coleção Verão — Criativo 01",
    client: "Vitória Moda",
    format: "Reels",
    script: "Hook de 3s mostrando a peça, problema-estilo, demonstração no corpo e CTA para o site.",
    creator: "@ana.cria",
    status: "Produção",
    dueDate: "02 ago 2026",
    thumbnailTone: "violet",
  },
  {
    id: "cm2",
    title: "Depoimento Transformação 60 dias",
    client: "NutriPlus",
    format: "TikTok",
    script: "Before/after com narração espontânea, prova social e oferta de primeiro mês.",
    creator: "@joao.fitness",
    status: "Revisão",
    dueDate: "30 jul 2026",
    thumbnailTone: "emerald",
  },
  {
    id: "cm3",
    title: "Tour EcoHome — Cozinha Compacta",
    client: "EcoHome BR",
    format: "Shorts",
    script: "B-roll do produto em uso real, três benefícios rápidos e CTA de catálogo.",
    creator: "@livia.home",
    status: "Rascunho",
    dueDate: "10 ago 2026",
    thumbnailTone: "amber",
  },
  {
    id: "cm4",
    title: "Case TechFlow — ROI em 90 dias",
    client: "TechFlow SaaS",
    format: "Feed",
    script: "Estrutura PAS com números do cliente, depoimento do CTO e CTA para demo.",
    creator: "@marketing.tech",
    status: "Aprovado",
    dueDate: "25 jul 2026",
    thumbnailTone: "blue",
  },
  {
    id: "cm5",
    title: "Desafio 7 Dias FitClub",
    client: "FitClub App",
    format: "TikTok",
    script: "Hook de desafio, três provas de rotina e convite para baixar o app.",
    creator: "@bia.treina",
    status: "Produção",
    dueDate: "05 ago 2026",
    thumbnailTone: "pink",
  },
  {
    id: "cm6",
    title: "Look do Dia — Provador UGC",
    client: "Vitória Moda",
    format: "Reels",
    script: "Transição de looks no provador com trends de áudio e tag de coleção.",
    creator: "@ana.cria",
    status: "Aprovado",
    dueDate: "22 jul 2026",
    thumbnailTone: "violet",
  },
];

export const notifications: AppNotification[] = [
  { id: "n1", title: "Briefing aprovado", description: "Testimonial NutriPlus foi aprovado pelo cliente.", timestamp: "Há 20 min", unread: true },
  { id: "n2", title: "Comercial em revisão", description: "Depoimento Transformação aguardando ajustes finais.", timestamp: "Há 1 h", unread: true },
  { id: "n3", title: "Novo asset enviado", description: "Hook_03_UGC_Verao.mp4 disponível na biblioteca.", timestamp: "Há 3 h", unread: false },
];

export const aiModels: AiModel[] = [
  { id: "m1", name: "GPT-4o", provider: "OpenAI", category: "Texto", description: "Copy, estratégia e roteiros com alta velocidade.", badge: "Recomendado" },
  { id: "m2", name: "Claude 3.5 Sonnet", provider: "Anthropic", category: "Texto", description: "Copy longa, revisão e raciocínio estratégico.", badge: "Premium" },
  { id: "m3", name: "Gemini 2.0 Pro", provider: "Google", category: "Texto", description: "Ideias, pesquisa e expansão de contexto.", badge: "Novo" },
  { id: "m4", name: "Midjourney v6", provider: "Midjourney", category: "Imagem", description: "Thumbnails, conceitos visuais e direção de arte.", badge: "Visual" },
  { id: "m5", name: "Veo 3", provider: "Google DeepMind", category: "Vídeo", description: "Geração de cenas UGC com consistência de personagem.", badge: "Beta" },
  { id: "m6", name: "Flux 1.1 Pro", provider: "Black Forest Labs", category: "Imagem", description: "Fotos de produto realistas para variações de anúncio.", badge: "Novo" },
];

export const aiHistory: AiHistoryItem[] = [
  {
    id: "h1",
    agent: "AI Copywriter",
    model: "GPT-4o",
    prompt: "Crie 5 hooks para a campanha Verão Glow da Vitória Moda focando em prova social.",
    output: "Seu guarda-roupa de verão em 15 segundos — 3 looks, 1 peça coringa e o comentário que explodiu no TikTok.",
    createdAt: "28 jul 2026, 14:32",
  },
  {
    id: "h2",
    agent: "AI UGC Writer",
    model: "Claude 3.5 Sonnet",
    prompt: "Roteiro de 30s para depoimento de transformação NutriPlus com estrutura PAS.",
    output: "Cena 1: hook com resultado. Cena 2: a dor antes do produto. Cena 3: prova com números. Cena 4: CTA de oferta.",
    createdAt: "28 jul 2026, 11:05",
  },
  {
    id: "h3",
    agent: "AI Prompt Engineer",
    model: "Midjourney v6",
    prompt: "Prompt de thumbnail para criativo EcoHome — cozinha compacta, luz natural.",
    output: "cozy compact kitchen, natural morning light, product hero shot, 9:16 --ar 9:16 --v 6",
    createdAt: "27 jul 2026, 17:48",
  },
];