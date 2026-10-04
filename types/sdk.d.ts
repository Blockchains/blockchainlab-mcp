// Type declarations for blockchainlab-mcp's JS SDK (src/sdk.js). Hand-written; keep in sync with src/sdk.js
// (test/types.test.mjs checks the export names and compiles test/types-consumer.ts against these files).
import * as onchain from "./onchain.js";
import * as onchain2 from "./onchain2.js";

export declare const DEFAULT_API: "https://blockchains.github.io/blockchainlab-api/v1";
export declare const TOOLS_SITE: "https://blockchains.github.io/blockchainlab-tools";
export declare const SITE: "https://blockchainlab.com";

/** A dataset row. Fields depend on the dataset; see https://blockchains.github.io/blockchainlab-api/ for each schema. */
export type Row = Record<string, any>;

/** Raw dataset document as served by the Open Data API (`/v1/<name>.json`). */
export interface DatasetDoc<T = Row> {
  generated_at: string;
  source_url?: string;
  count?: number;
  data: T[];
  [extra: string]: unknown;
}

/** Dataset names published by the Open Data API (any other string is passed through). */
export type DatasetName =
  | "chains" | "chains-tvl" | "protocols" | "stablecoins" | "yields" | "bridges" | "dex-volumes" | "fees" | "l2-metrics"
  | "security-incidents" | "sanctioned-addresses" | "rpc-health" | "eips" | "ercs" | "bips" | "grants" | "glossary"
  | "whitepapers" | "hackathons" | "events" | (string & {});

export interface Results<T = Row> { generated_at: string; source?: string; results: T[] }

export interface BlockchainLabOptions {
  /** API root, default DEFAULT_API. */
  apiBase?: string;
  /** In-memory cache lifetime per dataset in ms, default 10 minutes. */
  ttlMs?: number;
  /** fetch implementation, default globalThis.fetch (Node >= 18). */
  fetchImpl?: typeof fetch;
}

export declare class BlockchainLab {
  constructor(options?: BlockchainLabOptions);
  apiBase: string;
  ttlMs: number;
  fetch: typeof fetch;
  /** Fetch a dataset document (cached for ttlMs). Throws on HTTP errors. */
  dataset<T = Row>(name: DatasetName): Promise<DatasetDoc<T>>;
  /** The API catalogue (`/v1/index.json`). */
  catalogue(): Promise<{ datasets: Row[]; [k: string]: unknown }>;

  searchWhitepapers(opts?: { query?: string; topic?: string; year?: number | string; limit?: number }): Promise<{ total: number; source?: string; results: Row[] }>;
  getWhitepaper(slugOrId: string): Promise<Row | null>;
  /** Exact chain-ID / shortName match, otherwise up to 10 name matches (mainnets first). */
  findChain(query: string | number): Promise<Row[]>;
  topProtocols(opts?: { limit?: number; category?: string; chain?: string }): Promise<Results>;
  chainsTvl(opts?: { limit?: number }): Promise<Results>;
  hackathons(): Promise<{ generated_at: string; upstream_generated_at?: string; results: Row[] }>;
  events(): Promise<{ generated_at: string; results: Row[] }>;
  grants(opts?: { ecosystem?: string }): Promise<{ generated_at: string; results: Row[] }>;
  /** Without a term: every term ({term, kind, url}); with a term: up to 10 matching entries. */
  glossary(term?: string): Promise<Row[]>;

  rowsOf<T = Row>(name: DatasetName): Promise<{ generated_at: string; source?: string; data: T[]; extra: DatasetDoc<T> }>;
  stablecoins(opts?: { symbol?: string; peg?: string; limit?: number }): Promise<Results>;
  yields(opts?: { chain?: string; project?: string; stablecoinOnly?: boolean; minTvlUsd?: number; sort?: "tvl" | "apy"; limit?: number }): Promise<Results & { note: string }>;
  bridges(opts?: { chain?: string; limit?: number }): Promise<Results>;
  volumes(kind?: "dex-volumes" | "fees" | (string & {}), opts?: { chain?: string; limit?: number }): Promise<Results & { totals?: Row }>;
  l2s(opts?: { query?: string; stage?: string; limit?: number }): Promise<Results>;
  incidents(opts?: { query?: string; since?: string; minUsd?: number; chain?: string; limit?: number }): Promise<Results & { matches: number; total_usd: number }>;
  sanctions(addresses: string[]): Promise<{ generated_at: string; source?: string; note: string; results: { address: string; sanctioned: boolean; list_asset: string | null }[] }>;
  rpcHealthSnapshot(chain?: string): Promise<{ generated_at: string; results: Row[] }>;
  /** Look up EIPs/ERCs/BIPs by number ("1559", "ERC-4337", "BIP-341") or title text; up to 25 results tagged with `set`. */
  standard(kind: "eips" | "ercs" | "bips" | null | undefined, numberOrQuery: string | number): Promise<(Row & { set: "eips" | "ercs" | "bips" })[]>;
}

/** Deep links into the Blockchain Lab browser tools. */
export declare const toolLinks: {
  tx(chain: string, hash: string): string;
  address(q: string, chain?: string): string;
  calldata(data: string): string;
  safe(chain: string, safe: string): string;
  verify(chain: string, address: string): string;
  approvals(chain: string, address: string): string;
  mev(chain: string, hash: string): string;
  solana(sig: string): string;
  labels(chain: string, address: string): string;
};

export { onchain, onchain2 };
export default BlockchainLab;
