// Spawns the real MCP server over stdio with the official MCP client and calls every tool (live network); fails if any listed tool is not called.
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
const client = new Client({ name: "bl-test", version: "1.0.0" });
await client.connect(new StdioClientTransport({ command: process.execPath, args: ["bin/blockchainlab-mcp.js"] }));
const { tools } = await client.listTools(); console.log(`  ${tools.length} tools: ${tools.map(t => t.name).join(", ")}`);
const called = new Set();
const call = async (name, args, check) => {
  called.add(name);
  const r = await client.callTool({ name, arguments: args }); const text = r.content[0].text;
  assert.ok(!r.isError, `${name} error: ${text}`); if (check) assert.ok(check(text), `${name} check failed: ${text.slice(0, 300)}`);
  console.log(`  ✓ ${name} ${JSON.stringify(args).slice(0, 60)} → ${text.replace(/\s+/g, " ").slice(0, 110)}`); return text;
};
await call("search_whitepapers", { query: "ethereum", limit: 2 }, t => t.includes("Ethereum"));
await call("get_chain", { query: "42161" }, t => t.includes("Arbitrum"));
await call("top_defi_protocols", { limit: 3 }, t => t.includes("tvl_usd"));
await call("chains_tvl", { limit: 3 }, t => t.includes("Ethereum"));
await call("list_hackathons", {}, t => t.includes("results"));
await call("list_events", {}, t => t.includes("results"));
await call("list_grants", { ecosystem: "Ethereum" }, t => t.includes("esp.ethereum.foundation"));
await call("glossary", { term: "finality" }, t => t.includes("blockchainlab.com/learn/concepts/finality"));
await call("lookup_standard", { query: "1559" }, t => t.includes("Fee market change"));
for (const ch of ["ethereum", "base", "bitcoin", "solana"]) await call("gas_prices", { chain: ch }, t => t.includes(ch));
await call("inspect_address", { address: "vitalik.eth" }, t => t.includes("vitalik.eth") && t.includes("balance"));
await call("abi_utils", { signature: "transfer(address,uint256)", args: ["0x000000000000000000000000000000000000dEaD", "1"] }, t => t.includes("0xa9059cbb"));
await call("decode_calldata", { data: "0x095ea7b3000000000000000000000000000000000000000000000000000000000000dead0000000000000000000000000000000000000000000000000000000000000001" }, t => t.includes("approve(address,uint256)"));
await call("convert_units", { value: "1", unit: "ether" }, t => t.includes("1000000000"));
await call("storage_slot", { kind: "erc7201", namespace: "example.main" }, t => t.includes("0x183a6125c38840424c4a85fa12bab2ab606c4b6d0e7cc73c0c06ba5300eab500"));
// real tx: find a recent ERC-20 transfer on Base
const { onchain: C } = await import("../src/sdk.js");
const head = Number(await C.rpc("base", "eth_blockNumber")); let tx;
for (let n = head - 5; !tx && n > head - 30; n--) tx = (await C.rpc("base", "eth_getBlockByNumber", ["0x" + n.toString(16), true])).transactions.find(t => t.input.startsWith("0xa9059cbb"));
await call("decode_transaction", { chain: "base", hash: tx.hash }, t => t.includes("transfer(address,uint256)") && t.includes("success"));

// ---- v0.2 tools ----
assert.ok(tools.length >= 43, "expected >= 43 tools, got " + tools.length);
await call("stablecoins", { symbol: "USDC" }, t => t.includes("USDC") && t.includes("circulating"));
await call("defi_yields", { stablecoinOnly: true, limit: 3 }, t => t.includes("apy"));
await call("bridges_tvl", { limit: 3 }, t => t.includes("tvl_usd"));
await call("dex_volumes", { limit: 3 }, t => t.includes("total_24h_usd"));
await call("protocol_fees", { limit: 3 }, t => t.includes("total_24h_usd"));
await call("l2_metrics", { query: "base" }, t => t.includes("Stage"));
await call("security_incidents", { minUsd: 100000000, limit: 3 }, t => t.includes("total_usd"));
const { onchain2: D2 } = await import("../src/sdk.js"); const sancList = await (await fetch("https://blockchains.github.io/blockchainlab-api/v1/sanctioned-addresses.json")).json();
const sAddr = sancList.data.find(x => x.chain === "ETH").address;
await call("sanctions_check", { addresses: [sAddr, "0x000000000000000000000000000000000000dEaD"] }, t => { const j = JSON.parse(t.split("\n\n— Built")[0]); return j.results[0].sanctioned === true && j.results[1].sanctioned === false; });
await call("get_dataset", { name: "rpc-health", limit: 2 }, t => t.includes("rpc-health"));
// real Safe from recent factory logs
const { onchain: C2 } = await import("../src/sdk.js");
const h2 = Number(await C2.rpc("ethereum", "eth_blockNumber")); let pl = [];
for (let back = 320; !pl.length && back <= 3020; back += 300) pl = await C2.rpc("ethereum", "eth_getLogs", [{ fromBlock: "0x" + (h2 - back).toString(16), toBlock: "0x" + (h2 - back + 300).toString(16), address: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2" }]);
const safeAddr = C2.ethers.getAddress("0x" + pl[0].data.slice(26, 66));
await call("safe_info", { chain: "ethereum", safe: safeAddr }, t => t.includes("threshold"));
await call("safe_tx_hash", { chain: "ethereum", safe: safeAddr, to: "0x000000000000000000000000000000000000dEaD", value: "1" }, t => t.includes('"matches": true'));
await call("decode_safe_calldata", { data: D2.encodeMultiSend([{ to: "0x000000000000000000000000000000000000dEaD", value: 7n }, { to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", data: C2.encodeCall("transfer(address,uint256)", ["0x000000000000000000000000000000000000dEaD", 5n]) }]) }, t => t.includes("multiSend") && t.includes("transfer(address,uint256)"));
await call("eip712_hash", { typedData: D2.EIP712_MAIL_EXAMPLE }, t => t.includes("0xbe609aee343fb3c4b28e1df9e632fca64fcfaede20f02e86244efddf30957bd2"));
const w = C2.ethers.Wallet.createRandom(); await call("verify_message", { message: "hi", signature: await w.signMessage("hi") }, t => t.includes(w.address));
await call("calldata_diff", { a: C2.encodeCall("transfer(address,uint256)", ["0x000000000000000000000000000000000000dEaD", 1n]), b: C2.encodeCall("transfer(address,uint256)", ["0x000000000000000000000000000000000000dEaD", 2n]) }, t => t.includes('"changed": 1'));
await call("contract_verification", { chain: "ethereum", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" }, t => t.includes('"verified": true'));
await call("gas_history", { chain: "base", blocks: 200 }, t => t.includes("median"));
await call("bridge_quotes", { from: "ethereum", to: "arbitrum", asset: "USDC", amount: 500 }, t => (t.match(/"ok": true/g) || []).length >= 2);
await call("token_approvals", { chain: "ethereum", owner: "vitalik.eth" }, t => t.includes("revoke.cash"));
await call("ens_bulk", { inputs: ["vitalik.eth", "nick.eth"] }, t => t.includes("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"));
const sigs = await D2.solRpc("getSignaturesForAddress", ["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4", { limit: 5 }]);
await call("decode_solana_tx", { signature: (sigs.find(x => !x.err) || sigs[0]).signature }, t => t.includes("computeUnits"));
const bipMd = await (await fetch("https://raw.githubusercontent.com/bitcoin/bips/master/bip-0174.mediawiki")).text();
const bipVec = bipMd.slice(bipMd.indexOf("The following are valid PSBTs")).match(/Base64 String: <(?:pre|tt)>(cHNidP8[^<]+)</)[1]; // official BIP-174 vector
await call("decode_psbt", { psbt: bipVec }, t => t.includes("1L2tGENeoh4mSoiUZrSbs1J3jazSdJH9QS"));
await call("address_labels", { chain: "ethereum", address: "0x000000000022D473030F116dDEE9F6B43aC78BA3" }, t => t.includes("Permit2"));
await call("vanity_estimate", { prefix: "dead", create2: { deployer: "0x0000000000000000000000000000000000000000", salt: "0", initCode: "0x00" } }, t => t.includes("65536") && t.includes("0x4D1A2e2bB4F88F0250f26Ffff098B0b30B26BF38"));
await call("uniswap_price_impact", { chain: "ethereum", tokenIn: D2.WETH.ethereum, tokenOut: D2.USDC.ethereum, amountIn: "1" }, t => t.includes("priceImpactPct"));
await call("mev_sandwich_check", { chain: "ethereum", hash: "0xe7f3514e534215762a686f2535721c1ec07f95a09548dc669bafb5bc03fce7f4" }, t => t.includes('"sandwiched": true'));
await call("rpc_health", { chain: "base" }, t => t.includes("healthy"));
// coverage: every tool the server lists must have been called above (add a call when you add a tool)
const uncovered = tools.map(t => t.name).filter(n => !called.has(n));
assert.deepEqual(uncovered, [], "tools without a test call: " + uncovered.join(", "));
assert.equal(called.size, tools.length, "called a tool the server does not list");
await client.close(); console.log("MCP OK", tools.length, "tools, all called");
