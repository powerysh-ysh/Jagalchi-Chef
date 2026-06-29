"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { db } from '@/lib/db';
import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import '../globals.css';

const ALL_TAGS = ['할랄', '부드러운 맛', '이색체험', '날해산물', '글루텐프리', '건강식', '매운맛', '전통체험'];

const data = {
  ko: {
    title: "상인이 고른 바다의 신선함,\n전문 셰프가 완성하는 미식.",
    subtitle: "프리미엄 3자 중개 미식 플랫폼",
    desc: "자갈치 시장의 거친 생명력을 당신의 식탁으로 0.1초 만에 배달합니다.",
    nav1: "프로그램",
    nav2: "미식체험",
    tasteTitle: "당신의 미식 취향은 무엇인가요?",
    tasteDesc: "선택하신 취향에 맞는 최고의 식재료와 셰프를 매칭해 드립니다.",
    step1Title: "싱싱한 원물을 고르세요 (상인 직판)",
    step1Desc: "자갈치 시장 상인들이 직접 올린 오늘의 최고급 해산물입니다.",
    step2Title: "원물을 요리해 줄 셰프를 매칭하세요",
    step2Desc: "고르신 해산물을 최고의 요리로 탄생시킬 초장집/전문 셰프 목록입니다.",
    step2Warning: "먼저 1단계에서 해산물을 선택해주세요!",
    step2WarningDesc: "해산물(원물)을 선택하시면, 해당 식재료를 가장 잘 다루는\n일식/한식 전문 셰프 리스트가 이곳에 자동으로 나타납니다.",
    reserveBtn: "선택하기",
    merchantPrice: "상인 직판가",
    currentPrice: "시가"
  },
  en: {
    title: "Freshness from Merchants,\nGastronomy by Chefs.",
    subtitle: "Premium 3-Way Mediation Platform",
    desc: "Delivering the raw vitality of Jagalchi Market to your table in 0.1 seconds.",
    nav1: "Programs",
    nav2: "Culinary Experience",
    tasteTitle: "What is your culinary preference?",
    tasteDesc: "We will match you with the best ingredients and chefs based on your taste.",
    step1Title: "Select Fresh Ingredients (Merchant Direct)",
    step1Desc: "Today's premium seafood listed directly by Jagalchi Market merchants.",
    step2Title: "Match a Chef to cook your ingredients",
    step2Desc: "List of expert chefs ready to transform your seafood into a masterpiece.",
    step2Warning: "Please select your seafood in Step 1 first!",
    step2WarningDesc: "Once you select your seafood, a list of specialized chefs\nwill automatically appear here.",
    reserveBtn: "Select",
    merchantPrice: "Direct Price",
    currentPrice: "Market Price"
  }
}

export default function Marketplace() {
  const router = useRouter();
  const [lang, setLang] = useState('ko');
  const { user, role, loading } = useAuth();
  const [ingredients, setIngredients] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [userPreferencesLoaded, setUserPreferencesLoaded] = useState(false);

  // 유저의 기존 취향(Preferences) 실시간 연동 (Single Source of Truth)
  useEffect(() => {
    if (!user || !db) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists() && docSnap.data().preferences) {
        setSelectedTags(docSnap.data().preferences);
      }
      setUserPreferencesLoaded(true);
    }, (err) => {
      console.error("Preferences load error:", err);
      setUserPreferencesLoaded(true);
    });
    return () => unsubscribe();
  }, [user]);

  // 상품 목록 불러오기 및 가중치 매칭(Weight-based Matching) 정렬
  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, 'ingredients'), (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        if (doc.data().stock !== false) {
          items.push({ id: doc.id, ...doc.data() });
        }
      });
      
      // 안티그래비티 린 알고리즘: 태그 일치도 기반 정렬
      items.sort((a, b) => {
        if (selectedTags.length > 0) {
          const aScore = (a.tags || []).filter(t => selectedTags.includes(t)).length;
          const bScore = (b.tags || []).filter(t => selectedTags.includes(t)).length;
          if (aScore !== bScore) {
            return bScore - aScore; // 점수가 높은 순(내림차순)
          }
        }
        // 점수가 같거나 선택된 태그가 없으면 최신순
        return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
      });
      
      setIngredients(items);
    });
    return () => unsubscribe();
  }, [selectedTags]); // selectedTags가 바뀔 때마다 재정렬

  const toggleTag = async (tag) => {
    const newTags = selectedTags.includes(tag) 
      ? selectedTags.filter(t => t !== tag) 
      : [...selectedTags, tag];
      
    setSelectedTags(newTags);

    // 유저 프로필에 취향 업데이트
    if (user && db) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          preferences: newTags
        });
      } catch (err) {
        console.error("Preferences update error:", err);
      }
    }
  };

  const content = data[lang];
  const toggleLang = () => setLang(l => l === 'ko' ? 'en' : 'ko');

  const handleAuthAction = async () => {
    if (user) {
      await signOut(auth);
      alert('Logged out successfully.');
      router.push('/'); // 로그아웃 후 메인 홈으로 이동
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Header / Navigation */}
      <nav className="fixed w-full z-50 bg-[#007db5] text-white flex justify-between items-center px-8 py-4 shadow-md">
        <div className="text-2xl font-black tracking-tighter">자갈치 셰프</div>
        <div className="hidden md:flex gap-8 font-bold text-lg">
          <span className="cursor-pointer hover:opacity-80" onClick={() => alert('현재 준비 중인 메뉴입니다!')}>소개</span>
          <span className="cursor-pointer hover:opacity-80" onClick={() => alert('현재 준비 중인 메뉴입니다!')}>브랜드 전시관</span>
          <span className="cursor-pointer hover:opacity-80" onClick={() => alert('현재 준비 중인 메뉴입니다!')}>프로그램</span>
          <span className="cursor-pointer hover:opacity-80" onClick={() => router.push('/community')}>커뮤니티</span>
        </div>
        <div className="flex gap-4 items-center">
          {/* 어드민 대시보드 바로가기 버튼 */}
          {user && (role === 'merchant' || role === 'admin') && (
            <button 
              onClick={() => router.push('/dashboard/admin')}
              className="bg-yellow-400 text-[#007db5] px-4 py-2 rounded-full font-bold hover:bg-yellow-300 transition-all shadow-sm"
            >
              🛠️ 재고 등록 (어드민)
            </button>
          )}

          <button 
            onClick={toggleLang}
            className="border border-white px-4 py-2 rounded-full font-bold hover:bg-white hover:text-[#007db5] transition-all flex items-center gap-2"
          >
            🌐 {lang === 'ko' ? 'KO' : 'EN'}
          </button>
          
          {/* 로그인한 유저 정보 표시 및 마이페이지 버튼 */}
          {user && (
            <div className="hidden lg:flex items-center gap-2 bg-[#005f8a] px-4 py-2 rounded-full shadow-inner border border-[#004e73]">
              <span className="text-lg">
                {role === 'merchant' ? '🏪' : role === 'chef' ? '👨‍🍳' : '🎒'}
              </span>
              <span className="font-bold text-sm">
                {user.email?.split('@')[0]} 님 
                <span className="text-yellow-300 ml-1">
                  ({role === 'merchant' ? '상인' : role === 'chef' ? '셰프' : '여행객'})
                </span>
              </span>
              <button 
                onClick={() => router.push('/mypage')}
                className="ml-2 bg-white text-[#007db5] px-3 py-1 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors shadow-sm"
              >
                마이페이지
              </button>
            </div>
          )}
          
          {/* Auth Button */}
          {!loading && (
            <button 
              onClick={handleAuthAction}
              className="bg-white text-[#007db5] px-4 py-2 rounded-full font-bold hover:bg-gray-100 transition-all shadow-sm"
            >
              {user ? '로그아웃' : '로그인'}
            </button>
          )}
        </div>
      </nav>

      {/* 2. Hero Banner (브랜딩 전면 쇄신: 샐러드 -> 프리미엄 해산물) */}
      <div 
        className="relative w-full h-[500px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=1920&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
        <div className="relative z-10 text-center text-white animate-fade-in mt-16 px-4">
          <div className="inline-block bg-[#ff5722] text-white px-4 py-1 rounded-full text-sm font-bold mb-4 tracking-widest uppercase">
            {content.subtitle}
          </div>
          <h1 className="text-5xl md:text-7xl font-black drop-shadow-2xl mb-4 leading-tight whitespace-pre-line">
            {content.title}
          </h1>
          <p className="text-xl md:text-2xl font-semibold opacity-90 drop-shadow-md">
            {content.desc}
          </p>
        </div>
      </div>

      {/* 3. Sub Nav / Breadcrumb */}
      <div className="bg-[#0099db] text-white px-8 py-4 flex gap-6 items-center font-bold text-lg shadow-sm">
        <span className="cursor-pointer flex items-center gap-2">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3l9 8h-3v10h-12v-10h-3z"/></svg>
        </span>
        <span className="opacity-50">|</span>
        <span className="cursor-pointer">{content.nav1} ▾</span>
        <span className="opacity-50">|</span>
        <span className="cursor-pointer">{content.nav2} ▾</span>
      </div>

      {/* 4. Tag Filter Section (취향 저격 필터) */}
      <div className="max-w-6xl mx-auto pt-16 px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900">{content.tasteTitle}</h2>
          <p className="text-gray-500 mt-2 font-semibold">{content.tasteDesc}</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {ALL_TAGS.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-5 py-2.5 rounded-full font-bold transition-all duration-300 transform ${isSelected ? 'bg-[#007db5] text-white shadow-lg -translate-y-1' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. 2-Step Customer Journey (진정한 3자 중개) */}
      <div className="max-w-6xl mx-auto py-16 px-6">
        
        {/* Step 1: 소상공인(상인)의 수산물 마켓 */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8 border-b-2 border-gray-800 pb-4">
            <div className="bg-gray-800 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black">1</div>
            <div>
              <h2 className="text-3xl font-black text-gray-900">{content.step1Title}</h2>
              <p className="text-gray-500 font-bold mt-1">{content.step1Desc}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ingredients.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 animate-fade-in group cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image Section */}
                <div className="relative h-60 bg-gray-100 overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg bg-gradient-to-br from-gray-100 to-gray-200">이미지 준비중</div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-[#ff5722] shadow-sm">
                    {item.category === 'General' ? '당일 바리' : item.category}
                  </div>
                </div>

                {/* Text Section */}
                <div className="p-6">
                  <h3 className="text-2xl font-black text-gray-900 mb-2 truncate">{item.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(item.tags || []).map(tag => (
                      <span key={tag} className="bg-blue-50 text-[#007db5] border border-blue-100 px-2.5 py-1 rounded-md text-xs font-bold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-end border-t pt-4 border-gray-100">
                    <div>
                      <span className="block text-xs text-gray-400 font-bold mb-1">{content.merchantPrice}</span>
                      <span className="text-2xl font-black text-gray-900">{content.currentPrice}</span>
                    </div>
                    <button className="bg-gray-900 text-white px-5 py-2 rounded-lg font-bold hover:bg-[#ff5722] transition-colors shadow-md">
                      {content.reserveBtn}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: 셰프 매칭 (Mock UI) */}
        <div className="relative">
          <div className="flex items-center gap-4 mb-8 border-b-2 border-[#007db5] pb-4">
            <div className="bg-[#007db5] text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black">2</div>
            <div>
              <h2 className="text-3xl font-black text-[#007db5]">{content.step2Title}</h2>
              <p className="text-gray-500 font-bold mt-1">{content.step2Desc}</p>
            </div>
          </div>
          
          <div className="bg-white border-2 border-dashed border-[#007db5]/30 rounded-2xl p-10 text-center bg-blue-50/50">
            <div className="text-5xl mb-4">👨‍🍳</div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">{content.step2Warning}</h3>
            <p className="text-gray-600 font-semibold mb-6 whitespace-pre-line">{content.step2WarningDesc}</p>
            <div className="inline-block border border-[#007db5] text-[#007db5] bg-white px-6 py-3 rounded-xl font-bold opacity-70">
              [상인 원물 30,000원] + [셰프 조리비 15,000원] = 통합 결제 시스템 준비중
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
