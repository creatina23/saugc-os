# TRIAGEM SOBERANA — "COMANDO MESTRE" (prompt vindo de engenharia externa)
**Data: 13 ago 2026 · Juiz: Copiloto AnuncIA · Status: mapeado, NÃO executar cru**

---

## 0. VEREDITO EM 3 LINHAS

Documento de constituição técnica BEM escrito — mas ~60% já é lei da casa ou
roadmap nosso com outro nome, ~25% é upgrade legítimo de documentação, ~15%
pede coisas que CONFLITAM com decisões travadas. Não é para colar inteiro em
agente nenhum. Ele vira insumo: absorvido pela papelada e pelo GPS.

---

## 1. 🟢 JÁ É LEI DA CASA (o comando repete o que já fazemos)

| Regra do Comando Mestre | Lei equivalente na nossa casa |
|---|---|
| Zero mock / nunca simular / números inventados proibidos | **Verdade na tela** + **dedo-duro confesso** ("Detalhe técnico: ...") |
| Auditar → explicar → propor → pedir permissão → implementar | Nosso fluxo TDAH de sempre (uma ação por vez, "nunca conserta sozinho") |
| Secrets nunca no frontend (env server-side) | Lei de segurança travada (.env.local + Vercel, nunca NEXT_PUBLIC_) |
| Multi-tenant: isolamento total entre clientes | RLS "dono total" por user_id — já aplicado e auditado |
| Webhooks idempotentes | Será lei quando o checkout chegar (anotado no design da Sprint de assinatura) |
| Backup/rollback antes de mudança crítica | Porteiros (`.next` limpo, lint, build) + git + Supabase snapshots |
| Changelog/registro de mudanças | `docs/010_CHANGELOG.md` append-only |
| "Projeto não pode depender da memória do agente" | GPS (`011`) + Memória Estratégica (`012`) — exatamente essa missão |
| Feature flags (OFF→ADMIN→BETA→TODOS) | Espírito já usado (laboratório fora do menu = flag informal). Formalizar na Sprint de assinatura |
| Fallback inteligente entre modelos | **Mesa de Motores entregue (4 motores em cadeia, 13 ago)** |

**Leitura:** o comando valida nossa engenharia. Quem escreveu descreveu a casa
que a gente já constrói. ✅

---

## 2. 🟡 ABSORVER NA PAPELADA / PRÓXIMA SPRINT DE DOCS (legítimo e barato)

Checklist para quando a papelada vier (não agora):

- [ ] Subir o degrau da documentação viva: criar 4–5 docs raiz enxutos e reais:
  **`README.md`** (instalar/configurar/rodar/deploy) · **`ARCHITECTURE.md`**
  (stack, pastas, rotas, serviços, armadilhas) · **`DATABASE.md`** (schema real:
  tabelas, colunas, RLS, policies — será o schema canônico em markdown) ·
  **`SECURITY.md`** (regra de secrets, RLS, o que nunca fazer) ·
  **`REBUILD.md`** (reconstrução do zero: repo novo → produto vivo, passo a
  passo com as chaves e a ordem das migrations). 
  ⚠️ O comando lista ~35 arquivos de docs — **DECISÃO SOBERANA: não.** Volume
  de doc sem dono vira museu desatualizado. 5 docs vivos > 35 mortos. Os
  010/011/012 continuam sendo o coração.
- [ ] **`SNAPSHOT` por versão:** no fechamento de cada sprint, registrar
  commit hash + schema + envs (nomes, não valores) no CHANGELOG. Custo: 2 linhas.
- [ ] **Registro dos agentes:** transformar a tabela de agentes (persona,
  instrução, fallback, versão) em `docs/AGENTS.md` ou seção da ARCHITECTURE.
  Barato e útil quando novos agentes entrarem.
- [ ] **Log de operação (audit trail):** fase 1 enxuta — tabela `activity_log`
  gravando eventos-chave (geração IA, salvamentos, fallback acionado, login).
  Candidata a entrar na Sprint de assinatura (ela já mexe nessas camadas).

---

## 3. 🗺️ v3.0 "WAZE DO TRÁFEGO" (o comando descreve nosso próprio v3.0)

Estes blocos do comando = são a definição técnica do que já chamamos de
"Cérebro vivo Diretor de Tráfego". Ficam **travados pra v3.0**, mas agora com
vocabulário rico:

- **Orquestrador Central** = nosso 🧠 Cérebro vivo. O fluxo dele
  (interpreta→planeja→seleciona especialistas→executa→revisa→consolida→sugere)
  vira o spec da Fase Cérebro.
- **"Próximos movimentos" no Dashboard** = card v3.0 de inteligência da
  operação (insights SÓ de dados reais — alinhado com a lei).
- **Agente executor → agente revisor → orquestrador** = controle de qualidade
  da era v3.0.
- **Human-in-the-loop** = já é nossa lei v3.0: "Só assiste → Recomenda →
  Executa com OK". O comando chama de "ações críticas exigem aprovação" — mesma
  lei, palavras melhores. Adotar o vocabulário.
- **Memória separada (usuário/cliente/campanha/operação/projeto)** = a peça
  que fará o Diretor de Tráfego não começar do zero. Estacionar pra v3.0.
- **Aprendizado por resultados (criar→medir→aprender→otimizar)** = Fase
  📈 do Waze (cadeia de resultados + leitura).

---

## 4. 🚀 PÓS-LANÇAMENTO (travado na nossa fila — comando só detalha)

| Bloco do comando | Status na casa |
|---|---|
| Sistema de assinatura + checkout + entitlements | **Pós-1º cliente** (Sprint própria: webhook idempotente → `subscriptions` → gate). FREE/PRO/PREMIUM/ENTERPRISE: ⚠️ decisão pendente — oferta travada hoje é única (9.997 + 497). Tiers entram em discussão SOBERANA no pós-lançamento, não por padrão. |
| Consumo de IA registrado → cobrança por uso | Pós-lançamento. A tabela de consumo pode NASCER na Sprint de assinatura (custa pouco). ✅ antecipado |
| Agente de vendas WhatsApp (API oficial) | Candidata #1 pós-lançamento (já travado que não é Baileys/Evolution). Framing do comando é bom: responder→qualificar→explicar planos→escalar pra humano |
| Integrações Meta/TikTok/Google/Analytics | Pós-lançamento, uma por vez, checklist dele é útil |
| Ecossistema multimídia (imagem/vídeo/voz) | Pós-lançamento/v3.0 — vídeo nativo pago já está estacionado (diário 020) |
| Métricas MRR/ARR/CAC/LTV + valuation admin | Pós-lançamento. Hoje o "Pulso Comercial" nosso é manual (CRM + valor/usuário travado no diário) |
| Marketplace/biblioteca de agentes | Longo prazo — estacionamento, sem data |
| Modelo híbrido (agência + SaaS + implementação) | Já é a realidade (oferta de implantação + licença). SaaS puro vem com checkout |

---

## 5. 🔴 CONFLITOS COM A CASA (decisões soberanas — onde NÃO obedecemos)

1. **"NUNCA usar mock data" vs nosso "modo demonstração com selo"** 
   → **Decisão: mantemos o nosso.** O comando proíbe qualquer dado fictício;
   nossa lei é: sem banco, a tela cai em demo COM SELO VISÍVEL ("Modo
   demonstração"). É mentira honesta declarada = verdade na tela. O demo
   honesto é o que te permitiu aprender e apresentar. Diferença sutil mas
   crucial: o vício é mostrar mock COMO SE fosse real; o nosso selo confessa.
   Mantemos o selo, mantemos a alma.
2. **"Preparar FREE/PRO/PREMIUM/ENTERPRISE" vs oferta travada**
   → Decisão: entitlements, sim; menu de planos, não. Hoje existe UMA oferta.
   Tiers = debate de pós-lançamento com dados de clientes reais.
3. **"~35 arquivos de documentação"**
   → Decisão: 5 docs vivos + nossos 010/011/012. Doc demais sem dono apodrece.
4. **"Auditoria do Orquestrador" (procurar SOIA/Kernel/Router no código)**
   → Decisão: desnecessária — **nós conhecemos o código**: classificação C
   (existem agentes/personas especializadas, sem coordenação central). A Mesa
   de Motores é fallback de *infra*, não orquestração de *especialistas*.
   Registrado; v3.0 é quando isso muda.
5. **"NÃO criar uma versão DEMO"**
   → Entendemos como "não criar app paralelo de mentira" — concordamos.
   A demo-assistida e o modo-demonstração-com-selo não violam isso.

---

## 6. ⛔ O QUE NÃO FAZER COM ELE

- ❌ Não colar inteiro no Lovable (ele tentaria construir tudo de uma vez:
  orquestrador + assinatura + whatsapp + vídeo + 35 docs)
- ❌ Não tratar como backlog — é CONSTITUIÇÃO, não fila
- ❌ Não descartar — há ouro de vocabulário e 12+ itens legítimos

**Destino selado:** absorvido por este documento → papelada (GPS/Memória)
referencia as decisões → v3.0 e pós-lançamento citam o comando como fonte.
Fim do assunto até lá. ✅

---

*"Preservar o que funciona. Evoluir o que pode melhorar. 
Preparar o que ainda não pode ser implementado." — ele e nós, mesma frase.*
