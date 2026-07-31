# 📘 PLAYBOOK ANUNCIA — Vol. 1: A Metodologia
## Engenharia reversa: como um SaaS completo nasceu sem escrever uma linha de código manual

> Este documento é a fundação do Playbook. Ele registra, passo a passo, o método que transformou
> uma pasta vazia no AnuncIA v0.9 — um SaaS premium no ar, pronto para venda.
> Os volumes 2 a 6 transformam este método em renda, clientes, curso e novos produtos.

---

## 1 · A prova (o que foi construído)

- **Produto:** AnuncIA — Sistema Operacional de Anúncios UGC com IA (SaaS premium PT-BR)
- **Tamanho:** 11 telas · 14 componentes de interface · 12 serviços · design system próprio · tour de boas-vindas · busca global (Ctrl+K) · acessibilidade AA
- **No ar:** https://anuncia-three.vercel.app
- **Código:** https://github.com/creatina23/saugc-os
- **Escrito por:** 100% inteligência artificial
- **Aplicado por:** uma pessoa sem experiência em programação, copiando e colando arquivos completos
- **Custo em ferramentas até aqui:** R$ 0 (domínio pausado por escolha, ≈ R$55/ano quando ativado)

Este volume existe porque o acima é replicável. Não foi sorte. Foi método.

---

## 2 · A stack (e por que ela é grátis)

| Ferramenta | Papel na fábrica | Custo |
|---|---|---|
| VS Code | onde os arquivos são colados | grátis |
| Next.js + React + TypeScript | a linha de montagem do sistema | grátis (open source) |
| Tailwind CSS 4 | o design system (cores, cards, brilhos) | grátis |
| Node.js | o motor que roda tudo no computador | grátis |
| GitHub | cofre do código + histórico de versões | grátis |
| Vercel (Hobby) | publicação automática na internet (deploy) | grátis |
| IA (conversas) | a equipe de engenharia, design, QA e documentação | plano comum |

**Insight-chave:** quem "constrói" o site oficial é a Vercel, na nuvem, em infraestrutura estável.
Internet caseira instável atrapalha o push, mas nunca derruba o produto.

---

## 3 · Os 5 pilares do método

### 🏛️ Pilar 1 — O Comando Mestre (a constituição)

Antes da primeira linha de código, foi escrito um documento único com as leis do projeto:
stack, cores exatas (bg #0B0F14, primary #3B82F6, IA #8B5CF6), padrões, ordem das sprints
e — mais importante — **o que NÃO fazer** (sem marketing antes da hora, sem backend sem pedido,
sem caminhos de Windows no código).

Arquivo real: `docs/000-030_contexto_completo.md`.

**Por que funciona:** IA não tem memória garantida entre janelas de conversa.
O Comando Mestre É a memória. Qualquer IA, em qualquer janela, lê o documento e obedece às mesmas leis.

### 🧩 Pilar 2 — Sprints numeradas com critérios de aceite

Nunca "melhore o sistema". Sempre: "Sprint 007 — Polish Profissional. Pronto é quando: lint passa,
build passa, tour de onboarding funciona, foco por TAB visível."

Cada sprint tem número, tema, entregáveis e definição de pronto. O projeto avança em degraus,
não em ladeiras.

### 📄 Pilar 3 — Arquivos completos, nunca remendos

A IA entrega sempre o ARQUIVO INTEIRO, com duas instruções possíveis: **"criar novo"** ou
**"apague tudo e cole"**. Nunca "altere a linha 42". Isso elimina ~90% dos erros de quem não programa.

Exceção controlada: micro-edições de 1 linha, com texto exato de busca e troca.
E troca global de palavra SOMENTE com `Aa` (match case) ligado.

**Caso real (a lição mais cara):** um renome global de "Assets" para "Mídias" feito sem match case
reescreveu imports de código e quebrou o build (`Export Mídias doesn't exist in target module`).
Resolução: a IA reescreveu o arquivo inteiro, corrigido, e o projeto seguiu em minutos.
Lição registrada no GPS para nunca mais se repetir.

### 🚦 Pilar 4 — Gates de qualidade (o funil obrigatório)

Depois de TODO bloco de código, nesta ordem, um comando por vez:

1. `npm run lint` — caça erros de padrão e más práticas
2. `npm run build` — simula a construção de produção
3. `git push` — só se os dois passarem

**Erro não é fracasso.** A mensagem de erro copiada e colada de volta na conversa é o mecanismo
de correção. O ciclo "erro → colar erro → receber arquivo corrigido → repetir gate" é parte do
método, não exceção.

### 🧭 Pilar 5 — Documentação viva (o sistema nervoso)

- `010_CHANGELOG.md` — **append-only**: o histórico imutável de cada versão (v0.3 → v0.9).
  Nunca se apaga o passado.
- `011_CURRENT_MISSION.md` — **o GPS**: substituído 100% a cada sprint. Status, mapa do que existe,
  lembretes travados, gatilhos, próxima fase. É o que permite continuar exatamente de onde parou,
  mesmo semanas depois, mesmo em outra conversa.
- Frases-gatilho — protocolo de comunicação sem ambiguidade: "les go" (iniciar), "deu certo"
  (confirmar), "deu certo segue o baile" (retomar), "só se for agora" (virada de fase).

---

## 4 · A anatomia de uma entrega (o loop que se repetiu 8 sprints)

1. Usuário diz **"les go"** → a IA abre a sprint com objetivo e mapa de PASSOS
2. A IA entrega **UM PASSO por vez**: arquivo completo, caminho exato, instrução "criar novo" ou
   "apague tudo e cole", resultado esperado e seção "se houver erro"
3. O usuário aplica e roda os gates
4. O usuário diz **"deu certo"** → próximo PASSO
5. Fechamento: CHANGELOG (append) + GPS (replace) + `git push`
6. Relatório-padrão ao final de cada entrega: ✔ Criados · ✏️ Alterados · 🎯 Motivo · ▶️ Próximo passo

**Por que um PASSO por vez funciona:** zero ambiguidade, cognição livre para executar, erro sempre
localizado num único arquivo. A velocidade vem da repetição do loop, não da pressa.

---

## 5 · A arquitetura (explicada para quem não programa)

A cadeia obrigatória do projeto: **types → mock-data → service → componente → página**

- **types** — os moldes: o que é um Cliente, um Deal, uma Campanha (campos e formatos)
- **mock-data** — dados fictícios que parecem reais: R$ 287.450 faturam na tela desde o primeiro dia
- **services** — os "porteiros": a tela NUNCA fala direto com os dados; quem busca, filtra e ordena
  é o serviço (`@/lib/services`)
- **componente/página** — o que aparece pro usuário final

**Por que isso é ouro:** no dia em que ligarmos o Supabase (banco de dados real), trocamos só
os services. **As 11 telas não mudam uma linha.** É assim que software profissional é desenhado —
e é por isso que este mock não é "falso": é uma fase arquitetural legítima.

**Persistência real no navegador:** CRM e Clientes já gravam de verdade (localStorage), com chaves
`anuncia:crm-deals` e `anuncia:clientes-extras`. Em demonstração ao vivo, o produto FUNCIONA:
cria cliente, move negócio no funil, recarrega e continua lá.

---

## 6 · Os erros reais e o que cada um ensinou

| Erro | Causa raiz | Correção | Lição permanente |
|---|---|---|---|
| Build quebrado (`Export Mídias doesn't exist`) | Renome global sem match case | Arquivo inteiro reescrito via services | Troca global só com `Aa` ligado; preferir blocos da IA |
| `Failed to fetch Geist Mono/Inter` no build | Google Fonts baixadas na hora do build + internet instável | Esperar / repetir / `ipconfig /flushdns` | Erro de fonte = rede, não código |
| `git push` timeout (github.com:443) | Conexão instável | Repetir após 1 min; hotspot se persistir | Push falho não apaga nada; e a Vercel builda na nuvem |
| Deploys vermelhos na Vercel | Commit com build quebrado | Commit seguinte verde curou sozinho | Deploy falho NÃO derruba o site; último bom continua no ar |

---

## 7 · O template universal (replique em qualquer nicho)

É exatamente este volume que o Vol. 5 (Variações) usa para gerar AfiliadOS, Creator OS e os nichos.
O esqueleto replicável:

1. **Passo 0 — Escreva o Comando Mestre do nicho:** público, dor, módulos, paleta, leis, o que não fazer
2. **Passo 1 — Sprints numeradas:** base → telas → design system → services → features → polish → prontidão
3. **Passo 2 — Dados mock convincentes:** números grandes, PT-BR, nomes brasileiros reais de mercado
4. **Passo 3 — Cadeia types→mock→service→UI** desde o primeiro dia
5. **Passo 4 — Gates + GPS + CHANGELOG** como religião
6. **Passo 5 — Persistência localStorage** para a demo funcionar de verdade
7. **Passo 6 — Deploy contínuo** (GitHub → Vercel) desde a primeira semana
8. **Passo 7 — Docs comerciais** (README, manual, checklists) ANTES de vender

**Ordem das fases de vida de qualquer produto desta fábrica:**
Mock navegável → Persistência local → B2B assistido (demo = trial, cobrança manual) →
Supabase (auth → banco → IA real → storage) → SaaS self-service → Escala.

---

## 8 · Glossário (o vocabulário que você agora domina)

- **build** — a "montagem" do site em versão de produção; se o build passa, o site aguenta o ar
- **lint** — fiscal de padrões; reclama de código fora da lei
- **deploy** — publicação do site na internet
- **mock** — dados fictícios realistas usados antes do banco de dados
- **service** — camada que organiza o acesso aos dados (o porteiro)
- **repo / repositório** — a pasta do projeto vigiada pelo Git, espelhada no GitHub
- **commit** — foto datada do projeto, com legenda
- **push** — enviar as fotos (commits) pro GitHub
- **rollback** — voltar para uma versão antiga boa (na Vercel: Deployments → Promote to Production)
- **DNS** — a lista telefônica que aponta um domínio (useanuncia.com.br) para um servidor
- **MVP** — a menor versão vendável do produto
- **B2B assistido** — vender conversando com cada cliente, sem checkout automático
- **localStorage** — memória do navegador; dados que sobrevivem ao recarregar a página
- **hydration** — o "acordar" do React no navegador; fonte clássica de bugs de tela

---

> ▶️ **Vol. 2 — Monetização:** as 5 formas de transformar este método (e este produto) em renda,
> com preços, âncoras e o caminho recomendado para o primeiro R$ 10 mil.