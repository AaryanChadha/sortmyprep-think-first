import clsx from 'clsx'
import { CalendarPlus, Flame } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/Layout'
import { Button, Note, Ring, Tag } from '../components/ui'
import { MAIN_QUESTIONS, SUBJECTS } from '../data/questions'
import { readiness, streak } from '../lib/analytics'
import { day, iso, updatePlan, useStore } from '../lib/store'

type Week = { n: number; start: Date; phase: string; items: { label: string; to: string; subject: string }[] }

export default function Plan() {
  const plan = useStore((s) => s.plan)
  const attempts = useStore((s) => s.attempts)
  const misconceptions = useStore((s) => s.misconceptions)
  const activeDays = useStore((s) => s.activeDays)

  const exam = new Date(plan.examDate + 'T09:00:00')
  const weeksLeft = Math.max(1, Math.ceil((exam.getTime() - Date.now()) / (7 * day)))
  const ready = useMemo(() => plan.subjects.map((s) => readiness(attempts, s)), [plan.subjects, attempts])
  const st = streak(activeDays)

  const weeks: Week[] = useMemo(() => {
    // Topic priority: never attempted, then topics with unfixed errors, then the rest.
    const attempted = new Set(attempts.map((a) => a.qid))
    const errorQs = new Set(misconceptions.filter((m) => !m.fixed).map((m) => m.qid))
    const pool = MAIN_QUESTIONS.filter((q) => plan.subjects.includes(q.subject)).sort((a, b) => {
      const score = (id: string) => (!attempted.has(id) ? 0 : errorQs.has(id) ? 1 : 2)
      return score(a.id) - score(b.id)
    })
    const perWeek = Math.max(1, Math.round(plan.hours / 3))
    const out: Week[] = []
    const shown = Math.min(weeksLeft, 26)
    for (let w = 0; w < shown; w++) {
      const frac = w / weeksLeft
      const phase = weeksLeft - w <= 1 ? 'Taper' : frac < 0.4 ? 'Close gaps' : frac < 0.8 ? 'Mixed practice' : 'Timed papers'
      const items: Week['items'] = []
      if (phase === 'Timed papers') {
        plan.subjects.forEach((s) => items.push({ label: `${s}: one full paper, timed`, to: '/practice', subject: s }))
      } else if (phase === 'Taper') {
        items.push({ label: 'Light review of your error log, then rest', to: '/insights', subject: '' })
      } else {
        for (let k = 0; k < perWeek; k++) {
          const q = pool[(w * perWeek + k) % Math.max(1, pool.length)]
          if (q) items.push({ label: `${q.subject}: ${q.topic.replace(/^[^:]+:\s*/, '')}`, to: `/solve/${q.id}`, subject: q.subject })
        }
        if (phase === 'Mixed practice') items.push({ label: 'Prove it: 3 matched questions, no hints', to: '/insights', subject: '' })
      }
      out.push({ n: w + 1, start: new Date(Date.now() + w * 7 * day), phase, items })
    }
    return out
  }, [plan, attempts, misconceptions, weeksLeft])

  const ics = () => {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//sortmyprep prototype//EN']
    weeks.forEach((w) => {
      const d = w.start
      const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
      lines.push('BEGIN:VEVENT', `UID:smp-week-${w.n}@proto`, `DTSTART;VALUE=DATE:${ymd}`, `SUMMARY:sortmyprep week ${w.n}: ${w.phase}`, `DESCRIPTION:${w.items.map((i) => i.label).join(' | ')}`, 'END:VEVENT')
    })
    lines.push('END:VCALENDAR')
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'sortmyprep-plan.ics'
    a.click()
  }

  const last28 = Array.from({ length: 28 }, (_, i) => iso(Date.now() - (27 - i) * day))

  return (
    <AppShell title="Exam plan" sub="Plan back from the date of your first paper. Sorty fills the weeks with the questions you most need, and moves things as your results change.">
      <div className="grid gap-5 [&>*]:min-w-0 xl:grid-cols-[1.1fr_1fr]">
        <div className="rounded-[16px] border border-line bg-white p-5 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-[13px] font-medium text-ink-2">
              First paper
              <input type="date" value={plan.examDate} onChange={(e) => updatePlan({ examDate: e.target.value })} className="mt-1.5 h-10 w-full rounded-[10px] border border-line-2 px-3 text-[14.5px] outline-none focus:border-blue" />
            </label>
            <label className="text-[13px] font-medium text-ink-2">
              Hours a week
              <input type="number" min={2} max={30} value={plan.hours} onChange={(e) => updatePlan({ hours: Math.max(2, Math.min(30, Number(e.target.value) || 2)) })} className="mt-1.5 h-10 w-full rounded-[10px] border border-line-2 px-3 text-[14.5px] outline-none focus:border-blue" />
            </label>
            <div className="text-[13px] font-medium text-ink-2">
              Weeks left
              <div className="mt-1.5 flex h-10 items-center text-[22px] font-semibold tabular-nums">{weeksLeft}</div>
            </div>
          </div>
          <div className="mt-4 text-[13px] font-medium text-ink-2">Subjects</div>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {SUBJECTS.map((s) => {
              const on = plan.subjects.includes(s)
              return (
                <button key={s} onClick={() => updatePlan({ subjects: on ? plan.subjects.filter((x) => x !== s) : [...plan.subjects, s] })} className={clsx('h-8 rounded-full border px-3 text-[13.5px] font-medium', on ? 'border-blue bg-blue-50 text-blue-700' : 'border-line text-muted hover:border-ink/30')} aria-pressed={on}>
                  {s}
                </button>
              )
            })}
          </div>
          <Note from="SCAMPER: Combine the question bank with the study planner" />
        </div>

        <div className="grid gap-5 [&>*]:min-w-0 sm:grid-cols-[1.3fr_1fr]">
          <div className="rounded-[16px] border border-line bg-white p-5 shadow-soft">
            <div className="text-[13.5px] font-medium text-ink-2">Readiness</div>
            <div className="mt-3 flex flex-wrap gap-5">
              {ready.map((r) => (
                <div key={r.subject} className="text-center">
                  <Ring value={r.score} size={70} />
                  <div className="mt-1 text-[12.5px] text-muted">{r.subject}</div>
                </div>
              ))}
              {ready.length === 0 && <p className="text-[14px] text-muted">Pick a subject to see readiness.</p>}
            </div>
            <details className="mt-3 text-[12.5px] text-muted">
              <summary className="cursor-pointer font-medium text-ink-2">How this is worked out</summary>
              <p className="mt-1.5 leading-relaxed">40% syllabus coverage, 40% steps solved without hints, 20% how recently you practised. Prove it results count at full weight. Hours logged do not count.</p>
              <ul className="mt-2 space-y-1">
                {ready.map((r) => (
                  <li key={r.subject} className="tabular-nums">
                    {r.subject}: coverage {Math.round(r.coverage * 100)}%, unaided {Math.round(r.unaided * 100)}%, recency {Math.round(r.recency * 100)}%
                  </li>
                ))}
              </ul>
            </details>
            <Note from="SCAMPER: Adapt (fitness tracker readiness score)" />
          </div>
          <div className="rounded-[16px] border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2 text-[13.5px] font-medium text-ink-2">
              <Flame className="size-4 text-tension" /> Effort streak
            </div>
            <div className="mt-1 text-[34px] font-semibold tabular-nums tracking-[-0.02em]">{st} days</div>
            <div className="mt-3 grid grid-cols-7 gap-1">
              {last28.map((d) => (
                <span key={d} title={d} className={clsx('aspect-square rounded-[4px]', activeDays.includes(d) ? 'bg-blue' : 'bg-wash-2')} />
              ))}
            </div>
            <p className="mt-3 text-[12.5px] leading-snug text-muted">A day counts when you solve at least one step without help. One rest day a week keeps the streak.</p>
            <Note from="SCAMPER: Adapt (Duolingo streak, nudge theory)" />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[20px] font-semibold tracking-[-0.01em]">Week by week</h2>
        <Button variant="secondary" onClick={ics}>
          <CalendarPlus className="size-4" /> Add to my calendar
        </Button>
      </div>
      <ol className="mt-4 space-y-2">
        {weeks.map((w) => (
          <li key={w.n} className={clsx('grid gap-3 rounded-[14px] border bg-white p-4 md:grid-cols-[150px_140px_1fr] md:items-center', w.n === 1 ? 'border-blue/40 shadow-soft' : 'border-line')}>
            <div>
              <div className="text-[14.5px] font-semibold">Week {w.n}{w.n === 1 && ' (this week)'}</div>
              <div className="text-[12.5px] text-faint">{w.start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</div>
            </div>
            <div>
              <Tag tone={w.phase === 'Close gaps' ? 'blue' : w.phase === 'Mixed practice' ? 'plain' : w.phase === 'Timed papers' ? 'warn' : 'ok'}>{w.phase}</Tag>
            </div>
            <ul className="flex flex-wrap gap-2">
              {w.items.map((it, i) => (
                <li key={i}>
                  <Link to={it.to} className="inline-block rounded-[8px] border border-line bg-wash/60 px-2.5 py-1.5 text-[13px] text-ink-2 hover:border-blue/40 hover:text-blue-700">
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {weeksLeft > 26 && <p className="mt-3 text-[13px] text-faint">Showing the next 26 weeks. Later weeks fill in as you go.</p>}
    </AppShell>
  )
}
