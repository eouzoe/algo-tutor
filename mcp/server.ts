#!/usr/bin/env bun
// ioi-forge MCP server — 把訓練系統提供給 LLM harness（codex 等）調用。
// 學生的介面是 LLM 對話；閘道與日誌邏輯全部留在 forge.nu，這裡只是薄封裝。
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function forge(cmd: string): string {
  const r = spawnSync("nu", ["-c", `use "${ROOT}/.nu/forge.nu" *; ${cmd}`], {
    encoding: "utf8",
    timeout: 120_000,
    env: { ...process.env, FORGE_ROOT: ROOT },
  });
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();
  return out || "(完成，無輸出)";
}

const q = (s: string) => `"${s.replace(/(["$\\])/g, "\\$1")}"`;

const server = new McpServer(
  { name: "ioi-forge", version: "0.1.0" },
  {
    instructions: `你透過這些工具擔任一名台灣 IOI 選手的家教兼教練。鐵律：
1. 學生解題中（start 之後）絕不主動劇透任何解法方向；提示只能經 hint 工具，被拒絕就引導學生繼續想，不得自己給提示。
2. 上課用 lesson 工具取得教材與規則，全程繁體中文、費曼式小步推進。
3. 學生說「今天做什麼」就呼叫 today。解題流程：start → (hint) → code → debug → finish。finish 必須引導學生自己說出錯誤分類、費曼摘要、線索卡，再代填參數。
4. 對零基礎學生，不使用未教過的術語；非提不可就一句話「之後會學，現在不用懂」，不展開。
5. 工作流：學生在另一個 vim 窗口手打代碼；說「看」就用 read_code 讀最新存檔，需要執行就用 run_code 代勞——永遠不叫學生自己開終端打指令。
6. 模糊概念：用「確認一下：__，對吧？」的提醒語氣，禁止「你不熟/概念不好」診斷句；仍模糊就 flag_concept 記帳、繼續主線，不當場開補。
7. 競程慣例先給理由再給規則：承認它是「競技方言、不是好工程」，學生有工程直覺時對照解釋，不強迫吞。`,
  }
);

const text = (s: string) => ({ content: [{ type: "text" as const, text: s }] });

server.tool("today", "今日訓練面板：複習到期、當前課綱單元、題單。學生問「今天做什麼」時呼叫。", {}, async () =>
  text(forge("forge today")));

server.tool("lesson", "取得當前單元的授課材料與教學規則（USACO Guide 原文 + 檢核題）。你收到後就是家教，照規則用繁中授課。", {
  unit: z.number().optional().describe("指定單元（預設當前進度）"),
}, async ({ unit }) => text(forge(`forge learn${unit ? ` -u ${unit}` : ""}`)));

server.tool("pass_unit", "學生完成當前單元全部檢核題後推進課綱。檢核題未全 AC 會被拒絕。", {
  force: z.boolean().optional(),
}, async ({ force }) => text(forge(`forge pass${force ? " --force" : ""}`)));

server.tool("start_problem", "開始一題（開始計時、進入思考階段）。problem 格式如 cses/1068、zj/a001、cf/1850C。", {
  problem: z.string(),
  rating: z.number().optional(),
  topics: z.string().optional().describe("逗號分隔，賽後才補也可以"),
  stuck_min: z.number().optional().describe("L1 提示解鎖前最短思考分鐘，預設 30"),
}, async (a) =>
  text(forge(`forge start ${q(a.problem)}${a.rating ? ` -r ${a.rating}` : ""}${a.topics ? ` -t ${q(a.topics)}` : ""}${a.stuck_min != null ? ` --stuck-min ${a.stuck_min}` : ""}`)));

server.tool("session_status", "目前解題進度與下一級提示倒數。", {}, async () =>
  text(forge("forge status")));

server.tool("hint", "學生要提示時呼叫（唯一合法的提示管道）。回傳可能是拒絕（未到時限，此時鼓勵學生繼續想，絕不自行給提示）或提示等級規則（嚴格照規則給該級提示，不多說）。", {
  notes: z.string().optional().describe("學生目前的思路與卡點"),
}, async ({ notes }) => text(forge(`forge hint${notes ? ` -n ${q(notes)}` : ""}`)));

server.tool("mark_coding", "學生開始寫代碼時呼叫（記錄思考時間）。", {}, async () =>
  text(forge("forge code")));

server.tool("mark_debugging", "學生第一次提交失敗、進入除錯時呼叫。", {}, async () =>
  text(forge("forge debug")));

server.tool("finish_problem", "收尾寫日誌。先引導學生自己說出：錯誤主因分類（R讀題/K知識缺口/P檢索失敗/M建模/I實作/B邊界/E效率/T時間分配，乾淨AC留空）、費曼摘要（≤3句）、線索卡（下次遇到__就__），再填入。", {
  result: z.enum(["ac", "partial", "fail"]),
  score: z.number().optional().describe("partial 時的分數"),
  err: z.string().describe("主因分類字母，乾淨 AC 給空字串"),
  err2: z.string().optional(),
  summary: z.string(),
  cue: z.string(),
}, async (a) =>
  text(forge(`forge finish ${a.result}${a.score != null ? ` --score ${a.score}` : ""} --err ${q(a.err)} --err2 ${q(a.err2 ?? "")} -s ${q(a.summary)} -c ${q(a.cue)}`)));

server.tool("abort_problem", "放棄目前題目（不寫日誌）。", {}, async () =>
  text(forge("forge abort")));

server.tool("reviews_due", "到期的複習題（空白重推）。", {}, async () =>
  text(forge("forge due | table -e")));

server.tool("record_review", "記錄一次空白重推結果。學生重推前不得給任何提醒。", {
  id: z.string().describe("attempt id"),
  recalled: z.boolean(),
}, async ({ id, recalled }) => text(forge(`forge done ${q(id)}${recalled ? "" : " --failed"}`)));

server.tool("pick_problems", "出題單（rating+200~400、排除已做、弱點加權）。輸出不含 tags，不要向學生透露主題。", {
  count: z.number().optional(),
  topic: z.string().optional().describe("塊狀練習期鎖定主題"),
}, async (a) => text(forge(`forge pick${a.count ? ` -c ${a.count}` : ""}${a.topic ? ` -t ${q(a.topic)}` : ""} | table -e`)));

server.tool("record_recognition", "記錄一筆識別訓練（只看題面口述方向）。", {
  problem: z.string(),
  topic: z.string().describe("正解主題"),
  guess: z.string().describe("學生口述的方向"),
  correct: z.boolean(),
  sec: z.number().optional(),
}, async (a) =>
  text(forge(`forge rec ${q(a.problem)} ${q(a.topic)} ${q(a.guess)}${a.correct ? "" : " --wrong"}${a.sec != null ? ` -s ${a.sec}` : ""}`)));

server.tool("stats", "近況統計（教練/複盤用）。", {
  days: z.number().optional(),
}, async ({ days }) => text(forge(`forge stats${days ? ` -d ${days}` : ""} | table -e`)));

server.tool("weekly_report", "訓練週報 + 診斷指引（教練用）。", {
  days: z.number().optional(),
}, async ({ days }) => text(forge(`forge diagnose${days ? ` -d ${days}` : ""}`)));

server.tool("training_log", "人類可讀的近期解題日誌。", {
  limit: z.number().optional(),
}, async ({ limit }) => text(forge(`forge log${limit ? ` -l ${limit}` : ""} | table -e`)));

server.tool("push_anki", "把線索卡直推學生本機 Anki（需開著 Anki + AnkiConnect）。", {}, async () =>
  text(forge("forge anki")));

server.tool("read_code", "讀學生 vim 窗口正在寫的代碼（學生說「看」時呼叫）。預設 work/sol.cpp。", {
  path: z.string().optional(),
}, async ({ path }) => {
  const p = path ?? "work/sol.cpp";
  if (p.includes("..")) return text("路徑不合法");
  const f = Bun.file(join(ROOT, p));
  return text((await f.exists()) ? await f.text() : `${p} 不存在（學生存檔了嗎？）`);
});

server.tool("run_code", "代學生編譯執行代碼（g++ -O2 -Wall），回傳編譯錯誤/輸出/耗時。學生不用開終端。", {
  path: z.string().optional().describe("預設 work/sol.cpp"),
  input: z.string().optional().describe("stdin 測資"),
}, async ({ path, input }) =>
  text(forge(`forge run ${q(path ?? "work/sol.cpp")}${input != null ? ` -i ${q(input)}` : ""} | to json`)));

server.tool("flag_concept", "把學生的模糊概念記入帳本（不打斷主線）。之後複習時段再銷帳。", {
  concept: z.string(),
  note: z.string().optional().describe("模糊在哪裡"),
}, async ({ concept, note }) =>
  text(forge(`forge concept fuzzy ${q(concept)}${note ? ` -n ${q(note)}` : ""}`)));

server.tool("resolve_concept", "學生複習後已確實掌握，概念銷帳。", {
  concept: z.string(),
}, async ({ concept }) => text(forge(`forge concept ok ${q(concept)}`)));

server.tool("list_concepts", "列出待銷帳的模糊概念（複習時段的材料）。", {}, async () =>
  text(forge("forge concept list | table -e")));

await server.connect(new StdioServerTransport());
