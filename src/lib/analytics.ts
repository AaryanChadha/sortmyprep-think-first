import { BY_ID, QUESTIONS } from '../data/questions'
import type { Attempt } from './store'
import { day, iso } from './store'

export type Readiness = {
  subject: string
  score: number
  coverage: number
  unaided: number
  recency: number
  attempts: number
}

/**
 * Readiness = 40% syllabus coverage + 40% unaided step rate + 20% recency.
 * Shown to students with the formula, so the number can be argued with.
 */
export function readiness(attempts: Attempt[], subject: string): Readiness {
  const topics = new Set(QUESTIONS.filter((q) => q.subject === subject && !q.isTwin).map((q) => q.topic))
  const mine = attempts.filter((a) => BY_ID[a.qid]?.subject === subject)
  const covered = new Set(mine.map((a) => BY_ID[a.qid].topic))
  const coverage = topics.size ? [...covered].filter((t) => topics.has(t)).length / topics.size : 0
  const steps = mine.reduce((s, a) => s + a.steps, 0)
  const unaided = steps ? mine.reduce((s, a) => s + a.unaided, 0) / steps : 0
  const last = mine.length ? Math.max(...mine.map((a) => a.at)) : 0
  const daysSince = last ? (Date.now() - last) / day : 99
  const recency = Math.max(0, 1 - daysSince / 14)
  const score = Math.round(100 * (0.4 * coverage + 0.4 * unaided + 0.2 * recency))
  return { subject, score, coverage, unaided, recency, attempts: mine.length }
}

export function streak(activeDays: string[]) {
  // A day counts when at least one step was solved without help.
  // One rest day per 7 keeps the streak alive, so a single missed day does not wipe out weeks of work.
  const set = new Set(activeDays)
  let count = 0
  let restUsed = 0
  let windowStart = 0
  for (let i = 0; i < 365; i++) {
    const d = iso(Date.now() - i * day)
    if (set.has(d)) {
      count++
    } else if (i === 0) {
      continue // today not done yet
    } else if (restUsed === 0 || i - windowStart >= 7) {
      restUsed++
      windowStart = i
    } else break
  }
  return count
}

export function weekTotals(attempts: Attempt[], daysBack = 7) {
  const since = Date.now() - daysBack * day
  const w = attempts.filter((a) => a.at >= since)
  const steps = w.reduce((s, a) => s + a.steps, 0)
  return {
    sessions: w.length,
    tut: w.reduce((s, a) => s + a.tut, 0),
    steps,
    unaided: w.reduce((s, a) => s + a.unaided, 0),
    hints: w.reduce((s, a) => s + a.hints, 0),
    selfCorrections: w.reduce((s, a) => s + a.selfCorrections, 0),
    prove: w.filter((a) => a.prove).length,
    provePassed: w.filter((a) => a.prove && a.marks / a.maxMarks >= 0.75).length,
  }
}

export function fmtDuration(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.round((sec % 3600) / 60)
  if (h) return `${h}h ${m}m`
  if (m) return `${m} min`
  return `${Math.round(sec)} s`
}
