// ioi-forge Streamable HTTP transport — for remote deployment.
// Bun.serve() with no framework deps. Each request is self-contained.

import { McpServer } from "../server.ts";
import { dispatch } from "./stdio.ts";

export interface HttpConfig {
  port?: number;
  host?: string;
}

export function serveHttp(server: McpServer, config: HttpConfig = {}): void {
  const port = config.port ?? 3000;
  const host = config.host ?? "127.0.0.1";

  Bun.serve({
    port,
    hostname: host,

    async fetch(req: Request): Promise<Response> {
      const url = new URL(req.url);

      // Discovery endpoint (GET)
      if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/discover")) {
        return jsonResponse(server.discover(), 200, "2026-07-28");
      }

      // Health check
      if (req.method === "GET" && url.pathname === "/health") {
        return jsonResponse({ status: "ok", tools: server.toolCount }, 200, "2026-07-28");
      }

      // MCP endpoint (POST)
      if (req.method === "POST" && url.pathname === "/mcp") {
        // 2026-07-28: validate Content-Type
        const ct = req.headers.get("Content-Type") ?? "";
        if (!isJsonContentType(ct)) {
          return new Response("415 Unsupported Media Type", { status: 415 });
        }

        // 2026-07-28: protocol version negotiation via header
        const headerVersion = req.headers.get("MCP-Protocol-Version");
        if (headerVersion && headerVersion !== "2026-07-28") {
          return jsonResponse(
            {
              jsonrpc: "2.0",
              id: null,
              error: {
                code: -32022,
                message: "Unsupported protocol version",
                data: { supported: ["2026-07-28"], requested: headerVersion },
              },
            },
            400,
            "2026-07-28",
          );
        }

        try {
          const body = await req.json();
          const response = await dispatch(server, body);

          // Notifications (no id) → 204
          if (!response || typeof response !== "object" || !("id" in response)) {
            return new Response(null, { status: 204 });
          }

          return jsonResponse(response, 200, "2026-07-28");
        } catch {
          return jsonResponse(
            {
              jsonrpc: "2.0",
              id: null,
              error: { code: -32700, message: "Parse error" },
            },
            400,
            "2026-07-28",
          );
        }
      }

      // Method not allowed for everything else
      return new Response("405 Method Not Allowed", { status: 405 });
    },
  });

  console.error(`ioi-forge MCP server listening on http://${host}:${port}`);
  console.error(`  GET  /discover — server info`);
  console.error(`  GET  /health   — health check`);
  console.error(`  POST /mcp      — JSON-RPC endpoint`);
}

function jsonResponse(body: unknown, status: number, version: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "MCP-Protocol-Version": version,
    },
  });
}

function isJsonContentType(ct: string): boolean {
  const mediaType = ct.split(";")[0]?.trim().toLowerCase();
  return mediaType === "application/json" || mediaType === "application/json-rpc";
}
