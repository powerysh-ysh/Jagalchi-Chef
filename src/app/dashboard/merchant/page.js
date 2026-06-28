"use client";

import '../dashboard.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function MerchantDashboard() {
  const router = useRouter();
  const [trustScore] = useState(92);
  const [activeOrders] = useState(5);
  
  // Dummy data for Market Trust Score over past 5 days
  const chartData = [60, 75, 80, 85, 92];

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
        <h1>Merchant Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={() => router.push('/dashboard/admin')}
            style={{
              backgroundColor: '#ffb300', color: '#fff', border: 'none', 
              padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            🛠️ 어드민 (재고 등록)
          </button>
          <span style={{ fontWeight: 600 }}>Status:</span>
          <div className="traffic-dot active-green"></div>
          <span>Accepting Orders</span>
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
          <div className="widget-title">Active Orders</div>
          <div className="widget-value">{activeOrders}</div>
          <div className="traffic-light-container">
            <div className={`traffic-dot ${activeOrders > 10 ? 'active-red' : activeOrders > 5 ? 'active-yellow' : 'active-green'}`}></div>
            <span className="status-label">
              {activeOrders > 10 ? 'Busy' : activeOrders > 5 ? 'Moderate' : 'Optimal'}
            </span>
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-title">Market Trust Score</div>
          <div className="widget-value" style={{ color: 'var(--secondary-color)' }}>{trustScore}%</div>
          <div className="trust-score-chart">
            {chartData.map((val, idx) => (
              <div key={idx} className="chart-bar" style={{ height: `${val}%`, backgroundColor: idx === 4 ? 'var(--secondary-color)' : 'var(--primary-color)' }}></div>
            ))}
          </div>
        </div>
        
        <div className="widget-card">
          <div className="widget-title">Today's Trending Ingredient</div>
          <div className="widget-value" style={{ fontSize: '2rem', marginTop: '1rem' }}>🦞 Lobster</div>
          <p style={{ color: '#666', marginTop: 'auto' }}>High demand from Halal & Pescatarian profiles.</p>
        </div>
      </div>

      <div className="widget-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--foreground-color)' }}>Recent Ingredient Requests</h2>
        <div className="order-list">
          {[
            { id: '#REQ-1021', item: 'Fresh Sea Bream (Halal Prepared)', time: '5 mins ago', status: 'Pending' },
            { id: '#REQ-1020', item: 'Live Octopus (Adventurous)', time: '12 mins ago', status: 'Preparing' },
            { id: '#REQ-1019', item: 'Abalone (Gluten-Free meal)', time: '28 mins ago', status: 'Completed' },
          ].map((req) => (
            <div key={req.id} className="order-item">
              <div>
                <span style={{ fontWeight: 'bold', color: 'var(--primary-color)', marginRight: '10px' }}>{req.id}</span>
                <span>{req.item}</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ color: '#888', fontSize: '0.9rem' }}>{req.time}</span>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: req.status === 'Completed' ? 'var(--secondary-color)' : req.status === 'Preparing' ? '#ffb300' : '#ddd',
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
