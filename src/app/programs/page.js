"use client";

import { useRouter } from 'next/navigation';
import '../globals.css';

export default function ProgramsPage() {
  const router = useRouter();

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

      {/* 2. Premium Placeholder Hero */}
      <div 
        className="relative w-full min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1920&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-[#007db5]/70 backdrop-blur-sm mix-blend-multiply"></div>
        <div className="relative z-10 text-center text-white px-4 animate-fade-in">
          <div className="inline-block bg-white text-[#007db5] px-6 py-2 rounded-full text-sm font-black mb-6 tracking-[0.3em] uppercase shadow-lg">
            Exclusive Experience
          </div>
          <h1 className="text-5xl md:text-7xl font-black drop-shadow-2xl mb-6 leading-tight">
            당신만을 위한<br/>특별한 미식 프로그램
          </h1>
          <p className="text-xl md:text-2xl font-medium opacity-90 drop-shadow-md mb-12 max-w-2xl mx-auto leading-relaxed">
            프라이빗 요트 다이닝, 마스터 셰프와의 쿠킹 클래스 등<br/>최고의 미식 경험 프로그램들이 론칭을 앞두고 있습니다.<br/>곧 특별한 초청장이 여러분을 찾아갑니다.
          </p>
          <button 
            onClick={() => router.push('/marketplace')}
            className="bg-yellow-400 text-[#007db5] px-10 py-4 rounded-full font-black text-xl hover:bg-yellow-300 transition-all shadow-2xl hover:-translate-y-1"
          >
            먼저 마켓플레이스 둘러보기 👉
          </button>
        </div>
      </div>
    </div>
  );
}
