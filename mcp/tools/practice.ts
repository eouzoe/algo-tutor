// algo-tutor practice tools — pick, rec, stats, log, report, anki, sync.

import { McpServer } from "../server.ts";
import { z } from "zod";
import { algo } from "../algo.ts";
import { text, q } from "./util.ts";
import { execSync } from "node:child_process";

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

  server.register({
    name: "anki_sync_failed",
    description:
      "Sync failed problems to Anki via CLI for spaced repetition. Converts failed problems into Anki cards.",
    inputSchema: z.object({
      deck: z.string().optional().default("algo-tutor-failed").describe("Anki deck name"),
    }),
    handler: async ({ deck }) => {
      try {
        // Get failed problems from log
        const result = execSync(
          `algo log --failed --json 2>/dev/null | head -50`,
          { encoding: "utf8", timeout: 10_000 },
        );

        if (!result.trim()) {
          return text("No failed problems to sync.");
        }

        // Parse and create Anki cards
        const lines = result.trim().split("\n");
        let synced = 0;

        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            if (entry.result === "fail" || entry.result === "partial") {
              const front = `Problem: ${entry.problem || "Unknown"}\nTopic: ${entry.topics?.join(", ") || "Unknown"}`;
              const back = `Error: ${entry.error_primary || "Unknown"}\nSummary: ${entry.summary || "No summary"}`;

              // Use Anki CLI to add card (if available)
              try {
                execSync(
                  `anki add-card --deck "${deck}" --front "${front.replace(/"/g, '\\"')}" --back "${back.replace(/"/g, '\\"')}" 2>/dev/null`,
                  { encoding: "utf8", timeout: 5_000 },
                );
                synced++;
              } catch {
                // Anki CLI not available, skip
              }
            }
          } catch {
            // Skip malformed lines
          }
        }

        return text(`Synced ${synced} failed problems to Anki deck "${deck}".`);
      } catch (e) {
        return text(`Anki sync failed: ${e}`);
      }
    },
  });
}
