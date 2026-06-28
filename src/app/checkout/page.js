"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { transitionReservationState } from '@/lib/db';
import { db } from '@/lib/db';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import '../onboarding/onboarding.css'; // 재사용 가능한 CSS

export default function Checkout() {
  const router = useRouter();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [reservationStatus, setReservationStatus] = useState('chef_assigned'); // 임시 초기 상태

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // 모의 결제 프로세스 지연 (1초)
    setTimeout(async () => {
      try {
        // 백엔드 통신: 실제 Firestore에 예약 데이터 저장
        if (db) {
          await addDoc(collection(db, 'reservations'), {
            touristId: user?.uid || 'guest',
            status: 'confirmed',
            amount: 50.00,
            createdAt: serverTimestamp()
          });
        }
        
        setReservationStatus('confirmed');
        setIsProcessing(false);
        
        alert('결제가 성공적으로 완료되었습니다! 예약이 확정(Confirmed) 되었습니다.');
        
        // 결제 완료 후 메인 마켓플레이스로 돌아가기
        router.push('/marketplace'); 
      } catch (error) {
        console.error("Reservation error:", error);
        alert('예약 처리 중 오류가 발생했습니다.');
        setIsProcessing(false);
      }
    }, 1000);
  };

  return (
    <div className="onboarding-container" style={{ justifyContent: 'center' }}>
      <div className="card animate-fade-in step-card" style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem', fontSize: '2rem' }}>Reservation Deposit</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Secure your culinary experience at Jagalchi Market.</p>
        
        <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600 }}>Total Deposit (No-Show Protection):</span>
            <span style={{ fontWeight: 'bold', color: 'var(--foreground-color)' }}>$50.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600 }}>Current Status:</span>
            <span style={{ 
              color: reservationStatus === 'confirmed' ? 'var(--secondary-color)' : '#ffb300',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {reservationStatus}
            </span>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '1rem 0' }} />
          <p style={{ fontSize: '0.85rem', color: '#888' }}>
            * This deposit will be deducted from your final bill. 
            Once paid, the state machine securely transitions your booking to 'Confirmed'.
          </p>
        </div>

        <button 
          className="btn-primary" 
          onClick={handlePayment} 
          disabled={isProcessing || reservationStatus === 'confirmed'}
          style={{ width: '100%', fontSize: '1.2rem', padding: '16px' }}
        >
          {isProcessing ? 'Processing Payment...' : reservationStatus === 'confirmed' ? 'Payment Completed' : 'Pay with Stripe'}
        </button>
      </div>
    </div>
  );
}
