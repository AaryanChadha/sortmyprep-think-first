import clsx from 'clsx'
import { motion, useInView } from 'motion/react'
import { ArrowRight, Check, Lock, LockOpen, ShieldCheck, Eye, FileCheck2, Mic, PenLine } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Footer, SiteNav } from '../components/Layout'
import { SortyMark } from '../components/Logo'
import { Sketch } from '../components/Sketch'
import { TensionMeter } from '../components/Tension'
import { Tex } from '../components/Tex'
import { Button, CountUp, Note, Ring, Segmented, SectionTitle, Tag } from '../components/ui'
import { BY_ID, MAIN_QUESTIONS } from '../data/questions'
import { useStore } from '../lib/store'
import { useTutor } from '../lib/tutor'

export default function Landing() {
  const loc = useLocation()
  useEffect(() => {
    const s = new URLSearchParams(loc.search).get('s')
    if (s) setTimeout(() => document.getElementById(s)?.scrollIntoView({ behavior: 'smooth' }), 60)
    else window.scrollTo(0, 0)
  }, [loc.search])
  return (
    <div className="bg-white">
      <SiteNav />
      <Hero />
      <BeforeAfter />
      <HowItWorks />
      <Tension />
      <MoreChanges />
      <Teachers />
      <Parents />
      <Pricing />
      <Faq />
      <ClosingCta />
      <Footer />
    </div>
  )
}

/* ─────────────── Hero ─────────────── */

const HEAD = ["You've", 'seen', 'the', 'answer.', 'Can', 'you', 'do', 'the', 'next', 'one?']

function Hero() {
  return (
    <section className="hero-wash relative overflow-hidden">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-20 pt-12 md:px-8 md:pt-16 lg:grid-cols-[1fr_minmax(0,540px)] lg:gap-14 lg:pb-28">
        <div>
          <Link to="/teacher" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/80 px-3 py-1 text-[13px] font-medium text-ink-2 shadow-soft hover:text-blue-700">
            I'm a teacher <ArrowRight className="size-3.5" />
          </Link>
          <h1 className="mt-6 text-balance text-[44px] font-semibold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[56px] lg:text-[64px]">
            {HEAD.map((w, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                transition={{ delay: 0.05 + i * 0.055, duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
              >
                {w}
                {i < HEAD.length - 1 ? ' ' : ''}
              </motion.span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75, duration: 0.6 }} className="mt-6 max-w-[34rem] text-pretty text-[18px] leading-relaxed text-muted md:text-[19px]">
            Sorty now asks for your first line before it helps, unlocks one hint at a time, checks each step against the IB mark scheme, and then hands you a fresh question to prove it stuck.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-8 flex flex-wrap items-center gap-3">
            <Button to="/solve/aa-cubic" size="lg">
              Try the question we tested
            </Button>
            <Button to="/changes" size="lg" variant="secondary">
              See what we changed
            </Button>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-6 max-w-[30rem] text-[13.5px] leading-relaxed text-faint">
            Built on what sortmyprep already has: board-aligned questions, step-by-step solutions, the insights dashboard and teacher visibility.
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}>
          <HeroDemo />
        </motion.div>
      </div>
    </section>
  )
}

function HeroDemo() {
  const base = BY_ID['aa-cubic']
  const q = useMemo(() => ({ ...base, approach: undefined }), [base])
  const settings = useStore((s) => s.settings)
  const policy = useStore((s) => s.policy)
  const t = useTutor(q, { policy, settings: { ...settings, voice: false, mode: 'with', reviewer: 'teacher' }, record: false })
  const nav = useNavigate()
  const [val, setVal] = useState('')
  const step = q.steps[t.current]
  const st = t.steps[t.current]
  const doneCount = t.steps.filter((s) => s.status !== 'open').length
  const lastNote = [...t.notes].reverse()[0]
  const limit = 2

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-[20px] border border-line bg-white shadow-lift">
        <div className="flex items-center gap-2 border-b border-line px-5 py-3 text-[12.5px]">
          <Tag tone="blue">Maths AA</Tag>
          <Tag>Syllabus {q.syllabus}</Tag>
          <Tag>{q.marks} marks</Tag>
          <span className="ml-auto text-faint">The question we tested Sorty on</span>
        </div>
        <div className="px-5 pb-5 pt-4">
          <p className="text-[16.5px] leading-[1.6]">
            <span className="font-semibold">Sketch. </span>
            <Tex>{q.stem.replace('Sketch the graph of ', 'The graph of ')}</Tex>
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_210px]">
            <div className="min-w-0">
              {doneCount < limit ? (
                <>
                  <div className="text-[12.5px] font-semibold text-muted">Step {t.current + 1} of {q.steps.length}</div>
                  <p className="mt-1 text-[15px]">
                    <Tex>{step.ask}</Tex>
                  </p>
                  <form
                    className="mt-2.5 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (val.trim()) {
                        t.submit(val)
                        setVal('')
                      }
                    }}
                  >
                    <input value={val} onChange={(e) => setVal(e.target.value)} placeholder={step.placeholder} className="h-10 min-w-0 flex-1 rounded-[10px] border border-line-2 px-3 text-[15px] outline-none focus:border-blue" aria-label="Your answer" autoComplete="off" />
                    <Button type="submit" disabled={!val.trim()}>
                      Check
                    </Button>
                  </form>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {st.attempts.map((a, i) => (
                      <span key={i} className={clsx('rounded-md px-2 py-0.5 text-[12.5px]', a.verdict.status === 'correct' ? 'bg-ok-50 text-ok' : 'bg-wash text-muted line-through')}>
                        {String(a.answer)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[12.5px] text-muted">
                    {t.unlockOf(st, st.hintLevel + 1).ok ? (
                      <button onClick={t.hint} className="inline-flex items-center gap-1 font-semibold text-blue-700">
                        <LockOpen className="size-3.5" /> {st.hintLevel === 0 ? 'Nudge' : st.hintLevel === 1 ? 'Hint' : 'Show this step'} unlocked
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Lock className="size-3.5" /> Nudge unlocks after one try
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-[12px] bg-ok-50 p-3.5 text-[14px] text-ink">
                  <div className="flex items-center gap-1.5 font-semibold text-ok">
                    <Check className="size-4" /> Two A1 marks, your own work
                  </div>
                  <p className="mt-1 text-muted">Two steps left: the shape at x = −2, and what happens for large x.</p>
                  <Button size="sm" className="mt-3" onClick={() => nav('/solve/aa-cubic')}>
                    Finish the question
                  </Button>
                </div>
              )}
            </div>
            <div className="rounded-[12px] border border-line bg-[#fbfcff] p-2">
              <Sketch spec={q.draw!} done={doneCount} />
            </div>
          </div>
          <div className="mt-4 min-h-[64px] rounded-[12px] border border-dashed border-blue/30 bg-blue-50/40 px-3.5 py-3">
            <div className="flex gap-2.5">
              <SortyMark className="mt-0.5 size-5 shrink-0" />
              <p className="sorty text-[15px]">
                <Tex>{lastNote?.text ?? 'Write the first thing you would try. If it is wrong, I will ask you about it rather than hand you the answer.'}</Tex>
              </p>
            </div>
          </div>
          <div className="mt-4">
            <TensionMeter seconds={st?.tut ?? 0} compact />
          </div>
        </div>
      </div>
      <Note from="Our free-trial test of Sorty" className="absolute -bottom-12 left-0">
        In the trial, Sorty gave these intercepts straight away. Here, you find them.
      </Note>
    </div>
  )
}

/* ─────────────── Before / after ─────────────── */

type Line = { who: 'you' | 'sorty'; text: string; tone?: 'ok' | 'warn' }
const TESTS: Record<string, { q: string; before: Line[]; after: Line[] }> = {
  graph: {
    q: BY_ID['aa-cubic'].stem,
    before: [
      { who: 'you', text: 'Can you help me with this question?' },
      { who: 'sorty', text: r(`The x-intercepts are at $x=\\tfrac32$ and $x=-2$, and the y-intercept is $(0,6)$. Since $(x+2)$ is squared, the curve touches the axis at $x=-2$…`) },
      { who: 'you', text: 'ok thanks' },
    ],
    after: [
      { who: 'sorty', text: 'Before any working: what would you find first, and why?' },
      { who: 'you', text: 'Where it hits the x-axis' },
      { who: 'sorty', text: 'Good instinct. List them.' },
      { who: 'you', text: '3, −2' },
      { who: 'sorty', text: r(`Check $x=3$ in $3-2x$. What do you get? Is that zero?`), tone: 'warn' },
      { who: 'you', text: '1.5, −2' },
      { who: 'sorty', text: 'A1. Each factor gives one place where the product is zero.', tone: 'ok' },
    ],
  },
  algebra: {
    q: BY_ID['aa-indices'].stem,
    before: [
      { who: 'you', text: r(`I multiplied by $x^{3/5}$ and got $6x^{6/5}+1=12$`) },
      { who: 'sorty', text: r(`Close, but the $1$ must also be multiplied: $6x^{6/5}+x^{3/5}-12=0$. Let $u=x^{3/5}$, then $6u^2+u-12=0$, so $(3u-4)(2u+3)=0$…`) },
    ],
    after: [
      { who: 'you', text: r(`$6u^2+1=12$`) },
      { who: 'sorty', text: r(`You multiplied $6u$ and $\\tfrac{12}{u}$ by $u$. What happened to the $+1$?`), tone: 'warn' },
      { who: 'you', text: r(`$6u^2+u-12=0$`) },
      { who: 'sorty', text: 'M1. You found your own error. I have logged it: you have dropped a term this way once before.', tone: 'ok' },
    ],
  },
}
function r(s: string) {
  return s
}

function BeforeAfter() {
  const [k, setK] = useState<'graph' | 'algebra'>('graph')
  const test = TESTS[k]
  return (
    <section className="border-t border-line bg-white py-24 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle title="Same question. Two very different tutors." sub="We tried Sorty's free trial on two IB Maths questions. It explained well, but it did the thinking. On the right is what the same moment looks like in this proposal." />
          <Segmented
            ariaLabel="Trial question"
            value={k}
            onChange={setK}
            options={[
              { value: 'graph', label: 'Graph sketch' },
              { value: 'algebra', label: 'Algebra error' },
            ]}
          />
        </div>
        <div className="mt-6 rounded-[14px] border border-line bg-wash/60 px-5 py-4 text-[16px]">
          <Tex>{test.q}</Tex>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Chat title="Sorty today" caption="Reconstructed from our free-trial test" lines={test.before} muted />
          <Chat title="Sorty in this proposal" caption="Try it yourself in the question bank" lines={test.after} />
        </div>
        <Note from="Problem statement and trial screenshots">The gap between "seeing an explanation" and "being able to do it" is the problem we chose to solve.</Note>
      </div>
    </section>
  )
}

function Chat({ title, caption, lines, muted }: { title: string; caption: string; lines: Line[]; muted?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  return (
    <div ref={ref} className={clsx('rounded-[16px] border p-5', muted ? 'border-line bg-[#fafbfd]' : 'border-blue/25 bg-white shadow-lift')}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className={clsx('text-[16px] font-semibold', muted ? 'text-muted' : 'text-ink')}>{title}</h3>
        <span className="text-[12.5px] text-faint">{caption}</span>
      </div>
      <div className="mt-4 space-y-2.5">
        {lines.map((l, i) => (
          <motion.div
            key={title + i + l.text}
            initial={{ opacity: 0, y: 6 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: muted ? 0.1 * i : 0.25 + 0.32 * i }}
            className={clsx('flex', l.who === 'you' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={clsx(
                'max-w-[88%] rounded-[14px] px-3.5 py-2.5 text-[14.5px] leading-relaxed',
                l.who === 'you' ? 'rounded-br-[4px] bg-ink text-white' : muted ? 'rounded-bl-[4px] bg-wash-2 text-ink-2' : clsx('sorty rounded-bl-[4px] bg-blue-50 text-[15px]', l.tone === 'ok' && '!text-ok', l.tone === 'warn' && 'ring-1 ring-tension/40'),
              )}
            >
              <Tex>{l.text}</Tex>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────── How it works ─────────────── */

function HowItWorks() {
  const steps = [
    { t: 'Plan your approach', d: 'Before any working, Sorty asks how you would start. A weak plan gets a question back, not a correction.', from: 'VibeWise' },
    { t: 'Try the step yourself', d: 'Each question is split the way marks are awarded. You see one step at a time and write your own line.', from: 'sortmyprep step-by-step' },
    { t: 'Hints unlock as you work', d: 'A nudge, then a hint, then the worked step. Each one unlocks after you try or after time on the step.', from: 'our team brief: time under tension' },
    { t: 'Prove it on a new question', d: 'Same skill, new numbers, no help. Your readiness score counts this result most.', from: '5 Whys: students' },
  ]
  return (
    <section id="how" className="scroll-mt-16 bg-wash/70 py-24 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <SectionTitle title="How a question works now" sub="Four moves, the same on every question. Sorty only does the next smallest useful thing." />
        <ol className="relative mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
          <div className="absolute left-[14px] top-0 h-full w-px bg-line-2 md:left-0 md:top-[14px] md:h-px md:w-full" aria-hidden />
          {steps.map((s, i) => (
            <li key={s.t} className="relative pl-12 md:pl-0 md:pt-12">
              <span className="absolute left-0 top-0 grid size-7 place-items-center rounded-full border border-blue/30 bg-white text-[13px] font-semibold text-blue-700 shadow-soft">{i + 1}</span>
              <h3 className="text-[18px] font-semibold tracking-[-0.01em]">{s.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.d}</p>
              <Note from={s.from} />
            </li>
          ))}
        </ol>
        <div className="mt-14">
          <Button to="/practice" variant="secondary">
            Browse {MAIN_QUESTIONS.length} questions <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

/* ─────────────── Time under tension ─────────────── */

function Tension() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.5 })
  const [s, setS] = useState(0)
  useEffect(() => {
    if (!inView) return
    const id = setInterval(() => setS((v) => (v >= 230 ? 0 : v + 4)), 60)
    return () => clearInterval(id)
  }, [inView])
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-5 md:px-8 lg:grid-cols-2">
        <div>
          <SectionTitle title="The marks are made in the minutes you're stuck." sub="In the gym, muscle grows from time under load, not from watching someone else lift. Sorty measures the same thing for thinking, and protects it." />
          <ul className="mt-8 space-y-4 text-[15.5px] leading-relaxed">
            {[
              ['Hints are earned.', 'A nudge unlocks after one try or 40 seconds on the step. Teachers can change the rule.'],
              ['Struggle has a limit.', 'After three minutes with no progress, Sorty offers the next hint. Staying stuck longer stops paying.'],
              ['Revealing is a decision.', 'To see a full solution you hold the button. No accidental peeks, and no marks for those steps.'],
            ].map(([a, b]) => (
              <li key={a} className="flex gap-3">
                <Check className="mt-1 size-4 shrink-0 text-blue" />
                <span>
                  <span className="font-semibold">{a}</span> <span className="text-muted">{b}</span>
                </span>
              </li>
            ))}
          </ul>
          <Note from="Our trial: Sorty promised step by step but gave answers">This is the core change of the proposal.</Note>
        </div>
        <div ref={ref} className="rounded-[20px] border border-line bg-[linear-gradient(180deg,#fbfcff,#f4f7fe)] p-6 md:p-8">
          <TensionMeter seconds={s} />
          <div className="mt-8 space-y-2">
            {[
              { l: 'Nudge', at: 40 },
              { l: 'Hint', at: 80 },
              { l: 'Show this step', at: 120 },
            ].map((h) => (
              <div key={h.l} className={clsx('flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-[14px] transition-colors', s >= h.at ? 'border-blue/40 bg-white text-ink' : 'border-line bg-wash/60 text-faint')}>
                {s >= h.at ? <LockOpen className="size-4 text-blue" /> : <Lock className="size-4" />}
                <span className="flex-1 font-medium">{h.l}</span>
                <span className="text-[12px]">{s >= h.at ? 'Unlocked' : `at ${h.at}s or ${h.at / 40} ${h.at === 40 ? 'try' : 'tries'}`}</span>
              </div>
            ))}
          </div>
          <figure className="mt-8 border-t border-line pt-6">
            <blockquote className="text-[15px] leading-relaxed text-ink-2">
              In a 2025 field experiment with high-school maths students, those given unrestricted GPT-4 access did better while they had it, then scored about 17% worse than the control group once it was taken away. A version with tutor guardrails largely removed that drop.
            </blockquote>
            <figcaption className="mt-2 text-[13px] text-faint">
              Bastani et al., PNAS, 2025.{' '}
              <a className="underline underline-offset-2 hover:text-ink" href="https://doi.org/10.1073/pnas.2422633122" target="_blank" rel="noreferrer">
                Read the study
              </a>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}

/* ─────────────── Other changes ─────────────── */

function MoreChanges() {
  return (
    <section className="border-t border-line bg-white py-24 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <SectionTitle title="Around the question, everything points at what to do next." sub="Ideas from our SCAMPER session and the founder interview, built into the parts of sortmyprep students already use." />
        <div className="mt-14 divide-y divide-line border-y border-line">
          <FeatureRow
            title="Explain it back"
            body="Explain a concept in your own words. Sorty ticks off the ideas you covered and asks about the first one you missed. It never rewrites your answer for you."
            from="SCAMPER: Rearrange"
            to="/explain"
            cta="Try explain it back"
            media={<ExplainMini />}
          />
          <FeatureRow
            title="Readiness, not hours"
            body="One score per subject, built from syllabus coverage, steps solved unaided and how recently you practised. Your streak counts days you solved something yourself, with one rest day a week."
            from="SCAMPER: Adapt (Duolingo, fitness trackers)"
            to="/plan"
            cta="See my plan"
            media={<ReadinessMini />}
          />
          <FeatureRow
            title="A bad mock becomes a two-week plan"
            body="Enter where you lost marks. Sorty builds fourteen days that start with your weakest topic, end with a retest, and can be shared with your teacher."
            from="SCAMPER: Modify"
            to="/recovery"
            cta="Build a recovery plan"
            media={<RecoveryMini />}
          />
          <FeatureRow
            title="Plan back from your exam date"
            body="Enter the date of your first paper. Sorty spreads the question bank across the weeks you have left: gaps first, then mixed practice, then timed papers."
            from="SCAMPER: Combine"
            to="/plan"
            cta="Plan to my exam"
            media={<PlanMini />}
          />
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[
            { icon: FileCheck2, t: 'Every line cites the mark scheme', d: 'Feedback names the M1, A1 or R1 it relates to, so you can check Sorty instead of trusting it.', from: 'SCAMPER: Substitute' },
            { icon: PenLine, t: 'It draws when words won’t do', d: 'Graphs and diagrams appear in Sorty’s ink, one part at a time, after you have worked that part out.', from: 'Riddled' },
            { icon: Mic, t: 'Choose your reviewer', d: 'Hear feedback from a strict examiner, a teacher who asks why, or a study buddy. Read aloud if you like.', from: 'Riddled' },
          ].map((f) => (
            <div key={f.t}>
              <f.icon className="size-5 text-blue" strokeWidth={1.8} />
              <h3 className="mt-3 text-[17px] font-semibold">{f.t}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{f.d}</p>
              <Note from={f.from} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureRow({ title, body, from, media, to, cta }: { title: string; body: string; from: string; media: React.ReactNode; to: string; cta: string }) {
  return (
    <div className="grid items-center gap-8 py-10 md:grid-cols-[1fr_1.1fr] md:gap-14 md:py-12">
      <div>
        <h3 className="text-[24px] font-semibold tracking-[-0.015em]">{title}</h3>
        <p className="mt-3 max-w-[30rem] text-[16px] leading-relaxed text-muted">{body}</p>
        <Note from={from} />
        <Link to={to} className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-semibold text-blue-700 hover:text-blue-600">
          {cta} <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="rounded-[16px] border border-line bg-[#fafbfe] p-5">{media}</div>
    </div>
  )
}

function ExplainMini() {
  const ideas = ['A squared factor is never negative', 'So y keeps its sign at x = 2', 'A single factor changes sign', 'Changing sign means crossing']
  return (
    <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr]">
      <div className="paper rounded-[10px] border border-line px-3 py-[6px] text-[14.5px] leading-[32px] text-ink-2">
        The bracket is squared so it can't go negative, so y stays the same sign either side of 2 and it bounces…
      </div>
      <div className="space-y-1.5">
        {ideas.map((i, k) => (
          <div key={i} className={clsx('flex items-start gap-2 text-[13.5px]', k < 2 ? 'text-ink' : 'text-faint')}>
            <span className={clsx('mt-[3px] grid size-4 shrink-0 place-items-center rounded-full', k < 2 ? 'bg-ok text-white' : 'border border-line-2')}>{k < 2 && <Check className="size-2.5" />}</span>
            {i}
          </div>
        ))}
        <p className="sorty pt-1.5 text-[14px]">What happens to the sign of (x + 1) as x passes −1?</p>
      </div>
    </div>
  )
}

function ReadinessMini() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {[
        ['Maths AA', 71],
        ['Physics', 58],
        ['Chemistry', 46],
      ].map(([s, v]) => (
        <div key={s} className="text-center">
          <Ring value={v as number} size={76} stroke={7} />
          <div className="mt-1.5 text-[13px] text-muted">{s}</div>
        </div>
      ))}
      <div className="min-w-[150px] flex-1">
        <div className="text-[13px] text-muted">Effort streak</div>
        <div className="text-[28px] font-semibold tabular-nums tracking-[-0.02em]">
          <CountUp to={12} /> days
        </div>
        <div className="mt-2 flex gap-1">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className={clsx('h-5 flex-1 rounded-[4px]', i === 10 ? 'bg-wash-2' : i > 1 ? 'bg-blue' : 'bg-blue-100')} />
          ))}
        </div>
        <div className="mt-1 text-[12px] text-faint">One rest day used this week</div>
      </div>
    </div>
  )
}

function RecoveryMini() {
  const days = ['Redo lost marks', 'Redo lost marks', 'Explain it back', 'Calculus', 'Calculus', 'Calculus', 'Rest', 'Trig', 'Trig', 'Trig', 'Mixed, timed', 'Mixed, timed', 'Mixed, timed', 'Retest']
  return (
    <div>
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="font-medium text-ink-2">Mock: Maths AA Paper 1, 52/110</span>
        <span className="text-faint">Day 4 of 14</span>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {days.map((d, i) => (
          <div key={i} className={clsx('rounded-[8px] border px-1.5 py-2 text-[11px] leading-tight', i < 3 ? 'border-ok/25 bg-ok-50 text-ok' : i === 3 ? 'border-blue bg-blue-50 font-semibold text-blue-700' : d === 'Rest' ? 'border-line bg-white text-faint' : 'border-line bg-white text-muted')}>
            <div className="text-[10px] opacity-70">Day {i + 1}</div>
            {d}
          </div>
        ))}
      </div>
    </div>
  )
}

function PlanMini() {
  const weeks = [
    ['Gaps', 'bg-blue-100', 8],
    ['Mixed practice', 'bg-blue/60', 9],
    ['Timed papers', 'bg-blue', 4],
    ['Taper', 'bg-ink/80', 1],
  ] as const
  return (
    <div>
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="font-medium text-ink-2">22 weeks to your first paper</span>
        <span className="text-faint">8 hours a week</span>
      </div>
      <div className="mt-3 flex h-9 overflow-hidden rounded-[8px]">
        {weeks.map(([l, c, w]) => (
          <div key={l} className={clsx(c, 'border-r border-white/70')} style={{ flex: w }} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-muted">
        {weeks.map(([l, c, w]) => (
          <span key={l} className="inline-flex items-center gap-1.5">
            <span className={clsx('size-2.5 rounded-[3px]', c)} /> {l} ({w} wk)
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─────────────── Teachers ─────────────── */

function Teachers() {
  const rows = [
    { n: 'Aanya S.', step: 'Step 3 of 4', t: '2:41', s: 'Struggling well' },
    { n: 'Rohan K.', step: 'Step 1 of 4', t: '4:10', s: 'Stuck: hint offered', warn: true },
    { n: 'Meera P.', step: 'Done, unaided', t: '6:02', s: 'Proved it', ok: true },
    { n: 'Kabir M.', step: 'Step 2 of 4', t: '1:12', s: 'Self-corrected' },
  ]
  return (
    <section id="teachers" className="scroll-mt-16 bg-[#0f1b2d] py-24 text-white md:py-28">
      <div className="mx-auto grid max-w-[1200px] items-start gap-14 px-5 md:px-8 lg:grid-cols-[1fr_1.05fr] [&>*]:min-w-0">
        <div>
          <h2 className="text-balance text-[34px] font-semibold leading-[1.08] tracking-[-0.02em] md:text-[44px]">Sorty works under your rules.</h2>
          <p className="mt-4 max-w-[34rem] text-[17px] leading-relaxed text-white/70">
            You decide when hints unlock, whether full solutions can be shown, and which marks stand. Every AI mark shows its mark-scheme line and can be changed, with a record of who changed it and why.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {[
              [Eye, 'See the working, live', 'Who is on which step, for how long, and where they got stuck.'],
              [ShieldCheck, 'Your marks win', 'Accept or change any proposed mark. Agreement rate is tracked.'],
            ].map(([I, a, b]) => {
              const Icon = I as typeof Eye
              return (
                <div key={a as string}>
                  <Icon className="size-5 text-[#8db6ff]" strokeWidth={1.8} />
                  <div className="mt-2.5 font-semibold">{a as string}</div>
                  <p className="mt-1 text-[14.5px] leading-relaxed text-white/65">{b as string}</p>
                </div>
              )
            })}
          </div>
          <div className="mt-10 rounded-[14px] border border-white/12 bg-white/[.04] p-5">
            <div className="font-semibold">Start with a private pilot</div>
            <ol className="mt-3 space-y-2 text-[14.5px] text-white/75">
              <li className="flex gap-3"><span className="text-[#8db6ff]">1</span> One class, four weeks, your rules.</li>
              <li className="flex gap-3"><span className="text-[#8db6ff]">2</span> Nothing goes to parents or leadership until you choose.</li>
              <li className="flex gap-3"><span className="text-[#8db6ff]">3</span> You get the evidence: marking time saved, unaided steps, errors fixed.</li>
            </ol>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/teacher" size="lg">
              Open the teacher view
            </Button>
          </div>
          <Note dark from="the problem brief: teacher-first adoption and the performance paradox">The pilot lets a school test privately before anyone has to defend it in public.</Note>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-white p-5 text-ink shadow-[0_40px_80px_-40px_rgba(0,0,0,.6)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold">DP2 Maths AA SL, section B</div>
              <div className="text-[12.5px] text-muted">Live now: fractional indices set</div>
            </div>
            <Tag tone="ok">4 working</Tag>
          </div>
          <ul className="mt-4 divide-y divide-line rounded-[12px] border border-line">
            {rows.map((r) => (
              <li key={r.n} className="flex items-center gap-3 px-3.5 py-2.5 text-[14px]">
                <span className="grid size-7 place-items-center rounded-full bg-wash-2 text-[11.5px] font-semibold text-ink-2">{r.n.split(' ').map((x) => x[0]).join('')}</span>
                <span className="font-medium sm:w-24">{r.n}</span>
                <span className="hidden flex-1 text-muted sm:block">{r.step}</span>
                <span className="ml-auto tabular-nums text-muted sm:ml-0">{r.t}</span>
                <span className={clsx('ml-auto text-right text-[12.5px] sm:ml-0 sm:w-36', r.warn ? 'text-[#a3650f]' : r.ok ? 'text-ok' : 'text-blue-700')}>{r.s}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 text-[13px] font-medium text-ink-2">Most common errors this week</div>
          <div className="mt-2 space-y-2">
            {[
              ['Dropped a term when multiplying through', 7],
              ['Repeated root treated as single', 4],
              ['Strict vs inclusive inequality', 3],
            ].map(([l, n]) => (
              <div key={l as string} className="flex items-center gap-3 text-[13.5px]">
                <span className="flex-1 truncate">{l}</span>
                <span className="h-2 rounded-full bg-tension/70" style={{ width: `${(n as number) * 14}px` }} />
                <span className="w-5 text-right tabular-nums text-muted">{n}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[12px] bg-blue-50 p-3.5 text-[13.5px]">
            <div className="flex items-center gap-2 font-semibold text-blue-700">
              <SortyMark className="size-5" /> Drafted for your approval
            </div>
            <p className="mt-1 text-ink-2">A 3-question set on multiplying through, for the 7 students above. Prove it mode, due Friday.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────── Parents ─────────────── */

function Parents() {
  return (
    <section id="parents" className="scroll-mt-16 bg-white py-24 md:py-28">
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-5 md:px-8 lg:grid-cols-[1fr_1fr]">
        <div className="order-2 lg:order-1">
          <div className="mx-auto max-w-[440px] rounded-[18px] border border-line bg-white p-6 shadow-lift">
            <div className="text-[12.5px] text-faint">Sunday, weekly note</div>
            <div className="mt-1 text-[19px] font-semibold tracking-[-0.01em]">Kabir's week</div>
            <dl className="mt-5 grid grid-cols-3 gap-4">
              {[
                ['Sessions', '6'],
                ['Under tension', '2h 10m'],
                ['Solved alone', '18 steps'],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[12px] text-muted">{k}</dt>
                  <dd className="text-[19px] font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 rounded-[12px] bg-ok-50 px-3.5 py-3 text-[14px] text-ink-2">
              Fixed a recurring algebra error: right on 2 of 2 retries without help.
            </div>
            <div className="mt-4 text-[13px] font-medium text-ink-2">One thing to ask him</div>
            <p className="sorty mt-1 text-[15px]">"Can you show me how you'd start a fractional-index equation?"</p>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <SectionTitle title="See the effort, not just the grade." sub="Parents mostly hear about progress at parent-teacher meetings, after the grade is already in. A short weekly note shows whether practice is happening and whether it is working, before the next test." />
          <p className="mt-5 max-w-[34rem] text-[15px] leading-relaxed text-muted">The note never includes your child's chats or individual mistakes. Students can see exactly what is shared.</p>
          <Note from="5 Whys: parents can't see effort early enough" />
          <Link to="/parent" className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-blue-700">
            Read a sample note <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─────────────── Pricing ─────────────── */

function Pricing() {
  return (
    <section className="border-t border-line bg-wash/60 py-24 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <SectionTitle title="Two ways in" sub="Pricing follows the model described in our founder interview. Exact rates are for sortmyprep to set." />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="rounded-[18px] border border-line bg-white p-7">
            <div className="text-[15px] font-semibold text-muted">Students</div>
            <div className="mt-2 text-[30px] font-semibold tracking-[-0.02em]">Subscription</div>
            <p className="mt-1 text-[15px] text-muted">Monthly, yearly or two-year, per board.</p>
            <ul className="mt-6 space-y-2.5 text-[15px]">
              {['All questions with step-by-step checking', 'Time under tension and Prove it', 'Explain it back, exam plan, recovery plan', 'Weekly note for a parent, if you choose'].map((x) => (
                <li key={x} className="flex gap-2.5"><Check className="mt-1 size-4 shrink-0 text-blue" />{x}</li>
              ))}
            </ul>
            <Button to="/practice" className="mt-8" variant="secondary">Start with a free question</Button>
          </div>
          <div className="relative rounded-[18px] border border-blue/30 bg-white p-7 shadow-lift">
            <div className="text-[15px] font-semibold text-blue-700">Schools</div>
            <div className="mt-2 text-[30px] font-semibold tracking-[-0.02em]">
              $30–40 <span className="text-[17px] font-medium text-muted">per student</span>
            </div>
            <p className="mt-1 text-[15px] text-muted">On a two-year cycle, after a free private pilot.</p>
            <ul className="mt-6 space-y-2.5 text-[15px]">
              {['Everything students get', 'Teacher dashboard with live working', 'Hint and reveal rules per class', 'Mark review with a change log', 'Pilot evidence report for leadership'].map((x) => (
                <li key={x} className="flex gap-2.5"><Check className="mt-1 size-4 shrink-0 text-blue" />{x}</li>
              ))}
            </ul>
            <Button to="/teacher?tab=pilot" className="mt-8">Plan a pilot</Button>
            <Note from="Founder interview: school plans, recurring revenue" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────── FAQ ─────────────── */

function Faq() {
  const items = [
    ['Will Sorty ever just give me the answer?', 'Yes, if you hold the button for it, or after the third hint on a step. You will not get the marks for those steps, and a matched question goes on your retry list so you can prove it later.'],
    ['How do I know the feedback is right?', 'Every comment names the mark-scheme line it comes from, and every question shows its syllabus code. If something looks wrong, your teacher can change the mark and the change is recorded.'],
    ['Does it work for essays and explanations?', 'For short explanations, Sorty checks your answer against the marking points and tells you which are missing. For long answers like Economics Paper 1, it suggests a markband with reasons and your teacher confirms it.'],
    ['What does my teacher see?', 'If your school uses sortmyprep, your teacher sees your steps, time and hints on work they set. Your free-practice chats stay private.'],
    ['Is this the real sortmyprep?', 'No. It is a concept prototype made by a student team to show sortmyprep a direction. The question bank is a sample written for it.'],
  ]
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="bg-white py-24 md:py-28">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionTitle title="Questions students ask first" />
        <div className="divide-y divide-line border-y border-line">
          {items.map(([qq, a], i) => (
            <div key={qq}>
              <button className="flex w-full items-center justify-between gap-4 py-5 text-left text-[17px] font-semibold" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                {qq}
                <span className={clsx('grid size-7 shrink-0 place-items-center rounded-full border border-line text-muted transition-transform', open === i && 'rotate-45')}>+</span>
              </button>
              <motion.div initial={false} animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }} className="overflow-hidden">
                <p className="max-w-[60ch] pb-6 text-[15.5px] leading-relaxed text-muted">{a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ClosingCta() {
  return (
    <section className="hero-wash border-t border-line py-24">
      <div className="mx-auto max-w-[1200px] px-5 text-center md:px-8">
        <p className="mx-auto max-w-[30ch] text-balance text-[30px] font-semibold leading-tight tracking-[-0.02em] md:text-[40px]">Try the question that started this.</p>
        <p className="mx-auto mt-4 max-w-[44ch] text-[17px] text-muted">Three marks, four steps. See how far you get before you need a hint.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button to="/solve/aa-cubic" size="lg">
            Start the question
          </Button>
          <Button to="/practice" size="lg" variant="secondary">
            Browse all questions
          </Button>
        </div>
      </div>
    </section>
  )
}
