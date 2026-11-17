import type { Question, Step } from '../data/types'
import { plain } from '../components/Tex'

/**
 * Optional live model. The prototype runs fully on the scripted engine; if a presenter pastes an API key
 * in Settings, free-text questions and explain-it-back feedback go to the model under the same rules.
 * The rules are enforced twice: in the prompt, and in what we send (locked hints and the answer are never sent).
 */
const RULES = `You are Sorty, an IB exam tutor inside SortMyPrep. You follow an attempt-first policy:
- Never state the final answer or the result of the current step.
- Reply in at most 2 short sentences. Prefer one question back that makes the student do the next bit of thinking.
- Only use the hints you are given as unlocked. Do not go further than the highest unlocked hint.
- Tie advice to the IB mark scheme line when relevant (M1 = method, A1 = accuracy, R1 = reasoning).
- Use $...$ for maths (KaTeX).`

export type AskContext = {
  q: Question
  step: Step
  stepIndex: number
  unlocked: string[]
  attempts: string[]
  text: string
  persona: 'examiner' | 'teacher' | 'buddy'
}

export async function askLive(apiKey: string, model: string, ctx: AskContext): Promise<string> {
  const persona = { examiner: 'Speak like a strict IB examiner.', teacher: 'Speak like a patient IB teacher who asks why.', buddy: 'Speak like a friendly DP2 student who scored a 7.' }[ctx.persona]
  const user = `Question (${ctx.q.course}, ${ctx.q.syllabus}, ${ctx.q.marks} marks): ${ctx.q.stem}
Current step ${ctx.stepIndex + 1}: ${ctx.step.ask}
Mark scheme line for this step: ${ctx.step.ms}
Unlocked hints: ${ctx.unlocked.length ? ctx.unlocked.join(' | ') : 'none yet'}
Student's attempts on this step: ${ctx.attempts.length ? ctx.attempts.join(' ; ') : 'none yet'}
Student asks: "${ctx.text}"`
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model, max_tokens: 220, system: `${RULES}\n${persona}`, messages: [{ role: 'user', content: user }] }),
  })
  if (!res.ok) throw new Error(`Model returned ${res.status}`)
  const data = await res.json()
  return (data.content?.[0]?.text as string) ?? ''
}

/** Scripted reply used when no key is set. Same policy, smaller vocabulary. */
export function askScripted(ctx: AskContext): string {
  const t = ctx.text.toLowerCase()
  if (/answer|solution|just tell|give me/.test(t)) {
    return ctx.attempts.length
      ? `I'll hold the answer back a little longer. ${ctx.unlocked.length ? 'Look again at the last hint and change one thing in your working.' : 'Your next hint unlocks soon. Try one more line first.'}`
      : 'Show me your first line, even if it is a guess. Then I can tell you exactly where the marks are.'
  }
  if (/why/.test(t)) return ctx.step.why ?? `Good question. What does the mark scheme reward here? "${plain(ctx.step.ms)}". Which part of your working shows that?`
  if (/stuck|don.?t know|no idea|help/.test(t)) return ctx.unlocked.length ? `Start from this: ${ctx.unlocked[ctx.unlocked.length - 1]}` : `What do you already know from the question? Write that down as your first line.`
  if (/mark|scheme|examiner/.test(t)) return `This step is worth ${ctx.step.mark || 'working marks'}. The examiner is looking for: ${plain(ctx.step.ms)}.`
  return `Before I answer: what would you try first, and why? One line is enough.`
}

export type ExplainVerdict = { covered: boolean[]; followUp: string }

export async function explainLive(apiKey: string, model: string, prompt: string, ideas: string[], text: string): Promise<ExplainVerdict> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 300,
      system: `You check an IB student's explanation against a list of key ideas. Do not rewrite their explanation and do not supply missing ideas. Return only JSON: {"covered":[true|false per idea],"followUp":"one short question that pushes on the first missing idea, or a deeper 'why' if all are covered"}`,
      messages: [{ role: 'user', content: `Task: ${prompt}\nIdeas:\n${ideas.map((i, k) => `${k + 1}. ${i}`).join('\n')}\nStudent explanation:\n${text}` }],
    }),
  })
  if (!res.ok) throw new Error(`Model returned ${res.status}`)
  const data = await res.json()
  const raw = (data.content?.[0]?.text as string) ?? '{}'
  const json = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1))
  return { covered: ideas.map((_, i) => !!json.covered?.[i]), followUp: String(json.followUp ?? '') }
}
