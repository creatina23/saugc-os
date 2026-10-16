import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { loadTypescript } from "./load-typescript.mjs";

const actor = "dono-teste";
const payload = { commercialId: "comercial-teste", status: "Revisão" };
const domainPath = "src/lib/actions/commercials-set-status.ts";
const routePath = "src/app/api/actions/commercials/set-status/route.ts";

function database({ current = { id: payload.commercialId, user_id: actor, status: "Produção" }, readError = null, updateError = null, confirmed } = {}) {
  const queries = [];
  const db = {
    from: mock.fn((table) => {
      const query = { table, filters: [], columns: [], mutation: null };
      queries.push(query);
      const chain = {
        select(columns) { query.columns.push(columns); return chain; },
        eq(column, value) { query.filters.push([column, value]); return chain; },
        update(value) { query.mutation = value; return chain; },
        async single() {
          if (!query.mutation) return { data: current, error: readError };
          const data = confirmed === undefined ? { id: payload.commercialId, status: query.mutation.status } : confirmed;
          if (!updateError && data) current = { ...current, status: data.status };
          return { data, error: updateError };
        },
      };
      return chain;
    }),
  };
  return { db, queries };
}

function executor() { return loadTypescript(domainPath); }
const plain = (value) => JSON.parse(JSON.stringify(value));

test("executor extraído preserva nome da operação e Receipt de sucesso confirmado", async () => {
  const { executarSetStatus, OPERACAO } = executor();
  const { db, queries } = database();
  assert.equal(OPERACAO, "commercials:set-status");
  const result = await executarSetStatus(db, actor, payload);
  assert.equal(result.httpStatus, 200);
  const { timestamp, ...receipt } = result.receipt;
  assert.ok(Number.isFinite(Date.parse(timestamp)));
  assert.deepEqual(plain(receipt), {
    operacao: OPERACAO, recurso: { fonte: "commercials", id: payload.commercialId },
    actorId: actor, estadoAnterior: "Produção", estadoDesejado: "Revisão",
    resultado: "confirmed", estadoConfirmado: "Revisão", evidencia: "linha-confirmada", sucesso: true, erro: null,
  });
  assert.equal(queries.length, 2);
  assert.deepEqual(plain(queries[1].mutation), { status: "Revisão" });
  assert.deepEqual(queries[1].filters, [["id", payload.commercialId]]);
  assert.deepEqual(queries[1].columns, ["id, status"]);
});

test("repetir a ação preserva idempotência por estado, sem segunda escrita", async () => {
  const { executarSetStatus } = executor();
  const { db, queries } = database();
  await executarSetStatus(db, actor, payload);
  const again = await executarSetStatus(db, actor, payload);
  assert.equal(again.httpStatus, 200);
  assert.equal(again.receipt.resultado, "already_satisfied");
  assert.equal(again.receipt.evidencia, "estado-ja-satisfeito");
  assert.equal(again.receipt.sucesso, true);
  assert.equal(queries.filter((q) => q.mutation).length, 1);
});

for (const status of ["Rascunho", "Produção", "Revisão", "Aprovado"]) {
  test(`allowlist preserva o status ${status}`, async () => {
    const { executarSetStatus } = executor();
    const { db } = database();
    assert.equal((await executarSetStatus(db, actor, { ...payload, status })).httpStatus, 200);
  });
}

for (const body of [null, "inválido", {}, { ...payload, commercialId: " " }, { ...payload, status: "Publicado" }, { ...payload, status: 1 }]) {
  test(`payload inválido é recusado sem consulta: ${JSON.stringify(body)}`, async () => {
    const { executarSetStatus } = executor();
    const { db } = database();
    assert.equal((await executarSetStatus(db, actor, body)).httpStatus, 400);
    assert.equal(db.from.mock.callCount(), 0);
  });
}

for (const current of [null, { id: payload.commercialId, user_id: "outro-dono", status: "Produção" }, { id: payload.commercialId, user_id: null, status: "Produção" }]) {
  test(`recurso ausente ou sem ownership não pode ser alterado: ${current?.user_id ?? "ausente"}`, async () => {
    const { executarSetStatus } = executor();
    const { db, queries } = database({ current, readError: current ? null : { code: "PGRST116" } });
    const result = await executarSetStatus(db, actor, payload);
    assert.equal(result.httpStatus, 404);
    assert.equal(result.erro, "Recurso não encontrado para esta sessão.");
    assert.equal(queries.length, 1);
    assert.equal(queries[0].mutation, null);
  });
}

for (const options of [
  { readError: { code: "ERRO", message: "Leitura falhou" } },
  { updateError: { message: "Atualização falhou" }, confirmed: null },
  { confirmed: null },
  { confirmed: { id: payload.commercialId, status: "Produção" } },
]) {
  test(`falha ou estado não confirmado nunca gera sucesso: ${JSON.stringify(options)}`, async () => {
    const { executarSetStatus } = executor();
    const { db } = database(options);
    const result = await executarSetStatus(db, actor, payload);
    assert.equal(result.httpStatus, 500);
    assert.equal(result.receipt.resultado, "failed");
    assert.equal(result.receipt.sucesso, false);
    assert.equal(result.receipt.evidencia, null);
    assert.ok(result.receipt.erro);
  });
}

function routeWithAuth(factory) {
  return loadTypescript(routePath, { modules: { "@/lib/supabase/server": { getSupabaseServer: factory } } });
}

for (const scenario of [
  { name: "sem backend", factory: async () => null, status: 503 },
  { name: "sem sessão", factory: async () => ({ auth: { getUser: async () => ({ data: { user: null }, error: null }) } }), status: 401 },
  { name: "auth indisponível", factory: async () => { throw new Error("Falha de teste"); }, status: 503 },
]) {
  test(`Route Handler preserva gate antes do payload: ${scenario.name}`, async () => {
    const { POST } = routeWithAuth(scenario.factory);
    const json = mock.fn(() => { throw new Error("Não deve ler payload"); });
    assert.equal((await POST({ json })).status, scenario.status);
    assert.equal(json.mock.callCount(), 0);
  });
}

test("Route Handler usa actor da sessão, ignora actor forjado e devolve Receipt", async () => {
  const { db } = database();
  const route = routeWithAuth(async () => ({ ...db, auth: { getUser: async () => ({ data: { user: { id: actor } }, error: null }) } }));
  assert.deepEqual(Object.keys(route), ["POST"]);
  const response = await route.POST({ json: async () => ({ ...payload, actorId: "forjado" }) });
  assert.equal(response.status, 200);
  const receipt = await response.json();
  assert.equal(receipt.actorId, actor);
  assert.equal(receipt.resultado, "confirmed");
});

test("Route Handler rejeita JSON inválido após autenticar, sem acessar dados", async () => {
  const { db } = database();
  const { POST } = routeWithAuth(async () => ({ ...db, auth: { getUser: async () => ({ data: { user: { id: actor } }, error: null }) } }));
  const response = await POST({ json: async () => { throw new Error("JSON inválido"); } });
  assert.equal(response.status, 400);
  assert.equal(db.from.mock.callCount(), 0);
});
