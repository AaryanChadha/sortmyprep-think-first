import { useSyncExternalStore } from 'react'

export type Attempt = {
  qid: string
  at: number
  tut: number // seconds under tension
  steps: number
  unaided: number
  hints: number
  selfCorrections: number
  revealed: boolean
  marks: number
  maxMarks: number
  prove?: boolean
}

export type MisconceptionEntry = { tag: string; qid: string; subject: string; at: number; fixed?: number }

export type Policy = {
  hintGate: 'attempt' | 'time' | 'either'
  gateSeconds: number
  reveal: 'hold' | 'after-attempts' | 'locked'
  proveIt: boolean
  maxHintLevel: 1 | 2 | 3
}

export type Settings = {
  mode: 'with' | 'ask'
  reviewer: 'examiner' | 'teacher' | 'buddy'
  voice: boolean
  notes: boolean
  apiKey: string
  model: string
}

export type PlanState = {
  examDate: string
  subjects: string[]
  hours: number
}

type State = {
  attempts: Attempt[]
  misconceptions: MisconceptionEntry[]
  activeDays: string[]
  settings: Settings
  policy: Policy
  plan: PlanState
}

const KEY = 'smp-proto-v1'
const day = 86400000
const now = Date.now()
const iso = (t: number) => new Date(t).toISOString().slice(0, 10)

/** Sample history so the insights, plan and teacher views have something to show on first open. */
function seed(): State {
  const a = (qid: string, daysAgo: number, o: Partial<Attempt>): Attempt => ({
    qid,
    at: now - daysAgo * day - 3600_000 * 3,
    tut: 240,
    steps: 3,
    unaided: 2,
    hints: 1,
    selfCorrections: 1,
    revealed: false,
    marks: 3,
    maxMarks: 4,
    ...o,
  })
  return {
    attempts: [
      a('aa-series', 13, { tut: 180, steps: 2, unaided: 1, hints: 2, marks: 2, maxMarks: 4 }),
      a('phy-circuit', 12, { tut: 300, steps: 3, unaided: 1, hints: 3, marks: 2 }),
      a('aa-logs', 11, { tut: 410, steps: 4, unaided: 2, hints: 2, marks: 3, maxMarks: 5 }),
      a('chem-moles', 9, { tut: 220, steps: 3, unaided: 2, hints: 1, marks: 2, maxMarks: 3 }),
      a('aa-binomial', 8, { tut: 160, steps: 2, unaided: 1, hints: 1, marks: 3, maxMarks: 4 }),
      a('econ-ped', 7, { tut: 260, steps: 4, unaided: 3, hints: 1, marks: 3 }),
      a('aa-stationary', 6, { tut: 520, steps: 5, unaided: 3, hints: 2, marks: 4, maxMarks: 6 }),
      a('phy-projectile', 5, { tut: 380, steps: 3, unaided: 2, hints: 1, marks: 3 }),
      a('aa-indices', 4, { tut: 610, steps: 4, unaided: 2, hints: 3, marks: 2, selfCorrections: 2 }),
      a('aa-indices-t', 3, { tut: 280, steps: 3, unaided: 3, hints: 0, marks: 4, prove: true }),
      a('bio-osmosis', 2, { tut: 330, steps: 3, unaided: 2, hints: 1, marks: 2, maxMarks: 3 }),
      a('chem-enthalpy', 1, { tut: 450, steps: 3, unaided: 2, hints: 1, marks: 3 }),
    ],
    misconceptions: [
      { tag: 'Dropped a term when multiplying through', qid: 'aa-indices', subject: 'Maths AA', at: now - 4 * day, fixed: now - 3 * day },
      { tag: 'Dropped a term when multiplying through', qid: 'aa-logs', subject: 'Maths AA', at: now - 11 * day },
      { tag: 'Off-by-one in n − 1', qid: 'aa-series', subject: 'Maths AA', at: now - 13 * day },
      { tag: 'Added parallel resistances', qid: 'phy-circuit', subject: 'Physics', at: now - 12 * day },
      { tag: 'Sign of ΔH for exothermic', qid: 'chem-enthalpy', subject: 'Chemistry', at: now - 1 * day },
      { tag: 'Strict vs inclusive inequality', qid: 'aa-binomial', subject: 'Maths AA', at: now - 8 * day, fixed: now - 6 * day },
    ],
    activeDays: [13, 12, 11, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((d) => iso(now - d * day)),
    settings: { mode: 'with', reviewer: 'teacher', voice: false, notes: true, apiKey: '', model: 'claude-sonnet-5-5' },
    policy: { hintGate: 'either', gateSeconds: 40, reveal: 'hold', proveIt: true, maxHintLevel: 3 },
    plan: { examDate: '2027-04-27', subjects: ['Maths AA', 'Physics', 'Chemistry'], hours: 8 },
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw) as State
      const base = seed()
      return { ...base, ...s, settings: { ...base.settings, ...s.settings }, policy: { ...base.policy, ...s.policy }, plan: { ...base.plan, ...s.plan } }
    }
  } catch {
    /* storage unavailable: keep in memory */
  }
  return seed()
}

let state: State = load()
const listeners = new Set<() => void>()

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function setState(fn: (s: State) => State) {
  state = fn(state)
  save()
  listeners.forEach((l) => l())
}

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => sel(state),
  )
}

export const getState = () => state

export function resetDemo() {
  state = seed()
  save()
  listeners.forEach((l) => l())
}

export function recordAttempt(a: Attempt) {
  setState((s) => ({
    ...s,
    attempts: [...s.attempts, a],
    activeDays: a.unaided > 0 && !s.activeDays.includes(iso(Date.now())) ? [...s.activeDays, iso(Date.now())] : s.activeDays,
  }))
}

export function recordMisconception(m: MisconceptionEntry) {
  setState((s) => ({ ...s, misconceptions: [...s.misconceptions, m] }))
}

export function markFixed(tag: string) {
  setState((s) => ({
    ...s,
    misconceptions: s.misconceptions.map((m) => (m.tag === tag && !m.fixed ? { ...m, fixed: Date.now() } : m)),
  }))
}

export const updateSettings = (p: Partial<Settings>) => setState((s) => ({ ...s, settings: { ...s.settings, ...p } }))
export const updatePolicy = (p: Partial<Policy>) => setState((s) => ({ ...s, policy: { ...s.policy, ...p } }))
export const updatePlan = (p: Partial<PlanState>) => setState((s) => ({ ...s, plan: { ...s.plan, ...p } }))

export { iso, day }
