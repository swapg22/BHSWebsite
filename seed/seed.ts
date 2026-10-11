/**
 * Seeds a fresh database with the migrated site content, the service catalogue, the 2026
 * festival dates and test accounts. Run with:  npm run seed
 *
 * Test account emails and passwords are read from .env (SEED_* variables), never hard-coded.
 * Safe to re-run: it refuses to seed a database that already has staff users unless --force.
 */
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload, type Payload } from 'payload'
import config from '../src/payload.config'
import { lexical } from './lexical'
import { ACTIVITIES, CEREMONIES, FESTIVALS_2026, PAGES } from './content'
import { ukDateTime } from '../src/lib/booking'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const asset = (f: string) => path.resolve(dirname, 'assets', f)
const ctx = { skipAudit: true, skipRevalidate: true, skipInvite: true, skipBookingHooks: true }

const mediaCache = new Map<string, number>()
async function media(payload: Payload, file: string, alt: string, extra: Record<string, unknown> = {}): Promise<number> {
  if (mediaCache.has(file)) return mediaCache.get(file)!
  const doc = await payload.create({ collection: 'media', data: { alt, ...extra }, filePath: asset(file), overrideAccess: true, context: ctx })
  mediaCache.set(file, doc.id)
  return doc.id
}

const ALT: Record<string, string> = {
  'bhajan-youth.jpg': 'Young devotees in white singing bhajans at microphones in the Mandir',
  'bhajan-children.jpg': 'Children singing at a microphone with families seated behind them in the Mandir',
  'bhajan-sabha.jpg': 'Devotees gathered for bhajans in the Mandir',
  'ram-darbar.jpg': 'The murtis of Shree Ram, Sita and Lakshman in the Mandir, dressed in yellow and red',
  'arrival-1972.jpg': 'Black and white photograph of Ugandan Asian families arriving by plane in 1972',
  'bollywood-dance.jpg': 'A Bollywood dance class in the main hall',
  'table-tennis.jpg': 'Seniors playing table tennis in the hall',
  'badminton.jpg': 'Badminton in the sports hall',
  'cricket.jpg': 'Members playing cricket in summer',
  'beach-trip.jpg': 'Members on the annual beach trip',
  'picnic.jpg': 'Families at the September picnic',
  'lunch-club.jpg': 'Seniors enjoying a festive meal at the lunch club',
  'shakha.jpg': 'Children and parents playing Shakha family games in the hall',
  'kids-theatre.jpg': 'Children performing in the kids theatre',
  'dementia-support.jpg': 'A dementia awareness and support session',
  'food-bank.jpg': 'Donations prepared for Peterborough Foodbank',
  'soup-kitchen.jpg': 'Food donations for Soup Kitchen Peterborough',
  'nhs-meals.jpg': 'Hot vegetarian meals packed by volunteers for NHS staff',
  'nhs-deliveries.jpg': 'Volunteers delivering food to NHS teams',
  'community-support.jpg': 'Volunteers sorting groceries and supplies for the community',
  'committee-2025.jpg': 'The Bharat Hindu Samaj executive committee, committee members and trustees',
  'janmashtami-2026.jpg': 'Poster for Krishna Janmashtami celebrations on Friday 4 September 2026',
  'activities-timetable.jpg': 'Be Active at BHS weekly activities timetable',
  'price-list.jpg': 'Bharat Hindu Samaj ceremony price list',
  'gofundme-qr.jpg': 'QR code for the Bharat Hindu Samaj Legal Fund on GoFundMe',
  'aarti-thali.jpg': 'An aarti thali with lit diyas on marigold petals',
}

async function main() {
  const payload = await getPayload({ config })
  const force = process.argv.includes('--force')
  const existing = await payload.count({ collection: 'users', overrideAccess: true })
  if (existing.totalDocs > 0 && !force) {
    payload.logger.info('Database already seeded. Use "npm run seed -- --force" after deleting data/bhs.db to reseed.')
    process.exit(0)
  }

  const env = (k: string) => {
    const v = process.env[k]
    if (!v) throw new Error(`${k} is missing from .env — run "npm run setup" first`)
    return v
  }

  payload.logger.info('Seeding staff accounts…')
  const staff = [
    { email: env('SEED_ADMIN_EMAIL'), password: env('SEED_ADMIN_PASSWORD'), name: 'Site Administrator', roles: ['administrator'] },
    { email: env('SEED_EDITOR_EMAIL'), password: env('SEED_EDITOR_PASSWORD'), name: 'Test Editor', roles: ['editor'] },
    { email: env('SEED_TREASURER_EMAIL'), password: env('SEED_TREASURER_PASSWORD'), name: 'Test Treasurer', roles: ['treasurer'] },
  ] as const
  for (const s of staff) {
    await payload.create({ collection: 'users', data: { ...s, roles: [...s.roles] }, overrideAccess: true, context: ctx })
  }

  payload.logger.info('Uploading photos and documents…')
  for (const [file, alt] of Object.entries(ALT)) {
    await media(payload, file, alt, file === 'ram-darbar.jpg' ? { deityImage: true } : {})
  }
  const courtPdf = await media(payload, 'court-report-july-2026.pdf', 'High Court case report, July 2026 (PDF)')
  const festivalPdf = await media(payload, 'bhs-festival-calendar-2026.pdf', 'BHS festival calendar 2026 (PDF)')
  const m = (f: string) => mediaCache.get(f)!

  payload.logger.info('Site settings and globals…')
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      _status: 'published',
      standardTimes: { weekdays: '9am–12pm & 6–8pm', weekends: '9am–1pm & 5–8pm', aarti: '9.45am & 6.45pm' },
      seasonalOverrides: [{ label: 'Navratri', startDate: '2026-10-11', endDate: '2026-10-19', weekdays: '9am–12pm & 6–10.30pm', weekends: '9am–1pm & 5–10.30pm', note: 'Garba every evening' }],
      address: 'Unit 6, New England Complex\nRock Road, Peterborough PE1 3BU',
      phone: '01733 315241',
      email: 'secretary@bharathindusamaj.co.uk',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Bharat+Hindu+Samaj+Rock+Road+Peterborough+PE1+3BU',
      parking: 'Free parking on site. At busy festivals please car-share and follow the stewards.',
      charityNumber: '274404',
      registeredAddress: 'Unit 6, New England Complex, Rock Road, Peterborough PE1 3BU',
      facebookUrl: 'https://www.facebook.com/bharathindusamaj',
      instagramUrl: 'https://www.instagram.com/bhspbo',
      announcement: 'Navratri 11–19 October: garba every evening at the Mandir',
      announcementLink: '/events',
    },
    overrideAccess: true,
    context: ctx,
  })

  await payload.updateGlobal({
    slug: 'home-page',
    data: {
      _status: 'published',
      heroImage: m('bhajan-youth.jpg'),
      heritageLine: 'Serving Peterborough since 1973 · Shree Ram Mandir since 1995',
      stats: [
        { value: '1973', label: 'Year the Samaj was founded' },
        { value: '~1,000', label: 'Members across East Anglia' },
        { value: '15+', label: 'Weekly classes and activities' },
        { value: '2', label: 'Aartis every day of the year' },
      ],
      activityCards: [
        { title: 'Worship', text: 'Daily aarti and festivals', image: m('bhajan-sabha.jpg'), href: '/daily-rituals' },
        { title: 'Youth', text: 'Bhajans, dance and Shakha', image: m('bhajan-children.jpg'), href: '/activities' },
        { title: 'Seniors', text: 'Table tennis and support groups', image: m('table-tennis.jpg'), href: '/activities' },
        { title: 'Classes', text: 'Gujarati, Hindi, yoga and more', image: m('bollywood-dance.jpg'), href: '/activities' },
        { title: 'Lunch club', text: 'Monday and Tuesday meals', image: m('lunch-club.jpg'), href: '/services#meal' },
      ],
      voices: [],
    },
    overrideAccess: true,
    context: ctx,
  })

  await payload.updateGlobal({
    slug: 'appeal',
    data: {
      _status: 'published',
      targetPence: 120000000,
      raisedOfflinePence: 0,
      stageLabel: 'Vision stage',
      milestones: [
        { title: 'Bharat Hindu Samaj founded', date: '1973', status: 'done', description: 'Thirty families come together in Peterborough.' },
        { title: 'Our community centre opens', date: '1986', status: 'done', description: 'Unit 4 of the former St Paul’s School becomes our home.' },
        { title: 'Murti Pran Pratishtha', date: '1995', status: 'done', description: 'Shree Ram Mandir opens on 12–13 August 1995.' },
        { title: 'New Mandir vision and appeal launched', date: '2026', status: 'current', description: 'Same name, same site, a £1.2M target.' },
        { title: 'Concept design with a temple architect', date: 'Next', status: 'upcoming', description: 'Trustees appoint an architect or sthapati to develop the design.' },
        { title: 'Build budget and timeline agreed', date: 'To be announced', status: 'upcoming' },
      ],
      trusteesWords:
        'For more than fifty years our Mandir has been where Peterborough’s Hindu families pray, celebrate and look after one another. We are planning a new Mandir on the same site, keeping the name Bharat Hindu Samaj, so that our children and grandchildren inherit a permanent, purpose-built home for worship, learning and seva.',
      trusteesAttribution: 'Bharat Hindu Samaj',
      courtNotice: {
        show: true,
        heading: 'High Court case update after final day hearing',
        subheading: 'Bharat Hindu Samaj v Peterborough City Council and UKIM',
        body: 'Peterborough City Council and IP’s inconsistent evidence under fire after five days of shifting explanations. High Court hears claims that Cabinet was kept in the dark, the Hindu community was not consulted, and opportunistic arguments that did not reflect formal bid evidence were made to justify an unlawful decision.',
        pdf: courtPdf,
        pdfLabel: 'Download PDF',
      },
      visionIntro:
        'No architect’s drawings exist yet. These early concept visuals show the spirit of what we hope to build: a traditional shikhara over the sanctum, a hall for festivals, a kitchen for seva and classrooms for the next generation.',
      spaces: [
        { name: 'Sanctum (garbhagriha)', description: 'The heart of the Mandir, beneath the shikhara.' },
        { name: 'Prayer and community hall', description: 'For aarti, festivals, weddings and gatherings.' },
        { name: 'Kitchen and dining', description: 'For prasad, lunch club and community meals.' },
        { name: 'Classrooms', description: 'For language classes, youth groups and learning.' },
        { name: 'Entrance, shoes and welcome', description: 'A dignified, accessible arrival for everyone.' },
      ],
      gofundme: {
        show: true,
        heading: 'Help Our Cause',
        body: 'Please help save our Temple with your generous donations for us to be able to raise funds to fight Peterborough Council’s decision to sell our Temple And community centre.\n\nTo support this, we have now set up a public donation page to raise funds to continue the legal fight:',
        url: 'https://gofund.me/d1329e2a4',
        qrImage: m('gofundme-qr.jpg'),
      },
    },
    overrideAccess: true,
    context: ctx,
  })

  await payload.updateGlobal({
    slug: 'governance',
    data: {
      _status: 'published',
      trustees: [
        { name: 'Rasila Panchal', role: 'Trustee' },
        { name: 'Swapnil Gadkari', role: 'Trustee' },
      ],
      committee: [
        { name: 'Kishor Ladwa', role: 'President' },
        { name: 'Ekta Patel', role: 'Vice President' },
        { name: 'Kanika Mehta', role: 'Secretary' },
        { name: 'Naga Puppala', role: 'Treasurer' },
        { name: 'Dipesh Rathod', role: 'Committee member' },
        { name: 'Harish Patel', role: 'Committee member' },
        { name: 'Naveen Tirchunapalli', role: 'Committee member' },
        { name: 'Neel Desai', role: 'Committee member' },
        { name: 'Praveen Penta', role: 'Committee member' },
        { name: 'Raja Alagappan', role: 'Committee member' },
        { name: 'Sai Ghamandi', role: 'Committee member' },
        { name: 'Shilpa Pathak', role: 'Committee member' },
        { name: 'Siva Uttarkar', role: 'Committee member' },
      ],
      committeePhoto: m('committee-2025.jpg'),
      fundsStatement:
        'Gifts to the New Mandir appeal are recorded in a designated fund, separate from day-to-day running costs, and reported in our annual accounts, which are independently examined and filed with the Charity Commission.',
      accounts: [{ year: 'Latest accounts', url: 'https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/274404' }],
      festivalCalendarPdf: festivalPdf,
    },
    overrideAccess: true,
    context: ctx,
  })

  payload.logger.info('Pages…')
  for (const p of PAGES) {
    await payload.create({
      collection: 'pages',
      data: {
        _status: 'published',
        title: p.title,
        slug: p.slug,
        eyebrow: p.eyebrow,
        intro: p.intro,
        heroImage: p.hero ? m(p.hero) : undefined,
        sections: p.sections.map((s) => {
          if (s.blockType === 'text') return { blockType: 'text', heading: s.heading, body: lexical(s.body) }
          if (s.blockType === 'imageText') return { blockType: 'imageText', heading: s.heading, body: lexical(s.body), image: m(s.image), imageSide: s.imageSide ?? 'right' }
          return s
        }) as never,
      },
      overrideAccess: true,
      context: ctx,
    })
  }

  payload.logger.info('Service catalogue…')
  let order = 10
  for (const c of CEREMONIES) {
    await payload.create({
      collection: 'services',
      data: {
        _status: 'published',
        name: c.name,
        category: 'pooja',
        availability: 'active',
        memberPrice: c.member,
        nonMemberPrice: c.nonMember,
        materialsPrice: c.materials ?? undefined,
        requiresApproval: true,
        defaultDurationMinutes: c.duration,
        availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        earliestTime: '08:00',
        latestTime: '21:00',
        location: 'either',
        writesToCalendar: true,
        cancellation: { fullRefundHours: 72, lateRefundPercent: 50, depositRefundable: true },
        notes:
          'Member prices apply if at least one person in your household is a member. Travel expenses of 50p per mile apply for homes or venues more than 5 miles from PE1 3BU. The optional pooja materials include everything except fresh items (milk, fruit, flowers, panchamrut, paan and prasad items).',
        sortOrder: order++,
      },
      overrideAccess: true,
      context: ctx,
    })
  }
  const halls = [
    { name: 'Main hall hire', location: 'main-hall', summary: 'For religious and family functions, with seating and a stage. Legal licensed marriages can be held here.', deposit: 10000 },
    { name: 'Sports hall hire', location: 'sports-hall', summary: 'Badminton court and net, and a table tennis table, for private sessions and events.', deposit: 0 },
    { name: 'Kitchen hire', location: 'kitchen', summary: 'Our vegetarian kitchen, for use with a hall booking or for community cooking.', deposit: 5000 },
  ] as const
  for (const h of halls) {
    await payload.create({
      collection: 'services',
      data: {
        _status: 'published',
        name: h.name,
        category: 'hall',
        summary: h.summary,
        availability: 'active',
        memberPrice: 0,
        nonMemberPrice: 0,
        priceOnRequest: true,
        priceUnit: 'per hour',
        deposit: h.deposit,
        requiresApproval: true,
        requiresPolicyAgreement: true,
        defaultDurationMinutes: 240,
        availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        earliestTime: '09:00',
        latestTime: '22:00',
        location: h.location,
        writesToCalendar: true,
        cancellation: { fullRefundHours: 14 * 24, lateRefundPercent: 0, depositRefundable: false, policyText: 'Free cancellation up to 14 days before. The deposit is non-refundable after that.' },
        notes: 'The office will confirm the price and availability when approving your request. The premises are vegetarian and alcohol-free.',
        sortOrder: order++,
      },
      overrideAccess: true,
      context: ctx,
    })
  }
  for (const a of ACTIVITIES) {
    await payload.create({
      collection: 'services',
      data: {
        _status: 'published',
        name: a.name,
        category: (a as { category?: 'meal' }).category ?? 'class',
        summary: [(a as { note?: string }).note, (a as { membersOnly?: boolean }).membersOnly ? 'Free for BHS members.' : null, 'A voluntary contribution of £1 per session helps keep activities running.'].filter(Boolean).join(' '),
        availability: 'active',
        memberPrice: a.member,
        nonMemberPrice: a.guest,
        priceUnit: (a as { unit?: 'per class' }).unit ?? 'per class',
        requiresApproval: false,
        capacity: 40,
        availableDays: a.days as never,
        earliestTime: a.start,
        latestTime: a.end,
        defaultDurationMinutes: (Number(a.end.slice(0, 2)) * 60 + Number(a.end.slice(3))) - (Number(a.start.slice(0, 2)) * 60 + Number(a.start.slice(3))),
        location: a.name.startsWith('Badminton') ? 'sports-hall' : 'mandir',
        writesToCalendar: false,
        cancellation: { fullRefundHours: 24, lateRefundPercent: 0, depositRefundable: true },
        sortOrder: order++,
      },
      overrideAccess: true,
      context: ctx,
    })
  }

  payload.logger.info('Sponsorship catalogue (amounts are placeholders for the trustees to confirm)…')
  const sponsorships = [
    { name: 'Brick', type: 'brick', amount: 5100, description: 'Your name or a dedication on the donor wall of bricks.', totalAvailable: null },
    { name: 'Day of seva', type: 'day', amount: 25100, description: 'Sponsor the daily aarti and bhog for a day of your choice.', totalAvailable: 365 },
    { name: 'Pillar', type: 'pillar', amount: 500100, description: 'One of the carved pillars of the prayer hall, with a plaque.', totalAvailable: 24 },
    { name: 'Classroom', type: 'room', amount: 2500100, description: 'Name a classroom for the next generation of learners.', totalAvailable: 4 },
  ] as const
  for (const [i, s] of sponsorships.entries()) {
    await payload.create({ collection: 'sponsorship-items', data: { ...s, totalAvailable: s.totalAvailable ?? undefined, sortOrder: i, plaque: true, active: true }, overrideAccess: true, context: ctx })
  }

  payload.logger.info('Events from the 2026 festival calendar…')
  const now = Date.now()
  for (const f of FESTIVALS_2026) {
    const startsAt = ukDateTime(f.date, f.start ?? '10:00')
    const endsAt = ukDateTime(f.date, f.end ?? '12:00')
    if (endsAt.getTime() < now) continue
    const isDiwali = f.title.startsWith('Diwali')
    await payload.create({
      collection: 'events',
      data: {
        _status: 'published',
        title: f.title,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        category: f.category ?? 'festival',
        summary: isDiwali
          ? 'The festival of lights at the Mandir: Lakshmi Pooja, aarti, bhajans and prasad for all the family. Reserve free places so we can plan seating and prasad.'
          : f.title.startsWith('Navratri')
            ? 'Nine nights of garba and dandiya raas in honour of the Divine Mother. Everyone welcome.'
            : `${f.title} at the Mandir, with pooja, aarti and prasad. Everyone is welcome.`,
        featured: isDiwali || f.title.startsWith('Navratri') || f.title.startsWith('Annakoot'),
        image: isDiwali ? m('aarti-thali.jpg') : f.title.startsWith('Navratri') ? m('bhajan-youth.jpg') : undefined,
        bookable: isDiwali,
        memberPrice: 0,
        guestPrice: 0,
        capacity: isDiwali ? 300 : undefined,
        waitlist: true,
        cancellationHours: 24,
        showOnCalendar: true,
      },
      overrideAccess: true,
      context: ctx,
    })
  }
  // Recurring daily aarti and weekly activities appear in the calendar feed (FR-12)
  const today = new Date().toISOString().slice(0, 10)
  for (const [title, time, end] of [
    ['Morning aarti', '09:45', '10:15'],
    ['Evening aarti', '18:45', '19:15'],
  ] as const) {
    await payload.create({
      collection: 'events',
      data: { _status: 'published', title, startsAt: ukDateTime(today, time).toISOString(), endsAt: ukDateTime(today, end).toISOString(), recurrence: 'FREQ=DAILY', category: 'worship', summary: 'Daily aarti at the Mandir. Everyone is welcome.', showOnCalendar: true },
      overrideAccess: true,
      context: ctx,
    })
  }

  payload.logger.info('Albums and news…')
  await payload.create({
    collection: 'albums',
    data: {
      _status: 'published',
      title: 'Community activities',
      date: '2026-09-01',
      description: 'Sport, dance, trips and classes at Bharat Hindu Samaj.',
      cover: m('bollywood-dance.jpg'),
      photos: ['bollywood-dance.jpg', 'table-tennis.jpg', 'badminton.jpg', 'cricket.jpg', 'beach-trip.jpg', 'picnic.jpg', 'shakha.jpg', 'kids-theatre.jpg'].map((f) => ({ image: m(f), caption: ALT[f] })),
    },
    overrideAccess: true,
    context: ctx,
  })
  await payload.create({
    collection: 'albums',
    data: {
      _status: 'published',
      title: 'Bhajans and worship',
      date: '2026-08-15',
      description: 'Devotional singing and worship at the Mandir.',
      cover: m('bhajan-youth.jpg'),
      photos: ['bhajan-youth.jpg', 'bhajan-children.jpg', 'bhajan-sabha.jpg', 'aarti-thali.jpg'].map((f) => ({ image: m(f), caption: ALT[f] })),
    },
    overrideAccess: true,
    context: ctx,
  })
  await payload.create({
    collection: 'albums',
    data: {
      _status: 'published',
      title: 'Seva in the community',
      date: '2021-03-01',
      description: 'Our volunteers supporting the NHS, Peterborough Foodbank and Soup Kitchen.',
      cover: m('nhs-meals.jpg'),
      photos: ['nhs-meals.jpg', 'nhs-deliveries.jpg', 'food-bank.jpg', 'soup-kitchen.jpg', 'community-support.jpg', 'lunch-club.jpg', 'dementia-support.jpg'].map((f) => ({ image: m(f), caption: ALT[f] })),
    },
    overrideAccess: true,
    context: ctx,
  })
  await payload.create({
    collection: 'news',
    data: {
      _status: 'published',
      title: 'Our new website',
      category: 'news',
      publishedAt: new Date().toISOString(),
      cover: m('bhajan-children.jpg'),
      excerpt: 'Join, renew, book and give online — and follow the story of our new Mandir.',
      body: lexical(
        'Welcome to the new Bharat Hindu Samaj website. You can now **become a member or renew online**, book poojas and the hall, reserve places at festivals, add events to your calendar, and give to the new Mandir with Gift Aid.\n\nIf you have any feedback, please let us know through the contact page.',
      ),
    },
    overrideAccess: true,
    context: ctx,
  })

  payload.logger.info('Volunteer shifts and a test member…')
  const diwali = await payload.find({ collection: 'events', where: { title: { like: 'Diwali' } }, limit: 1, overrideAccess: true })
  if (diwali.docs[0]) {
    const d = diwali.docs[0]
    await payload.create({ collection: 'volunteer-shifts', data: { title: 'Diwali: car park stewards', event: d.id, startsAt: d.startsAt, endsAt: d.endsAt, slots: 6, description: 'Welcome guests and guide parking.' }, overrideAccess: true, context: ctx })
    await payload.create({ collection: 'volunteer-shifts', data: { title: 'Diwali: prasad serving', event: d.id, startsAt: d.startsAt, endsAt: d.endsAt, slots: 10, description: 'Serve prasad after the aarti.' }, overrideAccess: true, context: ctx })
  }
  const expiry = new Date()
  expiry.setUTCFullYear(expiry.getUTCFullYear() + 1)
  await payload.create({
    collection: 'members',
    data: {
      email: env('SEED_MEMBER_EMAIL'),
      password: env('SEED_MEMBER_PASSWORD'),
      firstName: 'Test',
      lastName: 'Member',
      membershipNumber: 'BHS10001',
      status: 'active',
      memberSince: '2020-04-01',
      lastPaidDate: new Date().toISOString(),
      expiryDate: expiry.toISOString(),
      addressLine1: '1 Example Road',
      town: 'Peterborough',
      postcode: 'PE1 1AA',
      over18Confirmed: true,
      consents: { newsletter: true, sms: false },
    },
    overrideAccess: true,
    context: ctx,
  })

  payload.logger.info('Seed complete.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
