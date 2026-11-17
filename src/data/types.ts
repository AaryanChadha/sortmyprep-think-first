export type Check =
  | { kind: 'number'; value: number; tol?: number; unit?: string; abs?: boolean }
  | { kind: 'expr'; equals: string; vars?: string[] }
  | { kind: 'set'; values: number[]; tol?: number }
  | { kind: 'choice'; options: string[]; correct: number }
  | { kind: 'keywords'; groups: string[][]; need?: number; labels?: string[] }

export type Misconception = {
  /** what the wrong answer looks like */
  match: Check
  tag: string
  /** Sorty's question back. Never the answer. */
  reply: string
}

export type Step = {
  ask: string
  check: Check
  placeholder?: string
  /** nudge, hint, worked step */
  hints: [string, string, string]
  mark: string
  ms: string
  why?: string
  misconceptions?: Misconception[]
}

export type DrawSpec =
  | {
      kind: 'plot'
      fn: string
      x: [number, number]
      y: [number, number]
      points?: { step: number; at: [number, number]; label: string }[]
      curveAfter: number
      shade?: [number, number]
      xLabel?: string
      yLabel?: string
    }
  | {
      kind: 'supply-demand'
      tax: number
      before: { p: number; q: number }
      after: { p: number; q: number; pp: number }
      curveAfter: number
    }

export type Question = {
  id: string
  subject: Subject
  course: string
  paper: string
  topic: string
  syllabus: string
  command: string
  marks: number
  minutes: number
  difficulty: 1 | 2 | 3
  stem: string
  approach?: { ask: string; options: { text: string; good: boolean; reply: string }[] }
  steps: Step[]
  answer: string
  markscheme: { code: string; text: string }[]
  twin?: string
  source: 'trial' | 'written'
  draw?: DrawSpec
  isTwin?: boolean
}

export type Subject = 'Maths AA' | 'Maths AI' | 'Physics' | 'Chemistry' | 'Biology' | 'Economics'
