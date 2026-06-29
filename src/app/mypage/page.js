"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/db';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function MyPage() {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  
  const [profile, setProfile] = useState({
    dietary: [],
    allergies: [],
    preferences: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user && db) {
      const loadProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setProfile({
              dietary: data.dietary || [],
              allergies: data.allergies || [],
              preferences: data.preferences || [] 
            });
          }
        } catch (err) {
          console.error("Profile load error:", err);
        }
      };
      loadProfile();
    }
  }, [user, loading, router]);

  const handleToggle = (category, item) => {
    setProfile(prev => {
      const list = prev[category] || [];
      if (list.includes(item)) {
        return { ...prev, [category]: list.filter(i => i !== item) };
      }
      return { ...prev, [category]: [...list, item] };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      const allSelectedTags = [
        ...profile.dietary,
        ...profile.allergies,
        ...profile.preferences
      ];

      const uniqueTags = [...new Set(allSelectedTags)];

      await updateDoc(doc(db, 'users', user.uid), {
        dietary: profile.dietary,
        allergies: profile.allergies,
        preferences: uniqueTags // 단일 진실 공급원
      });
      
      setMessage('✅ 취향이 성공적으로 저장되었습니다! 마켓플레이스에 즉시 반영됩니다.');
      setTimeout(() => {
        router.push('/marketplace');
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage('❌ 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">로딩 중...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20 px-4 pb-10">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b pb-6 mb-6">
          <div className="text-5xl">👤</div>
          <div>
            <h1 className="text-3xl font-black text-[#007db5]">마이페이지</h1>
            <p className="text-gray-500 font-semibold mt-1">
              내 계정 정보 및 미식 취향 수정
            </p>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">계정 정보</h2>
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <div>
              <span className="block text-sm text-gray-400 font-bold">이메일</span>
              <span className="font-semibold text-lg">{user.email}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-400 font-bold">가입 유형</span>
              <span className="font-semibold text-lg">
                {role === 'merchant' ? '상인(Merchant)' : role === 'chef' ? '셰프(Chef)' : '여행객(Tourist)'}
              </span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">🎯 나의 미식 취향</h2>
        
        <div className="space-y-6">
          {/* 식단 제한 */}
          <div>
            <h3 className="text-md font-bold text-gray-600 mb-3 border-l-4 border-[#007db5] pl-2">식단 제한</h3>
            <div className="flex flex-wrap gap-2">
              {['비건(Vegan)', '채식(Vegetarian)', '할랄(Halal)', '글루텐프리', '페스코(Pescatarian)', '해당없음'].map(item => (
                <button 
                  key={item} 
                  className={`px-4 py-2 rounded-full font-bold transition-all text-sm border ${
                    profile.dietary.includes(item) 
                      ? 'bg-[#007db5] text-white border-[#007db5] shadow-md' 
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleToggle('dietary', item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 알레르기 */}
          <div>
            <h3 className="text-md font-bold text-gray-600 mb-3 border-l-4 border-[#ff5722] pl-2">알레르기 (회피 식재료)</h3>
            <div className="flex flex-wrap gap-2">
              {['땅콩', '갑각류', '대두(콩)', '유제품', '생선', '달걀', '해당없음'].map(item => (
                <button 
                  key={item} 
                  className={`px-4 py-2 rounded-full font-bold transition-all text-sm border ${
                    profile.allergies.includes(item) 
                      ? 'bg-[#ff5722] text-white border-[#ff5722] shadow-md' 
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleToggle('allergies', item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 선호하는 스타일 */}
          <div>
            <h3 className="text-md font-bold text-gray-600 mb-3 border-l-4 border-yellow-400 pl-2">선호하는 요리 스타일</h3>
            <div className="flex flex-wrap gap-2">
              {['매콤한 맛', '신선한 회(날것)', '구이', '튀김', '부드러운 맛', '이색 체험(도전!)'].map(item => (
                <button 
                  key={item} 
                  className={`px-4 py-2 rounded-full font-bold transition-all text-sm border ${
                    profile.preferences.includes(item) 
                      ? 'bg-yellow-400 text-[#007db5] border-yellow-400 shadow-md' 
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleToggle('preferences', item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg font-bold text-sm text-center ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-10 flex gap-4">
          <button 
            className="flex-1 border-2 border-gray-300 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => router.push('/marketplace')}
          >
            돌아가기
          </button>
          <button 
            className="flex-1 bg-[#007db5] text-white font-bold py-3 rounded-lg hover:bg-[#005f8a] transition-colors shadow-md disabled:opacity-50"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
        </div>

      </div>
    </div>
  );
}
