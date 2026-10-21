/** The five picture cards under "Our community today" on the home page (editable in the CMS). */
export const COMMUNITY_CARDS = [
  { title: 'Worship', text: 'Daily aarti, bhajans and festivals', file: 'bhajan-sabha.jpg', href: '/daily-rituals' },
  { title: 'Community services', text: 'Food bank, soup kitchen, NHS meals and wellbeing support', file: 'soup-kitchen.jpg', href: '/charity' },
  { title: 'Serving all', text: 'Youth and seniors: Shakha, theatre, table tennis and support groups', file: 'shakha.jpg', href: '/community' },
  { title: 'Lunch club', text: 'Hot vegetarian meals every Monday and Tuesday', file: 'lunch-club.jpg', href: '/services#meal' },
  { title: 'Sports and classes', text: 'Badminton, yoga, dance and languages', file: 'badminton.jpg', href: '/activities' },
]

/** Seva and community-centre work, shown as picture cards on the Charity work page. */
export const SEVA_CARDS = {
  heading: 'Seva in our community',
  intro: 'Seva, selfless service, is at the heart of our faith. From the kitchen to the sports hall, our volunteers serve people across Peterborough, whatever their background.',
  items: [
    { title: 'Food bank and soup kitchen', text: 'Food bags for homeless and vulnerable people through Soup Kitchen Peterborough, and regular donations to Peterborough Foodbank.', file: 'soup-kitchen.jpg' },
    { title: 'Lunch club', text: 'A hot vegetarian meal and good company for older members every Monday and Tuesday.', file: 'lunch-club.jpg', href: '/services#meal' },
    { title: 'NHS and neighbours', text: 'Hot meals for hospital staff and groceries for shielding families, cooked and delivered by volunteers.', file: 'nhs-meals.jpg' },
    { title: 'Health and wellbeing', text: 'Dementia awareness, an Alzheimer’s support group, yoga and first-aider training.', file: 'dementia-support.jpg' },
    { title: 'Sport and clubs', text: 'Badminton, table tennis, cricket, Shakha family games and trips for every age.', file: 'badminton.jpg', href: '/activities' },
    { title: 'A hall for the community', text: 'Weddings, birthdays, meetings and celebrations: hire the hall and kitchen.', file: 'community-support.jpg', href: '/services#hall' },
  ],
}
