// ioi-forge tool utilities — shared helpers for all tool modules.

export function text(s: string) {
  return { content: [{ type: "text" as const, text: s }] };
}

export function errText(e: unknown) {
  return {
    content: [{ type: "text" as const, text: `error: ${(e as Error).message}` }],
    isError: true,
  };
}

export function q(s: unknown): string {
  return `"${String(s).replace(/(["$\\])/g, "\\$1")}"`;
}
