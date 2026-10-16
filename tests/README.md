# Testes da correção P0 de IA

Execute `npm test` após instalar as dependências do projeto. Não há dependência
de teste nova. Os testes usam `node:test` e o TypeScript já instalado.

Para listar todos os casos no Node.js 24 (ambiente usado nesta correção):

```sh
node --test --test-isolation=none tests/*.test.mjs
```

`load-typescript.mjs` transpila os arquivos reais em memória e cria um contexto
por carregamento. Só fronteiras externas são substituídas: Supabase, transporte
de provedores e hooks de React para os efeitos de configurações. O gate e os
handlers são executados de fato. O ambiente é sintético; a rede real é bloqueada
por padrão. Os testes não carregam arquivos `.env` nem credenciais do processo.

Há casos para GET e POST de texto/imagem: sessão ausente, backend ausente,
sessão válida, expiração, erro retornado, exceção e falha de inicialização.
Pedidos negados não podem ler o payload nem alcançar provedores. Também são
verificadas a limpeza sem leitura de valores, a preservação das configurações
não sensíveis e a apresentação de status indisponível.

Esses testes não substituem testes de navegador nem homologação com Supabase ou
provedores reais. Nenhum teste altera serviços externos.
