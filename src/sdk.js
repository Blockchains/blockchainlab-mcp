// Blockchain Lab SDK — typed-ish helpers over the Blockchain Lab Open Data API and live on-chain tools.
// Built by Blockchain Lab — https://blockchainlab.com
import * as onchain from "./onchain.js";

export const DEFAULT_API = "https://blockchains.github.io/blockchainlab-api/v1";
export const TOOLS_SITE = "https://blockchains.github.io/blockchainlab-tools";
export const SITE = "https://blockchainlab.com";

export class BlockchainLab {
  constructor({ apiBase = DEFAULT_API, ttlMs = 10 * 60 * 1000, fetchImpl = globalThis.fetch } = {}) {
    this.apiBase = apiBase.replace(/\/$/, ""); this.ttlMs = ttlMs; this.fetch = fetchImpl; this._cache = new Map();
  }
  async dataset(name) {
    const hit = this._cache.get(name);
    if (hit && Date.now() - hit.t < this.ttlMs) return hit.v;
    const r = await this.fetch(`${this.apiBase}/${name}.json`);
    if (!r.ok) throw new Error(`Blockchain Lab API ${name}: HTTP ${r.status}`);
    const v = await r.json(); this._cache.set(name, { t: Date.now(), v }); return v;
  }
  async catalogue() { const r = await this.fetch(`${this.apiBase}/index.json`); return r.json(); }

  async searchWhitepapers({ query = "", topic, year, limit = 10 } = {}) {
    const { data, source_url } = await this.dataset("whitepapers"); const q = query.toLowerCase();
    const rows = data.filter(p => (!q || `${p.title} ${p.authors} ${p.category} ${(p.topics || []).join(" ")}`.toLowerCase().includes(q)) && (!topic || (p.topics || []).some(t => t.toLowerCase().includes(topic.toLowerCase()))) && (!year || p.year === Number(year)));
    return { total: rows.length, source: source_url, results: rows.slice(0, limit) };
  }
  async getWhitepaper(slug) { const { data } = await this.dataset("whitepapers"); return data.find(p => p.slug === slug || p.id === slug) || null; }

  async findChain(query) {
    const { data } = await this.dataset("chains"); const q = String(query).toLowerCase().trim();
    const exact = data.find(c => String(c.chainId) === q || (c.shortName || "").toLowerCase() === q);
    if (exact) return [exact];
    return data.filter(c => c.name.toLowerCase().includes(q)).sort((a, b) => Number(a.testnet) - Number(b.testnet) || a.name.length - b.name.length).slice(0, 10);
  }
  async topProtocols({ limit = 20, category, chain } = {}) {
    const d = await this.dataset("protocols");
    const rows = d.data.filter(p => (!category || (p.category || "").toLowerCase() === category.toLowerCase()) && (!chain || (p.chains || []).some(c => c.toLowerCase() === chain.toLowerCase())));
    return { generated_at: d.generated_at, source: d.source_url, results: rows.slice(0, limit) };
  }
  async chainsTvl({ limit = 20 } = {}) { const d = await this.dataset("chains-tvl"); return { generated_at: d.generated_at, source: d.source_url, results: d.data.slice(0, limit) }; }
  async hackathons() { const d = await this.dataset("hackathons"); return { generated_at: d.generated_at, upstream_generated_at: d.upstream_generated_at, results: d.data }; }
  async events() { const d = await this.dataset("events"); return { generated_at: d.generated_at, results: d.data }; }
  async grants({ ecosystem } = {}) { const d = await this.dataset("grants"); return { generated_at: d.generated_at, results: d.data.filter(g => !ecosystem || g.ecosystem.toLowerCase().includes(ecosystem.toLowerCase())) }; }
  async glossary(term) {
    const { data } = await this.dataset("glossary"); if (!term) return data.map(g => ({ term: g.term, kind: g.kind, url: g.url }));
    const q = term.toLowerCase(); return data.filter(g => g.term.toLowerCase().includes(q) || g.slug === q || g.definition.toLowerCase().includes(q)).slice(0, 10);
  }
  async standard(kind, numberOrQuery) {
    const sets = kind ? [kind] : ["eips", "ercs", "bips"]; const out = [];
    for (const s of sets) { const { data } = await this.dataset(s); const q = String(numberOrQuery).toLowerCase().replace(/^(eip|erc|bip)-?/, "");
      for (const x of data) if (String(x.number) === q || (isNaN(Number(q)) && (x.title || "").toLowerCase().includes(q))) out.push({ set: s, ...x }); }
    return out.slice(0, 25);
  }
}

export const toolLinks = {
  tx: (chain, hash) => `${TOOLS_SITE}/tx/?chain=${chain}&hash=${hash}`,
  address: (q, chain = "ethereum") => `${TOOLS_SITE}/address/?q=${q}&chain=${chain}`,
  calldata: (data) => `${TOOLS_SITE}/abi/?data=${data}`,
};
export { onchain };
export default BlockchainLab;
