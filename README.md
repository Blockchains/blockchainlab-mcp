# Blockchain Lab MCP server + SDK

![Blockchain Lab MCP](social-preview.png)

**Give AI agents (Cursor, Claude Desktop/Code, Grok, any MCP client) real blockchain knowledge and live on-chain tools.** **43 read-only tools** over the [Blockchain Lab Open Data API](https://blockchains.github.io/blockchainlab-api/) and public RPCs. No API keys.

> Built by **Blockchain Lab — [blockchainlab.com](https://blockchainlab.com/?utm_source=github&utm_medium=readme&utm_campaign=blockchainlab-mcp)**

## Tools

| Tool | What it answers | Source |
|---|---|---|
| `search_whitepapers` | "Find papers on proof of stake from 2017" (600+ papers) | [Blockchain Lab corpus](https://blockchainlab.com/whitepaper?utm_source=github&utm_medium=readme&utm_campaign=blockchainlab-mcp) |
| `get_chain` | Chain ID → RPCs, explorers, currency | chainid.network |
| `top_defi_protocols` / `chains_tvl` | TVL rankings, filter by category/chain | DefiLlama (nightly) |
| `list_hackathons` / `list_events` | Open hackathons, upcoming events | [blockchainlab-feeds](https://github.com/Blockchains/blockchainlab-feeds) |
| `list_grants` | Grant programmes by ecosystem | curated, link-checked nightly |
| `glossary` | Plain-language definitions | blockchainlab.com |
| `lookup_standard` | EIP / ERC / BIP by number or title | ethereum/EIPs, ethereum/ERCs, bitcoin/bips |
| `gas_prices` | Live fees + USD cost (7 EVM chains, Bitcoin, Solana) | public RPCs, mempool.space, DefiLlama |
| `decode_transaction` | Decode any tx (call, args, logs, fees) | public RPCs + openchain |
| `inspect_address` | ENS, checksum, balance, contract/proxy/7702, ERC-20 | public RPCs |
| `decode_calldata` / `abi_utils` | Decode calldata, selectors, encode calls | openchain / 4byte |
| `stablecoins` · `defi_yields` · `bridges_tvl` · `dex_volumes` · `protocol_fees` | Stablecoin pegs & supply, top yields, bridges by TVL, DEX volume, protocol fees | DefiLlama (nightly) |
| `l2_metrics` | L2 stage, stack, risks, TVS breakdown | L2BEAT (nightly) |
| `security_incidents` | Hacks/exploits by protocol, technique, date, size | DefiLlama hacks DB |
| `sanctions_check` | Screen addresses against OFAC SDN list | OFAC via 0xB10C |
| `get_dataset` | Any of the 20 Open Data API datasets, raw | [blockchainlab-api](https://blockchains.github.io/blockchainlab-api/) |
| `safe_info` · `safe_tx_hash` · `decode_safe_calldata` | Safe owners/threshold/nonce; safeTxHash computed locally **and** checked against the Safe on-chain; decode execTransaction / MultiSend | public RPC |
| `eip712_hash` · `verify_message` | EIP-712 digest/domain/struct hash, recover signer, ERC-1271 check; EIP-191 recover | local + RPC |
| `calldata_diff` | Field-by-field diff of two calldata blobs | openchain / 4byte |
| `contract_verification` | Verified on Sourcify / Blockscout? compiler, licence, proxy | Sourcify, Blockscout |
| `gas_history` | Base fee / tips over ≤1,024 blocks with stats | eth_feeHistory |
| `bridge_quotes` | Live USDC/ETH bridge quotes compared | Across, LI.FI, Relay |
| `token_approvals` | Risky ERC-20 approvals + revoke calldata/link | Multicall3 + Revoke.cash link |
| `ens_bulk` | Resolve/reverse up to 50 ENS names with records | ENS |
| `decode_solana_tx` | Solana tx: instructions, programs, balance/token changes | Solana RPC |
| `decode_psbt` | Bitcoin PSBT / raw tx: inputs, outputs, fee rate, BIP-32 | local (@scure/btc-signer) |
| `address_labels` | Who is this address? tags, ENS, token, OFAC | Blockscout, ENS, token lists |
| `vanity_estimate` | Vanity prefix difficulty/time; CREATE2 address | local |
| `uniswap_price_impact` | On-chain Uniswap v3 quote + price impact | QuoterV2 + slot0 |
| `mev_sandwich_check` | Was this swap sandwiched? | eth_getBlockReceipts |
| `rpc_health` | Free public RPC latency / lag now + nightly | live probe + API |
| `convert_units` / `storage_slot` | wei↔ether etc., mapping/array/ERC-7201 slots (+ live read) | local + RPC |

## One-click install

[![Add to Cursor](https://img.shields.io/badge/Add_to-Cursor-000?logo=cursor)](cursor://anysphere.cursor-deeplink/mcp/install?name=blockchainlab&config=eyJjb21tYW5kIjogIm5weCIsICJhcmdzIjogWyIteSIsICJnaXRodWI6QmxvY2tjaGFpbnMvYmxvY2tjaGFpbmxhYi1tY3AiXX0%3D) [![Install in VS Code](https://img.shields.io/badge/Install_in-VS_Code-007ACC?logo=visualstudiocode)](https://insiders.vscode.dev/redirect/mcp/install?name=blockchainlab&config=%7B%22command%22%3A%20%22npx%22%2C%20%22args%22%3A%20%5B%22-y%22%2C%20%22github%3ABlockchains/blockchainlab-mcp%22%5D%7D) [![Install in VS Code (Docker)](https://img.shields.io/badge/VS_Code-Docker-2496ED?logo=docker)](https://insiders.vscode.dev/redirect/mcp/install?name=blockchainlab-docker&config=%7B%22command%22%3A%20%22docker%22%2C%20%22args%22%3A%20%5B%22run%22%2C%20%22-i%22%2C%20%22--rm%22%2C%20%22ghcr.io/blockchains/blockchainlab-mcp%3Alatest%22%5D%7D)

**Docker (GHCR)** — no Node needed:

```json
{ "mcpServers": { "blockchainlab": { "command": "docker", "args": ["run", "-i", "--rm", "ghcr.io/blockchains/blockchainlab-mcp:latest"] } } }
```

## Install (manual)

Requires Node ≥ 18. Not yet on the npm registry — install straight from GitHub:

**Cursor** — `~/.cursor/mcp.json` (or `.cursor/mcp.json` in a project):

```json
{
  "mcpServers": {
    "blockchainlab": { "command": "npx", "args": ["-y", "github:Blockchains/blockchainlab-mcp"] }
  }
}
```

**Claude Desktop** — `claude_desktop_config.json`: same `mcpServers` block as above.

**Claude Code**

```bash
claude mcp add blockchainlab -- npx -y github:Blockchains/blockchainlab-mcp
```

**Grok / any MCP client (stdio)** — command `npx`, args `-y github:Blockchains/blockchainlab-mcp`.

**From source**

```bash
git clone https://github.com/Blockchains/blockchainlab-mcp && cd blockchainlab-mcp && npm ci
node bin/blockchainlab-mcp.js     # speaks MCP over stdio
```

Optional env: `BLOCKCHAINLAB_API` to point at a self-hosted copy of the data API.

Try asking your agent: *"What are the top 5 lending protocols on Arbitrum by TVL?"*, *"Decode tx 0x… on Base"*, *"Which grant programmes fund Bitcoin developers?"*, *"Summarise ERC-4337 and list related whitepapers."*

## SDK

```js
import { BlockchainLab, onchain } from "blockchainlab-mcp";   // or from a GitHub install

const bl = new BlockchainLab();
await bl.searchWhitepapers({ query: "rollup", limit: 5 });
await bl.topProtocols({ category: "Lending", chain: "Arbitrum", limit: 5 });
await bl.findChain("8453");
await bl.standard("ercs", "4337");

await onchain.evmFees("base");
await onchain.decodeTx("ethereum", "0x…");
await onchain.resolveEns("vitalik.eth");
```

### TypeScript

Type declarations ship in `types/` (since v0.3.0) for every entry point: `blockchainlab-mcp`, `/onchain`, `/onchain2` and `/server`. No `@types` package or `declare module` shim is needed. Requires TypeScript ≥ 5.7 (the re-exported `@scure/btc-signer` types use generic `Uint8Array`); with older TypeScript set `skipLibCheck: true`. Checked with 5.7, 5.9 and 7.0. Chain parameters are checked: `Chain` (EVM chains of the live tools), `UniV3Chain`, `BlockscoutChain`.

```ts
import { BlockchainLab, type DatasetDoc } from "blockchainlab-mcp";
import { rpc, type Chain } from "blockchainlab-mcp/onchain";
import { createServer } from "blockchainlab-mcp/server";   // McpServer with all 43 tools, for your own transport

const bl = new BlockchainLab();
const top = await bl.topProtocols({ category: "Lending", limit: 3 });   // { generated_at, source, results: Row[] }
const chain: Chain = "base";
const head: string = await rpc(chain, "eth_blockNumber");
```

`types/onchain*.d.ts` are generated from the JS sources (`npm run types`). `types/sdk.d.ts` and `types/server.d.ts` are hand-written. `test/types.test.mjs` fails if any of them drift from the runtime exports.

## Tests (live, no mocks)

```bash
npm test   # type declarations (offline) + SDK against the live API + spawns the real MCP server over stdio and calls all 43 tools (fails if any listed tool is untested)
```

CI runs on Node 18/20/22 on every push and daily.

## Related

[Tools site](https://blockchains.github.io/blockchainlab-tools/) · [Open Data API](https://blockchains.github.io/blockchainlab-api/) · [Lens](https://github.com/Blockchains/blockchainlab-lens) · [Labs](https://github.com/Blockchains/blockchainlab-labs) · [Roadmap](https://github.com/Blockchains/blockchain-dev-roadmap)

MIT. Read-only: the server never signs or sends transactions. Not financial advice.

<!-- blocks:start -->
## Use as a building block

> **For AI agents and builders:** read [`AGENTS.md`](AGENTS.md) (setup, commands, structure, rules), [`llms.txt`](llms.txt) (doc map) and the machine-readable [`blocks.json`](blocks.json) ([schema](https://github.com/Blockchains/.github/blob/main/docs/BLOCKS-SCHEMA.md)). How all Blockchains blocks fit together: **[Build with Blocks](https://github.com/Blockchains/.github/blob/main/docs/BUILD-WITH-BLOCKS.md)** · org catalogue: [https://blockchains.github.io/blocks.json](https://blockchains.github.io/blocks.json).

**What it exports**

| Export | Type | Install / access |
|---|---|---|
| `blockchainlab` | mcp-stdio | `npx -y github:Blockchains/blockchainlab-mcp` |
| `ghcr.io/blockchains/blockchainlab-mcp` | docker | `docker run -i --rm ghcr.io/blockchains/blockchainlab-mcp:0.3.0` |
| `blockchainlab-mcp` | npm | `npm i github:Blockchains/blockchainlab-mcp#v0.3.0` |
| `blockchainlab-mcp/server` | npm | `npm i github:Blockchains/blockchainlab-mcp#v0.3.0` |

`blockchainlab` exports: `search_whitepapers`, `get_chain`, `top_defi_protocols`, `chains_tvl`, `list_hackathons`, `list_events`, `list_grants`, `glossary`, `lookup_standard`, `gas_prices`, `decode_transaction`, `inspect_address`, `decode_calldata`, `abi_utils`, `convert_units`, `storage_slot`, `stablecoins`, `defi_yields`, `bridges_tvl`, `dex_volumes`, `protocol_fees`, `l2_metrics`, `security_incidents`, `sanctions_check`, `get_dataset`, `safe_info`, `safe_tx_hash`, `decode_safe_calldata`, `eip712_hash`, `verify_message`, `calldata_diff`, `contract_verification`, `gas_history`, `bridge_quotes`, `token_approvals`, `ens_bulk`, `decode_solana_tx`, `decode_psbt`, `address_labels`, `vanity_estimate`, `uniswap_price_impact`, `mev_sandwich_check`, `rpc_health`

`blockchainlab-mcp` exports: `BlockchainLab`, `onchain`, `onchain2`, `toolLinks`, `DEFAULT_API`, `TOOLS_SITE`, `SITE`

`blockchainlab-mcp/server` exports: `createServer`, `main`, `VERSION`

**Minimal example** (Cursor `~/.cursor/mcp.json`, Claude Desktop or any stdio MCP client; `tools/list` returned 43 tools on 2026-10-04)

```json
{ "mcpServers": { "blockchainlab": { "command": "npx", "args": ["-y", "github:Blockchains/blockchainlab-mcp"] } } }
```

**Inputs → outputs**

- In: `tool call` (MCP tools/call) JSON arguments per tool (see tools/list input schemas); `BLOCKCHAINLAB_API` (env) optional self-hosted API base
- Out: `tool result` (MCP content (JSON text)) data with generated_at/source fields and deep links to blockchainlab-tools pages

**Composes with**

- [Blockchains/blockchainlab-api](https://github.com/Blockchains/blockchainlab-api): data source for the dataset tools
- [Blockchains/blockchainlab-tools](https://github.com/Blockchains/blockchainlab-tools): shares the on-chain logic (`src/onchain*.js` mirror `assets/core*.js`); results link to tool pages
- [Blockchains/grokhack-forge](https://github.com/Blockchains/grokhack-forge): give a composed Grok app's developer agent these tools, or call the SDK in app code
- [Blockchains/blockchainlab-sdk](https://github.com/Blockchains/blockchainlab-sdk): TS + Python client for the same datasets (this package also ships TypeScript types since v0.3.0)
- [Blockchains/blockchainlab-lens](https://github.com/Blockchains/blockchainlab-lens): same explorer deep links

**Versioning & stability:** `beta`. 0.x: tool names are kept stable, but new tools are added and output fields may grow. Releases are git tags + GitHub releases (latest v0.3.0: TypeScript declarations); not on the npm registry yet, so install from GitHub pinned to a tag (`#v0.3.0`) or use the GHCR image (`:0.3.0`, `:latest`). `server.json` is prepared for the MCP Registry.
<!-- blocks:end -->

## Contributing

Issues and pull requests are welcome. Please read the [contributing guide](https://github.com/Blockchains/.github/blob/main/CONTRIBUTING.md), [code of conduct](https://github.com/Blockchains/.github/blob/main/CODE_OF_CONDUCT.md) and [security policy](https://github.com/Blockchains/.github/blob/main/SECURITY.md) first.

---
Built by Blockchain Lab — [blockchainlab.com](https://blockchainlab.com/?utm_source=github&utm_medium=readme&utm_campaign=blockchainlab-mcp)

## Release & packaging

- `npm pack --dry-run` is run in CI; the package is **ready but deliberately not published** to npm. To publish: `npm publish` (name `blockchainlab-mcp`).
- `server.json` is prepared for the official MCP Registry (`io.github.Blockchains/blockchainlab-mcp`) — publish with `mcp-publisher publish` after the npm release.
- Docker image `ghcr.io/blockchains/blockchainlab-mcp` (linux/amd64 + arm64) is built, smoke-tested over stdio (initialize + tools/list ≥ 43) and pushed on every push to `main` and on `v*` tags (`:latest`, `:<version>`, `:sha-…`).
- Releases: git tags `vX.Y.Z` with GitHub releases (first: [v0.3.0](https://github.com/Blockchains/blockchainlab-mcp/releases/tag/v0.3.0)). Install a release from GitHub with `npm i github:Blockchains/blockchainlab-mcp#v0.3.0`, or pull `ghcr.io/blockchains/blockchainlab-mcp:0.3.0`.
