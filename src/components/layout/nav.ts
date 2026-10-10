export interface NavItem {
  label: string
  href: string
  description?: string
}

export interface NavGroup {
  label: string
  href: string
  items?: NavItem[]
}

export const NAV: NavGroup[] = [
  { label: 'New Mandir', href: '/new-mandir' },
  {
    label: 'Visit',
    href: '/visit',
    items: [
      { label: 'Plan your visit', href: '/visit', description: 'Times, parking, dress code and etiquette' },
      { label: 'Daily rituals', href: '/daily-rituals', description: 'Aarti, bhog and prayers' },
      { label: 'Hindu festivals', href: '/festivals', description: 'What we celebrate through the year' },
      { label: 'Photo gallery', href: '/gallery', description: 'Albums from Mandir life' },
    ],
  },
  {
    label: 'Events',
    href: '/events',
    items: [
      { label: 'Upcoming events', href: '/events', description: 'Festivals, workshops and fundraisers' },
      { label: 'Calendar', href: '/calendar', description: 'Month view and calendar feed' },
      { label: 'Festival calendar 2026', href: '/festival-calendar', description: 'Key dates for the year' },
    ],
  },
  {
    label: 'Services',
    href: '/services',
    items: [
      { label: 'Poojas & ceremonies', href: '/services#pooja', description: 'Priest services, at the Mandir or at home' },
      { label: 'Hall & kitchen hire', href: '/services#hall', description: 'Check dates and request a booking' },
      { label: 'Classes & activities', href: '/activities', description: 'Yoga, dance, languages and sport' },
      { label: 'Lunch club', href: '/services#meal', description: 'Weekly meals for seniors' },
    ],
  },
  {
    label: 'Community',
    href: '/community',
    items: [
      { label: 'Charity work', href: '/charity', description: 'Food bank, soup kitchen and community support' },
      { label: 'Volunteer', href: '/volunteer', description: 'Give your time and skills' },
      { label: 'News', href: '/news', description: 'Updates and appeal news' },
    ],
  },
  {
    label: 'About',
    href: '/about',
    items: [
      { label: 'Our story', href: '/about', description: 'From 1972 to today' },
      { label: 'Committee & trustees', href: '/committee', description: 'The people who run the Samaj' },
      { label: 'Governance & accounts', href: '/governance', description: 'Charity details, policies and accounts' },
      { label: 'Contact us', href: '/contact', description: 'Address, phone and message form' },
    ],
  },
]

export const FOOTER_LINKS: NavItem[][] = [
  [
    { label: 'Donate', href: '/donate' },
    { label: 'Sponsor a brick', href: '/donate/sponsor' },
    { label: 'Pledge a major gift', href: '/donate/pledge' },
    { label: 'Donor wall', href: '/donor-wall' },
    { label: 'Become a member', href: '/membership' },
    { label: 'Volunteer', href: '/volunteer' },
  ],
  [
    { label: 'Plan your visit', href: '/visit' },
    { label: 'Events', href: '/events' },
    { label: 'Book a service', href: '/services' },
    { label: 'Member sign in', href: '/account' },
    { label: 'Search', href: '/search' },
    { label: 'Contact', href: '/contact' },
  ],
  [
    { label: 'Privacy notice', href: '/privacy' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Safeguarding', href: '/safeguarding' },
    { label: 'Accessibility', href: '/accessibility' },
    { label: 'Gift Aid', href: '/gift-aid' },
    { label: 'Governance & accounts', href: '/governance' },
  ],
]
