import clsx from 'clsx'
import { Search, ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { AppShell } from '../components/Layout'
import { Solver } from '../components/Solver'
import { Tex } from '../components/Tex'
import { Note, Tag } from '../components/ui'
import { BY_ID, MAIN_QUESTIONS, QUESTIONS, SUBJECTS } from '../data/questions'
import { useStore } from '../lib/store'

export function Practice() {
  const [subject, setSubject] = useState<string>('All')
  const [query, setQuery] = useState('')
  const attempts = useStore((s) => s.attempts)
  const list = useMemo(
    () =>
      MAIN_QUESTIONS.filter((q) => (subject === 'All' || q.subject === subject) && (!query || `${q.topic} ${q.stem} ${q.syllabus} ${q.course}`.toLowerCase().includes(query.toLowerCase()))),
    [subject, query],
  )
  const doneIds = useMemo(() => new Set(attempts.map((a) => a.qid)), [attempts])
  const totalSteps = QUESTIONS.reduce((a, q) => a + q.steps.length, 0)

  return (
    <AppShell
      title="Questions"
      sub={`${MAIN_QUESTIONS.length} IB-style questions, each with a matched "Prove it" question, ${totalSteps} checkable steps and a mark-scheme line for every mark.`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {['All', ...SUBJECTS].map((s) => (
          <button key={s} onClick={() => setSubject(s)} className={clsx('h-8 rounded-full border px-3 text-[13.5px] font-medium transition-colors', subject === s ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink-2 hover:border-ink/30')}>
            {s}
          </button>
        ))}
        <label className="ml-auto flex h-9 w-full items-center gap-2 rounded-[10px] border border-line bg-white px-3 sm:w-72">
          <Search className="size-4 text-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topic or syllabus code" className="w-full bg-transparent text-[14px] outline-none" aria-label="Search questions" />
        </label>
      </div>
      <Note from="Founder interview: curriculum-aligned is the edge over general AI">Every question shows its syllabus code and paper.</Note>

      <ul className="mt-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {list.map((q) => (
          <li key={q.id}>
            <Link to={`/solve/${q.id}`} className="group flex h-full flex-col rounded-[14px] border border-line bg-white p-4 transition-[border-color,box-shadow] hover:border-blue/40 hover:shadow-soft">
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag tone="blue">{q.subject}</Tag>
                <Tag>{q.syllabus}</Tag>
                <Tag>{q.marks} marks</Tag>
                {q.source === 'trial' && <Tag tone="warn">Tested on Sorty</Tag>}
                {doneIds.has(q.id) && <Tag tone="ok">Attempted</Tag>}
              </div>
              <div className="mt-3 text-[13px] font-medium text-muted">{q.topic}</div>
              <div className="mt-1 line-clamp-3 text-[15px] leading-relaxed text-ink">
                <Tex>{q.stem}</Tex>
              </div>
              <div className="mt-auto flex items-center gap-3 pt-4 text-[12.5px] text-faint">
                <span>{q.steps.length} steps</span>
                <span>{q.paper}</span>
                <span>About {q.minutes} min</span>
                <span className="ml-auto inline-flex items-center gap-1 font-semibold text-blue-700 opacity-0 transition-opacity group-hover:opacity-100">
                  Start <ArrowRight className="size-3.5" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-10 text-center text-muted">No questions match. Try a syllabus code like AA 2.6 or a topic like osmosis.</p>}
      <p className="mt-8 max-w-[70ch] text-[13px] leading-relaxed text-faint">
        Sample bank for the prototype. Two questions are the ones we used to test Sorty's free trial. The rest are written by our team in IB style and mapped to the current DP syllabus codes. In production these would be replaced by sortmyprep's own reviewed bank.
      </p>
    </AppShell>
  )
}

export function Solve() {
  const { id = '' } = useParams()
  const [sp] = useSearchParams()
  const prove = sp.get('prove') === '1'
  const q = BY_ID[id]
  if (!q)
    return (
      <AppShell title="Question not found">
        <Link to="/practice" className="text-blue-700">Back to questions</Link>
      </AppShell>
    )
  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-center gap-2 text-[13.5px] text-muted">
        <Link to="/practice" className="hover:text-ink">Questions</Link>
        <span>/</span>
        <span>{q.subject}</span>
        <span>/</span>
        <span className="text-ink">{q.topic}</span>
      </div>
      {prove && (
        <div className="mb-5 rounded-[14px] border border-ok/25 bg-ok-50 px-4 py-3 text-[14.5px] text-ink-2">
          <span className="font-semibold text-ok">Prove it.</span> Same skill as the question you just finished, with new numbers. No hints and no reveal.
        </div>
      )}
      <Solver key={q.id + String(prove)} q={q} prove={prove} />
    </AppShell>
  )
}
