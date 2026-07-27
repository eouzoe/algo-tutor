/**
 * Beyond-IOI Toolkit 統一索引
 *
 * 匯集所有工具包模組的 drill content + 教學文章，
 * 加上 type discriminator 供 drill engine 消費。
 */

import type { FillInDrill, TraceDrill, DebugDrill, AnyDrill } from "../../packages/engine/src/drill.ts"
import { DrillType } from "../../packages/engine/src/drill.ts"
import type { ToolkitArticle } from "./article-types.ts"

// ── 教學文章 ──────────────────────────────────────────

import nttArticle from "./articles/A01-fft-ntt-article.ts"
import dinicArticle from "./articles/D01-dinic-article.ts"
import samArticle from "./articles/G01-sam-article.ts"

export const ARTICLES: ToolkitArticle[] = [nttArticle, dinicArticle, samArticle]

export function getArticle(conceptId: string): ToolkitArticle | undefined {
  return ARTICLES.find(a => a.metadata.id === conceptId)
}

// ── 模組導入 ──────────────────────────────────────────

import { fillDrills as _fftFill, traceDrills as _fftTrace, debugDrills as _fftDebug } from "./A01-fft-ntt.ts"
import { fillDrills as _gfFill, traceDrills as _gfTrace } from "./A02-generating-functions.ts"
import { fillDrills as _bmFill, traceDrills as _bmTrace, debugDrills as _bmDebug } from "./A03-bm-kitamasa.ts"
import { fillDrills as _mobiusFill, traceDrills as _mobiusTrace, debugDrills as _mobiusDebug } from "./B01-mobius.ts"
import { fillDrills as _lucasFill, traceDrills as _lucasTrace } from "./B02-lucas-crt.ts"
import { fillDrills as _mrFill } from "./B03-mr-pollard-rho.ts"
import { fillDrills as _dinicFill, traceDrills as _dinicTrace, debugDrills as _dinicDebug } from "./D01-dinic.ts"
import { fillDrills as _chtFill, traceDrills as _chtTrace } from "./E01-cht.ts"
import { fillDrills as _aliensFill, traceDrills as _aliensTrace, debugDrills as _aliensDebug } from "./E03-aliens.ts"
import { fillDrills as _plugFill, traceDrills as _plugTrace } from "./E04-plug-dp.ts"
import { fillDrills as _beatsFill } from "./C01-segment-tree-beats.ts"
import { fillDrills as _waveletFill, traceDrills as _waveletTrace } from "./C03-wavelet-matrix.ts"
import { fillDrills as _samFill, traceDrills as _samTrace } from "./G01-sam.ts"
import { fillDrills as _saFill, traceDrills as _saTrace } from "./G03-suffix-array.ts"

// ── 加上 type discriminator ───────────────────────────

function toFill(o: any): FillInDrill { return { ...o, type: DrillType.Fill } }
function toTrace(o: any): TraceDrill { return { ...o, type: DrillType.Trace } }
function toDebug(o: any): DebugDrill { return { ...o, type: DrillType.Debug } }

const allFill: FillInDrill[] = [
  ..._fftFill.map(toFill), ..._gfFill.map(toFill),
  ..._bmFill.map(toFill), ..._mobiusFill.map(toFill),
  ..._lucasFill.map(toFill), ..._mrFill.map(toFill),
  ..._dinicFill.map(toFill), ..._chtFill.map(toFill),
  ..._aliensFill.map(toFill), ..._plugFill.map(toFill),
  ..._beatsFill.map(toFill), ..._waveletFill.map(toFill),
  ..._samFill.map(toFill), ..._saFill.map(toFill),
]

const allTrace: TraceDrill[] = [
  ..._fftTrace.map(toTrace), ..._gfTrace.map(toTrace),
  ..._bmTrace.map(toTrace), ..._mobiusTrace.map(toTrace),
  ..._lucasTrace.map(toTrace), ..._dinicTrace.map(toTrace),
  ..._chtTrace.map(toTrace), ..._aliensTrace.map(toTrace),
  ..._plugTrace.map(toTrace), ..._waveletTrace.map(toTrace),
  ..._samTrace.map(toTrace), ..._saTrace.map(toTrace),
]

const allDebug: DebugDrill[] = [
  ..._fftDebug.map(toDebug), ..._bmDebug.map(toDebug),
  ..._mobiusDebug.map(toDebug), ..._dinicDebug.map(toDebug),
  ..._aliensDebug.map(toDebug),
]

export const TOOLKIT_DRILLS: AnyDrill[] = [...allFill, ...allTrace, ...allDebug]

export function getToolkitDrillsByConcept(conceptId: string): AnyDrill[] {
  return TOOLKIT_DRILLS.filter(d => d.conceptId === conceptId)
}

export function getToolkitDrillsBySubskill(subskill: string): AnyDrill[] {
  return TOOLKIT_DRILLS.filter(d => "subskill" in d && d.subskill === subskill)
}

export const TOOLKIT_CONCEPTS = [
  { id: "A01-fft-ntt", name: "FFT / NTT", group: "代數工具" },
  { id: "A02-generating-functions", name: "生成函數", group: "代數工具" },
  { id: "A03-bm-kitamasa", name: "BM + Kitamasa", group: "代數工具" },
  { id: "B01-mobius", name: "莫比烏斯反演", group: "數論深度" },
  { id: "B02-lucas-crt", name: "exCRT / Lucas", group: "數論深度" },
  { id: "B03-mr-pollard-rho", name: "MR + Pollard-Rho", group: "數論深度" },
  { id: "C01-segment-tree-beats", name: "線段樹 Beats", group: "資料結構" },
  { id: "C03-wavelet-matrix", name: "Wavelet Matrix", group: "資料結構" },
  { id: "D01-dinic", name: "Dinic 最大流", group: "圖論進階" },
  { id: "E01-cht", name: "凸包優化 CHT", group: "DP 優化" },
  { id: "E03-aliens", name: "Aliens Trick", group: "DP 優化" },
  { id: "E04-plug-dp", name: "Plug DP", group: "DP 優化" },
  { id: "G01-sam", name: "後綴自動機 SAM", group: "字串進階" },
  { id: "G03-suffix-array", name: "後綴陣列 SA", group: "字串進階" },
]

export function toolkitDrillCount(): number {
  return TOOLKIT_DRILLS.length
}
