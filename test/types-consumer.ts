// Compiled (not run) by test/types.test.mjs with `tsc --strict` to check the published type declarations.
import BlockchainLab, { BlockchainLab as Named, DEFAULT_API, toolLinks, onchain, onchain2, type DatasetDoc, type Row } from "blockchainlab-mcp";
import * as C from "blockchainlab-mcp/onchain";
import * as D from "blockchainlab-mcp/onchain2";
import { createServer, main, VERSION } from "blockchainlab-mcp/server";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const bl = new BlockchainLab({ ttlMs: 60_000 });
const same: Named = bl;
const api: string = DEFAULT_API;
async function sdk() {
  const doc: DatasetDoc = await bl.dataset("stablecoins");
  const firstRow: Row | undefined = doc.data[0];
  const top = await bl.topProtocols({ limit: 3, category: "Lending" });
  const names: string[] = top.results.map((p) => String(p.name));
  const inc = await bl.incidents({ minUsd: 1e8 });
  const total: number = inc.total_usd;
  const s = await bl.sanctions(["0x000000000000000000000000000000000000dEaD"]);
  const flagged: boolean = s.results[0].sanctioned;
  const st = await bl.standard(null, "ERC-4337");
  const set: "eips" | "ercs" | "bips" = st[0].set;
  const y = await bl.yields({ stablecoinOnly: true, sort: "apy" });
  // @ts-expect-error sort only accepts "tvl" | "apy"
  await bl.yields({ sort: "random" });
  return { firstRow, names, total, flagged, set, note: y.note as string };
}
async function live() {
  const chain: C.Chain = "base";
  const block: string = await C.rpc(chain, "eth_blockNumber");
  // @ts-expect-error not a supported EVM chain
  await C.rpc("solana", "eth_blockNumber");
  const units = C.convertUnits("1", "ether");
  const slot: string = C.erc7201Slot("example.main");
  const call: string = C.encodeCall("transfer(address,uint256)", ["0x000000000000000000000000000000000000dEaD", 1n]);
  const tx: D.SafeTx = D.safeTx({ to: "0x000000000000000000000000000000000000dEaD", value: "1" });
  const batch: string = D.encodeMultiSend([{ to: tx.to, value: 7n }]);
  const h = D.typedDataHash(D.EIP712_MAIL_EXAMPLE as unknown as D.TypedData);
  const v3: D.UniV3Chain = "arbitrum";
  // @ts-expect-error Uniswap v3 is not configured on bsc
  await D.priceImpact("bsc", D.WETH.ethereum, D.USDC.ethereum, "1");
  const sameNs = onchain === C && onchain2 === D;
  return { block, units, slot, call, batch, h, v3, sameNs, link: toolLinks.tx("base", "0x00") };
}
const server: McpServer = createServer({ apiBase: DEFAULT_API });
const v: string = VERSION;
const start: () => Promise<void> = main;
export { same, api, sdk, live, server, v, start };
