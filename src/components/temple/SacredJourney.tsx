/**
 * The sacred stages of building a Mandir, from resolve to consecration, each with a small engraved
 * emblem. `current` marks where our new Mandir is today.
 */
const STAGES = [
  {
    key: 'sankalp',
    name: 'Sankalp',
    hi: 'संकल्प',
    title: 'The resolve',
    text: 'The community makes a solemn resolution to build, and begins to gather the means: gifts, skills and prayers.',
  },
  {
    key: 'design',
    name: 'Vastu and design',
    hi: 'वास्तु',
    title: 'Planning by tradition',
    text: 'A temple architect (sthapati) shapes the plan following Vastu and the Shilpa Shastras: the orientation, proportions and the line from the entrance to the murtis.',
  },
  {
    key: 'bhoomi',
    name: 'Bhoomi Pujan',
    hi: 'भूमि पूजन',
    title: 'Blessing the earth',
    text: 'Before any digging, prayers honour Mother Earth and ask permission to build, often with offerings placed in the ground.',
  },
  {
    key: 'shila',
    name: 'Shilanyas',
    hi: 'शिलान्यास',
    title: 'Laying the foundation stone',
    text: 'Consecrated stones are set in the foundations with prayers. Families often sponsor a stone in a loved one’s name.',
  },
  {
    key: 'build',
    name: 'Nirman',
    hi: 'निर्माण',
    title: 'Building and carving',
    text: 'Walls rise, pillars are carved and the shikhara takes shape. Craft and volunteer seva go hand in hand.',
  },
  {
    key: 'prana',
    name: 'Pran Pratishtha',
    hi: 'प्राण प्रतिष्ठा',
    title: 'Installing the murtis',
    text: 'Over several days of ceremonies the murtis are installed in the sanctum and invoked with life. Our present Mandir celebrated its Pran Pratishtha in 1995.',
  },
  {
    key: 'kumbha',
    name: 'Kumbhabhishekam',
    hi: 'कुम्भाभिषेक',
    title: 'Consecrating the kalash',
    text: 'Sanctified water is poured over the kalash at the top of the shikhara, and the new Mandir opens for darshan.',
  },
] as const

function Emblem({ kind }: { kind: (typeof STAGES)[number]['key'] }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
      <g {...common}>
        {kind === 'sankalp' && (
          <>
            <path d="M24 8 C28 14 28 18 24 21 C20 18 20 14 24 8Z" fill="#ffc56b" />
            <path d="M8 28 C14 31 34 31 40 28 C38 36 31 40 24 40 C17 40 10 36 8 28Z" />
            <path d="M18 31 C21 32 27 32 30 31" />
          </>
        )}
        {kind === 'design' && (
          <>
            <path d="M24 6 L14 40 M24 6 L34 40" />
            <circle cx="24" cy="8" r="2.5" />
            <path d="M16 32 Q24 28 32 32" />
            <path d="M8 42 L40 42" />
          </>
        )}
        {kind === 'bhoomi' && (
          <>
            <path d="M16 26 Q12 18 20 14 L28 14 Q36 18 32 26 Z" fill="#ffc56b" fillOpacity="0.5" />
            <path d="M20 14 L20 10 L28 10 L28 14 M24 10 Q18 4 24 2 Q30 4 24 10" />
            <path d="M6 32 Q24 26 42 32 M4 38 Q24 32 44 38 M8 44 Q24 38 40 44" />
          </>
        )}
        {kind === 'shila' && (
          <>
            <path d="M8 22 L40 22 L40 40 L8 40 Z" />
            <path d="M8 31 L40 31 M18 22 L18 31 M30 31 L30 40" />
            <path d="M24 6 C26 10 26 13 24 16 C22 13 22 10 24 6Z M17 12 C21 13 23 15 24 16 C20 16 18 14 17 12Z M31 12 C27 13 25 15 24 16 C28 16 30 14 31 12Z" fill="#f28a1a" />
          </>
        )}
        {kind === 'build' && (
          <>
            <path d="M18 8 L30 8 L28 12 L20 12 Z M20 12 L20 36 M28 12 L28 36 M16 36 L32 36 L34 42 L14 42 Z" />
            <path d="M20 18 L28 18 M20 24 Q24 21 28 24 M20 30 L28 30" />
          </>
        )}
        {kind === 'prana' && (
          <>
            <path d="M24 12 C27 18 27 24 24 30 C21 24 21 18 24 12Z" fill="#ffc56b" />
            <path d="M24 30 C18 26 12 26 9 28 C12 32 18 33 24 30Z M24 30 C30 26 36 26 39 28 C36 32 30 33 24 30Z" />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const a = Math.PI + (Math.PI * i) / 6
              return <line key={i} x1={24 + 14 * Math.cos(a)} y1={22 + 14 * Math.sin(a)} x2={24 + 19 * Math.cos(a)} y2={22 + 19 * Math.sin(a)} />
            })}
            <path d="M12 38 L36 38" />
          </>
        )}
        {kind === 'kumbha' && (
          <>
            <path d="M14 30 Q10 20 18 16 L30 16 Q38 20 34 30 Q32 38 24 38 Q16 38 14 30Z" fill="#e3a21a" fillOpacity="0.5" />
            <path d="M18 16 L18 12 L30 12 L30 16 M24 12 Q16 6 22 2 M24 12 Q32 6 26 2" />
            <path d="M8 8 L10 14 M40 8 L38 14 M6 20 L10 22 M42 20 L38 22" />
            <path d="M12 44 L36 44" />
          </>
        )}
      </g>
    </svg>
  )
}

export function SacredJourney({ current = 'sankalp' }: { current?: (typeof STAGES)[number]['key'] }) {
  const currentIndex = STAGES.findIndex((s) => s.key === current)
  return (
    <ol className="reveal-stagger relative grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {STAGES.map((s, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'ahead'
        return (
          <li key={s.key} className={`card lift relative flex flex-col overflow-hidden p-6 ${state === 'current' ? 'ring-2 ring-marigold-400' : ''}`}>
            <span aria-hidden="true" className="absolute right-4 top-2 font-serif text-6xl leading-none text-gold-500/25">
              {i + 1}
            </span>
            <span className={`grid h-14 w-14 place-items-center rounded-full ${state === 'current' ? 'bg-kumkum-700 text-marigold-300' : 'bg-marigold-300/50 text-kumkum-800'}`}>
              <Emblem kind={s.key} />
            </span>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
              <span className="font-serif text-2xl text-charcoal-900">{s.name}</span>
              <span lang="hi" className="font-indic text-gold-700">
                {s.hi}
              </span>
            </p>
            <p className="text-sm font-semibold uppercase tracking-wide text-kumkum-800">{s.title}</p>
            <p className="mt-2 flex-1 text-charcoal-700">{s.text}</p>
            {state === 'current' && <p className="mt-4 inline-flex self-start rounded-full bg-kumkum-700 px-3 py-1 text-xs font-semibold text-ivory-50">We are here</p>}
          </li>
        )
      })}
    </ol>
  )
}
