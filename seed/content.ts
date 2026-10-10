/**
 * Seed content migrated from bharathindusamaj.co.uk (read 9–10 October 2026) and copy-edited,
 * per spec section 14. Facts are kept as published; spelling and grammar are corrected.
 * Festival and policy texts are written in the temple's own voice and must be reviewed by the
 * committee before launch.
 */

export interface SeedPage {
  slug: string
  title: string
  eyebrow?: string
  intro?: string
  hero?: string // seed asset filename
  sections: (
    | { blockType: 'text'; heading?: string; body: string }
    | { blockType: 'imageText'; heading?: string; body: string; image: string; imageSide?: 'left' | 'right' }
    | { blockType: 'faq'; heading?: string; items: { question: string; answer: string }[] }
    | { blockType: 'mantra'; heading: string; original?: string; transliteration?: string; meaning?: string }
    | { blockType: 'callToAction'; heading: string; text?: string; label: string; href: string }
  )[]
}

export const PAGES: SeedPage[] = [
  {
    slug: 'about',
    title: 'Our story',
    eyebrow: 'About us · 1972 to today',
    intro: 'From thirty families arriving in Peterborough in 1972 to a Mandir and community centre serving around a thousand members today.',
    hero: 'arrival-1972.jpg',
    sections: [
      {
        blockType: 'imageText',
        heading: 'The beginning',
        image: 'arrival-1972.jpg',
        imageSide: 'right',
        body: `Before 1972, probably fewer than ten Hindu families lived in Peterborough. Late that year, President Idi Amin of Uganda ordered all Asians holding British passports to leave the country within 90 days.

Peterborough City Council was the first local authority in the county to welcome these families, around 30 of them. A special team of officers helped them settle, with council housing and support finding work. Most were Hindus, arriving from resettlement camps across the region.

A small group of members introduced the families to one another, and a party was held at the Town Hall to thank the Council and its officers. Everyone present agreed to form a Hindu association.`,
      },
      {
        blockType: 'text',
        heading: 'Founding Bharat Hindu Samaj',
        body: `With plenty of work in the city, many more families arrived in early 1973, mainly from Uganda and also from Kenya, Tanzania and India. **Bharat Hindu Samaj, Peterborough** was established as a Hindu association in the middle of 1973, with a committee to run it. The first festival it organised was Navratri in 1973, in a hall hired on St John Street.

A constitution was drafted and adopted at a public meeting on **15 November 1974** at the Assembly Hall of Lindens County Junior School, Craig Street. Under that constitution, the Samaj serves the social, cultural and religious needs of Hindus in the city.

Families found work with employers such as Baker Perkins, Peter Brotherhood, Hotpoint, Freemans and Thomas Cook, and many started successful businesses of their own. The Samaj grew from 30 families to around 350, spread across East Anglia.`,
      },
      {
        blockType: 'text',
        heading: 'A home of our own',
        body: `For years, festivals were held in hired community centres and school halls. Around 1983–84, committee members and trustees made the case to the City Council and Cambridgeshire County Council for a permanent building. With the support of the local Member of Parliament, Unit 4 of the former St Paul's School became available.

The building was derelict and needed major work. The Samaj applied for an Urban Aid grant from the Department of the Environment and in 1984 received around **£80,000** through the City Council — at the time the largest grant any association in East Anglia had received. Building work began in late 1984, and the Samaj took possession of the completed building in June 1986, under a lease from the Council starting on **1 July 1986**.

Recognising the Samaj's service to the wider community, the Council offered it official Community Centre status. A new constitution and lease were adopted in 1993.`,
      },
      {
        blockType: 'imageText',
        heading: 'Shree Ram Mandir',
        image: 'ram-darbar.jpg',
        imageSide: 'left',
        body: `From 1986, a two-classroom space in the centre was used as the Mandir, where families prayed before pictures of their deities on a hand-carved stage. Members of our own community — with expertise in building, art, architecture and engineering — then designed a purpose-built shrine.

The marble murtis, sculpted in India, were generously donated by Shree Ram Bapa of Jignashu Satsang Mandal, London. The Murti Pran Pratishtha Mahotsav was held over the weekend of **12 and 13 August 1995**, led by Param Pujya Shree Swami Satyamitrananda Giriji Maharaj, with dignitaries and representatives of temples from across the country. From that weekend, the Shree Ram Mandir of Bharat Hindu Samaj was open.`,
      },
      {
        blockType: 'text',
        heading: 'Today',
        body: `Every year since 1974, the trustees and executive committee have had the accounts audited and held elections at the Annual General Meeting. In times of need — emergencies and natural disasters — the Samaj has given generously to charities in the UK and abroad, including India.

In recent years Tamil, Telugu, Punjabi, Nepali, Bengali and other Hindu communities have joined us as members. We welcome visits from local schools and organisations, and we take pride in being run almost entirely by volunteers: our only employee is our pujari (priest).

We hold two aartis every day, celebrate the main festivals of the Hindu calendar, and help members with private religious and family occasions. Our finances depend mostly on members' donations.`,
      },
      { blockType: 'callToAction', heading: 'Write the next chapter with us', text: 'Our new Mandir will serve the community for the next fifty years.', label: 'Discover the new Mandir', href: '/new-mandir' },
    ],
  },
  {
    slug: 'daily-rituals',
    title: 'Daily rituals',
    eyebrow: 'Worship at the Mandir',
    intro: 'Aarti is offered twice every day, and maha prasad is offered to the deities each day. Everyone is welcome to join.',
    hero: 'aarti-thali.jpg',
    sections: [
      {
        blockType: 'text',
        heading: 'The daily routine',
        body: `### Aarti — twice every day
Morning aarti at **9.45am** and evening aarti at **6.45pm**.

### Maha prasad (bhog)
Every day a special thaal is prepared and offered to all the deities, usually around 11.30am.

### Vagha (the deities' clothes)
The deities' clothes are changed regularly. Volunteers wash and iron the clothes, and the pujari dresses the murtis.`,
      },
      {
        blockType: 'faq',
        heading: 'Understanding our rituals',
        items: [
          {
            question: 'What is aarti?',
            answer:
              'Aarti (also written arti, arati or arathi) is part of puja, in which light from wicks soaked in ghee, or from camphor, is offered to the deities while a special prayer is sung. The lamp is moved in a clockwise circle, representing the whole universe. Afterwards devotees pass their hands over the flame and touch their eyes, receiving its warmth and blessing. Prasad — fruit, sweets and other offerings made to God — is then shared.',
          },
          {
            question: 'Why do we offer flowers?',
            answer:
              'Offering flowers is an important part of Hindu worship; different deities are associated with particular flowers. The offering is a prayer for good health and prosperity, and a symbol of surrendering our desires. Flowers are picked up gently with the five fingers of the right hand, which are then turned upwards as the flowers are placed at the Lord’s feet — turning the five senses away from material attachment and towards the divine.',
          },
          {
            question: 'Why do we offer a coconut?',
            answer:
              'The coconut represents the ego. Breaking a coconut symbolises overcoming the ego and surrendering to God. Its outer husk stands for the physical body, the fibre for our desires and entanglements, the hard shell for the causal body, and the white kernel for the Supreme. Other fruits and vegetarian foods are offered as gifts in gratitude.',
          },
        ],
      },
      {
        blockType: 'mantra',
        heading: 'Gayatri Mantra',
        original: 'ॐ भूर्भुवः स्वः । तत्सवितुर्वरेण्यं । भर्गो देवस्य धीमहि । धियो यो नः प्रचोदयात् ॥',
        transliteration: 'Om Bhur Bhuvah Svah, Tat Savitur Varenyam, Bhargo Devasya Dhimahi, Dhiyo Yo Nah Prachodayat',
        meaning:
          'Om: the primeval sound. Bhur: the physical world. Bhuvah: the mental world. Svah: the celestial, spiritual world. Tat: that, God. Savitur: the Sun, creator and preserver. Varenyam: most adorable. Bhargo: radiance. Devasya: of the supreme Lord. Dhimahi: we meditate upon. Dhiyo: the intellect. Yo: who. Nah: our. Prachodayat: may He enlighten and inspire.',
      },
      {
        blockType: 'mantra',
        heading: 'Om Jai Jagdish Hare',
        original: 'ॐ जय जगदीश हरे, स्वामी जय जगदीश हरे । भक्त जनों के संकट, क्षण में दूर करे ॥',
        transliteration:
          'Om Jai Jagdish Hare, Swami Jai Jagdish Hare, Bhakta jano ke sankat, kshan mein door kare. Jo dhyave phal pave, dukh vinashe man ka. Sukh sampati ghar aave, kasht mite tan ka. Mat pita tum mere, sharan gahun main kiski. Tum bin aur na dooja, aas karun main jiski.',
        meaning:
          'Glory to the Lord of the universe, who in a moment removes the troubles of His devotees. Whoever prays receives the fruit, and the sorrows of the mind are destroyed; happiness and prosperity come home and the body’s pain is eased. You are my mother and father — in whom else shall I seek shelter? Without You there is no other in whom I can place my hope.',
      },
    ],
  },
  {
    slug: 'festivals',
    title: 'Hindu festivals',
    eyebrow: 'Celebrating through the year',
    intro: 'Festivals bring our whole community together at the Mandir. Here are some of the main celebrations and what they mean to us.',
    sections: [
      {
        blockType: 'faq',
        heading: 'Main festivals at Bharat Hindu Samaj',
        items: [
          { question: 'Navratri', answer: 'Nine nights honouring the Divine Mother in her forms as Durga, Lakshmi and Saraswati. Our hall fills with garba and dandiya raas each evening — our very first festival as a Samaj, in 1973, was Navratri.' },
          { question: 'Diwali and the Hindu New Year', answer: 'The festival of lights celebrates the victory of light over darkness and Lord Rama’s return to Ayodhya. We mark Dhanteras, Kali Chaudas, Diwali with Lakshmi Pooja, and then Annakoot and the Gujarati New Year, when hundreds of dishes are offered to the deities.' },
          { question: 'Ram Navami', answer: 'The birth of Lord Rama, to whom our Shree Ram Mandir is dedicated, celebrated with bhajans, katha and prasad.' },
          { question: 'Krishna Janmashtami', answer: 'The birth of Lord Krishna, celebrated with an evening of bhajans that builds to the midnight celebration of His birth.' },
          { question: 'Ganesh Chaturthi', answer: 'Ten days honouring Lord Ganesha, the remover of obstacles, ending with Ganesh Visarjan. Our children’s Ganesh play has become a much-loved part of it.' },
          { question: 'Maha Shivratri', answer: 'The great night of Lord Shiva, observed with fasting, abhishek and prayer through the evening.' },
          { question: 'Holi', answer: 'The festival of colours welcomes spring and celebrates the triumph of devotion, remembered through the story of Prahlad, with Holika Dahan the evening before.' },
          { question: 'Makar Sankranti', answer: 'The sun’s journey into Capricorn marks the harvest; families share til-gud sweets and fly kites.' },
          { question: 'Festivals of our wider family', answer: 'As Tamil, Telugu, Punjabi, Nepali and Bengali families have joined us, our calendar has grown to include Tai Pongal, Tamil New Year, Ugadi, Vaigasi Visakam, Karthigai Deepam, Ayyappa Pooja, Lohri and more.' },
        ],
      },
      { blockType: 'callToAction', heading: 'See this year’s dates', text: 'Every festival date for the year, with times and events.', label: 'Festival calendar', href: '/festival-calendar' },
    ],
  },
  {
    slug: 'charity',
    title: 'Our charity work',
    eyebrow: 'Seva in Peterborough',
    intro: 'Seva — selfless service — is at the heart of our faith. Our volunteers support people in need across Peterborough.',
    hero: 'food-bank.jpg',
    sections: [
      {
        blockType: 'imageText',
        heading: 'Feeding people who need it most',
        image: 'soup-kitchen.jpg',
        body: `We work with Peterborough City Council and local partners to fill gaps where help is needed. Our volunteers have sourced and delivered food to **Soup Kitchen Peterborough** for food bags for homeless and vulnerable people, and donated tinned food, juices and essentials to **Peterborough Foodbank**.

Our weekly **lunch club** brings older members together for a hot vegetarian meal and company every Monday and Tuesday.`,
      },
      {
        blockType: 'imageText',
        heading: 'Supporting the NHS and our neighbours',
        image: 'nhs-meals.jpg',
        imageSide: 'left',
        body: `During the pandemic, BHS volunteers cooked fresh hot vegetarian meals in a clean, safe kitchen and delivered them to staff at Peterborough hospitals, along with dry food and drinks for NHS teams. Groceries, gloves and masks were delivered regularly to members of the community who were shielding.

Today we also run dementia awareness and support sessions, an Alzheimer’s support group and first-aider training.`,
      },
      {
        blockType: 'text',
        heading: 'Our impact today',
        body: 'The committee is gathering up-to-date figures for our current charitable work, which will be published here. You can support this work by giving to our **Food service** fund.',
      },
      { blockType: 'callToAction', heading: 'Support our seva', text: 'Give to the Food service fund or volunteer in the kitchen.', label: 'Give to the Food service fund', href: '/donate?fund=food-service' },
    ],
  },
  {
    slug: 'visit',
    title: 'Plan your visit',
    eyebrow: 'Visitor guide',
    intro: 'Everyone is welcome at the Mandir — devotees, neighbours, schools and visitors of every faith. Here is what to know before you come.',
    hero: 'bhajan-children.jpg',
    sections: [
      {
        blockType: 'text',
        heading: 'Finding us',
        body: `**Bharat Hindu Samaj, Unit 6, New England Complex, Rock Road, Peterborough PE1 3BU**

The Mandir is a short drive from Peterborough city centre, off Lincoln Road. Free parking is available on site; at busy festivals please car-share where possible, follow the stewards' directions and be considerate to our neighbours.`,
      },
      {
        blockType: 'faq',
        heading: 'Etiquette and dress code',
        items: [
          { question: 'What should I wear?', answer: 'Please dress modestly, covering shoulders and knees. Traditional Indian dress is welcome but not expected.' },
          { question: 'Do I need to remove my shoes?', answer: 'Yes. Please remove your shoes before entering the Mandir and the hall; there are shoe racks at the entrance.' },
          { question: 'Can I bring food?', answer: 'The Mandir is a vegetarian space. Please do not bring meat, fish, eggs or alcohol onto the premises.' },
          { question: 'Can I take photographs?', answer: 'Please ask before photographing people, and do not use flash in front of the deities. Some ceremonies may not be photographed.' },
          { question: 'How should I behave in the Mandir?', answer: 'Please keep phones on silent, speak quietly, and do not point your feet towards the deities when seated. Ask any volunteer if you are unsure — we are happy to help.' },
        ],
      },
      {
        blockType: 'text',
        heading: 'Accessibility',
        body: 'The Mandir and main hall are on the ground floor. If you have access needs, please call ahead and a volunteer will be happy to help you on arrival. Chairs are available for anyone who cannot sit on the floor.',
      },
      {
        blockType: 'text',
        heading: 'Schools and groups',
        body: 'We welcome visits from schools, faith groups and community organisations for learning about Hinduism. Please use the contact form to arrange a date; visits usually last about an hour and can include a tour, a talk and questions.',
      },
      { blockType: 'callToAction', heading: 'Arrange a group visit', label: 'Contact us', href: '/contact' },
    ],
  },
  {
    slug: 'community',
    title: 'Community life',
    eyebrow: 'Community',
    intro: 'Classes, clubs, seva and celebrations for every generation.',
    sections: [
      {
        blockType: 'text',
        body: `Bharat Hindu Samaj is more than a place of worship. Each week our hall hosts yoga, meditation, dance, language classes, sport, bhajans and our lunch club, almost all run by volunteers and free for members.

- **Classes and activities** — see the weekly timetable on our activities page.
- **Charity work** — food bank, soup kitchen and community support.
- **Volunteering** — kitchens, festivals, teaching and the new Mandir project.
- **News** — the latest from the Samaj and the appeal.`,
      },
      { blockType: 'callToAction', heading: 'See the weekly timetable', label: 'Classes and activities', href: '/activities' },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy notice',
    eyebrow: 'Policies',
    intro: 'How Bharat Hindu Samaj collects, uses and protects your personal information under UK GDPR. Draft for trustee review.',
    sections: [
      {
        blockType: 'text',
        body: `## Who we are
Bharat Hindu Samaj (registered charity 274404), Unit 6, New England Complex, Rock Road, Peterborough PE1 3BU, is the controller of your personal data. Contact: secretary@bharathindusamaj.co.uk.

## What we collect and why
- **Members:** name, address, email, phone, membership number, payment and renewal dates, communication choices. Lawful basis: contract (your membership).
- **Donors:** name, email, home address and Gift Aid declaration, gift details. Lawful basis: legal obligation (HMRC Gift Aid records) and legitimate interests (thanking you and administering your gift).
- **Bookings:** contact details, booking details and any dietary notes you choose to share. Lawful basis: contract.
- **Volunteers:** contact details, skills and availability; DBS status where a role requires it. Lawful basis: legitimate interests and, for safeguarding, legal obligation.
- **Newsletter:** your email address. Lawful basis: consent, which you can withdraw at any time.
- **Contact form:** your message and contact details. Lawful basis: legitimate interests (replying to you).

## Payments
Card payments are processed by Stripe and Direct Debits by GoCardless. Your card or bank details are entered on their secure pages and are never stored on our systems.

## How long we keep data
- Gift Aid declarations and donation records: 6 years after the last gift claimed (HMRC requirement).
- Membership records: while you are a member and 2 years after membership lapses.
- Booking records: 6 years for financial records.
- Contact form messages: 12 months.
- Newsletter: until you unsubscribe.

## Your rights
You can ask for a copy of your data, ask us to correct or delete it, object to processing, or withdraw consent. Members can download their data and request deletion from their account page. You can complain to the Information Commissioner’s Office (ico.org.uk).

## Sharing
We do not sell your data. We share it only with service providers who help us run the charity (payment providers, email and hosting) under contract, and with HMRC for Gift Aid claims.`,
      },
    ],
  },
  {
    slug: 'cookies',
    title: 'Cookies',
    eyebrow: 'Policies',
    intro: 'We keep cookies to a minimum.',
    sections: [
      {
        blockType: 'text',
        body: `## Essential cookies
These keep you signed in to your member account and protect forms from misuse. They are strictly necessary, so they do not need consent.

- **payload-token** — keeps you signed in (expires after 14 days, or when you sign out).

## Optional cookies
We do not currently set any analytics or marketing cookies. If we add them in future they will stay off unless you choose "Accept optional cookies".

## Changing your choice
Your choice is stored in your browser. You can change it at any time using the button below.`,
      },
    ],
  },
  {
    slug: 'safeguarding',
    title: 'Safeguarding',
    eyebrow: 'Policies',
    intro: 'Keeping children and adults at risk safe at the Mandir. Draft for trustee review.',
    sections: [
      {
        blockType: 'text',
        body: `Bharat Hindu Samaj is committed to the safety and wellbeing of everyone who takes part in our activities, especially children and adults at risk.

- Volunteers working regularly with children or adults at risk are recruited safely and have DBS checks where the role requires it.
- We have a designated safeguarding lead appointed by the trustees.
- Any concern is taken seriously, recorded and acted on promptly.

## Raising a concern
If you are worried about someone’s safety, speak to our safeguarding lead or use the contact form and choose "Safeguarding concern" — your message goes straight to the safeguarding lead. If someone is in immediate danger, call **999**.

The full safeguarding policy is available on request and will be published here once approved by the trustees.`,
      },
    ],
  },
  {
    slug: 'accessibility',
    title: 'Accessibility statement',
    eyebrow: 'Policies',
    intro: 'We want everyone to be able to use this website.',
    sections: [
      {
        blockType: 'text',
        body: `This website aims to meet the **Web Content Accessibility Guidelines (WCAG) 2.2 at level AA**. That means you should be able to:

- navigate the whole site using only a keyboard;
- use a screen reader such as NVDA, JAWS or VoiceOver;
- zoom up to 400% without content being cut off;
- turn off animations by setting "reduce motion" on your device;
- read text over images, which always sits on a high-contrast background.

## Known limitations
Some older PDF documents (such as scanned reports) may not be fully accessible. Contact us and we will provide the information in another format.

## Feedback
If you find a problem, please tell us using the contact form. We aim to reply within 5 working days.

This statement was prepared in October 2026 and will be reviewed after each accessibility test.`,
      },
    ],
  },
  {
    slug: 'gift-aid',
    title: 'Gift Aid',
    eyebrow: 'Giving',
    intro: 'If you pay UK tax, Gift Aid lets us claim an extra 25p for every £1 you give, at no cost to you.',
    sections: [
      {
        blockType: 'faq',
        heading: 'Gift Aid explained',
        items: [
          { question: 'Who can Gift Aid a donation?', answer: 'You can add Gift Aid if you pay UK Income Tax or Capital Gains Tax at least equal to the Gift Aid we claim on all your donations in that tax year.' },
          { question: 'What can be Gift Aided?', answer: 'Only donations of your own money. We cannot claim Gift Aid on company gifts, event ticket or takings, money collected from others, legacies, or payments that buy something such as membership benefits or bookings.' },
          { question: 'What do you need from me?', answer: 'Your full name, home address and postcode, and a declaration that you are a UK taxpayer. We keep this record with each gift as HMRC requires.' },
          { question: 'Higher-rate taxpayers', answer: 'If you pay tax at a higher rate, you can claim the difference between the higher rate and the basic rate through your self-assessment tax return.' },
          { question: 'Changing or cancelling', answer: 'Tell us if you want to cancel your declaration, change your name or address, or no longer pay enough tax. Members can do this from their account page.' },
        ],
      },
    ],
  },
  {
    slug: 'hall-hire-terms',
    title: 'Hall and kitchen hire policy',
    eyebrow: 'Policies',
    intro: 'Terms that apply to every hire of the main hall, sports hall and kitchen. Draft for trustee review.',
    sections: [
      {
        blockType: 'text',
        body: `- All bookings are requests until approved by the temple office.
- A deposit may be taken at booking; it is refunded after the event if the premises are left clean and undamaged.
- The premises are vegetarian and alcohol-free. No meat, fish, eggs or alcohol may be brought on site.
- Hirers must keep to the booked times, including setting up and clearing away.
- Fire exits must be kept clear and the number of guests must not exceed the safe capacity advised by the office.
- Hirers are responsible for supervising children and for any damage caused during the hire.
- Cancellations: see the cancellation terms shown when you book. Deposits are non-refundable for cancellations within the stated notice period.
- Music must end by the time agreed with the office out of respect for our neighbours.`,
      },
    ],
  },
  {
    slug: 'festival-calendar',
    title: 'Festival calendar 2026',
    eyebrow: 'Events',
    intro: 'Key festival dates for the year at Bharat Hindu Samaj. Upcoming festivals also appear on our events calendar with times.',
    sections: [],
  },
]

/** 2026 festival calendar (from BHS Festival Cal 2026 PDF); only upcoming dates are created as events. */
export const FESTIVALS_2026: { date: string; title: string; allDay?: boolean; start?: string; end?: string; category?: 'festival' | 'meeting' | 'community' }[] = [
  { date: '2026-10-11', title: 'Navratri begins', start: '19:30', end: '22:30' },
  { date: '2026-10-18', title: 'Lalitha Sahasranamam', start: '10:00', end: '12:00' },
  { date: '2026-10-19', title: 'Navratri ends', start: '19:30', end: '22:30' },
  { date: '2026-10-24', title: 'Soundarya Lahari', start: '10:00', end: '12:00' },
  { date: '2026-10-25', title: 'Sharad Poornima & Dussehra Havan', start: '10:00', end: '13:00' },
  { date: '2026-10-29', title: 'Karva Chauth', start: '18:00', end: '21:00' },
  { date: '2026-11-06', title: 'Dhanteras Pooja', start: '18:00', end: '20:00' },
  { date: '2026-11-07', title: 'Kali Chaudas / Narak Chaturdashi & Hanuman Chalisa', start: '18:00', end: '20:30' },
  { date: '2026-11-08', title: 'Diwali and Lakshmi Pooja', start: '17:00', end: '21:30' },
  { date: '2026-11-10', title: 'Annakoot and Gujarati New Year', start: '11:00', end: '14:00' },
  { date: '2026-11-14', title: 'Jalaram Jayanti', start: '11:00', end: '13:00' },
  { date: '2026-11-15', title: 'Soorasamhaaram (Skanda Shashti)', start: '17:00', end: '20:00' },
  { date: '2026-11-21', title: 'Tulsi Vivah', start: '17:00', end: '19:30' },
  { date: '2026-11-22', title: 'Thirukalyanam', start: '10:00', end: '13:00' },
  { date: '2026-11-24', title: 'Karthigai Deepam & Karthika Poornima', start: '18:00', end: '20:30' },
  { date: '2026-12-06', title: 'Christmas Party', start: '13:00', end: '17:00', category: 'community' },
  { date: '2026-12-12', title: 'Ayyappa Pooja', start: '17:00', end: '20:00' },
  { date: '2026-12-20', title: 'Gita Jayanti / Mokshada Ekadashi', start: '10:00', end: '12:00' },
]

export const FESTIVAL_TABLE_2026: [string, string][] = [
  ['January', 'Sat 10 Lohri · Mon 26 Indian Republic Day'],
  ['February', 'Sun 1 Tai Pongal · Sun 15 Maha Shivratri'],
  ['March', 'Mon 2 Holika Dahan · Tue 3 Masi Maham · Thu 19 Gudi Padwa / Chaitra Navratri / Ugadi · Thu 26 Shree Ram Navami'],
  ['April', 'Wed 1 Panguni Uthiram · Sat 4 Shree Hanuman Jayanti · Tue 14 Tamil New Year · Wed 29 Narsimha Jayanti'],
  ['May', 'Sun 17 AGM · Fri 29 Vaigasi Visakam · Sun 31 Hanuman Pooja'],
  ['June', 'Sun 14 Satyanarayan Katha & Navgrah Havan · Sun 21 Telugu Sundarakanda Parayan'],
  ['July', 'Sat 18 Jagannath Yatra · Sat 25 Ashadhi Ekadashi · Wed 29 Guru Purnima'],
  ['August', 'Thu 6 Aadi Krithigai · Thu 13 Gujarati Shravan Maas starts · Sat 15 31st Mandir Patotsav / Independence Day · Fri 28 Raksha Bandhan'],
  ['September', 'Thu 3 Shitla Satam, Katha · Fri 4 Janmashtami · Mon 7 Maharudra Abhishek Pooja · Thu 10 Gujarati Shravan month ends · Mon 14 Ganesh Chaturthi starts · Sat 19 Ganesh Visarjan · Sun 27 Shraad starts'],
  ['October', 'Sat 10 Shraad ends · Sun 11 Navratri starts · Sun 18 Lalitha Sahasranamam · Mon 19 Navratri ends · Sat 24 Soundarya Lahari · Sun 25 Sharad Poornima / Dussehra Havan · Thu 29 Karva Chauth'],
  ['November', 'Fri 6 Dhanteras Pooja · Sat 7 Kali Chaudas / Narak Chaturdashi / Hanuman Chalisa programme · Sun 8 Diwali and Lakshmi Pooja · Tue 10 Annakoot, Gujarati New Year · Sat 14 Jalaram Jayanti · Sun 15 Soorasamhaaram (Skanda Shashti) · Sat 21 Tulsi Vivah · Sun 22 Thirukalyanam · Tue 24 Karthigai Deepam & Karthika Poornima'],
  ['December', 'Sun 6 Christmas Party · Sat 12 Ayyappa Pooja · Sun 20 Gita Jayanti / Mokshada Ekadashi'],
]

/** Weekly activities timetable (from the "Be Active @ BHS" poster). Prices in pence; * = free for members. */
export const ACTIVITIES = [
  { name: 'Bollywood Dance — children', days: ['monday'], start: '18:15', end: '19:15', member: 0, guest: 0, membersOnly: true, rrule: 'FREQ=WEEKLY;BYDAY=MO', image: 'bollywood-dance.jpg' },
  { name: 'Lunch club for seniors', days: ['monday', 'tuesday'], start: '10:30', end: '13:30', member: 0, guest: 0, rrule: 'FREQ=WEEKLY;BYDAY=MO,TU', image: 'lunch-club.jpg', category: 'meal' as const },
  { name: 'Table tennis for seniors', days: ['monday', 'tuesday'], start: '10:30', end: '13:30', member: 0, guest: 0, membersOnly: true, rrule: 'FREQ=WEEKLY;BYDAY=MO,TU', image: 'table-tennis.jpg' },
  { name: "Alzheimer's support group", days: ['wednesday'], start: '10:30', end: '12:00', member: 0, guest: 0, rrule: 'FREQ=WEEKLY;INTERVAL=2;BYDAY=WE', image: 'dementia-support.jpg' },
  { name: 'Tai Chi', days: ['wednesday'], start: '18:30', end: '19:30', member: 0, guest: 0, membersOnly: true, rrule: 'FREQ=WEEKLY;BYDAY=WE' },
  { name: 'Bollywood Dance — age 12+', days: ['thursday'], start: '18:30', end: '19:30', member: 600, guest: 600, unit: 'per class', rrule: 'FREQ=WEEKLY;BYDAY=TH', image: 'bollywood-dance.jpg' },
  { name: 'Sai Bhajans', days: ['thursday'], start: '19:30', end: '20:30', member: 0, guest: 0, rrule: 'FREQ=MONTHLY;BYDAY=1TH', image: 'bhajan-sabha.jpg', note: 'First Thursday of every month' },
  { name: 'Swaminarayan monthly satsang', days: ['friday'], start: '19:30', end: '21:00', member: 0, guest: 0, rrule: 'FREQ=MONTHLY;BYDAY=-1FR', note: 'Last Friday of the month' },
  { name: '11 Hanuman Chalisa recital', days: ['saturday'], start: '17:30', end: '18:30', member: 0, guest: 0, rrule: 'FREQ=WEEKLY;BYDAY=SA' },
  { name: 'Gujarati classes', days: ['friday'], start: '18:30', end: '19:30', member: 0, guest: 0, membersOnly: true, rrule: 'FREQ=WEEKLY;BYDAY=FR' },
  { name: 'Hindi classes for children', days: ['saturday'], start: '18:30', end: '19:15', member: 500, guest: 500, unit: 'per class', rrule: 'FREQ=WEEKLY;BYDAY=SA' },
  { name: 'Yoga', days: ['sunday'], start: '09:15', end: '10:15', member: 0, guest: 0, membersOnly: true, rrule: 'FREQ=WEEKLY;BYDAY=SU' },
  { name: 'Meditation', days: ['sunday'], start: '10:30', end: '11:30', member: 0, guest: 0, membersOnly: true, rrule: 'FREQ=WEEKLY;BYDAY=SU' },
  { name: 'Shakha family games', days: ['sunday'], start: '17:15', end: '18:15', member: 0, guest: 0, membersOnly: true, rrule: 'FREQ=WEEKLY;BYDAY=SU', image: 'shakha.jpg' },
  { name: 'Badminton and table tennis', days: ['friday', 'saturday', 'sunday'], start: '09:00', end: '20:00', member: 0, guest: 0, membersOnly: true, rrule: 'FREQ=WEEKLY;BYDAY=FR,SA,SU', image: 'badminton.jpg', note: 'Typically during Mandir opening hours' },
]

/** Ceremony price list (from the BHS price list image). Pence. */
export const CEREMONIES: { name: string; member: number; nonMember: number; materials: number | null; duration: number }[] = [
  { name: 'Havan / Homa / Yagna', member: 7500, nonMember: 10000, materials: 7500, duration: 120 },
  { name: 'Grah Pravesh / Vastu (Kalash Pooja only)', member: 5100, nonMember: 7500, materials: 5000, duration: 90 },
  { name: 'Grah Pravesh / Vastu (Kalash Pooja + Havan)', member: 10100, nonMember: 12500, materials: 7500, duration: 180 },
  { name: 'Grah Pravesh / Vastu (Kalash Pooja + Satyanarayan Pooja)', member: 10100, nonMember: 12500, materials: 7500, duration: 180 },
  { name: 'Satyanarayan Pooja / Katha', member: 5100, nonMember: 7500, materials: 5000, duration: 120 },
  { name: 'Engagement', member: 10100, nonMember: 12500, materials: 5000, duration: 120 },
  { name: 'Mandap Muhurt (for weddings)', member: 5100, nonMember: 7500, materials: 5000, duration: 90 },
  { name: 'Grah Shanti', member: 5100, nonMember: 7500, materials: 5000, duration: 120 },
  { name: 'Wedding ceremony', member: 25000, nonMember: 27500, materials: 10000, duration: 240 },
  { name: 'Mataj', member: 17500, nonMember: 20000, materials: 7500, duration: 180 },
  { name: 'Funeral', member: 15000, nonMember: 17500, materials: 7500, duration: 120 },
  { name: 'Kriya', member: 20000, nonMember: 22500, materials: null, duration: 180 },
  { name: 'Scattering of ashes', member: 5000, nonMember: 7500, materials: 2500, duration: 90 },
  { name: 'Tarpan Pooja / Vishnu Pooja', member: 5100, nonMember: 7500, materials: 2500, duration: 90 },
  { name: 'Special occasion pooja at home (birthday, anniversary, vrat)', member: 5100, nonMember: 7500, materials: 2500, duration: 90 },
]
