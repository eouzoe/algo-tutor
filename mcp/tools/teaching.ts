// algo-tutor teaching flow tools — in-class quiz, guided practice, blank problem, chapter exam, feynman.

import { McpServer } from "../server.ts";
import { z } from "zod";
import { text } from "./util.ts";
import { problemPatterns } from "../../data/problem-patterns.json";

export function registerTeachingTools(server: McpServer): void {
  // ── In-class Quiz ──────────────────────────────────────────────
  server.register({
    name: "in_class_quiz",
    description:
      "Generate an in-class quiz problem immediately after a lecture. Tests the specific concept just taught with guidance.",
    inputSchema: z.object({
      concept_id: z.string().describe("Concept ID (e.g., 'mt_u1_skeleton')"),
      mode: z.enum(["learn", "fill", "problem"]).default("problem"),
    }),
    handler: async ({ concept_id, mode }) => {
      const patterns = problemPatterns.patterns;
      // Find matching pattern or use generic
      const pattern = Object.values(patterns).find((p) =>
        p.concepts.includes(concept_id.replace("mt_u1_", "").replace("mt_u2_", ""))
      ) || patterns.io_basic;

      const quiz = {
        mode,
        concept: concept_id,
        problem: generateProblemFromPattern(pattern, "easy"),
        guidance: mode === "learn" ? "Follow the syntax template and type it out." :
          mode === "fill" ? "Fill in the blanks to complete the code." :
          "Solve this problem using the concept just taught.",
      };

      return text(JSON.stringify(quiz, null, 2));
    },
  });

  // ── Guided Practice ────────────────────────────────────────────
  server.register({
    name: "guided_practice",
    description:
      "Generate a guided practice problem with partial scaffolding. Student works with hints available.",
    inputSchema: z.object({
      unit_id: z.number().describe("Unit ID (1-4 for Phase 0)"),
      difficulty: z.enum(["easy", "medium"]).default("medium"),
    }),
    handler: async ({ unit_id, difficulty }) => {
      const patterns = problemPatterns.patterns;
      const patternKeys = Object.keys(patterns);
      const pattern = patterns[patternKeys[unit_id % patternKeys.length]];

      const problem = generateProblemFromPattern(pattern, difficulty);
      const hints = generateHints(pattern, 3);

      return text(JSON.stringify({
        type: "guided_practice",
        unit: unit_id,
        problem,
        hints,
        scaffolding: "Hints are available but limited. Try without them first.",
      }, null, 2));
    },
  });

  // ── Blank Problem ──────────────────────────────────────────────
  server.register({
    name: "blank_problem",
    description:
      "Generate a blank problem that simulates real contest conditions. No guidance, no hints.",
    inputSchema: z.object({
      unit_id: z.number().describe("Unit ID"),
      difficulty: z.enum(["medium", "hard"]).default("medium"),
    }),
    handler: async ({ unit_id, difficulty }) => {
      const patterns = problemPatterns.patterns;
      const patternKeys = Object.keys(patterns);
      const pattern = patterns[patternKeys[unit_id % patternKeys.length]];

      const problem = generateProblemFromPattern(pattern, difficulty);

      return text(JSON.stringify({
        type: "blank_problem",
        unit: unit_id,
        problem,
        rules: [
          "No hints available",
          "Time limit: 30 minutes",
          "Write from blank file",
          "Test with provided cases",
        ],
      }, null, 2));
    },
  });

  // ── Chapter Exam ───────────────────────────────────────────────
  server.register({
    name: "chapter_exam",
    description:
      "Generate a chapter exam with mixed topics (interleaved practice). Records failures for review.",
    inputSchema: z.object({
      chapter_id: z.number().describe("Chapter ID (groups of units)"),
      problem_count: z.number().default(5),
    }),
    handler: async ({ chapter_id, problem_count }) => {
      const patterns = problemPatterns.patterns;
      const patternKeys = Object.keys(patterns);

      // Select mixed patterns for interleaved practice
      const selectedPatterns = [];
      for (let i = 0; i < problem_count; i++) {
        const idx = (chapter_id + i) % patternKeys.length;
        selectedPatterns.push(patterns[patternKeys[idx]]);
      }

      const problems = selectedPatterns.map((p, i) => ({
        id: `exam_${chapter_id}_${i + 1}`,
        ...generateProblemFromPattern(p, "medium"),
      }));

      return text(JSON.stringify({
        type: "chapter_exam",
        chapter: chapter_id,
        problems,
        rules: [
          "Mixed topics from entire chapter",
          "Time limit: 90 minutes",
          "No hints available",
          "Failed problems will be saved for review",
        ],
        after_exam: "Use feynman_practice to explain your solutions verbally.",
      }, null, 2));
    },
  });

  // ── Feynman Practice ───────────────────────────────────────────
  server.register({
    name: "feynman_practice",
    description:
      "Practice Feynman technique - explain solution verbally. LLM tutor demonstrates first, then student tries.",
    inputSchema: z.object({
      problem_id: z.string().describe("Problem ID to explain"),
      student_explanation: z.string().optional().describe("Student's verbal explanation"),
    }),
    handler: async ({ problem_id, student_explanation }) => {
      if (!student_explanation) {
        // Tutor demonstrates
        return text(JSON.stringify({
          type: "feynman_demo",
          problem: problem_id,
          demo: {
            step1: "Restate the problem in one sentence",
            step2: "Explain the approach/algorithm",
            step3: "Walk through the solution step by step",
            step4: "Identify key insights and why they work",
            step5: "Discuss time/space complexity",
          },
          instruction: "Now you try. Explain the solution to this problem as if teaching someone else.",
        }, null, 2));
      } else {
        // Evaluate student's explanation
        return text(JSON.stringify({
          type: "feynman_feedback",
          problem: problem_id,
          evaluation: {
            clarity: "Is the explanation clear and structured?",
            accuracy: "Are the concepts correct?",
            completeness: "Are all steps covered?",
            insights: "Does it include why the approach works?",
          },
          feedback: "Good start! Focus on explaining WHY each step works, not just WHAT to do.",
        }, null, 2));
      }
    },
  });

  // ── Problem Analysis ───────────────────────────────────────────
  server.register({
    name: "problem_analysis",
    description:
      "Analyze a problem with the student - read, identify patterns, plan solution.",
    inputSchema: z.object({
      problem_id: z.string().describe("Problem ID to analyze"),
      student_input: z.string().optional().describe("Student's initial thoughts"),
    }),
    handler: async ({ problem_id, student_input }) => {
      const guide = problemPatterns.analysis_guide;

      if (!student_input) {
        // Start analysis
        return text(JSON.stringify({
          type: "analysis_start",
          problem: problem_id,
          steps: guide.steps.map((s) => ({
            step: s.step,
            description: s.description,
            questions: s.questions,
          })),
          instruction: "Let's analyze this problem together. I'll guide you through each step.",
        }, null, 2));
      } else {
        // Continue analysis
        return text(JSON.stringify({
          type: "analysis_continue",
          problem: problem_id,
          student_thoughts: student_input,
          next_steps: [
            "What patterns do you recognize?",
            "What data structures might help?",
            "What's the brute force approach?",
            "How can we optimize?",
          ],
        }, null, 2));
      }
    },
  });
}

// ── Helpers ─────────────────────────────────────────────────────

function generateProblemFromPattern(
  pattern: { name: string; template: { statement: string; constraints: string; input_format: string; output_format: string }; variations: string[] },
  difficulty: "easy" | "medium" | "hard",
) {
  const variation = pattern.variations[Math.floor(Math.random() * pattern.variations.length)];
  const n = difficulty === "easy" ? "10" : difficulty === "medium" ? "10^5" : "10^6";

  return {
    name: variation,
    statement: pattern.template.statement
      .replace("{input_description}", `n integers (n ≤ ${n})`)
      .replace("{output_description}", "the result"),
    constraints: pattern.template.constraints.replace("{n}", "n").replace("{max_n}", n),
    input_format: pattern.template.input_format,
    output_format: pattern.template.output_format,
    difficulty,
  };
}

function generateHints(
  pattern: { concepts: string[] },
  count: number,
): string[] {
  const hints: string[] = [];
  for (let i = 0; i < Math.min(count, pattern.concepts.length); i++) {
    hints.push(`Consider using ${pattern.concepts[i]}`);
  }
  hints.push("Think about the constraints - what complexity is needed?");
  return hints;
}
