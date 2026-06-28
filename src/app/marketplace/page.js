"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { db } from '@/lib/db';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import '../globals.css';

const data = {
  ko: {
    title: "자갈치 미식체험",
    subtitle: "Jagalchi Culinary Experience",
    nav1: "프로그램",
    nav2: "미식체험",
    items: [
      { 
        id: 101, 
        name: '자연산 참돔 세트 (할랄 준비)', 
        desc: '부산 자갈치 시장의 가장 신선한 참돔을 정성스럽게 손질하여 제공합니다. 이슬람 율법을 엄격히 준수한 할랄 조리법으로 요리됩니다.',
        price: '₩45,000', 
        chef: '김 셰프', 
        tags: ['할랄', '부드러운 맛'],
        image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=600&auto=format&fit=crop'
      },
      { 
        id: 102, 
        name: '산낙지 탕탕이', 
        desc: '살아있는 낙지를 바로 썰어 참기름과 함께 제공하는 한국의 대표적인 이색 해산물 체험입니다. 도전적인 미식가들에게 강력히 추천합니다.',
        price: '₩25,000', 
        chef: '박 셰프', 
        tags: ['이색체험', '날해산물'],
        image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=600&auto=format&fit=crop'
      },
      { 
        id: 103, 
        name: '프리미엄 전복죽', 
        desc: '완도산 최고급 전복을 통째로 갈아 넣어 깊고 진한 바다의 향을 담아냈습니다. 글루텐 프리 안심 식단입니다.',
        price: '₩20,000', 
        chef: '이 셰프', 
        tags: ['글루텐프리', '건강식'],
        image: 'https://images.unsplash.com/photo-1626071465999-52c78a08a2fc?q=80&w=600&auto=format&fit=crop'
      }
    ],
    reserveBtn: "자세히보기 및 예약"
  },
  en: {
    title: "Jagalchi Culinary Experience",
    subtitle: "Busan's Finest Seafood",
    nav1: "Programs",
    nav2: "Culinary Experience",
    items: [
      { 
        id: 101, 
        name: 'Wild Red Sea Bream Set (Halal)', 
        desc: 'The freshest red sea bream from Jagalchi Market, meticulously prepared following strict Halal culinary practices.',
        price: '$35.00', 
        chef: 'Chef Kim', 
        tags: ['Halal', 'Mild'],
        image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=600&auto=format&fit=crop'
      },
      { 
        id: 102, 
        name: 'Live Octopus Sashimi (San-nakji)', 
        desc: 'A quintessential Korean exotic seafood experience. Freshly chopped live octopus served with sesame oil. Highly recommended for adventurous foodies.',
        price: '$20.00', 
        chef: 'Chef Park', 
        tags: ['Adventurous', 'Raw Seafood'],
        image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=600&auto=format&fit=crop'
      },
      { 
        id: 103, 
        name: 'Premium Abalone Porridge', 
        desc: 'Made with whole top-grade abalone from Wando, capturing the deep essence of the sea. A comforting, gluten-free healthy choice.',
        price: '$15.00', 
        chef: 'Chef Lee', 
        tags: ['Gluten-Free', 'Healthy'],
        image: 'https://images.unsplash.com/photo-1626071465999-52c78a08a2fc?q=80&w=600&auto=format&fit=crop'
      }
    ],
    reserveBtn: "View Details & Reserve"
  }
}

export default function Marketplace() {
  const router = useRouter();
  const [lang, setLang] = useState('ko');
  const { user, role, loading } = useAuth();
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    if (!db) return;
    // 인덱스 에러 방지를 위해 orderBy 제거 후 클라이언트 단에서 JS 정렬
    const unsubscribe = onSnapshot(collection(db, 'ingredients'), (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        // 품절되지 않은 상품만 표시
        if (doc.data().stock !== false) {
          items.push({ id: doc.id, ...doc.data() });
        }
      });
      // createdAt 기준으로 내림차순 정렬 (JS 로컬 정렬)
      items.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setIngredients(items);
    });
    return () => unsubscribe();
  }, []);

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

      {/* 2. Hero Banner */}
      <div 
        className="relative w-full h-[500px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1920&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 text-center text-white animate-fade-in mt-16">
          <h2 className="text-xl md:text-2xl font-bold mb-3 tracking-widest">{content.subtitle}</h2>
          <h1 className="text-5xl md:text-7xl font-black drop-shadow-lg">{content.title}</h1>
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

      {/* 4. Content List (카드형 레이아웃) */}
      <div className="max-w-5xl mx-auto py-16 px-6">
        <div className="flex flex-col gap-10">
          {ingredients.map((item, index) => (
            <div 
              key={item.id} 
              className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image Section */}
              <div className="md:w-5/12 relative min-h-[300px] md:min-h-full bg-gray-100 flex items-center justify-center">
                {/* 실 DB에는 아직 이미지가 없으므로 플레이스홀더 사용 */}
                <span className="text-gray-400 font-bold">이미지 준비중</span>
              </div>

              {/* Text Section */}
              <div className="md:w-7/12 p-8 flex flex-col justify-center">
                <h2 className="text-3xl font-black text-gray-900 mb-3">{item.name}</h2>
                <p className="text-gray-600 text-[1.05rem] mb-6 leading-relaxed min-h-[3rem]">
                  {item.category} 카테고리의 신선한 식재료입니다.
                </p>
                <div className="flex gap-2 mb-6 flex-wrap">
                  {(item.tags || []).map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                      #{tag}
                    </span>
                  ))}
                  <span className="text-[#007db5] font-bold py-1 ml-2">👨‍🍳 상인 직접 등록 상품</span>
                </div>
                
                <div className="mt-auto flex justify-between items-center pt-5 border-t border-gray-100">
                  <span className="text-2xl font-black text-gray-800">현지 시가</span>
                  <button 
                    onClick={() => router.push('/checkout')}
                    className="border border-gray-400 text-gray-800 px-6 py-2.5 rounded font-bold hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    {content.reserveBtn}
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {ingredients.length === 0 && (
            <div className="text-center py-20 text-gray-500 font-bold text-xl">
              등록된 식재료가 없습니다. 상인 대시보드에서 식재료를 등록해 주세요!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
