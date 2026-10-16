import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { setImmediate } from "node:timers/promises";
import * as React from "react";
import { loadTypescript } from "./load-typescript.mjs";

function hooks() {
  const effects = [];
  const updates = [];
  const states = [];
  let cursor = 0;
  return {
    effects, updates,
    render: (component) => { cursor = 0; return component(); },
    react: {
      ...React,
      useEffect: (effect) => effects.push(effect),
      useRef: (current) => ({ current }),
      useState: (initial) => {
        const slot = cursor++;
        if (slot >= states.length) states.push(initial);
        return [states[slot], (value) => {
          states[slot] = typeof value === "function" ? value(states[slot]) : value;
          updates.push(states[slot]);
        }];
      },
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
  assert.equal(updateUser.mock.callCount(), 0, "abrir Configurações não pode alterar metadados remotos");
  for (const value of ["Pessoa de Teste", "avatar-de-teste", "Workspace de teste", "Descrição de teste", "sp", "local"]) {
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

function cleanupButton(node) {
  if (Array.isArray(node)) {
    for (const child of node) { const found = cleanupButton(child); if (found) return found; }
  } else if (node && typeof node === "object" && node.props) {
    if (node.props.children === "Revisar e confirmar limpeza da conta") return node;
    return cleanupButton(node.props.children);
  }
}

for (const scenario of [
  { name: "cancelamento", confirmation: false, validSession: true, writes: 0 },
  { name: "confirmação com sessão válida", confirmation: true, validSession: true, writes: 1 },
  { name: "sessão expirada após abrir a tela", confirmation: true, validSession: false, writes: 0 },
  { name: "auth falha após confirmação", confirmation: true, authFailure: true, writes: 0 },
  { name: "erro ao neutralizar metadados", confirmation: true, validSession: true, writeFailure: true, writes: 1 },
]) {
  test(`limpeza remota explícita: ${scenario.name}`, async () => {
    const h = hooks();
    const events = [];
    const confirm = mock.fn((message) => { events.push("confirmar"); assert.match(message, /não revoga chaves/); return scenario.confirmation; });
    const updateUser = mock.fn(async () => {
      events.push("limpar");
      return { error: scenario.writeFailure ? { message: "Falha simulada" } : null };
    });
    let initialLoad = true;
    const getUser = mock.fn(async () => {
      events.push("autenticar");
      if (!initialLoad && scenario.authFailure) throw new Error("Falha simulada");
      const valid = initialLoad || scenario.validSession;
      return { data: { user: valid ? { id: "usuario-teste", user_metadata: {
        get api_keys() { throw new Error("Campo legado não pode ser lido"); },
      } } : null }, error: null };
    });
    const { ConfiguracoesView } = loadTypescript("src/app/configuracoes/configuracoes-view.tsx", {
      modules: {
        react: h.react,
        "@/lib/supabase/client": { getSupabaseBrowser: () => ({ auth: { getUser, updateUser }, from: () => ({ select: async () => ({ count: 0, data: [] }) }) }) },
      },
      globals: { window: { confirm, localStorage: { removeItem() {}, getItem() { throw new Error("Leitura proibida"); } } } },
    });
    h.render(ConfiguracoesView);
    const unmount = h.effects[0]();
    await setImmediate();
    assert.equal(updateUser.mock.callCount(), 0);
    assert.equal(confirm.mock.callCount(), 0);
    initialLoad = false;
    events.length = 0;
    const button = cleanupButton(h.render(ConfiguracoesView));
    assert.ok(button, "botão de confirmação deve estar disponível");
    button.props.onClick();
    await setImmediate();
    assert.equal(confirm.mock.callCount(), 1);
    assert.equal(updateUser.mock.callCount(), scenario.writes);
    assert.deepEqual(events, scenario.confirmation ? scenario.writes ? ["confirmar", "autenticar", "limpar"] : ["confirmar", "autenticar"] : ["confirmar"]);
    if (scenario.writes) assert.deepEqual(JSON.parse(JSON.stringify(updateUser.mock.calls[0].arguments)), [{ data: { api_keys: null } }]);
    if (scenario.writeFailure || scenario.authFailure) assert.ok(h.updates.includes("falhou"));
    if (!scenario.writes || scenario.writeFailure) assert.equal(h.updates.includes("concluida"), false);
    else assert.ok(h.updates.includes("concluida"));
    unmount();
  });
}

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
