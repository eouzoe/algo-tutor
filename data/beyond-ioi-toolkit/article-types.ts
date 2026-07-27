/**
 * Toolkit Article — 超 IOI 教學文章格式
 *
 * 每一篇文章對應一個 toolki 概念，將 drill 嵌入教學流程，
 * 並標註學習理論參數供 engine 消費。
 */

export interface ArticleDrillRef {
  drillId: string
  mode: "fill" | "trace" | "debug"
  subskill: string
}

export interface ArticleSectionTheory {
  bktWeight: number
  irtDifficulty: number
  estimatedMinutes: number
  prerequisites: string[]
  drillRefs: ArticleDrillRef[]
  evidence: string
  fsrsInitialEF: number
}

export interface ArticleSection {
  id: string
  title: string
  content: string
  theory: ArticleSectionTheory
}

export interface ArticleMetadata {
  id: string
  title: string
  group: string
  prerequisites: string[]
  estimatedTotalMinutes: number
  bktDefault: { pT: number; pG: number; pS: number }
}

export interface ToolkitArticle {
  metadata: ArticleMetadata
  sections: ArticleSection[]
}

export function getArticleSections(article: ToolkitArticle, sectionId?: string): ArticleSection[] {
  if (!sectionId) return article.sections
  const idx = article.sections.findIndex(s => s.id === sectionId)
  if (idx === -1) return []
  return article.sections.slice(0, idx + 1)
}
