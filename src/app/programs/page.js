"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../globals.css';

export default function ProgramsPage() {
  const router = useRouter();
  const [selectedProgram, setSelectedProgram] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* 1. 상단 브랜딩 네비게이션 */}
      <nav className="fixed w-full z-50 bg-[#007db5] text-white flex justify-between items-center px-8 py-4 shadow-md">
        <div className="text-2xl font-black tracking-tighter cursor-pointer" onClick={() => router.push('/')}>자갈치 셰프</div>
        <div className="hidden md:flex gap-8 font-bold text-lg">
          <span className="cursor-pointer hover:opacity-80">소개</span>
          <span className="cursor-pointer hover:opacity-80" onClick={() => router.push('/brands')}>브랜드 전시관</span>
          <span className="cursor-pointer text-yellow-300">프로그램</span>
          <span className="cursor-pointer hover:opacity-80" onClick={() => router.push('/community')}>커뮤니티</span>
        </div>
        <button 
          onClick={() => router.push('/marketplace')}
          className="bg-white text-[#007db5] px-4 py-2 rounded-full font-bold hover:bg-gray-100 transition-all shadow-sm"
        >
          마켓플레이스로 이동
        </button>
      </nav>

      {/* 2. Programs Header */}
      <div className="pt-32 pb-16 px-8 text-center bg-white">
        <h1 className="text-4xl md:text-6xl font-black text-[#007db5] mb-6 tracking-tight">자갈치 익스클루시브 프로그램</h1>
        <p className="text-xl text-gray-500 font-semibold max-w-3xl mx-auto">
          단순한 관광을 넘어선 진짜 자갈치 시장을 체험하세요.<br/>최고의 셰프, 상인들과 함께하는 생생한 로컬 미식 투어가 당신을 기다립니다.
        </p>
      </div>

      {/* 3. Program List */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {[
            {
              title: "심야 수산물 경매 VIP 체험",
              desc: "새벽 3시, 일반인은 접근할 수 없는 자갈치 시장의 심장부에 들어갑니다. 생생한 경매 현장을 관람하고 낙찰된 최고급 해산물을 즉석에서 시식하는 특별한 경험.",
              tags: ["이색체험", "새벽투어", "한정인원"],
              price: "₩80,000 / 인",
              img: "https://images.unsplash.com/photo-1544979590-37e9b47eb705?q=80&w=800&auto=format&fit=crop"
            },
            {
              title: "마스터 셰프와 함께하는 시장 장보기",
              desc: "미슐랭 스타 레스토랑 출신 셰프와 함께 시장을 돌며 최고의 식재료 고르는 법을 배웁니다. 구매한 재료로 프라이빗 쿠킹 클래스까지 이어지는 풀코스.",
              tags: ["쿠킹클래스", "미식가", "전문가동행"],
              price: "₩150,000 / 인",
              img: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800&auto=format&fit=crop"
            },
            {
              title: "프라이빗 선셋 요트 다이닝",
              desc: "부산 바다를 붉게 물들이는 일몰을 바라보며 즐기는 럭셔리 다이닝. 당일 자갈치에서 공수한 해산물을 선상에서 전속 셰프가 바로 요리해 드립니다.",
              tags: ["로맨틱", "요트투어", "고급스러운"],
              price: "₩250,000 / 인",
              img: "https://images.unsplash.com/photo-1568212629737-1d5718df2dc4?q=80&w=800&auto=format&fit=crop"
            },
            {
              title: "로컬 상인 30년 비법 전수: 해산물 해체쇼",
              desc: "자갈치 시장 터줏대감 상인에게 직접 배우는 대형 생선 해체쇼 관람 및 실습. 방어, 돔 등 거대한 생선이 횟감이 되는 마법 같은 순간을 눈앞에서 확인하세요.",
              tags: ["전통체험", "해체쇼", "생생한현장"],
              price: "₩65,000 / 인",
              img: "https://images.unsplash.com/photo-1623356302220-7f28ed57a796?q=80&w=800&auto=format&fit=crop"
            },
            {
              title: "부산 밤바다 포장마차 투어",
              desc: "현지인들만 아는 진짜 숨은 해산물 포장마차 거리를 로컬 가이드와 함께 탐방합니다. 3곳의 포장마차를 돌며 각기 다른 해산물 안주와 페어링된 주류를 즐기세요.",
              tags: ["야간투어", "현지인맛집", "주류페어링"],
              price: "₩55,000 / 인",
              img: "https://images.unsplash.com/photo-1594917849132-026601b63dd1?q=80&w=800&auto=format&fit=crop"
            }
          ].map((program, idx) => (
            <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
              <div className="h-64 overflow-hidden relative">
                <img src={program.img} alt={program.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-black shadow-md">
                  HOT
                </div>
              </div>
              <div className="p-8">
                <div className="flex gap-2 mb-4">
                  {program.tags.map(tag => (
                    <span key={tag} className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold border border-blue-100">#{tag}</span>
                  ))}
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3 leading-snug">{program.title}</h2>
                <p className="text-gray-600 mb-6 min-h-[80px]">{program.desc}</p>
                <div className="flex justify-between items-center border-t border-gray-100 pt-6">
                  <div className="text-2xl font-black text-[#ff5722]">{program.price}</div>
                  <button onClick={() => setSelectedProgram(program)} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-[#007db5] transition-colors">예약하기</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 모달 창 */}
      {selectedProgram && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in relative">
            <button 
              onClick={() => setSelectedProgram(null)}
              className="absolute top-4 right-4 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70 z-10"
            >
              ✕
            </button>
            <div className="h-48 relative">
              <img src={selectedProgram.img} alt={selectedProgram.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-black text-gray-900 mb-2">{selectedProgram.title}</h3>
              <p className="text-gray-600 mb-6">{selectedProgram.desc}</p>
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                <span className="font-bold text-gray-600">총 결제 금액</span>
                <span className="text-2xl font-black text-[#ff5722]">{selectedProgram.price}</span>
              </div>
              <button 
                onClick={() => {
                  alert('예약이 성공적으로 완료되었습니다! 카카오톡으로 안내 메시지가 발송됩니다.');
                  setSelectedProgram(null);
                }}
                className="w-full bg-[#007db5] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#005f8a] transition-colors shadow-lg"
              >
                결제 및 예약 확정하기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
