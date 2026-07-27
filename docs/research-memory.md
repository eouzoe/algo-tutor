# Research Memory

## Round 1 — 5-Layer Model Foundations

Completed 2026-07-29. Searched: KST, BKT, IRT, FSRS, graph-based knowledge models.

### Key Findings
- KST (Doignon & Falmagne 1985) is the mathematical foundation for prerequisite-based knowledge spaces
- Learning spaces (Falmagne & Doignon 2011) add transitions between states
- Eppstein (2008) introduces efficient learning sequences representation (antimatroid basis)
- BKT (Corbett & Anderson 1995) provides Bayesian per-concept mastery tracking
- IRT (Birnbaum 1968, Lord & Novick) gives item-level difficulty/discrimination
- FSRS (Ye et al. 2022-2023) is the current state-of-the-art for spaced repetition (DSR model)
- Ausubel's obliterative subsumption: without anchoring knowledge, new info decays rapidly
- KnowLP (Cheng et al. 2025) shows GraphRAG for dual knowledge structure graphs
- ALEKS (Falmagne et al. 2006) is the canonical KST implementation
- Context-aware BKT (Baker et al. 2008) improves P(G)/P(S) estimates
- DKT (Piech et al. 2015) uses neural networks for knowledge tracing
- LLM bias (Fiedler 2026, SURE 2026) informs LLM-as-judge design

### Papers Saved
| Paper | Size |
|-------|------|
| Corbett & Anderson (1995). Knowledge Tracing. *User Modeling*. | 1.5 MB |
| Burton (1981). Diagnosing Bugs in a Simple Procedural Skill. | 1.5 MB |
| Atkinson et al. (2000). Learning from Examples. *Review of Educational Research*. | 2.1 MB |
| Baker et al. (2008). Contextual Slip and Guess BKT. | 122 KB |
| Piech et al. (2015). Deep Knowledge Tracing. *NeurIPS*. | 616 KB |
| Eppstein (2008). Learning Sequences. arXiv. | 446 KB |

---

## Round 2 — Worked Example & Fading Research

Completed 2026-07-29. Searched: worked examples, fading, expertise reversal, backward fading, self-explanation.

### Key Findings
- Worked examples superior to problem-solving for novices (Sweller 1988, CLT foundation)
- Expertise reversal effect (Kalyuga et al. 2003): what helps novices hurts experts
- Backward fading (Renkl & Atkinson 2003): remove steps from end-first
- Adaptive fading (Salden et al. 2010): dual threshold (.5 and .7) for transitions
- Adaptive fading beats fixed fading and pure problem-solving on delayed transfer
- Guidance fading effect (Renkl, Atkinson, Maier, Staley 2002)
- ICAP framework (Chi & Wylie 2014): Interactive > Constructive > Active > Passive
- Self-explanation prompts improve far transfer when combined with fading
- Desirable difficulties (Bjork & Bjork 1992, 2011): harder now = better later
- Chen (2025): worked examples with explanation types in programming education
- Germane load redefinition (late CLT): not a separate resource, released by intrinsic load management (Sweller et al. 2019)

### Papers Saved
| Paper | Size |
|-------|------|
| Sweller et al. (2019). CLT 20 Years Later. *Ed. Psych. Review*. | 897 KB |
| Kalyuga et al. (2003). Expertise Reversal Effect. *Educational Psychologist*. | 53 KB |
| Kalyuga (2007). Expertise Reversal Implications. *Ed. Psych. Review*. | 377 KB |
| Salden et al. (2008). Synergistic Worked Examples? *ICLS*. | 157 KB |
| Salden et al. (2010). Expertise Reversal & Adaptive Fading. *Instructional Science*. | 305 KB |
| Salden (2010). Adaptive Fading PhD work (variant). | 333 KB |
| Renkl & Atkinson (2003). Example to Problem Transition. *Educational Psychologist*. | 46 KB |
| Renkl, Atkinson, Maier, Staley (2002). Smooth Transitions. | 46 KB |
| Chi & Wylie (2014). ICAP Framework. *Educational Psychologist*. | 524 KB |
| Chi et al. (2018). Translating ICAP into Practice. *Cognitive Science*. | 637 KB |

---

## Round 3 — Newer Studies Trace Forward

Traced 2026-07-29. Key findings from forward search:

- **Sweller (2024)** — "Cognitive Load Theory and Curriculum Design" in *Curriculum Perspectives*: CLT applied to whole-curriculum mapping, not just isolated lessons
- **Chi et al. (2018)** — ICAP translation paper (PDF saved): practical classroom protocols for each engagement mode
- **FSRS-5 (2024)** — Latest Anki-native spaced repetition model; introduced `difficulty` as learnable parameter, improved retention prediction over FSRS-4.5. Documented at diane.app/fsrs.

### Papers Saved
| Paper | Size |
|-------|------|
| chi2018-translating-ICAP-practice.pdf | 637 KB |

---

## Paper Inventory Summary — NOV 2026

**Total saved: 16 PDFs** (9.0 MB)

| # | Short Ref | File | Size |
|---|-----------|------|------|
| 1 | Atkinson et al. (2000) Learning from Examples | `atkinson2000-learning-from-examples.pdf` | 2.1 MB |
| 2 | Corbett & Anderson (1995) Knowledge Tracing | `Corbett_Anderson_1995_Knowledge_Tracing.pdf` | 1.5 MB |
| 3 | Burton (1981) Diagnosing Bugs | `Burton_1981_Diagnosing_Bugs_Simple_Procedural_Skill.pdf` | 1.5 MB |
| 4 | Sweller et al. (2019) CLT 20 Years | `sweller-2019-CLT-20-years.pdf` | 897 KB |
| 5 | Chi et al. (2018) ICAP Translation | `chi2018-translating-ICAP-practice.pdf` | 637 KB |
| 6 | Piech et al. (2015) Deep Knowledge Tracing | `Piech_et_al_2015_Deep_Knowledge_Tracing.pdf` | 616 KB |
| 7 | Eppstein (2008) Learning Sequences | `eppstein2008-learning-sequences.pdf` | 446 KB |
| 8 | Kalyuga (2007) Expertise Reversal Implications | `kalyuga-2007-expertise-reversal-implications.pdf` | 377 KB |
| 9 | Salden (2010) Adaptive Fading (PhD variant) | `salden-2010-expertise-reversal-adaptive-fading.pdf` | 333 KB |
| 10 | Salden et al. (2010) Expertise Reversal | `salden2010-expertise-reversal.pdf` | 305 KB |
| 11 | Salden et al. (2008) Synergistic Worked Examples | `salden2008-adaptively-fading-examples.pdf` | 157 KB |
| 12 | Baker et al. (2008) Contextual Slip & Guess BKT | `Baker_et_al_2008_Contextual_Slip_Guess_BKT.pdf` | 122 KB |
| 13 | Kalyuga et al. (2003) Expertise Reversal | `kalyuga-2003-expertise-reversal-effect.pdf` | 53 KB |
| 14 | Renkl & Atkinson (2003) Example→Problem | `renkl-atkinson-2003-transition-example-problem.pdf` | 46 KB |
| 15 | Renkl et al. (2002) Smooth Transitions | `renkl2002-from-example-to-problem-smooth.pdf` | 46 KB |

### Papers Not Saved (paywalled/unavailable; sufficient via citations)
- Doignon & Falmagne (1985, 1999) — Springer/ScienceDirect
- Falmagne & Doignon (2011) *Learning Spaces* — Springer
- Ausubel (1960, 1968) — APA paywall
- Sweller (1988) CLT original — Wiley paywall
- Ye et al. (2022, 2023, 2024) FSRS — ACM/IEEE paywall, spec at diane.app
- Woolf et al. (2009) Affect-aware tutors — Springer
- Bjork (1994) Desirable Difficulties — APA paywall
- Chen (2025) Worked examples in programming — ACM paywall
- Bandura (any self-efficacy) — APA paywall
- Fiedler (2026) — paywall
- SURE (2026) — paywall
