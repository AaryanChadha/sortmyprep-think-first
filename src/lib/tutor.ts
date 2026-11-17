import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Question } from '../data/types'
import { judge, type Answer, type Verdict } from './check'
import { getState, recordAttempt, recordMisconception, markFixed, type Policy, type Settings } from './store'
import { plain } from '../components/Tex'

export type NoteKind = 'question' | 'hint' | 'praise' | 'diagnosis' | 'nudge' | 'reveal' | 'why' | 'reply' | 'approach'
export type MarginNote = { id: number; step: number; kind: NoteKind; text: string; at: number; tag?: string }
export type TraceEntry = { id: number; at: number; observe: string; decide: string; act: string }
export type StepState = {
  attempts: { answer: Answer; verdict: Verdict; at: number }[]
  hintLevel: 0 | 1 | 2 | 3
  status: 'open' | 'solved' | 'assisted'
  tut: number
  selfCorrected: boolean
}

export function stepWeight(mark: string) {
  const m = mark.match(/[MAR]\d/g)
  return m ? m.length : mark ? 1 : 0
}

let uid = 1

export function speak(text: string) {
  try {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(plain(text))
    u.rate = 1.02
    const v = window.speechSynthesis.getVoices().find((x) => /en-(GB|IN)/.test(x.lang)) ?? null
    if (v) u.voice = v
    window.speechSynthesis.speak(u)
  } catch {
    /* no speech */
  }
}

export function useTutor(q: Question, opts: { prove?: boolean; policy: Policy; settings: Settings; record?: boolean }) {
  const { prove = false, policy, settings, record = true } = opts
  const [phase, setPhase] = useState<'approach' | 'steps' | 'done'>(q.approach && !prove ? 'approach' : 'steps')
  const [approachPick, setApproachPick] = useState<number | null>(null)
  const [current, setCurrent] = useState(0)
  const [steps, setSteps] = useState<StepState[]>(() => q.steps.map(() => ({ attempts: [], hintLevel: 0, status: 'open', tut: 0, selfCorrected: false })))
  const [notes, setNotes] = useState<MarginNote[]>([])
  const [trace, setTrace] = useState<TraceEntry[]>([])
  const [revealed, setRevealed] = useState(false)
  const lastInput = useRef(Date.now())
  const offered = useRef<Set<number>>(new Set())
  const recorded = useRef(false)

  const persona = settings.reviewer
  const quiet = settings.mode === 'ask'

  const addNote = useCallback(
    (n: Omit<MarginNote, 'id' | 'at'>) => {
      const note = { ...n, id: uid++, at: Date.now() }
      setNotes((x) => [...x, note])
      if (settings.voice) speak(n.text)
    },
    [settings.voice],
  )
  const addTrace = useCallback((observe: string, decide: string, act: string) => {
    setTrace((t) => [...t, { id: uid++, at: Date.now(), observe, decide, act }])
  }, [])

  // Reset when the question changes
  useEffect(() => {
    setPhase(q.approach && !prove ? 'approach' : 'steps')
    setApproachPick(null)
    setCurrent(0)
    setSteps(q.steps.map(() => ({ attempts: [], hintLevel: 0, status: 'open', tut: 0, selfCorrected: false })))
    setNotes([])
    setRevealed(false)
    recorded.current = false
    offered.current = new Set()
    setTrace([
      {
        id: uid++,
        at: Date.now(),
        observe: `Opened ${q.id} (${q.syllabus}, ${q.marks} marks)${prove ? ' in Prove it mode' : ''}`,
        decide: prove
          ? 'Prove it: no hints, no reveal. This measures what the student can do alone.'
          : q.approach
            ? 'Policy: approach first. Ask how they would start before showing any step.'
            : 'Policy: attempt first. Show step 1 only. Hints stay locked until an attempt or time on task.',
        act: prove ? 'Started a silent timer.' : q.approach ? 'Asked an approach question.' : 'Waiting for a first attempt.',
      },
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id, prove])

  // Time under tension: counts only while the page is visible and the student was active in the last 90 s.
  useEffect(() => {
    if (phase === 'done') return
    const mark = () => (lastInput.current = Date.now())
    window.addEventListener('keydown', mark)
    window.addEventListener('pointermove', mark)
    window.addEventListener('pointerdown', mark)
    const t = setInterval(() => {
      if (document.hidden || Date.now() - lastInput.current > 90_000) return
      setSteps((s) => s.map((st, i) => (i === current && st.status === 'open' && phase === 'steps' ? { ...st, tut: st.tut + 1 } : st)))
    }, 1000)
    return () => {
      clearInterval(t)
      window.removeEventListener('keydown', mark)
      window.removeEventListener('pointermove', mark)
      window.removeEventListener('pointerdown', mark)
    }
  }, [current, phase])

  const cur = steps[current]

  const unlockOf = useCallback(
    (st: StepState, level: number) => {
      if (prove) return { ok: false, why: 'Prove it mode: no hints.' }
      if (level > policy.maxHintLevel) return { ok: false, why: 'Your teacher has capped hints here.' }
      const needAttempts = level
      const needSecs = policy.gateSeconds * level
      const byAttempt = st.attempts.length >= needAttempts
      const byTime = st.tut >= needSecs
      const ok = policy.hintGate === 'attempt' ? byAttempt : policy.hintGate === 'time' ? byTime : byAttempt || byTime
      const why =
        policy.hintGate === 'attempt'
          ? `Unlocks after ${needAttempts} attempt${needAttempts > 1 ? 's' : ''}`
          : policy.hintGate === 'time'
            ? `Unlocks after ${needSecs}s on this step`
            : `Unlocks after ${needAttempts} attempt${needAttempts > 1 ? 's' : ''} or ${needSecs}s`
      return { ok, why, remaining: Math.max(0, needSecs - st.tut) }
    },
    [policy, prove],
  )

  // Proactive offer in "Thinks with you" mode
  useEffect(() => {
    if (quiet || prove || phase !== 'steps' || !cur || cur.status !== 'open') return
    if (cur.tut >= 150 && !offered.current.has(current)) {
      offered.current.add(current)
      addNote({ step: current, kind: 'nudge', text: `You've been working on this for over two minutes. That's the useful kind of stuck. A nudge is ready if you want it, or keep going.` })
      addTrace(`${Math.floor(cur.tut / 60)} min on step ${current + 1}, ${cur.attempts.length} attempt(s), no progress`, 'Struggle is turning unproductive. Offer, do not impose, the next hint.', 'Wrote an offer in the margin.')
    }
  }, [cur, current, quiet, prove, phase, addNote, addTrace])

  const pickApproach = (i: number) => {
    if (!q.approach) return
    setApproachPick(i)
    const o = q.approach.options[i]
    addNote({ step: -1, kind: 'approach', text: o.reply })
    addTrace(`Approach chosen: "${plain(o.text)}"`, o.good ? 'Sound plan. Let them start.' : 'Weak plan. Ask a question that exposes why, keep the choice open.', o.good ? 'Opened step 1.' : 'Wrote a question back. Student can rethink or continue.')
    if (o.good) setTimeout(() => setPhase('steps'), 500)
  }
  const skipApproach = () => {
    setPhase('steps')
    addTrace('Student skipped the approach question', 'Allowed. Planning is encouraged, not forced.', 'Opened step 1.')
  }

  const finish = useCallback(
    (final: StepState[], wasRevealed: boolean) => {
      setPhase('done')
      if (recorded.current || !record) return
      recorded.current = true
      const weights = q.steps.map((s) => Math.max(1, stepWeight(s.mark)))
      const total = weights.reduce((a, b) => a + b, 0)
      const earned = final.reduce((a, st, i) => a + (st.status === 'solved' ? weights[i] : 0), 0)
      recordAttempt({
        qid: q.id,
        at: Date.now(),
        tut: final.reduce((a, s) => a + s.tut, 0),
        steps: q.steps.length,
        unaided: final.filter((s) => s.status === 'solved' && s.hintLevel === 0).length,
        hints: final.reduce((a, s) => a + s.hintLevel, 0),
        selfCorrections: final.filter((s) => s.selfCorrected).length,
        revealed: wasRevealed,
        marks: Math.round((q.marks * earned) / total),
        maxMarks: q.marks,
        prove,
      })
    },
    [q, prove, record],
  )

  const submit = (answer: Answer) => {
    if (phase !== 'steps' || !cur || cur.status !== 'open') return
    const step = q.steps[current]
    const v = judge(step, answer)
    const shown = typeof answer === 'number' ? (step.check.kind === 'choice' ? step.check.options[answer] : String(answer)) : answer
    lastInput.current = Date.now()
    if (v.status === 'unreadable') {
      addNote({ step: current, kind: 'question', text: step.check.kind === 'expr' ? 'I could not read that as an expression. Try something like 3u^2 - 2u + 1.' : step.check.kind === 'set' ? 'Separate your values with commas, like 2, -1/3.' : 'I could not read that as a number. Try a plain value like 4.25.' })
      return
    }
    const next = steps.map((s, i) => (i === current ? { ...s, attempts: [...s.attempts, { answer, verdict: v, at: Date.now() }] } : s))
    if (v.status === 'correct') {
      const st = next[current]
      const self = st.attempts.length > 1 && st.hintLevel === 0
      next[current] = { ...st, status: st.hintLevel >= 3 ? 'assisted' : 'solved', selfCorrected: self }
      const earnedMark = st.hintLevel < 3 && step.mark
      const praise =
        persona === 'examiner'
          ? `${earnedMark ? `${step.mark} awarded.` : 'Correct, no mark for this step after a worked hint.'} ${plain(step.ms)}.`
          : persona === 'buddy'
            ? self
              ? 'You fixed that yourself. That is the bit that sticks.'
              : 'Nice, that is it.'
            : self
              ? `You found your own error. ${step.why ?? 'Keep going.'}`
              : (step.why ?? 'Yes. On to the next part.')
      if (!quiet || persona === 'examiner') addNote({ step: current, kind: 'praise', text: praise })
      // If they had this misconception before and now got it right unaided, mark it as fixed.
      const tags = st.attempts.map((a) => (a.verdict.status === 'misconception' ? a.verdict.tag : '')).filter(Boolean)
      if (self && tags.length) markFixed(tags[0])
      addTrace(
        `Correct on step ${current + 1} after ${st.attempts.length} attempt(s), hint level ${st.hintLevel}`,
        st.hintLevel === 0 ? (self ? 'Self-corrected with no hint: strongest evidence of learning. Award mark.' : 'Unaided: award mark, keep explanation short.') : st.hintLevel < 3 ? 'Solved with a hint: award mark, log hint use.' : 'Solved after a worked step: no mark, schedule a retry.',
        current + 1 < q.steps.length ? `Opened step ${current + 2}.` : 'All steps done. Offer Prove it on a matched question.',
      )
      setSteps(next)
      if (current + 1 < q.steps.length) setTimeout(() => setCurrent(current + 1), 350)
      else finish(next, revealed)
      return
    }
    if (prove) {
      const n = next[current].attempts.length
      if (n >= 2) {
        next[current] = { ...next[current], status: 'assisted' }
        setSteps(next)
        addNote({ step: current, kind: 'question', text: 'Not this time. That step goes on your retry list. Carry on with the next one.' })
        addTrace(`Second wrong answer on step ${current + 1} in Prove it`, 'No hints in Prove it. Record the gap and keep the test moving.', 'Marked step as not proved. Scheduled a retry in 2 days.')
        if (current + 1 < q.steps.length) setTimeout(() => setCurrent(current + 1), 350)
        else finish(next, false)
      } else {
        setSteps(next)
        addNote({ step: current, kind: 'question', text: 'Not right. One more try on this step, with no hints.' })
        addTrace(`Wrong answer "${shown}" on step ${current + 1} in Prove it`, 'Say it is wrong, nothing more. This measures unaided ability.', 'Allowed one more attempt.')
      }
      if (v.status === 'misconception' && record) recordMisconception({ tag: v.tag, qid: q.id, subject: q.subject, at: Date.now() })
      return
    }
    setSteps(next)
    if (v.status === 'misconception') {
      const seen = getState().misconceptions.filter((m) => m.tag === v.tag).length
      addNote({ step: current, kind: 'diagnosis', text: persona === 'examiner' ? `No mark yet. ${v.reply}` : persona === 'buddy' ? `Hmm, close. ${v.reply}` : v.reply, tag: v.tag })
      if (record && !prove) recordMisconception({ tag: v.tag, qid: q.id, subject: q.subject, at: Date.now() })
      addTrace(
        `Answer "${shown}" on step ${current + 1}`,
        `Matches known error "${v.tag}"${seen ? `, seen ${seen} time${seen > 1 ? 's' : ''} before` : ''}. Ask a question that exposes it. Do not correct it.`,
        `Wrote a question in the margin. Logged the error${seen ? ' and moved its retry earlier' : ' with a retry in 3 days'}.`,
      )
      return
    }
    if (v.status === 'partial') {
      const missing = (v.labels ?? []).filter((_, i) => !v.hit[i])
      addNote({ step: current, kind: 'question', text: missing.length ? `Some of the marking points are there. What is missing: ${missing.join(', ').toLowerCase()}. Add it in your own words.` : 'Almost. Make the link to the mark scheme point clearer.' })
      addTrace(`Explanation on step ${current + 1}`, `Rubric check: ${v.hit.filter(Boolean).length}/${v.hit.length} points present. Name the gap, not the wording.`, 'Listed missing points without supplying sentences.')
      return
    }
    const n = next[current].attempts.length
    addNote({
      step: current,
      kind: 'question',
      text: n === 1 ? 'Not yet. Which line of your working are you least sure about? Check that one first.' : n === 2 ? `Still not there. ${unlockOf(next[current], 1).ok ? 'A nudge is unlocked if you want it.' : 'Try once more, then a nudge unlocks.'}` : 'Take the next hint. Struggling longer here will not add much.',
    })
    addTrace(`Answer "${shown}" on step ${current + 1}`, 'Wrong, no known pattern. Do not explain. Point at the riskiest line.', n >= 2 ? 'Pointed to the unlocked hint.' : 'Asked the student to recheck one line.')
  }

  const hint = () => {
    if (!cur || cur.status !== 'open') return
    const level = (cur.hintLevel + 1) as 1 | 2 | 3
    const u = unlockOf(cur, level)
    if (!u.ok) {
      addTrace(`Hint ${level} requested on step ${current + 1}`, `Locked: ${u.why.toLowerCase()}. Protect the thinking time.`, 'Asked for an attempt first.')
      addNote({ step: current, kind: 'question', text: cur.attempts.length ? 'Give it one more go first. What did you try last time, and what would you change?' : 'Write anything first, even a guess. A wrong first line is useful to me.' })
      return
    }
    const step = q.steps[current]
    setSteps((s) => s.map((st, i) => (i === current ? { ...st, hintLevel: level } : st)))
    const text = step.hints[level - 1]
    addNote({ step: current, kind: level === 3 ? 'reveal' : 'hint', text: persona === 'examiner' && level < 3 ? `${text} The examiner wants: ${plain(step.ms)}.` : text })
    addTrace(`Hint ${level} requested on step ${current + 1}`, level === 1 ? 'Unlocked. Give the smallest nudge.' : level === 2 ? 'Unlocked. Give a targeted hint, still no result.' : 'Unlocked. Show this step worked. No mark for it; retry later.', `Wrote hint ${level} in the margin.`)
  }

  const reveal = () => {
    const next = steps.map((s) => (s.status === 'open' ? { ...s, status: 'assisted' as const, hintLevel: 3 as const } : s))
    setSteps(next)
    setRevealed(true)
    addNote({ step: current, kind: 'reveal', text: 'Here is the full worked solution. No marks for the steps you did not reach. I have put a matched question in your retry list for tomorrow.' })
    addTrace('Student held to reveal the full solution', 'Deliberate reveal allowed by policy. Record as assisted.', 'Showed all remaining worked steps. Scheduled a matched retry for tomorrow.')
    finish(next, true)
  }

  const ask = (text: string, reply: string) => {
    addNote({ step: current, kind: 'reply', text: reply })
    addTrace(`Student asked: "${text}"`, 'Answer the question without passing the next unlocked hint.', 'Replied in the margin.')
  }

  const summary = useMemo(() => {
    const weights = q.steps.map((s) => Math.max(1, stepWeight(s.mark)))
    const total = weights.reduce((a, b) => a + b, 0)
    const earned = steps.reduce((a, st, i) => a + (st.status === 'solved' ? weights[i] : 0), 0)
    return {
      tut: steps.reduce((a, s) => a + s.tut, 0),
      unaided: steps.filter((s) => s.status === 'solved' && s.hintLevel === 0).length,
      hints: steps.reduce((a, s) => a + s.hintLevel, 0),
      selfCorrections: steps.filter((s) => s.selfCorrected).length,
      marks: Math.round((q.marks * earned) / total),
    }
  }, [steps, q])

  const allAttempted = steps.every((s) => s.attempts.length > 0 || s.status !== 'open')

  return { phase, approachPick, pickApproach, skipApproach, current, setCurrent, steps, notes, trace, submit, hint, reveal, ask, unlockOf, revealed, summary, allAttempted, addNote }
}
