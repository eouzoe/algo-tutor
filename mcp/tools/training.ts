// ioi-forge training tools — pattern recognition, problem analysis, and training sessions.

import { McpServer, ToolResult } from "../server.ts";
import { z } from "zod";
import { text } from "./util.ts";

// Load seed data
import problemsSeed from "../../data/training/seeds/problems-seed.json" with { type: "json" };
import patternsSeed from "../../data/training/seeds/patterns-seed.json" with { type: "json" };
import rubricsSeed from "../../data/training/seeds/rubrics-seed.json" with { type: "json" };

export function registerTrainingTools(server: McpServer): void {

  // ── Pattern Recognition Training ──────────────────────────────

  server.register({
    name: "training_pattern",
    description: "模式識別訓練：取得一道題，學生需在限時內說出這是什麼題型。訓練從題目描述快速識別解題模式的能力。",
    inputSchema: z.object({
      difficulty: z.number().min(1).max(5).optional().describe("難度 1-5，預設隨機"),
    }),
    handler: async ({ difficulty }) => {
      let pool = problemsSeed.problems.filter((p) => p.type === "pattern_recognition");
      if (difficulty) {
        pool = pool.filter((p) => p.difficulty === difficulty);
      }
      if (pool.length === 0) return text("目前沒有符合條件的模式識別題目");

      const problem = pool[Math.floor(Math.random() * pool.length)]!;
      const stars = "★".repeat(problem.difficulty);
      const emptyStars = "☆".repeat(5 - problem.difficulty);
      return text([
        `╔══════════════════════════════════════╗`,
        `║     模式識別訓練 (Pattern Recognition)  ║`,
        `╚══════════════════════════════════════╝`,
        ``,
        `📋 題目：`,
        `─`.repeat(40),
        problem.statement,
        `─`.repeat(40),
        ``,
        `⏱️  請在 30 秒內回答：`,
        `1. 這是什麼題型？`,
        `2. 哪些關鍵詞讓你這樣判斷？`,
        `3. 第一步該做什麼？`,
        ``,
        `💡 提示：回答後呼叫 training_check 檢查答案`,
        `📊 難度：${stars}${emptyStars}`,
        `🆔 題目 ID：${problem.id}`,
      ].join("\n"));
    },
  });

  server.register({
    name: "training_check",
    description: "檢查模式識別的回答是否正確。學生說出題型後呼叫此工具評分。",
    inputSchema: z.object({
      problem_id: z.string().describe("題目 ID"),
      student_answer: z.string().describe("學生的回答"),
    }),
    handler: async ({ problem_id, student_answer }) => {
      const problem = problemsSeed.problems.find((p) => p.id === problem_id);
      if (!problem) return text(`找不到題目 ${problem_id}`);

      const rubric = rubricsSeed.rubrics.find((r) => r.subsystem === "pattern_recognition");
      const keywords = problem.triggers ?? [];
      const answerLower = student_answer.toLowerCase();

      // Simple keyword matching for auto-grading
      const matchedKeywords = keywords.filter((kw) =>
        answerLower.includes(kw.toLowerCase())
      );
      const score = matchedKeywords.length / Math.max(keywords.length, 1);

      let level = "L0";
      if (score >= 0.8) level = "L4";
      else if (score >= 0.6) level = "L3";
      else if (score >= 0.4) level = "L2";
      else if (score >= 0.2) level = "L1";

      const levelDesc = rubric?.levels[level as keyof typeof rubric.levels];

      return text([
        `╔══════════════════════════════════════╗`,
        `║           評分結果                      ║`,
        `╚══════════════════════════════════════╝`,
        ``,
        `📝 你的回答：${student_answer}`,
        ``,
        `🎯 擊中關鍵詞：${matchedKeywords.join(", ") || "無"}`,
        `📊 完整關鍵詞：${keywords.join(", ")}`,
        ``,
        `🏆 等級：${level}`,
        `📖 標準：${levelDesc?.description ?? "未達標"}`,
        ``,
        `💡 正確推理鏈：`,
        problem.solution.reasoning_chain,
        ``,
        `🔑 關鍵洞察：${problem.solution.key_insight}`,
      ].join("\n"));
    },
  });

  // ── Problem Analysis Training ────────────────────────────────

  server.register({
    name: "training_analysis",
    description: "題目分析訓練：取得一道題，學生口述限制條件、隱藏約束、可能方向。",
    inputSchema: z.object({
      difficulty: z.number().min(1).max(5).optional(),
    }),
    handler: async ({ difficulty }) => {
      let pool = problemsSeed.problems.filter((p) =>
        p.type === "pattern_recognition" || p.type === "problem_analysis"
      );
      if (difficulty) {
        pool = pool.filter((p) => p.difficulty === difficulty);
      }
      if (pool.length === 0) return text("目前沒有符合條件的題目");

      const problem = pool[Math.floor(Math.random() * pool.length)]!;
      return text([
        `╔══════════════════════════════════════╗`,
        `║     題目分析訓練 (Problem Analysis)     ║`,
        `╚══════════════════════════════════════╝`,
        ``,
        `📋 題目：`,
        `─`.repeat(40),
        problem.statement,
        ``,
        `📐 約束條件：`,
        `  n: ${problem.constraints.n_range}`,
        `  時間限制: ${problem.constraints.time_limit ?? "未指定"}`,
        `─`.repeat(40),
        ``,
        `請分析：`,
        `1. 從 n 的範圍推斷可用哪些複雜度？`,
        `2. 哪些複雜度會 TLE？`,
        `3. 有什麼隱藏條件或邊界 case？`,
        `4. 可能的解題方向有哪些？`,
        ``,
        `🆔 題目 ID：${problem.id}`,
      ].join("\n"));
    },
  });

  // ── Pattern Library ──────────────────────────────────────────

  server.register({
    name: "training_patterns",
    description: "查看所有可用的解題模式（題型）。返回每個模式的名稱、觸發條件、解題框架。",
    inputSchema: z.object({
      category: z.string().optional().describe("過濾類別：greedy/dp/graph/math/string..."),
    }),
    handler: async ({ category }) => {
      let patterns = patternsSeed.patterns;
      if (category) {
        patterns = patterns.filter((p) => p.category === category);
      }

      const lines = patterns.map((p) => [
        `┌─ ${p.name} (${p.id})`,
        `│  類別: ${p.category} | 難度: ${"★".repeat(p.difficulty)}`,
        `│  描述: ${p.description}`,
        `│  觸發詞: ${p.triggers.join(", ")}`,
        `│  關鍵洞察: ${p.solution_template.key_insight}`,
        `│  框架: ${p.solution_template.framework}`,
        `└─ 精熟指標: ${p.mastery_indicator}`,
        ``,
      ].join("\n"));

      return text([
        `📚 解題模式庫（共 ${patterns.length} 個）：`,
        `═`.repeat(50),
        ``,
        ...lines,
      ].join("\n"));
    },
  });

  // ── Training Stats ───────────────────────────────────────────

  server.register({
    name: "training_stats",
    description: "查看訓練系統狀態：題庫數量、模式數量、rubric 數量。",
    inputSchema: z.object({}),
    handler: async () => {
      const problemCount = problemsSeed.problems.length;
      const patternCount = patternsSeed.patterns.length;
      const rubricCount = rubricsSeed.rubrics.length;

      return text([
        `╔══════════════════════════════════════╗`,
        `║         訓練系統狀態                    ║`,
        `╚══════════════════════════════════════╝`,
        ``,
        `📝 錨點題目：${problemCount} 道`,
        `📚 解題模式：${patternCount} 個`,
        `📊 評分標準：${rubricCount} 個子系統`,
        ``,
        `訓練子系統：`,
        `  ✅ pattern_recognition（模式識別）`,
        `  ✅ problem_analysis（題目分析）`,
        `  🚧 static_analysis（靜態分析）`,
        `  🚧 debugging（除錯調試）`,
        `  🚧 muscle_memory（肌肉記憶）`,
        `  🚧 strategy（實戰策略）`,
        `  🚧 optimization（優化訓練）`,
        ``,
        `可用指令：`,
        `  training_pattern — 開始模式識別訓練`,
        `  training_analysis — 開始題目分析訓練`,
        `  training_patterns — 瀏覽所有解題模式`,
        `  training_check — 檢查回答`,
      ].join("\n"));
    },
  });
}
