// algo-tutor session tools — today, start, status, hint, code, debug, finish, abort.

import { McpServer } from "../server.ts";
import { z } from "zod";
import { algo } from "../algo.ts";
import { text, q } from "./util.ts";

export function registerSessionTools(server: McpServer): void {
  server.register({
    name: "today",
    description: "今日訓練面板：複習到期、當前課綱單元、題單。學生問「今天做什麼」時呼叫。",
    inputSchema: z.object({}),
    handler: async () => text(algo("algo today")),
  });

  server.register({
    name: "session_status",
    description: "目前解題進度與下一級提示倒數。",
    inputSchema: z.object({}),
    handler: async () => text(algo("algo status")),
  });

  server.register({
    name: "start_problem",
    description:
      "開始一題（開始計時、進入思考階段）。problem 格式如 cses/1068、zj/a001、cf/1850C。三階段：learn（跟打語法模板）、practice（不給語法參考自己解）、exam（完全獨立解題）。",
    inputSchema: z.object({
      problem: z.string(),
      rating: z.number().optional(),
      topics: z.string().optional().describe("逗號分隔，賽後才補也可以"),
      phase: z
        .enum(["learn", "practice", "exam"])
        .optional()
        .describe(
          "三階段中的哪個階段：learn=跟打語法模板、practice=練習不給語法參考、exam=完全獨立解題",
        ),
      stuck_min: z
        .number()
        .optional()
        .describe("L1 提示解鎖前最短思考分鐘，預設 30"),
    }),
    handler: async (a) =>
      text(
        algo(
          `algo start ${q(a.problem)}${a.rating ? ` -r ${a.rating}` : ""}${a.topics ? ` -t ${q(a.topics)}` : ""}${a.phase ? ` --phase ${a.phase}` : ""}${a.stuck_min != null ? ` --stuck-min ${a.stuck_min}` : ""}`,
        ),
      ),
  });

  server.register({
    name: "hint",
    description:
      "學生要提示時呼叫（唯一合法的提示管道）。回傳可能是拒絕（未到時限，此時鼓勵學生繼續想，絕不自行給提示）或提示等級規則（嚴格照規則給該級提示，不多說）。",
    inputSchema: z.object({
      notes: z.string().optional().describe("學生目前的思路與卡點"),
    }),
    handler: async (a) =>
      text(algo(`algo hint${a.notes ? ` -n ${q(a.notes)}` : ""}`)),
  });

  server.register({
    name: "mark_coding",
    description: "學生開始寫代碼時呼叫（記錄思考時間）。",
    inputSchema: z.object({}),
    handler: async () => text(algo("algo code")),
  });

  server.register({
    name: "mark_debugging",
    description: "學生第一次提交失敗、進入除錯時呼叫。",
    inputSchema: z.object({}),
    handler: async () => text(algo("algo debug")),
  });

  server.register({
    name: "finish_problem",
    description:
      "收尾寫日誌。先引導學生自己說出：錯誤主因分類（R讀題/K知識缺口/P檢索失敗/M建模/I實作/B邊界/E效率/T時間分配，乾淨AC留空）、費曼摘要（≤3句）、線索卡（下次遇到__就__），再填入。",
    inputSchema: z.object({
      result: z.enum(["ac", "partial", "fail"]),
      score: z.number().optional().describe("partial 時的分數"),
      err: z.string().describe("主因分類字母，乾淨 AC 給空字串"),
      err2: z.string().optional(),
      summary: z.string(),
      cue: z.string(),
    }),
    handler: async (a) =>
      text(
        algo(
          `algo finish ${a.result}${a.score != null ? ` --score ${a.score}` : ""} --err ${q(a.err)} --err2 ${q(a.err2 ?? "")} -s ${q(a.summary)} -c ${q(a.cue)}`,
        ),
      ),
  });

  server.register({
    name: "abort_problem",
    description: "放棄目前題目（不寫日誌）。",
    inputSchema: z.object({}),
    handler: async () => text(algo("algo abort")),
  });

  server.register({
    name: "reviews_due",
    description: "到期的複習題（空白重推）。",
    inputSchema: z.object({}),
    handler: async () => text(algo("algo due | table -e")),
  });

  server.register({
    name: "record_review",
    description: "記錄一次空白重推結果。學生重推前不得給任何提醒。",
    inputSchema: z.object({
      id: z.string().describe("attempt id"),
      recalled: z.boolean(),
    }),
    handler: async ({ id, recalled }) =>
      text(algo(`algo done ${q(id)}${recalled ? "" : " --failed"}`)),
  });
}
