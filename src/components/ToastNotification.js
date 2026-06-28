"use client";

import { useEffect, useState } from 'react';
import { onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';

export default function ToastNotification() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!messaging) return;

    try {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('포그라운드 메시지 수신:', payload);
        setNotification({
          title: payload.notification?.title || 'New Notification',
          body: payload.notification?.body || '',
        });

        // 5초 후 자동 숨김
        setTimeout(() => {
          setNotification(null);
        }, 5000);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("FCM onMessage Error:", e);
    }
  }, []);

  if (!notification) return null;

  return (
    <div className="toast-container animate-fade-in" style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: 'var(--surface-color)',
      border: '1px solid var(--secondary-color)',
      borderRadius: 'var(--radius)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      padding: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      maxWidth: '350px'
    }}>
      <div style={{
        backgroundColor: 'var(--secondary-color)',
        color: 'white',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        🥬
      </div>
      <div>
        <h4 style={{ margin: 0, color: 'var(--secondary-color)', marginBottom: '0.25rem' }}>{notification.title}</h4>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--foreground-color)' }}>{notification.body}</p>
      </div>
      <button 
        onClick={() => setNotification(null)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.2rem',
          cursor: 'pointer',
          color: '#aaa',
          marginLeft: 'auto'
        }}
      >
        ×
      </button>
    </div>
  );
}
