"use client";

import '../dashboard.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

export default function ChefDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  
  // 권한 우회 및 실시간 데이터 로드
  useEffect(() => {
    if (!db || !user) return;

    // 시연을 위해 셰프 권한 자동 부여
    setDoc(doc(db, 'users', user.uid), { role: 'chef' }, { merge: true }).catch(console.error);

    const unsubscribe = onSnapshot(collection(db, 'reservations'), (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      // 최신 예약순 정렬 (혹은 상태별 정렬)
      items.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setReservations(items);
    });

    return () => unsubscribe();
  }, [user]);

  const activeTables = reservations.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length;

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'reservations', id), { status: newStatus });
    } catch (err) {
      console.error(err);
      alert('상태 업데이트 실패');
    }
  };
  
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
        <h1>셰프 대시보드 (자갈치 셰프)</h1>
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
          <span style={{ fontWeight: 600 }}>상태:</span>
          <div className="traffic-dot active-yellow"></div>
          <span>요리 준비 중</span>
          <button 
            onClick={handleLogout}
            style={{
              backgroundColor: '#ff5722', color: 'white', border: 'none', 
              padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '1rem'
            }}
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="widget-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="widget-card">
          <div className="widget-title">활성 테이블</div>
          <div className="widget-value">{activeTables}</div>
          <div className="traffic-light-container">
            <div className={`traffic-dot ${activeTables > 5 ? 'active-red' : activeTables > 2 ? 'active-yellow' : 'active-green'}`}></div>
            <span className="status-label">
              {activeTables > 5 ? '매우 바쁨' : activeTables > 2 ? '바쁨' : '여유로움'}
            </span>
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-title">특별 요구 사항 요약</div>
          <div className="widget-value" style={{ fontSize: '1.5rem', marginTop: '1rem' }}>
            <span style={{ color: 'var(--primary-color)' }}>할랄 (Halal)</span> / 글루텐프리
          </div>
          <p style={{ color: '#666', marginTop: 'auto' }}>교차 오염에 각별히 주의해 주십시오.</p>
        </div>
      </div>

      <div className="widget-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--foreground-color)' }}>요리 대기열 (실시간 연동)</h2>
        <div className="order-list">
          {reservations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
              현재 접수된 예약이 없습니다.
            </div>
          ) : (
            reservations.map((req) => (
              <div key={req.id} className="order-item" style={{ opacity: req.status === 'completed' || req.status === 'cancelled' ? 0.6 : 1 }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary-color)', marginRight: '10px' }}>
                    {req.id.slice(0, 8)}...
                  </span>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{req.ingredientName || '해산물 코스 요리'}</span>
                  {req.tags && req.tags.length > 0 && (
                    <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#666' }}>
                      ({req.tags.join(', ')})
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ color: '#888', fontSize: '0.9rem' }}>금액: ₩{req.amount?.toLocaleString()}</span>
                  
                  {/* 상태 변경 버튼들 */}
                  {req.status === 'chef_assigned' && (
                    <button onClick={() => updateStatus(req.id, 'confirmed')} style={{ padding: '6px 12px', borderRadius: '15px', border: '1px solid #ffb300', background: '#fff', color: '#ffb300', cursor: 'pointer', fontWeight: 'bold' }}>
                      요리 시작하기
                    </button>
                  )}
                  {req.status === 'confirmed' && (
                    <button onClick={() => updateStatus(req.id, 'completed')} style={{ padding: '6px 12px', borderRadius: '15px', border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                      요리 완료
                    </button>
                  )}
                  
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    backgroundColor: req.status === 'completed' ? '#4caf50' : req.status === 'confirmed' ? 'var(--primary-color)' : req.status === 'chef_assigned' ? '#ffb300' : '#ddd',
                    color: req.status === 'Pending' ? '#333' : '#fff'
                  }}>
                    {req.status === 'completed' ? '완료됨' : 
                     req.status === 'confirmed' ? '요리 중' : 
                     req.status === 'chef_assigned' ? '준비 대기' : 
                     req.status === 'cancelled' ? '취소됨' : req.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
