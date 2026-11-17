import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Footer, SiteNav } from '../components/Layout'
import { SectionTitle, Tag } from '../components/ui'

type Row = { change: string; fixes: string; from: string[]; measure: string; to: string }

const ROWS: { group: string; rows: Row[] }[] = [
  {
    group: 'How Sorty tutors',
    rows: [
      { change: 'One step at a time, attempt first', fixes: 'In our trial Sorty gave the roots and intercepts before we tried anything.', from: ['Our free-trial test', 'Problem statement'], measure: 'Share of steps where the first attempt comes before any help', to: '/solve/aa-cubic' },
      { change: 'Time under tension and earned hints', fixes: 'Help arrived instantly, so there was no reason to think first.', from: ['Team brief: time under tension', 'Bastani et al. 2025'], measure: 'Hints per step; premature reveals; time to first attempt', to: '/solve/aa-indices' },
      { change: 'Approach question before working', fixes: 'Students jump to calculation without a plan.', from: ['VibeWise'], measure: 'Plans chosen; how often a weak plan is revised', to: '/solve/aa-logs' },
      { change: 'Known errors get a question back, not a correction', fixes: 'In the algebra test Sorty spotted the error, then wrote the fix for us.', from: ['Our free-trial test'], measure: 'Self-corrections without a hint', to: '/solve/aa-indices' },
      { change: 'Prove it: matched question, no help', fixes: 'Seeing a solution felt like learning, but nothing checked it.', from: ['5 Whys: students', 'Handoff test plan'], measure: 'Pass rate on unseen matched questions', to: '/solve/aa-series-t?prove=1' },
      { change: 'Every line cites the mark scheme and syllabus code', fixes: 'Students could not tell how reliable feedback was.', from: ['SCAMPER: Substitute', '5 Whys: students', 'Interview: curriculum aligned'], measure: 'Teacher agreement with proposed marks', to: '/practice' },
      { change: 'Explain it back, with follow-up whys', fixes: 'Students read explanations passively.', from: ['SCAMPER: Rearrange', 'Riddled: follow the thought'], measure: 'Ideas covered per attempt; retention on retest', to: '/explain' },
      { change: 'Margin notes, two modes, reviewers, drawing, read aloud', fixes: 'A generic chat window, the same voice for every need.', from: ['Riddled'], measure: 'Which modes students keep using after week one', to: '/solve/econ-tax' },
      { change: 'A visible decision log', fixes: 'Nobody could see why the AI did what it did.', from: ["Professor's brief: agentic AI"], measure: 'Teacher trust in pilot interviews', to: '/solve/aa-cubic' },
    ],
  },
  {
    group: 'Around the question',
    rows: [
      { change: 'Readiness score and effort streak', fixes: 'Progress was measured in hours or not at all.', from: ['SCAMPER: Adapt (Duolingo, fitness)'], measure: '7-day and 30-day return', to: '/plan' },
      { change: 'Bad grade recovery plan', fixes: 'A poor mock triggers panic and a tutor search, not a plan.', from: ['SCAMPER: Modify', '5 Whys: parents'], measure: 'Plans finished; retest change', to: '/recovery' },
      { change: 'Plan back from the exam date', fixes: 'Students have hundreds of papers and no order to do them in.', from: ['SCAMPER: Combine', 'Last year’s goal planner'], measure: 'Weekly plan completion', to: '/plan' },
      { change: 'Error log with spaced retries', fixes: 'Mistakes were seen once and forgotten.', from: ['Reddit IB advice: track errors', 'Interview: everything saved to insights'], measure: 'Errors fixed unaided within 7 days', to: '/insights' },
    ],
  },
  {
    group: 'For schools and parents',
    rows: [
      { change: 'Live view of working, not only scores', fixes: 'Teachers could not see how students got their answers.', from: ['Interview: real-time teacher visibility', '5 Whys: teachers'], measure: 'Teacher weekly active use', to: '/teacher' },
      { change: 'Teacher rules for hints and reveals', fixes: 'Teachers had no control over how much the AI gave away.', from: ['Handoff priority 1', 'Problem brief: protect professional status'], measure: 'Classes with custom rules', to: '/teacher?tab=rules' },
      { change: 'Mark review with a change log', fixes: 'Teachers are accountable for marks they did not give.', from: ['5 Whys: teachers'], measure: 'Agreement rate; net marking time', to: '/teacher?tab=review' },
      { change: 'Agent drafts follow-up sets for approval', fixes: 'Personalising work for each error is too slow by hand.', from: ["Professor's brief: agentic AI", 'Problem brief: reduce burnout'], measure: 'Drafts approved and used', to: '/teacher?tab=errors' },
      { change: 'Private pilot with an evidence report', fixes: 'Schools must look AI-cautious in public while needing help in private.', from: ['Problem brief: the performance paradox'], measure: 'Pilots that extend to a second class', to: '/teacher?tab=pilot' },
      { change: 'Weekly note for parents', fixes: 'Parents only see problems after a bad report.', from: ['5 Whys: parents', 'Interview: parents pay for results'], measure: 'Renewal for students with notes on', to: '/parent' },
    ],
  },
]

const KEPT = ['Board-aligned question bank', 'Step-by-step sorted solutions', 'Sorty, voice and screen share', 'Photo upload marking', 'Insights dashboard', 'Exam builder', 'Teacher visibility', 'Figtree and IBM Plex type, sortmyprep blue']

export default function Changes() {
  return (
    <div className="bg-white">
      <SiteNav />
      <header className="hero-wash border-b border-line">
        <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-8 md:py-20">
          <h1 className="max-w-[20ch] text-balance text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[56px]">What we changed, and why</h1>
          <p className="mt-5 max-w-[42rem] text-[18px] leading-relaxed text-muted">
            Students already have answers and more papers than they can use. What they lack is a routine for attempting questions alone, understanding lost marks and coming back to mistakes. Every change below points at that gap, and each one says where the idea came from and how sortmyprep could check it works.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {['Free-trial test of Sorty', 'Founder Q&A notes', 'SCAMPER', '5 Whys: students, parents, teachers', 'Problem statement canvas', 'Riddled', 'VibeWise', 'Learning research'].map((s) => (
              <Tag key={s}>{s}</Tag>
            ))}
          </div>
        </div>
      </header>

      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          {ROWS.map((g) => (
            <div key={g.group} className="mb-14">
              <h2 className="text-[22px] font-semibold tracking-[-0.01em]">{g.group}</h2>
              <div className="scrollbar-thin mt-4 overflow-x-auto rounded-[14px] border border-line">
                <table className="w-full min-w-[860px] text-left text-[14px]">
                  <thead className="bg-wash/70 text-[12.5px] text-muted">
                    <tr>
                      <th className="w-[24%] px-4 py-3 font-medium">Change</th>
                      <th className="w-[28%] px-4 py-3 font-medium">Problem it answers</th>
                      <th className="w-[22%] px-4 py-3 font-medium">Where it came from</th>
                      <th className="w-[20%] px-4 py-3 font-medium">How to measure it</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {g.rows.map((r) => (
                      <tr key={r.change} className="align-top">
                        <td className="px-4 py-3.5 font-semibold">{r.change}</td>
                        <td className="px-4 py-3.5 text-ink-2">{r.fixes}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {r.from.map((f) => (
                              <Tag key={f} tone="blue">{f}</Tag>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-muted">{r.measure}</td>
                        <td className="px-4 py-3.5 text-right">
                          <Link to={r.to} className="inline-flex items-center gap-1 whitespace-nowrap text-[13px] font-semibold text-blue-700">
                            Try it <ArrowUpRight className="size-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-wash/60 py-16">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-5 md:px-8 lg:grid-cols-2">
          <div>
            <SectionTitle title="What we kept" sub="This builds on sortmyprep rather than replacing it. The same brand, the same bank, the same Sorty." />
            <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {KEPT.map((k) => (
                <li key={k} className="rounded-[10px] border border-line bg-white px-3 py-2.5 text-[14.5px]">
                  {k}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionTitle title="How sortmyprep could test it" sub="A four-week comparison on matched questions, in one or two schools." />
            <ol className="mt-6 space-y-4 text-[15px] leading-relaxed">
              <li className="grid grid-cols-[24px_1fr] gap-3"><span className="font-semibold text-blue-700">1</span><span><b>Two groups.</b> Half the class gets today's full-solution Sorty, half gets attempt-first with time under tension.</span></li>
              <li className="grid grid-cols-[24px_1fr] gap-3"><span className="font-semibold text-blue-700">2</span><span><b>Same questions.</b> Both groups see the same set, then a matched question with no AI.</span></li>
              <li className="grid grid-cols-[24px_1fr] gap-3"><span className="font-semibold text-blue-700">3</span><span><b>Measure learning, not liking.</b> First unaided step, hints used, premature reveals, self-correction, the no-AI result, next-week retry and student frustration.</span></li>
              <li className="grid grid-cols-[24px_1fr] gap-3"><span className="font-semibold text-blue-700">4</span><span><b>Count the teacher's time honestly.</b> Time saved minus time spent checking Sorty.</span></li>
            </ol>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-5 md:px-8 lg:grid-cols-2">
          <div>
            <h2 className="text-[22px] font-semibold">What this prototype is and is not</h2>
            <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-ink-2">
              <li>The tutor runs on a scripted engine built from the question bank: every step, hint, known error and mark-scheme line is written out. A live model can be connected in Settings and follows the same rules.</li>
              <li>The bank is a sample of IB-style questions written by our team, plus the two questions we used to test Sorty. None are copied from IB papers.</li>
              <li>Student history, class rosters and pilot figures are sample data to show the screens. They are not results.</li>
              <li>We could not see sortmyprep's teacher dashboard or internal analytics, so school features are proposals, not changes to an existing workflow.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-[22px] font-semibold">Sources</h2>
            <ul className="mt-4 space-y-2 text-[15px]">
              {[
                ['Bastani et al., Generative AI without guardrails can harm learning, PNAS 2025', 'https://doi.org/10.1073/pnas.2422633122'],
                ['Riddled, a notebook that thinks with you', 'https://www.riddled.ai/'],
                ['VibeWise, a plugin that puts learning first', 'https://github.com/nykooi1/vibe-wise'],
                ['Noah Kim, video demo of VibeWise', 'https://www.youtube.com/watch?v=GckkaKEQ3vo'],
                ['sortmyprep, current site', 'https://sortmyprep.com/'],
                ['Last year’s prototype', 'https://ritishakapur.github.io/sortmyprep/'],
                ['Full feature list and evidence (FEATURES.md)', 'https://github.com/AaryanChadha/sortmyprep-think-first/blob/main/FEATURES.md'],
              ].map(([l, u]) => (
                <li key={u}>
                  <a href={u} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1 text-blue-700 hover:underline">
                    {l} <ArrowUpRight className="mt-1 size-3.5 shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
