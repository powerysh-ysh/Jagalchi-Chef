"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { db } from '@/lib/db';
import { collection, onSnapshot, doc, getDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import '../globals.css';

const TAG_MAP = {
  '할랄': 'Halal',
  '부드러운 맛': 'Mild Taste',
  '이색체험': 'Adventurous',
  '날해산물': 'Raw Seafood',
  '글루텐프리': 'Gluten-Free',
  '건강식': 'Healthy',
  '매운맛': 'Spicy',
  '전통체험': 'Traditional',
  '고급스러운': 'Premium',
  '신선한 회(날것)': 'Fresh Sashimi',
  '달콤한 맛': 'Sweet Taste',
  '구이': 'Grilled',
  '조림': 'Braised'
};
const ALL_TAGS = ['할랄', '부드러운 맛', '이색체험', '날해산물', '글루텐프리', '건강식', '매운맛', '전통체험'];

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=600&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=600&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=600&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=600&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=600&auto=format&fit=crop"
];

const data = {
  ko: {
    title: "상인이 고른 바다의 신선함,\n전문 셰프가 완성하는 미식.",
    subtitle: "프리미엄 3자 중개 미식 플랫폼",
    desc: "자갈치 시장의 거친 생명력을 당신의 식탁으로 0.1초 만에 배달합니다.",
    nav1: "프로그램",
    nav2: "미식체험",
    topNavAbout: "소개",
    topNavBrands: "브랜드 전시관",
    topNavCommunity: "커뮤니티",
    roleAdmin: "재고 등록 (어드민)",
    roleMerchant: "상인",
    roleChef: "셰프",
    roleTourist: "여행객",
    myPage: "마이페이지",
    login: "로그인",
    logout: "로그아웃",
    notReady: "현재 준비 중인 메뉴입니다!",
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
    topNavAbout: "About",
    topNavBrands: "Brands",
    topNavCommunity: "Community",
    roleAdmin: "Inventory (Admin)",
    roleMerchant: "Merchant",
    roleChef: "Chef",
    roleTourist: "Tourist",
    myPage: "My Page",
    login: "Login",
    logout: "Logout",
    notReady: "Menu currently under development!",
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
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [userPreferencesLoaded, setUserPreferencesLoaded] = useState(false);
  const chefSectionRef = useRef(null);

  const autoSeedRan = useRef(false);

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

  // 상품 목록 불러오기 및 가중치 매칭(Weight-based Matching) 정렬 + Auto-Seeding
  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, 'ingredients'), async (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        if (doc.data().stock !== false) {
          items.push({ id: doc.id, ...doc.data() });
        }
      });
      
      // [Auto-Seeding 로직] DB가 텅 비어있을 경우에만 초기 데이터 8종 즉시 주입
      if (items.length === 0 && !autoSeedRan.current) {
        autoSeedRan.current = true;
        console.log("DB가 비어있음을 감지했습니다. Auto-Seeding 엔진을 가동합니다.");
        const seedItems = [
          { name: "자연산 참돔 세트 (Wild Red Sea Bream Set)", category: "General", stock: true, tags: ["할랄", "부드러운 맛", "고급스러운"], imageUrl: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=600&auto=format&fit=crop" },
          { name: "산낙지 탕탕이 (Live Octopus Sashimi)", category: "General", stock: true, tags: ["이색체험", "날해산물", "건강식"], imageUrl: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=600&auto=format&fit=crop" },
          { name: "프리미엄 킹크랩 (Premium King Crab)", category: "General", stock: true, tags: ["할랄", "부드러운 맛"], imageUrl: "https://plus.unsplash.com/premium_photo-1669222304899-738917830b56?q=80&w=600&auto=format&fit=crop" },
          { name: "자갈치 특 붕장어 (Jagalchi Sea Eel)", category: "General", stock: true, tags: ["구이", "건강식"], imageUrl: "https://images.unsplash.com/photo-1522814041131-41e739ec1c7f?q=80&w=600&auto=format&fit=crop" },
          { name: "해녀 채취 자연산 전복 (Wild Abalone)", category: "General", stock: true, tags: ["신선한 회(날것)", "건강식", "글루텐프리"], imageUrl: "https://images.unsplash.com/photo-1627918336338-348f5a3406f2?q=80&w=600&auto=format&fit=crop" },
          { name: "완도산 넙치/광어 (Wando Flatfish)", category: "General", stock: true, tags: ["부드러운 맛", "신선한 회(날것)"], imageUrl: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=600&auto=format&fit=crop" },
          { name: "독도 새우 (Dokdo Shrimp)", category: "General", stock: true, tags: ["달콤한 맛", "신선한 회(날것)", "이색체험"], imageUrl: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=600&auto=format&fit=crop" },
          { name: "제주 은갈치 통마리 (Jeju Hairtail)", category: "General", stock: true, tags: ["구이", "매콤한 맛", "조림"], imageUrl: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=600&auto=format&fit=crop" }
        ];
        
        try {
          for (const item of seedItems) {
            await addDoc(collection(db, 'ingredients'), { ...item, createdAt: serverTimestamp() });
          }
          console.log("Auto-Seeding 완료!");
        } catch (e) {
          console.error("Auto-Seeding 실패:", e);
        }
        return; // Auto-seeding 후 onSnapshot이 다시 트리거될 것이므로 여기서 리턴
      }
      
      // 안티그래비티 린 알고리즘: 태그 필터링 및 가중치 정렬
      let filteredItems = items;
      if (selectedTags.length > 0) {
        // 선택된 태그가 하나라도 포함된 상품만 필터링
        filteredItems = items.filter(item => 
          (item.tags || []).some(t => selectedTags.includes(t))
        );
        
        filteredItems.sort((a, b) => {
          const aScore = (a.tags || []).filter(t => selectedTags.includes(t)).length;
          const bScore = (b.tags || []).filter(t => selectedTags.includes(t)).length;
          if (aScore !== bScore) {
            return bScore - aScore; // 점수가 높은 순(내림차순)
          }
          return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
        });
      } else {
        filteredItems.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      }
      
      setIngredients(filteredItems);
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
          <span className="cursor-pointer hover:opacity-80" onClick={() => alert(content.notReady)}>{content.topNavAbout}</span>
          <span className="cursor-pointer hover:opacity-80" onClick={() => router.push('/brands')}>{content.topNavBrands}</span>
          <span className="cursor-pointer hover:opacity-80" onClick={() => router.push('/programs')}>{content.nav1}</span>
          <span className="cursor-pointer hover:opacity-80" onClick={() => router.push('/community')}>{content.topNavCommunity}</span>
        </div>
        <div className="flex gap-4 items-center">
          {/* 어드민 대시보드 바로가기 버튼 */}
          {user && (role === 'merchant' || role === 'admin') && (
            <button 
              onClick={() => router.push('/dashboard/admin')}
              className="bg-yellow-400 text-[#007db5] px-4 py-2 rounded-full font-bold hover:bg-yellow-300 transition-all shadow-sm"
            >
              🛠️ {content.roleAdmin}
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
                {user.email?.split('@')[0]} 
                <span className="text-yellow-300 ml-1">
                  ({role === 'merchant' ? content.roleMerchant : role === 'chef' ? content.roleChef : content.roleTourist})
                </span>
              </span>
              <button 
                onClick={() => router.push('/mypage')}
                className="ml-2 bg-white text-[#007db5] px-3 py-1 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors shadow-sm"
              >
                {content.myPage}
              </button>
            </div>
          )}
          
          {/* Auth Button */}
          {!loading && (
            <button 
              onClick={handleAuthAction}
              className="bg-white text-[#007db5] px-4 py-2 rounded-full font-bold hover:bg-gray-100 transition-all shadow-sm"
            >
              {user ? content.logout : content.login}
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
                className={`px-5 py-2.5 rounded-full font-bold transition-all duration-300 transform flex items-center gap-2 ${isSelected ? 'bg-blue-600 text-white shadow-xl scale-105 border-2 border-blue-400' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}
              >
                {isSelected && <span>✓</span>}
                #{lang === 'en' && TAG_MAP[tag] ? TAG_MAP[tag] : tag}
              </button>
            );
          })}
        </div>
        </div>
      </div>

      {/* [NEW] Gemini 추천: 당신을 위한 오늘의 맞춤식 */}
      {selectedTags.length > 0 && ingredients.length > 0 && (
        <div className="max-w-6xl mx-auto mt-8 px-6 animate-fade-in">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-3xl p-8 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10 text-9xl">✨</div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">✨</span> 
              <span>Gemini 추천: 당신을 위한 오늘의 맞춤식</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {ingredients.slice(0, 3).map((item) => {
                const fallbackImg = FALLBACK_IMAGES[(item.id?.charCodeAt(0) || 0) % FALLBACK_IMAGES.length];
                const displayImg = item.imageUrl || fallbackImg;
                return (
                <div key={`gemini_${item.id}`} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 items-center border border-yellow-200 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img src={displayImg} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-yellow-600 mb-1">매칭률 100%</div>
                    <h3 className="font-bold text-gray-900 leading-snug line-clamp-2">
                      {lang === 'en' && item.name.includes('(') ? item.name.split('(')[1].replace(')', '') : item.name}
                    </h3>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>
      )}

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
          
          
          {ingredients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in bg-gray-50 rounded-3xl border border-gray-100">
              <div className="text-7xl mb-6 opacity-80">🎣</div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">조건에 맞는 해산물이 다 팔렸어요!</h3>
              <p className="text-gray-500 font-medium mb-8">너무 인기가 많아 금세 소진되었네요. 다른 취향 태그를 선택해 보세요.</p>
              <button 
                onClick={() => setSelectedTags([])}
                className="bg-[#007db5] text-white px-8 py-3 rounded-full font-bold hover:bg-[#005f8a] transition-colors shadow-md"
              >
                필터 초기화하기
              </button>
            </div>
          ) : (
            <div key={selectedTags.join(',')} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
              {ingredients.map((item, index) => {
                const fallbackImg = FALLBACK_IMAGES[(item.id?.charCodeAt(0) || index) % FALLBACK_IMAGES.length];
                const displayImg = item.imageUrl || fallbackImg;
                
                return (
                  <div 
                    key={item.id} 
                    onClick={() => {
                      setSelectedIngredient(item);
                      if (chefSectionRef.current) {
                        chefSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer ${selectedIngredient?.id === item.id ? 'border-blue-500 ring-4 ring-blue-200 scale-[1.02]' : 'border-gray-200'}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Image Section */}
                    <div className="relative h-60 bg-gray-100 overflow-hidden">
                      <img src={displayImg} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-[#ff5722] shadow-sm">
                        {item.category === 'General' ? (lang === 'ko' ? '당일 바리' : 'Fresh Catch') : item.category}
                      </div>
                      {selectedIngredient?.id === item.id && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <div className="bg-blue-600 text-white rounded-full p-3 shadow-lg">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Text Section */}
                    <div className="p-6">
                      <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2 leading-snug">
                        {lang === 'en' && item.name.includes('(') ? item.name.split('(')[1].replace(')', '') : item.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(item.tags || []).map(tag => (
                          <span key={tag} className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-md text-xs font-bold">
                            #{lang === 'en' && TAG_MAP[tag] ? TAG_MAP[tag] : tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-end border-t pt-4 border-gray-100">
                        <div>
                          <span className="block text-xs text-gray-400 font-bold mb-1">{content.merchantPrice}</span>
                          <span className="text-2xl font-black text-gray-900">{content.currentPrice}</span>
                        </div>
                        <button className={`${selectedIngredient?.id === item.id ? 'bg-blue-600' : 'bg-gray-900'} text-white px-5 py-2 rounded-lg font-bold hover:bg-[#ff5722] transition-colors shadow-md`}>
                          {selectedIngredient?.id === item.id ? '선택됨' : content.reserveBtn}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2: 셰프 매칭 (요리 방식 선택) */}
        <div className="relative" ref={chefSectionRef}>
          <div className="flex items-center gap-4 mb-8 border-b-2 border-[#007db5] pb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black transition-colors ${selectedIngredient ? 'bg-[#007db5] text-white' : 'bg-gray-200 text-gray-400'}`}>2</div>
            <div>
              <h2 className={`text-3xl font-black transition-colors ${selectedIngredient ? 'text-[#007db5]' : 'text-gray-400'}`}>{content.step2Title}</h2>
              <p className="text-gray-500 font-bold mt-1">{content.step2Desc}</p>
            </div>
          </div>
          
          {!selectedIngredient ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center animate-pulse">
              <div className="text-5xl mb-4 opacity-50">👆</div>
              <h3 className="text-xl font-bold text-gray-500">위에서 원하시는 해산물을 먼저 선택해주세요.</h3>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 animate-fade-in shadow-inner">
              <div className="mb-6 flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <img src={selectedIngredient.imageUrl || FALLBACK_IMAGES[0]} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-sm text-[#007db5] font-bold">선택하신 해산물</div>
                  <div className="text-xl font-black text-gray-900">{selectedIngredient.name.split('(')[0]}</div>
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-gray-800 mb-6">이 재료를 요리할 최고의 셰프들</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: '김명인 셰프', desc: '30년 경력의 횟집 장인', style: '전통 활어회' },
                  { name: '최스타 셰프', desc: '미슐랭 1스타 출신', style: '퓨전 해산물 코스' }
                ].map((chef, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-[#007db5] hover:shadow-md transition-all cursor-pointer flex justify-between items-center group">
                    <div>
                      <div className="text-xs font-bold text-gray-400 mb-1">{chef.style}</div>
                      <div className="text-lg font-black text-gray-900">{chef.name}</div>
                      <div className="text-sm text-gray-600">{chef.desc}</div>
                    </div>
                    <button className="bg-gray-100 text-gray-600 group-hover:bg-[#007db5] group-hover:text-white px-4 py-2 rounded-lg font-bold transition-colors">
                      요리 의뢰
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
