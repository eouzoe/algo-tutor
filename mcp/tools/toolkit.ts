// ioi-forge toolkit tools — beyond IOI toolkit concepts and lessons.

import { McpServer } from "../server.ts";
import { z } from "zod";
import {
  TOOLKIT_CONCEPTS,
  TOOLKIT_DRILLS,
  getToolkitDrillsByConcept,
  ARTICLES,
  getArticle,
} from "../../data/beyond-ioi-toolkit/index.ts";
import { text } from "./util.ts";

export function registerToolkitTools(server: McpServer): void {
  server.register({
    name: "toolkit_list",
    description:
      "列出所有超 IOI 工具包概念。學生完成 IOI 課綱後，可用此工具探索進階主題。",
    inputSchema: z.object({
      group: z
        .string()
        .optional()
        .describe(
          "依群組過濾：代數工具、數論深度、資料結構、圖論進階、DP 優化、字串進階",
        ),
    }),
    handler: async ({ group }) => {
      const concepts = group
        ? TOOLKIT_CONCEPTS.filter((c) => c.group === group)
        : TOOLKIT_CONCEPTS;
      const lines = concepts.map(
        (c) => `${c.id.padEnd(25)} ${c.group.padEnd(12)} ${c.name}`,
      );
      return text(
        [
          `可用工具包概念共 ${concepts.length} 個（全部 ${TOOLKIT_CONCEPTS.length} 個）：`,
          "ID                       群組         名稱",
          "─".repeat(50),
          ...lines,
          "",
          "使用 toolkit_show <conceptId> 查看 drill 內容",
        ].join("\n"),
      );
    },
  });

  server.register({
    name: "toolkit_show",
    description:
      "顯示特定超 IOI 工具包的 drill 清單與內容。可選 mode 過濾 drill 類型。",
    inputSchema: z.object({
      conceptId: z
        .string()
        .describe("概念 ID，如 A01-fft-ntt、D01-dinic。用 toolkit_list 查看所有 ID。"),
      mode: z
        .enum(["fill", "trace", "debug", "all"])
        .optional()
        .default("all")
        .describe("過濾 drill 類型"),
    }),
    handler: async ({ conceptId, mode }) => {
      const drills = getToolkitDrillsByConcept(conceptId);
      if (drills.length === 0)
        return text(
          `找不到概念 ${conceptId}。用 toolkit_list 查看所有可用的概念 ID。`,
        );

      const concept = TOOLKIT_CONCEPTS.find((c) => c.id === conceptId);
      const header =
        `工具包: ${concept?.name ?? conceptId} (${concept?.group ?? ""}) — ${drills.length} 個 drill` +
        "\n" +
        "─".repeat(50) +
        "\n";

      const filtered = mode === "all" ? drills : drills.filter((d) => d.type === mode);

      const lines = filtered.map((d, i) => {
        let s = `[${i + 1}/${filtered.length}] ${d.type.toUpperCase().padEnd(8)} ${"id" in d ? d.id : ""}\n`;
        if ("subskill" in d && d.subskill) s += `    技能: ${d.subskill}\n`;
        if ("difficulty" in d) s += `    難度: ${d.difficulty}/5\n`;
        if ("problems" in d && Array.isArray(d.problems) && d.problems.length > 0) {
          s += `    練習題: ${d.problems.join(", ")}\n`;
        }
        return s;
      });

      return text(header + lines.join("\n"));
    },
  });

  server.register({
    name: "toolkit_drill_count",
    description: "回傳工具包累計 drill 統計",
    inputSchema: z.object({}),
    handler: async () => {
      const byType: Record<string, number> = {};
      for (const d of TOOLKIT_DRILLS) {
        byType[d.type] = (byType[d.type] ?? 0) + 1;
      }
      const typeSummary = Object.entries(byType)
        .map(([t, c]) => `${t}: ${c}`)
        .join(", ");
      return text(
        [
          `總 drill 數: ${TOOLKIT_DRILLS.length}`,
          `總概念數: ${TOOLKIT_CONCEPTS.length}`,
          `按類型: ${typeSummary}`,
          `按群組: ${[...new Set(TOOLKIT_CONCEPTS.map((c) => c.group))].join(", ")}`,
        ].join("\n"),
      );
    },
  });

  server.register({
    name: "toolkit_lesson",
    description:
      "超 IOI 工具包教學文章。回傳指定概念的教學內容（含動機/推導/code walkthrough/drill 提示），" +
      "每篇文章分成多節，教師應逐節引導學生。每節都有學習理論參數（BKT weight, IRT difficulty），" +
      "教師做完該節 drill 後應呼叫 engine_bkt_update 更新熟練度。",
    inputSchema: z.object({
      conceptId: z.string().describe("概念 ID，如 A01-fft-ntt。用 toolkit_list 查看。"),
      sectionId: z.string().optional().describe("指定節 ID，不給則回傳目錄+第一節"),
      mode: z
        .enum(["start", "section"])
        .optional()
        .default("start")
        .describe(
          "start=回傳全部 section 清單+第一節內容；section=回傳特定節",
        ),
    }),
    handler: async ({ conceptId, sectionId, mode }) => {
      const article = getArticle(conceptId);
      if (!article)
        return text(
          [
            `找不到概念 ${conceptId} 的教學文章。可用 toolkit_list 查看所有概念。`,
            `目前有文章的: ${ARTICLES.map((a) => a.metadata.id).join(", ")}`,
          ].join("\n"),
        );

      const { metadata, sections } = article;

      if (sections.length === 0)
        return text(`概念 ${conceptId} 的教學文章無任何小節。`);

      if (mode === "start") {
        const toc = sections
          .map(
            (s, i) =>
              `  ${i + 1}. [${s.id}] ${s.title} (${s.theory.estimatedMinutes}分, BKT=${s.theory.bktWeight}, IRT=${s.theory.irtDifficulty})`,
          )
          .join("\n");

        const first = sections[0]!;
        return text(
          [
            "╔═══════════════════════════════════════════",
            `║  ${metadata.title}`,
            `║  群組: ${metadata.group}  │  預估: ${metadata.estimatedTotalMinutes}分`,
            `║  前置: ${metadata.prerequisites.join("、") || "無"}`,
            `║  BKT 預設: pT=${metadata.bktDefault.pT} pG=${metadata.bktDefault.pG} pS=${metadata.bktDefault.pS}`,
            `║  文章數: ${ARTICLES.length} 篇`,
            "╚═══════════════════════════════════════════",
            "",
            "📖 目錄：",
            toc,
            "",
            "─".repeat(50),
            "",
            first.content,
            "",
            "─".repeat(50),
            `📌 學習理論: BKT weight=${first.theory.bktWeight}, IRT diff=${first.theory.irtDifficulty}`,
            `📌 預計 ${first.theory.estimatedMinutes} 分鐘`,
            first.theory.drillRefs.length > 0
              ? `📌 本節 drill: ${first.theory.drillRefs.map((d) => `toolkit_show ${conceptId} → ${d.drillId}`).join(", ")}`
              : "",
            `📌 檢核: ${first.theory.evidence}`,
            "",
            `使用 toolkit_lesson conceptId=${conceptId} sectionId=<節ID> mode=section 看下一節。`,
          ]
            .filter(Boolean)
            .join("\n"),
        );
      }

      const section = sections.find((s) => s.id === sectionId);
      if (!section)
        return text(
          `找不到節 ${sectionId}。可用節 ID：\n${sections.map((s) => `  ${s.id} — ${s.title}`).join("\n")}`,
        );

      return text(
        [
          `📖 ${section.title}`,
          "─".repeat(50),
          section.content,
          "",
          "─".repeat(50),
          `📌 學習理論: BKT weight=${section.theory.bktWeight}, IRT diff=${section.theory.irtDifficulty}`,
          `📌 預計 ${section.theory.estimatedMinutes} 分鐘`,
          section.theory.drillRefs.length > 0
            ? `📌 本節 drill: ${section.theory.drillRefs.map((d) => `${d.mode}/${d.drillId}`).join(", ")}`
            : "",
          `📌 檢核: ${section.theory.evidence}`,
        ].join("\n"),
      );
    },
  });
}
