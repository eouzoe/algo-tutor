// ioi-forge entry point — choose transport via argv, start server.

import { createServer } from "./tools/registry.ts";
import { serveStdio } from "./transport/stdio.ts";
import { serveHttp } from "./transport/http.ts";

const server = createServer();

const mode = process.argv[2] ?? "stdio";

if (mode === "http") {
  const port = parseInt(process.argv[3] ?? "3000", 10);
  serveHttp(server, { port });
} else {
  await serveStdio(server);
}
