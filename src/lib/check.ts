import { evaluate, parse } from 'mathjs'
import type { Check, Step } from '../data/types'

export type Answer = string | number // number for choice index

function num(s: string): number | null {
  const cleaned = s
    .trim()
    .toLowerCase()
    .replace(/[$€£,]/g, (m) => (m === ',' ? '' : ''))
    .replace(/π/g, 'pi')
    .replace(/×/g, '*')
    .replace(/−/g, '-')
    .replace(/^(x|y|t|d|v|q|i|u|z|p)\s*=\s*/, '')
    .replace(/\s*(m\/s|ms-1|m|s|j|kj\/mol|kj|g|dm3|dm³|mol|v|a|ω|ohms?|%|cm|units?|cups?)$/i, '')
  if (!cleaned) return null
  try {
    const v = evaluate(cleaned.replace(/(\d)\s*pi/g, '$1*pi'))
    return typeof v === 'number' && isFinite(v) ? v : null
  } catch {
    return null
  }
}

function list(s: string): number[] | null {
  const parts = s
    .replace(/\band\b|\bor\b|;/gi, ',')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  const vals = parts.map(num)
  if (vals.some((v) => v === null)) return null
  return vals as number[]
}

function normaliseExpr(s: string) {
  let e = s
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/\s+/g, '')
  // strip "= 0" or "0 =" so equations count as expressions
  e = e.replace(/=0$/, '').replace(/^0=/, '')
  if (e.includes('=')) {
    const [l, r] = e.split('=')
    e = `(${l})-(${r})`
  }
  // implicit multiplication like 6u -> 6*u is handled by mathjs
  return e
}

function exprEqual(a: string, b: string, vars: string[]): 'equal' | 'neg' | 'no' | 'invalid' {
  let fa, fb
  try {
    fa = parse(normaliseExpr(a)).compile()
    fb = parse(normaliseExpr(b)).compile()
  } catch {
    return 'invalid'
  }
  let same = true
  let neg = true
  for (let i = 0; i < 6; i++) {
    const scope: Record<string, number> = {}
    vars.forEach((v, k) => (scope[v] = 0.37 + i * 1.13 + k * 0.71))
    let va: number, vb: number
    try {
      va = fa.evaluate(scope)
      vb = fb.evaluate(scope)
    } catch {
      return 'invalid'
    }
    if (typeof va !== 'number' || typeof vb !== 'number') return 'invalid'
    if (Math.abs(va - vb) > 1e-6 * Math.max(1, Math.abs(vb))) same = false
    if (Math.abs(va + vb) > 1e-6 * Math.max(1, Math.abs(vb))) neg = false
  }
  return same ? 'equal' : neg ? 'neg' : 'no'
}

export type KeywordResult = { hit: boolean[]; ok: boolean }

export function keywordResult(text: string, check: Extract<Check, { kind: 'keywords' }>): KeywordResult {
  const t = text.toLowerCase()
  const hit = check.groups.map((g) => g.some((k) => t.includes(k.toLowerCase())))
  const need = check.need ?? check.groups.length
  return { hit, ok: hit.filter(Boolean).length >= need }
}

/** Does `answer` satisfy `check`? Used both for the correct answer and for misconception patterns. */
export function matches(check: Check, answer: Answer): boolean {
  switch (check.kind) {
    case 'number': {
      const v = typeof answer === 'number' ? answer : num(answer)
      if (v === null) return false
      const tol = check.tol ?? 1e-6
      return Math.abs(v - check.value) <= tol || (!!check.abs && Math.abs(Math.abs(v) - Math.abs(check.value)) <= tol)
    }
    case 'set': {
      if (typeof answer !== 'string') return false
      const vals = list(answer)
      if (!vals) return false
      const tol = check.tol ?? 0.002
      const uniq = vals.filter((v, i) => vals.findIndex((w) => Math.abs(w - v) <= tol) === i)
      if (uniq.length !== check.values.length) return false
      return check.values.every((t) => uniq.some((v) => Math.abs(v - t) <= tol))
    }
    case 'choice':
      return answer === check.correct
    case 'expr': {
      if (typeof answer !== 'string') return false
      const r = exprEqual(answer, check.equals, check.vars ?? ['x'])
      return r === 'equal' || r === 'neg'
    }
    case 'keywords':
      return typeof answer === 'string' && keywordResult(answer, check).ok
  }
}

export function isParsable(check: Check, answer: Answer): boolean {
  if (check.kind === 'number') return typeof answer === 'number' || num(String(answer)) !== null
  if (check.kind === 'set') return typeof answer === 'string' && list(answer) !== null
  if (check.kind === 'expr') return typeof answer === 'string' && exprEqual(answer, check.equals, check.vars ?? ['x']) !== 'invalid'
  return true
}

export type Verdict =
  | { status: 'correct' }
  | { status: 'misconception'; tag: string; reply: string }
  | { status: 'partial'; hit: boolean[]; labels?: string[] }
  | { status: 'wrong' }
  | { status: 'unreadable' }

export function judge(step: Step, answer: Answer): Verdict {
  if (typeof answer === 'string' && !answer.trim()) return { status: 'unreadable' }
  if (!isParsable(step.check, answer)) return { status: 'unreadable' }
  // Misconceptions that are "accepted with a note" must be checked before correct when they coincide.
  if (matches(step.check, answer)) return { status: 'correct' }
  for (const m of step.misconceptions ?? []) {
    const pattern = m.match.kind === 'choice' ? { ...m.match, correct: m.match.correct } : m.match
    if (matches(pattern, answer)) return { status: 'misconception', tag: m.tag, reply: m.reply }
  }
  if (step.check.kind === 'keywords' && typeof answer === 'string') {
    const k = keywordResult(answer, step.check)
    return { status: 'partial', hit: k.hit, labels: step.check.labels }
  }
  return { status: 'wrong' }
}
