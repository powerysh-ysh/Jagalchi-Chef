"use client";

import '../dashboard.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ChefDashboard() {
  const router = useRouter();
  const [activeTables] = useState(3);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header animate-fade-in">
        <h1>Chef Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={() => router.push('/marketplace')}
            style={{
              backgroundColor: '#007db5', color: '#fff', border: 'none', 
              padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            🛒 마켓플레이스 구경가기
          </button>
          <span style={{ fontWeight: 600 }}>Status:</span>
          <div className="traffic-dot active-yellow"></div>
          <span>Busy Preparing</span>
          <button 
            onClick={handleLogout}
            style={{
              backgroundColor: '#ff5722', color: 'white', border: 'none', 
              padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '1rem'
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="widget-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="widget-card">
          <div className="widget-title">Active Tables</div>
          <div className="widget-value">{activeTables}</div>
          <div className="traffic-light-container">
            <div className={`traffic-dot ${activeTables > 5 ? 'active-red' : activeTables > 2 ? 'active-yellow' : 'active-green'}`}></div>
            <span className="status-label">
              {activeTables > 5 ? 'Overwhelmed' : activeTables > 2 ? 'Busy' : 'Available'}
            </span>
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-title">Special Requirements</div>
          <div className="widget-value" style={{ fontSize: '1.5rem', marginTop: '1rem' }}>
            <span style={{ color: 'var(--primary-color)' }}>2 Halal</span> / 1 Gluten-Free
          </div>
          <p style={{ color: '#666', marginTop: 'auto' }}>Be careful with cross-contamination.</p>
        </div>
      </div>

      <div className="widget-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--foreground-color)' }}>Cooking Queue</h2>
        <div className="order-list">
          {[
            { id: '#ORD-992', menu: 'Spicy Grilled Sea Bream (Halal)', time: 'Table 4', status: 'Cooking' },
            { id: '#ORD-993', menu: 'Live Octopus Sashimi', time: 'Table 2', status: 'Preparing' },
            { id: '#ORD-994', menu: 'Abalone Porridge (Gluten-Free)', time: 'Table 5', status: 'Pending' },
          ].map((req) => (
            <div key={req.id} className="order-item">
              <div>
                <span style={{ fontWeight: 'bold', color: 'var(--primary-color)', marginRight: '10px' }}>{req.id}</span>
                <span>{req.menu}</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ color: '#888', fontSize: '0.9rem' }}>{req.time}</span>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: req.status === 'Cooking' ? 'var(--primary-color)' : req.status === 'Preparing' ? '#ffb300' : '#ddd',
                  color: req.status === 'Pending' ? '#333' : '#fff'
                }}>
                  {req.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
