// ioi-forge engine tools — direct calls to the cognitive engine.
// These don't spawn nu processes; they import the engine directly.

import { McpServer } from "../server.ts";
import { z } from "zod";
import {
  computePhaseTransition,
  bktUpdate,
  bktUpdateAfterExam,
  estimateTheta,
  irt3pl,
  computeRetrievability,
  outerFringe,
  innerFringe,
  ConceptGraph,
  generateLearnStep3Drills,
  generatePhaseConsolidationDrills,
  generateMisconceptionRemediationDrills,
  generateReviewDrills,
  advanceDrill,
} from "../../packages/engine/src/index.ts";
import { text, errText } from "./util.ts";

export function registerEngineTools(server: McpServer): void {
  server.register({
    name: "engine_phase_transition",
    description: "計算 phase transition：給概念狀態與是否通過 exam，回傳下一個 phase",
    inputSchema: z.object({
      state: z.string().describe("ConceptState JSON"),
      examPassed: z.boolean().optional().default(false),
    }),
    handler: async ({ state, examPassed }) => {
      try {
        const result = computePhaseTransition(JSON.parse(state), examPassed);
        return text(JSON.stringify(result));
      } catch (e) {
        return errText(e);
      }
    },
  });

  server.register({
    name: "engine_bkt_update",
    description: "BKT 更新：給 P(L) + 四參數 + 正確/錯誤，回傳新的 P(L)",
    inputSchema: z.object({
      pL: z.number().min(0).max(1),
      pT: z.number().min(0).max(1),
      pG: z.number().min(0).max(1),
      pS: z.number().min(0).max(1),
      correct: z.boolean(),
      weight: z.number().min(0).max(2).optional().default(1),
    }),
    handler: async ({ pL, pT, pG, pS, correct, weight }) => {
      const result = bktUpdate(pL, { pL0: pL, pT, pG, pS }, { correct }, weight);
      return text(JSON.stringify({ pL: result }));
    },
  });

  server.register({
    name: "engine_bkt_exam",
    description: "Exam 階段 BKT 更新（1.5× 權重）",
    inputSchema: z.object({
      pL: z.number().min(0).max(1),
      pT: z.number().min(0).max(1),
      pG: z.number().min(0).max(1),
      pS: z.number().min(0).max(1),
      correct: z.boolean(),
    }),
    handler: async ({ pL, pT, pG, pS, correct }) => {
      const result = bktUpdateAfterExam(pL, { pL0: pL, pT, pG, pS }, correct);
      return text(JSON.stringify({ pL: result }));
    },
  });

  server.register({
    name: "engine_irt_estimate",
    description: "IRT θ 估計：給作答記錄，回傳能力值 theta",
    inputSchema: z.object({
      responses: z.string().describe('JSON array of {u:0|1, a, b, c}'),
    }),
    handler: async ({ responses }) => {
      try {
        const theta = estimateTheta(JSON.parse(responses));
        return text(JSON.stringify({ theta }));
      } catch (e) {
        return errText(e);
      }
    },
  });

  server.register({
    name: "engine_irt_p",
    description: "IRT 3PL 正確概率：P(θ) = c + (1-c)/(1+exp(-a(θ-b)))",
    inputSchema: z.object({
      theta: z.number(),
      a: z.number().positive(),
      b: z.number(),
      c: z.number().min(0).max(1),
    }),
    handler: async ({ theta, a, b, c }) => {
      const p = irt3pl(theta, a, b, c);
      return text(JSON.stringify({ probability: p }));
    },
  });

  server.register({
    name: "engine_fsrs_retrievability",
    description: "FSRS 記憶檢索率：R(t) = 1/(1+(t/S)^DECAY)",
    inputSchema: z.object({
      t: z.number().describe("經過天數"),
      S: z.number().positive().describe("穩定度（天）"),
    }),
    handler: async ({ t, S }) => {
      const r = computeRetrievability(t, S);
      return text(JSON.stringify({ retrievability: r }));
    },
  });

  server.register({
    name: "engine_kst_fringe",
    description: "KST outer/inner fringe 計算：給概念圖與 P(L) map",
    inputSchema: z.object({
      graphJson: z.string().describe("ConceptNode[] JSON"),
      pLMapJson: z.string().describe('P(L) map as JSON object {conceptId: pL}'),
      fringeType: z.enum(["outer", "inner"]),
    }),
    handler: async ({ graphJson, pLMapJson, fringeType }) => {
      try {
        const graph = new ConceptGraph();
        for (const node of JSON.parse(graphJson)) graph.addNode(node);
        // JSON.parse gives Map<string,unknown>; engine expects Map<string,number>
        const pLMap = new Map(
          Object.entries(JSON.parse(pLMapJson)).map(([k, v]) => [k, Number(v)]),
        );
        const result =
          fringeType === "outer"
            ? outerFringe(graph, pLMap)
            : innerFringe(graph, pLMap);
        return text(JSON.stringify({ fringe: result }));
      } catch (e) {
        return errText(e);
      }
    },
  });

  server.register({
    name: "engine_drill_scenario",
    description: "產生 drill session（以情境分類）",
    inputSchema: z.object({
      scenario: z.enum([
        "learn_step3",
        "phase_consolidation",
        "misconception_remediation",
        "review",
      ]),
      conceptId: z.string(),
      subskill: z.string().optional().default(""),
      misconceptionId: z.string().optional().default(""),
      buggyCode: z.string().optional().default(""),
      correctCode: z.string().optional().default(""),
    }),
    handler: async ({ scenario, conceptId, subskill, misconceptionId, buggyCode, correctCode }) => {
      let session;
      switch (scenario) {
        case "learn_step3":
          session = generateLearnStep3Drills(conceptId, subskill);
          break;
        case "phase_consolidation":
          session = generatePhaseConsolidationDrills(conceptId, subskill);
          break;
        case "misconception_remediation":
          session = generateMisconceptionRemediationDrills(
            conceptId,
            misconceptionId,
            subskill,
            buggyCode,
            correctCode,
          );
          break;
        case "review":
          session = generateReviewDrills(conceptId, []);
          break;
      }
      return text(JSON.stringify(session));
    },
  });

  server.register({
    name: "engine_drill_advance",
    description: "推進 drill session：記錄一次作答結果",
    inputSchema: z.object({
      session: z.string().describe("DrillSession JSON"),
      correct: z.boolean(),
    }),
    handler: async ({ session, correct }) => {
      try {
        const updated = advanceDrill(JSON.parse(session), correct);
        return text(JSON.stringify(updated));
      } catch (e) {
        return errText(e);
      }
    },
  });
}
