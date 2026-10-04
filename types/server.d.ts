// Type declarations for blockchainlab-mcp/server (src/server.js). Hand-written.
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BlockchainLabOptions } from "./sdk.js";

/** Package version reported to MCP clients. */
export declare const VERSION: string;
/** Build the MCP server with all tools registered (connect it to any transport). */
export declare function createServer(opts?: BlockchainLabOptions): McpServer;
/** Start the server on stdio (what `npx blockchainlab-mcp` runs). Uses BLOCKCHAINLAB_API as apiBase if set. */
export declare function main(): Promise<void>;
