import { useState, useEffect, useCallback } from 'react'
import {
  AppIcon,
  MessageIcon,
  MailIcon,
  CheckmarkCircle01Icon,
  SearchIcon,
  DeleteIcon,
  RefreshIcon,
  CancelIcon,
} from '../../icons'
import './MessagesPage.css'

export default function MessagesPage() {
  const context = window.DJANGO_CONTEXT || {}
  const initialList = context.messagesList || []

  const [messages, setMessages] = useState(initialList)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [readFilter, setReadFilter] = useState('all') // 'all', 'unread', 'read'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const [totalCount, setTotalCount] = useState(initialList.length)
  const [unreadCount, setUnreadCount] = useState(initialList.filter(m => !m.is_read).length)
  const [readCount, setReadCount] = useState(initialList.filter(m => m.is_read).length)

  // Fetch notifications from REST API
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMsg(null)
      const res = await fetch(`/api/notifications/?category=${categoryFilter}&q=${encodeURIComponent(searchQuery)}`)
      if (!res.ok) throw new Error('Unable to load notifications')
      const data = await res.json()
      if (data.notifications) {
        setMessages(data.notifications)
        if (data.total_count !== undefined) setTotalCount(data.total_count)
        if (data.unread_count !== undefined) setUnreadCount(data.unread_count)
        if (data.read_count !== undefined) setReadCount(data.read_count)
      }
    } catch (err) {
      console.warn('API fetch warning:', err)
    } finally {
      setIsLoading(false)
    }
  }, [categoryFilter, searchQuery])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Mark a single notification as read
  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation()
    try {
      const csrfToken = context.csrfToken || ''
      const numericId = String(id).replace('notif_', '')
      const res = await fetch(`/api/notifications/${numericId}/read/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      })
      if (res.ok) {
        setMessages(prev =>
          prev.map(m => (m.id === id ? { ...m, is_read: true } : m))
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
        setReadCount(prev => prev + 1)
      }
    } catch (err) {
      console.error('Failed to mark read:', err)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const csrfToken = context.csrfToken || ''
      const res = await fetch('/api/notifications/mark-all-read/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      })
      if (res.ok) {
        setMessages(prev => prev.map(m => ({ ...m, is_read: true })))
        setUnreadCount(0)
        setReadCount(totalCount)
      }
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }

  // Delete notification
  const deleteNotification = async (id, e) => {
    if (e) e.stopPropagation()
    if (!window.confirm('Delete this notification?')) return
    try {
      const csrfToken = context.csrfToken || ''
      const numericId = String(id).replace('notif_', '')
      const res = await fetch(`/api/notifications/${numericId}/delete/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      })
      if (res.ok) {
        const target = messages.find(m => m.id === id)
        setMessages(prev => prev.filter(m => m.id !== id))
        setTotalCount(prev => Math.max(0, prev - 1))
        if (target && !target.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        } else if (target && target.is_read) {
          setReadCount(prev => Math.max(0, prev - 1))
        }
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null)
        }
      }
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  // Open modal detail
  const openModal = (msg) => {
    setSelectedMessage(msg)
    if (!msg.is_read) {
      markAsRead(msg.id)
    }
  }

  const closeModal = () => {
    setSelectedMessage(null)
  }

  // Filter messages client-side for immediate feedback
  const filteredMessages = messages.filter(msg => {
    // Read status filter
    if (readFilter === 'unread' && msg.is_read) return false
    if (readFilter === 'read' && !msg.is_read) return false

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchTitle = (msg.title || '').toLowerCase().includes(q)
      const matchBody = (msg.body || '').toLowerCase().includes(q)
      const matchSender = (msg.sender || '').toLowerCase().includes(q)
      if (!matchTitle && !matchBody && !matchSender) return false
    }

    return true
  })

  // Helper for notification category icon
  const getCategoryIcon = (badge, notifType) => {
    const text = (badge || notifType || '').toLowerCase()
    if (text.includes('order')) return '🛒'
    if (text.includes('review')) return '⭐'
    if (text.includes('customer') || text.includes('user')) return '👤'
    if (text.includes('product') || text.includes('stock')) return '📦'
    if (text.includes('system') || text.includes('alert')) return '📢'
    return '🔔'
  }

  return (
    <div className="messages-container">
      {/* Header Row */}
      <div className="messages-header-bar">
        <div>
          <h1 className="messages-page-title">Admin Messages & Notifications</h1>
          <p className="messages-page-subtitle">Real-time store activities, customer updates, and system alerts</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="btn-mark-all-read" onClick={markAllAsRead}>
            ✓ Mark All as Read
          </button>
          <button type="button" className="btn-refresh-notifs" onClick={fetchNotifications} title="Refresh notifications" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <AppIcon icon={RefreshIcon} size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="messages-stats-grid">
        <div
          className={`messages-stat-card ${readFilter === 'all' ? 'active-card' : ''}`}
          onClick={() => setReadFilter('all')}
          title="Click to view all messages"
        >
          <div className="stat-icon-wrapper blue">
            <AppIcon icon={MessageIcon} size={22} />
          </div>
          <div className="stat-info">
            <span>Total Messages</span>
            <strong>{totalCount}</strong>
          </div>
        </div>

        <div
          className={`messages-stat-card ${readFilter === 'unread' ? 'active-card' : ''}`}
          onClick={() => setReadFilter('unread')}
          title="Click to view unread messages"
        >
          <div className="stat-icon-wrapper orange">
            <AppIcon icon={MailIcon} size={22} />
          </div>
          <div className="stat-info">
            <span>Unread</span>
            <strong>{unreadCount}</strong>
          </div>
        </div>

        <div
          className={`messages-stat-card ${readFilter === 'read' ? 'active-card' : ''}`}
          onClick={() => setReadFilter('read')}
          title="Click to view read messages"
        >
          <div className="stat-icon-wrapper green">
            <AppIcon icon={CheckmarkCircle01Icon} size={22} />
          </div>
          <div className="stat-info">
            <span>Read</span>
            <strong>{readCount}</strong>
          </div>
        </div>
      </div>

      {/* Category Tabs Bar */}
      <div className="category-tabs-bar">
        {['all', 'orders', 'reviews', 'customers', 'products', 'system'].map(cat => (
          <button
            key={cat}
            type="button"
            className={`cat-tab-btn ${categoryFilter === cat ? 'active' : ''}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat === 'all' && 'All Notifications'}
            {cat === 'orders' && '🛒 Orders'}
            {cat === 'reviews' && '⭐ Reviews'}
            {cat === 'customers' && '👤 Customers'}
            {cat === 'products' && '📦 Products'}
            {cat === 'system' && '📢 System'}
          </button>
        ))}
      </div>

      {/* Search & Read Filter Controls */}
      <div className="messages-controls">
        <div className="search-box-wrapper">
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
            <AppIcon icon={SearchIcon} size={16} />
          </span>
          <input
            type="text"
            className="search-input-field"
            placeholder="Search messages by title, customer, body..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <div className="filter-tabs-container">
          <button
            type="button"
            className={`filter-tab-btn ${readFilter === 'all' ? 'active' : ''}`}
            onClick={() => setReadFilter('all')}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${readFilter === 'unread' ? 'active' : ''}`}
            onClick={() => setReadFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${readFilter === 'read' ? 'active' : ''}`}
            onClick={() => setReadFilter('read')}
          >
            Read ({readCount})
          </button>
        </div>
      </div>

      {/* Messages List Container */}
      <div className="messages-list-wrapper">
        {filteredMessages.length > 0 ? (
          filteredMessages.map(msg => (
            <div
              key={msg.id}
              className={`message-item-card ${msg.is_read ? 'read' : 'unread'}`}
              onClick={() => openModal(msg)}
            >
              <div className="message-status-icon">
                <span className="notif-cat-emoji">{getCategoryIcon(msg.category_badge, msg.notification_type)}</span>
              </div>

              <div className="message-main-content">
                <div className="message-header-row">
                  <div className="sender-info-box">
                    <span className="sender-name">{msg.sender}</span>
                    {msg.is_read ? (
                      <span className="unread-status-pill read-badge">READ</span>
                    ) : (
                      <span className="unread-status-pill unread-badge">● UNREAD</span>
                    )}
                  </div>
                  <span className="message-time">{msg.time}</span>
                </div>

                <div className="message-subject">{msg.title}</div>
                <p className="message-preview-text">{msg.body}</p>

                <div className="message-tags-row">
                  <span className="message-tag-pill">{msg.category_badge || 'Notification'}</span>

                  <div className="card-actions-right" onClick={e => e.stopPropagation()}>
                    {!msg.is_read && (
                      <button
                        type="button"
                        className="mark-as-read-btn"
                        onClick={e => markAsRead(msg.id, e)}
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      type="button"
                      className="delete-notif-btn"
                      onClick={e => deleteNotification(msg.id, e)}
                      title="Delete notification"
                      aria-label="Delete notification"
                    >
                      <AppIcon icon={DeleteIcon} size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-messages-state">
            <AppIcon icon={MailIcon} size={48} color="#94a3b8" />
            <h3>No messages found</h3>
            <p>No notifications match your current filter criteria.</p>
          </div>
        )}
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="msg-modal-backdrop" onClick={closeModal}>
          <div className="msg-modal-card" onClick={e => e.stopPropagation()}>
            <div className="msg-modal-top-bar">
              <div className="msg-modal-badges">
                <span className="msg-category-tag">
                  {getCategoryIcon(selectedMessage.category_badge, selectedMessage.notification_type)} {selectedMessage.category_badge || 'Notification'}
                </span>
                <span className="msg-status-badge">✓ Read</span>
              </div>
              <button type="button" className="msg-modal-close-icon" onClick={closeModal} aria-label="Close modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AppIcon icon={CancelIcon} size={18} />
              </button>
            </div>

            <h2 className="msg-modal-title">{selectedMessage.title}</h2>

            <div className="msg-modal-sender-row">
              <div
                className="msg-sender-avatar"
                style={{ background: selectedMessage.sender_color || '#3b82f6' }}
              >
                {selectedMessage.sender_initial || 'M'}
              </div>
              <div className="msg-sender-info">
                <strong className="msg-sender-name">{selectedMessage.sender}</strong>
                <span className="msg-full-date">{selectedMessage.full_date || selectedMessage.time}</span>
              </div>
            </div>

            <div className="msg-modal-body-container">
              <pre className="msg-modal-body-text">{selectedMessage.full_body || selectedMessage.body}</pre>
            </div>

            <div className="msg-modal-footer">
              {selectedMessage.target_url ? (
                <a href={selectedMessage.target_url} className="msg-modal-btn-action">
                  View Details in Admin →
                </a>
              ) : (
                <span className="msg-read-timestamp">✓ Notification Read</span>
              )}
              <button type="button" className="msg-modal-btn-close" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
