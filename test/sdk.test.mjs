// Live SDK tests against the published Blockchain Lab Open Data API.
import assert from "node:assert/strict";
import { BlockchainLab } from "../src/sdk.js";
const bl = new BlockchainLab(); const ok = (m) => console.log("  ✓ " + m);
const cat = await bl.catalogue(); assert.ok(cat.datasets.length >= 10); ok(`catalogue: ${cat.datasets.length} datasets`);
const wp = await bl.searchWhitepapers({ query: "bitcoin", limit: 3 }); assert.ok(wp.total > 0); ok(`whitepapers 'bitcoin': ${wp.total} (${wp.results[0].title})`);
assert.equal((await bl.getWhitepaper("bitcoin")).year, 2008); ok("getWhitepaper(bitcoin) year 2008");
const base = await bl.findChain("8453"); assert.equal(base[0].name, "Base"); ok("findChain 8453 = Base");
const top = await bl.topProtocols({ limit: 3 }); assert.equal(top.results.length, 3); ok("topProtocols: " + top.results.map(p => p.name).join(", "));
const lend = await bl.topProtocols({ category: "Lending", limit: 2 }); assert.ok(lend.results.every(p => p.category === "Lending")); ok("lending filter");
assert.ok((await bl.chainsTvl({ limit: 5 })).results.length === 5); ok("chainsTvl");
const h = await bl.hackathons(); assert.ok(Array.isArray(h.results)); ok(`hackathons ${h.results.length}`);
const g = await bl.grants({ ecosystem: "bitcoin" }); assert.ok(g.results.length >= 3); ok(`grants bitcoin ${g.results.length}`);
const gl = await bl.glossary("merkle"); assert.ok(gl.length >= 1); ok("glossary merkle: " + gl[0].definition.slice(0, 50));
const e = await bl.standard(null, "ERC-4337"); assert.ok(e.some(x => x.number === 4337)); ok("standard ERC-4337: " + e[0].title);
const b = await bl.standard("bips", "341"); assert.equal(b[0].number, 341); ok("BIP-341: " + b[0].title);
console.log("SDK OK");
