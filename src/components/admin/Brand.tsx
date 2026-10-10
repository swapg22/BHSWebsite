import React from 'react'

export function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Icon />
      <div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: '#B83700', lineHeight: 1.1 }}>Bharat Hindu Samaj</div>
        <div style={{ fontSize: 13, opacity: 0.75 }}>Website content management</div>
      </div>
    </div>
  )
}

export function Icon() {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="#B83700" />
      <path d="M24 9c3 5 3 9 0 13-3-4-3-8 0-13Zm-9 8c5 1 8 4 9 9-5-1-8-4-9-9Zm18 0c-1 5-4 8-9 9 1-5 4-8 9-9ZM11 28c4-2 9-2 13 2-4 2-9 2-13-2Zm26 0c-4 4-9 4-13 2 4-4 9-4 13-2ZM14 34h20c-2 4-6 6-10 6s-8-2-10-6Z" fill="#FBF6EE" />
    </svg>
  )
}
