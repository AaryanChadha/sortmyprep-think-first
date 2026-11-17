import katex from 'katex'
import { useMemo } from 'react'

function renderPart(src: string, display: boolean) {
  try {
    return katex.renderToString(src, { throwOnError: false, displayMode: display })
  } catch {
    return src
  }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Renders text with inline $...$ and display $$...$$ maths. */
export function Tex({ children, className }: { children: string; className?: string }) {
  const html = useMemo(() => {
    // "\$" is a literal dollar sign (currency), inside or outside maths.
    const DOL = '\u0000'
    const src = children.replace(/\\\$/g, DOL)
    const out: string[] = []
    const re = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g
    let last = 0
    let m: RegExpExecArray | null
    const txt = (t: string) => esc(t).replace(/\u0000/g, '$')
    const math = (t: string) => t.replace(/\u0000/g, '\\$')
    while ((m = re.exec(src))) {
      out.push(txt(src.slice(last, m.index)))
      out.push(m[1] ? renderPart(math(m[1]), true) : renderPart(math(m[2]), false))
      last = m.index + m[0].length
    }
    out.push(txt(src.slice(last)))
    return out.join('')
  }, [children])
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

/** Strip LaTeX for speech and plain previews. */
export function plain(s: string) {
  return s
    .replace(/\\tfrac\{([^}]*)\}\{([^}]*)\}|\\frac\{([^}]*)\}\{([^}]*)\}|\\dfrac\{([^}]*)\}\{([^}]*)\}/g, (_m, a, b, c, d, e, f) => `${a ?? c ?? e} over ${b ?? d ?? f}`)
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[${}^_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
