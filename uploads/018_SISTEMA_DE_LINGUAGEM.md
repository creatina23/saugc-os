# 018 — SISTEMA DE LINGUAGEM DO ANUNCIA (v1)
**A constituição da comunicação · nasce do Protocolo de Linguagem (triagem em `docs/017`) · 20 ago 2026**
**Toda tela, texto, botão, erro e estado vazio do AnuncIA obedece a este documento. Conflito de copy = este doc ganha.**

---

## 1. O QUE O ANUNCIA É (posicionamento travado)

**Dentro do app (a marca em pessoa):**
> **ANUNCIA — Comando em expansão.**
> O sistema operacional de crescimento com IA.
> Um centro de comando onde estratégia, criativos, clientes, campanhas, tráfego e inteligência trabalham juntos.

**Na LP e na venda (a dor na frente — decisão híbrida 20 ago):**
> "Do briefing ao anúncio pronto em 10 minutos — sem creator, sem agência."
> (a narrativa de comando entra nas seções de contexto: centralização → inteligência → controle)

**O usuário deve concluir, ao entrar:** *"Agora eu tenho controle da minha operação."*

## 2. A NARRATIVA-MÃE (a lógica de toda história que contarmos)

Problema → Complexidade → **Centralização** → Inteligência → Controle → Execução → Crescimento

> Marketing cresceu. As ferramentas também. O problema é que sua operação ficou espalhada.
> O AnuncIA reúne tudo em um único centro de comando.
> Você define o objetivo. A inteligência organiza o caminho. Os especialistas executam.
> Os dados mostram o que está funcionando. E você decide o próximo movimento.

**Pilares da sensação:** PODER · CONTROLE · CLAREZA · INTELIGÊNCIA · ESCALA · CRESCIMENTO · SOLIDEZ · PRECISÃO · RESULTADO

## 3. TOM DE VOZ

Direta · inteligente · confiante · moderna · estratégica · humana · premium · objetiva · visual.
**Tecnologia avançada REAL** — nem corporativa fria, nem ficção científica, nem infantil.

## 4. VOCABULÁRIO

**✅ Palavras preferidas:** comando · operação · centro · movimento · próximo movimento · inteligência · especialistas · criativo pronto · em movimento · direção · expansão · no lugar certo · sob controle · o que está funcionando

**❌ Palavras/frases PROIBIDAS na tela:**
- Jargão de código/gringo: UGC · MRR · pipeline · providers · creator · assets · dashboard · workflow · analytics · onboarding
- Frases de SaaS genérico: "revolucione seu negócio" · "potencialize seus resultados" · "leve ao próximo nível" · "solução completa" · "ecossistema inovador" · "tecnologia de ponta"
- IA vazia: "powered by AI" · "IA avançada" · "inteligência artificial de última geração"
- Promessa de renda/futuro: qualquer "você vai faturar X" (Lei L13 + regra 30)

## 5. NOMENCLATURA DOS MÓDULOS (rótulo na tela ↔ rota/chave NUNCA muda)

| Rota (intocada) | Rótulo novo no menu | Frase-guardião da página |
|---|---|---|
| `/` (dashboard-view) | **Central** | "Como está sua operação" |
| `/clients` | **Clientes** | "Cada cliente é uma operação" |
| `/campanhas` | **Campanhas** | "O que está rodando" |
| `/briefings` | **Briefings** | "Do briefing ao criativo" |
| `/comerciais` | **Comerciais** | "Uma ideia vira peça pronta pra entrar em campo" |
| `/assets` | **Mídias** | "Tudo que a operação precisa, no lugar certo" |
| `/biblioteca` | **Biblioteca** | "O que a inteligência produziu fica guardado aqui" |
| `/prompts` | **Prompts** | "Seus comandos prontos pra reutilizar" |
| `/ia-studio` | **IA Studio** | "Os especialistas digitais do seu comando" |
| `/crm` | **Negócios** | "O funil mostra onde está cada real" |
| `/configuracoes` | **Configurações** | "Assuma o controle" |

⚠️ **Lei L6 aplicada:** mudança é SÓ no rótulo de tela (navItems/mock-data + títulos). Chaves de banco (categorias EN do `library_items`, stages de `deals`), rotas de pasta e imports **não mudam**. Todo rename passa pelo Ctrl+F como texto puro.

## 6. OS ESPECIALISTAS (o que EXISTE hoje — regra 30)

| Especialista (real) | Como se apresenta |
|---|---|
| ✍️ **Roteirista** (no Briefing) | "Transforme o briefing em roteiro cena a cena — com os comandos de vídeo prontos no final." |
| 🧠 **Diretor de Tráfego** (nas Campanhas) | "Uma inteligência dedicada a ler sua campanha e dizer o próximo movimento." |
| 🛠️ **IA Studio** | "A bancada dos especialistas: gancho, copy e roteiro em segundos." |
| ⚙️ **Mesa de Motores** (infra, aparece nos selos) | "Quatro inteligências em cadeia — se uma descansa, outra assume." |

❌ **Orquestrador/"cérebro que coordena tudo" NÃO existe ainda** — só como visão futura ROTULADA ("Em breve"), nunca como promessa de hoje. 6 especialistas completos = v3.0.

## 7. CTAs PADRÃO (sempre = a ação real do botão)

| Onde | CTA |
|---|---|
| Login (entrar) | **Entrar no comando** |
| Ir pra Central | **Ver minha operação** |
| Criar campanha / briefing / cliente | **Criar campanha** / **Criar briefing** / **Cadastrar cliente** |
| Gerar roteiro | **Gerar roteiro** |
| Ponte do vídeo | **Comandos de vídeo** |
| Perfil/config | **Assumir o controle** |
| LP pública (fora do app) | **"Quero ver com o meu produto — agendar demo de 15 min"** (→ wa.me, travado) |

Proibido: "Saiba mais" · "Começar agora" · "Conheça" como CTA principal. "Começar a expandir" só onde ação real existir (hoje: nowhere público — cadastro trancado).

## 8. FÓRMULAS DE MICROCOPY

**Estado vazio** = CONTEXTO + EXPLANAÇÃO + AÇÃO:
> "Suas campanhas aparecerão aqui. Crie a primeira e coloque sua operação em movimento." → botão **Criar campanha**

**Erro** = humano primeiro, confissão técnica SEMPRE no fim (L9):
> "Ocorreu um problema ao [ação]. Tente novamente — se continuar, verifique a conexão. **Detalhe técnico: [error.message]**"

**Sucesso** = confirmação + próximo movimento:
> "Criativo gerado e salvo na Biblioteca. Quer ver os comandos de vídeo?"

**Loading** = o que está acontecendo: "Escrevendo o roteiro…" (nunca "Carregando…")

**Placeholder de input** = exemplo real, nunca nome do campo: "Ex.: Clínica Odontologia Sorriso" e não "Nome do cliente".

## 9. HIERARQUIA POR TELA (checklist que toda página passa)

1. O QUE É? (título claro)
2. PRA QUE SERVE? (frase-guardião — tabela da seção 5)
3. POR QUE IMPORTA? (benefício, não funcionalidade: "tenha a operação sob controle" e não "gerencie campanhas")
4. O QUE EU FAÇO AGORA? (1 CTA principal óbvio)

**Vender transformação, não função:** "Tem IA de copy" ❌ → "Transforme objetivos em mensagens que fazem sentido pro seu público" ✅.

## 10. REPETIÇÃO E CONTENÇÃO

"Comando em expansão" é conceito PROPRIETÁRIO: máximo 1 aparição por contexto (login: hero; menu: rodapé da lateral; LP: 1 seção). Excesso mata o feitiço.
A palavra "crescimento" conecta sempre: estratégia + execução + dados + otimização + escala ("não é criar mais — é descobrir o que funciona, repetir e expandir").

---

*Este doc é vivo: mudança de linguagem = nova versão dele + CHANGELOG. Ele manda no 010/011/012 e é consultado antes de CADA texto novo de tela.*
