import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const unique = () => `e2e+${Date.now()}${Math.floor(Math.random() * 1000)}@bhs.test`

test.beforeEach(async ({ page }) => {
  // Visitors who have already chosen do not see the cookie notice
  await page.addInitScript(() => localStorage.setItem('bhs-cookie-choice', 'rejected'))
})

async function axe(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).exclude('iframe').analyze()
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([])
}

test.describe('home page journey (FR-01 to FR-05)', () => {
  test('shows the eight stages, times on every page, and Donate/Join @mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: 'Bharat Hindu Samaj' })).toBeVisible()
    await expect(page.getByText('Aarti daily').first()).toBeVisible()
    for (const heading of ['Fifty years of worship', 'A permanent home', 'The new Mandir, on the same site', 'Together towards', 'Every gift lays a stone', 'In the words of our community']) {
      await expect(page.getByRole('heading', { name: new RegExp(heading) })).toBeAttached()
    }
    await expect(page.getByText("Artist's impression, not final design").first()).toBeAttached()
    await expect(page.getByRole('progressbar', { name: /appeal progress/i })).toBeAttached()
    await expect(page.getByText('High Court case update after final day hearing')).toBeAttached()
    await expect(page.getByRole('link', { name: /Donate$/ }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /^Join/ }).first()).toBeVisible()
    await page.goto('/visit')
    await expect(page.getByText('Aarti daily').first()).toBeVisible()
  })

  test('key pages pass automated WCAG 2.2 AA checks', async ({ page }) => {
    // Check the settled page: text mid-fade briefly has lower contrast than its final state
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const path of ['/', '/new-mandir', '/donate', '/membership', '/events', '/services', '/contact', '/about', '/account/login']) {
      await page.goto(path, { waitUntil: 'networkidle' })
      await axe(page)
    }
  })
})

test.describe('donations (FR-18 to FR-24)', () => {
  test('one-off gift with Gift Aid through checkout to receipt @mobile', async ({ page }) => {
    await page.goto('/donate')
    await page.getByRole('radiogroup', { name: 'Amount' }).getByText('£101', { exact: true }).click()
    await page.getByRole('main').getByLabel(/First name/).fill('Priya')
    await page.getByRole('main').getByLabel(/Last name/).fill('Patel')
    await page.getByRole('main').getByRole('textbox', { name: /^Email/ }).fill(unique())
    await page.getByRole('main').getByLabel(/I want to Gift Aid/).check()
    await page.getByRole('main').getByLabel(/House name or number/).fill('6')
    await page.getByRole('main').getByLabel(/Postcode/).fill('pe1 3bu')
    await page.getByRole('button', { name: /Give £101/ }).click()
    await expect(page.getByText('Test checkout — no money moves')).toBeVisible()
    await page.getByRole('button', { name: 'Simulate successful payment' }).click()
    await expect(page.getByRole('heading', { name: /Thank you, Priya/ })).toBeVisible()
    await expect(page.getByText(/Your gift of £101\.00 has been received/)).toBeVisible()
    await expect(page.getByText(/Gift Aid adds £25.25/)).toBeVisible()
    await page.getByRole('link', { name: 'Download receipt' }).click()
    await expect(page.getByRole('heading', { name: 'Donation receipt' })).toBeVisible()
    await expect(page.getByText('Received with thanks')).toBeVisible()
  })

  test('shows validation errors and refuses Gift Aid without a postcode', async ({ page }) => {
    await page.goto('/donate')
    await page.getByRole('main').getByLabel(/I want to Gift Aid/).check()
    await page.getByRole('button', { name: /Give/ }).click()
    await expect(page.getByText('Please check the highlighted fields.')).toBeVisible()
    await expect(page.getByText('Enter your first name')).toBeVisible()
    await expect(page.getByText(/valid UK postcode/)).toBeVisible()
  })

  test('declined payment returns to the form without charging', async ({ page }) => {
    await page.goto('/donate')
    await page.getByRole('main').getByLabel(/First name/).fill('Dev')
    await page.getByRole('main').getByLabel(/Last name/).fill('Test')
    await page.getByRole('main').getByRole('textbox', { name: /^Email/ }).fill(unique())
    await page.getByRole('button', { name: /Give £51/ }).click()
    await page.getByRole('button', { name: 'Simulate declined payment' }).click()
    await expect(page.getByText(/did not go through/)).toBeVisible()
  })

  test('sponsorship uses the fixed amount', async ({ page }) => {
    await page.goto('/donate/sponsor')
    await page.getByRole('main').getByRole('link', { name: 'Sponsor a Brick', exact: true }).click()
    await expect(page.getByText('Your sponsorship')).toBeVisible()
    await expect(page.getByRole('button', { name: /Give £51/ })).toBeVisible()
  })
})

test.describe('membership and account (FR-27 to FR-30)', () => {
  test('join, pay, see the account and update details', async ({ page }) => {
    const email = unique()
    await page.goto('/membership')
    await page.getByRole('main').getByLabel(/First name/).fill('Meena')
    await page.getByRole('main').getByLabel(/Last name/).fill('Joshi')
    await page.getByRole('main').getByRole('textbox', { name: /^Email/ }).fill(email)
    await page.getByRole('main').getByLabel(/^Phone/).fill('07700900123')
    await page.getByRole('main').getByLabel(/Address line 1/).fill('2 Rock Road')
    await page.getByRole('main').getByLabel(/Town or city/).fill('Peterborough')
    await page.getByRole('main').getByLabel(/Postcode/).fill('PE1 3BU')
    await page.getByRole('main').getByLabel('Create a password *').fill('Lotus-garden-2026')
    await page.getByRole('main').getByLabel(/Confirm password/).fill('Lotus-garden-2026')
    await page.getByRole('main').getByLabel(/aged 18 or over/).check()
    await page.getByRole('main').getByLabel(/privacy notice/).check()
    await page.getByRole('button', { name: /Continue to pay £20/ }).click()
    await page.getByRole('button', { name: 'Simulate successful payment' }).click()
    await expect(page.getByRole('heading', { name: /Welcome to the Samaj, Meena/ })).toBeVisible()
    await expect(page.getByText(/BHS\d{5}/)).toBeVisible()
    await page.getByRole('link', { name: 'Go to my account' }).click()
    await expect(page.getByRole('heading', { name: 'Namaste, Meena' })).toBeVisible()
    await expect(page.getByText('Active', { exact: true })).toBeVisible()
    await page.getByRole('main').getByLabel(/^Phone/).fill('07700900999')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByText('Your details have been saved.')).toBeVisible()
  })

  test('magic-link request never reveals whether an account exists', async ({ page }) => {
    await page.goto('/account/login')
    await page.getByRole('tab', { name: 'Email me a link' }).click()
    await page.getByRole('main').getByRole('textbox', { name: /^Email/ }).fill('nobody@bhs.test')
    await page.getByRole('button', { name: 'Email me a sign-in link' }).click()
    await expect(page.getByText(/If that email belongs to a member/)).toBeVisible()
  })

  test('wrong password shows a helpful error', async ({ page }) => {
    await page.goto('/account/login')
    await page.getByRole('main').getByRole('textbox', { name: /^Email/ }).fill('member@bhs.test')
    await page.getByRole('main').getByLabel(/^Password/).fill('wrong-password-1')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText(/do not match our records/)).toBeVisible()
  })
})

test.describe('events and bookings (FR-11 to FR-17, FR-35)', () => {
  test('reserve free places at Diwali and get calendar links', async ({ page }) => {
    await page.goto('/events')
    await page.getByRole('link', { name: 'Diwali and Lakshmi Pooja' }).click()
    await expect(page.getByRole('link', { name: /Google Calendar/ })).toHaveAttribute('href', /calendar\.google\.com/)
    await page.getByRole('main').getByLabel(/Full name/).fill('Event Tester')
    await page.getByRole('main').getByRole('textbox', { name: /^Email/ }).fill(unique())
    await page.getByRole('main').getByLabel(/Number of places/).fill('3')
    await page.getByRole('button', { name: 'Reserve my places' }).click()
    await expect(page.getByRole('heading', { name: 'You’re booked' })).toBeVisible()
  })

  test('hall hire shows booked times and sends a request for approval', async ({ page }) => {
    await page.goto('/book/main-hall-hire', { waitUntil: 'networkidle' })
    // On slow machines the form may hydrate after the first keystrokes; retry until the date registers
    await expect(async () => {
      await page.getByRole('main').getByLabel(/^Date/).fill('2026-11-08')
      await expect(page.getByText('Crossed-out times are already booked.')).toBeVisible({ timeout: 5_000 })
    }).toPass({ timeout: 45_000 })
    await expect(page.getByRole('radio', { name: /17:00 \(booked\)/ })).toBeDisabled()
    // Book on a random future date so the test can be re-run against the same database
    const d = new Date(Date.now() + (40 + Math.floor(Math.random() * 300)) * 864e5).toISOString().slice(0, 10)
    await page.getByRole('main').getByLabel(/^Date/).fill(d)
    await expect(page.getByText('Checking availability…')).toBeHidden()
    await page.getByRole('main').locator('label:has(input[name="startTime"]:not([disabled]))').first().click()
    await page.getByRole('main').getByLabel(/Full name/).fill('Hall Hirer')
    await page.getByRole('main').getByRole('textbox', { name: /^Email/ }).fill(unique())
    await page.getByRole('main').getByLabel(/hire policy/).check()
    await page.getByRole('button', { name: 'Send request' }).click()
    await expect(page.getByRole('heading', { name: 'Request received' })).toBeVisible()
  })

  test('public calendar feed is valid iCalendar', async ({ request }) => {
    const res = await request.get('/calendar.ics')
    expect(res.headers()['content-type']).toContain('text/calendar')
    expect(await res.text()).toMatch(/^BEGIN:VCALENDAR[\s\S]*END:VCALENDAR\r\n$/)
  })
})

test.describe('communication and security', () => {
  test('contact form routes the message @mobile', async ({ page }) => {
    await page.goto('/contact')
    await page.getByRole('main').getByLabel(/^Name/).fill('Contact Tester')
    await page.getByRole('main').getByRole('textbox', { name: /^Email/ }).fill(unique())
    await page.getByRole('main').getByLabel(/What is it about/).selectOption('bookings')
    await page.getByRole('main').getByLabel(/^Message/).fill('I would like to ask about hiring the hall for a family event.')
    await page.getByRole('button', { name: 'Send message' }).click()
    await expect(page.getByText(/sent to the right team/)).toBeVisible()
  })

  test('sends security headers and protects staff areas', async ({ request }) => {
    const res = await request.get('/')
    const h = res.headers()
    expect(h['content-security-policy']).toContain("frame-ancestors 'none'")
    expect(h['x-content-type-options']).toBe('nosniff')
    expect(h['x-powered-by']).toBeUndefined()
    expect((await request.get('/exports/donations')).status()).toBe(403)
    expect((await request.get('/cron/daily')).status()).toBe(401)
    expect((await request.get('/api/donations')).status()).toBe(403)
    expect((await request.get('/api/members')).status()).toBe(403)
    const login = await request.get('/admin/login', { maxRedirects: 0 })
    expect(login.status()).toBe(307)
  })
})

test.describe('new Mandir page', () => {
  test('explains the parts of a Mandir interactively', async ({ page }) => {
    await page.goto('/new-mandir')
    await expect(page.getByRole('heading', { name: 'The anatomy of a Hindu temple' })).toBeVisible()
    const detail = page.locator('#anatomy-detail')
    await expect(detail).toContainText('Shikhara')
    await page.getByRole('button', { name: /Garbhagriha/ }).click()
    await expect(page.getByRole('button', { name: /Garbhagriha/ })).toHaveAttribute('aria-pressed', 'true')
    await expect(detail).toContainText('womb chamber')
  })
})
