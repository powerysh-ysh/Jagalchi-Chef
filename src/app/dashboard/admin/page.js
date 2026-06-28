"use client";

import '../dashboard.css';
import { useState, useEffect } from 'react';
import { translateAndTag } from '@/app/actions/translate';
import { db } from '@/lib/db';
import { collection, onSnapshot, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function AdminDashboard() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState([]);

  const [newItemName, setNewItemName] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSeedData = async () => {
    if (!db) return;
    try {
      const seedItems = [
        { name: "자연산 참돔 세트 (Wild Red Sea Bream Set)", category: "General", stock: true, tags: ["할랄", "부드러운 맛"] },
        { name: "산낙지 탕탕이 (Live Octopus Sashimi)", category: "General", stock: true, tags: ["이색체험", "날해산물"] },
        { name: "프리미엄 전복죽 (Premium Abalone Porridge)", category: "General", stock: true, tags: ["글루텐프리", "건강식"] }
      ];
      for (const item of seedItems) {
        await addDoc(collection(db, 'ingredients'), {
          ...item,
          createdAt: serverTimestamp()
        });
      }
      alert('더미 데이터 3종이 성공적으로 등록되었습니다!');
    } catch (err) {
      console.error(err);
      alert('데이터 채우기 실패');
    }
  };

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, 'ingredients'), (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      // createdAt 기준으로 정렬 (가장 최근 등록된 것이 먼저)
      items.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setIngredients(items);
    });
    return () => unsubscribe();
  }, []);

  const toggleStock = async (id, currentStock) => {
    if (!db) return;
    try {
      const itemRef = doc(db, 'ingredients', id);
      await updateDoc(itemRef, { stock: !currentStock });
    } catch (err) {
      console.error(err);
      alert('재고 상태 업데이트 실패');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName) return;

    setIsTranslating(true);
    try {
      // Server Action을 호출하여 번역 및 태그 결과 받아오기
      const { translatedText, tags } = await translateAndTag(newItemName);

      if (db) {
        await addDoc(collection(db, 'ingredients'), {
          name: `${newItemName} (${translatedText})`,
          category: 'General',
          stock: true,
          tags: tags,
          createdAt: serverTimestamp()
        });
      }

      setNewItemName('');
    } catch (error) {
      alert("번역 처리 중 오류가 발생했습니다.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header animate-fade-in">
        <h1>상인 재고 관리 어드민</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={() => window.location.href = '/marketplace'}
            style={{
              backgroundColor: '#007db5', color: 'white', border: 'none', 
              padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            🛒 마켓플레이스로 이동
          </button>
          <span style={{ fontWeight: 600 }}>동기화 상태:</span>
          <div className="traffic-dot active-green"></div>
          <span>클라우드 DB 활성화</span>
          
          <button 
            onClick={handleSeedData}
            style={{
              backgroundColor: '#4caf50', color: 'white', border: 'none', 
              padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '1rem'
            }}
          >
            🌱 더미 데이터 채우기
          </button>
          
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

      {/* 상품 등록 영역 */}
      <div className="widget-card animate-fade-in" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--foreground-color)' }}>새로운 식재료 등록</h2>
        <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="상품명 입력 (예: 자연산 광어)" 
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '1rem'
            }}
          />
          <button type="submit" className="btn-primary" disabled={isTranslating} style={{ minWidth: '150px' }}>
            {isTranslating ? '번역 중...' : '상품 등록'}
          </button>
        </form>
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
          * 한국어로 입력하시면 Cloud Functions를 통해 다국어 태그가 자동으로 매핑됩니다.
        </p>
      </div>

      {/* 실시간 재고 관리 영역 */}
      <div className="widget-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--foreground-color)' }}>현재 등록된 재고 현황</h2>
        <div className="order-list">
          {ingredients.map(item => (
            <div key={item.id} className="order-item" style={{ opacity: item.stock ? 1 : 0.6 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.3rem' }}>{item.name}</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 600 }}>{item.category}</span>
                  {item.tags.map(tag => (
                    <span key={tag} style={{ backgroundColor: '#eee', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', color: '#555' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: item.stock ? 'var(--secondary-color)' : '#999' }}>
                  {item.stock ? '판매중' : '품절'}
                </span>
                <button 
                  onClick={() => toggleStock(item.id, item.stock)}
                  style={{
                    backgroundColor: item.stock ? '#ffebee' : '#e8f5e9',
                    color: item.stock ? '#e53935' : '#4caf50',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  {item.stock ? '품절 처리' : '재입고'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
