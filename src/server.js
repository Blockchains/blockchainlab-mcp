// Blockchain Lab MCP server (stdio). Built by Blockchain Lab — https://blockchainlab.com
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { BlockchainLab, toolLinks } from "./sdk.js";
import * as C from "./onchain.js";

const CHAIN = z.enum(Object.keys(C.CHAINS)).describe("EVM chain: " + Object.keys(C.CHAINS).join(", "));
const ser = (o) => JSON.stringify(o, (k, v) => (typeof v === "bigint" ? v.toString() : v), 2);
const reply = (o) => ({ content: [{ type: "text", text: ser(o) + "\n\n— Built by Blockchain Lab (https://blockchainlab.com)" }] });
const guard = (fn) => async (args) => { try { return reply(await fn(args)); } catch (e) { return { isError: true, content: [{ type: "text", text: `Error: ${e.shortMessage || e.message}` }] }; } };

export function createServer(opts = {}) {
  const bl = new BlockchainLab(opts);
  const s = new McpServer({ name: "blockchainlab", version: "0.1.0" });
  const ro = { readOnlyHint: true, openWorldHint: true };

  s.registerTool("search_whitepapers", { title: "Search whitepapers", description: "Search Blockchain Lab's research corpus (600+ blockchain whitepapers) by text, topic or year. Returns metadata + original source + blockchainlab.com link.", inputSchema: { query: z.string().optional(), topic: z.string().optional(), year: z.number().int().optional(), limit: z.number().int().min(1).max(50).optional() }, annotations: ro }, guard((a) => bl.searchWhitepapers(a)));
  s.registerTool("get_chain", { title: "Find EVM chain", description: "Look up an EVM chain by chain ID, short name or name: native currency, public RPCs, explorers (chainid.network).", inputSchema: { query: z.string() }, annotations: ro }, guard(({ query }) => bl.findChain(query)));
  s.registerTool("top_defi_protocols", { title: "Top DeFi protocols by TVL", description: "Top DeFi protocols by TVL in USD from DefiLlama (nightly snapshot), optionally filtered by category (e.g. Lending, Dexs, Liquid Staking) or chain.", inputSchema: { limit: z.number().int().min(1).max(100).optional(), category: z.string().optional(), chain: z.string().optional() }, annotations: ro }, guard((a) => bl.topProtocols(a)));
  s.registerTool("chains_tvl", { title: "DeFi TVL by chain", description: "DeFi TVL ranking by chain (DefiLlama nightly snapshot).", inputSchema: { limit: z.number().int().min(1).max(100).optional() }, annotations: ro }, guard((a) => bl.chainsTvl(a)));
  s.registerTool("list_hackathons", { title: "Blockchain hackathons", description: "Open and upcoming blockchain hackathons (Devpost, ETHGlobal) from the Blockchain Lab feeds.", inputSchema: {}, annotations: ro }, guard(() => bl.hackathons()));
  s.registerTool("list_events", { title: "Blockchain events", description: "Upcoming blockchain events from the Blockchain Lab feeds.", inputSchema: {}, annotations: ro }, guard(() => bl.events()));
  s.registerTool("list_grants", { title: "Grant programmes", description: "Directory of blockchain ecosystem grant programmes with official links (link status re-checked nightly).", inputSchema: { ecosystem: z.string().optional() }, annotations: ro }, guard((a) => bl.grants(a)));
  s.registerTool("glossary", { title: "Blockchain glossary", description: "Plain-language definitions from blockchainlab.com. Omit term to list all terms.", inputSchema: { term: z.string().optional() }, annotations: ro }, guard(({ term }) => bl.glossary(term)));
  s.registerTool("lookup_standard", { title: "EIP / ERC / BIP lookup", description: "Find an Ethereum EIP/ERC or Bitcoin BIP by number (e.g. 'ERC-4337', '1559', 'BIP-341') or title words.", inputSchema: { query: z.string(), kind: z.enum(["eips", "ercs", "bips"]).optional() }, annotations: ro }, guard(({ query, kind }) => bl.standard(kind, query)));

  s.registerTool("gas_prices", { title: "Live gas / fees", description: "Live fees from public RPCs: EVM base fee + priority tips (eth_feeHistory) and cost in native token + USD for a given gas amount; or Bitcoin sat/vB; or Solana priority fees.", inputSchema: { chain: z.enum([...Object.keys(C.CHAINS), "bitcoin", "solana"]), gasUnits: z.number().int().positive().optional() }, annotations: ro }, guard(async ({ chain, gasUnits = 21000 }) => {
    if (chain === "bitcoin") return { chain, satPerVbyte: await C.btcFees(), source: "mempool.space" };
    if (chain === "solana") return { chain, ...(await C.solFees()), source: "Solana RPC getRecentPrioritizationFees" };
    const f = await C.evmFees(chain); const cost = C.feeCost(f, gasUnits); const px = (await C.prices([C.CHAINS[chain].gecko]))[C.CHAINS[chain].gecko];
    const nat = Number(C.ethers.formatEther(cost.totalWei));
    return { chain, baseFeeGwei: f.baseFeeWei !== undefined ? C.ethers.formatUnits(f.baseFeeWei, "gwei") : null, tipGwei: f.tipWei ? Object.fromEntries(Object.entries(f.tipWei).map(([k, v]) => [k, C.ethers.formatUnits(v, "gwei")])) : null, gasPriceGwei: C.ethers.formatUnits(f.gasPriceWei, "gwei"), gasUnits, costNative: nat, nativeSymbol: C.CHAINS[chain].symbol, costUsd: px ? nat * px : null, priceSource: "DefiLlama coins API", note: C.CHAINS[chain].l2 ? "L2 execution fee only; rollups add an L1 data fee." : undefined };
  }));
  s.registerTool("decode_transaction", { title: "Decode transaction", description: "Fetch and decode a transaction by hash: status, fees, decoded function call + args, decoded event logs.", inputSchema: { chain: CHAIN, hash: z.string().regex(/^0x[0-9a-fA-F]{64}$/) }, annotations: ro }, guard(async ({ chain, hash }) => ({ ...(await C.decodeTx(chain, hash)), view: toolLinks.tx(chain, hash) })));
  s.registerTool("inspect_address", { title: "Inspect address / ENS", description: "Resolve ENS, validate checksum, and inspect an address on a chain: balance, nonce, contract/EOA, proxy implementation, EIP-7702 delegation, ERC-20 metadata.", inputSchema: { address: z.string().describe("0x address or ENS name"), chain: CHAIN.optional() }, annotations: ro }, guard(async ({ address, chain = "ethereum" }) => {
    let addr = address.trim(); let ens = null;
    if (!addr.startsWith("0x")) { ens = addr; addr = await C.resolveEns(addr); if (!addr) throw new Error("ENS name does not resolve"); }
    const chk = C.checkAddress(addr); if (!chk.valid) throw new Error("Invalid address");
    const info = await C.addressInfo(chain, chk.checksum);
    const erc20 = info.isContract && !info.eip7702DelegatesTo ? await C.erc20Meta(chain, chk.checksum) : null;
    return { input: address, ens, address: chk.checksum, inputChecksumValid: chk.inputChecksumValid, primaryName: await C.reverseEns(chk.checksum).catch(() => null), ...info, balance: C.ethers.formatEther(info.balanceWei) + " " + C.CHAINS[chain].symbol, erc20: erc20?.symbol ? erc20 : null, view: toolLinks.address(chk.checksum, chain) };
  }));
  s.registerTool("decode_calldata", { title: "Decode calldata", description: "Decode EVM calldata; looks up the 4-byte selector in openchain/4byte unless a signature is given.", inputSchema: { data: z.string(), signature: z.string().optional() }, annotations: ro }, guard(({ data, signature }) => C.decodeCalldata(data, signature)));
  s.registerTool("abi_utils", { title: "Selector / encode", description: "Compute a function selector & event topic for a signature, and optionally ABI-encode a call with args.", inputSchema: { signature: z.string(), args: z.array(z.any()).optional() }, annotations: { readOnlyHint: true } }, guard(({ signature, args }) => ({ canonical: C.normSig(signature), selector: C.selector(signature), topic: C.topic(signature), calldata: args ? C.encodeCall(signature, args) : undefined })));
  s.registerTool("convert_units", { title: "Convert units", description: "Exact conversion between wei/gwei/ether, sat/btc, lamport/sol.", inputSchema: { value: z.string(), unit: z.enum(Object.keys(C.UNITS)) }, annotations: { readOnlyHint: true } }, guard(({ value, unit }) => C.convertUnits(value, unit)));
  s.registerTool("storage_slot", { title: "Storage slot", description: "Compute a Solidity storage slot (mapping, nested mapping, array element, ERC-7201 namespace) and optionally read it live.", inputSchema: { kind: z.enum(["mapping", "array", "erc7201"]), slot: z.string().optional(), keys: z.array(z.tuple([z.string(), z.string()])).optional().describe("[[type,value],...] for mapping"), index: z.string().optional(), namespace: z.string().optional(), read: z.object({ chain: CHAIN, address: z.string() }).optional() }, annotations: ro }, guard(async (a) => {
    const slot = a.kind === "mapping" ? C.nestedMappingSlot(a.keys || [], a.slot || "0") : a.kind === "array" ? C.arrayElementSlot(a.slot || "0", a.index || "0") : C.erc7201Slot(a.namespace || "");
    return { slot, value: a.read ? await C.readSlot(a.read.chain, a.read.address, slot) : undefined };
  }));
  return s;
}

export async function main() {
  const server = createServer({ apiBase: process.env.BLOCKCHAINLAB_API || undefined });
  await server.connect(new StdioServerTransport());
  console.error("Blockchain Lab MCP server running on stdio — https://blockchainlab.com");
}
