#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { loadCatalog } from './catalog.js'
import { createServer } from './server.js'

const catalog = loadCatalog()
const server = createServer(catalog)
await server.connect(new StdioServerTransport())
// stdout is the MCP channel; log to stderr only.
console.error(`lennys-podcast-mcp ready: ${catalog.records.length} episodes`)
