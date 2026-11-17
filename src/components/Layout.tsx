import clsx from 'clsx'
import { BookOpen, CalendarRange, ChartNoAxesCombined, GraduationCap, LifeBuoy, MessageSquareQuote, Settings2, Users, Menu, X, Sparkle } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { resetDemo, updateSettings, useStore } from '../lib/store'
import { Logo } from './Logo'
import { Button, Switch } from './ui'

export function NotesSwitch() {
  const on = useStore((s) => s.settings.notes)
  return <Switch id="notes-toggle" checked={on} onChange={(v) => updateSettings({ notes: v })} label={<span className="whitespace-nowrap">Show what's new</span>} />
}

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const links = [
    ['/?s=how', 'How it works'],
    ['/?s=teachers', 'For teachers'],
    ['/?s=parents', 'For parents'],
    ['/practice', 'Questions'],
    ['/changes', 'What we changed'],
  ]
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-5 md:px-8">
        <Link to="/" className="shrink-0 text-ink" aria-label="sortmyprep home">
          <Logo className="h-[26px] w-auto" />
        </Link>
        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map(([to, label]) => (
            <Link key={to} to={to} className="rounded-lg px-3 py-2 text-[14.5px] text-muted transition-colors hover:text-ink">
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-4 md:flex">
          <NotesSwitch />
          <Button to="/solve/aa-cubic" size="md">
            Try a question
          </Button>
        </div>
        <button className="ml-auto rounded-lg p-2 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu" aria-expanded={open}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-line bg-white px-5 py-4 md:hidden">
          <div className="grid gap-1">
            {links.map(([to, label]) => (
              <Link key={to} to={to} onClick={() => setOpen(false)} className="rounded-lg px-2 py-2 text-[15px] text-ink-2">
                {label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <NotesSwitch />
            <Button to="/solve/aa-cubic" size="sm">
              Try a question
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-wash/60">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-8">
        <div>
          <Logo className="h-6 w-auto text-ink" />
          <p className="mt-4 max-w-[32ch] text-[14px] leading-relaxed text-muted">A concept prototype for sortmyprep, made by a student team in the Creativity and Design Thinking course at Ashoka University.</p>
        </div>
        <FooterCol title="Students" links={[['/practice', 'Question bank'], ['/explain', 'Explain it back'], ['/plan', 'Exam plan'], ['/recovery', 'Bad grade recovery'], ['/insights', 'My insights']]} />
        <FooterCol title="Schools" links={[['/teacher', 'Teacher dashboard'], ['/teacher?tab=rules', 'Hint and reveal rules'], ['/teacher?tab=pilot', 'Private pilot']]} />
        <FooterCol title="This proposal" links={[['/changes', 'What we changed and why'], ['/parent', 'Parent weekly note'], ['/settings', 'Prototype settings']]} />
      </div>
      <div className="mx-auto max-w-[1200px] px-5 pb-10 text-[12.5px] leading-relaxed text-faint md:px-8">
        Not an official sortmyprep release. Questions are IB-style and written by the team for this prototype, except the two we used to test Sorty's free trial. They are not reproduced from IB past papers. International Baccalaureate and IB are registered trademarks of the International Baccalaureate Organization, which does not endorse this work.
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="text-[13.5px] font-semibold text-ink">{title}</div>
      <ul className="mt-3 space-y-2">
        {links.map(([to, l]) => (
          <li key={to}>
            <Link to={to} className="text-[14px] text-muted hover:text-ink">
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

const appLinks: { to: string; label: string; icon: typeof BookOpen; group: string }[] = [
  { to: '/practice', label: 'Questions', icon: BookOpen, group: 'Student' },
  { to: '/explain', label: 'Explain it back', icon: MessageSquareQuote, group: 'Student' },
  { to: '/plan', label: 'Exam plan', icon: CalendarRange, group: 'Student' },
  { to: '/recovery', label: 'Recovery plan', icon: LifeBuoy, group: 'Student' },
  { to: '/insights', label: 'Insights', icon: ChartNoAxesCombined, group: 'Student' },
  { to: '/teacher', label: 'Teacher', icon: GraduationCap, group: 'Other views' },
  { to: '/parent', label: 'Parent', icon: Users, group: 'Other views' },
  { to: '/changes', label: 'What we changed', icon: Sparkle, group: 'Other views' },
  { to: '/settings', label: 'Settings', icon: Settings2, group: 'Other views' },
]

export function AppShell({ children, title, actions, sub }: { children: ReactNode; title?: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  const groups = [...new Set(appLinks.map((l) => l.group))]
  const nav = (
    <nav aria-label="App" className="space-y-6">
      {groups.map((g) => (
        <div key={g}>
          <div className="px-3 pb-1.5 text-[12px] font-medium text-faint">{g}</div>
          <ul className="space-y-0.5">
            {appLinks
              .filter((l) => l.group === g)
              .map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-2.5 rounded-[9px] px-3 py-2 text-[14.5px] transition-colors',
                        isActive || (l.to === '/practice' && loc.pathname.startsWith('/solve')) ? 'bg-white font-semibold text-ink shadow-[0_1px_2px_rgba(15,27,45,.06),0_0_0_1px_rgba(15,27,45,.05)]' : 'text-muted hover:bg-white/70 hover:text-ink',
                      )
                    }
                  >
                    <l.icon className="size-[17px]" strokeWidth={1.8} />
                    {l.label}
                  </NavLink>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </nav>
  )
  return (
    <div className="min-h-dvh bg-[#f7f9fd]">
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-line bg-white/85 px-4 backdrop-blur-xl md:px-6">
        <button className="rounded-lg p-1.5 lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu" aria-expanded={open}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <Link to="/" className="text-ink" aria-label="sortmyprep home">
          <Logo className="h-[22px] w-auto" />
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <NotesSwitch />
          <div className="hidden items-center gap-2 sm:flex">
            <span className="grid size-8 place-items-center rounded-full bg-blue-100 text-[13px] font-semibold text-blue-700">KM</span>
            <div className="text-[12.5px] leading-tight">
              <div className="font-semibold">Kabir M.</div>
              <div className="text-faint">DP2, sample student</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1440px]">
        <aside className={clsx('fixed inset-y-14 left-0 z-30 w-[232px] border-r border-line bg-[#f4f7fc] px-3 py-5 transition-transform lg:sticky lg:top-14 lg:h-[calc(100dvh-56px)] lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
          {nav}
          <button onClick={resetDemo} className="absolute bottom-4 left-6 text-[12px] text-faint hover:text-ink">
            Reset sample data
          </button>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          {(title || actions) && (
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                {title && <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] md:text-[32px]">{title}</h1>}
                {sub && <p className="mt-1.5 max-w-[60ch] text-[15.5px] text-muted">{sub}</p>}
              </div>
              {actions}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
