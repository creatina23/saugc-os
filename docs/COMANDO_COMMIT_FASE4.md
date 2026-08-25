# 🚀 COMANDO DE COMMIT — FASE 4 MÍDIAS + BIBLIOTECA
**Data: 25 ago 2026 · Build Verde 9.6s · Prova OK**

> Cole no PowerShell UMA LINHA POR VEZ (Lei L5). O build do dono é cerimônia de vitória.

---

## 📦 PACOTE DE ENTREGA CASADA (5ª Barreira)

**Lista completa de arquivos do passe:**

1. `src/app/ia-studio/ia-studio-view.tsx` → v3.4 Fase 4 (NOVO)
   - Prova: `handleSalvarImagemEmMidias` = 2
   - O que faz: botão "Salvar em Mídias + Biblioteca" + upload bucket + assets + library_items

2. `docs/010_CHANGELOG.md` → v1.8 RECONSTRUÍDO (NOVO)
   - Prova: `[v1.8]` = 1, `[v1.7]` = 1
   - O que faz: histórico completo v1.1→v1.8 (32KB) reconstruído do contexto 000-030

3. `docs/VERSOES.md` → v3.4 Fase 4 (ATUALIZADO)
   - Prova: `handleSalvarImagemEmMidias` = 2
   - O que faz: mapa de sincronia atualizado

4. `docs/COMANDO_RE_CRIACAO_v4.md` → v4 (NOVO)
   - Prova: `Copiloto AnuncIA a postos` = 1
   - O que faz: comando de ativação v4 (antes só v3 no repo)

5. `docs/ARQUITETURA_INTELIGENCIA_EXPANSAO.md` → v1 (NOVO)
   - Prova: `ORQUESTRADOR` = 1
   - O que faz: visão Orquestrador + 5 novos agentes

6. `docs/MODO_OPERACIONAL_USUARIO.md` → v1 (NOVO)
   - Prova: `PILOTO DE MISSÃO` = 1
   - O que faz: modo TDAH-friendly + 1 prioridade

7. `docs/000-030_contexto_completo.txt` → backup (NOVO)
   - Prova: `SAUGC OS — Histórico` = 1
   - O que faz: backup histórico completo

---

## 🩺 PROVA DE DEPENDÊNCIA 10s (rodar ANTES do build)

Abra cada arquivo no VS Code e Ctrl+F:

1. `ia-studio-view.tsx` → `handleSalvarImagemEmMidias` → **2**
2. `ia-studio-view.tsx` → `handleUsarNoGeradorImagem` → **2**
3. `api/imagem/route.ts` → `gerarViaHuggingFace` → **2** (já está no repo)
4. `services/imagem-service.ts` → `referencia?: string;` → **1** (já está)
5. `services/index.ts` → `from "./imagem-service"` → **1** (já está)

Se qualquer prova falhar → baixa o combo da bancata `/anuncia/codigo/`

---

## 🚦 COMANDOS — UMA LINHA POR VEZ (PowerShell)

```powershell
# 1. Vai pra pasta do app
cd C:\Projetos\BKp\saugc-os

# 2. Confere o que mudou
git status

# 3. Limpa build antigo
Remove-Item -Recurse -Force .next

# 4. Porteiro 1 — lint (tem que passar com 0 erros, 1 warning amarelo do Badge é OK)
npm run lint

# 5. Porteiro 2 — build (tem que ficar VERDE em ~10s)
npm run build

# 6. Se build verde → adiciona tudo
git add -A

# 7. Commit — mensagem padrão da casa
git commit -m "feat: 019 Fase 4 - salvar imagem em Midias + Biblioteca (v3.4) + papelada 010 reconstruido + comandos v4"

# 8. Push — sobe pra Vercel (deploy ~2 min)
git push

# 9. Depois do push → Ctrl+Shift+R em https://anuncia-three.vercel.app/ia-studio
```

---

## ✅ CHECKLIST PÓS-PUSH

- [ ] Vercel deploy verde (ver em vercel.com)
- [ ] Abre /ia-studio → gera 1 imagem → clica "Salvar em Mídias + Biblioteca"
- [ ] Mensagem: "Salva em Mídias + Biblioteca! Já aparece em /assets e /biblioteca."
- [ ] Confere em /assets → nova imagem aparece com tag "ia-studio"
- [ ] Confere em /biblioteca → novo item "Imagem — ..." aparece

Se tudo OK → me manda "deu certo" que eu fecho a 019 e abro a 020-A Orquestrador MVP.

---

## 📋 RELATÓRIO DO COPILOTO (Lei L10)

- ✔ **Criado:** ia-studio-view v3.4 Fase 4 + 010_CHANGELOG.md reconstruído + VERSOES.md v3.4 + 3 comandos v4
- ✏️ **Alterado:** nenhum arquivo do repo por aqui — quem aplica é você (L11)
- 🎯 **Motivo:** Fase 4 = último passo da Sprint 019 (salvar imagem gerada) + papelada 100% organizada
- ▶️ **Próximo:** 020-A Orquestrador MVP (pipeline fixa "Produção Completa")

**Build da bancada:** 9.6s verde · Lint: 1 warning amarelo (Badge antigo, não é nosso)
