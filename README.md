# sortmyprep: think first (concept prototype)

**Live site:** https://aaryanchadha.github.io/sortmyprep-think-first/  
**What changed and why:** [FEATURES.md](FEATURES.md)

A working prototype of product improvements for sortmyprep, built for Phase 6 (Ideation) of the
Creativity and Design Thinking live action project at Ashoka University.

The core idea: Sorty stops handing over answers and starts protecting the student's thinking time.
Every question is split into mark-scheme steps; hints unlock only after an attempt or time on the step
("time under tension"); known errors get a question back instead of a correction; and every question ends
with a matched "Prove it" question that must be done without help.

## Run it

```
npm install
npm run dev          # local dev server
npm run build        # static site in dist/ (works on GitHub Pages, any static host)
npx vite build --mode single   # one self-contained HTML file in dist-single/
```

The site uses hash routing, so it works from any folder or GitHub Pages without server config.

## Pages

| Route | What it shows |
|---|---|
| `/` | Landing page in sortmyprep's style, with a live question in the hero |
| `/practice` | Question bank (23 questions + 22 matched Prove it twins, 122 checkable steps) |
| `/solve/:id` | The tutor: approach first, step checks, hint ladder, time under tension, margin notes, Sorty's sketch, mark-scheme tracker, decision log |
| `/explain` | Explain it back, with idea checklist and follow-up whys (voice input in Chrome) |
| `/plan` | Exam-date planner, readiness score, effort streak, .ics export |
| `/recovery` | Bad grade recovery: 14-day plan from marks lost by topic |
| `/insights` | Student insights: time under tension, unaided steps, error log with spaced retries |
| `/teacher` | Live class view, recurring errors + agent-drafted follow-up sets, mark review with change log, hint/reveal rules, private pilot |
| `/parent` | Weekly parent note |
| `/changes` | Every change, the problem it answers, where the idea came from, and how to measure it |
| `/settings` | Optional live model key, presenting toggles, reset sample data |

The "Show what's new" switch in the header turns proposal notes on and off. Each note says where the
idea came from (SCAMPER, 5 Whys, founder Q&A, our free-trial test, Riddled, VibeWise, research).

## How the tutor works

`src/lib/tutor.ts` is the agent loop: observe the attempt, diagnose it against the step's answer and known
errors, pick the smallest useful action under the teacher's policy, and log the decision (shown in
"How Sorty decided"). `src/lib/check.ts` checks numbers, sets of values, algebraic expressions (by
numeric equivalence with mathjs), multiple choice and short explanations (marking-point keywords).

Everything runs offline with no API key. Optionally, paste an Anthropic API key in Settings and the
"Ask about this step" box and Explain it back will call Claude under the same attempt-first rules.

## Content and data

- `src/data/questions.ts`: two questions are the ones the team used to test Sorty's free trial; all others
  are IB-style, written for the prototype and mapped to DP syllabus codes. None are copied from IB papers.
- Student history, class roster and pilot figures are sample data for demonstration, not results.
- Not an official sortmyprep product. IB is a trademark of the International Baccalaureate Organization.

Stack: React 19, Vite, Tailwind CSS 4, Motion, KaTeX, mathjs, lucide-react. Fonts: Figtree and IBM Plex
Serif, matching sortmyprep.com.
