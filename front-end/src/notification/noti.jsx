import React from 'react'
import { useNotifications } from '../context/NotificationContext'
import { useNavigate } from 'react-router-dom'

const variantConfig = {
  default: {
    icon: null,
    iconColor: '',
  },
  success: {
    iconColor: 'text-green-600',
    path: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-3.54-4.46a1 1 0 0 1 1.42-1.42 3 3 0 0 0 4.24 0 1 1 0 0 1 1.42 1.42 5 5 0 0 1-7.08 0zM9 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z',
  },
  error: {
    iconColor: 'text-red-600',
    path: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-3.54-4.54a5 5 0 0 1 7.08 0 1 1 0 0 1-1.42 1.42 3 3 0 0 0-4.24 0 1 1 0 0 1-1.42-1.42zM9 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z',
  },
  warning: {
    iconColor: 'text-orange-500',
    path: 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z',
  },
  info: {
    iconColor: 'text-blue-600',
    path: 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z',
  },
}

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M16.24 14.83a1 1 0 0 1-1.41 1.41L12 13.41l-2.83 2.83a1 1 0 0 1-1.41-1.41L10.59 12 7.76 9.17a1 1 0 0 1 1.41-1.41L12 10.59l2.83-2.83a1 1 0 0 1 1.41 1.41L13.41 12l2.83 2.83z"
    />
  </svg>
)

const VariantIcon = ({ variant }) => {
  const config = variantConfig[variant]
  if (!config?.path) return null
  return (
    <svg
      className={`fill-current shrink-0 ${config.iconColor}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
    >
      <path d={config.path} />
    </svg>
  )
}

export const NotificationItem = ({ id, title, message, variant = 'default', onClose, read, createdAt, link, onClick }) => {
  return (
    <div
      role="alert"
      aria-live="polite"
      onClick={onClick}
      className={`shadow-lg rounded-lg bg-white dark:bg-gray-800 border w-full max-w-sm p-4 flex gap-3 animate-[fadeIn_0.2s_ease-out] transition-colors ${read === false ? 'border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-900/10' : 'border-gray-100 dark:border-gray-700'} ${link ? 'cursor-pointer hover:shadow-xl' : ''}`}
    >
      {variant !== 'default' && (
        <div className="pt-0.5">
          <VariantIcon variant={variant} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h4 className={`text-sm leading-5 truncate pr-2 ${read === false ? 'font-bold text-gray-900 dark:text-gray-100' : 'font-semibold text-gray-800 dark:text-gray-100'}`}>
            {title}
          </h4>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose?.(id) }}
            aria-label={`Dismiss ${title} notification`}
            className="shrink-0 -mt-0.5 -mr-1 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700/60 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <CloseIcon />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 tracking-tight leading-5 mt-1 break-words">
          {message}
        </p>
        {createdAt && (
          <p className="text-xs text-gray-400 mt-1.5">{new Date(createdAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  )
}

const Noti = () => {
  const { notifications, unreadCount, loading, markRead, markAllRead, dismiss, fetchNotifications } = useNotifications()
  const navigate = useNavigate()

  const handleClose = (id) => dismiss(id)
  const handleItemClick = (n) => {
    if (!n.read) markRead(n._id || n.id)
    if (n.link) navigate(n.link)
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-[320px] p-8 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading notifications…</p>
      </div>
    )
  }

  return (
    <div className="min-h-[320px] p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Notifications {unreadCount > 0 && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white">{unreadCount} new</span>}</h2>
          <div className="flex gap-2">
            <button onClick={fetchNotifications} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800">Refresh</button>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700">Mark all read</button>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          {notifications.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 w-full">
              <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
              <p className="text-xs text-gray-400 mt-1">Leave requests and approvals will appear here</p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n._id || n.id}
                id={n._id || n.id}
                title={n.title}
                message={n.message}
                variant={n.variant}
                read={n.read}
                createdAt={n.createdAt}
                link={n.link}
                onClose={handleClose}
                onClick={() => handleItemClick(n)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Noti
