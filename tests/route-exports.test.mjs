import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "../src/app");
const allowed = new Set([
  "GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE", "PATCH",
  "config", "generateStaticParams", "unstable_instant", "unstable_dynamicStaleTime",
  "revalidate", "dynamic", "dynamicParams", "fetchCache", "preferredRegion", "runtime", "maxDuration",
]);
function routes(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? routes(file) : /^route\.[cm]?[jt]s$/.test(entry.name) ? [file] : [];
  });
}
for (const file of routes(root)) {
  test(`Route Handler exporta somente contratos Next.js: ${path.relative(root, file)}`, () => {
    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
    for (const statement of source.statements) {
      if (ts.isExportDeclaration(statement)) {
        if (statement.isTypeOnly) continue;
        assert.ok(statement.exportClause && ts.isNamedExports(statement.exportClause), "reexportação em massa não permitida");
        for (const element of statement.exportClause.elements) if (!element.isTypeOnly) assert.ok(allowed.has(element.name.text), element.name.text);
      } else if (statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
        if (ts.isTypeAliasDeclaration(statement) || ts.isInterfaceDeclaration(statement)) continue;
        const names = ts.isVariableStatement(statement) ? statement.declarationList.declarations.map((d) => d.name.getText(source)) : [statement.name?.text];
        for (const name of names) assert.ok(allowed.has(name), `export não permitido: ${name}`);
      } else assert.equal(ts.isExportAssignment(statement), false, "export default não permitido");
    }
  });
}
