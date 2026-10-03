// Spawns the real MCP server over stdio with the official MCP client and calls every tool (live network).
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
const client = new Client({ name: "bl-test", version: "1.0.0" });
await client.connect(new StdioClientTransport({ command: process.execPath, args: ["bin/blockchainlab-mcp.js"] }));
const { tools } = await client.listTools(); console.log(`  ${tools.length} tools: ${tools.map(t => t.name).join(", ")}`);
const call = async (name, args, check) => {
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
await client.close(); console.log("MCP OK");
