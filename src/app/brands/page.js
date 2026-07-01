"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../globals.css';

export default function BrandsPage() {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* 1. 상단 브랜딩 네비게이션 */}
      <nav className="fixed w-full z-50 bg-[#007db5] text-white flex justify-between items-center px-8 py-4 shadow-md">
        <div className="text-2xl font-black tracking-tighter cursor-pointer" onClick={() => router.push('/')}>자갈치 셰프</div>
        <div className="hidden md:flex gap-8 font-bold text-lg">
          <span className="cursor-pointer hover:opacity-80">소개</span>
          <span className="cursor-pointer text-yellow-300">브랜드 전시관</span>
          <span className="cursor-pointer hover:opacity-80" onClick={() => router.push('/programs')}>프로그램</span>
          <span className="cursor-pointer hover:opacity-80" onClick={() => router.push('/community')}>커뮤니티</span>
        </div>
        <button 
          onClick={() => router.push('/marketplace')}
          className="bg-white text-[#007db5] px-4 py-2 rounded-full font-bold hover:bg-gray-100 transition-all shadow-sm"
        >
          마켓플레이스로 이동
        </button>
      </nav>

      {/* 2. Hero Section */}
      <div className="pt-32 pb-16 px-8 text-center bg-white">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">자갈치 장인들의 이야기</h1>
        <p className="text-xl text-gray-500 font-semibold max-w-3xl mx-auto">
          바다와 함께 살아온 상인들의 고집과, 식재료에 생명을 불어넣는 셰프들의 철학.<br/>자갈치 셰프를 완성하는 진짜 브랜드 스토리를 만나보세요.
        </p>
      </div>

      {/* 3. Brand Storytelling Cards */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "30년 뚝심, 진도상회",
              subtitle: "매일 새벽 2시, 가장 먼저 불을 밝히는 곳",
              desc: "'좋은 물건이 아니면 팔지 않는다'는 고집. 30년간 자갈치 시장을 지켜온 진도상회 김명숙 할머니의 철학은 자갈치 셰프의 가장 든든한 뿌리입니다.",
              role: "프리미엄 원물 공급",
              img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop"
            },
            {
              title: "오마카세 장인, 류태환 셰프",
              subtitle: "자연이 준 식재료에 최고의 예우를",
              desc: "미슐랭 스타 레스토랑의 헤드 셰프를 거쳐 자갈치에 정착한 류태환 셰프. 그날 가장 신선한 재료만으로 구성되는 그의 코스는 예술에 가깝습니다.",
              role: "마스터 셰프",
              img: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800&auto=format&fit=crop"
            },
            {
              title: "바다의 호흡, 해녀 김해진",
              subtitle: "자연과 공존하는 가장 완벽한 방식",
              desc: "산소통 없이 바다 깊은 곳에서 건져 올린 해녀의 전복. 기계가 흉내 낼 수 없는 신선함과 바다의 숨결이 그대로 식탁에 오릅니다.",
              role: "로컬 해녀 네트워크",
              img: "https://images.unsplash.com/photo-1627918336338-348f5a3406f2?q=80&w=800&auto=format&fit=crop"
            },
            {
              title: "자갈치 청년회",
              subtitle: "전통 시장에 부는 새로운 바람",
              desc: "투명한 가격 정찰제, 꼼꼼한 위생 관리, 글로벌 고객 응대까지. 자갈치 시장의 미래를 이끌어가는 청년 상인들의 열정을 만나보세요.",
              role: "신뢰와 혁신",
              img: "https://images.unsplash.com/photo-1544979590-37e9b47eb705?q=80&w=800&auto=format&fit=crop"
            },
            {
              title: "전통 숙성회 명인, 이진호",
              subtitle: "기다림이 만들어내는 궁극의 감칠맛",
              desc: "갓 잡은 활어의 쫄깃함도 좋지만, 제대로 숙성된 회의 깊은 맛은 흉내 낼 수 없습니다. 20년 경력의 숙성 비법을 자갈치 셰프에서 경험하세요.",
              role: "숙성회 마스터",
              img: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=800&auto=format&fit=crop"
            },
            {
              title: "글로벌 미식 평론가 선정",
              subtitle: "세계가 주목하는 부산의 다이닝 데스티네이션",
              desc: "단순한 시장 투어를 넘어, 최상급 식자재와 세계적인 셰프가 만나는 곳. 수많은 해외 미디어와 평론가들이 자갈치 셰프를 주목하고 있습니다.",
              role: "글로벌 파트너십",
              img: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=800&auto=format&fit=crop"
            }
          ].map((brand, idx) => (
            <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 group flex flex-col">
              <div className="h-64 overflow-hidden relative">
                <img src={brand.img} alt={brand.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                  {brand.role}
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="text-sm font-bold text-[#ff5722] mb-2">{brand.subtitle}</div>
                <h2 className="text-2xl font-black text-gray-900 mb-4 leading-snug">{brand.title}</h2>
                <p className="text-gray-600 leading-relaxed mb-6 flex-1">{brand.desc}</p>
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-400">자갈치 셰프 파트너</span>
                  <button onClick={() => setSelectedBrand(brand)} className="text-[#007db5] font-black hover:text-[#005f8a] transition-colors flex items-center gap-1">
                    읽기 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 모달 창 */}
      {selectedBrand && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-fade-in relative flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setSelectedBrand(null)}
              className="absolute top-4 right-4 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70 z-10"
            >
              ✕
            </button>
            <div className="h-64 relative shrink-0">
              <img src={selectedBrand.img} alt={selectedBrand.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                <h3 className="text-3xl font-black text-white">{selectedBrand.title}</h3>
              </div>
            </div>
            <div className="p-8 overflow-y-auto">
              <div className="text-sm font-bold text-[#ff5722] mb-4">{selectedBrand.subtitle}</div>
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">"{selectedBrand.desc}"</p>
              
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2">셰프/상인의 철학</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  자갈치 시장에서 30년간 자리를 지켜온 장인들의 숨결과, 미슐랭 스타 레스토랑 출신 셰프들의 혁신이 만나 전에 없던 미식 경험을 제공합니다. 
                  우리는 신선한 재료가 가진 본연의 맛을 극대화하며, 고객 여러분께 바다의 생명력을 그대로 전달하는 것을 최우선으로 생각합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
