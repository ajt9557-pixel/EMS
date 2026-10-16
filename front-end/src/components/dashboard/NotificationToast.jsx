import React from 'react'
import { useNotifications } from '../../context/NotificationContext'
import { NotificationItem } from '../../notification/noti'

const NotificationToast = () => {
  const { toasts, dismissToast } = useNotifications()

  if (!toasts || toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <div key={t._id} className="pointer-events-auto">
          <NotificationItem
            id={t._id}
            title={t.title}
            message={t.message}
            variant={t.variant}
            read={false}
            createdAt={t.createdAt}
            onClose={dismissToast}
          />
        </div>
      ))}
    </div>
  )
}

export default NotificationToast
