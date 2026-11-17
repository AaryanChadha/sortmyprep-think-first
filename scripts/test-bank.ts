import { QUESTIONS, BY_ID } from '../src/data/questions'
import { judge } from '../src/lib/check'
import type { Check } from '../src/data/types'
function canon(c: Check): string | number {
  switch (c.kind) {
    case 'number': return String(c.value)
    case 'set': return c.values.join(', ')
    case 'choice': return c.correct
    case 'expr': return c.equals
    case 'keywords': return c.groups.map(g => g[0]).join(' ')
  }
}
let bad = 0, n = 0
for (const q of QUESTIONS) {
  if (q.twin && !BY_ID[q.twin]) { console.log('missing twin', q.id); bad++ }
  q.steps.forEach((s, i) => {
    n++
    const v = judge(s, canon(s.check))
    if (v.status !== 'correct') { console.log('FAIL correct', q.id, i, v); bad++ }
    for (const m of s.misconceptions ?? []) {
      const a = m.match.kind === 'choice' ? m.match.correct : canon(m.match)
      const v2 = judge(s, a)
      if (v2.status !== 'misconception') { console.log('FAIL misc', q.id, i, m.tag, v2); bad++ }
    }
  })
}
// spot checks of student-style input
const t = (id: string, i: number, a: string | number) => console.log(id, i, JSON.stringify(a), '->', judge(BY_ID[id].steps[i], a).status)
t('aa-indices', 0, '6u² + u = 12'); t('aa-indices', 0, '6u^2+1=12'); t('aa-indices',0,'6u^2 + u − 12 = 0')
t('aa-cubic', 0, 'x = 3/2, x = -2'); t('aa-cubic',0,'-2 and 1.5'); t('aa-trig',1,'pi/2, 7pi/6, 11pi/6'); t('aa-trig',1,'π/2, 7π/6, 11π/6')
t('phy-projectile',1,'2.02 s'); t('chem-enthalpy',2,'-56.8 kJ/mol'); t('econ-ped',2,'0.6'); t('phy-thermal',0,'63,000 J'); t('aa-area',2,'32/3')
t('bio-enzymes',1,'The active site changes shape so the substrate can no longer bind'); t('aa-indices',0,'hello')
console.log('steps', n, 'questions', QUESTIONS.length, 'bad', bad)
