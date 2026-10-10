/**
 * Concept illustration of the new Mandir (spec section 13, FR-04). A simple line-art massing
 * study, deliberately not a photo-real render: no architect's drawings exist yet. It is always
 * shown with the label "Artist's impression, not final design". Editors can replace it with
 * uploaded concept visuals in the CMS (New Mandir appeal → Vision).
 */
export function ConceptMandir({ className = '', title = "Artist's impression of the new Mandir at dusk" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 1200 760" role="img" aria-label={title} className={className} preserveAspectRatio="xMidYMid slice">
      <title>{title}</title>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2420" />
          <stop offset="0.45" stopColor="#5e2a12" />
          <stop offset="0.78" stopColor="#c2551a" />
          <stop offset="1" stopColor="#f0a35e" />
        </linearGradient>
        <linearGradient id="stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf1e2" />
          <stop offset="1" stopColor="#e6cfae" />
        </linearGradient>
        <linearGradient id="stoneShade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d9bf98" />
          <stop offset="1" stopColor="#f4e4cb" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.62" r="0.5">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2a20" />
          <stop offset="1" stopColor="#1f1b18" />
        </linearGradient>
      </defs>

      <rect width="1200" height="760" fill="url(#sky)" />
      {/* stars */}
      <g fill="#fbf6ee" opacity="0.7">
        {[[90, 70], [210, 130], [330, 55], [470, 110], [760, 60], [880, 125], [1010, 80], [1120, 140], [640, 40], [150, 210], [1060, 230]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.8 : 1.1} />
        ))}
      </g>
      <circle cx="600" cy="470" r="420" fill="url(#glow)" />

      {/* distant trees */}
      <path d="M0 600 C80 560 140 590 210 565 S330 575 380 585 L380 640 L0 640Z" fill="#2c2019" opacity="0.8" />
      <path d="M820 585 C880 560 960 575 1030 556 S1150 570 1200 560 L1200 640 L820 640Z" fill="#2c2019" opacity="0.8" />

      {/* plinth (jagati) and steps */}
      <path d="M250 610 H950 L980 640 H220Z" fill="#d6bb93" />
      <rect x="220" y="640" width="760" height="26" fill="#c9ab80" />
      {Array.from({ length: 5 }).map((_, i) => (
        <rect key={i} x={540 - i * 14} y={612 + i * 11} width={120 + i * 28} height="11" fill={i % 2 ? '#e3caa3' : '#d9bd94'} />
      ))}

      {/* side wings: classrooms and hall */}
      <g>
        <rect x="270" y="500" width="190" height="110" fill="url(#stoneShade)" />
        <rect x="740" y="500" width="190" height="110" fill="url(#stoneShade)" />
        <rect x="262" y="490" width="206" height="14" fill="#f6e7cf" />
        <rect x="732" y="490" width="206" height="14" fill="#f6e7cf" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <path d={`M${290 + i * 44} 600 V548 a14 14 0 0 1 28 0 V600Z`} fill="#7a3a17" opacity="0.85" />
            <path d={`M${760 + i * 44} 600 V548 a14 14 0 0 1 28 0 V600Z`} fill="#7a3a17" opacity="0.85" />
            <path d={`M${294 + i * 44} 596 V550 a10 10 0 0 1 20 0 V596Z`} fill="#ffcf8a" opacity="0.8" />
            <path d={`M${764 + i * 44} 596 V550 a10 10 0 0 1 20 0 V596Z`} fill="#ffcf8a" opacity="0.8" />
          </g>
        ))}
        {/* small domes (chhatris) on wings */}
        {[300, 430, 770, 900].map((x) => (
          <g key={x}>
            <rect x={x - 14} y="470" width="28" height="20" fill="#f6e7cf" />
            <path d={`M${x - 18} 472 Q${x} 440 ${x + 18} 472Z`} fill="url(#stone)" />
            <line x1={x} y1="446" x2={x} y2="436" stroke="#b08d3c" strokeWidth="2" />
          </g>
        ))}
      </g>

      {/* mandapa (assembly hall) with stepped roof */}
      <g>
        <rect x="430" y="455" width="340" height="155" fill="url(#stoneShade)" />
        <rect x="420" y="443" width="360" height="16" fill="#f8ead4" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={446 + i * 56} y="470" width="14" height="140" fill="#f6e5c8" />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${462 + i * 56} 610 V505 a21 21 0 0 1 42 0 V610Z`} fill="#ffcf8a" opacity={0.75} />
        ))}
        {/* samvarana roof tiers */}
        <path d="M445 443 L600 360 L755 443Z" fill="url(#stone)" />
        <path d="M480 418 L600 352 L720 418" fill="none" stroke="#d6b98c" strokeWidth="3" />
        <path d="M515 396 L600 346 L685 396" fill="none" stroke="#d6b98c" strokeWidth="3" />
        <circle cx="600" cy="345" r="10" fill="#f8ead4" />
        <path d="M600 335 v-14" stroke="#b08d3c" strokeWidth="3" />
      </g>

      {/* main shikhara over the sanctum, set behind the mandapa */}
      <g>
        <path d="M520 455 C520 360 548 250 600 150 C652 250 680 360 680 455Z" fill="url(#stone)" />
        {/* vertical ribs (latina rekha) */}
        <path d="M600 150 C590 260 588 360 590 455" fill="none" stroke="#dcc19a" strokeWidth="3" />
        <path d="M600 150 C610 260 612 360 610 455" fill="none" stroke="#dcc19a" strokeWidth="3" />
        <path d="M560 455 C560 370 575 270 600 165" fill="none" stroke="#e2c9a4" strokeWidth="2" />
        <path d="M640 455 C640 370 625 270 600 165" fill="none" stroke="#e2c9a4" strokeWidth="2" />
        {/* horizontal bhumi bands */}
        {[200, 240, 280, 320, 360, 400, 440].map((y, i) => {
          const half = 18 + i * 11.5
          return <line key={y} x1={600 - half} y1={y} x2={600 + half} y2={y} stroke="#d9bd94" strokeWidth="2" />
        })}
        {/* urushringas: smaller attached spires */}
        <path d="M498 455 C498 400 512 350 538 305 C556 350 566 400 566 455Z" fill="#f1dfc2" />
        <path d="M634 455 C634 400 644 350 662 305 C688 350 702 400 702 455Z" fill="#f1dfc2" />
        {/* amalaka, kalasha and dhvaja */}
        <ellipse cx="600" cy="146" rx="26" ry="9" fill="#f3e2c5" stroke="#d6b98c" strokeWidth="2" />
        <path d="M588 137 Q600 112 612 137Z" fill="#b08d3c" />
        <circle cx="600" cy="114" r="5" fill="#d9b86a" />
        <line x1="600" y1="110" x2="600" y2="62" stroke="#8a6c28" strokeWidth="2.5" />
        <path d="M600 64 L642 76 L600 90Z" fill="#ff4c00" />
      </g>

      {/* entrance torana */}
      <g>
        <rect x="571" y="520" width="58" height="90" fill="#6b2f12" />
        <path d="M571 522 a29 29 0 0 1 58 0" fill="#6b2f12" />
        <path d="M578 610 V530 a22 22 0 0 1 44 0 V610Z" fill="#ffd9a0" />
      </g>

      {/* diyas along the plinth */}
      <g>
        {Array.from({ length: 13 }).map((_, i) => {
          const x = 250 + i * 58
          return (
            <g key={i}>
              <ellipse cx={x} cy="606" rx="7" ry="3" fill="#8f2b00" />
              <path d={`M${x} 594 q4 6 0 10 q-4 -4 0 -10Z`} fill="#ffcf5a" />
            </g>
          )
        })}
      </g>

      {/* ground */}
      <rect x="0" y="666" width="1200" height="94" fill="url(#ground)" />
      <path d="M0 666 H1200" stroke="#5e2a12" strokeWidth="2" opacity="0.6" />
    </svg>
  )
}

/** Plan view of the named spaces (FR-04): sanctum, hall, kitchen, classrooms. Indicative only. */
export function ConceptPlan({ spaces }: { spaces: { name: string; description?: string | null }[] }) {
  const labels = {
    sanctum: spaces[0]?.name ?? 'Sanctum (garbhagriha)',
    hall: spaces[1]?.name ?? 'Prayer and community hall',
    kitchen: spaces[2]?.name ?? 'Kitchen and dining',
    classrooms: spaces[3]?.name ?? 'Classrooms',
    extra: spaces[4]?.name ?? 'Entrance, shoes and welcome',
  }
  return (
    <svg viewBox="0 0 640 420" role="img" aria-labelledby="plan-title plan-desc" className="h-auto w-full">
      <title id="plan-title">Indicative plan of spaces in the new Mandir</title>
      <desc id="plan-desc">{`Sanctum at the head of the main axis, ${labels.hall} in front, ${labels.kitchen} on one side, ${labels.classrooms} on the other, entrance at the front. Not to scale.`}</desc>
      <rect x="10" y="10" width="620" height="400" rx="18" fill="#fffdf9" stroke="#d8c6ae" strokeWidth="2" strokeDasharray="6 6" />
      <text x="28" y="40" fontSize="13" fill="#5e544c" fontFamily="var(--font-inter), sans-serif">
        Site boundary (indicative)
      </text>
      {/* axis */}
      <line x1="320" y1="60" x2="320" y2="390" stroke="#d9b86a" strokeWidth="1.5" strokeDasharray="4 6" />
      {/* sanctum */}
      <rect x="265" y="60" width="110" height="90" rx="8" fill="#ffe4d1" stroke="#b83700" strokeWidth="2" />
      <circle cx="320" cy="105" r="16" fill="none" stroke="#b83700" strokeWidth="2" />
      {/* hall */}
      <rect x="200" y="160" width="240" height="140" rx="10" fill="#fbf6ee" stroke="#8a7e74" strokeWidth="2" />
      {/* kitchen */}
      <rect x="60" y="160" width="125" height="140" rx="10" fill="#f3ebe4" stroke="#8a7e74" strokeWidth="2" />
      {/* classrooms */}
      <rect x="455" y="160" width="125" height="140" rx="10" fill="#f3ebe4" stroke="#8a7e74" strokeWidth="2" />
      {/* entrance */}
      <rect x="240" y="315" width="160" height="60" rx="10" fill="#fff4ec" stroke="#b08d3c" strokeWidth="2" />
      <g fontFamily="var(--font-inter), sans-serif" fontSize="14" fill="#1f1b18" textAnchor="middle" fontWeight="600">
        <text x="320" y="142">{labels.sanctum.split(' (')[0]}</text>
        <text x="320" y="235">{labels.hall}</text>
        <text x="122" y="235">{labels.kitchen.split(' and')[0]}</text>
        <text x="517" y="235">{labels.classrooms}</text>
        <text x="320" y="350">{labels.extra.split(',')[0]}</text>
      </g>
      <text x="600" y="400" fontSize="12" fill="#5e544c" textAnchor="end" fontFamily="var(--font-inter), sans-serif">
        Not to scale · not final design
      </text>
    </svg>
  )
}
