// algo-tutor concept tools — syntax concept index and drill.

import { McpServer } from "../server.ts";
import { z } from "zod";
import { algo } from "../algo.ts";
import { text, q } from "./util.ts";

export function registerConceptTools(server: McpServer): void {
  server.register({
    name: "concept_index",
    description:
      "查詢所有可 drill 的概念（支援 -q 名稱搜尋）。學生問「某某語法是什麼」時，先用這個搜尋概念，再用 concept_show 或 drill_concept。",
    inputSchema: z.object({
      query: z.string().optional().describe("搜尋關鍵字，不給則列出全部"),
    }),
    handler: async ({ query }) =>
      text(
        algo(
          `algo concept index${query ? ` -q ${q(query)}` : ""} | table -e`,
        ),
      ),
  });

  server.register({
    name: "concept_show",
    description:
      "顯示特定概念的語法模板、drill 清單。給 LLM 老師取代直接回答語法問題。",
    inputSchema: z.object({
      concept: z.string(),
    }),
    handler: async ({ concept }) =>
      text(algo(`algo concept show ${q(concept)}`)),
  });

  server.register({
    name: "drill_concept",
    description:
      "對特定概念啟動 drill session。學生需要練習某語法點時呼叫。\n  --mode learn: 複製跟打模板，學生跟著打\n  --mode fill: 填空練習\n  --mode problem: 開題目給學生練習",
    inputSchema: z.object({
      concept: z.string(),
      mode: z
        .enum(["learn", "fill", "problem"])
        .optional()
        .describe("drill 模式：learn（跟打）、fill（填空）、problem（開題練習）"),
      problem: z.string().optional().describe("problem mode 時指定題號"),
    }),
    handler: async ({ concept, mode, problem }) =>
      text(
        algo(
          `algo drill ${q(concept)}${mode ? ` --mode ${mode}` : ""}${problem ? ` --problem ${q(problem)}` : ""}`,
        ) + " | table -e",
      ),
  });
}
