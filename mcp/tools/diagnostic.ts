// ioi-forge IOI 語法診斷工具 — 精確、高效、可測量

import { McpServer, ToolResult } from "../server.ts";
import { z } from "zod";
import { text } from "./util.ts";

import diagnosticData from "../../data/training/seeds/ioi-syntax-diagnostic.json" with { type: "json" };

export function registerDiagnosticTools(server: McpServer): void {

  // ── 取得診斷題目 ──────────────────────────────────────────

  server.register({
    name: "diagnostic_problem",
    description: "取得 IOI 語法診斷題目。依序出現，從簡單到困難。每次回傳一題。",
    inputSchema: z.object({
      index: z.number().describe("題號索引，從 0 開始"),
    }),
    handler: async ({ index }) => {
      const problems = diagnosticData.problems;
      if (index >= problems.length) {
        return text("診斷結束。呼叫 diagnostic_result 取得結果。");
      }

      const p = problems[index]!;
      return text([
        `╔══════════════════════════════════════════════════════╗`,
        `║  語法診斷 [${index + 1}/${problems.length}]                          ║`,
        `╚══════════════════════════════════════════════════════╝`,
        ``,
        `📋 題目：`,
        `─`.repeat(50),
        p.statement,
        ``,
        `📐 限制：n = ${p.constraints.n_range} | 時間 ${p.constraints.time_limit}`,
        `─`.repeat(50),
        ``,
        `✏️  請學生在 vim 中寫 code。`,
        `✅ 寫完後呼叫 diagnostic_check 編譯執行。`,
        ``,
        `🆔 題目 ID：${p.id}`,
        `📊 難度：${"★".repeat(p.difficulty)}${"☆".repeat(5 - p.difficulty)}`,
        `🎯 測量概念：${p.target_concepts.join(", ")}`,
      ].join("\n"));
    },
  });

  // ── 驗證學生代碼 ──────────────────────────────────────────

  server.register({
    name: "diagnostic_check",
    description: "診斷專用：編譯並執行學生代碼，回傳詳細結果（編譯錯誤、輸出、是否 AC）。",
    inputSchema: z.object({
      problem_id: z.string().describe("題目 ID"),
      path: z.string().optional().describe("代碼路徑，預設 work/sol.cpp"),
    }),
    handler: async ({ problem_id, path }) => {
      const p = diagnosticData.problems.find((pr) => pr.id === problem_id);
      if (!p) return text(`找不到題目 ${problem_id}`);

      const codePath = path ?? "work/sol.cpp";

      // 讀學生代碼
      const codeFile = Bun.file(`${import.meta.dir}/../../${codePath}`);
      const code = await codeFile.text();

      // 寫入暫存檔
      const tmpPath = `/tmp/diag_${problem_id}.cpp`;
      await Bun.write(tmpPath, code);

      // 編譯
      const compileResult = Bun.spawnSync({
        cmd: ["g++", "-std=c++17", "-O2", "-Wall", tmpPath, "-o", `/tmp/diag_${problem_id}`],
        stderr: "pipe",
      });

      if (compileResult.exitCode !== 0) {
        const stderr = new TextDecoder().decode(compileResult.stderr);
        return text([
          `╔══════════════════════════════════════════════════════╗`,
          `║  ❌ 編譯錯誤                                          ║`,
          `╚══════════════════════════════════════════════════════╝`,
          ``,
          stderr,
          ``,
          `💡 請修正後重新呼叫 diagnostic_check。`,
        ].join("\n"));
      }

      // 跑所有測試案例
      const results: string[] = [];
      let allPassed = true;

      for (const tc of p.test_cases) {
        const runResult = Bun.spawnSync({
          cmd: [`/tmp/diag_${problem_id}`],
          stdin: tc.input,
          stdout: "pipe",
          stderr: "pipe",
        });

        const output = new TextDecoder().decode(runResult.stdout).trim();
        const expected = tc.expected.trim();
        const passed = output === expected;

        if (!passed) allPassed = false;

        results.push(
          `${passed ? "✅" : "❌"} 輸入: ${JSON.stringify(tc.input)} → 輸出: ${JSON.stringify(output)} ${passed ? "" : `(預期: ${JSON.stringify(expected)})`}`
        );
      }

      return text([
        `╔══════════════════════════════════════════════════════╗`,
        `║  ${allPassed ? "🎉 全部通過！" : "⚠️  部分錯誤"}                                         ║`,
        `╚══════════════════════════════════════════════════════╝`,
        ``,
        `📋 測試結果：`,
        ...results,
        ``,
        allPassed
          ? `✅ 這題過了。呼叫 diagnostic_problem index=${diagnosticData.problems.indexOf(p) + 1} 下一題。`
          : `❌ 有錯誤。請學生修正後重新檢查。`,
        ``,
        `🎯 測量概念：${p.target_concepts.join(", ")}`,
      ].join("\n"));
    },
  });

  // ── 診斷結果 ──────────────────────────────────────────────

  server.register({
    name: "diagnostic_result",
    description: "输出診斷結果：學生在每個概念上的表現 + 起點建議。",
    inputSchema: z.object({
      results: z.array(z.object({
        problem_id: z.string(),
        passed: z.boolean(),
        attempts: z.number(),
        compile_errors: z.number(),
      })),
    }),
    handler: async ({ results }) => {
      // 按概念統計
      const conceptStats: Record<string, { total: number; passed: number }> = {};

      for (const r of results) {
        const p = diagnosticData.problems.find((pr) => pr.id === r.problem_id);
        if (!p) continue;
        for (const concept of p.target_concepts) {
          if (!conceptStats[concept]) conceptStats[concept] = { total: 0, passed: 0 };
          conceptStats[concept]!.total++;
          if (r.passed) conceptStats[concept]!.passed++;
        }
      }

      // 輸出報告
      const lines: string[] = [
        `╔══════════════════════════════════════════════════════╗`,
        `║              IOI 語法診斷報告                          ║`,
        `╚══════════════════════════════════════════════════════╝`,
        ``,
        `📊 各概念精熟度：`,
      ];

      for (const [concept, stats] of Object.entries(conceptStats)) {
        const pct = Math.round((stats.passed / stats.total) * 100);
        const bar = "█".repeat(Math.round(pct / 10)) + "░".repeat(10 - Math.round(pct / 10));
        const status = pct >= 80 ? "✅" : pct >= 50 ? "⚠️" : "❌";
        lines.push(`  ${status} ${concept.padEnd(15)} ${bar} ${pct}%`);
      }

      // 判斷落點
      const ioScore = Math.round(((conceptStats["cin"]?.passed ?? 0) + (conceptStats["cout"]?.passed ?? 0) + (conceptStats["while_cin"]?.passed ?? 0)) / Math.max((conceptStats["cin"]?.total ?? 1) + (conceptStats["cout"]?.total ?? 1) + (conceptStats["while_cin"]?.total ?? 1), 1) * 100);
      const complexScore = Math.round(((conceptStats["nested_for"]?.passed ?? 0) + (conceptStats["vector"]?.passed ?? 0) + (conceptStats["function_def"]?.passed ?? 0)) / Math.max((conceptStats["nested_for"]?.total ?? 1) + (conceptStats["vector"]?.total ?? 1) + (conceptStats["function_def"]?.total ?? 1), 1) * 100);

      let recommendation: string;
      let startFrom: string;

      if (ioScore >= 80 && complexScore >= 80) {
        recommendation = "✅ 可以直接上算法課";
        startFrom = "直接進入算法訓練。語法邊角在演算法實作中補強。";
      } else if (ioScore >= 50) {
        recommendation = "⚠️ 需要針對性補強";
        startFrom = "補強以下概念後進入算法：" +
          Object.entries(conceptStats)
            .filter(([, s]) => s.passed < s.total)
            .map(([c]) => c)
            .join(", ");
      } else {
        recommendation = "❌ 需要完整語法課";
        startFrom = "從基礎語法從頭教起。";
      }

      lines.push(
        ``,
        `🎯 診斷結論：`,
        `  IO 基本功：${ioScore}%`,
        `  複雜語法：${complexScore}%`,
        ``,
        `📋 建議：${recommendation}`,
        `🚀 起點：${startFrom}`
      );

      return text(lines.join("\n"));
    },
  });

  // ── 診斷狀態 ──────────────────────────────────────────────

  server.register({
    name: "diagnostic_status",
    description: "查看診斷系統狀態：總題數、概念覆蓋、目前進度。",
    inputSchema: z.object({}),
    handler: async () => {
      const problems = diagnosticData.problems;
      const concepts = new Set<string>();
      for (const p of problems) {
        for (const c of p.target_concepts) concepts.add(c);
      }

      return text([
        `╔══════════════════════════════════════════════════════╗`,
        `║            IOI 語法診斷系統狀態                        ║`,
        `╚══════════════════════════════════════════════════════╝`,
        ``,
        `📝 總題數：${problems.length}`,
        `🎯 覆蓋概念：${[...concepts].join(", ")}`,
        ``,
        `使用流程：`,
        `  1. diagnostic_problem index=0  → 出第一題`,
        `  2. 學生寫 code（vim work/sol.cpp）`,
        `  3. diagnostic_check problem_id=xxx → 驗證`,
        `  4. diagnostic_problem index=1  → 下一題`,
        `  5. 重複 3-4 直到完成`,
        `  6. diagnostic_result → 取得報告`,
      ].join("\n"));
    },
  });
}
