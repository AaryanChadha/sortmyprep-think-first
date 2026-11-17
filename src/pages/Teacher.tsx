import clsx from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Pencil } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '../components/Layout'
import { SortyMark } from '../components/Logo'
import { Tex } from '../components/Tex'
import { Button, Note, Segmented, Switch, Tag } from '../components/ui'
import { BY_ID } from '../data/questions'
import { updatePolicy, useStore } from '../lib/store'

const ROSTER = [
  ['Aanya S.', 3, 161, 1, 'open'],
  ['Rohan K.', 1, 250, 2, 'stuck'],
  ['Meera P.', 4, 362, 0, 'proved'],
  ['Kabir M.', 2, 72, 0, 'self'],
  ['Ishaan T.', 2, 140, 1, 'open'],
  ['Zara A.', 4, 298, 1, 'done'],
  ['Vihaan R.', 1, 35, 0, 'open'],
  ['Diya N.', 3, 205, 2, 'open'],
  ['Arjun B.', 2, 190, 3, 'revealed'],
  ['Saanvi G.', 4, 330, 0, 'proved'],
  ['Kiara D.', 1, 95, 1, 'open'],
  ['Neel J.', 3, 120, 0, 'self'],
] as const

const STATUS: Record<string, { l: string; tone: 'blue' | 'warn' | 'ok' | 'err' | 'plain' }> = {
  open: { l: 'Working', tone: 'blue' },
  stuck: { l: 'Stuck: hint offered', tone: 'warn' },
  proved: { l: 'Proved it', tone: 'ok' },
  self: { l: 'Fixed own error', tone: 'ok' },
  done: { l: 'Done with hints', tone: 'plain' },
  revealed: { l: 'Held to reveal', tone: 'err' },
}

type Tab = 'live' | 'errors' | 'review' | 'rules' | 'pilot'

export default function Teacher() {
  const [sp, setSp] = useSearchParams()
  const tab = (sp.get('tab') as Tab) || 'live'
  return (
    <AppShell
      title="DP2 Maths AA SL, section B"
      sub="Teacher view. Sorty proposes, you decide."
      actions={
        <Segmented
          ariaLabel="Teacher tabs"
          value={tab}
          onChange={(v) => setSp({ tab: v })}
          options={[
            { value: 'live', label: 'Live' },
            { value: 'errors', label: 'Errors' },
            { value: 'review', label: 'Mark review' },
            { value: 'rules', label: 'Rules' },
            { value: 'pilot', label: 'Pilot' },
          ]}
        />
      }
    >
      <Note from="Founder interview: real-time visibility for teachers. 5 Whys: teachers need to verify, control and evidence">Teachers see the working, set the rules and own the marks.</Note>
      <div className="mt-4">
        {tab === 'live' && <Live />}
        {tab === 'errors' && <Errors />}
        {tab === 'review' && <Review />}
        {tab === 'rules' && <Rules />}
        {tab === 'pilot' && <Pilot />}
      </div>
    </AppShell>
  )
}

function Live() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const q = BY_ID['aa-indices']
  return (
    <div className="grid gap-5 [&>*]:min-w-0 xl:grid-cols-[1.5fr_1fr]">
      <div className="rounded-[16px] border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
          <div>
            <div className="text-[15px] font-semibold">Set: fractional indices (3 questions)</div>
            <div className="text-[12.5px] text-muted">Hints after 1 attempt or 40 s. Full solution: hold to reveal. Due Friday.</div>
          </div>
          <Tag tone="ok">{ROSTER.length} students</Tag>
        </div>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13.5px]">
            <thead className="text-[12px] text-faint">
              <tr>
                <th className="px-5 py-2.5 font-medium">Student</th>
                <th className="py-2.5 font-medium">Step</th>
                <th className="py-2.5 font-medium">Under tension</th>
                <th className="py-2.5 font-medium">Hints</th>
                <th className="py-2.5 pr-5 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ROSTER.map(([n, step, t, h, s]) => {
                const live = s === 'open' || s === 'stuck' || s === 'self'
                const secs = t + (live ? tick : 0)
                return (
                  <tr key={n}>
                    <td className="px-5 py-2.5 font-medium">{n}</td>
                    <td className="py-2.5 text-muted">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4].map((k) => (
                            <span key={k} className={clsx('h-1.5 w-5 rounded-full', k < step || s === 'proved' || s === 'done' || s === 'revealed' ? 'bg-blue' : k === step ? 'bg-blue/40' : 'bg-wash-2')} />
                          ))}
                        </div>
                        {step} of 4
                      </div>
                    </td>
                    <td className={clsx('py-2.5 tabular-nums', secs > 240 && live ? 'text-[#a3650f]' : 'text-ink-2')}>
                      {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
                    </td>
                    <td className="py-2.5 tabular-nums text-muted">{h}</td>
                    <td className="py-2.5 pr-5 text-right">
                      <Tag tone={STATUS[s].tone}>{STATUS[s].l}</Tag>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="space-y-5">
        <div className="rounded-[16px] border border-line bg-white p-5">
          <div className="text-[13.5px] font-medium text-ink-2">Rohan K., step 1, live working</div>
          <div className="mt-2 rounded-[10px] bg-wash/60 p-3 text-[14px]">
            <Tex>{q.stem}</Tex>
          </div>
          <ul className="mt-3 space-y-1.5 text-[14px]">
            <li className="text-muted line-through decoration-err/50"><Tex>{'$6u^2+1=12$'}</Tex></li>
            <li className="text-muted line-through decoration-err/50"><Tex>{'$6u^2+1-12=0$'}</Tex></li>
          </ul>
          <p className="sorty mt-3 text-[14.5px]">
            <Tex>{'Sorty asked: "You multiplied $6u$ and $\\tfrac{12}{u}$ by $u$. What happened to the $+1$?"'}</Tex>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary">Send a note to Rohan</Button>
            <Button size="sm" variant="ghost">Unlock next hint</Button>
          </div>
        </div>
        <div className="rounded-[16px] border border-line bg-white p-5">
          <div className="text-[13.5px] font-medium text-ink-2">This set so far</div>
          <dl className="mt-3 grid grid-cols-3 gap-3">
            {[
              ['Solved alone', '58%'],
              ['Proved it', '2 of 12'],
              ['Held to reveal', '1'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[12px] text-muted">{k}</dt>
                <dd className="text-[20px] font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

function Errors() {
  const data = [
    ['Dropped a term when multiplying through', 'AA 1.5', 7, 2],
    ['Repeated root treated as single', 'AA 2.6', 4, 1],
    ['Strict vs inclusive inequality', 'AA 4.10', 3, 2],
    ['Off-by-one in n − 1', 'AA 1.2', 3, 3],
    ['Missed a quadrant', 'AA 3.8', 2, 0],
    ['Substituted into the derivative', 'AA 5.6', 2, 1],
  ] as const
  const [stage, setStage] = useState(0)
  const steps = [
    'Read errors logged in the last 7 days for this class.',
    'Found 7 students with "Dropped a term when multiplying through", 2 already fixed unaided.',
    'Picked 3 matched questions from the bank that test the same move: aa-indices-t, aa-logs-t, aa-stationary-t.',
    'Set them to Prove it mode, so the result shows what each student can do alone.',
    'Waiting for your approval. Nothing is sent until you say so.',
  ]
  useEffect(() => {
    if (stage === 0 || stage > steps.length) return
    const id = setTimeout(() => setStage((s) => s + 1), 650)
    return () => clearTimeout(id)
  }, [stage, steps.length])
  return (
    <div className="grid gap-5 [&>*]:min-w-0 xl:grid-cols-[1.2fr_1fr]">
      <div className="rounded-[16px] border border-line bg-white p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[15px] font-semibold">Recurring errors this week</h2>
          <span className="text-[12.5px] text-faint">students affected, and fixed unaided</span>
        </div>
        <ul className="mt-4 space-y-3">
          {data.map(([l, code, n, fixed]) => (
            <li key={l}>
              <div className="flex items-baseline justify-between gap-3 text-[14px]">
                <span className="font-medium">{l}</span>
                <span className="shrink-0 text-[12px] text-faint">{code}</span>
              </div>
              <div className="mt-1.5 flex h-2.5 gap-[2px]">
                <span className="rounded-l-[4px] bg-ok" style={{ width: `${fixed * 7}%` }} title={`${fixed} fixed`} />
                <span className="rounded-r-[4px] bg-tension/70" style={{ width: `${(n - fixed) * 7}%` }} title={`${n - fixed} not yet fixed`} />
              </div>
              <div className="mt-1 text-[12px] text-muted">{n} students, {fixed} fixed unaided</div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-4 text-[12px] text-muted">
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-[3px] bg-ok" />Fixed unaided</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-[3px] bg-tension/70" />Not yet</span>
        </div>
      </div>
      <div className="rounded-[16px] border border-line bg-white p-5">
        <div className="flex items-center gap-2">
          <SortyMark className="size-6" />
          <h2 className="text-[15px] font-semibold">Draft a follow-up set</h2>
        </div>
        <p className="mt-1.5 text-[14px] text-muted">Sorty plans the work from your class's errors and the question bank, then stops for your approval.</p>
        <Note from="Professor's brief: agentic AI. Problem brief: protects the teacher's expertise">The agent drafts; the teacher decides.</Note>
        {stage === 0 ? (
          <Button className="mt-4" onClick={() => setStage(1)}>Draft a set for the top error</Button>
        ) : (
          <ol className="mt-4 space-y-2.5">
            {steps.slice(0, stage).map((s, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2.5 text-[14px]">
                <span className={clsx('mt-[3px] grid size-4 shrink-0 place-items-center rounded-full', i < steps.length - 1 ? 'bg-ok text-white' : 'border-2 border-blue')}>{i < steps.length - 1 && <Check className="size-2.5" />}</span>
                <span className={clsx(i === steps.length - 1 && 'font-medium')}>{s}</span>
              </motion.li>
            ))}
          </ol>
        )}
        {stage > steps.length && <ApproveBox />}
      </div>
    </div>
  )
}

function ApproveBox() {
  const [state, setState] = useState<'wait' | 'sent' | 'edit'>('wait')
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 rounded-[12px] border border-blue/25 bg-blue-50/50 p-4">
      {state === 'sent' ? (
        <p className="text-[14px] font-medium text-ok">Assigned to 5 students, due Friday. You will see results in Live.</p>
      ) : (
        <>
          <ul className="space-y-1.5 text-[13.5px]">
            {['aa-indices-t', 'aa-logs-t', 'aa-stationary-t'].map((id) => (
              <li key={id} className="flex gap-2">
                <span className="text-faint">{BY_ID[id].syllabus}</span>
                <span className="truncate"><Tex>{BY_ID[id].stem}</Tex></span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => setState('sent')}>Approve and assign</Button>
            <Button size="sm" variant="secondary" onClick={() => setState('edit')}>
              <Pencil className="size-3.5" /> Edit first
            </Button>
          </div>
          {state === 'edit' && <p className="mt-2 text-[12.5px] text-muted">In the full product you would swap questions or change the due date here.</p>}
        </>
      )}
    </motion.div>
  )
}

type ReviewItem = { id: number; student: string; q: string; answer: string; proposed: string; line: string; confidence: 'High' | 'Medium' | 'Low' }

function Review() {
  const items: ReviewItem[] = [
    { id: 1, student: 'Zara A.', q: 'econ-minwage', answer: 'A minimum wage is a legal floor set above equilibrium. It creates a surplus of labour… Its effect depends on the elasticity of demand for labour; in India much work is informal so…', proposed: 'Band L4, 11/15', line: 'Evaluation present and supported by one factor (elasticity); real-world example limited.', confidence: 'Medium' },
    { id: 2, student: 'Diya N.', q: 'bio-osmosis', answer: 'Water moves out of the potato because the solution is more concentrated.', proposed: '1/2 (R1 only)', line: 'R1 water moves out. Second R1 needs water potential, not "concentration".', confidence: 'High' },
    { id: 3, student: 'Neel J.', q: 'chem-equilibrium', answer: 'Right because there are fewer molecules of gas on the product side', proposed: 'R1 awarded', line: 'R1: fewer moles of gaseous product.', confidence: 'High' },
    { id: 4, student: 'Ishaan T.', q: 'aa-trig', answer: 'π/2, 7π/6, 11π/6, 3π/2', proposed: 'A1A1, one extra solution', line: 'A1 each correct solution, no extras: penalise 3π/2.', confidence: 'Low' },
  ]
  const [decisions, setDecisions] = useState<Record<number, { by: string; mark: string; reason: string; at: string } | undefined>>({})
  const [editing, setEditing] = useState<number | null>(null)
  const [mark, setMark] = useState('')
  const [reason, setReason] = useState('')
  const agreed = Object.values(decisions).filter((d) => d && d.reason === '').length
  const changed = Object.values(decisions).filter((d) => d && d.reason !== '').length
  const log = useMemo(() => Object.entries(decisions).filter(([, d]) => d), [decisions])
  return (
    <div className="grid gap-5 [&>*]:min-w-0 xl:grid-cols-[1.5fr_1fr]">
      <ul className="space-y-3">
        {items.map((it) => {
          const d = decisions[it.id]
          const q = BY_ID[it.q]
          return (
            <li key={it.id} className="rounded-[16px] border border-line bg-white p-5">
              <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
                <span className="text-[14px] font-semibold">{it.student}</span>
                <Tag>{q.course}</Tag>
                <Tag>{q.syllabus}</Tag>
                <Tag tone={it.confidence === 'High' ? 'ok' : it.confidence === 'Medium' ? 'blue' : 'warn'}>Sorty is {it.confidence.toLowerCase()} confidence</Tag>
              </div>
              <p className="mt-3 rounded-[10px] bg-wash/60 p-3 text-[14px] leading-relaxed text-ink-2">{it.answer}</p>
              <div className="mt-3 grid gap-2 text-[13.5px] sm:grid-cols-[auto_1fr]">
                <span className="font-semibold">Sorty proposes</span>
                <span>{it.proposed}</span>
                <span className="font-semibold">Because</span>
                <span className="text-muted">{it.line}</span>
              </div>
              <AnimatePresence initial={false}>
                {d ? (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={clsx('mt-3 text-[13.5px] font-medium', d.reason ? 'text-[#a3650f]' : 'text-ok')}>
                    {d.reason ? `Changed to ${d.mark}: ${d.reason}` : 'Accepted as proposed'}
                  </motion.p>
                ) : editing === it.id ? (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 grid gap-2 sm:grid-cols-[140px_1fr_auto]"
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (!mark.trim() || !reason.trim()) return
                      setDecisions((x) => ({ ...x, [it.id]: { by: 'You', mark, reason, at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } }))
                      setEditing(null)
                      setMark('')
                      setReason('')
                    }}
                  >
                    <input value={mark} onChange={(e) => setMark(e.target.value)} placeholder="New mark" className="h-9 rounded-[8px] border border-line-2 px-2.5 text-[13.5px] outline-none focus:border-blue" aria-label="New mark" />
                    <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason, shown to the student" className="h-9 rounded-[8px] border border-line-2 px-2.5 text-[13.5px] outline-none focus:border-blue" aria-label="Reason" />
                    <Button size="sm" type="submit" className="h-9">Save change</Button>
                  </motion.form>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => setDecisions((x) => ({ ...x, [it.id]: { by: 'You', mark: it.proposed, reason: '', at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } }))}>
                      Accept
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditing(it.id)}>
                      Change mark
                    </Button>
                  </div>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ul>
      <div className="space-y-5 xl:sticky xl:top-20 xl:self-start">
        <div className="rounded-[16px] border border-line bg-white p-5">
          <div className="text-[13.5px] font-medium text-ink-2">Agreement with your marks</div>
          <div className="mt-1 text-[30px] font-semibold tabular-nums tracking-[-0.02em]">{agreed + changed ? Math.round((100 * agreed) / (agreed + changed)) : 92}%</div>
          <p className="text-[12.5px] text-faint">{agreed + changed ? `${agreed} accepted, ${changed} changed today` : 'Last 30 days, 214 marks reviewed (sample)'}</p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">Low-confidence marks always come to you. High-confidence ones can be auto-accepted once agreement stays above a level you set.</p>
        </div>
        <div className="rounded-[16px] border border-line bg-white p-5">
          <div className="text-[13.5px] font-medium text-ink-2">Change log</div>
          {log.length === 0 ? (
            <p className="mt-2 text-[13px] text-faint">Every accept or change is recorded here with who, when and why.</p>
          ) : (
            <ul className="mt-2 space-y-2 text-[13px]">
              {log.map(([id, d]) => (
                <li key={id} className="border-l-2 border-line pl-2.5">
                  <span className="text-faint">{d!.at}</span> {d!.by} {d!.reason ? `changed ${items.find((i) => i.id === Number(id))!.student} to ${d!.mark}` : `accepted ${items.find((i) => i.id === Number(id))!.student}`}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function Rules() {
  const p = useStore((s) => s.policy)
  return (
    <div className="grid gap-5 [&>*]:min-w-0 xl:grid-cols-[1.2fr_1fr]">
      <div className="rounded-[16px] border border-line bg-white p-6">
        <h2 className="text-[16px] font-semibold">How Sorty helps in this class</h2>
        <p className="mt-1 text-[14px] text-muted">Changes apply immediately. Open any question in another tab to see them.</p>
        <div className="mt-6 space-y-6">
          <Field label="Hints unlock after" hint="Before this, Sorty asks for an attempt instead.">
            <Segmented
              ariaLabel="Hint gate"
              value={p.hintGate}
              onChange={(v) => updatePolicy({ hintGate: v })}
              options={[
                { value: 'attempt', label: 'An attempt' },
                { value: 'time', label: 'Time on step' },
                { value: 'either', label: 'Either' },
              ]}
            />
          </Field>
          <Field label={`Time before the first hint: ${p.gateSeconds} s`} hint="Doubles for the second hint, triples for the third.">
            <input type="range" min={10} max={120} step={5} value={p.gateSeconds} onChange={(e) => updatePolicy({ gateSeconds: Number(e.target.value) })} className="w-full max-w-sm accent-[#4288ff]" aria-label="Seconds before first hint" />
          </Field>
          <Field label="Deepest hint allowed" hint="Level 3 shows the worked step.">
            <Segmented
              ariaLabel="Max hint"
              value={String(p.maxHintLevel) as '1' | '2' | '3'}
              onChange={(v) => updatePolicy({ maxHintLevel: Number(v) as 1 | 2 | 3 })}
              options={[
                { value: '1', label: 'Nudge only' },
                { value: '2', label: 'Up to hint' },
                { value: '3', label: 'Worked step' },
              ]}
            />
          </Field>
          <Field label="Full solution" hint="Hold to reveal makes it a deliberate choice.">
            <Segmented
              ariaLabel="Reveal"
              value={p.reveal}
              onChange={(v) => updatePolicy({ reveal: v })}
              options={[
                { value: 'hold', label: 'Hold to reveal' },
                { value: 'after-attempts', label: 'After every step tried' },
                { value: 'locked', label: 'Locked' },
              ]}
            />
          </Field>
          <Field label="Prove it after each question">
            <Switch id="prove" checked={p.proveIt} onChange={(v) => updatePolicy({ proveIt: v })} label={p.proveIt ? 'On' : 'Off'} />
          </Field>
        </div>
      </div>
      <div className="rounded-[16px] border border-line bg-[#fbfcff] p-6">
        <div className="text-[13.5px] font-medium text-ink-2">What a student sees</div>
        <ul className="mt-3 space-y-3 text-[14.5px] leading-relaxed">
          <li>Hints on a step unlock after <b>{p.hintGate === 'attempt' ? 'one attempt' : p.hintGate === 'time' ? `${p.gateSeconds} seconds` : `one attempt or ${p.gateSeconds} seconds`}</b>.</li>
          <li>The deepest help is <b>{p.maxHintLevel === 1 ? 'a nudge' : p.maxHintLevel === 2 ? 'a targeted hint' : 'the worked step'}</b>.</li>
          <li>The full solution is <b>{p.reveal === 'hold' ? 'available if they hold the button' : p.reveal === 'after-attempts' ? 'available once every step has been tried' : 'not available'}</b>.</li>
          <li>{p.proveIt ? 'A matched question with no help follows each question.' : 'No follow-up question.'}</li>
        </ul>
        <Note from="Handoff priority 1: let teachers configure answer-reveal rules" />
      </div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[14px] font-semibold">{label}</div>
      {hint && <div className="text-[12.5px] text-muted">{hint}</div>}
      <div className="mt-2">{children}</div>
    </div>
  )
}

function Pilot() {
  const stages = [
    ['Week 0', 'Agree scope', 'One class, one subject, your hint and reveal rules. IT reviews the data terms.'],
    ['Weeks 1–4', 'Run privately', 'Only you see results. No parent notes, no leadership reports.'],
    ['Week 4', 'Read the evidence', 'A one-page report: what changed for students, what it cost you in time.'],
    ['Week 5', 'Decide', 'Stop, extend to one more class, or present to your head of department.'],
  ]
  return (
    <div className="grid gap-5 [&>*]:min-w-0 xl:grid-cols-[1fr_1.1fr]">
      <div className="rounded-[16px] border border-line bg-white p-6">
        <h2 className="text-[16px] font-semibold">A private pilot</h2>
        <p className="mt-1 text-[14px] text-muted">So a school can test Sorty quietly before anyone has to defend it in public.</p>
        <ol className="mt-5 space-y-5">
          {stages.map(([w, t, d], i) => (
            <li key={w} className="grid grid-cols-[28px_1fr] gap-3">
              <span className="grid size-7 place-items-center rounded-full border border-blue/30 text-[13px] font-semibold text-blue-700">{i + 1}</span>
              <div>
                <div className="text-[12.5px] text-faint">{w}</div>
                <div className="font-semibold">{t}</div>
                <div className="text-[14px] text-muted">{d}</div>
              </div>
            </li>
          ))}
        </ol>
        <Note from="Problem brief: the performance paradox, test in private before scaling" />
      </div>
      <div className="rounded-[16px] border border-line bg-white p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[16px] font-semibold">Pilot evidence report</h2>
          <Tag tone="warn">Illustrative layout, no real data</Tag>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
          {[
            ['Steps solved without help', '41% → 58%', 'first week vs last week'],
            ['Prove it pass rate', '63%', 'matched questions, no help'],
            ['Recurring errors fixed', '9 of 14', 'retried and right, unaided'],
            ['Your marking time', '−2.5 h a week', 'after review time is counted'],
            ['Marks you changed', '8%', 'of Sorty proposals'],
            ['Full solutions revealed', '6%', 'of questions started'],
          ].map(([k, v, s]) => (
            <div key={k}>
              <dt className="text-[12.5px] text-muted">{k}</dt>
              <dd className="mt-0.5 text-[22px] font-semibold tabular-nums tracking-[-0.01em]">{v}</dd>
              <dd className="text-[12px] text-faint">{s}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 border-t border-line pt-4 text-[13px] leading-relaxed text-muted">
          The measures match the test in our research plan: first unaided step, hints used, premature reveals, self-correction, and a new question without AI. Net teacher time counts the time spent checking Sorty, not only the time it saves.
        </p>
      </div>
    </div>
  )
}
