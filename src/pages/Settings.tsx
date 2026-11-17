import { useState } from 'react'
import { AppShell } from '../components/Layout'
import { Button, Switch } from '../components/ui'
import { resetDemo, updateSettings, useStore } from '../lib/store'

export default function Settings() {
  const s = useStore((x) => x.settings)
  const [key, setKey] = useState(s.apiKey)
  const [saved, setSaved] = useState(false)
  return (
    <AppShell title="Prototype settings" sub="For presenting the prototype. Students would not see this page.">
      <div className="max-w-[640px] space-y-5">
        <section className="rounded-[16px] border border-line bg-white p-6">
          <h2 className="text-[16px] font-semibold">Live model (optional)</h2>
          <p className="mt-1 text-[14px] leading-relaxed text-muted">
            Everything works without this. With a key, the "Ask about this step" box and Explain it back send requests to Claude under the same attempt-first rules. Locked hints and final answers are never sent. The key stays in this browser.
          </p>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              updateSettings({ apiKey: key.trim() })
              setSaved(true)
              setTimeout(() => setSaved(false), 1500)
            }}
          >
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Anthropic API key" className="h-10 min-w-0 flex-1 rounded-[10px] border border-line-2 px-3 text-[14.5px] outline-none focus:border-blue" aria-label="API key" autoComplete="off" />
            <Button type="submit">{saved ? 'Saved' : 'Save key'}</Button>
          </form>
          <label className="mt-3 block text-[13px] font-medium text-ink-2">
            Model
            <input value={s.model} onChange={(e) => updateSettings({ model: e.target.value })} className="mt-1.5 h-10 w-full rounded-[10px] border border-line-2 px-3 text-[14.5px] outline-none focus:border-blue" />
          </label>
          {s.apiKey && (
            <button className="mt-3 text-[13px] text-err" onClick={() => { updateSettings({ apiKey: '' }); setKey('') }}>
              Remove key
            </button>
          )}
        </section>
        <section className="space-y-4 rounded-[16px] border border-line bg-white p-6">
          <h2 className="text-[16px] font-semibold">Presenting</h2>
          <Switch id="s-notes" checked={s.notes} onChange={(v) => updateSettings({ notes: v })} label="Show what's new (proposal notes with their sources)" />
          <Switch id="s-voice" checked={s.voice} onChange={(v) => updateSettings({ voice: v })} label="Read Sorty's notes aloud" />
          <div>
            <Button variant="secondary" onClick={resetDemo}>Reset sample data</Button>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
