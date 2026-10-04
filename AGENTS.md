# AGENTS.md: blockchainlab-mcp

Instructions for AI coding agents (Grok, Cursor, Claude Code, Codex, Copilot and others) working **in** this repo or **using it as a building block**. Humans: see [README.md](README.md).

## What this is

MCP server (stdio) with 43 read-only blockchain tools for AI agents (Cursor, Claude, Grok, any MCP client) plus the same logic as a JS SDK: datasets from the Open Data API and live on-chain helpers (tx/calldata decoding, gas, ENS, Safe, EIP-712, approvals, MEV, Solana, PSBT). No keys; never signs or sends.

- Kind: mcp-server, library, cli · stability: `beta` · licence: MIT
- Machine-readable manifest: [`blocks.json`](blocks.json) (schema: [BLOCKS-SCHEMA](https://github.com/Blockchains/.github/blob/main/docs/BLOCKS-SCHEMA.md))
- How it fits with the other Blockchains repos: [Build with Blocks](https://github.com/Blockchains/.github/blob/main/docs/BUILD-WITH-BLOCKS.md)

## Setup

```bash
npm ci
node bin/blockchainlab-mcp.js   # speaks MCP over stdio
```

## Build and test

```bash
npm test   # types (offline) + SDK against the live API + real stdio server calling all 43 tools (fails if a listed tool is untested)
node test/types.test.mjs   # declarations only, offline
npm run types   # regenerate types/onchain*.d.ts after changing src/onchain*.js
npm pack --dry-run
```

Tests hit **live** public networks/APIs (the org rule is no mocks). A failure can be an upstream outage: re-run before changing code.

## Environment

| Variable | Required | Purpose |
|---|---|---|
| `BLOCKCHAINLAB_API` | no | point at a self-hosted copy of the Open Data API |

## Structure

| Path | What |
|---|---|
| `bin/blockchainlab-mcp.js` | CLI entry (stdio server) |
| `src/server.js` | MCP tool definitions (zod schemas) and handlers |
| `src/sdk.js` | `BlockchainLab` dataset client + `toolLinks` |
| `src/onchain.js, src/onchain2.js` | live on-chain helpers (ethers v6, @scure/btc-signer) |
| `test/` | types test (offline), live SDK + MCP stdio tests |
| `types/` | TypeScript declarations (onchain*.d.ts generated, sdk/server hand-written) |
| `scripts/gen-types.mjs` | declaration generator |
| `Dockerfile, server.json` | container image and MCP Registry metadata |

## Conventions

- Read-only: no tool may sign or broadcast transactions.
- Every tool returns source and timestamp fields; no fabricated values.
- Keep `src/onchain*.js` in sync with blockchainlab-tools `assets/core*.js` when fixing shared logic.

## Extension points

- New tool: register it in `src/server.js` with a zod input schema, put logic in `src/sdk.js` or `src/onchain*.js`, add a live call in `test/mcp.test.mjs` (the coverage check fails otherwise).
- New export: after changing `src/onchain*.js` run `npm run types`; for `src/sdk.js` / `src/server.js` edit `types/sdk.d.ts` / `types/server.d.ts` by hand.
- Custom data: set `BLOCKCHAINLAB_API`.

## Do

- Update the tool table in README.md and the Docker smoke-test threshold when adding tools.

## Don't

- Add write/sign capabilities.
- Invent data, mock network responses in shipped code, or hard-code values that should come from the live source; every repo here is 'no mocks, real data'.
- Commit secrets, keys or `.env` files. Run `gitleaks` before pushing; CI and the org policy reject leaks.

## Using it from another project

- **blockchainlab** (mcp-stdio): `npx -y github:Blockchains/blockchainlab-mcp`
- **ghcr.io/blockchains/blockchainlab-mcp** (docker): `docker run -i --rm ghcr.io/blockchains/blockchainlab-mcp:0.3.0`
- **blockchainlab-mcp** (npm): `npm i github:Blockchains/blockchainlab-mcp#v0.3.0`
- **blockchainlab-mcp/server** (npm): `npm i github:Blockchains/blockchainlab-mcp#v0.3.0`

See the README section [Use as a building block](README.md#use-as-a-building-block) for a copy-paste example.

## Related blocks

- [Blockchains/blockchainlab-api](https://github.com/Blockchains/blockchainlab-api): data source for the dataset tools
- [Blockchains/blockchainlab-tools](https://github.com/Blockchains/blockchainlab-tools): shares the on-chain logic (`src/onchain*.js` mirror `assets/core*.js`); results link to tool pages
- [Blockchains/grokhack-forge](https://github.com/Blockchains/grokhack-forge): give a composed Grok app's developer agent these tools, or call the SDK in app code
- [Blockchains/blockchainlab-sdk](https://github.com/Blockchains/blockchainlab-sdk): TS + Python client for the same datasets (this package also ships TypeScript types since v0.3.0)
- [Blockchains/blockchainlab-lens](https://github.com/Blockchains/blockchainlab-lens): same explorer deep links
