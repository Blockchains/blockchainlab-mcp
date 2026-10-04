# Blockchain Lab MCP server — stdio. docker run -i --rm ghcr.io/blockchains/blockchainlab-mcp
FROM node:22-alpine
LABEL org.opencontainers.image.source="https://github.com/Blockchains/blockchainlab-mcp" \
      org.opencontainers.image.description="Blockchain Lab MCP server: 43 tools for AI agents (blockchain datasets + live on-chain tools). Built by Blockchain Lab — https://blockchainlab.com" \
      org.opencontainers.image.licenses="MIT"
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY src ./src
COPY bin ./bin
USER node
ENTRYPOINT ["node", "bin/blockchainlab-mcp.js"]
