import { EyeOff, Check } from 'lucide-react'
import { AppShell } from '../components/Layout'
import { Note, Ring, Tag } from '../components/ui'
import { fmtDuration, readiness, weekTotals } from '../lib/analytics'
import { useStore } from '../lib/store'

export default function Parent() {
  const attempts = useStore((s) => s.attempts)
  const miscs = useStore((s) => s.misconceptions)
  const w = weekTotals(attempts)
  const fixed = miscs.filter((m) => m.fixed && Date.now() - m.fixed < 7 * 86400000)
  const subs = ['Maths AA', 'Physics', 'Chemistry'].map((s) => readiness(attempts, s))
  return (
    <AppShell title="Weekly note for parents" sub="What a parent receives each Sunday, if the student turns it on. Effort and progress only.">
      <Note from="5 Whys: parents can't see effort or results early. Interview: parents pay for accountable improvement" />
      <div className="mt-4 grid gap-6 [&>*]:min-w-0 xl:grid-cols-[minmax(0,620px)_1fr]">
        <article className="rounded-[20px] border border-line bg-white p-7 shadow-lift">
          <div className="text-[12.5px] text-faint">Sunday note, week of {new Date(Date.now() - 6 * 86400000).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}</div>
          <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.015em]">Kabir's week on sortmyprep</h2>
          <dl className="mt-6 grid grid-cols-3 gap-5">
            {[
              ['Sessions', String(w.sessions)],
              ['Time under tension', fmtDuration(w.tut)],
              ['Steps solved alone', String(w.unaided)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[12.5px] text-muted">{k}</dt>
                <dd className="mt-0.5 text-[24px] font-semibold tabular-nums tracking-[-0.02em]">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 space-y-2.5">
            {fixed.length > 0 && (
              <div className="flex gap-2.5 rounded-[12px] bg-ok-50 px-4 py-3 text-[14.5px]">
                <Check className="mt-0.5 size-4 shrink-0 text-ok" />
                <span>Fixed a recurring error in {fixed[0].subject} and got it right again without help.</span>
              </div>
            )}
            <div className="flex gap-2.5 rounded-[12px] bg-wash px-4 py-3 text-[14.5px]">
              <span className="mt-[7px] size-2 shrink-0 rounded-full bg-tension" />
              <span>Chemistry has had the least practice this fortnight. His plan moves it up next week.</span>
            </div>
          </div>
          <div className="mt-6">
            <div className="text-[13.5px] font-medium text-ink-2">Readiness</div>
            <div className="mt-3 flex gap-6">
              {subs.map((r) => (
                <div key={r.subject} className="text-center">
                  <Ring value={r.score} size={64} />
                  <div className="mt-1 text-[12.5px] text-muted">{r.subject}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 border-t border-line pt-5">
            <div className="text-[13.5px] font-medium text-ink-2">One thing to ask him this week</div>
            <p className="sorty mt-1.5 text-[17px]">"Can you show me how you would start a question with fractional powers?"</p>
            <p className="mt-2 text-[13px] text-muted">Asking him to explain is more useful than asking whether he studied.</p>
          </div>
        </article>
        <div className="space-y-5">
          <div className="rounded-[16px] border border-line bg-white p-5">
            <div className="flex items-center gap-2 text-[14.5px] font-semibold">
              <EyeOff className="size-4 text-muted" /> Never in the note
            </div>
            <ul className="mt-3 space-y-2 text-[14px] text-muted">
              <li>His conversations with Sorty</li>
              <li>Individual wrong answers</li>
              <li>Login times or a minute-by-minute log</li>
            </ul>
            <p className="mt-3 text-[13px] text-faint">Kabir sees the exact note before it is sent, and can turn it off.</p>
          </div>
          <div className="rounded-[16px] border border-line bg-white p-5">
            <div className="text-[14.5px] font-semibold">Why effort, not hours</div>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">An hour with a solution open is not the same as twenty minutes of real attempts. "Steps solved alone" and "time under tension" show the second kind.</p>
            <Tag tone="blue" className="mt-3">Shared with his teacher only if the school uses sortmyprep</Tag>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
