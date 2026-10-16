import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { setImmediate } from "node:timers/promises";
import * as React from "react";
import { loadTypescript } from "./load-typescript.mjs";

function hooks() {
  const effects = [];
  const updates = [];
  return {
    effects, updates,
    react: {
      ...React,
      useEffect: (effect) => effects.push(effect),
      useRef: (current) => ({ current }),
      useState: (initial) => [initial, (value) => updates.push(value)],
    },
  };
}

test("configurações preservam dados não sensíveis sem acessar o campo legado", async () => {
  const h = hooks();
  const readLegacy = mock.fn(() => { throw new Error("Leitura de credenciais proibida"); });
  const metadata = {
    full_name: "Pessoa de Teste",
    avatar_url: "avatar-de-teste",
    workspace: { nome: "Workspace de teste", descricao: "Descrição de teste", fuso: "sp" },
    notificacoes: { campanhas: false },
    get api_keys() { return readLegacy(); },
  };
  const updateUser = mock.fn(async () => ({ error: null }));
  const removeItem = mock.fn();
  const getItem = mock.fn(() => { throw new Error("Leitura local proibida"); });
  const supabase = {
    auth: {
      getUser: async () => ({ data: { user: { id: "usuario-teste", email: "teste@example.invalid", user_metadata: metadata } }, error: null }),
      updateUser,
    },
    from: () => ({ select: async () => ({ count: 0, data: [] }) }),
  };
  const { ConfiguracoesView } = loadTypescript("src/app/configuracoes/configuracoes-view.tsx", {
    modules: { react: h.react, "@/lib/supabase/client": { getSupabaseBrowser: () => supabase } },
    globals: { window: { localStorage: { removeItem, getItem } } },
  });
  ConfiguracoesView();
  const unmount = h.effects[0]();
  await setImmediate();
  assert.equal(readLegacy.mock.callCount(), 0);
  assert.equal(getItem.mock.callCount(), 0);
  assert.equal(removeItem.mock.calls[0].arguments[0], "anuncia_api_keys");
  assert.deepEqual(JSON.parse(JSON.stringify(updateUser.mock.calls[0].arguments)), [{ data: { api_keys: null } }]);
  for (const value of ["Pessoa de Teste", "avatar-de-teste", "Workspace de teste", "Descrição de teste", "sp", "concluida"]) {
    assert.ok(h.updates.includes(value));
  }
  assert.ok(h.updates.some((value) => value && typeof value === "object" && value.campanhas === false));
  unmount();
});

test("configurações sem backend removem cópia local sem tentar gravar metadados", async () => {
  const h = hooks();
  const removeItem = mock.fn();
  const { ConfiguracoesView } = loadTypescript("src/app/configuracoes/configuracoes-view.tsx", {
    modules: { react: h.react, "@/lib/supabase/client": { getSupabaseBrowser: () => null } },
    globals: { window: { localStorage: { removeItem } } },
  });
  ConfiguracoesView();
  const unmount = h.effects[0]();
  await setImmediate();
  assert.equal(removeItem.mock.callCount(), 1);
  assert.ok(h.updates.includes("local"));
  assert.equal(h.updates.includes("concluida"), false);
  unmount();
});

for (const status of [401, 503]) {
  test(`status dos provedores não trata HTTP ${status} como configurado`, async () => {
    const h = hooks();
    const fetch = mock.fn(async () => new Response(null, { status }));
    const { ProviderStatus } = loadTypescript("src/components/settings/provider-status.tsx", { modules: { react: h.react }, fetch });
    ProviderStatus();
    const unmount = h.effects[0]();
    await setImmediate();
    assert.deepEqual(fetch.mock.calls.map((call) => call.arguments[0]), ["/api/ia", "/api/imagem"]);
    assert.equal(h.updates.length, 1);
    for (const group of h.updates[0]) assert.equal(group.motores, null);
    unmount();
  });
}

test("status projeta apenas id e booleano da resposta autenticada", async () => {
  const h = hooks();
  const fetch = mock.fn(async () => Response.json({ motores: [{ id: "teste", armado: true, extra: "ignorar" }] }));
  const { ProviderStatus } = loadTypescript("src/components/settings/provider-status.tsx", { modules: { react: h.react }, fetch });
  ProviderStatus();
  const unmount = h.effects[0]();
  await setImmediate();
  for (const group of h.updates[0]) {
    assert.deepEqual(JSON.parse(JSON.stringify(group.motores)), [{ id: "teste", armado: true }]);
  }
  unmount();
});
