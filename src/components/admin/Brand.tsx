import React from 'react'

/** The Bharat Hindu Samaj logo on the CMS sign-in screen and in the admin navigation. */
export function Logo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/bhs-logo.png" alt="Bharat Hindu Samaj" width={350} height={42} style={{ height: 42, width: 'auto' }} />
      <div style={{ fontSize: 13, opacity: 0.75 }}>Website content management</div>
    </div>
  )
}

export function Icon() {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/images/apple-icon.png" alt="" width={36} height={36} style={{ borderRadius: '50%' }} />
}
