# AnuncIA — Guia de Operação

> Para quem **mantém o sistema no ar** (você, operador).

> Quem só USA o sistema lê o `docs/MANUAL_DE_USO.md`.

> Versão 1.0 · julho/2026

---

## 1. Endereços oficiais

| O quê | Onde |
|---|---|
| Site em produção | https://anuncia-three.vercel.app |
| Domínio oficial | ⏸️ Pendente: `useanuncia.com.br` (ver seção 7) |
| Código-fonte | GitHub (repositório `saugc-os`, branch `main`) |
| Projeto no seu PC | pasta local do projeto (VS Code) |

---

## 2. Ligar o projeto do zero (qualquer computador)

Pré-requisito: ter **Node.js LTS** instalado (https://nodejs.org) e **Git**.

```powershell
git clone <url-do-repo-no-github>
cd saug-c-os        # ajuste para o nome da pasta clonada
npm install
npm run dev

Abrir no navegador: http://localhost:3000

Comandos do dia a dia (sempre um por linha):

PowerShell

npm run lint      # verifica qualidade (0 problemas = ok)
npm run build     # valida se está pronto para publicar
npm run dev       # roda local
Regra de ouro da casa: nunca commita sem lint ✅ + build ✅.

3. Atualizar o sistema (o ciclo de 1 minuto)

Alterar código no VS Code (com as entregas guiadas)
npm run lint + npm run build — os dois verdes
git add -A
git commit -m "descreva a mudança"
git push
A Vercel publica sozinha em ~1 minuto — usuários só dão F5

⚠️ Nunca edite arquivos direto pelo site do GitHub. O fluxo oficial é
sempre: PC → commit → push → Vercel.

4. GitHub (o cofre)

O repositório é a única fonte oficial do código
Commits pequenos e frequentes (1 sprint/etapa = 1 commit)
Branch de trabalho: main
Se o git push for recusado: rode git pull e repita o push

5. Vercel (a casa)

Deployments: cada push na main gera um deploy novo automático
Deu problema num deploy? Painel do projeto → aba Deployments →
nos 3 pontinhos do deploy anterior que funcionava → Promote to
Production (rollback em 1 clique)
Environment Variables: hoje nenhuma. Na fase Supabase entram as
chaves — sempre aqui, nunca no código

6. Backup

O Git É o backup: cada commit guarda a foto completa do sistema.
Perdeu o PC? git clone e tudo volta
Backup extra mensal (opcional 5 estrelas): GitHub → botão Code →
Download ZIP → guarde na nuvem pessoal
Não existe banco de dados nesta fase (dados são demonstração no
próprio código), então não há banco para salvar

7. Domínio — PENDÊNCIA REGISTRADA ⏸️

Status (30/07/2026): useanuncia.com.br estava livre no
https://registro.br — compra adiada por recurso financeiro
Quando comprar (≈ R$ 55/ano): registrar no seu CPF, 1 ano,
Pix. Não mexa em DNS
Depois da compra: pedir no chat "comprei o domínio" → receber a

Parte 2 (apontar DNS para a Vercel). Resultado final:
app.useanuncia.com.br = sistema · useanuncia.com.br = site (futuro)

8. Supabase (próxima fase técnica)

Quando: após a Sprint 008 (prontidão de venda)
O que liga: ① login por e-mail ② banco de dados real ③ IA real
conectada ④ storage de arquivos
Por que não dói: a camada src/lib/services/ é a tomada única —
troca de mock para Supabase mexendo 1 arquivo por módulo, telas intactas

9. IA real (junto com a fase Supabase)

Chaves de API ficam em Environment Variables da Vercel (nunca no código)
Estratégia: começar no tier gratuito (Google Gemini / Groq) e
escalar quando houver clientes pagando

10. Troubleshooting (sintoma → solução)

Sintoma	Solução
Build reclama de rota/tipo que não existe mais	Apague a pasta .next e rode npm run build de novo
Erros "Duplicate identifier"	Arquivo foi colado 2x — recolo o arquivo INTEIRO por cima
npm não é reconhecido	Node.js não instalado → instalar LTS de nodejs.org
Porta 3000 ocupada	npm run dev -- -p 3001
Site fora do ar ou quebrado	Rollback na Vercel (seção 5) e me chame
Tela branca/estranha	F5; se persistir, verificar último build
git push recusado	git pull → resolver → git push

11. Checklist diário do operador (2 minutos)
 
 Site abrindo normal? (acesse a URL)
 Último deploy na Vercel está verde ("Ready")?
 Mudanças do dia foram commitadas e enviadas (git push)?
 Nenhum erro novo apareceu no uso?

12. Regras que mantêm a casa de pé
lint + build verdes antes de qualquer commit
Arquivos sempre completos ao colar ("apague tudo e cole")
Fonte única de dados: types → mock-data → services → telas
Nada de caminho de Windows dentro do código
PT-BR em tudo que o usuário vê
text


Sem gate (é documentação). Salva e já era.

---

**📋 Relatório**

- ✔ **Criados:** `docs/GUIA_DE_OPERACAO.md` (12 seções: ligar, atualizar, GitHub, Vercel/rollback, backup, domínio pendente, Supabase, IA, troubleshooting, checklist diário)
- ✏️ **Alterados:** nada
- 🎯 **Motivo:** você agora tem o sistema documentado de ponta a ponta — usar (manual) e operar (guia)
- ▶️ **Próximo comando:** responde **"deu certo"** que eu fecho a **Sprint 006** com CHANGELOG v0.7 + GPS v1.5 + commit final 🏁