"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/db';
import { collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

export default function Inquiries() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      alert('1:1 문의는 로그인 후 이용 가능합니다.');
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!db || !user) return;
    
    // 사용자의 문의내역만 불러오기
    const q = query(
      collection(db, 'inquiries'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      setInquiries(items);
    });
    
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        userId: user.uid,
        userName: user.displayName || user.email || '익명 사용자',
        title,
        content,
        status: 'pending', // 초기 상태: pending
        createdAt: serverTimestamp()
      });

      // 관리자에게 푸시 알림 전송 API 호출 (백그라운드로 실행되도록 await 생략 가능하지만 확실한 에러 체킹을 위해 await 적용)
      try {
        await fetch('/api/send-admin-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title, 
            content, 
            nickname: user.displayName || user.email || '익명 사용자' 
          }),
        });
      } catch (notifyError) {
        console.error('푸시 알림 발송 실패:', notifyError);
        // 푸시 알림이 실패하더라도 문의 자체는 등록되었으므로 정상 처리 진행
      }

      setTitle('');
      setContent('');
      alert('문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변해 드리겠습니다.');
    } catch (error) {
      console.error(error);
      alert('문의 접수 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">답변 대기중</span>;
      case 'responded': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">답변 완료</span>;
      case 'closed': return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">종료됨</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto animate-fade-in">
        <button 
          onClick={() => router.push('/community')}
          className="mb-6 text-[#007db5] font-bold hover:underline flex items-center gap-2"
        >
          ← 커뮤니티로 돌아가기
        </button>

        <h1 className="text-4xl font-black text-[#007db5] mb-8">1:1 문의 내역</h1>

        {/* 폼 영역 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-10">
          <h2 className="text-xl font-bold mb-4">새 문의 작성</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="문의 제목을 입력해주세요" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007db5]"
              required
            />
            <textarea 
              placeholder="문의 내용을 상세히 적어주시면 더 빠르고 정확한 답변이 가능합니다."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="5"
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007db5]"
              required
            />
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`py-3 rounded-lg font-bold text-white transition ${isSubmitting ? 'bg-gray-400' : 'bg-[#007db5] hover:bg-[#005f8a]'}`}
            >
              {isSubmitting ? '접수 중...' : '문의 접수하기'}
            </button>
          </form>
        </div>

        {/* 리스트 영역 */}
        <h2 className="text-2xl font-bold mb-4">나의 문의 내역</h2>
        <div className="flex flex-col gap-4">
          {inquiries.map(inq => (
            <div key={inq.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-gray-800">{inq.title}</h3>
                {getStatusBadge(inq.status)}
              </div>
              <p className="text-gray-600 mb-4 whitespace-pre-line">{inq.content}</p>
              
              {inq.reply && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-[#007db5]">
                  <p className="font-bold text-sm text-[#007db5] mb-1">관리자 답변</p>
                  <p className="text-gray-700">{inq.reply}</p>
                </div>
              )}
            </div>
          ))}
          {inquiries.length === 0 && (
            <div className="bg-white p-10 rounded-2xl border border-gray-200 text-center text-gray-500 font-bold">
              등록된 문의 내역이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
