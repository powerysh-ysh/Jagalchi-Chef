"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export default function Community() {
  const router = useRouter();
  const [notices, setNotices] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (!db) {
      // Mock data for UI presentation when Firebase is not connected locally
      setNotices([
        { id: '1', title: '[필독] 자갈치 셰프 글로벌 서비스 오픈 안내', content: '안녕하세요. 자갈치 셰프가 드디어 글로벌 서비스를 시작합니다.\n\n최고의 미식 체험을 위해 항상 노력하겠습니다.', createdAt: new Date() },
        { id: '2', title: '1:1 문의 서비스 운영 시간 안내', content: '고객센터 운영 시간: 평일 09:00 - 18:00\n빠른 답변을 위해 최선을 다하겠습니다.', createdAt: new Date() }
      ]);
      return;
    }
    
    // 안티그래비티 원칙: 최신 10개만 불러와서 시스템 부하 최소화
    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      setNotices(items);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* 상단 네비게이션 복귀 버튼 */}
        <button 
          onClick={() => router.push('/marketplace')}
          className="mb-6 text-[#007db5] font-bold hover:underline flex items-center gap-2"
        >
          ← 마켓플레이스로 돌아가기
        </button>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-black text-[#007db5]">커뮤니티</h1>
            <p className="text-gray-500 mt-2">새로운 소식과 공지사항을 확인하세요.</p>
          </div>
          <button 
            onClick={() => router.push('/community/inquiries')}
            className="bg-[#ff5722] text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-[#e64a19] transition transform hover:scale-105"
          >
            💬 1:1 문의하기
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 text-sm font-bold text-gray-500">
            주요 공지사항 (최근 10건)
          </div>
          
          {notices.map((notice) => (
            <div key={notice.id} className="border-b border-gray-100 last:border-0">
              <button 
                className="w-full text-left px-6 py-5 focus:outline-none hover:bg-gray-50 flex justify-between items-center transition-colors"
                onClick={() => setOpenId(openId === notice.id ? null : notice.id)}
              >
                <span className={`font-bold text-[1.1rem] ${openId === notice.id ? 'text-[#007db5]' : 'text-gray-800'}`}>
                  {notice.title}
                </span>
                <span className={`transform transition-transform duration-300 ${openId === notice.id ? 'rotate-180 text-[#007db5]' : 'text-gray-400'}`}>
                  ▼
                </span>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openId === notice.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-6 pt-2 text-gray-600 whitespace-pre-line leading-relaxed text-[1rem]">
                  {notice.content}
                </div>
              </div>
            </div>
          ))}
          
          {notices.length === 0 && (
            <div className="p-10 text-center text-gray-400 font-bold text-lg">
              등록된 공지사항이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
