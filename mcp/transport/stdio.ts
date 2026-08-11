// algo-tutor stdio transport — newline-delimited JSON-RPC over stdin/stdout.

import { McpServer, JsonRpcError, RequestMeta } from "../server.ts";

export async function serveStdio(server: McpServer): Promise<void> {
  const decoder = new TextDecoder();
  let buffer = "";

  for await (const chunk of Bun.stdin.stream()) {
    buffer += decoder.decode(chunk, { stream: true });
    let index: number;
    while ((index = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, index).replace(/\r$/, "");
      buffer = buffer.slice(index + 1);
      if (line.trim()) {
        await handleMessage(server, line);
      }
    }
  }
}

async function handleMessage(server: McpServer, raw: string): Promise<void> {
  let request: unknown;
  try {
    request = JSON.parse(raw);
  } catch {
    writeResponse(parseError());
    return;
  }

  const response = await dispatch(server, request);

  // Notifications have no id — no response sent.
  if (
    response &&
    typeof response === "object" &&
    "id" in response &&
    (response as { id: unknown }).id !== undefined &&
    (response as { id: unknown }).id !== null
  ) {
    writeResponse(response);
  }
}

function writeResponse(response: unknown): void {
  console.log(JSON.stringify(response));
}

function parseError(): unknown {
  return {
    jsonrpc: "2.0",
    id: null,
    error: { code: -32700, message: "Parse error" },
  };
}

export async function dispatch(
  server: McpServer,
  request: unknown,
): Promise<unknown> {
  if (!request || typeof request !== "object") {
    return errorResponse(null, -32600, "Invalid Request");
  }

  const req = request as Record<string, unknown>;
  if (req.jsonrpc !== "2.0" || !req.method || typeof req.method !== "string") {
    return errorResponse(req.id ?? null, -32600, "Invalid Request");
  }

  const id = req.id ?? null;
  const method = req.method as string;
  const params = (req.params ?? {}) as Record<string, unknown>;

  try {
    const meta = extractMeta(params);

    switch (method) {
      case "server/discover":
        return successResponse(id, server.discover());

      case "tools/list":
        return successResponse(id, {
          tools: server.listTools(),
          // 2026-07-28: cache hints for list responses
          ttlMs: 3_600_000,
          cacheScope: "public",
        });

      case "tools/call": {
        const name = params.name;
        if (typeof name !== "string") {
          return errorResponse(id, -32602, "Missing tool name");
        }
        const result = await server.callTool(name, params.arguments ?? {}, meta);
        return successResponse(id, result);
      }

      case "initialize":
        // Legacy handshake — we accept but return modern shape.
        // This keeps dual-era compatibility for old clients.
        return successResponse(id, {
          protocolVersion: "2026-07-28",
          capabilities: { tools: {} },
          serverInfo: { name: server.name, version: server.version },
          instructions: server.instructions,
        });

      case "notifications/initialized":
        // No-op for stateless server.
        return null;

      default:
        return errorResponse(id, -32601, `Method not found: ${method}`);
    }
  } catch (e) {
    if (e instanceof JsonRpcError) {
      return errorResponse(id, e.code, e.message, e.data);
    }
    return errorResponse(id, -32603, `Internal error: ${(e as Error).message}`);
  }
}

function extractMeta(params: Record<string, unknown>): RequestMeta {
  const meta = (params._meta ?? {}) as Record<string, unknown>;
  return {
    protocolVersion:
      (meta["io.modelcontextprotocol/protocolVersion"] as string) ??
      "2026-07-28",
    clientInfo: meta["io.modelcontextprotocol/clientInfo"] as
      | { name: string; version: string }
      | undefined,
    capabilities: meta["io.modelcontextprotocol/clientCapabilities"] as
      | Record<string, unknown>
      | undefined,
  };
}

function successResponse(id: unknown, result: unknown): unknown {
  return { jsonrpc: "2.0", id, result };
}

function errorResponse(
  id: unknown,
  code: number,
  message: string,
  data?: unknown,
): unknown {
  return { jsonrpc: "2.0", id, error: { code, message, data } };
}
