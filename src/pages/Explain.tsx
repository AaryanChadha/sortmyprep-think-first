import clsx from 'clsx'
import { motion } from 'motion/react'
import { Check, Mic, MicOff } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AppShell } from '../components/Layout'
import { SortyMark } from '../components/Logo'
import { HoldButton } from '../components/Tension'
import { Button, Note, Tag } from '../components/ui'
import { CONCEPTS } from '../data/concepts'
import { explainLive } from '../lib/llm'
import { useStore } from '../lib/store'
import { speak } from '../lib/tutor'

type Turn = { who: 'you' | 'sorty'; text: string }

export default function Explain() {
  const settings = useStore((s) => s.settings)
  const [cid, setCid] = useState(CONCEPTS[0].id)
  const c = CONCEPTS.find((x) => x.id === cid)!
  const [text, setText] = useState('')
  const [covered, setCovered] = useState<boolean[]>(c.ideas.map(() => false))
  const [turns, setTurns] = useState<Turn[]>([])
  const [tries, setTries] = useState(0)
  const [deep, setDeep] = useState(0)
  const [showModel, setShowModel] = useState(false)
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const recRef = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    setText('')
    setCovered(c.ideas.map(() => false))
    setTurns([])
    setTries(0)
    setDeep(0)
    setShowModel(false)
  }, [cid, c.ideas])

  const allDone = covered.every(Boolean)

  const say = (t: string) => {
    setTurns((x) => [...x, { who: 'sorty', text: t }])
    if (settings.voice) speak(t)
  }

  const check = async () => {
    const body = text.trim()
    if (!body) return
    setTurns((x) => [...x, { who: 'you', text: body }])
    setTries((n) => n + 1)
    let next = c.ideas.map((idea, i) => covered[i] || idea.keys.some((k) => body.toLowerCase().includes(k.toLowerCase())))
    let follow = ''
    if (settings.apiKey) {
      setBusy(true)
      try {
        const v = await explainLive(settings.apiKey, settings.model, c.prompt, c.ideas.map((i) => i.label), body)
        next = next.map((b, i) => b || v.covered[i])
        follow = v.followUp
      } catch {
        /* fall back to keyword engine */
      } finally {
        setBusy(false)
      }
    }
    setCovered(next)
    setText('')
    const missing = c.ideas.findIndex((_, i) => !next[i])
    if (missing === -1) {
      say(follow || `That covers it, in your own words. ${c.deeper[0]}`)
      setDeep(1)
    } else {
      const got = next.filter(Boolean).length
      say(follow || `${got ? `${got} of ${c.ideas.length} ideas are there.` : 'Not there yet.'} ${c.ideas[missing].probe}`)
    }
  }

  const dictate = () => {
    type Rec = { lang: string; interimResults: boolean; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; start: () => void; stop: () => void }
    const W = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec }
    const R = W.SpeechRecognition ?? W.webkitSpeechRecognition
    if (!R) return alert('Voice input needs Chrome or Edge.')
    if (listening) {
      recRef.current?.stop()
      return
    }
    const rec = new R()
    rec.lang = 'en-GB'
    rec.interimResults = false
    rec.onresult = (e) => setText((t) => `${t} ${Array.from(e.results).map((r) => r[0].transcript).join(' ')}`.trim())
    rec.onend = () => setListening(false)
    recRef.current = rec
    setListening(true)
    rec.start()
  }

  return (
    <AppShell title="Explain it back" sub="If you can explain it, you can answer it. Write or say it in your own words. Sorty checks which ideas are there and asks about the first one missing.">
      <Note from="SCAMPER: Rearrange, and Riddled's 'follow the thought'">Students explain, Sorty finds the gaps. It never rewrites the explanation.</Note>
      <div className="mt-4 flex flex-wrap gap-2">
        {CONCEPTS.map((x) => (
          <button key={x.id} onClick={() => setCid(x.id)} className={clsx('rounded-[10px] border px-3 py-2 text-left text-[13.5px] transition-colors', x.id === cid ? 'border-blue bg-blue-50 text-blue-700' : 'border-line bg-white text-ink-2 hover:border-blue/40')}>
            <span className="block text-[11.5px] text-faint">{x.subject}, {x.syllabus}</span>
            {x.title}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 [&>*]:min-w-0 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[16px] border border-line bg-white shadow-soft">
          <div className="border-b border-line px-6 py-5">
            <p className="text-[17px] leading-relaxed">{c.prompt}</p>
          </div>
          <div className="space-y-4 px-6 py-5">
            {turns.length === 0 && <p className="sorty text-[15px] opacity-60">Take your time. Short sentences are fine. I will not correct your wording, only point at what is missing.</p>}
            {turns.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={clsx('flex gap-3', t.who === 'you' && 'flex-row-reverse')}>
                {t.who === 'sorty' ? <SortyMark className="mt-0.5 size-6 shrink-0" /> : <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-[10px] font-semibold text-white">KM</span>}
                <p className={clsx('max-w-[85%] rounded-[12px] px-3.5 py-2.5', t.who === 'sorty' ? 'sorty bg-blue-50 text-[15.5px]' : 'bg-wash text-[15px] text-ink')}>{t.text}</p>
              </motion.div>
            ))}
            {deep > 0 && deep <= c.deeper.length && turns[turns.length - 1]?.who === 'you' && (
              <div className="flex gap-3">
                <SortyMark className="mt-0.5 size-6 shrink-0" />
                <p className="sorty rounded-[12px] bg-blue-50 px-3.5 py-2.5 text-[15.5px]">{c.deeper[Math.min(deep, c.deeper.length - 1)] ?? 'That is as deep as this one goes. Nicely done.'}</p>
              </div>
            )}
          </div>
          <div className="border-t border-line p-4">
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder={allDone ? 'Answer the follow-up, or try another concept' : 'Explain it in your own words'} className="paper w-full resize-y rounded-[10px] border border-line-2 px-3 py-[6px] text-[15.5px] leading-[32px] outline-none focus:border-blue" aria-label="Your explanation" />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                onClick={() => {
                  if (allDone) {
                    setTurns((x) => [...x, { who: 'you', text: text.trim() }])
                    setText('')
                    setDeep((d) => d + 1)
                  } else check()
                }}
                disabled={!text.trim() || busy}
              >
                {busy ? 'Reading…' : allDone ? 'Reply' : 'Check my explanation'}
              </Button>
              <Button variant="secondary" onClick={dictate}>
                {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />} {listening ? 'Stop' : 'Say it'}
              </Button>
              <span className="ml-auto text-[12.5px] text-faint">{tries ? `${tries} attempt${tries > 1 ? 's' : ''}` : ''}</span>
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-[16px] border border-line bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] font-medium text-ink-2">Ideas the examiner looks for</span>
              <Tag tone={allDone ? 'ok' : 'plain'}>
                {covered.filter(Boolean).length}/{c.ideas.length}
              </Tag>
            </div>
            <ul className="mt-3 space-y-2">
              {c.ideas.map((idea, i) => (
                <li key={idea.label} className={clsx('flex items-start gap-2.5 text-[14px] leading-snug', covered[i] ? 'text-ink' : 'text-faint')}>
                  <span className={clsx('mt-[2px] grid size-[18px] shrink-0 place-items-center rounded-full transition-colors', covered[i] ? 'bg-ok text-white' : 'border border-line-2')}>{covered[i] && <Check className="size-3" />}</span>
                  {covered[i] || tries >= 2 ? idea.label : 'Hidden until you mention it'}
                </li>
              ))}
            </ul>
            {tries >= 2 && !allDone && <p className="mt-3 text-[12.5px] text-faint">Labels show after two attempts, so you know what to aim for.</p>}
          </div>
          <div className="rounded-[16px] border border-line bg-white p-4 shadow-soft">
            <div className="text-[13.5px] font-medium text-ink-2">Model explanation</div>
            {showModel ? (
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{c.model}</p>
            ) : (
              <div className="mt-3">
                <HoldButton onDone={() => setShowModel(true)} disabled={tries < 2 && !allDone}>
                  {tries < 2 && !allDone ? 'Available after two attempts' : 'Hold to compare with a model'}
                </HoldButton>
              </div>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  )
}
