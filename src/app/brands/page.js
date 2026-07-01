"use client";

import { useRouter } from 'next/navigation';
import '../globals.css';

export default function BrandsPage() {
  const router = useRouter();

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

      {/* 2. Premium Placeholder Hero */}
      <div 
        className="relative w-full min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1544979590-37e9b47eb705?q=80&w=1920&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="relative z-10 text-center text-white px-4 animate-fade-in">
          <div className="inline-block bg-[#ff5722] text-white px-6 py-2 rounded-full text-sm font-black mb-6 tracking-[0.3em] uppercase shadow-lg">
            Grand Opening Soon
          </div>
          <h1 className="text-5xl md:text-7xl font-black drop-shadow-2xl mb-6 leading-tight">
            압도적인 스케일의<br/>미식 브랜드관이 곧 열립니다.
          </h1>
          <p className="text-xl md:text-2xl font-medium opacity-90 drop-shadow-md mb-12 max-w-2xl mx-auto leading-relaxed">
            자갈치 시장을 대표하는 최상급 해산물 브랜드들과<br/>최고의 셰프 라인업이 입점을 준비하고 있습니다.<br/>곧 당신의 미식을 한 차원 끌어올릴 전시관이 공개됩니다.
          </p>
          <button 
            onClick={() => router.push('/marketplace')}
            className="bg-[#007db5] text-white px-10 py-4 rounded-full font-black text-xl hover:bg-[#005f8a] transition-all shadow-2xl hover:-translate-y-1"
          >
            먼저 마켓플레이스 둘러보기 👉
          </button>
        </div>
      </div>
    </div>
  );
}
