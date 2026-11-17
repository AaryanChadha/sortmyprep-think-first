export type Idea = { label: string; keys: string[]; probe: string }
export type Concept = {
  id: string
  subject: string
  syllabus: string
  title: string
  prompt: string
  ideas: Idea[]
  /** Follow-the-thought: deeper "why" chain once ideas are covered */
  deeper: string[]
  model: string
}

export const CONCEPTS: Concept[] = [
  {
    id: 'repeated-root',
    subject: 'Maths AA',
    syllabus: 'AA 2.6',
    title: 'Why a repeated root touches the axis',
    prompt: 'Explain, as if to a friend in DP1, why the graph of y = (x − 2)²(x + 1) touches the x-axis at x = 2 but crosses it at x = −1.',
    ideas: [
      { label: 'A squared factor is never negative', keys: ['square', 'never negative', 'always positive', 'non-negative', '≥ 0', '>= 0', 'positive either side'], probe: 'What sign is (x − 2)² for x = 1.9? For x = 2.1?' },
      { label: 'So y does not change sign at x = 2', keys: ['sign', 'same side', 'doesn\'t change', 'does not change', 'stays'], probe: 'If y is positive just before x = 2, what is it just after?' },
      { label: 'A single factor does change sign', keys: ['x + 1', 'x+1', 'single', 'changes sign', 'odd power', 'power of 1'], probe: 'What happens to the sign of (x + 1) as x passes −1?' },
      { label: 'Changing sign means crossing; keeping sign means touching', keys: ['cross', 'touch', 'bounce', 'turn'], probe: 'How does a change of sign look on a graph?' },
    ],
    deeper: [
      'Good. Now push it: what would happen at a root from a factor (x − 2)³?',
      'And why does an odd power behave like a single root, but flatter?',
    ],
    model: 'A squared factor is never negative, so y keeps the same sign on both sides of x = 2 and the curve touches and turns. The single factor (x + 1) changes sign as x passes −1, so y changes sign and the curve crosses.',
  },
  {
    id: 'projectile-independence',
    subject: 'Physics',
    syllabus: 'A.1',
    title: 'Why horizontal speed does not change fall time',
    prompt: 'Two balls leave a table at the same moment: one dropped, one pushed off horizontally. Explain why they hit the floor at the same time.',
    ideas: [
      { label: 'Horizontal and vertical motion are independent', keys: ['independent', 'separate', 'separately', 'doesn\'t affect', 'does not affect'], probe: 'Does a sideways push give the ball any downward velocity?' },
      { label: 'Both start with zero vertical velocity', keys: ['zero vertical', 'no vertical', '0 vertical', 'initial vertical', 'start at rest vertically'], probe: 'What is the vertical velocity of each ball at the instant it leaves the table?' },
      { label: 'Both have the same downward acceleration g', keys: ['gravity', 'g', '9.8', 'acceleration', 'same acceleration'], probe: 'What force acts on each ball once it is in the air, and in which direction?' },
      { label: 'Same height, same start, same acceleration means same time', keys: ['same height', 'same distance', 'same time', 's = ut', 'suvat'], probe: 'Which equation gives time from height and acceleration?' },
    ],
    deeper: ['Now add air resistance. Does your argument still hold exactly? Why not?'],
    model: 'Horizontal and vertical motion are independent. Both balls start with zero vertical velocity and fall the same height with the same acceleration g, so s = ½gt² gives the same t for both.',
  },
  {
    id: 'enzyme-denature',
    subject: 'Biology',
    syllabus: 'C1.1',
    title: 'Why enzymes stop working when hot',
    prompt: 'Explain why the rate of an enzyme-catalysed reaction falls steeply above the optimum temperature.',
    ideas: [
      { label: 'Bonds holding the tertiary structure break', keys: ['bond', 'hydrogen', 'tertiary', 'vibrat'], probe: 'What holds a protein in its 3D shape, and what does heat do to those bonds?' },
      { label: 'The active site changes shape', keys: ['active site', 'shape'], probe: 'Which part of the enzyme matters most for catalysis?' },
      { label: 'Substrate can no longer bind', keys: ['substrate', 'fit', 'bind', 'complementary', 'complex'], probe: 'If the active site changes, what can the substrate no longer do?' },
      { label: 'This is permanent (denaturation)', keys: ['denature', 'permanent', 'irreversible'], probe: 'If you cool it again, does activity come back?' },
    ],
    deeper: ['Why does rate rise before the optimum? Use collisions in your answer.'],
    model: 'Heat breaks hydrogen and ionic bonds that hold the tertiary structure, so the active site changes shape. The substrate is no longer complementary and cannot bind, so fewer enzyme-substrate complexes form. The enzyme is denatured, usually permanently.',
  },
  {
    id: 'ped-revenue',
    subject: 'Economics',
    syllabus: '2.3',
    title: 'What inelastic demand means for a price rise',
    prompt: 'A firm finds the PED for its product is −0.4. Explain whether it should raise its price if it wants more revenue.',
    ideas: [
      { label: 'Demand is price inelastic (|PED| < 1)', keys: ['inelastic', 'less than 1', '< 1', 'less than one'], probe: 'Is 0.4 above or below 1, and what is that called?' },
      { label: 'Quantity falls proportionally less than price rises', keys: ['proportion', 'percentage', 'smaller', 'less than', 'falls less'], probe: 'If price rises 10%, roughly how much does quantity fall?' },
      { label: 'So total revenue rises', keys: ['revenue', 'tr', 'p × q', 'p x q', 'p*q'], probe: 'What happens to P × Q when P goes up a lot and Q falls a little?' },
      { label: 'Limits: other goals, competitors, long run', keys: ['long run', 'substitute', 'competitor', 'however', 'profit', 'depend'], probe: 'Is more revenue always the same as more profit? What might change over time?' },
    ],
    deeper: ['Why might PED become more elastic in the long run?'],
    model: 'With PED of −0.4, demand is price inelastic: a price rise causes a proportionally smaller fall in quantity, so total revenue rises. The firm should consider that substitutes may appear in the long run and that revenue is not the same as profit.',
  },
]
