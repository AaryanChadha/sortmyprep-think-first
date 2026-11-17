# SortMyPrep "Think first": what we changed, what we added, and why

Phase 6 (Ideation and Prototyping), Creativity and Design Thinking live action project, Ashoka University.

- Live prototype: https://aaryanchadha.github.io/sortmyprep-think-first/
- Code: https://github.com/AaryanChadha/sortmyprep-think-first

## 1. The problem we are solving

Our earlier stages narrowed the problem to one gap: **students can see an explanation, but that does not mean they can solve a similar question on their own.**

- **Students** already have answers, past papers and AI. What they lack is a routine for attempting questions alone, understanding exactly where marks were lost, and coming back to their mistakes.
- **Parents** pay for results, but mostly hear about progress at parent-teacher meetings, after the grade is already in.
- **Teachers** are open to AI but stay at its edge, because they cannot verify, control or show evidence for what it produces, and they are accountable for the marks.

SortMyPrep says Sorty teaches "step by step" and "asks before it answers". When we tested the free trial, it gave the answer first. That gap between the promise and the product is what this prototype fixes.

## 2. The evidence each change is built on

Each change is tied to one or more of the sources below.

| Code | Source | Type |
|---|---|---|
| T | Our own test of Sorty's free trial on two IB Maths questions | First-hand observation |
| Q | Original questionnaire: 26 responses (11 students, 11 parents, 4 educators) | Real responses, small sample |
| F | Our Q&A notes with the SortMyPrep team | What the company told us |
| R | r/IBO student advice threads | Public student discussion |
| W | Our 5 Whys for students, parents and teachers | Team analysis of T, Q, F, R |
| S | Our SCAMPER session (Phase 6) | Team ideation |
| P | Problem statement canvas and the course brief (the "performance paradox") | Course framing |
| L | Bastani et al., PNAS 2025: unrestricted GPT-4 helped while available, then students scored about 17% worse without it; a guardrailed tutor largely avoided that drop | Published research |
| X | Riddled (riddled.ai) and VibeWise (Claude Code learning plugin) | Reference products |

What the real evidence says:

- **T, graph test.** Asked to sketch y = ½(3 − 2x)(x + 2)², Sorty gave both x-intercepts, the y-intercept and the shape straight away. We were never asked for a first step.
- **T, algebra test.** On 6x^(3/5) + 1 = 12/x^(3/5), Sorty spotted our mistake (we forgot to multiply the 1 by x^(3/5)) but then wrote the corrected working for us instead of letting us fix it.
- **Q.** 9 of 11 students already use AI. 7 of 11 parents said grade improvement is what decides whether they pay. 5 of the 10 parents who answered said they mainly hear about progress at parent-teacher meetings. All 4 educators use AI occasionally, and check what it produces.
- **F.** General AI is not curriculum aligned, and SortMyPrep's edge is being tailored to IB. Everything a student does is meant to be saved in the insights dashboard. Teachers get real-time visibility. There are two sales models: an individual subscription, and school plans at about $30 to 40 per student on a two-year cycle.
- **R.** IB students advise each other to do real papers, track their errors, and be careful with AI for coursework.

## 3. Before and after, at a glance

| Area | SortMyPrep today (site and trial) | In this prototype | Why (evidence) |
|---|---|---|---|
| How Sorty helps | Answers the question; explains well | Asks for your approach, then one step at a time; you write each line | T, L, W |
| Hints | Full help instantly | Nudge, hint, worked step; each unlocks after an attempt or time on the step | T, L, team brief |
| Mistakes | Corrects them and shows the fix | Asks a question that exposes the mistake; logs it; retries it later | T, R |
| Full solution | Always one message away | Hold a button to reveal; no marks for revealed steps | L |
| Checking learning | None after an explanation | "Prove it": a matched question with new numbers and no help | W (students), handoff test plan |
| Trust in feedback | "Written to match the mark scheme" | Every step shows its M1, A1 or R1 line and the syllabus code | S (Substitute), W, F |
| Interface | Chat window | A notebook: your working on the left, Sorty's notes in the margin, Sorty draws graphs as you go | X (Riddled) |
| Progress | Predicted grade, accuracy | Readiness score, effort streak, time under tension, steps solved alone | S (Adapt), F |
| After a bad mock | Not covered | Two-week recovery plan ending in a retest | S (Modify), Q, W (parents) |
| Planning | Smart recommendations | Week-by-week plan back from your exam date | S (Combine), R |
| Teachers | "Teacher dashboard" mentioned, not shown to us | Live working, error patterns, AI-drafted follow-up sets, mark review with a change log, rules for hints and reveals, private pilot | F, W (teachers), Q, P |
| Parents | Testimonials describe a parent dashboard | Weekly note on effort and progress, never chats or mistakes | Q, W (parents) |

## 4. What students get

**1. Attempt-first, step-by-step solving (the core change)**
Every question is split into the steps marks are awarded for. You see one step at a time and enter your own answer: a number, a list of values, an algebraic expression, a choice, or a short explanation. Sorty checks it.
*Fixes:* the trial result (T), where Sorty did the thinking. *Why it matters:* the PNAS study (L) found that unrestricted AI help raised scores while students had it but lowered them once it was gone.
*Try it:* any question in the bank.

**2. Plan your approach first**
Before any working, Sorty asks how you would start. A weak plan gets a question back, not a correction, and you can skip it.
*From:* VibeWise (X), which asks for your approach before writing anything.

**3. Time under tension and earned hints**
A meter shows how long you have been working on the step. Hints come in three levels (nudge, hint, worked step), each unlocked after an attempt or time on the step. After three minutes without progress, Sorty offers the next hint, because staying stuck longer stops paying off.
*From:* our team brief ("help students spend time under tension", borrowed from strength training, where growth comes from time under load), with L for why help has to be gated.

**4. Mistakes get a question, not a correction**
Each step knows the common wrong answers. In the algebra test the student types 6u² + 1 = 12, and Sorty asks: "You multiplied 6u and 12/u by u. What happened to the +1?" The mistake is logged, and if the student then fixes it without a hint, it counts as a self-correction.
*Fixes:* the algebra trial (T), where Sorty wrote the fix itself.

**5. Hold to reveal**
The full solution is still there, but you have to hold the button to see it. Revealed steps earn no marks, and a matched question goes onto your retry list.

**6. Prove it**
After each question you get a matched one with the same skill and new numbers, and no hints. It is the result your readiness score trusts most.
*From:* our 5 Whys for students (W): students cannot tell how reliable their understanding is. It also matches the test plan from our earlier report: can the student solve an unseen matched question without AI?

**7. Every line cites the mark scheme**
Each step shows the mark it earns (M1, A1, R1) and the mark-scheme line, and each question shows its syllabus code and paper.
*From:* SCAMPER, Substitute ("trust is earned, not assumed"), and the founder's point that curriculum alignment is SortMyPrep's edge over general AI (F).

**8. A notebook, not a chat**
Your working sits on the left and Sorty's notes sit in the margin in its own blue ink. Sorty sketches graphs and supply-and-demand diagrams step by step, as you earn each part. You can choose between "Thinks with you" (Sorty speaks up) and "Waits to be asked", pick a reviewer (Examiner, Teacher or Study buddy), and have notes read aloud.
*From:* Riddled (X): margin notes, drawing, two modes, reviewer personas, voice.

**9. Explain it back**
You explain a concept in your own words, typed or spoken. Sorty ticks off the marking ideas you covered and asks about the first one you missed, then pushes with a deeper "why". It never rewrites your answer.
*From:* SCAMPER, Rearrange, and Riddled's "follow the thought".

**10. Readiness score and effort streak**
Each subject gets a score built from 40% syllabus coverage, 40% steps solved without help and 20% recency, and the formula is shown. The streak counts days you solved something yourself, not days you logged in, with one rest day a week.
*From:* SCAMPER, Adapt (Duolingo streaks, fitness readiness scores).

**11. Bad grade recovery plan**
Enter where you lost marks in a mock and you get 14 days: redo the lost marks, explain them back, targeted sets on your weakest topics, mixed timed practice, then a retest. It can be shared with your teacher or a parent.
*From:* SCAMPER, Modify. It also meets the moment the 5 Whys found parents act (after a bad grade, usually by hiring a tutor) with a plan the student owns.

**12. Plan back from the exam date**
Enter your first paper date and weekly hours. Sorty fills the weeks with gaps first, then mixed practice, then timed papers, and exports to your calendar.
*From:* SCAMPER, Combine (question bank plus study planner), and last year's goal planner.

**13. Insights that show learning, not activity**
Time under tension, steps solved alone, hints per step, self-corrections and Prove it passes, plus an error log with spaced retries after 1, 3 and 7 days.
*From:* the founder's point that everything is tracked in insights (F), and the Reddit advice to track errors (R).

## 5. What teachers get (new value)

Our 5 Whys found that teachers "can't yet verify, control and evidence the output, so using it adds checking work and personal risk instead of saving time." Each teacher feature answers one part of that.

| Teacher need | What the prototype gives them | Value |
|---|---|---|
| **Verify** what students actually did | A **live view** of each student's step, time under tension, hints used and status (working, stuck, proved it, fixed own error, held to reveal), plus their crossed-out attempts and Sorty's question | See the working, not just a score, while the class is still working on it |
| **Control** how much AI gives away | A **rules panel** per class: when hints unlock (after an attempt, after time, or either), how many seconds, the deepest hint allowed, and whether full solutions are available (hold to reveal, only after every step is tried, or locked). Changes apply straight away | The teacher sets the policy, Sorty follows it. AI supports the teacher's judgement instead of replacing it |
| **Own the marks** | **Mark review**: every AI-proposed mark shows the mark-scheme line and Sorty's confidence. Accept it or change it with a reason the student sees. Every action goes into a change log, and an agreement rate is tracked | The teacher keeps accountability, with a record. Low-confidence marks always come to the teacher |
| **Personalise without the hours** | **Recurring errors**: the class's most common mistakes, with how many students have fixed each one alone. An **AI agent drafts a follow-up set** for the top mistake (finds the students, picks matched questions, sets Prove it mode), then waits for approval | Personalised follow-up in one click, and nothing is sent without the teacher saying yes |
| **Evidence** for leadership | A **private pilot**: one class for four weeks, results visible only to the teacher, then a one-page evidence report covering steps solved alone, Prove it pass rate, errors fixed, net marking time (time saved minus time spent checking Sorty) and how often the teacher changed Sorty's marks | Answers the "performance paradox" from the brief: a school can test privately before anyone has to defend AI in public, then decide with evidence |
| **Transparency** | **"How Sorty decided"**: every tutoring decision is logged as what it saw, what it decided under the class rules, and what it did | Teachers and IT can audit the AI's behaviour instead of trusting it |

Pricing follows the founder's model: about $30 to 40 per student on a two-year cycle, with a free private pilot first.

## 6. What parents get

- **A Sunday note** covering sessions, time under tension, steps solved alone, errors fixed and readiness by subject, plus one question to ask their child ("Can you show me how you would start…?").
- **Never included:** chats, individual wrong answers, or login logs. The student sees the note before it is sent and can turn it off.
- *Why:* in the real questionnaire, 7 of 11 parents decide on grade improvement, and 5 of 10 mainly hear about progress at parent-teacher meetings (Q). The 5 Whys root cause is that parents cannot see effort or results early enough (W).

## 7. What we kept from SortMyPrep

The brand (logo, Figtree and IBM Plex Serif type, SortMyPrep blue), the board-aligned question bank, step-by-step sorted solutions, Sorty, voice, screen share, photo marking, the insights dashboard, the exam builder and teacher visibility. This proposal changes how Sorty behaves and what the dashboards measure. It does not replace the product.

## 8. How it maps to the assignment

**The brief asked us to pick the 2 or 3 strongest ideas and prototype each one.**

1. **Attempt-first tutoring with time under tension.** From the team brief and the trial finding (T), backed by L. Prototype: the solver, with 23 questions, 22 matched Prove it questions and 122 checkable steps.
2. **Every explanation cites the mark scheme, plus Explain it back.** From SCAMPER Substitute and Rearrange. Prototype: the mark-scheme tracker and the Explain it back page.
3. **Teacher-first adoption.** From the problem brief and the teacher 5 Whys. Prototype: the live view, rules, mark review, agent-drafted sets and the private pilot.

The supporting ideas (Modify: recovery plan; Combine: exam planner; Adapt: streak and readiness) are built as lighter screens.

**The course's design-thinking steps:**

- **Empathy and personas:** student, parent and teacher pain points drive the three user sections above.
- **POV and How Might We:** "How might we give teachers and students AI they can rely on for everyday academic work, so trust is earned rather than assumed?" (from our problem statement canvas). Every feature answers either trust or independent work.
- **Ideation (mind maps, 5 Whys, SCAMPER):** each feature is tagged with its source. The "Show what's new" switch on the site shows these tags in place.
- **Prototyping and testing:** a working front end, plus the test below.

## 9. How SortMyPrep could test it

Run a four-week comparison in one or two classes. Half the class uses today's Sorty, which gives full solutions, and half uses the attempt-first version. Both get the same questions, then a matched question without AI.

Measure:
- the first unaided step
- hints used per step
- premature reveals
- self-corrections
- the score on the no-AI question
- next-week retry
- student frustration
- net teacher time

## 10. Honest limits

- **The tutor is scripted.** It runs from the question bank: each step's answer, hints, common mistakes and mark-scheme line are written out. A live Claude model can be connected in Settings and follows the same rules.
- **The question bank was written for this prototype.** Two questions are the exact ones from our trial. The other 21 are written by the team in IB style and mapped to syllabus codes. None are copied from IB papers.
- **The figures on the screens are samples.** Student history, class rosters and pilot figures are there to show the screens, not to report results.
- **The teacher features are proposals.** We could not see SortMyPrep's teacher dashboard or analytics, so these are proposed features, not changes to a workflow we observed.
