'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function ProfileDropdown({ userEmail }: { userEmail: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get first initial from email
  const initial = userEmail.charAt(0).toUpperCase()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#C9A84C',
          color: '#0C0A07',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '1rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {initial}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '48px',
            right: '0',
            backgroundColor: '#1a1710',
            border: '1px solid #2a261e',
            minWidth: '200px',
            zIndex: 1000,
          }}
        >
          <Link
            href="/account"
            onClick={() => setIsOpen(false)}
            style={{
              display: 'block',
              padding: '12px 16px',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#F2EDE4',
              textDecoration: 'none',
              borderBottom: '1px solid #2a261e',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2a261e'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Account Settings
          </Link>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2a261e'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Sign Out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
