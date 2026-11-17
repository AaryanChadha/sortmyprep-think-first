import clsx from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronDown, Lock, LockOpen, MessageCircleQuestion, Volume2, X, Workflow, ArrowRight, RotateCcw, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BY_ID } from '../data/questions'
import type { Question, Step } from '../data/types'
import { fmtDuration } from '../lib/analytics'
import { askLive, askScripted } from '../lib/llm'
import { updateSettings, useStore } from '../lib/store'
import { stepWeight, useTutor, type MarginNote, type StepState } from '../lib/tutor'
import { SortyMark } from './Logo'
import { Sketch } from './Sketch'
import { HoldButton, TensionMeter, mmss } from './Tension'
import { Tex } from './Tex'
import { Button, Note, Segmented, Switch, Tag } from './ui'

export function Solver({ q, prove = false }: { q: Question; prove?: boolean }) {
  const settings = useStore((s) => s.settings)
  const policy = useStore((s) => s.policy)
  const [showTrace, setShowTrace] = useState(false)
  const t = useTutor(q, { prove, policy, settings })
  const nav = useNavigate()
  const done = t.steps.filter((s) => s.status !== 'open').length
  const curStep = t.steps[t.current]
  const twin = q.twin ? BY_ID[q.twin] : undefined

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* ── Notebook ── */}
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <Segmented
            ariaLabel="Sorty mode"
            size="sm"
            value={settings.mode}
            onChange={(v) => updateSettings({ mode: v })}
            options={[
              { value: 'with', label: 'Thinks with you' },
              { value: 'ask', label: 'Waits to be asked' },
            ]}
          />
          <Segmented
            ariaLabel="Reviewer"
            size="sm"
            value={settings.reviewer}
            onChange={(v) => updateSettings({ reviewer: v })}
            options={[
              { value: 'teacher', label: 'Teacher' },
              { value: 'examiner', label: 'Examiner' },
              { value: 'buddy', label: 'Study buddy' },
            ]}
          />
          <Switch id="voice" checked={settings.voice} onChange={(v) => updateSettings({ voice: v })} label={<span className="inline-flex items-center gap-1"><Volume2 className="size-3.5" /> Read aloud</span>} />
        </div>
        <Note from="Riddled: two modes per note, reviewer personas, voice">Choose whether Sorty speaks up or waits, and who is reviewing your work.</Note>

        <div className="mt-4 overflow-hidden rounded-[16px] border border-line bg-white shadow-soft">
          {/* question header */}
          <div className="border-b border-line bg-[linear-gradient(180deg,#fbfcff,#fff)] px-5 py-5 md:px-7">
            <div className="flex flex-wrap items-center gap-1.5 text-[12.5px]">
              <Tag tone="blue">{q.course}</Tag>
              <Tag>{q.paper}</Tag>
              <Tag>Syllabus {q.syllabus}</Tag>
              <Tag>{q.marks} marks</Tag>
              <Tag>About {q.minutes} min</Tag>
              {q.source === 'trial' && <Tag tone="warn">The question we tested Sorty on</Tag>}
              {prove && <Tag tone="ok">Prove it: no hints</Tag>}
            </div>
            <div className="mt-3.5 text-[18px] leading-[1.6] text-ink md:text-[19px]">
              {!q.stem.toLowerCase().startsWith(q.command.toLowerCase()) && <span className="mr-2 font-semibold">{q.command}.</span>}
              <Tex>{q.stem}</Tex>
            </div>
          </div>

          {/* approach checkpoint */}
          {q.approach && !prove && (
            <Row
              label="Plan"
              active={t.phase === 'approach'}
              done={t.phase !== 'approach'}
              notes={t.notes.filter((n) => n.step === -1)}
              q={q}
            >
              <p className="text-[15.5px] font-medium text-ink"><Tex>{q.approach.ask}</Tex></p>
              <div className="mt-3 grid gap-2">
                {q.approach.options.map((o, i) => (
                  <button
                    key={i}
                    disabled={t.phase !== 'approach'}
                    onClick={() => t.pickApproach(i)}
                    className={clsx(
                      'rounded-[10px] border px-3.5 py-2.5 text-left text-[14.5px] transition-colors',
                      t.approachPick === i ? (o.good ? 'border-ok/40 bg-ok-50' : 'border-tension/50 bg-tension-50') : 'border-line hover:border-blue/40 hover:bg-blue-50/40',
                      t.phase !== 'approach' && t.approachPick !== i && 'opacity-50',
                    )}
                  >
                    <Tex>{o.text}</Tex>
                  </button>
                ))}
              </div>
              {t.phase === 'approach' && (
                <button onClick={t.skipApproach} className="mt-3 text-[13px] font-medium text-muted underline-offset-2 hover:text-ink hover:underline">
                  Skip planning and start
                </button>
              )}
              <Note from="VibeWise: approach first">Sorty asks how you'd start before it shows any working.</Note>
            </Row>
          )}

          {/* steps */}
          {t.phase !== 'approach' &&
            q.steps.map((step, i) => {
              if (i > t.current && t.steps[i].status === 'open') return null
              return (
                <Row key={i} label={`Step ${i + 1}`} active={i === t.current && t.phase === 'steps'} done={t.steps[i].status !== 'open'} notes={t.notes.filter((n) => n.step === i)} q={q} stepIndex={i} assisted={t.steps[i].status === 'assisted'} mark={step.mark}>
                  <StepBody step={step} st={t.steps[i]} active={i === t.current && t.phase === 'steps'} onSubmit={t.submit} />
                </Row>
              )
            })}

          {t.phase === 'steps' && t.current + 1 < q.steps.length && (
            <div className="border-t border-dashed border-line px-7 py-3 text-[13px] text-faint">
              {q.steps.length - t.current - 1} more step{q.steps.length - t.current - 1 > 1 ? 's' : ''} after this. They appear as you go.
            </div>
          )}

          <AnimatePresence>{t.phase === 'done' && <Summary q={q} prove={prove} t={t} twin={twin} onProve={() => twin && nav(`/solve/${twin.id}?prove=1`)} />}</AnimatePresence>
        </div>

        {t.phase === 'steps' && !prove && <AskBox q={q} t={t} />}
      </div>

      {/* ── Right rail ── */}
      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-[16px] border border-line bg-white p-4 shadow-soft">
          <TensionMeter seconds={t.phase === 'steps' && curStep ? curStep.tut : t.summary.tut} />
          <Note from="our team brief: time under tension">Hints unlock after you try, or after time on the step. Your teacher sets the rule.</Note>
          {!prove && t.phase === 'steps' && curStep && (
            <div className="mt-4 space-y-1.5">
              {[1, 2, 3].map((lvl) => {
                const u = t.unlockOf(curStep, lvl)
                const used = curStep.hintLevel >= lvl
                const nextUp = curStep.hintLevel + 1 === lvl
                const label = lvl === 1 ? 'Nudge' : lvl === 2 ? 'Hint' : 'Show this step'
                return (
                  <button
                    key={lvl}
                    onClick={nextUp ? t.hint : undefined}
                    disabled={!nextUp}
                    className={clsx(
                      'flex w-full items-center gap-2.5 rounded-[10px] border px-3 py-2 text-left text-[13.5px] transition-colors',
                      used ? 'border-blue-100 bg-blue-50 text-blue-700' : nextUp && u.ok ? 'border-blue/50 bg-white font-semibold text-ink hover:bg-blue-50' : 'border-line bg-wash/60 text-faint',
                    )}
                  >
                    {used ? <Check className="size-4" /> : u.ok ? <LockOpen className="size-4 text-blue" /> : <Lock className="size-4" />}
                    <span className="flex-1">{label}</span>
                    {!used && !u.ok && nextUp && <span className="text-[11.5px] font-normal">{u.why.replace('Unlocks after ', '')}</span>}
                    {lvl === 3 && !used && <span className="text-[11px] font-normal text-faint">no mark</span>}
                  </button>
                )
              })}
              <div className="pt-2">
                <HoldButton onDone={t.reveal} disabled={policy.reveal === 'locked' || (policy.reveal === 'after-attempts' && !t.allAttempted)}>
                  {policy.reveal === 'locked' ? 'Full solution locked by your teacher' : policy.reveal === 'after-attempts' && !t.allAttempted ? 'Full solution after you try every step' : 'Hold to see the full solution'}
                </HoldButton>
              </div>
            </div>
          )}
          {prove && t.phase === 'steps' && <p className="mt-3 text-[13px] leading-snug text-muted">Same skill, new numbers. No hints, no reveal. This is the result your readiness score trusts most.</p>}
        </div>

        {q.draw && (
          <div className="rounded-[16px] border border-line bg-white p-4 shadow-soft">
            <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-ink-2">
              <SortyMark className="size-5" /> Sorty's sketch
            </div>
            <Sketch spec={q.draw} done={t.phase === 'done' ? q.steps.length + 1 : done} />
            <Note from="Riddled: draws when words won't do">Each part appears only after you've worked it out.</Note>
          </div>
        )}

        <MarkTracker q={q} steps={t.steps} />

        <div className="rounded-[16px] border border-line bg-white shadow-soft">
          <button onClick={() => setShowTrace((v) => !v)} className="flex w-full items-center gap-2 px-4 py-3 text-left text-[13.5px] font-medium text-ink-2" aria-expanded={showTrace}>
            <Workflow className="size-4 text-blue" />
            <span className="flex-1">How Sorty decided</span>
            <span className="text-[12px] text-faint">{t.trace.length} decisions</span>
            <ChevronDown className={clsx('size-4 transition-transform', showTrace && 'rotate-180')} />
          </button>
          <AnimatePresence initial={false}>
            {showTrace && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <ol className="scrollbar-thin max-h-[360px] space-y-3 overflow-auto border-t border-line px-4 py-3">
                  {[...t.trace].reverse().map((e) => (
                    <motion.li key={e.id} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[12.5px] leading-snug">
                      <div className="text-faint">{new Date(e.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                      <div><span className="font-semibold text-ink-2">Saw: </span>{e.observe}</div>
                      <div><span className="font-semibold text-ink-2">Decided: </span>{e.decide}</div>
                      <div><span className="font-semibold text-blue-700">Did: </span>{e.act}</div>
                    </motion.li>
                  ))}
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="px-4 pb-3"><Note from="Professor's brief: agentic AI">Sorty runs a loop: observe, diagnose, choose the smallest useful action, log it.</Note></div>
        </div>
      </aside>
    </div>
  )
}

function Row({ label, active, done, notes, children, q, stepIndex, assisted, mark }: { label: string; active: boolean; done: boolean; notes: MarginNote[]; children: React.ReactNode; q: Question; stepIndex?: number; assisted?: boolean; mark?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (active && stepIndex && ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [active, stepIndex])
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={clsx('grid border-t border-line md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]', active && 'bg-[#fcfdff]')}>
      <div className={clsx('relative px-5 py-5 md:px-7', active && 'before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-blue')}>
        <div className="mb-2 flex items-center gap-2 text-[12.5px] font-semibold text-muted">
          <span className={clsx('inline-grid size-5 place-items-center rounded-full text-[11px]', done ? (assisted ? 'bg-wash-2 text-muted' : 'bg-ok text-white') : active ? 'bg-blue text-white' : 'bg-wash-2 text-muted')}>
            {done ? (assisted ? '–' : <Check className="size-3" />) : label.replace('Step ', '').replace('Plan', 'P')}
          </span>
          {label}
          {mark && <span className="font-normal text-faint">{mark}</span>}
          {assisted && <span className="font-normal text-faint">worked by Sorty</span>}
        </div>
        {children}
      </div>
      <div className="border-t border-dashed border-line bg-[linear-gradient(90deg,rgba(66,136,255,.035),transparent)] px-5 py-5 md:border-l md:border-t-0 md:px-6">
        {notes.length === 0 ? (
          <p className="sorty text-[14px] opacity-40">{active ? (q.approach && label === 'Plan' ? 'Pick one. There is no penalty for a weak plan.' : 'Your move. I will write here when you do.') : ''}</p>
        ) : (
          <div className="space-y-3">
            {notes.map((n) => (
              <NoteInk key={n.id} n={n} why={stepIndex !== undefined ? q.steps[stepIndex].why : undefined} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function NoteInk({ n, why }: { n: MarginNote; why?: string }) {
  const [open, setOpen] = useState(false)
  const icon = n.kind === 'praise' ? '✓' : n.kind === 'diagnosis' ? '?' : n.kind === 'hint' || n.kind === 'reveal' ? '→' : '·'
  return (
    <motion.div initial={{ opacity: 0, x: -6, filter: 'blur(3px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} transition={{ duration: 0.4 }}>
      <div className="flex gap-2">
        <span className={clsx('sorty mt-[1px] w-3 shrink-0 text-center not-italic', n.kind === 'praise' ? 'text-ok' : n.kind === 'diagnosis' ? 'text-tension' : '')}>{icon}</span>
        <div className="min-w-0">
          <p className={clsx('sorty text-[15px]', n.kind === 'praise' && 'text-ok')}>
            <Tex>{n.text}</Tex>
          </p>
          {n.tag && <p className="mt-1 text-[11.5px] text-faint">Logged: {n.tag}</p>}
          {(n.kind === 'praise' || n.kind === 'diagnosis') && why && !n.text.includes(why) && (
            <button onClick={() => setOpen((v) => !v)} className="mt-1 text-[12px] font-medium text-blue-700/80 hover:text-blue-700">
              {open ? 'Hide' : 'Why?'}
            </button>
          )}
          {open && why && <p className="sorty mt-1 border-l-2 border-blue-100 pl-2 text-[14px]">{why}</p>}
        </div>
      </div>
    </motion.div>
  )
}

function StepBody({ step, st, active, onSubmit }: { step: Step; st: StepState; active: boolean; onSubmit: (a: string | number) => void }) {
  const [val, setVal] = useState('')
  const last = st.attempts[st.attempts.length - 1]
  const solved = st.status !== 'open'
  const c = step.check
  return (
    <div>
      <p className="text-[15.5px] leading-relaxed text-ink">
        <Tex>{step.ask}</Tex>
      </p>
      {st.attempts.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {st.attempts.map((a, i) => {
            const ok = a.verdict.status === 'correct'
            const shown = typeof a.answer === 'number' && c.kind === 'choice' ? c.options[a.answer] : String(a.answer)
            return (
              <li key={i} className={clsx('max-w-full truncate rounded-md px-2 py-0.5 text-[13px]', ok ? 'bg-ok-50 font-medium text-ok' : 'bg-wash text-muted line-through decoration-err/50')}>
                {shown}
              </li>
            )
          })}
        </ul>
      )}
      {st.status === 'assisted' && (
        <p className="sorty mt-2 text-[15px]">
          <Tex>{step.hints[2]}</Tex>
        </p>
      )}
      {active && !solved && (
        <div className="mt-3">
          {c.kind === 'choice' ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {c.options.map((o, i) => (
                <button key={i} onClick={() => onSubmit(i)} className="rounded-[10px] border border-line bg-white px-3.5 py-2.5 text-left text-[14.5px] transition-colors hover:border-blue/50 hover:bg-blue-50/40">
                  {o}
                </button>
              ))}
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!val.trim()) return
                onSubmit(val)
              }}
              className="flex flex-col gap-2 sm:flex-row"
            >
              {c.kind === 'keywords' ? (
                <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={3} placeholder={step.placeholder ?? 'Write it in your own words'} className="paper min-h-[96px] w-full flex-1 rounded-[10px] border border-line-2 px-3 py-[6px] text-[15px] leading-[32px] outline-none focus:border-blue" aria-label="Your answer" />
              ) : (
                <input value={val} onChange={(e) => setVal(e.target.value)} placeholder={step.placeholder ?? (c.kind === 'set' ? 'Separate values with commas' : c.kind === 'expr' ? 'Type an expression' : 'Your answer')} className="h-11 w-full flex-1 rounded-[10px] border border-line-2 bg-white px-3 text-[15.5px] outline-none placeholder:text-faint focus:border-blue" aria-label="Your answer" autoComplete="off" spellCheck={false} />
              )}
              <Button type="submit" className="h-11 shrink-0" disabled={!val.trim()}>
                Check my step
              </Button>
            </form>
          )}
          {last && last.verdict.status !== 'correct' && <p className="mt-2 text-[12.5px] text-faint">Attempt {st.attempts.length}. Your working stays here so you can see what changed.</p>}
        </div>
      )}
    </div>
  )
}

function MarkTracker({ q, steps }: { q: Question; steps: StepState[] }) {
  return (
    <div className="rounded-[16px] border border-line bg-white p-4 shadow-soft">
      <div className="mb-2.5 text-[13px] font-medium text-ink-2">Mark scheme</div>
      <ul className="space-y-1.5">
        {q.steps.map((s, i) =>
          s.mark ? (
            <li key={i} className="flex items-start gap-2.5 text-[13px] leading-snug">
              <span className={clsx('mt-[1px] inline-flex h-5 min-w-9 items-center justify-center rounded-md px-1 text-[11px] font-semibold tabular-nums', steps[i].status === 'solved' ? 'bg-ok text-white' : steps[i].status === 'assisted' ? 'bg-wash-2 text-faint line-through' : 'bg-wash text-muted')}>
                {s.mark}
              </span>
              <span className={clsx(steps[i].status === 'open' ? 'text-faint' : 'text-ink-2')}>{steps[i].status === 'open' ? 'Hidden until you attempt it' : s.ms}</span>
            </li>
          ) : null,
        )}
      </ul>
      <p className="mt-3 text-[11.5px] leading-snug text-faint">
        Every explanation cites the mark-scheme line it comes from. Questions are IB-style, written for this prototype, mapped to syllabus {q.syllabus}.
      </p>
      <Note from="SCAMPER: Substitute">Trust is earned line by line, not assumed.</Note>
    </div>
  )
}

function AskBox({ q, t }: { q: Question; t: ReturnType<typeof useTutor> }) {
  const settings = useStore((s) => s.settings)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const st = t.steps[t.current]
  const step = q.steps[t.current]
  const ctx = useMemo(
    () => ({
      q,
      step,
      stepIndex: t.current,
      unlocked: step ? step.hints.slice(0, st?.hintLevel ?? 0) : [],
      attempts: st ? st.attempts.map((a) => String(a.answer)) : [],
      persona: settings.reviewer,
    }),
    [q, step, st, t, settings.reviewer],
  )
  if (!step) return null
  return (
    <form
      className="mt-4 flex items-center gap-2 rounded-[14px] border border-line bg-white p-2 pl-3 shadow-soft"
      onSubmit={async (e) => {
        e.preventDefault()
        const msg = text.trim()
        if (!msg) return
        setText('')
        setErr('')
        if (settings.apiKey) {
          setBusy(true)
          try {
            const r = await askLive(settings.apiKey, settings.model, { ...ctx, text: msg })
            t.ask(msg, r)
          } catch (x) {
            setErr(`Live model unavailable (${(x as Error).message}). Answered with the built-in engine.`)
            t.ask(msg, askScripted({ ...ctx, text: msg }))
          } finally {
            setBusy(false)
          }
        } else t.ask(msg, askScripted({ ...ctx, text: msg }))
      }}
    >
      <MessageCircleQuestion className="size-4 shrink-0 text-blue" />
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Ask about step ${t.current + 1}. Sorty answers without giving it away.`} className="h-9 min-w-0 flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-faint" aria-label="Ask Sorty" />
      <Button size="sm" variant="secondary" type="submit" disabled={busy || !text.trim()}>
        {busy ? 'Thinking…' : 'Ask'}
      </Button>
      {err && <span className="sr-only" role="status">{err}</span>}
    </form>
  )
}

function Summary({ q, prove, t, twin, onProve }: { q: Question; prove: boolean; t: ReturnType<typeof useTutor>; twin?: Question; onProve: () => void }) {
  const s = t.summary
  const nav = useNavigate()
  const pass = s.marks / q.marks >= 0.75
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border-t border-line bg-[linear-gradient(180deg,#f5f8ff,#fff)] px-5 py-6 md:px-7">
      <div className="flex items-start gap-3">
        <SortyMark className="mt-0.5 size-7" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[19px] font-semibold tracking-[-0.01em]">
            {prove ? (pass ? 'Proved. You can do this without me.' : 'Not yet on your own. That is useful to know.') : t.revealed ? 'Solution shown. This one goes back on your retry list.' : s.unaided === q.steps.length ? 'Every step unaided.' : 'Done. Here is how you got there.'}
          </h3>
          <p className="mt-1 text-[14.5px] text-muted">
            {prove
              ? pass
                ? 'This counts towards your readiness score at full weight.'
                : 'We will bring the same skill back in 2 days with different numbers.'
              : twin
                ? 'Seeing a solution is not the same as being able to do it. Try the matched question with no help.'
                : 'Teacher review will confirm the mark band for this one.'}
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-5">
            {[
              ['Under tension', fmtDuration(s.tut)],
              ['Steps unaided', `${s.unaided} of ${q.steps.length}`],
              ['Hints used', String(s.hints)],
              ['Fixed own error', String(s.selfCorrections)],
              ['Marks', `${s.marks} / ${q.marks}`],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[12.5px] text-muted">{k}</dt>
                <dd className="mt-0.5 text-[20px] font-semibold tabular-nums tracking-[-0.01em]">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            {!prove && twin && (
              <Button onClick={onProve}>
                <Sparkles className="size-4" /> Prove it on a new question
              </Button>
            )}
            {!prove && <Button variant="secondary" to="/explain">Explain it back</Button>}
            <Button variant="ghost" onClick={() => nav(0)}>
              <RotateCcw className="size-4" /> Try again
            </Button>
            <Button variant="ghost" to="/practice">
              Back to questions <ArrowRight className="size-4" />
            </Button>
          </div>
          {!prove && twin && <Note from="5 Whys: students can't see if they've really learned it">A matched question with no help is the real test.</Note>}
        </div>
      </div>
      <details className="mt-6 rounded-[12px] border border-line bg-white px-4 py-3 text-[14px]">
        <summary className="cursor-pointer font-medium text-ink-2">Full worked solution and mark scheme</summary>
        <ol className="mt-3 space-y-2">
          {q.steps.map((st, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-12 shrink-0 text-[12px] font-semibold text-muted">{st.mark || '·'}</span>
              <span className="leading-relaxed">
                <Tex>{st.hints[2]}</Tex>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-3 border-t border-line pt-3"><span className="font-medium">Answer: </span><Tex>{q.answer}</Tex></p>
      </details>
    </motion.div>
  )
}

export function marksOf(q: Question) {
  return q.steps.reduce((a, s) => a + stepWeight(s.mark), 0)
}

export { mmss, X }
