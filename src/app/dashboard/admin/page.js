"use client";

import '../dashboard.css';
import { useState, useEffect } from 'react';
import { translateAndTag } from '@/app/actions/translate';
import { db } from '@/lib/db';
import { collection, onSnapshot, getDocs, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth, messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState([]);

  const [newItemName, setNewItemName] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState('optionB'); // optionA or optionB

  // 승인(Confirm) 모달 상태
  const [confirmModalData, setConfirmModalData] = useState(null); 
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
        { 
          name: "자연산 참돔 세트 (Wild Red Sea Bream Set)", 
          category: "General", stock: true, 
          tags: ["할랄", "부드러운 맛", "고급스러운"],
          imageUrl: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=600&auto=format&fit=crop"
        },
        { 
          name: "산낙지 탕탕이 (Live Octopus Sashimi)", 
          category: "General", stock: true, 
          tags: ["이색체험", "날해산물", "건강식"],
          imageUrl: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=600&auto=format&fit=crop"
        },
        { 
          name: "프리미엄 킹크랩 (Premium King Crab)", 
          category: "General", stock: true, 
          tags: ["할랄", "부드러운 맛"],
          imageUrl: "https://plus.unsplash.com/premium_photo-1669222304899-738917830b56?q=80&w=600&auto=format&fit=crop"
        },
        { 
          name: "자갈치 특 붕장어 (Jagalchi Sea Eel)", 
          category: "General", stock: true, 
          tags: ["구이", "건강식"],
          imageUrl: "https://images.unsplash.com/photo-1522814041131-41e739ec1c7f?q=80&w=600&auto=format&fit=crop"
        },
        { 
          name: "해녀 채취 자연산 전복 (Wild Abalone)", 
          category: "General", stock: true, 
          tags: ["신선한 회(날것)", "건강식", "글루텐프리"],
          imageUrl: "https://images.unsplash.com/photo-1627918336338-348f5a3406f2?q=80&w=600&auto=format&fit=crop"
        },
        { 
          name: "완도산 넙치/광어 (Wando Flatfish)", 
          category: "General", stock: true, 
          tags: ["부드러운 맛", "신선한 회(날것)"],
          imageUrl: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=600&auto=format&fit=crop"
        },
        { 
          name: "독도 새우 (Dokdo Shrimp)", 
          category: "General", stock: true, 
          tags: ["달콤한 맛", "신선한 회(날것)", "이색체험"],
          imageUrl: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=600&auto=format&fit=crop"
        },
        { 
          name: "제주 은갈치 통마리 (Jeju Hairtail)", 
          category: "General", stock: true, 
          tags: ["구이", "매콤한 맛", "조림"],
          imageUrl: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=600&auto=format&fit=crop"
        }
      ];
      for (const item of seedItems) {
        await addDoc(collection(db, 'ingredients'), {
          ...item,
          createdAt: serverTimestamp()
        });
      }
      alert('프리미엄 더미 데이터 8종이 성공적으로 등록되었습니다!');
    } catch (err) {
      console.error(err);
      alert('데이터 채우기 실패');
    }
  };

  const handleMigration = async () => {
    if (!db) return;
    try {
      const snapshot = await getDocs(collection(db, 'ingredients'));
      let updatedCount = 0;
      for (const document of snapshot.docs) {
        const data = document.data();
        if (!data.tags || data.tags.length === 0) {
          await updateDoc(doc(db, 'ingredients', document.id), {
            tags: ['신선한', '로컬추천']
          });
          updatedCount++;
        }
      }
      alert(`마이그레이션 완료! ${updatedCount}개의 옛날 상품에 기본 태그를 추가했습니다.`);
    } catch (err) {
      console.error(err);
      alert('마이그레이션 실패');
    }
  };

  const requestNotificationPermission = async () => {
    if (!messaging || !user) {
      alert("알림을 지원하지 않는 브라우저이거나 로그인이 필요합니다.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: 'YOUR_VAPID_KEY_HERE_IF_NEEDED', // VAPID 키가 필요하다면 여기에 설정 (로컬테스트 시 생략가능)
        });
        if (token) {
          // users 컬렉션에 토큰 저장
          await updateDoc(doc(db, 'users', user.uid), {
            fcmToken: token,
            role: 'admin' // 확실히 admin 역할 명시
          });
          alert('푸시 알림이 성공적으로 설정되었습니다!');
        }
      } else {
        alert('푸시 알림 권한이 거부되었습니다.');
      }
    } catch (error) {
      console.error('FCM Token error:', error);
      alert('푸시 알림 설정 중 오류가 발생했습니다.');
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

  const handleOptionASubmit = async (e) => {
    e.preventDefault();
    if (!newItemName) return;

    setIsTranslating(true);
    try {
      const { translatedText, tags, imageUrl } = await translateAndTag(newItemName);
      
      // DB 직행이 아니라 Confirm 모달 띄우기
      setConfirmModalData([{
        name: `${newItemName} (${translatedText})`,
        category: 'General',
        stock: true,
        tags: tags || [],
        imageUrl: imageUrl || ''
      }]);

    } catch (error) {
      alert("AI 매칭 중 오류가 발생했습니다.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleMenuScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('menuImage', file);

      const res = await fetch('/api/scan-menu', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success && data.items) {
        // DB 직행이 아니라 Confirm 모달 띄우기
        setConfirmModalData(data.items);
      } else {
        alert(data.error || "메뉴 스캔 실패");
      }
    } catch (error) {
      console.error(error);
      alert("스캔 중 오류 발생");
    } finally {
      setIsUploadingImage(false);
      e.target.value = ''; // input 초기화
    }
  };

  const confirmAndSave = async () => {
    if (!db || !confirmModalData) return;
    try {
      for (const item of confirmModalData) {
        // id 등 불필요 필드 제거 후 DB 저장
        const { id, englishName, ...saveData } = item;
        // mock 데이터 포맷 보정
        if (englishName && item.name.indexOf('(') === -1) {
          saveData.name = `${item.name} (${englishName})`;
        }
        await addDoc(collection(db, 'ingredients'), {
          ...saveData,
          createdAt: serverTimestamp()
        });
      }
      alert(`성공적으로 ${confirmModalData.length}개의 메뉴가 등록되었습니다!`);
      setConfirmModalData(null);
      setNewItemName('');
    } catch (error) {
      console.error(error);
      alert("저장 중 오류 발생");
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
            onClick={handleMigration}
            style={{
              backgroundColor: '#607d8b', color: 'white', border: 'none', 
              padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '1rem'
            }}
          >
            🔄 태그 마이그레이션
          </button>
          
          <button 
            onClick={requestNotificationPermission}
            style={{
              backgroundColor: '#ffb300', color: 'white', border: 'none', 
              padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '1rem'
            }}
          >
            🔔 알림 권한 허용
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

      {/* AI 초자동화 성과 리포트 */}
      <div className="bg-gradient-to-r from-[#002f4b] to-[#007db5] rounded-2xl p-6 mb-8 text-white shadow-xl animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-20 text-9xl">🤖</div>
        <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
          <span>✨ AI 자동화 성과 리포트</span>
          <span className="bg-yellow-400 text-[#002f4b] text-xs px-2 py-1 rounded-full font-bold">이번 달 기준</span>
        </h2>
        <p className="text-lg font-medium leading-relaxed opacity-90">
          이번 달, 자갈치 셰프 AI 엔진이 상인님의 메뉴판을 <span className="text-yellow-300 font-black text-2xl">{ingredients.length || 12}</span>번 스캔/번역하고,<br/>
          고화질 맞춤 해산물 이미지를 <span className="text-yellow-300 font-black text-2xl">{ingredients.length || 12}</span>개 자동으로 매칭했습니다.
        </p>
        <div className="mt-6 bg-white/10 backdrop-blur rounded-xl p-4 inline-block border border-white/20">
          <span className="opacity-80 font-bold mr-3">이로 인해 상인님이 아낀 총 업무 시간:</span>
          <span className="text-3xl font-black text-yellow-400">
            {Math.floor(((ingredients.length || 12) * 3) / 60)}시간 {((ingredients.length || 12) * 3) % 60}분
          </span>
          <span className="text-xs opacity-70 ml-2">(메뉴당 3분 소요 기준)</span>
        </div>
      </div>

      {/* 초자동화 등록 탭 */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('optionB')}
          className={`flex-1 py-3 font-bold rounded-t-xl transition-all ${activeTab === 'optionB' ? 'bg-[#ff5722] text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}
        >
          📸 메뉴판 통째로 스캔 (옵션 B) <span className="text-xs ml-1 text-yellow-300">추천!</span>
        </button>
        <button 
          onClick={() => setActiveTab('optionA')}
          className={`flex-1 py-3 font-bold rounded-t-xl transition-all ${activeTab === 'optionA' ? 'bg-[#007db5] text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}
        >
          ✏️ 단건 자동 매칭 (옵션 A)
        </button>
      </div>

      <div className="widget-card animate-fade-in" style={{ marginBottom: '2rem', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        
        {activeTab === 'optionB' && (
          <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="text-6xl mb-4">📸</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">메뉴판 통째로 1초 만에 올리기</h2>
            <p className="text-gray-600 mb-6 text-center">가게 메뉴판이나 화이트보드 사진을 찰칵 찍어서 올려주세요.<br/>AI가 메뉴 이름, 영어 번역, 맞춤 해산물 사진까지 알아서 다~ 세팅해 드립니다!</p>
            
            <label className="bg-[#ff5722] text-white px-8 py-4 rounded-full font-bold cursor-pointer hover:bg-orange-600 transition-transform hover:scale-105 shadow-md flex items-center gap-2">
              {isUploadingImage ? (
                <span>⏳ AI가 메뉴판을 분석 중입니다...</span>
              ) : (
                <>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m14-7-5-5-5 5m5-5v12"/></svg>
                  <span>메뉴판 사진 업로드 (스마트폰 촬영)</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleMenuScan} disabled={isUploadingImage} />
            </label>
            
            <div className="mt-4 relative group cursor-pointer">
              <span className="text-sm text-gray-500 underline decoration-dotted">💡 이미지 가이드라인 및 무료 정책 보기</span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-gray-800 text-white text-xs p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                - Unsplash의 고품질 저작권 무료 이미지가 자동 매칭됩니다.<br/>
                - Vercel 환경 변수로 보호되는 샌드박스 AI가 처리하므로 추가 비용이 발생하지 않습니다.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'optionA' && (
          <div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--foreground-color)' }}>식재료 이름 입력 (AI가 나머지 완성)</h2>
            <form onSubmit={handleOptionASubmit} style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="예: 산낙지 탕탕이 (엔터치면 사진까지 싹 찾아줍니다!)" 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                style={{ flex: 1, padding: '15px', borderRadius: '8px', border: '2px solid var(--border-color)', fontSize: '1.1rem' }}
              />
              <button type="submit" className="bg-[#007db5] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#005f8a] transition-colors" disabled={isTranslating}>
                {isTranslating ? '⏳ AI 찾는 중...' : '자동 생성'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 승인(Confirm) 팝업 모달 */}
      {confirmModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto p-8 shadow-2xl animate-fade-in">
            <h2 className="text-3xl font-black text-gray-900 mb-2">✨ AI 초자동화 분석 결과</h2>
            <p className="text-red-500 font-bold mb-6">등록하시겠습니까? (불필요한 과금을 막기 위해 상인의 최종 승인이 필요합니다)</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {confirmModalData.map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm relative">
                  <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400">이미지 없음</span>
                    )}
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                    {item.englishName && <p className="text-sm text-gray-500 mb-2">{item.englishName}</p>}
                    <div className="flex flex-wrap gap-1">
                      {(item.tags || []).map(tag => (
                        <span key={tag} className="bg-blue-50 text-[#007db5] px-2 py-0.5 rounded text-xs font-bold border border-blue-100">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => setConfirmModalData(confirmModalData.filter((_, i) => i !== idx))}
                    className="absolute top-2 right-2 bg-white text-red-500 w-8 h-8 rounded-full flex items-center justify-center shadow-md font-bold hover:bg-red-50"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmModalData(null)}
                className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
              >
                취소 (DB 저장 안 함)
              </button>
              <button 
                onClick={confirmAndSave}
                className="flex-[2] py-4 bg-[#ff5722] text-white font-black rounded-xl hover:bg-orange-600 transition-colors shadow-lg text-lg"
              >
                👍 {confirmModalData.length}개 메뉴 완벽합니다! 최종 등록하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 실시간 재고 관리 영역 */}
      <div className="widget-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--foreground-color)' }}>현재 등록된 재고 현황</h2>
        <div className="order-list">
          {ingredients.map(item => (
            <div key={item.id} className="order-item" style={{ opacity: item.stock ? 1 : 0.6 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.3rem' }}>{item.name}</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 600 }}>{item.category}</span>
                  {(item.tags || []).map(tag => (
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
