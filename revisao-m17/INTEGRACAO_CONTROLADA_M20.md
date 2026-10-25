# Integração controlada — procedimento M20

APROVADO PARA INTEGRAÇÃO CONTROLADA: cópia independente do repositório + banco/volumes
NOVOS e locais, Storage oficial fixado + SQL M17 seguido de M19. Este procedimento
não autoriza merge, push, deploy, produção ou aplicação em banco existente.

Combinação: linux/amd64, Storage v1.84.23 / digest
sha256:7112e91307968d3eceffb5228291202d7bac8015a27af25d4b5a4b0543eadf22,
PG 15.8.1.060, GoTrue 2.170.0, PostgREST 12.2.8, Node 24.22.1 no runner,
backend file, PG_QUEUE_ENABLE=false, buckets com versioning DISABLED.
O JSON RUNTIME_STORAGE_M19.json é o contrato; não usar tag latest nem o Storage
default da CLI 2.20.12 (1.19.3). Nenhum arquivo SQL deve executar no build/start do app.

## Antes de executar

Os passos abaixo são para ESTE ambiente, depois da autorização de executar a
integração. Na M20 somente foram preparados/checados arquivos e lido o runtime M19.
O bootstrap M20 gerado ainda não foi executado. Ele deriva do bootstrap real M19;
recusa rede/container/volume preexistente e exige imagem já presente no digest.
Não há pull automático como fallback, fork ou troca de driver/daemon global.

Se os caminhos/IDs da instância antiga desaparecerem, interromper. Não retirar
guards, alterar o alvo para serviço remoto ou reutilizar volumes antigos.

```bash
set -euo pipefail
PACOTE=/workspace/scratch/anuncia-m20-3elvs7po
LAB=/tmp/anuncia-m16-1d6m9toy/m20
COPIA="$LAB/copia"
BASE=636f6d45e91b5e1bed898ff5512b4d8393b5396f
PIN='supabase/storage-api@sha256:7112e91307968d3eceffb5228291202d7bac8015a27af25d4b5a4b0543eadf22'
docker_local() {
  env -u DOCKER_HOST -u DOCKER_CONTEXT -u DOCKER_TLS -u DOCKER_TLS_VERIFY -u DOCKER_CERT_PATH \
    docker --host=unix:///tmp/anuncia-m16-1d6m9toy/run/docker.sock "$@"
}
test "$(git --no-optional-locks -C /workspace/saugc-os rev-parse HEAD)" = "$BASE"
python3 "$PACOTE/conferir-arquivos.py"
test "$(docker_local image inspect --format '{{.Id}}' "$PIN")" = \
  'sha256:2a109dc3d00d98655c91f0b428f24289ef95ed17c69ae3ce56b1b713d033f4f9'
test ! -e "$LAB"
```

O checker de arquivos confere o material distribuído por hash. O original pode
conter .github/ não rastreado: essa pasta não será transferida automaticamente.
Workflows/segredos/arquivos .env fora da base aprovada não integram este gate.

## 1. Criar infraestrutura NOVA, sem SQL AnuncIA

```bash
python3 "$PACOTE/preparar-integracao-local.py"
python3 "$PACOTE/validar-gate-local.py" --manifest "$LAB/ISOLAMENTO.json" --banco-novo
```

O primeiro comando cria só recursos M20 e executa as migrations GERIDAS dos
componentes oficiais no novo PostgreSQL. Cria chaves locais do zero, não as imprime,
e copia os roteiros/referências; NÃO aplica o schema AnuncIA. Não executar novamente
se houver falha: preservar a raiz, os logs e recursos, sem limpeza automática.

O segundo comando deve imprimir BASELINE_NOVA_VAZIA. Se as migrations geridas ainda
estiverem iniciando, aguardar o serviço ficar saudável e repetir somente essa leitura.
Qualquer outra incompatibilidade interrompe o procedimento. Ele exige zero usuários,
objetos, buckets, tabelas públicas, policies Storage e arquivos no volume; owners
Auth/Storage geridos reais, imagem exata e rede interna sem portas publicadas.

## 2. Preparar a cópia do repositório

```bash
test ! -e "$COPIA"
git clone --no-local --no-hardlinks --single-branch --branch codex/p0-seguranca-ia \
  /workspace/saugc-os "$COPIA"
test "$(git -C "$COPIA" rev-parse HEAD)" = "$BASE"
git -C "$COPIA" remote remove origin
git -C "$COPIA" switch -c integracao-controlada-m20 "$BASE"
git -C "$COPIA" apply --check "$PACOTE/arquivos-integracao/MVP_M17_CONSOLIDADO.patch"
git -C "$COPIA" apply "$PACOTE/arquivos-integracao/MVP_M17_CONSOLIDADO.patch"
for f in COMPATIBILIDADE_STORAGE_M19.sql.proposed RUNTIME_STORAGE_M19.json INTEGRACAO_CONTROLADA_M20.md; do
  test ! -e "$COPIA/revisao-m17/$f"
  install -m 0600 "$PACOTE/arquivos-integracao/$f" "$COPIA/revisao-m17/$f"
done
python3 "$PACOTE/inventario-repo.py" --repo "$COPIA" --arquivo "$LAB/repo-pos-aplicacao.json"
git -C "$COPIA" diff --stat
```

É clone local independente, sem hardlinks/worktree ligado ao original e sem remote
para push. Nenhum commit é feito. O patch já inclui o app M14 e a proposta SQL M17;
não aplicar APLICATIVO_T10.patch, MVP_M14.patch ou deltas M16/M17 novamente.
Os três arquivos novos de revisão não criam migrations automáticas.

## 3. Aplicar SQL somente no banco NOVO verificado

A ordem é: bootstrap gerido da imagem fixada → M17 → M19 → gate → testes → app.
Não iniciar tráfego de aplicação entre os scripts. Cada script possui BEGIN/COMMIT;
não remover guards, não usar --clean, db push/link ou acrescentar execução automática.

```bash
python3 "$PACOTE/validar-gate-local.py" --manifest "$LAB/ISOLAMENTO.json" --banco-novo
DBID=$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["containers"]["anuncia-m20-db"]["id"])' "$LAB/ISOLAMENTO.json")
[[ "$DBID" =~ ^[a-f0-9]{64}$ ]]
docker_local exec -i "$DBID" psql -X -U postgres -d postgres -v ON_ERROR_STOP=1 \
  -c "SET anuncia.t10_review='REVIEWED_LOCAL_ONLY'; SET anuncia.m16_review='ISOLATED_LOCAL_M16'; SET anuncia.m17_review='ISOLATED_LOCAL_M17';" \
  -f - < "$COPIA/revisao-m17/SCHEMA_CONSOLIDADO_M17.sql.proposed"
docker_local exec -i "$DBID" psql -X -U postgres -d postgres -v ON_ERROR_STOP=1 \
  -c "SET anuncia.m19_review='ISOLATED_LOCAL_M19';" \
  -f - < "$COPIA/revisao-m17/COMPATIBILIDADE_STORAGE_M19.sql.proposed"
python3 "$PACOTE/validar-gate-local.py" --manifest "$LAB/ISOLAMENTO.json" \
  --saida "$LAB/gate-pos-sql.json"
```

Os marcadores GUC são travas contra acidente; o isolamento foi conferido antes por
Docker/manifesto. Só prosseguir com COMMIT de ambos e GATE_LOCAL_APROVADO: oito
public tables com FORCE RLS, 45 policies, nove restritivas, seis funções com corpos
esperados, owner/search_path corretos, constraint M19 ativa/deferida, sem acesso API
a schema/funções privadas, owners geridos e MIME/limites/privacidade/versioning iguais.
Se M17 confirmar e M19 falhar, não há app liberado: parar e preservar a instância.
Não tentar reaplicar o consolidado em cima da instalação parcial.

## 4. Validação depois da aplicação

Instalar dependências somente na cópia, com lockfile, proxy/CA do ambiente e TLS ativo:

```bash
(cd "$COPIA" && npm ci --strict-ssl=true)
python3 "$PACOTE/checks-aplicativo.py"
for roteiro in integridade-final complemento-final corrida-commit-final operacoes-storage-aprovado; do
  docker_local exec anuncia-m20-runner env -i PATH=/usr/local/bin:/usr/bin:/bin \
    ANUNCIA_AUTORIZACAO=HOMOLOGACAO_LOCAL_DESCARTAVEL ANUNCIA_LAB="$LAB" \
    node --require "$LAB/testes/rede.cjs" "$LAB/testes/$roteiro.mjs"
done
python3 "$PACOTE/validar-gate-local.py" --manifest "$LAB/ISOLAMENTO.json" \
  --saida "$LAB/gate-pos-testes.json"
python3 "$PACOTE/inventario-repo.py" --repo "$COPIA" \
  --arquivo "$LAB/repo-pos-aplicacao.json" --conferir
```

checks-aplicativo usa o runner Node 24.22.1 com env limpo e apenas URL/anon key
LOCAL gerada; recusa .env e não imprime chaves. Executa lint zero avisos, unitários,
Webpack e TypeScript. O comando direto Next evita depender da sintaxe Windows do
script build. Logs novos em checks-aplicativo/, sem sobrescrever anteriores.

Os quatro roteiros M19 copiados usam nomes/raiz M20 e dados sintéticos novos.
Eles mantêm o protocolo de teste M19 e nomes de relatórios; só podem rodar uma vez
por raiz (wx), sem remover relatórios para forçar nova execução. Esperado: 21/21,
5/5, 3/3 e 4/4; não somar controles repetidos como cobertura independente.
É obrigatório comprovar: COMMIT 23514/40001 → 500, metadata anterior igual, bytes
anteriores com mesmo SHA, versão recusada removida, concorrência sem perder a
versão válida, A/B, abort, conta excluída, refresh e URLs assinadas corretos.

Playwright/UI do app já aprovado M17 é evidência reutilizada porque suas 301 fontes
não mudaram. Não executar a suíte sintética do repositório com build apontando ao
banco real: o problema de NEXT_PUBLIC/build único já foi documentado. Ela não é o
gate do Storage. Não foram criados novos resultados de UI, CI ou provedores reais.
A publicação de workflow continua fora desta execução.

## Critérios de interrupção

Parar ao encontrar hash/base/digest diferente; volume/raiz/rede já existentes;
rota externa/porta publicada/alvo remoto; dado não sintético; ownership, colunas ou
privilégios diferentes; arquivo .env; banco não vazio na instalação; versão/fila/
backend/versioning não qualificados; script SQL sem COMMIT; qualquer FAIL/BLOCKED,
200 em transação revertida, metadata/bytes alterados na falha, órfão, vazamento A/B,
quebra de refresh/delete guard ou mudança de fontes fora do patch.
Nenhuma dessas divergências autoriza retirar uma policy/trigger ou ignorar um teste.

## Rollback reversível

Se o erro for apenas no checkout antes de SQL, manter a cópia e interromper; o
original não foi alterado. Se houve SQL/fixtures, o rollback é operacional do
ambiente NOVO inteiro, sem desfazer parcialmente as garantias de banco.

```bash
python3 "$PACOTE/parar-integracao-local.py" --manifest "$LAB/ISOLAMENTO.json" --confirmar-parada
```

Ele confirma IDs/nomes/rede M20, para runner → Auth/REST → Storage → DB, com parada
graciosa. Não remove containers, volumes, banco ou arquivos. Guardar esses dados e
logs para diagnóstico/recuperação; não promover a instância parcialmente validada.
Não retornar ao Storage 1.19.3 nem retirar só a constraint M19 mantendo o BEFORE
permissivo para probes. Não fazer downgrade automático de migrations geridas.

Para reverter também a cópia do código, somente se ela ainda corresponder ao snapshot:

```bash
python3 "$PACOTE/inventario-repo.py" --repo "$COPIA" --arquivo "$LAB/repo-pos-aplicacao.json" --conferir
test ! -e "$LAB/recuo-arquivos"
install -d -m 0700 "$LAB/recuo-arquivos"
for f in COMPATIBILIDADE_STORAGE_M19.sql.proposed RUNTIME_STORAGE_M19.json INTEGRACAO_CONTROLADA_M20.md; do
  mv "$COPIA/revisao-m17/$f" "$LAB/recuo-arquivos/$f"
done
git -C "$COPIA" apply --reverse --check "$PACOTE/arquivos-integracao/MVP_M17_CONSOLIDADO.patch"
git -C "$COPIA" apply --reverse "$PACOTE/arquivos-integracao/MVP_M17_CONSOLIDADO.patch"
```

Se o snapshot ou reverse-check falhar, não sobrescrever nada: conservar a árvore e
examinar o diff. Sem reset --hard, clean, exclusão de volumes ou descarte de trabalho.
O rollback é um procedimento preparado, não foi executado no gate M20; a M19 ativa
foi preservada. Reativar qualquer instância somente após resolver a causa e validar
novamente os gates específicos que falharam.

## Banco EXISTENTE

Não executar passos 1/3 nem o consolidado contra banco existente. A aprovação M20
não cobre migração de origem com dados, Supabase gerenciado remoto, S3, TUS, filas
assíncronas ou versioning. A recusa --banco-novo foi testada contra M19 com fixtures
na M20 e interrompeu corretamente, sem escrita.

Para essa origem é necessária migration ADITIVA própria, comparando schema, roles,
policies, buckets, ownership e dados incompatíveis; backup consistente do banco E
arquivos; ensaio de restauração/clone sintético; revisão das migrations oficiais;
controle de uploads em curso e rollback do conjunto inteiro. Não usar IF NOT EXISTS,
DROP/CASCADE ou limpeza para transformar origem existente numa baseline vazia.
Isso é uma condição de aplicação futura, não uma nova auditoria genérica aberta.
