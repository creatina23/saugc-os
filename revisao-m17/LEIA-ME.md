# Proposta consolidada M17 — revisao, nao instalacao automatica

Base: 636f6d45e91b5e1bed898ff5512b4d8393b5396f.
O patch inclui o aplicativo corrigido M14, que ja incorpora a compatibilidade e
os formatos T10. Nao aplicar APLICATIVO_T10.patch novamente.

O SQL proposto agrega T10, M16 e M17 numa transacao unica. Serve somente para
banco Supabase NOVO e isolado, com Auth/Storage inicializados. Nao e upgrade de
banco com dados; nao aplica nada por estar neste diretorio. Os guardas nao provam
isolamento: validacao externa de banco, daemon, rede e credenciais e obrigatoria.
Nao definir automaticamente os tres marcadores de revisao num fluxo de producao.

M17 acrescenta trigger de integridade no Storage porque a finalizacao privilegiada
na versao 1.19.3 ignora RLS. Nao substituir triggers/defaults/ownership geridos.
Antes de integrar: revisar compatibilidade de owner/owner_id, auth.users.deleted_at,
metadata.size/mimetype, locks FOR SHARE, cleanup de uploads falhos e schema exposto.

Testado com CLI 2.20.12, PG 15.8, Auth 2.170.0, Storage 1.19.3 e PostgREST 12.2.8.
Mudar qualquer versao exige nova homologacao; essa baseline antiga nao foi aprovada
para producao. O teste de criacao SQL atomica usou clone SOMENTE de schema local,
sem ownership gerido e sem defaults supabase_admin, e nao substitui os testes
Auth/Storage executados no banco original do laboratorio com ownership real.

Riscos pendentes: TUS/S3 multipart, leitura assinada ate expirar, MIME declarado
sem antivirus/sniffing, limites de bytes temporarios/quota e desempenho em escala.
O bloqueio de exclusao preserva dados, mas Auth retorna 500 e precisa UX apropriada.
Orfaos sinteticos usados na demonstracao foram preservados; nao ha limpeza automatica.
Nao autoriza commit/push/merge/deploy ou execucao fora do laboratorio.
