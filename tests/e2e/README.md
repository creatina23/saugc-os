# Regressão HTTP e responsividade (sem serviços reais)

```sh
npm ci
npx playwright install --with-deps chromium
npm run build -- --webpack
npm run test:e2e
```

`@playwright/test` está fixado em 1.62.1, com dependências no lockfile.
Node.js 24 é o ambiente de validação. O navegador padrão é a revisão instalada
pela versão fixada do Playwright. Para usar um Chromium já instalado, defina
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` (por exemplo `/usr/bin/chromium`). Registre
a versão desse navegador ao comparar resultados. Não há workflow CI nesta mudança.

Execute o build e a suíte em checkout isolado, sem `.env*` e sem credenciais de
serviços. O launcher recusa arquivos `.env*` sem ler valores. Os processos Next
recebem ambiente novo, sem herdar chaves de provedores ou credenciais do processo.
O build também deve ser executado sem credenciais. O launcher exige build existente
e não reutiliza servidores. Faça novo build após qualquer mudança no app.

A configuração inicia apenas em loopback:

- 3187: aplicação sem backend;
- 3188: aplicação com Supabase Auth sintético;
- 3199: double local de Auth e contadores de requisições (nenhum banco).

As sessões e assinaturas são fictícias. O double **não valida JWT** e existe só
no processo de testes; não é autenticação de produção e não é importado pelo app.
O app continua usando `auth.getUser()` e o gate real. O double permite testar
401/503/200/400, precedência sobre JSON inválido e ausência de acesso a dados.

Fetch externo dos processos Next é bloqueado pelo preload de testes; as páginas
também bloqueiam rede externa e verificam que não houve tentativas. Nenhum teste
faz chamada real de IA, usa banco, revoga chaves ou altera serviços remotos.

Os testes cobrem 320, 375, 390, 414, 768 e 1280 px, abas por teclado, alternância
do IA Studio, limpeza com confirmação e contratos de API/HTML. Larguras medidas
são anexadas ao relatório JSON em `test-results/playwright-results.json`.

No sandbox desta sessão, Chromium e servidores locais exigem permissão de execução
adicional por bloqueio de sockets. Esse limite de ambiente não deve ser contornado
modificando o app ou desabilitando seus checks. Os testes não substituem homologação
de cookies, RLS e persistência com um projeto Supabase exclusivo de teste.
