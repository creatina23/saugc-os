# 🧬 PLAYBOOK ANUNCIA — Vol. 5: Variações
## A fábrica de produtos: AfiliadOS, Creator OS e os nichos B2B

> O Vol. 1 te deu o método. O AnuncIA é a primeira saída do forno — não a única.
> Este volume mostra como o MESMO template vira produtos diferentes para públicos diferentes,
> trocando ~20% (vocabulário, módulos e dados) e mantendo ~80% (stack, design, serviços, gates).
>
> 🛑 **REGRA DA FÁBRICA:** variação se constrói SOB DEMANDA. Cliente pagou o sinal → você constrói.
> Nunca construa catálogo "por precaução" — produto sem comprador é decoração.

---

## 1 · A anatomia de uma variação

| O que MUDA (~20%) | O que NUNCA muda (~80%) |
|---|---|
| Comando Mestre da variação (público, dores, módulos) | Stack (Next, React, TS, Tailwind, Vercel) |
| Nomes das rotas/rótulos do menu | Design system (cores, cards, sombras) |
| Types (campos das entidades) | Arquitetura types → mock → service → UI |
| mock-data (nomes, números, cenários do nicho) | Gates (lint → build → push) e docs vivas |
| Métricas do dashboard | Onboarding, Ctrl+K, a11y, toasts |
| Textos comerciais (README, checklists) | Persistência localStorage (padrão) |

**Infraestrutura:** cada variação = um repositório novo no GitHub (duplicar a partir do saugc-os)
+ um projeto novo na Vercel (o plano Hobby grátis permite vários projetos) + domínio próprio
quando fizer sentido (`use[nome].com.br`).

---

## 2 · Como construir uma variação (o procedimento)

1. **Cliente existe (sinal pago) ou aposta validada.**
2. **A IA escreve o Comando Mestre da variação** (peça: "Comando Mestre do [nome da variação]").
3. **Duplicar o repo** no GitHub (Use this template / fork privado) e conectar projeto novo na Vercel.
4. **Sprint V1 — Esqueleto renomeado:** rotas, navItems, types. ⚠️ Lembretes da lição Mídias:
   troca de palavra SÓ com `Aa` (match case) ligado; preferir sempre os blocos exatos entregues pela IA.
5. **Sprint V2 — Dados do nicho:** mock-data com nomes, valores e cenários reais do mercado-alvo.
6. **Sprint V3 — Textos e métricas:** dashboard, títulos, empty states, tour de onboarding adaptado.
7. **Fechamento:** gates + docs comerciais (clonar e adaptar `README`, `MANUAL_DE_USO`,
   `CHECKLIST_COMERCIAL`) + deploy.
8. **Precificar pelo Vol. 2:** dev sob medida R$ 8.000–18.000 (nível persistência local) /
   R$ 25.000–50.000 (com Supabase) · ou white-label R$ 5–10k + R$ 497–997/mês.

---

## 3 · FICHA 1 — AfiliadOS ⭐ (a variação de ouro)

**Público:** afiliados profissionais (Hotmart, Logzz, Kiwify, Braip). O ICP nº 1 do Vol. 3.
**Promessa:** "O sistema operacional do afiliado: ofertas, criativos e produtores num painel só."

### Mapa de renomeação (o coração da adaptação)

| AnuncIA | AfiliadOS |
|---|---|
| Clientes | **Ofertas** (nome, plataforma, preço, comissão %, temperatura) |
| CRM (deals) | **Produtores** (negociações com produtores/coprodutores parceiros) |
| Biblioteca | **Swipe File** (anúncios e criativos vencedores salvos) |
| Comerciais | **Criativos** (roteiros de anúncio em produção) |
| Mídias | mantém (assets dos criativos) |
| Prompts + IA Studio | **Fábrica de Criativos** (prompts de copy de anúncio) |
| Dashboard | comissões do mês, ROI por oferta, top ofertas, criativos ativos |

### Mini Comando Mestre (semente — a IA expande na hora)

> AfiliadOS — SaaS PT-BR para afiliados. Dor: caos de ofertas/criativos espalhados.
> Módulos: Dashboard, Ofertas, Criativos, Swipe File, Produtores (funil), Fábrica de Criativos (IA),
> Mídias, Prompts, Configurações. Mesmo design system do AnuncIA. Tom: resultado, velocidade,
> comissão. Métricas em R$ e % comissão. Regras e leis: idênticas às do Comando Mestre original.

**Por que é a primeira variação:** o ICP é os mesmo do AnuncIA e do seu plano de vendas — você
já terá conversado com dezenas deles. Se 3 afiliados pedirem "isso, mas pra minha operação",
o AfiliadOS nasceu com demanda comprovada.

---

## 4 · FICHA 2 — Creator OS

**Público:** criadores UGC que vendem vídeos/conteúdo para marcas.
**Promessa:** "Do portfólio ao contrato: sua operação de creator num lugar só."

| AnuncIA | Creator OS |
|---|---|
| Clientes | **Marcas** (que contratam o creator) |
| Campanhas | **Jobs / Entregas** (pacotes de conteúdo) |
| Briefings | Briefings dos jobs (mantém) |
| Comerciais | **Conteúdos** (roteiros e gravações) |
| CRM | **Propostas** (negociações com marcas) |
| Biblioteca | **Portfólio** (trabalhos publicados) |
| Dashboard | valor médio por entrega, marcas ativas, receita do mês |

**Gatilho de demanda:** qualquer creator com 5+ jobs simultâneos vive em planilha + WhatsApp.

---

## 5 · FICHA 3 — ClínicaOS (clínicas e estética)

**Público:** clínicas de estética, odonto, fisio — negócios locais com agenda e captação.
**Promessa:** "Chega de lead perdido no WhatsApp: funil de agendamento visível."

| AnuncIA | ClínicaOS |
|---|---|
| Clientes | **Pacientes** |
| CRM | **Funil de agendamento**: Novo lead → Contato → Avaliação agendada → Compareceu → Tratamento fechado |
| Campanhas | Captação (origem dos leads) |
| Dashboard | leads do mês, taxa de comparecimento, receita por procedimento |

⚠️ **Alerta LGPD:** dados de saúde são sensíveis. No nível mock/persistência local, tudo bem.
Antes de qualquer versão com banco real para clínicas, tratar LGPD e sigilo profissional — e
subir o preço por causa disso.

---

## 6 · FICHA 4 — ImobiliOS

**Público:** imobiliárias e corretores autônomos.
**Promessa:** "Imóveis, leads e visitas sob controle total."

| AnuncIA | ImobiliOS |
|---|---|
| Clientes | **Leads/Proprietários** |
| Mídias/Biblioteca | **Portfólio de imóveis** (fotos, fichas) |
| CRM | **Funil**: Novo → Qualificado → Visita → Proposta → Documentação → Fechado |
| Comerciais | Anúncios dos imóveis |
| Dashboard | imóveis ativos, visitas da semana, VGV negociado |

---

## 7 · Fichas rápidas (conceito em 1 linha — expandir quando a demanda aparecer)

- **RestauranteOS** — cardápio digital + pedidos + CRM de clientes fiéis (vender junto com
  gestão de tráfego local).
- **InfoprodutorOS** — Lançamentos (era Campanhas), funil de leads (era CRM), swipe de copies.
- **EcomOS** — lojas pequenas: ofertas, criativos e CRM de recompra.
- **AdvocaciaOS / ContábilOS** — funil de clientes + prazos, para profissionais liberais
  (ticket alto, concorrência de software quase nula em PT-BR bonito).

---

## 8 · Como nomear e dominar

- Padrão de nome: **[Dor/Nicho] + OS** ou verbo forte (AnuncIA). Sempre pronunciável em PT-BR.
- Domínio: `use[nome].com.br` (~R$ 55/ano no registro.br) — comprar SÓ quando houver cliente/demanda.
- Subdomínio do sistema: `app.use[nome].com.br` (mesma receita de DNS planejada para o AnuncIA).

---

## 9 · Guardrails da fábrica (leia antes de clonar qualquer coisa)

1. **Vendeu → construiu.** Nunca o contrário. (Repetida porque salva meses de vida.)
2. **Uma variação por vez.** Fábrica com 5 produtos pela metade vale menos que 1 vendido.
3. **80/20 religioso:** se a adaptação passar de ~30%, é outro produto — repense o preço.
4. **Toda variação nasce com Comando Mestre próprio**, gerado pela IA antes da Sprint V1.
5. **Os docs comerciais são clonados também** (README, manual, checklists) — venda no dia 1.
6. **Melhorias que fizerem sentido pro AnuncIA voltam pro projeto-mãe** (cherry-pick manual
   via IA, nunca merge cego).

---

> ▶️ **Vol. 6 — Roadmap:** o plano semana a semana — das próximas abordagens ao primeiro Pix,
> do primeiro cliente ao curso lançado. O calendário que amarra os volumes 1–5.