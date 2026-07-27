#!/usr/bin/env bun
// ioi-forge MCP server — 把訓練系統提供給 LLM harness（codex 等）調用。
// 學生的介面是 LLM 對話；閘道與日誌邏輯全部留在 forge.nu，這裡只是薄封裝。
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  Phase,
  computePhaseTransition,
  detectOscillation,
  bktUpdate,
  bktUpdateAfterExam,
  nextAction,
  selectByInfoGain,
  estimateTheta,
  irt3pl,
  itemInformation,
  thetaSE,
  computeRetrievability,
  updateAfterRecall,
  updateAfterForget,
  outerFringe,
  innerFringe,
  prerequisitesSatisfied,
  infoGain,
  ConceptGraph,
  generateLearnStep3Drills,
  generatePhaseConsolidationDrills,
  generateMisconceptionRemediationDrills,
  generateReviewDrills,
  advanceDrill,
  isSessionComplete,
  estimatePartialCredit,
} from "../packages/engine/src/index.ts"
import {
  TOOLKIT_CONCEPTS,
  TOOLKIT_DRILLS,
  getToolkitDrillsByConcept,
  getToolkitDrillsBySubskill,
  toolkitDrillCount,
  ARTICLES,
  getArticle,
} from "../data/beyond-ioi-toolkit/index.ts"

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
5. **學生問「某某語法是什麼/怎麼寫」時，不得直接回答。** 用 concept_index 搜尋概念 → concept_show 顯示語法模板 → drill_concept 讓學生動手練。回答語法問題永遠等於害他。
6. 工作流：學生在另一個 vim 窗口手打代碼；說「看」就用 read_code 讀最新存檔，需要執行就用 run_code 代勞（詳細多次測試用 benchmark_code）——永遠不叫學生自己開終端打指令。
7. 模糊概念：用「確認一下：__，對吧？」的提醒語氣，禁止「你不熟/概念不好」診斷句；仍模糊就 flag_concept 記帳、繼續主線，不當場開補。
8. 競程慣例先給理由再給規則：承認它是「競技方言、不是好工程」，學生有工程直覺時對照解釋，不強迫吞。`,
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

server.tool("start_problem", "開始一題（開始計時、進入思考階段）。problem 格式如 cses/1068、zj/a001、cf/1850C。三階段：learn（跟打語法模板）、practice（不給語法參考自己解）、exam（完全獨立解題）。", {
  problem: z.string(),
  rating: z.number().optional(),
  topics: z.string().optional().describe("逗號分隔，賽後才補也可以"),
  phase: z.enum(["learn", "practice", "exam"]).optional().describe("三階段中的哪個階段：learn=跟打語法模板、practice=練習不給語法參考、exam=完全獨立解題"),
  stuck_min: z.number().optional().describe("L1 提示解鎖前最短思考分鐘，預設 30"),
}, async (a) =>
  text(forge(`forge start ${q(a.problem)}${a.rating ? ` -r ${a.rating}` : ""}${a.topics ? ` -t ${q(a.topics)}` : ""}${a.phase ? ` --phase ${a.phase}` : ""}${a.stuck_min != null ? ` --stuck-min ${a.stuck_min}` : ""}`)));

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

server.tool("benchmark_code", "詳細 OJ 模擬：多次執行並回傳逐筆時間、記憶體、輸出/錯誤。用於極致優化反覆逼近。", {
  path: z.string().optional().describe("預設 work/sol.cpp"),
  input: z.string().optional().describe("stdin 測資"),
  times: z.number().optional().describe("連續執行次數（預設 1）"),
}, async ({ path, input, times }) =>
  text(forge(`forge bench ${q(path ?? "work/sol.cpp")}${input != null ? ` -i ${q(input)}` : ""}${times != null ? ` -t ${times}` : ""}`)));

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

server.tool("concept_index", "查詢所有可 drill 的概念（支援 -q 名稱搜尋）。學生問「某某語法是什麼」時，先用這個搜尋概念，再用 concept_show 或 drill_concept。", {
  query: z.string().optional().describe("搜尋關鍵字，不給則列出全部"),
}, async ({ query }) => text(forge(`forge concept index${query ? ` -q ${q(query)}` : ""} | table -e`)));

server.tool("concept_show", "顯示特定概念的語法模板、drill 清單。給 LLM 老師取代直接回答語法問題。", {
  concept: z.string(),
}, async ({ concept }) => text(forge(`forge concept show ${q(concept)}`)));

server.tool("drill_concept", "對特定概念啟動 drill session。學生需要練習某語法點時呼叫。\n  --mode learn: 複製跟打模板，學生跟著打\n  --mode fill: 填空練習\n  --mode problem: 開題目給學生練習", {
  concept: z.string(),
  mode: z.enum(["learn", "fill", "problem"]).optional().describe("drill 模式：learn（跟打）、fill（填空）、problem（開題練習）"),
  problem: z.string().optional().describe("problem mode 時指定題號"),
}, async ({ concept, mode, problem }) =>
  text(forge(`forge drill ${q(concept)}${mode ? ` --mode ${mode}` : ""}${problem ? ` --problem ${q(problem)}` : ""}` | table -e)));

// ===================== Engine Tools =====================

server.tool("engine_phase_transition",
  "計算 phase transition：給概念狀態與是否通過 exam，回傳下一個 phase",
  {
    state: z.string().describe("ConceptState JSON"),
    examPassed: z.boolean().optional().default(false),
  },
  async ({ state, examPassed }) => {
    try {
      const result = computePhaseTransition(JSON.parse(state), examPassed)
      return text(JSON.stringify(result))
    } catch (e: any) {
      return text(`error: ${e.message}`)
    }
  },
)

server.tool("engine_bkt_update",
  "BKT 更新：給 P(L) + 四參數 + 正確/錯誤，回傳新的 P(L)",
  {
    pL: z.number().min(0).max(1),
    pT: z.number().min(0).max(1),
    pG: z.number().min(0).max(1),
    pS: z.number().min(0).max(1),
    correct: z.boolean(),
    weight: z.number().min(0).max(2).optional().default(1),
  },
  async ({ pL, pT, pG, pS, correct, weight }) => {
    const result = bktUpdate(pL, { pL0: pL, pT, pG, pS }, { correct }, weight)
    return text(JSON.stringify({ pL: result }))
  },
)

server.tool("engine_bkt_exam",
  "Exam 階段 BKT 更新（1.5× 權重）",
  {
    pL: z.number().min(0).max(1),
    pT: z.number().min(0).max(1),
    pG: z.number().min(0).max(1),
    pS: z.number().min(0).max(1),
    correct: z.boolean(),
  },
  async ({ pL, pT, pG, pS, correct }) => {
    const result = bktUpdateAfterExam(pL, { pL0: pL, pT, pG, pS }, correct)
    return text(JSON.stringify({ pL: result }))
  },
)

server.tool("engine_irt_estimate",
  "IRT θ 估計：給作答記錄，回傳能力值 theta",
  {
    responses: z.string().describe('JSON array of {u:0|1, a, b, c}'),
  },
  async ({ responses }) => {
    try {
      const theta = estimateTheta(JSON.parse(responses))
      return text(JSON.stringify({ theta }))
    } catch (e: any) {
      return text(`error: ${e.message}`)
    }
  },
)

server.tool("engine_irt_p",
  "IRT 3PL 正確概率：P(θ) = c + (1-c)/(1+exp(-a(θ-b)))",
  {
    theta: z.number(),
    a: z.number().positive(),
    b: z.number(),
    c: z.number().min(0).max(1),
  },
  async ({ theta, a, b, c }) => {
    const p = irt3pl(theta, a, b, c)
    return text(JSON.stringify({ probability: p }))
  },
)

server.tool("engine_fsrs_retrievability",
  "FSRS 記憶檢索率：R(t) = 1/(1+(t/S)^DECAY)",
  {
    t: z.number().describe("經過天數"),
    S: z.number().positive().describe("穩定度（天）"),
  },
  async ({ t, S }) => {
    const r = computeRetrievability(t, S)
    return text(JSON.stringify({ retrievability: r }))
  },
)

server.tool("engine_kst_fringe",
  "KST outer/inner fringe 計算：給概念圖與 P(L) map",
  {
    graphJson: z.string().describe("ConceptNode[] JSON"),
    pLMapJson: z.string().describe('P(L) map as JSON object {conceptId: pL}'),
    fringeType: z.enum(["outer", "inner"]),
  },
  async ({ graphJson, pLMapJson, fringeType }) => {
    try {
      const graph = new ConceptGraph()
      for (const node of JSON.parse(graphJson)) graph.addNode(node)
      const pLMap = new Map(Object.entries(JSON.parse(pLMapJson)))
      const result = fringeType === "outer" ? outerFringe(graph, pLMap) : innerFringe(graph, pLMap)
      return text(JSON.stringify({ fringe: result }))
    } catch (e: any) {
      return text(`error: ${e.message}`)
    }
  },
)

server.tool("engine_drill_scenario",
  "產生 drill session（以情境分類）",
  {
    scenario: z.enum(["learn_step3", "phase_consolidation", "misconception_remediation", "review"]),
    conceptId: z.string(),
    subskill: z.string().optional().default(""),
    misconceptionId: z.string().optional().default(""),
    buggyCode: z.string().optional().default(""),
    correctCode: z.string().optional().default(""),
  },
  async ({ scenario, conceptId, subskill, misconceptionId, buggyCode, correctCode }) => {
    let session
    switch (scenario) {
      case "learn_step3":
        session = generateLearnStep3Drills(conceptId, subskill)
        break
      case "phase_consolidation":
        session = generatePhaseConsolidationDrills(conceptId, subskill)
        break
      case "misconception_remediation":
        session = generateMisconceptionRemediationDrills(conceptId, misconceptionId, subskill, buggyCode, correctCode)
        break
      case "review":
        session = generateReviewDrills(conceptId, [])
        break
    }
    return text(JSON.stringify(session))
  },
)

server.tool("engine_drill_advance",
  "推進 drill session：記錄一次作答結果",
  {
    session: z.string().describe("DrillSession JSON"),
    correct: z.boolean(),
  },
  async ({ session, correct }) => {
    try {
      const updated = advanceDrill(JSON.parse(session), correct)
      return text(JSON.stringify(updated))
    } catch (e: any) {
      return text(`error: ${e.message}`)
    }
  },
)

// ===================== Toolkit Tools =====================

server.tool("toolkit_list",
  "列出所有超 IOI 工具包概念。學生完成 IOI 課綱後，可用此工具探索進階主題。",
  {
    group: z.string().optional().describe("依群組過濾：代數工具、數論深度、資料結構、圖論進階、DP 優化、字串進階"),
  },
  async ({ group }) => {
    const concepts = group
      ? TOOLKIT_CONCEPTS.filter(c => c.group === group)
      : TOOLKIT_CONCEPTS
    const lines = concepts.map(c => `${c.id.padEnd(25)} ${c.group.padEnd(12)} ${c.name}`)
    return text([
      `可用工具包概念共 ${concepts.length} 個（全部 ${TOOLKIT_CONCEPTS.length} 個）：`,
      `ID                       群組         名稱`,
      `─`.repeat(50),
      ...lines,
      ``,
      `使用 toolkit_show <conceptId> 查看 drill 內容`,
    ].join("\n"))
  },
)

server.tool("toolkit_show",
  "顯示特定超 IOI 工具包的 drill 清單與內容。可選 mode 過濾 drill 類型。",
  {
    conceptId: z.string().describe("概念 ID，如 A01-fft-ntt、D01-dinic。用 toolkit_list 查看所有 ID。"),
    mode: z.enum(["fill", "trace", "debug", "all"]).optional().default("all").describe("過濾 drill 類型"),
  },
  async ({ conceptId, mode }) => {
    const drills = getToolkitDrillsByConcept(conceptId)
    if (drills.length === 0) return text(`找不到概念 ${conceptId}。用 toolkit_list 查看所有可用的概念 ID。`)

    const concept = TOOLKIT_CONCEPTS.find(c => c.id === conceptId)
    const header = `工具包: ${concept?.name ?? conceptId} (${concept?.group ?? ""}) — ${drills.length} 個 drill` + "\n" + "─".repeat(50) + "\n"

    const filtered = mode === "all" ? drills : drills.filter(d => d.type === mode)

    const lines = filtered.map((d, i) => {
      let s = `[${i + 1}/${filtered.length}] ${d.type.toUpperCase().padEnd(8)} ${"id" in d ? d.id : ""}\n`
      if ("subskill" in d && d.subskill) s += `    技能: ${d.subskill}\n`
      if ("difficulty" in d) s += `    難度: ${d.difficulty}/5\n`
      // 加入 problem mapping if present on the object
      if ("problems" in d && Array.isArray(d.problems) && d.problems.length > 0) {
        s += `    練習題: ${d.problems.join(", ")}\n`
      }
      return s
    })

    return text(header + lines.join("\n"))
  },
)

server.tool("toolkit_drill_count",
  "回傳工具包累計 drill 統計",
  {},
  async () => {
    const byType: Record<string, number> = {}
    for (const d of TOOLKIT_DRILLS) {
      byType[d.type] = (byType[d.type] ?? 0) + 1
    }
    const typeSummary = Object.entries(byType).map(([t, c]) => `${t}: ${c}`).join(", ")
    return text(
      `總 drill 數: ${TOOLKIT_DRILLS.length}\n` +
      `總概念數: ${TOOLKIT_CONCEPTS.length}\n` +
      `按類型: ${typeSummary}\n` +
      `按群組: ${[...new Set(TOOLKIT_CONCEPTS.map(c => c.group))].join(", ")}`
    )
  },
)

server.tool("toolkit_lesson",
  "超 IOI 工具包教學文章。回傳指定概念的教學內容（含動機/推導/code walkthrough/drill 提示），" +
  "每篇文章分成多節，教師應逐節引導學生。每節都有學習理論參數（BKT weight, IRT difficulty），" +
  "教師做完該節 drill 後應呼叫 engine_bkt_update 更新熟練度。",
  {
    conceptId: z.string().describe("概念 ID，如 A01-fft-ntt。用 toolkit_list 查看。"),
    sectionId: z.string().optional().describe("指定節 ID，不給則回傳目錄+第一節"),
    mode: z.enum(["start", "section"]).optional().default("start").describe("start=回傳全部 section 清單+第一節內容；section=回傳特定節"),
  },
  async ({ conceptId, sectionId, mode }) => {
    const article = getArticle(conceptId)
    if (!article) return text(
      `找不到概念 ${conceptId} 的教學文章。可用 toolkit_list 查看所有概念。\n` +
      `目前有文章的: ${ARTICLES.map(a => a.metadata.id).join(", ")}`
    )

    const { metadata, sections } = article

    if (sections.length === 0) return text(`概念 ${conceptId} 的教學文章無任何小節。`)

    if (mode === "start") {
      const toc = sections.map((s, i) =>
        `  ${i + 1}. [${s.id}] ${s.title} (${s.theory.estimatedMinutes}分, BKT=${s.theory.bktWeight}, IRT=${s.theory.irtDifficulty})`
      ).join("\n")

      const first = sections[0]
      return text([
        `╔═══════════════════════════════════════════`,
        `║  ${metadata.title}`,
        `║  群組: ${metadata.group}  │  預估: ${metadata.estimatedTotalMinutes}分`,
        `║  前置: ${metadata.prerequisites.join("、") || "無"}`,
        `║  BKT 預設: pT=${metadata.bktDefault.pT} pG=${metadata.bktDefault.pG} pS=${metadata.bktDefault.pS}`,
        `║  文章數: ${ARTICLES.length} 篇`,
        `╚═══════════════════════════════════════════`,
        ``,
        `📖 目錄：`,
        toc,
        ``,
        `─`.repeat(50),
        ``,
        first!.content,
        ``,
        `─`.repeat(50),
        `📌 學習理論: BKT weight=${first!.theory.bktWeight}, IRT diff=${first!.theory.irtDifficulty}`,
        `📌 預計 ${first!.theory.estimatedMinutes} 分鐘`,
        first!.theory.drillRefs.length > 0 ? `📌 本節 drill: ${first!.theory.drillRefs.map(d => `toolkit_show ${conceptId} → ${d.drillId}`).join(", ")}` : "",
        `📌 檢核: ${first!.theory.evidence}`,
        ``,
        `使用 toolkit_lesson conceptId=${conceptId} sectionId=<節ID> mode=section 看下一節。`,
      ].filter(Boolean).join("\n"))
    }

    const section = sections.find(s => s.id === sectionId)
    if (!section) return text(
      `找不到節 ${sectionId}。可用節 ID：\n${
        sections.map(s => `  ${s.id} — ${s.title}`).join("\n")
      }`
    )

    return text([
      `📖 ${section.title}`,
      `─`.repeat(50),
      section.content,
      ``,
      `─`.repeat(50),
      `📌 學習理論: BKT weight=${section.theory.bktWeight}, IRT diff=${section.theory.irtDifficulty}`,
      `📌 預計 ${section.theory.estimatedMinutes} 分鐘`,
      section.theory.drillRefs.length > 0
        ? `📌 本節 drill: ${section.theory.drillRefs.map(d => `${d.mode}/${d.drillId}`).join(", ")}`
        : "",
      `📌 檢核: ${section.theory.evidence}`,
    ].join("\n"))
  },
)

await server.connect(new StdioServerTransport());
