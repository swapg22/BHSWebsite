'use client'

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('bhs:cookie-settings'))}
      className="min-h-12 cursor-pointer rounded-full border border-charcoal-400 px-6 font-semibold hover:bg-ivory-200"
    >
      Change my cookie choice
    </button>
  )
}
