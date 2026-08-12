'use client'

import { useState, useEffect } from 'react'

type ContactMessage = {
  id: string
  name: string
  email: string
  message: string
  status: 'new' | 'in_progress' | 'resolved'
  created_at: string
  updated_at: string
}

export default function SupportTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [filter, setFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/contact-messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        console.error('Failed to fetch messages')
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
    setLoading(false)
  }

  const updateStatus = async (id: string, newStatus: 'new' | 'in_progress' | 'resolved') => {
    try {
      const response = await fetch('/api/admin/contact-messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })

      if (response.ok) {
        // Update local state
        setMessages(messages.map(msg =>
          msg.id === id ? { ...msg, status: newStatus } : msg
        ))
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const filteredMessages = filter === 'all'
    ? messages
    : messages.filter(msg => msg.status === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#C9A84C'
      case 'in_progress': return '#6b6457'
      case 'resolved': return '#4a9f4a'
      default: return '#F2EDE4'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div style={{
        fontFamily: 'var(--font-dm-sans)',
        color: '#6b6457',
        padding: '40px',
        textAlign: 'center',
      }}>
        Loading messages...
      </div>
    )
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#F2EDE4',
          margin: 0,
        }}>
          Support Messages
        </h2>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {(['all', 'new', 'in_progress', 'resolved'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                padding: '8px 16px',
                backgroundColor: filter === status ? '#C9A84C' : 'transparent',
                color: filter === status ? '#0C0A07' : '#6b6457',
                border: '1px solid #2a261e',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {status.replace('_', ' ')} ({status === 'all' ? messages.length : messages.filter(m => m.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          border: '1px solid #2a261e',
          backgroundColor: '#1a1710',
        }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            color: '#6b6457',
            fontSize: '1rem',
          }}>
            No messages found
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredMessages.map(msg => (
            <div
              key={msg.id}
              style={{
                border: '1px solid #2a261e',
                padding: '24px',
                backgroundColor: '#1a1710',
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px',
              }}>
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#F2EDE4',
                    marginBottom: '4px',
                  }}>
                    {msg.name}
                  </h3>
                  <p style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    color: '#6b6457',
                  }}>
                    {msg.email} • {formatDate(msg.created_at)}
                  </p>
                </div>
                <span style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: getStatusColor(msg.status),
                  padding: '4px 12px',
                  border: `1px solid ${getStatusColor(msg.status)}`,
                }}>
                  {msg.status.replace('_', ' ')}
                </span>
              </div>

              {/* Message */}
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
                lineHeight: 1.6,
                marginBottom: '16px',
                whiteSpace: 'pre-wrap',
              }}>
                {msg.message}
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* Reply Button */}
                <a
                  href={`mailto:${msg.email}?subject=Re: Your message to Trade Rat`}
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    padding: '8px 16px',
                    backgroundColor: '#C9A84C',
                    color: '#0C0A07',
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'inline-block',
                  }}
                >
                  Reply
                </a>

                {/* Status Update Buttons */}
                {msg.status !== 'in_progress' && (
                  <button
                    onClick={() => updateStatus(msg.id, 'in_progress')}
                    style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: '#6b6457',
                      border: '1px solid #2a261e',
                      cursor: 'pointer',
                    }}
                  >
                    Mark In Progress
                  </button>
                )}
                {msg.status !== 'resolved' && (
                  <button
                    onClick={() => updateStatus(msg.id, 'resolved')}
                    style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: '#6b6457',
                      border: '1px solid #2a261e',
                      cursor: 'pointer',
                    }}
                  >
                    Mark Resolved
                  </button>
                )}
                {msg.status !== 'new' && (
                  <button
                    onClick={() => updateStatus(msg.id, 'new')}
                    style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: '#6b6457',
                      border: '1px solid #2a261e',
                      cursor: 'pointer',
                    }}
                  >
                    Mark New
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
