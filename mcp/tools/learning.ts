// ioi-forge learning tools — lesson, pass_unit, read_code, run_code, benchmark_code.

import { McpServer } from "../server.ts";
import { z } from "zod";
import { forge } from "../forge.ts";
import { text, q } from "./util.ts";

export function registerLearningTools(server: McpServer): void {
  server.register({
    name: "lesson",
    description:
      "取得當前單元的授課材料與教學規則（USACO Guide 原文 + 檢核題）。你收到後就是家教，照規則用繁中授課。",
    inputSchema: z.object({
      unit: z.number().optional().describe("指定單元（預設當前進度）"),
    }),
    handler: async ({ unit }) =>
      text(forge(`forge learn${unit ? ` -u ${unit}` : ""}`)),
  });

  server.register({
    name: "pass_unit",
    description:
      "學生完成當前單元全部檢核題後推進課綱。檢核題未全 AC 會被拒絕。",
    inputSchema: z.object({
      force: z.boolean().optional(),
    }),
    handler: async ({ force }) =>
      text(forge(`forge pass${force ? " --force" : ""}`)),
  });

  server.register({
    name: "read_code",
    description:
      "讀學生 vim 窗口正在寫的代碼（學生說「看」時呼叫）。預設 work/sol.cpp。",
    inputSchema: z.object({
      path: z.string().optional(),
    }),
    handler: async ({ path }) => {
      const p = path ?? "work/sol.cpp";
      if (p.includes("..")) return text("路徑不合法");
      const f = Bun.file(`${import.meta.dir}/../../${p}`);
      return text((await f.exists()) ? await f.text() : `${p} 不存在（學生存檔了嗎？）`);
    },
  });

  server.register({
    name: "run_code",
    description:
      "代學生編譯執行代碼（g++ -O2 -Wall），回傳編譯錯誤/輸出/耗時。學生不用開終端。",
    inputSchema: z.object({
      path: z.string().optional().describe("預設 work/sol.cpp"),
      input: z.string().optional().describe("stdin 測資"),
    }),
    handler: async ({ path, input }) =>
      text(
        forge(
          `forge run ${q(path ?? "work/sol.cpp")}${input != null ? ` -i ${q(input)}` : ""} | to json`,
        ),
      ),
  });

  server.register({
    name: "benchmark_code",
    description:
      "詳細 OJ 模擬：多次執行並回傳逐筆時間、記憶體、輸出/錯誤。用於極致優化反覆逼近。",
    inputSchema: z.object({
      path: z.string().optional().describe("預設 work/sol.cpp"),
      input: z.string().optional().describe("stdin 測資"),
      times: z.number().optional().describe("連續執行次數（預設 1）"),
    }),
    handler: async ({ path, input, times }) =>
      text(
        forge(
          `forge bench ${q(path ?? "work/sol.cpp")}${input != null ? ` -i ${q(input)}` : ""}${times != null ? ` -t ${times}` : ""}`,
        ),
      ),
  });

  server.register({
    name: "flag_concept",
    description: "把學生的模糊概念記入帳本（不打斷主線）。之後複習時段再銷帳。",
    inputSchema: z.object({
      concept: z.string(),
      note: z.string().optional().describe("模糊在哪裡"),
    }),
    handler: async ({ concept, note }) =>
      text(
        forge(
          `forge concept fuzzy ${q(concept)}${note ? ` -n ${q(note)}` : ""}`,
        ),
      ),
  });

  server.register({
    name: "resolve_concept",
    description: "學生複習後已確實掌握，概念銷帳。",
    inputSchema: z.object({
      concept: z.string(),
    }),
    handler: async ({ concept }) =>
      text(forge(`forge concept ok ${q(concept)}`)),
  });

  server.register({
    name: "list_concepts",
    description: "列出待銷帳的模糊概念（複習時段的材料）。",
    inputSchema: z.object({}),
    handler: async () => text(forge("forge concept list | table -e")),
  });
}
