import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { loadTypescript } from "./load-typescript.mjs";

const { limparCredenciaisDoNavegador, neutralizarCredenciaisDoUsuario } = loadTypescript("src/lib/security/provider-credentials.ts");

test("limpeza local remove só a chave legada, sem ler ou gravar valores", () => {
  const removeItem = mock.fn();
  const storage = {
    removeItem,
    getItem() { throw new Error("Leitura de segredo proibida"); },
    setItem() { throw new Error("Gravação de segredo proibida"); },
    clear() { throw new Error("Não deve apagar outras configurações"); },
  };
  assert.equal(limparCredenciaisDoNavegador(() => storage), true);
  assert.equal(removeItem.mock.callCount(), 1);
  assert.deepEqual(Array.from(removeItem.mock.calls[0].arguments), ["anuncia_api_keys"]);
});

test("storage bloqueado não declara limpeza concluída nem propaga detalhes", () => {
  assert.equal(limparCredenciaisDoNavegador(() => { throw new Error("Storage indisponível"); }), false);
});

test("falha na remoção local não é ignorada", () => {
  assert.equal(limparCredenciaisDoNavegador(() => ({ removeItem() { throw new Error("Sem acesso"); } })), false);
});

test("limpeza remota sobrescreve só api_keys, sem ler metadados retornados", async () => {
  const updateUser = mock.fn(async () => ({
    error: null,
    get data() { throw new Error("Não deve ler os valores legados retornados"); },
  }));
  assert.equal(await neutralizarCredenciaisDoUsuario({ updateUser }), true);
  assert.equal(updateUser.mock.callCount(), 1);
  // Normaliza objetos de outro contexto VM; nenhum valor legado existe no teste.
  assert.deepEqual(JSON.parse(JSON.stringify(updateUser.mock.calls[0].arguments)), [{ data: { api_keys: null } }]);
});

test("erro retornado pela limpeza remota mantém estado pendente de correção", async () => {
  assert.equal(await neutralizarCredenciaisDoUsuario({ updateUser: async () => ({ error: { message: "Não publicar" } }) }), false);
});

test("exceção remota não expõe detalhes nem declara sucesso", async () => {
  assert.equal(await neutralizarCredenciaisDoUsuario({ updateUser: async () => { throw new Error("Não publicar"); } }), false);
});
