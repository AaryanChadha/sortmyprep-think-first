import clsx from 'clsx'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/Layout'
import { Button, Note, Switch, Tag } from '../components/ui'
import { MAIN_QUESTIONS, SUBJECTS } from '../data/questions'

type Day = { d: number; title: string; what: string; to?: string; kind: 'diagnose' | 'target' | 'mixed' | 'rest' | 'retest' }

export default function Recovery() {
  const [subject, setSubject] = useState<string>('Maths AA')
  const topics = useMemo(() => [...new Set(MAIN_QUESTIONS.filter((q) => q.subject === subject).map((q) => q.topic))], [subject])
  const [lost, setLost] = useState<Record<string, number>>({})
  const [score, setScore] = useState('52')
  const [max, setMax] = useState('110')
  const [made, setMade] = useState(false)
  const [shareT, setShareT] = useState(true)
  const [shareP, setShareP] = useState(false)

  const ranked = topics.map((t) => ({ t, v: lost[t] ?? 0 })).sort((a, b) => b.v - a.v)
  const weakest = ranked.filter((r) => r.v > 0).slice(0, 3)

  const plan: Day[] = useMemo(() => {
    const w = weakest.length ? weakest : ranked.slice(0, 2)
    const qFor = (topic: string) => MAIN_QUESTIONS.find((q) => q.topic === topic)
    const short = (t: string) => t.replace(/^[^:]+:\s*/, '')
    const days: Day[] = [
      { d: 1, title: 'Redo the marks you lost', what: 'Re-attempt every question you dropped marks on, unaided, before looking at the scheme.', kind: 'diagnose' },
      { d: 2, title: 'Name the errors', what: 'Sorty groups your mistakes: method, accuracy or reading the question.', to: '/insights', kind: 'diagnose' },
      { d: 3, title: 'Explain it back', what: `Explain the idea behind ${short(w[0]?.t ?? topics[0])} in your own words.`, to: '/explain', kind: 'diagnose' },
    ]
    const targetDays = [4, 5, 6, 8, 9, 10]
    targetDays.forEach((d, i) => {
      const t = w[i % Math.max(1, w.length)]?.t ?? topics[0]
      const q = qFor(t)
      days.push({ d, title: short(t), what: i % 3 === 2 ? 'Prove it: matched question, no hints' : 'Step-by-step with hints locked for 40 seconds', to: q ? `/solve/${i % 3 === 2 && q.twin ? q.twin : q.id}${i % 3 === 2 ? '?prove=1' : ''}` : '/practice', kind: 'target' })
    })
    days.push({ d: 7, title: 'Rest', what: 'Rest counts. Your streak is safe.', kind: 'rest' })
    ;[11, 12, 13].forEach((d) => days.push({ d, title: 'Mixed, timed', what: 'Questions from all topics, under exam timing.', to: '/practice', kind: 'mixed' }))
    days.push({ d: 14, title: 'Retest', what: 'A matched version of your mock topics. Compare with day 1.', kind: 'retest' })
    return days.sort((a, b) => a.d - b.d)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lost, subject])

  return (
    <AppShell title="Bad grade recovery" sub="A disappointing mock is information. Tell Sorty where the marks went and it turns that into fourteen days of targeted work, ending with a retest.">
      <Note from="SCAMPER: Modify, and 5 Whys: parents only act after a bad grade">Turns the moment parents usually call a tutor into a plan the student owns.</Note>
      <div className="mt-4 grid gap-6 [&>*]:min-w-0 xl:grid-cols-[380px_1fr]">
        <div className="rounded-[16px] border border-line bg-white p-5 shadow-soft">
          <label className="block text-[13px] font-medium text-ink-2">
            Subject
            <select value={subject} onChange={(e) => { setSubject(e.target.value); setLost({}); setMade(false) }} className="mt-1.5 h-10 w-full rounded-[10px] border border-line-2 bg-white px-3 text-[14.5px] outline-none focus:border-blue">
              {SUBJECTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="text-[13px] font-medium text-ink-2">
              Your score
              <input value={score} onChange={(e) => setScore(e.target.value)} inputMode="numeric" className="mt-1.5 h-10 w-full rounded-[10px] border border-line-2 px-3 text-[14.5px] outline-none focus:border-blue" />
            </label>
            <label className="text-[13px] font-medium text-ink-2">
              Out of
              <input value={max} onChange={(e) => setMax(e.target.value)} inputMode="numeric" className="mt-1.5 h-10 w-full rounded-[10px] border border-line-2 px-3 text-[14.5px] outline-none focus:border-blue" />
            </label>
          </div>
          <div className="mt-5 text-[13px] font-medium text-ink-2">Marks lost by topic</div>
          <div className="mt-2 space-y-3.5">
            {topics.map((t) => (
              <label key={t} className="block">
                <div className="flex justify-between text-[13.5px]">
                  <span className="truncate pr-2">{t.replace(/^[^:]+:\s*/, '')}</span>
                  <span className="tabular-nums text-muted">{lost[t] ?? 0}</span>
                </div>
                <input type="range" min={0} max={20} value={lost[t] ?? 0} onChange={(e) => setLost((l) => ({ ...l, [t]: Number(e.target.value) }))} className="mt-1 w-full accent-[#4288ff]" />
              </label>
            ))}
          </div>
          <Button className="mt-5 w-full" onClick={() => setMade(true)}>
            Build my 14-day plan
          </Button>
        </div>

        <div>
          {!made ? (
            <div className="grid h-full min-h-[320px] place-items-center rounded-[16px] border border-dashed border-line-2 bg-white/60 p-8 text-center">
              <div>
                <p className="text-[17px] font-semibold">Move the sliders to where you lost marks</p>
                <p className="mt-1 text-[14.5px] text-muted">Then build the plan. Nothing is shared until you choose.</p>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-wrap items-baseline gap-3">
                <h2 className="text-[20px] font-semibold">
                  {subject}: {score}/{max}
                </h2>
                <span className="text-[14px] text-muted">Focus: {(weakest.length ? weakest : ranked.slice(0, 2)).map((w) => w.t.replace(/^[^:]+:\s*/, '')).join(', ')}</span>
              </div>
              <ol className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-7">
                {plan.map((d) => (
                  <li key={d.d} className={clsx('flex min-h-[132px] flex-col rounded-[12px] border p-3', d.kind === 'rest' ? 'border-line bg-wash/50' : d.kind === 'retest' ? 'border-ok/30 bg-ok-50' : d.kind === 'diagnose' ? 'border-blue/25 bg-blue-50/60' : 'border-line bg-white')}>
                    <div className="text-[11.5px] font-medium text-faint">Day {d.d}</div>
                    <div className="mt-0.5 text-[14px] font-semibold leading-snug">{d.title}</div>
                    <div className="mt-1 text-[12.5px] leading-snug text-muted">{d.what}</div>
                    {d.to && (
                      <Link to={d.to} className="mt-auto pt-2 text-[12.5px] font-semibold text-blue-700">
                        Start
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
              <div className="mt-5 flex flex-wrap items-center gap-6 rounded-[14px] border border-line bg-white px-4 py-3">
                <span className="text-[13.5px] font-medium text-ink-2">Share progress with</span>
                <Switch id="share-t" checked={shareT} onChange={setShareT} label="My teacher" />
                <Switch id="share-p" checked={shareP} onChange={setShareP} label="A parent (weekly note)" />
                <Tag tone="plain" className="ml-auto">Only effort and progress are shared</Tag>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
