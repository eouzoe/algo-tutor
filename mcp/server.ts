// algo-tutor MCP server core — transport-agnostic, zero runtime deps beyond zod.
// Targets MCP 2026-07-28 stateless spec. No session, no handshake, every request self-contained.

import { z } from "zod";

export interface ClientInfo {
  name: string;
  version: string;
}

export interface RequestMeta {
  protocolVersion: string;
  clientInfo?: ClientInfo;
  capabilities?: Record<string, unknown>;
}

export interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export interface ToolInfo {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodType;
  handler: ToolHandler;
}

export interface ToolHandler {
  (args: Record<string, unknown>, meta: RequestMeta): Promise<ToolResult> | ToolResult;
}

// Helper: wrap a typed handler so callers get proper inference while the internal
// registry stores everything as ToolHandler (args: Record<string, unknown>).
export function defineTool<TInput>(
  def: {
    name: string;
    description: string;
    inputSchema: z.ZodType<TInput>;
    handler: (args: TInput, meta: RequestMeta) => Promise<ToolResult> | ToolResult;
  },
): ToolDefinition {
  return {
    name: def.name,
    description: def.description,
    inputSchema: def.inputSchema as z.ZodType,
    // Cast the typed handler to the registry's looser signature.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: def.handler as any,
  };
}

export interface DiscoverResult {
  protocolVersions: string[];
  serverInfo: { name: string; version: string };
  capabilities: Record<string, unknown>;
  instructions?: string;
}

export class McpServer {
  private tools = new Map<string, ToolDefinition>();

  constructor(
    public readonly name: string,
    public readonly version: string,
    public readonly instructions?: string,
  ) {}

  tool(def: ToolDefinition): this {
    if (this.tools.has(def.name)) {
      throw new Error(`Duplicate tool registration: ${def.name}`);
    }
    this.tools.set(def.name, def);
    return this;
  }

  /** Register a fully-typed tool. Zod schema provides input inference for the handler. */
  register<TInput>(def: {
    name: string;
    description: string;
    inputSchema: z.ZodType<TInput>;
    handler: (args: TInput, meta: RequestMeta) => Promise<ToolResult> | ToolResult;
  }): this {
    if (this.tools.has(def.name)) {
      throw new Error(`Duplicate tool registration: ${def.name}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.tools.set(def.name, { ...def, handler: def.handler as any });
    return this;
  }

  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  listTools(): ToolInfo[] {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: zodToJsonSchema(t.inputSchema),
    }));
  }

  async callTool(
    name: string,
    args: unknown,
    meta: RequestMeta,
  ): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new JsonRpcError(-32601, `Method not found: ${name}`);
    }

    const parsed = await tool.inputSchema.safeParseAsync(
      args as Record<string, unknown>,
    );
    if (!parsed.success) {
      throw new JsonRpcError(
        -32602,
        "Invalid params",
        JSON.stringify(parsed.error.issues),
      );
    }

    return await tool.handler(
      parsed.data as Record<string, unknown>,
      meta,
    );
  }

  discover(): DiscoverResult {
    return {
      protocolVersions: ["2026-07-28"],
      serverInfo: { name: this.name, version: this.version },
      capabilities: {
        tools: {},
        // 2026-07-28: extensions framework
        extensions: {},
      },
      instructions: this.instructions,
    };
  }

  get toolCount(): number {
    return this.tools.size;
  }
}

export class JsonRpcError extends Error {
  constructor(
    public readonly code: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "JsonRpcError";
  }
}

function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  // v4 zod provides .toJSONSchema() but for MCP wire we want a plain JSON Schema object.
  return (schema as unknown as { toJSONSchema: () => Record<string, unknown> })
    .toJSONSchema?.() ?? { type: "object" };
}
