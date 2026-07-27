# Cognitive Science & Educational Psychology Foundations for CP Training

---

## Topic 1: Constructivism — Why Knowledge Needs Prerequisites

### Key Researchers & Years
- **Jean Piaget** (1952, 1976) — Schema theory, assimilation & accommodation
- **David Ausubel** (1963, 1968, 2000) — Meaningful learning theory, advance organizers
- **Lev Vygotsky** (1978) — Zone of Proximal Development, social constructivism

### Core Findings

**Piaget — Schemas, Assimilation, Accommodation**
- Knowledge is not passively absorbed; learners actively construct understanding by interacting with their environment.
- **Schema**: mental framework for organizing information (Piaget, 1952). New experiences are filtered through existing schemas.
- **Assimilation**: fitting new info into existing schemas without changing them (e.g., child calls a cat "dog" because both have four legs).
- **Accommodation**: modifying schemas when new info doesn't fit (e.g., child creates a separate "cat" schema).
- **Equilibration**: the dynamic balance between assimilation and accommodation that drives cognitive growth.

**Ausubel — Meaningful Learning**
- "The most important single factor influencing learning is what the learner already knows. Ascertain this and teach him accordingly." (Ausubel, 1968, p. vi)
- **Meaningful learning** occurs when new information is substantively integrated with existing cognitive structures (subsumption). Rote learning (memorization without connection) is fragile.
- **Advance organizers**: introductory material at a higher abstraction level that bridges prior knowledge with new content (Ausubel, 1968).
- A 2023 review (Current Psychology) notes modern neuroscience challenges Ausubel's static view of memory — recollection is non-representational and dynamically reconstructed, making pre-assessment harder than Ausubel assumed.

**Vygotsky — ZPD**
- Learning is fundamentally social; what a child can do with assistance today becomes what they can do independently tomorrow.
- The "zone of proximal development" is the distance between actual developmental level (independent problem solving) and potential development (under adult guidance or peer collaboration).

### Why Disconnected Facts Fail
New information must anchor to existing knowledge structures. Without prerequisites, learners resort to rote memorization — which lacks the interconnectedness needed for transfer, flexible application, or long-term retention. A student who hasn't internalized loops cannot meaningfully learn dynamic programming.

### Practical Application for CP Training
- **Pre-assessment**: before introducing a topic (e.g., DP), verify prerequisite schemas (recursion, memoization patterns).
- **Structured prerequisites**: each problem set should explicitly assume and verify prior knowledge.
- **Bridge concepts**: use analogies (advance organizers) that connect known algorithms to new ones before teaching.

### One Limitation
Constructivism under-speecifies *how* to ascertain what the learner knows with precision. Ausubel's approach assumes stable, inspectable memory structures — modern neuroscience shows memory is non-representational and reconstructed each time, making pre-assessment fundamentally noisy.

### Sources
- https://www.simplypsychology.org/piaget.html
- https://link.springer.com/article/10.1007/s12144-023-04440-4
- https://www.learning-theories.org/doku.php?id=learning_theories%3Aassimilation_theory

---

## Topic 2: Zone of Proximal Development (ZPD) and Scaffolding

### Key Researchers & Years
- **Lev Vygotsky** (1978) — *Mind in Society*, ZPD
- **David Wood, Jerome Bruner, Gail Ross** (1976) — Scaffolding (*Journal of Child Psychology and Psychiatry*, 17(2), 89-100)
- **Peter Smagorinsky** (2018) — Re-translation of ZPD as "zone of next development"

### Core Findings

**Vygotsky's ZPD (1978)**
- Defined as "the distance between the actual developmental level as determined by independent problem solving and the level of potential development as determined through problem solving under adult guidance or in collaboration with more capable peers."
- Instruction should lead development — teaching should target what the learner cannot yet do alone but can do with support.
- The ZPD is about *long-term developmental transformation*, not short-term task completion.

**Wood, Bruner & Ross — Scaffolding (1976)**
- Experimental study: 3-5 year-old children taught to build a pyramid from interlocking blocks.
- Scaffolding functions: (1) **Recruitment** — enlist interest, (2) **Reduction in degrees of freedom** — simplify the task, (3) **Direction maintenance** — keep learner on track, (4) **Marking critical features** — highlight discrepancies, (5) **Frustration control**, (6) **Demonstration** — idealized modeling.
- Key insight: scaffolding *transfers control* to the learner over time — 5-year-olds performed significantly more operations per intervention than 3-year-olds.

**Important Clarification**
- Smagorinsky (2018) and others argue scaffolding and ZPD have been incorrectly conflated. Scaffolding (Wood et al., 1976) is a short-term teaching process; ZPD (Vygotsky, 1978) is a long-term developmental concept. True ZPD concerns "the whole person's development over time, not just skill acquisition in a single session."

**Goldilocks Principle**
Problems must be neither too easy (nothing to learn) nor too hard (ZPD exceeded, cognitive overload). The just-right difficulty is where the learner can succeed *with support* but cannot yet do independently.

### Practical Application for CP Training
- **Rating bands**: select problems at rating +200-400 above current level — the ZPD. Too far above (rating+600) is "frustration zone"; too close (rating+0) is "comfort zone".
- **Scaffolding in hints**: tiered hint system, each revealing one more level of abstraction, progressively transferring control.
- **Contest simulation**: initial practice with solved examples (worked), then guided partial solution, then full contest pressure. Fade scaffolding over time.

### One Limitation
The ZPD is notoriously difficult to operationalize with precision. The boundary between actual and potential development is fuzzy; a computer system cannot perfectly determine it for every learner without frequent, fine-grained assessment.

### Sources
- Vygotsky, L.S. (1978). *Mind in Society*. Harvard University Press. https://home.fau.edu/musgrove/web/vygotsky1978.pdf
- Wood, D., Bruner, J.S., & Ross, G. (1976). The role of tutoring in problem solving. https://doi.org/10.1111/j.1469-7610.1976.tb00381.x
- Smagorinsky, P. (2018). Deconflating the ZPD and instructional scaffolding. https://doi.org/10.1016/j.lcsi.2017.10.009

---

## Topic 3: Desirable Difficulties and Retrieval Practice

### Key Researchers & Years
- **Robert A. Bjork & Elizabeth L. Bjork** (1992) — *A New Theory of Disuse* (storage strength vs. retrieval strength)
- **Robert A. Bjork** (1994) — Coins term "desirable difficulties"
- **Bjork & Bjork** (2011) — *Making things hard on yourself, but in a good way*
- **Bjork & Bjork** (2020) — *Desirable difficulties in theory and practice* (JARMAC, 9(4), 475-479)

### Core Findings

**The New Theory of Disuse (Bjork & Bjork, 1992)**
Two independent strengths govern memory:
- **Storage strength**: how well learned an item is (how interconnected it is with related items). Does not decrease; accumulates.
- **Retrieval strength**: current ease of access to an item. Rapidly decays without use.
- Critical insight: **the higher the current retrieval strength, the smaller the gain in storage strength** from restudying. Conversely, forgetting (loss of retrieval strength) creates opportunity to increase storage strength.

**Desirable Difficulties (Bjork, 1994; Bjork & Bjork, 2011)**
Manipulations that impede performance *during* training but enhance long-term retention and transfer:
1. **Spacing** (distributed > massed practice) — one of the most robust effects in learning research. Bahrick (1979): 30-day spacing yielded 72% recall vs. 33% for massed.
2. **Interleaving** (mixed topics > blocked practice) — Shea & Morgan (1979): random practice schedules produced worse acquisition but dramatically better retention.
3. **Testing effect** (retrieval practice > re-study) — Roediger & Karpicke (2006): test-enhanced learning. Tests as *learning events*, not just assessment.
4. **Variation** (varying practice conditions > constant) — Smith, Glenberg & Bjork (1978): studying in two different rooms > same room twice.
5. **Reduced feedback** (intermittent > continuous).

**Undesirable vs. Desirable** (Bjork & Bjork, 2020)
- A difficulty is *desirable* only when the learner has the background knowledge to respond successfully. Without prerequisites, it becomes undesirable (frustration/overload).
- The optimal difficulty level varies with the learner's prior knowledge.

**Why Difficulty Helps**
Difficulty during learning forces more elaborate encoding and varied retrieval processes — what Battig (1979) called "contextual interference" and Schmidt & Bjork (1992) called "transfer-appropriate processing." These processes match the demands of real-world retrieval.

### Practical Application for CP Training
- **Spaced repetition**: review topics on expanding intervals (1, 3, 7, 21 days) rather than massed blocks.
- **Interleaved problem sets**: mix DP + graphs + greedy within a single session instead of 50 DP problems in a row.
- **Active retrieval**: use blank-paper recall (write everything you know about segment trees) before re-reading notes.
- **Delayed feedback**: let students struggle on a problem before revealing the solution. Immediate feedback feels better but produces weaker long-term learning.

### One Limitation
Learners *feel* less competent under desirable difficulties and prefer blocked, massed practice. This metacognitive illusion (the "illusion of knowing") makes it hard to self-regulate — students abandon effective strategies because they feel unproductive. A system must override learner preferences.

### Sources
- Bjork, R.A. & Bjork, E.L. (1992). A new theory of disuse. https://gwern.net/doc/psychology/spaced-repetition/1992-bjork.pdf
- Bjork, E.L. & Bjork, R.A. (2011). Making things hard on yourself... https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/04/EBjork_RBjork_2011.pdf
- Bjork, R.A. & Bjork, E.L. (2020). Desirable difficulties in theory and practice. https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2021/01/RABjorkELBjorkJARMAC2020ForPostingSingleSpaced.pdf

---

## Topic 4: Cognitive Load Theory

### Key Researchers & Years
- **John Sweller** (1988) — *Cognitive load during problem solving: effects on learning* (Cognitive Science, 12, 257-285)
- **Sweller, van Merriënboer & Paas** (1998, 2019) — CLT architecture
- **Sweller** (2010, 2020) — Element interactivity, refined CLT

### Core Findings

**Three Types of Load (original formulation, 1998)**
1. **Intrinsic load**: inherent complexity of material, determined by *element interactivity* — how many elements must be processed simultaneously. Varies with learner expertise (what is 10 interacting elements for a novice may be 1 chunk for an expert).
2. **Extraneous load**: load imposed by poor instructional design — unnecessary search, split attention, redundant information.
3. **Germane load**: resources devoted to schema construction (later reconceptualized as redistribution, not an independent source).

**Current View (Sweller, 2010; 2020)**
- Intrinsic and extraneous load are additive. Total load must not exceed working memory capacity.
- **Germane load is not an independent load** — it is the portion of working memory resources redirected from extraneous to intrinsic processing when extraneous load is reduced.
- Element interactivity is the unifying concept: high element interactivity = high complexity = high intrinsic load. Extraneous load increases element interactivity unnecessarily.

**Worked Example Effect (Cooper & Sweller, 1987)**
- Novices learn more from studying solved examples than from solving equivalent problems.
- Problem solving via means-ends analysis imposes heavy extraneous load, starving schema acquisition.
- However: for low-element-interactivity material (e.g., definitions), the effect reverses — generation is superior.

**Expertise Reversal Effect (Kalyuga et al., 2003)**
- As expertise increases, what was scaffolding becomes redundant. Worked examples benefit novices but can *harm* advanced learners (redundancy effect).
- Implies instruction must *adapt* to learner's growing knowledge base.

### Practical Application for CP Training
- **Worked examples first**: before assigning a DP problem, show a fully worked solution to a similar (but simpler) problem. Explain *why* each step.
- **Fading**: transition from full worked example → partial solution (fill in blanks) → full problem.
- **Reduce split attention**: keep code, explanation, and visualization integrated on one screen.
- **Beware of overload**: don't introduce segment trees, lazy propagation, *and* a complex problem in the same session. Intrinsic load must be managed across time.

### One Limitation
CLT has struggled to independently measure the three load types — most instruments are self-report (e.g., Leppink et al., 2013), which captures *perceived* difficulty rather than actual cognitive load. The theory explains empirical effects post-hoc better than it predicts them a priori.

### Sources
- Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. https://andymatuschak.org/files/papers/Sweller%20-%201988%20-%20Cognitive%20load%20during%20problem%20solving.pdf
- Sweller, J. et al. (2019). Cognitive architecture and instructional design: 20 years later. https://link.springer.com/article/10.1007/s10648-019-09465-5
- Sweller, J. (2020). Cognitive-load theory: Methods to manage working memory load. https://journals.sagepub.com/doi/10.1177/0963721420922183

---

## Topic 5: Transfer of Learning

### Key Researchers & Years
- **Susan M. Barnett & Stephen J. Ceci** (2002) — *A taxonomy for far transfer* (Psychological Bulletin, 128(4), 612-637)
- **Richard A. Schmidt & Robert A. Bjork** (1992) — *New conceptualizations of practice* (Psychological Science, 3(4), 207-217)

### Core Findings

**Near vs. Far Transfer**
- **Near transfer**: applying knowledge to similar contexts (e.g., solving a slightly modified version of a problem you've seen before).
- **Far transfer**: applying knowledge to novel, superficially dissimilar contexts (e.g., recognizing that a problem about "painting a fence" is actually a DP + segment tree problem).

**Barnett & Ceci's Taxonomy of Transfer (2002)**
Two broad factors, each with sub-dimensions:

**Content (what is transferred)**
1. **Specificity-generality** of the learned skill: specific procedure vs. general principle
2. **Performance change**: speed, accuracy, or approach
3. **Memory demands**: recognition vs. recall vs. application under time pressure

**Context (when and where)**
1. **Knowledge domain**: same vs. different (math → physics → CP)
2. **Physical context**: same room vs. different environment
3. **Temporal context**: immediate vs. delayed application
4. **Functional context**: academic vs. real-world
5. **Social context**: individual vs. group
6. **Modality**: textual vs. visual vs. auditory

Key conclusion: "Far transfer" is not binary — it's a multi-dimensional continuum. A transfer that is "far" on one dimension may be "near" on another. Single effect sizes for "far transfer" are meaningless.

**Schmidt & Bjork (1992) — Variability of Practice**
- **Varied practice** (practicing at different distances, contexts, or problem structures) degrades *acquisition* performance but dramatically improves *transfer* to novel tasks.
- Catalano & Kleiner (1984): subjects who practiced at 4 speeds performed better on unpracticed speeds than those who practiced at 1 speed.
- Kerr & Booth (1978): children who tossed beanbags at 2ft and 4ft were more accurate at the 3ft target than children who practiced at 3ft exclusively.
- Principle: variability forces learners to build flexible *schemata* (generalized rules) rather than context-bound procedures.

### Why CP Demands Far Transfer
Competitive programming problems are *designed* to resist near transfer — surface stories change, known algorithms are disguised, constraints are unique. The highest skill is recognizing deep structure beneath unfamiliar surface. This is quintessential far transfer: applying algorithmic principles to problems that superficially resemble nothing seen before.

### Designing Practice for Maximum Transfer
- **Interleaved topics** (not blocked) — forces discrimination between problem types.
- **Variable problem structure** — the same algorithm disguised in different stories.
- **Delayed application** — revisit algorithms after weeks, not minutes.
- **Generate principles** — after solving, articulate *why* the solution works (general principle), not just memorizing steps.

### One Limitation
Most transfer research lab results (thousands of studies) show that transfer is *hard* and does not happen automatically. Even experts show limited far transfer outside their domain. The Barnett & Ceci review (2002) shows most "far transfer" claims collapse under dimensional analysis — claims of broad far transfer are largely unsupported.

### Sources
- Barnett, S.M. & Ceci, S.J. (2002). A taxonomy for far transfer. https://doi.org/10.1037/0033-2909.128.4.612
- Schmidt, R.A. & Bjork, R.A. (1992). New conceptualizations of practice. https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.1992.tb00029.x/
- Bjork, R.A. (2018). Being suspicious of the sense of ease... https://sites.lifesci.ucla.edu/psych-bjorklab/wp-content/uploads/sites/13/2018/02/BjorkCommentaryOnSchmidtBjork.pdf

---

## Topic 6: Mastery Learning

### Key Researchers & Years
- **Benjamin S. Bloom** (1968) — *Learning for Mastery* (Evaluation Comment, 1(2))
- **Benjamin S. Bloom** (1984) — *The 2 Sigma Problem* (Educational Researcher, 13(6), 4-16)
- **Anania** (1981/1982) — Dissertation comparing tutoring vs. mastery vs. conventional
- **Burke** (1983/1984) — Replication of Anania's study

### Core Findings

**The 2 Sigma Problem (Bloom, 1984)**
Anania (1981) and Burke (1983) compared three conditions across multiple grades and subjects:
| Condition | Achievement (vs. conventional) |
|---|---|
| Conventional (30:1) | baseline (50th percentile) |
| Mastery Learning (30:1) | +1σ (84th percentile) |
| One-to-one tutoring | +2σ (98th percentile) |

- The "2 sigma problem": can group instruction be designed to approach the effectiveness of tutoring?
- Tutoring also reduced the aptitude-achievement correlation from r=+.60 (conventional) to r=+.25 — tutoring made prior aptitude less predictive of outcomes.
- Mastery learning + formative assessment achieved 1σ — half the tutoring effect, at a fraction of the cost.

**Mastery Learning Process (Bloom, 1968)**
1. Break content into instructional units (~1-2 weeks)
2. Teach the unit
3. Administer **formative assessment** (diagnostic, not graded)
4. Provide **corrective activities** targeted to specific gaps
5. Re-assess with **parallel formative test**
6. **Enrichment** for students who mastered (vs. moving to next unit)
- Cycle repeats: only students who demonstrate mastery (typically ≥80-90% correct) proceed to new material.

**Mastery Threshold**
- Not "percent correct" — mastery means the learner can use the knowledge flexibly, not just recall it.
- Bloom's original work used 80-90% on formative tests, but the deeper criterion is: can the learner *apply* the concept to novel problems?
- In CP: mastery of binary search means solving a *new* binary search problem without hints, not just passing 1 problem.

### Practical Application for CP Training
- **Formative assessment**: before advancing to segment tree + lazy propagation, verify mastery of plain segment tree (solve 3 unseen problems in contest conditions).
- **Corrective loop**: when a student fails a topic, automatically prescribe targeted review + simpler problems → re-test.
- **Enrichment vs. advancement**: students who master early can tackle harder variants of the same topic rather than just moving on.
- **Mastery ≠ 1 AC**: a single AC could be luck or memorization. Require spaced re-testing across variations to confirm retention.

### One Limitation
Mastery learning in pure form requires significant time: if every student must demonstrate 90% mastery before advancing, slower students lag far behind the curriculum schedule. In a fixed-term CP training camp or semester course, this is often infeasible — trade-offs between coverage and mastery are inevitable.

### Sources
- Bloom, B.S. (1984). The 2 sigma problem. https://web.mit.edu/5.95/readings/bloom-two-sigma.pdf
- Guskey, T.R. The history and development of mastery learning. https://files.eric.ed.gov/fulltext/ED490412.pdf
- Bloom, B.S. (1968). Learning for mastery. https://files.ascd.org/staticfiles/ascd/pdf/journals/ed_lead/el_198405_bloom.pdf

---

## Cross-Cutting Synthesis for CP Training System Design

| Principle | Key Sources | Application |
|---|---|---|
| Prerequisites matter | Piaget, Ausubel | Pre-assess before each unit; scaffold prerequisite knowledge |
| Zone of Proximal Development | Vygotsky, Wood et al. | Rating +200-400; tiered hint system; calibrate difficulty |
| Desirable Difficulties | Bjork & Bjork | Interleave topics; space reviews; test before teaching |
| Manage Cognitive Load | Sweller | Worked examples first; fade gradually; avoid split attention |
| Design for Transfer | Barnett & Ceci, Schmidt & Bjork | Vary problem contexts; interleave; force principle extraction |
| Mastery Before Advancement | Bloom | Formative assess; correct; re-test; don't skip if <80% |
| Self-Determination | Deci & Ryan | Preserve autonomy; tiered choice; competence feedback loop |
| Default Mode Network | Raichle, Wagner | Space sessions for consolidation; sleep is not wasted time |
| Self-Efficacy | Bandura | Sequence success; model peers; calibrate feedback |
| Dual-Coding | Paivio | Present code + diagram + explanation simultaneously |
| Context-Dependent Memory | Godden & Baddeley, Smith | Match training & contest environment for critical skills |
| Situated Learning | Lave & Wenger | Simulate contest conditions; community participation |
| Cognitive Offloading | Risko & Gilbert | External tools as scaffolds; fade intentionally |

---

## Topic 7: Self-Determination Theory (SDT)

### Key Researchers & Years
- **Edward L. Deci & Richard M. Ryan** (1985) — *Intrinsic Motivation and Self-Determination in Human Behavior*
- **Ryan & Deci** (2000) — *Self-determination theory and the facilitation of intrinsic motivation* (American Psychologist, 55(1), 68-78)
- **Ryan & Deci** (2017) — *Self-Determination Theory: Basic Psychological Needs in Motivation, Development, and Wellness*

### Core Findings

**Three Basic Psychological Needs**
1. **Autonomy** — need to feel volitional, that one's actions are self-endorsed rather than controlled
2. **Competence** — need to feel effective and capable of achieving desired outcomes
3. **Relatedness** — need to feel connected to others, to belong

**Intrinsic vs. Extrinsic Motivation**
- **Intrinsic motivation**: doing something because it is inherently interesting or enjoyable (highest quality motivation)
- **Extrinsic motivation**: doing something because of external pressure or reward
- SDT does not treat extrinsic motivation as uniformly bad — **autonomous extrinsic motivation** (when external goals are fully internalized) can be nearly as effective as intrinsic motivation

**Motivation Continuum** (external → integrated):
External → Introjected → Identified → Integrated → Intrinsic

The goal is to move learners rightward on this continuum: from "I have to do this" to "I choose to do this because it matters to my goals."

**Autonomy Support**
- Controlling environments (rigid deadlines, surveillance, contingent rewards) undermine intrinsic motivation
- Providing choice, rationale, and acknowledging feelings increases autonomous motivation even for uninteresting tasks

### Why It Matters for CP Training
- CP training is inherently effortful and long-term (years). Only intrinsic/integrated motivation sustains through plateaus and failures.
- Over-prescription (exactly which problems, when, how long) kills autonomy → motivation collapses
- Competence feedback loop: system should make progress *visible* (IRT θ trending up, fringe advancing) so the student experiences growing effectiveness

### Practical Application
- **Tiered choice**: offer 2-3 problem options at similar difficulty, let student choose
- **Progress visibility**: show IRT θ trend, fringe expansion, mastered count
- **Competence calibration**: when self-efficacy drops (detected via avoidance/hesitation), temporarily lower difficulty to rebuild (Bandura complement)
- **Autonomy-preserving hints**: framed as suggestions ("you might check the boundary here"), not commands

### One Limitation
SDT is descriptive and explains *why* motivation fails, but does not *prescribe* exactly how much autonomy or competence support is optimal for a given learner — the right amount varies across individuals and phases.

### Sources
- Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation. *American Psychologist*. https://doi.org/10.1037/0003-066X.55.1.68
- Ryan, R. M., & Deci, E. L. (2017). *Self-Determination Theory*. Guilford Press.

---

## Topic 8: Default Mode Network (DMN) and Learning Consolidation

### Key Researchers & Years
- **Marcus E. Raichle** et al. (2001) — *A default mode of brain function* (PNAS, 98(2), 676-682)
- **Jessica R. Andrews-Hanna** (2012) — *The brain's default network and its adaptive role in internal mentation* (The Neuroscientist, 18(3), 251-270)
- **Wagner et al.** (various) — DMN and memory consolidation
- **Coull et al.** (various) — Spacing effects and neural consolidation

### Core Findings

**What DMN Is**
- A network of brain regions (medial prefrontal cortex, posterior cingulate, angular gyrus, hippocampus) that is *more active at rest than during externally-focused tasks*
- Discovered inadvertently when Raichle noticed certain areas consistently showed higher activity during "rest" (fixation baseline) than during cognitive tasks
- Consumes ~20% of the brain's energy (despite being only ~2% of brain mass)

**DMN Functions**
1. **Memory consolidation**: during rest, the hippocampus replays recent experiences, strengthening cortical connections. This is why sleep *after* learning is as important as the learning itself — consolidation is an active, DMN-driven process.
2. **Autobiographical planning**: DMN integrates past experiences to simulate future scenarios
3. **Self-referential thought**: relating new information to personal experience

**DMN and Learning**
- Post-learning rest (even 10-15 minutes of quiet wakefulness) significantly improves retention compared to immediate engagement in a new task (Dewar et al., 2012)
- DMN activity during rest *after* training predicts later recall — the more replay, the better retention
- Sleep consolidates: during slow-wave sleep, memories are replayed and transferred from hippocampus to neocortex for long-term storage

### Why It Matters for CP Training
- **Rest is not waste**: the most productive training schedule is not "cram as many problems as possible," but "problem → rest/review → sleep → next problem"
- **Inter-session spacing**: learning sessions separated by at least one sleep cycle consolidate better than same-day double sessions
- **Deliberate rest**: inserting short quiet breaks (no phone, no new input) after an intense problem-solving session allows DMN to consolidate
- **Distributed > massed**: the DMN consolidation explanation for the spacing effect

### Practical Application
- **Schedule rest**: after every 90-minute training block, schedule 10-15 minutes of deliberate rest (no screens, no new problems)
- **Overnight effect**: never teach a new topic the same day as an evening training session — let the first session consolidate before layering more
- **Review timing**: FSRS intervals should account for sleep cycles; a card reviewed before sleep consolidates better than one reviewed after sleep
- **1-day gap principle**: hard topics (segment tree, DP, heavy-light) should have at least 1 day of gap between learn phase and exam phase

### One Limitation
DMN research is mostly correlational (fMRI measures activity, not causation). The consolidation mechanism is well-supported in animal models (hippocampal replay) but the exact causal role of DMN in human skill learning is less established. The practical implication (space learning, prioritize sleep) is robust regardless.

### Sources
- Raichle, M. E. et al. (2001). A default mode of brain function. *PNAS*. https://doi.org/10.1073/pnas.98.2.676
- Dewar, M. et al. (2012). Boosting long-term memory via wakeful rest. *Psychological Science*. https://doi.org/10.1177/0956797612441220
- Wagner, U. et al. (2004). Sleep inspires insight. *Nature*. https://doi.org/10.1038/nature02702

---

## Topic 9: Self-Efficacy Theory

### Key Researchers & Years
- **Albert Bandura** (1977) — *Self-efficacy: Toward a unifying theory of behavioral change* (Psychological Review, 84(2), 191-215)
- **Bandura** (1986) — *Social Foundations of Thought and Action: A Social Cognitive Theory*
- **Bandura** (1997) — *Self-Efficacy: The Exercise of Control*

### Core Findings

**Definition**
Self-efficacy is the belief in one's capability to organize and execute the courses of action required to produce given attainments. It is not about actual ability — it is about *perceived* capability.

**Four Sources of Self-Efficacy** (ranked by potency):
1. **Mastery experience** (strongest) — actually succeeding at a challenging task
2. **Vicarious experience** — observing a similar-ability peer succeed (modeling)
3. **Verbal persuasion** — encouragement from a credible source ("you can solve this")
4. **Physiological/affective state** — interpreting anxiety as readiness vs. inability

**Efficacy-Action Spiral**
- Success → increased efficacy → higher goals → more persistence → more success (upward spiral)
- Failure → decreased efficacy → lower goals → early withdrawal → more failure (downward spiral)
- The spiral is self-reinforcing: initial conditions create divergent trajectories

**Calibration is Key**
- Self-efficacy should be slightly optimistic (overestimate by 10-20%) to mobilize effort
- *Under*estimation is worse than overestimation — it leads to avoidance and missed learning opportunities
- But gross overestimation (hubris) prevents preparation and causes catastrophic failure

### Why It Matters for CP Training
- Many CP dropouts are not due to lack of ability — they quit because they *believe* they cannot bridge the gap to IOI level
- A training system must **actively calibrate self-efficacy** by sequencing successes, not just delivering optimal BKT updates
- The transition from "I can solve this with help" to "I can solve this alone" is an efficacy transition, not just a knowledge transition

### Practical Application
- **Mastery sequence**: start each new topic with a slightly-easier-than-threshold problem, then increase difficulty once momentum builds
- **Peer modeling**: show solutions from similar-ability peers (not IOI gold medalists) — vicarious experience is specific to *perceived similarity*
- **Attribution feedback**: after success, attribute to strategy and effort ("you debugged methodically") not innate talent
- **Calibration check**: occasionally ask student "how confident are you that you can solve this?" Compare to actual outcome — flag systemic under/over confidence

### One Limitation
Self-efficacy is domain- and task-specific — there is no "general" self-efficacy. A student may have high efficacy for implementation-heavy problems but low efficacy for theory problems. The system must track per-category efficacy, not treat it as a single variable.

### Sources
- Bandura, A. (1977). Self-efficacy: Toward a unifying theory of behavioral change. *Psychological Review*. https://doi.org/10.1037/0033-295X.84.2.191
- Bandura, A. (1997). *Self-Efficacy: The Exercise of Control*. W.H. Freeman.

---

## Topic 10: Dual-Coding Theory

### Key Researchers & Years
- **Allan Paivio** (1971) — *Imagery and Verbal Processes*
- **Paivio** (1986, 2007) — *Mental Representations / Mind and Its Evolution*
- **Clark & Paivio** (1991) — *Dual coding theory and education* (Educational Psychology Review, 3(3), 149-210)

### Core Findings

**Two Processing Systems**
1. **Verbal system**: processes and stores linguistic information (words, sentences, code). Sequential, abstract.
2. **Non-verbal (imagery) system**: processes and stores visual/spatial information (diagrams, graphs, visualizations). Parallel, concrete.

The two systems are functionally independent but interconnected — a verbal input can evoke imagery and vice versa.

**Additive Encoding**
- Information encoded in *both* systems is more robust than information in either alone
- Dual-encoded memories have two retrieval paths — if one degrades, the other can still trigger recall
- This explains why: (1) diagram + text > text alone, (2) visualization + code > code alone

**Concreteness Effect**
- Concrete words (imageable: "tree," "graph," "loop") are recalled better than abstract words ("relationship," "optimality") because they automatically activate both verbal and imagery systems
- Abstract concepts are harder to encode because they rely primarily on the verbal system

### Why It Matters for CP Training
- Code is fundamentally verbal/abstract — it demands maximum processing from the verbal system alone. This is inherently more taxing than material that also activates imagery.
- Adding visual representations (execution traces, memory diagrams, algorithm animations) recruits the imagery system, reducing verbal system load and providing dual encoding
- The worked example effect may be partly a dual-coding effect: code + explanation + trace diagram = triple encoding

### Practical Application
- **Execution traces**: every worked example should include a trace table showing variable states at each step (verbal + visual encoding of the same logic)
- **Memory diagrams**: for pointer/array topics, show stack + heap state
- **Algorithm animations**: for complex algorithms (DFS, DP table fill), present a step-by-step visualization before the code
- **Dual self-explain**: after studying a solution, ask student to explain *both* in code and in natural language — forces dual encoding
- **Abstraction hierarchies**: present concept at three levels: concrete example → trace → abstract rule (dual-coding progression)

### One Limitation
Dual-coding theory has been criticized for being overly descriptive — it specifies *what* happens (dual encoding is good) but underspecifies *when* (when is imagery helpful vs. distracting?). In CP, poorly designed visualizations can increase extraneous load instead of reducing it — a bad algorithm animation is worse than no animation.

### Sources
- Paivio, A. (1986). *Mental Representations: A Dual Coding Approach*. Oxford University Press.
- Clark, J. M., & Paivio, A. (1991). Dual coding theory and education. *Educational Psychology Review*. https://doi.org/10.1007/BF01320076

---

## Topic 11: Context-Dependent Memory

### Key Researchers & Years
- **D. R. Godden & Alan Baddeley** (1975) — *Context-dependent memory in two natural environments* (British Journal of Psychology, 66(3), 325-331)
- **Steven M. Smith, Arthur Glenberg, Robert A. Bjork** (1978) — *Environmental context and human memory* (Memory & Cognition, 6(4), 342-353)

### Core Findings

**Godden & Baddeley's Diving Experiment (1975)**
- Divers learned word lists either on land or underwater (10m depth)
- Recall was best when testing context matched learning context:
  - Learned on land, tested on land: best recall
  - Learned underwater, tested underwater: best recall
  - Learned on land, tested underwater: ~50% recall drop
  - Learned underwater, tested on land: similar drop
- Effect was robust and significant — context is encoded *with* the memory, not separately

**Smith, Glenberg & Bjork (1978)**
- Multiple study contexts > single context
- Students who studied in two different rooms recalled *more* than those who studied twice in the same room
- Variety of contexts during encoding reduces dependence on any single context during retrieval
- Environmental context is not a retrieval cue you can consciously control — it operates automatically

**Environmental Context vs. Mental Context**
- Environmental context effects are strongest when: (1) the material is not already overlearned, (2) testing occurs unexpectedly, (3) the context change is salient
- Internal state (mood, arousal) also acts as context — state-dependent memory

### Why It Matters for CP Training
- Exam/Academia Sinica contest environment is dramatically different from the bedroom/study environment — different desk, different keyboard, different noise level, different stress
- Skills trained only in one context (quiet study room, own IDE setup, unlimited time) may not transfer to contest conditions
- However: varying training contexts (different rooms, different times of day, timed vs. untimed) reduces context-dependence

### Practical Application
- **Context variability**: vary training conditions — sometimes quiet, sometimes noisy, sometimes on a different computer, sometimes with or without reference materials
- **Exam simulation**: at least 20% of practice sessions should simulate contest conditions (same time pressure, same environment, same noise level)
- **Environmental cues**: when learning a hard concept, try to study it in the same room/posture as expected contest environment (context acts as a retrieval cue)
- **Don't overtrain in ideal conditions**: practicing only in optimal conditions produces context-bound mastery that fails under stress

### One Limitation
Applied to skill learning (not just word recall), context-dependence is weaker — procedural skills transfer better across contexts than declarative memories. The diving experiment was word recall; for CP problem-solving (procedural + conceptual), the effect is probably smaller but still present, especially for the stress component.

### Sources
- Godden, D. R., & Baddeley, A. D. (1975). Context-dependent memory in two natural environments. *British Journal of Psychology*. https://doi.org/10.1111/j.2044-8295.1975.tb01468.x
- Smith, S. M. (1994). Theoretical principles of context-dependent memory. https://doi.org/10.1016/B978-0-08-051973-9.50010-8

---

## Topic 12: Situated Learning

### Key Researchers & Years
- **Jean Lave & Etienne Wenger** (1991) — *Situated Learning: Legitimate Peripheral Participation*
- **Brown, Collins & Duguid** (1989) — *Situated cognition and the culture of learning* (Educational Researcher, 18(1), 32-42)
- **Collins, Brown & Holum** (1991) — Cognitive apprenticeship

### Core Findings

**Legitimate Peripheral Participation (Lave & Wenger, 1991)**
- Learning is not an isolated cognitive act — it is a process of *participation in a community of practice*
- Novices start at the periphery (observing, doing small tasks), gradually moving toward full participation
- "Legitimate" means the peripheral work is real and valued by the community, not artificial exercise
- Learning is inseparable from the social and physical context in which it occurs

**Cognitive Apprenticeship (Collins, Brown & Holum, 1991)**
- Traditional apprenticeship: learn by watching a master, then doing with support, then doing independently
- Cognitive apprenticeship applies the same model to intellectual skills:
  1. **Modeling**: expert demonstrates thinking process (think-aloud)
  2. **Coaching**: expert observes and provides feedback
  3. **Scaffolding**: expert provides support, gradually removed (fading)
  4. **Articulation**: learner verbalizes their reasoning
  5. **Reflection**: learner compares their process to expert's
  6. **Exploration**: learner sets own goals and solves novel problems

**Why School Often Fails (Brown, Collins & Duguid, 1989)**
- Classroom knowledge is "inert" — learned in isolation from authentic use, so it's not retrievable when needed
- Authentic activity: learning must be embedded in the culture and practices of the domain
- For CP: the authentic activity is *solving unseen problems under time pressure* — not reading editorials or watching tutorials

### Why It Matters for CP Training
- CP has a strong community of practice (Codeforces, AtCoder, IOI training camps, Discord/Telegram communities)
- Legitimate peripheral participation: start with simple problems, participate in contests, read others' solutions, gradually contribute to community
- A pure algorithm tutorial with no contest practice is like learning carpentry by reading about saws — it misses the authentic activity

### Practical Application
- **Community access**: after basics, encourage participation in Codeforces/AtCoder virtual contests (not just problem-solving)
- **Exposure to expert process**: use think-aloud recordings of strong contestants solving problems (modeling)
- **Editorial as coaching**: after solving (or failing), compare approach to official editorial — the gap is the learning zone
- **Articulation requirement**: after solving, student explains strategy in one sentence (articulation + reflection)

### One Limitation
Situated learning theory has been criticized for over-emphasizing context and under-emphasizing transferable abstractions. Pure apprenticeship without decontextualized principle extraction produces narrow skills — this is why CP training needs *both* authentic contest practice and explicit algorithm instruction.

### Sources
- Lave, J., & Wenger, E. (1991). *Situated Learning: Legitimate Peripheral Participation*. Cambridge University Press.
- Brown, J. S., Collins, A., & Duguid, P. (1989). Situated cognition and the culture of learning. *Educational Researcher*. https://doi.org/10.3102/0013189X018001032
- Collins, A., Brown, J. S., & Holum, A. (1991). Cognitive apprenticeship: Making thinking visible. *American Educator*.

---

## Topic 13: Cognitive Offloading

### Key Researchers & Years
- **Evan F. Risko & Sam J. Gilbert** (2016) — *Cognitive offloading* (Trends in Cognitive Sciences, 20(9), 676-688)
- **Gilbert** (2015) — *Strategic use of external memory* (Journal of Experimental Psychology: General, 144(3), 501-510)
- **Risko & Dunn** (2015) — Storing information externally vs. internally

### Core Findings

**Definition**
Cognitive offloading is the use of physical action or external media to reduce internal cognitive demands. Examples: writing down a phone number instead of memorizing, using a calculator, setting a reminder, saving code in a file.

**When People Offload**
- **Strategy selection**: people choose between internal (remembering) and external (writing down) based on *metacognitive beliefs* about their own memory — not just actual ability
- **Cost-benefit tradeoff**: offloading is more likely when (1) internal cost is high (hard material), (2) external cost is low (easy to write down), (3) retrieval context is uncertain (will I remember later?)
- **Offloading is strategic**: people don't offload everything — they selectively offload when they predict their internal memory will fail

**Offloading and Learning**
- *In-the-moment offloading reduces internal processing*: writing something down means you don't have to rehearse it, which reduces immediate memory load but also reduces encoding strength
- *Offloading during learning can harm later retention*: if the external store is available during encoding but unavailable during retrieval, performance suffers
- However: offloading that *structures* rather than *replaces* internal processing (e.g., writing a trace table vs. copying the answer) can enhance learning

**Desirable Offloading**
- The key variable is whether the external tool *replaces* internal processing (bad for learning) or *scaffolds* internal processing (good for learning)
- Worked examples: offloading solution search → frees working memory for schema construction (desirable)
- Copying an answer: offloading recall → no learning (undesirable)

### Why It Matters for CP Training
- CP involves heavy cognitive offloading: writing code is itself offloading (the program is an external memory for the algorithm)
- During learning, students should gradually transition from external support (syntax template, reference cards) to internalized knowledge
- The fade from "look at the template" to "write from memory" is an offloading reduction strategy — intentionally withdrawing external support forces internal encoding

### Practical Application
- **Template fade**: start with full syntax template → remove the template → student writes from memory. This is a deliberate offloading→internalization transition.
- **Reference offloading**: allow reference cards during learn phase, remove during exam phase. Same fading principle.
- **Trace tables**: writing traces is *desirable* offloading — it structures reasoning without replacing the core cognitive step (understanding control flow)
- **Beware of "cheat" offloading**: auto-complete, debugger-overuse, copy-paste from editorials. These replace internal processing and must be restricted during exam phase.
- **Offloading as a scaffold**: treat offloading tools as training wheels — they accelerate early learning but must come off before mastery

### One Limitation
The boundary between desirable and undesirable offloading is context-dependent and learner-dependent — what is scaffolding for a novice is a crutch for an expert. The system must track which offloading tools are allowed at which phase (learn: almost all; practice: limited; exam: none), and adjust based on individual progress.

### Sources
- Risko, E. F., & Gilbert, S. J. (2016). Cognitive offloading. *Trends in Cognitive Sciences*. https://doi.org/10.1016/j.tics.2016.05.002
- Gilbert, S. J. (2015). Strategic use of external memory. *Journal of Experimental Psychology: General*. https://doi.org/10.1037/xge0000071

---

## Revised Cross-Cutting Synthesis for CP Training System Design

| Principle | Key Sources | Application |
|---|---|---|
| Prerequisites matter | Piaget, Ausubel | Pre-assess before each unit; scaffold prerequisite knowledge |
| Zone of Proximal Development | Vygotsky, Wood et al. | Rating +200-400; tiered hint system; calibrate difficulty |
| Desirable Difficulties | Bjork & Bjork | Interleave topics; space reviews; test before teaching |
| Manage Cognitive Load | Sweller | Worked examples first; fade gradually; avoid split attention |
| Design for Transfer | Barnett & Ceci, Schmidt & Bjork | Vary problem contexts; interleave; force principle extraction |
| Mastery Before Advancement | Bloom | Formative assess; correct; re-test; don't skip if <80% |
| Self-Determination | Deci & Ryan | Preserve autonomy; tiered choice; competence feedback loop |
| DMN Consolidation | Raichle, Wagner | Space sessions; prioritize sleep; use deliberate rest |
| Self-Efficacy Calibration | Bandura | Sequence success; model peers; attribution feedback |
| Dual-Coding | Paivio | Present code + trace + visualization for every concept |
| Context-Dependent Memory | Godden & Baddeley, Smith | Vary training contexts; simulate contest conditions |
| Situated Learning | Lave & Wenger | Community participation; authentic contest practice |
| Cognitive Offloading | Risko & Gilbert | Fade external support intentionally; template→memory |
