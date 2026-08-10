// algo-tutor practice tools — pick, rec, stats, log, report, anki.

import { McpServer } from "../server.ts";
import { z } from "zod";
import { algo } from "../algo.ts";
import { text, q } from "./util.ts";

export function registerPracticeTools(server: McpServer): void {
  server.register({
    name: "pick_problems",
    description:
      "出題單（rating+200~400、排除已做、弱點加權）。輸出不含 tags，不要向學生透露主題。",
    inputSchema: z.object({
      count: z.number().optional(),
      topic: z.string().optional().describe("塊狀練習期鎖定主題"),
    }),
    handler: async (a) =>
      text(
        algo(
          `algo pick${a.count ? ` -c ${a.count}` : ""}${a.topic ? ` -t ${q(a.topic)}` : ""} | table -e`,
        ),
      ),
  });

  server.register({
    name: "record_recognition",
    description: "記錄一筆識別訓練（只看題面口述方向）。",
    inputSchema: z.object({
      problem: z.string(),
      topic: z.string().describe("正解主題"),
      guess: z.string().describe("學生口述的方向"),
      correct: z.boolean(),
      sec: z.number().optional(),
    }),
    handler: async (a) =>
      text(
        algo(
          `algo rec ${q(a.problem)} ${q(a.topic)} ${q(a.guess)}${a.correct ? "" : " --wrong"}${a.sec != null ? ` -s ${a.sec}` : ""}`,
        ),
      ),
  });

  server.register({
    name: "stats",
    description: "近況統計（教練/複盤用）。",
    inputSchema: z.object({
      days: z.number().optional(),
    }),
    handler: async ({ days }) =>
      text(algo(`algo stats${days ? ` -d ${days}` : ""} | table -e`)),
  });

  server.register({
    name: "weekly_report",
    description: "訓練週報 + 診斷指引（教練用）。",
    inputSchema: z.object({
      days: z.number().optional(),
    }),
    handler: async ({ days }) =>
      text(algo(`algo diagnose${days ? ` -d ${days}` : ""}`)),
  });

  server.register({
    name: "training_log",
    description: "人類可讀的近期解題日誌。",
    inputSchema: z.object({
      limit: z.number().optional(),
    }),
    handler: async ({ limit }) =>
      text(algo(`algo log${limit ? ` -l ${limit}` : ""} | table -e`)),
  });

  server.register({
    name: "push_anki",
    description:
      "把線索卡直推學生本機 Anki（需開著 Anki + AnkiConnect）。",
    inputSchema: z.object({}),
    handler: async () => text(algo("algo anki")),
  });
}
