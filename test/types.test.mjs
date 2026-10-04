// Type declaration tests (offline): generated .d.ts are current, every runtime export is declared (and nothing extra),
// and test/types-consumer.ts compiles under `strict` via the package's own "exports" map (incl. @ts-expect-error cases).
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";

const tmp = mkdtempSync(join(tmpdir(), "bl-types-"));
execFileSync(process.execPath, ["scripts/gen-types.mjs", "--out", tmp], { stdio: "pipe" });
for (const f of ["onchain.d.ts", "onchain2.d.ts"]) assert.equal(readFileSync(join(tmp, f), "utf8"), readFileSync(join("types", f), "utf8"), `types/${f} is stale: run npm run types`);
console.log("  ✓ generated types/onchain*.d.ts are up to date");

const mods = { sdk: "../src/sdk.js", onchain: "../src/onchain.js", onchain2: "../src/onchain2.js", server: "../src/server.js" };
const program = ts.createProgram(Object.keys(mods).map((m) => `types/${m}.d.ts`), { strict: true, skipLibCheck: true, module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext, target: ts.ScriptTarget.ES2022 });
const checker = program.getTypeChecker();
for (const [m, path] of Object.entries(mods)) {
  const sf = program.getSourceFile(`types/${m}.d.ts`);
  const declared = checker.getExportsOfModule(checker.getSymbolAtLocation(sf)).map((s) => s.name)
    .filter((n) => { const s = checker.getExportsOfModule(checker.getSymbolAtLocation(sf)).find((x) => x.name === n); const t = s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s; return t.flags & ts.SymbolFlags.Value; });
  const runtime = Object.keys(await import(path));
  assert.deepEqual([...declared].sort(), [...runtime].sort(), `${m}: declared value exports differ from runtime exports`);
  console.log(`  ✓ ${m}: ${runtime.length} runtime exports all declared`);
}

const cp = ts.createProgram(["test/types-consumer.ts"], { strict: true, noEmit: true, skipLibCheck: false, module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext, target: ts.ScriptTarget.ES2022, types: [] });
const diags = ts.getPreEmitDiagnostics(cp);   // includes dependency .d.ts (skipLibCheck: false): needs TypeScript >= 5.7 for @scure/btc-signer types
assert.equal(diags.length, 0, ts.formatDiagnostics(diags, { getCanonicalFileName: (f) => f, getCurrentDirectory: () => process.cwd(), getNewLine: () => "\n" }));
console.log("  ✓ test/types-consumer.ts compiles (strict, nodenext, package self-reference)");
console.log("TYPES OK");
