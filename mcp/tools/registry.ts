// algo-tutor tool registry — register all tools on the server.

import { McpServer } from "../server.ts";

import { registerSessionTools } from "./session.ts";
import { registerLearningTools } from "./learning.ts";
import { registerPracticeTools } from "./practice.ts";
import { registerEngineTools } from "./engine.ts";
import { registerToolkitTools } from "./toolkit.ts";
import { registerConceptTools } from "./concepts.ts";
import { registerTrainingTools } from "./training.ts";
import { registerDiagnosticTools } from "./diagnostic.ts";
import { INSTRUCTIONS } from "./instructions.ts";

export function createServer(): McpServer {
  const server = new McpServer("algo-tutor", "2.0.0", INSTRUCTIONS);

  registerSessionTools(server);
  registerLearningTools(server);
  registerPracticeTools(server);
  registerEngineTools(server);
  registerToolkitTools(server);
  registerConceptTools(server);
  registerTrainingTools(server);
  registerDiagnosticTools(server);

  console.error(`algo-tutor: ${server.toolCount} tools registered`);

  return server;
}
