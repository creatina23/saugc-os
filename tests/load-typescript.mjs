import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const runtimeRequire = createRequire(import.meta.url);

/** Executa o código-fonte real sem emitir arquivos. Cada teste tem módulos,
 *  ambiente e fetch isolados: nenhuma credencial ou rede real é utilizada.
 *  Os doubles substituem fronteiras externas, não o gate ou os handlers. */
export function loadTypescript(entry, { modules = {}, env = {}, fetch, globals = {} } = {}) {
  const context = vm.createContext({
    Request, Response, Headers, URL, AbortSignal, AbortController,
    FormData, Blob, Buffer, TextEncoder, TextDecoder, setTimeout, clearTimeout,
    console: { log() {}, warn() {}, error() {} },
    process: { env: { ...env } },
    fetch: fetch ?? (() => { throw new Error("Rede real proibida nos testes"); }),
    ...globals,
  });
  const cache = new Map();
  function sourceFile(filename) {
    return existsSync(filename + ".ts") ? filename + ".ts" : filename + ".tsx";
  }
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const source = readFileSync(filename, "utf8");
    const result = ts.transpileModule(source, {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    });
    const compiledModule = { exports: {} };
    cache.set(filename, compiledModule);
    const requireModule = (id) => {
      if (Object.hasOwn(modules, id)) return modules[id];
      if (id.startsWith("@/")) return load(sourceFile(path.join(root, "src", id.slice(2))));
      if (id.startsWith(".")) return load(sourceFile(path.resolve(path.dirname(filename), id)));
      return runtimeRequire(id);
    };
    vm.compileFunction(result.outputText, ["exports", "require", "module", "__filename", "__dirname"], {
      parsingContext: context,
      filename,
    })(compiledModule.exports, requireModule, compiledModule, filename, path.dirname(filename));
    return compiledModule.exports;
  }
  return load(path.join(root, entry));
}
