'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AccountSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deletionPending, setDeletionPending] = useState(false)
  const [deletionDate, setDeletionDate] = useState<string | null>(null)

  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Load user_roles data for phone number and deletion status
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('phone_number, deletion_requested_at')
        .eq('user_id', user.id)
        .single()

      if (userRole) {
        setPhoneNumber(userRole.phone_number || '')
        if (userRole.deletion_requested_at) {
          setDeletionPending(true)
          const deleteDate = new Date(userRole.deletion_requested_at)
          deleteDate.setDate(deleteDate.getDate() + 30)
          setDeletionDate(deleteDate.toLocaleDateString())
        }
      }

      setLoading(false)
    }

    loadUserData()
  }, [router])

  const handleUpdatePhone = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/account/update-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to update phone number' })
      } else {
        setMessage({ type: 'success', text: 'Phone number updated successfully' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating phone number' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      setSaving(false)
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' })
      setSaving(false)
      return
    }

    try {
      const response = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' })
      } else {
        setMessage({ type: 'success', text: 'Password changed successfully' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while changing password' })
    } finally {
      setSaving(false)
    }
  }

  const handleRequestDeletion = async () => {
    if (!confirm('Are you sure you want to delete your account? This action will take effect in 30 days. You can cancel by logging back in during that time.')) {
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/account/request-deletion', {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to request account deletion' })
      } else {
        setMessage({ type: 'success', text: 'Account deletion requested. You have 30 days to cancel by logging back in.' })
        setDeletionPending(true)
        const deleteDate = new Date()
        deleteDate.setDate(deleteDate.getDate() + 30)
        setDeletionDate(deleteDate.toLocaleDateString())
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while requesting deletion' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancelDeletion = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/account/cancel-deletion', {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to cancel account deletion' })
      } else {
        setMessage({ type: 'success', text: 'Account deletion cancelled successfully' })
        setDeletionPending(false)
        setDeletionDate(null)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while cancelling deletion' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-dm-sans)', color: '#6b6457' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <Link
            href="/dashboard"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#6b6457',
              textDecoration: 'none',
              marginBottom: '16px',
              display: 'inline-block',
            }}
          >
            ← Back to Dashboard
          </Link>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 900,
            color: '#F2EDE4',
            marginBottom: '8px',
          }}>
            Account Settings
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            color: '#6b6457',
            fontSize: '1rem',
          }}>
            {user?.email}
          </p>
        </div>

        {/* Deletion Pending Banner */}
        {deletionPending && (
          <div style={{
            backgroundColor: '#2a1810',
            border: '2px solid #C9A84C',
            padding: '24px',
            marginBottom: '40px',
          }}>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#F2EDE4',
              marginBottom: '8px',
              fontWeight: 600,
            }}>
              Account Deletion Pending
            </div>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#6b6457',
              marginBottom: '16px',
            }}>
              Your account will be permanently deleted on {deletionDate}. You can cancel this action at any time before then.
            </div>
            <button
              onClick={handleCancelDeletion}
              disabled={saving}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                padding: '12px 24px',
                backgroundColor: '#C9A84C',
                color: '#0C0A07',
                border: 'none',
                fontSize: '0.875rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 600,
                opacity: saving ? 0.5 : 1,
              }}
            >
              {saving ? 'Cancelling...' : 'Cancel Deletion'}
            </button>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div style={{
            backgroundColor: message.type === 'success' ? '#1a2810' : '#2a1810',
            border: `1px solid ${message.type === 'success' ? '#4a6430' : '#C9A84C'}`,
            padding: '16px',
            marginBottom: '24px',
          }}>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#F2EDE4',
            }}>
              {message.text}
            </div>
          </div>
        )}

        {/* Phone Number Section */}
        <div style={{
          border: '1px solid #2a261e',
          padding: '32px',
          marginBottom: '32px',
        }}>
          <div style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#F2EDE4',
            marginBottom: '8px',
          }}>
            Phone Number
          </div>
          <div style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#6b6457',
            marginBottom: '24px',
          }}>
            Add or update your phone number for SMS notifications when your trade advice is ready.
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#F2EDE4',
              display: 'block',
              marginBottom: '8px',
            }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1XXXXXXXXXX"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1a1710',
                border: '1px solid #2a261e',
                color: '#F2EDE4',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
              }}
            />
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.75rem',
              color: '#6b6457',
              marginTop: '4px',
            }}>
              Format: E.164 (+1XXXXXXXXXX for US numbers)
            </div>
          </div>
          <button
            onClick={handleUpdatePhone}
            disabled={saving}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '12px 24px',
              backgroundColor: '#C9A84C',
              color: '#0C0A07',
              border: 'none',
              fontSize: '0.875rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Update Phone Number'}
          </button>
        </div>

        {/* Change Password Section */}
        <div style={{
          border: '1px solid #2a261e',
          padding: '32px',
          marginBottom: '32px',
        }}>
          <div style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#F2EDE4',
            marginBottom: '8px',
          }}>
            Change Password
          </div>
          <div style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#6b6457',
            marginBottom: '24px',
          }}>
            Update your password to keep your account secure.
          </div>
          <form onSubmit={handleChangePassword}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
                display: 'block',
                marginBottom: '8px',
              }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '48px',
                    backgroundColor: '#1a1710',
                    border: '1px solid #2a261e',
                    color: '#F2EDE4',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '1rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#6b6457',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                  }}
                >
                  {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
                display: 'block',
                marginBottom: '8px',
              }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '48px',
                    backgroundColor: '#1a1710',
                    border: '1px solid #2a261e',
                    color: '#F2EDE4',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '1rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#6b6457',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                  }}
                >
                  {showNewPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                color: '#6b6457',
                marginTop: '4px',
              }}>
                Minimum 6 characters
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
                display: 'block',
                marginBottom: '8px',
              }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '48px',
                    backgroundColor: '#1a1710',
                    border: '1px solid #2a261e',
                    color: '#F2EDE4',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '1rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#6b6457',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                  }}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                padding: '12px 24px',
                backgroundColor: '#C9A84C',
                color: '#0C0A07',
                border: 'none',
                fontSize: '0.875rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 600,
                opacity: saving ? 0.5 : 1,
              }}
            >
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Delete Account Section */}
        {!deletionPending && (
          <div style={{
            border: '2px solid #6b4545',
            padding: '32px',
            backgroundColor: '#1a1010',
          }}>
            <div style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginBottom: '8px',
            }}>
              Delete Account
            </div>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#6b6457',
              marginBottom: '16px',
              lineHeight: '1.6',
            }}>
              Deleting your account is permanent after 30 days. You can cancel within 30 days by logging back in.
            </div>
            <button
              onClick={handleRequestDeletion}
              disabled={saving}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                padding: '12px 24px',
                backgroundColor: '#8b3a3a',
                color: '#F2EDE4',
                border: 'none',
                fontSize: '0.875rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 600,
                opacity: saving ? 0.5 : 1,
              }}
            >
              {saving ? 'Processing...' : 'Request Account Deletion'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
